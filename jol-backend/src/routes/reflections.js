/**
 * Journey of Life — Route: Reflections (with generator)
 * -----------------------------------------------------
 * /api/reflections
 *   GET            → list all reflections
 *   POST           → add a reflection (week, narrative)
 *   PATCH /:id     → update narrative
 *   DELETE /:id    → delete
 *   POST /generate → build weekly narrative from real data (entries, highlights, habits)
 *
 * Language note: input & output are in English only.
 */

import express from "express";
import db from "../db/index.js";
import {
  getAllReflections,
  addReflection,
  updateReflection,
  deleteReflection,
  initReflectionsTable,
} from "../db/models/reflections.js";

const router = express.Router();

// init table
await initReflectionsTable();

/* ----------------------------- helpers ----------------------------- */

function getIsoWeekKey(date = new Date()) {
  // ISO week, Monday-based
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeekBoundaries(date = new Date()) {
  // Start Monday 00:00:00, End Sunday 23:59:59 (local server time)
  const d = new Date(date);
  const day = d.getDay() || 7; // Mon=1..Sun=7
  const start = new Date(d);
  start.setDate(d.getDate() - (day - 1));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function pickMostCommon(arr) {
  const map = {};
  for (const x of arr) map[x] = (map[x] || 0) + 1;
  let best = { key: "neutral", count: 0 };
  for (const [k, v] of Object.entries(map)) if (v > best.count) best = { key: k, count: v };
  return best.key;
}

function topN(list, n) {
  const map = {};
  for (const x of list) map[x] = (map[x] || 0) + 1;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

function composeNarrative({ weekKey, entries, moods, kw, plansPlanned, plansDone, habits }) {
  const entryCount = entries.length;
  const dominantMood = pickMostCommon(moods.length ? moods : ["neutral"]);
  const keywords = topN(kw, 3);
  const plannedCount = plansPlanned.length;
  const doneCount = plansDone.length;

  const topHabits = [...habits]
    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
    .slice(0, 3)
    .map((h) => h.title);

  const lines = [];

  lines.push(
    `During ${weekKey}, they wrote ${entryCount} ${entryCount === 1 ? "entry" : "entries"} and moved through a predominantly ${dominantMood} tone.`
  );

  if (keywords.length) {
    lines.push(
      `Themes that kept returning were ${keywords.join(", ")}.`
    );
  }

  if (plannedCount || doneCount) {
    if (plannedCount && doneCount) {
      lines.push(
        `They planned ${plannedCount} small actions and completed ${doneCount} of them — gentle but real steps.`
      );
    } else if (plannedCount) {
      lines.push(`They set ${plannedCount} intention${plannedCount > 1 ? "s" : ""} for the week.`);
    } else if (doneCount) {
      lines.push(`They completed ${doneCount} planned moment${doneCount > 1 ? "s" : ""}.`);
    }
  }

  if (topHabits.length) {
    lines.push(
      `Habits quietly supporting their days included ${topHabits.join(", ")}.`
    );
  }

  lines.push(
    `Overall, the week felt honest and present — steady progress without hurry.`
  );

  return lines.join(" ");
}

/* ------------------------------ routes ------------------------------ */

// GET all
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllReflections();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new
router.post("/", async (req, res) => {
  try {
    const { week, narrative } = req.body;
    if (!week) return res.status(400).json({ error: "Week is required" });
    const row = await addReflection(week, narrative || "");
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH
router.patch("/:id", async (req, res) => {
  try {
    const { narrative } = req.body;
    const { id } = req.params;
    const updated = await updateReflection(id, narrative || "");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await deleteReflection(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /generate
 * Builds a weekly narrative from real data and stores it.
 * Uses local server time for week boundaries.
 */
router.post("/generate", async (_req, res) => {
  try {
    const weekKey = getIsoWeekKey(new Date());
    const { start, end } = getWeekBoundaries(new Date());

    // entries within week
    const entriesQ = await db.query(
      `SELECT id, text, analysis, created_at
       FROM entries
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at ASC`,
      [start, end]
    );
    const entries = entriesQ.rows;

    // extract moods & keywords from entry.analysis
    const moods = [];
    const kw = [];
    for (const e of entries) {
      const a = e.analysis || {};
      if (a.mood) moods.push(a.mood);
      if (Array.isArray(a.keywords)) kw.push(...a.keywords);
    }

    // highlights (planned/done) in this week — based on planned_date or creation date
    const hlQ = await db.query(
      `SELECT id, text, status, planned_date, source_entry_id, date
       FROM highlights
       WHERE (planned_date BETWEEN $1 AND $2)
          OR (planned_date IS NULL AND date BETWEEN $1 AND $2)
       ORDER BY COALESCE(planned_date, date) ASC`,
      [start, end]
    );
    const highlights = hlQ.rows;
    const plansPlanned = highlights.filter((h) => h.status !== "done");
    const plansDone = highlights.filter((h) => h.status === "done");

    // habits — we’ll just read all and mention top streaks
    const habitsQ = await db.query(
      `SELECT id, title, streak, last_checked, created_at
       FROM habits
       ORDER BY created_at ASC`
    );
    const habits = habitsQ.rows;

    // compose story
    const narrative = composeNarrative({
      weekKey,
      entries,
      moods,
      kw,
      plansPlanned,
      plansDone,
      habits,
    });

    // save reflection (upsert-like: if same week exists, overwrite)
    const existing = await db.query(
      `SELECT id FROM reflections WHERE week = $1 LIMIT 1`,
      [weekKey]
    );

    let saved;
    if (existing.rows.length) {
      saved = await db.query(
        `UPDATE reflections SET narrative=$1 WHERE id=$2 RETURNING *`,
        [narrative, existing.rows[0].id]
      );
      saved = saved.rows[0];
    } else {
      saved = await addReflection(weekKey, narrative);
    }

    res.json({ week: weekKey, narrative: saved.narrative, id: saved.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
