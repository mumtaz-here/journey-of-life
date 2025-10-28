import express from "express";
import pool from "../db/index.js";
import storyModel from "../db/models/story.js";

const router = express.Router();

function getIsoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  const start = new Date(d);
  start.setDate(d.getDate() - (day - 1));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

router.get("/", async (_req, res) => {
  try {
    const rows = await storyModel.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate", async (_req, res) => {
  try {
    const weekKey = getIsoWeekKey();
    const { start, end } = getWeekRange();

    const entriesQ = await pool.query(
      `SELECT id, text, analysis, created_at
       FROM entries
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at ASC`,
      [start, end]
    );
    const entries = entriesQ.rows;

    const moods = [];
    const keywords = [];
    for (const e of entries) {
      const a = e.analysis || {};
      if (a.mood) moods.push(a.mood);
      if (Array.isArray(a.keywords)) keywords.push(...a.keywords);
    }

    const narrative = `This week, they wrote ${entries.length} ${
      entries.length === 1 ? "entry" : "entries"
    } and often felt ${moods[0] || "neutral"}.${
      keywords.length
        ? " Topics that appeared: " + [...new Set(keywords)].join(", ") + "."
        : ""
    }`;

    const saved = await storyModel.save(weekKey, narrative);

    res.json({ week: saved.week, narrative: saved.narrative, id: saved.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storyModel.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
