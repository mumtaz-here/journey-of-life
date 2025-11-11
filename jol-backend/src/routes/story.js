/**
 * Journey of Life — Route: Story (AI SDK 3rd-person narrative + Backfill ✅)
 * ----------------------------------------------------------------
 * - GET /story → fetch all stories
 * - POST /story/generate → generate this week
 * - POST /story/backfill → generate stories for past weeks
 */

import express from "express";
import pool from "../db/index.js";
import storyModel from "../db/models/story.js";
import { openrouter } from "@ai-sdk/openrouter";
import { generateText } from "ai";

const router = express.Router();

/* 📅 Helper: ISO week key */
function getIsoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/* 📆 Get start & end of the current week */
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

/* ✅ GET all stories */
router.get("/", async (_req, res) => {
  try {
    const rows = await storyModel.getAll();
    res.json(rows);
  } catch (err) {
    console.error("GET /story error:", err);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

/* 🧠 POST /story/generate → AI writes a 3rd-person story for this week */
router.post("/generate", async (_req, res) => {
  try {
    const weekKey = getIsoWeekKey();
    const { start, end } = getWeekRange();

    // 📜 Gather entries from this week
    const entriesQ = await pool.query(
      `SELECT id, text, analysis, created_at
       FROM entries
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at ASC`,
      [start, end]
    );
    const entries = entriesQ.rows;

    if (!entries.length) {
      return res.status(400).json({ error: "No entries found for this week." });
    }

    // 🧩 Prepare text for AI
    const total = entries.length;
    const texts = entries.map((e) => e.text).join("\n");

    // 💬 Generate narrative
    const { text: narrative } = await generateText({
      model: openrouter("gpt-3.5-turbo"),
      prompt: `
You are an empathetic storyteller.
Write a warm, simple, and honest weekly reflection about the user
in third-person perspective (use "they" or "the person").

Tone: calm, grounded, and narrative — not motivational.
Focus only on facts and emotions shown in their journal entries.

Include:
- what kind of week it was overall
- small highlights or struggles
- recurring moods or thoughts
- a gentle closing line that feels grounded and complete

Entries this week (${total} total):
${texts}
      `,
    });

    const saved = await storyModel.save(weekKey, narrative.trim());

    res.json({
      id: saved.id,
      week: saved.week,
      narrative: saved.narrative,
    });
  } catch (err) {
    console.error("POST /story/generate error:", err);
    res.status(500).json({ error: "Failed to generate weekly story" });
  }
});

/* 🧩 POST /story/backfill → generate stories for past weeks */
router.post("/backfill", async (_req, res) => {
  try {
    console.log("🧩 Story backfill started...");
    const entriesQ = await pool.query(
      `SELECT id, text, analysis, created_at FROM entries ORDER BY created_at ASC`
    );
    const entries = entriesQ.rows;

    // Kelompokkan per minggu
    const grouped = entries.reduce((acc, e) => {
      const weekKey = getIsoWeekKey(new Date(e.created_at));
      acc[weekKey] = acc[weekKey] || [];
      acc[weekKey].push(e.text);
      return acc;
    }, {});

    // Ambil story yang sudah ada
    const existing = await storyModel.getAll();
    const existingWeeks = new Set(existing.map((s) => s.week));

    const newStories = [];
    for (const [weekKey, texts] of Object.entries(grouped)) {
      if (existingWeeks.has(weekKey)) continue; // skip yang udah ada

      const { text: narrative } = await generateText({
        model: openrouter("gpt-3.5-turbo"),
        prompt: `
You are a calm storyteller.
Write a short third-person weekly summary based on these entries.
Tone: gentle, honest, factual, and a bit reflective.

Entries:
${texts.join("\n")}
        `,
      });

      const saved = await storyModel.save(weekKey, narrative.trim());
      newStories.push(saved);
    }

    console.log(`✅ Backfill complete: ${newStories.length} stories added.`);
    res.json({
      message: `✅ Backfill complete (${newStories.length} added).`,
      added: newStories,
    });
  } catch (err) {
    console.error("POST /story/backfill error:", err);
    res.status(500).json({ error: "Failed to backfill stories" });
  }
});

/* 🗑️ DELETE story */
router.delete("/:id", async (req, res) => {
  try {
    await storyModel.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /story error:", err);
    res.status(500).json({ error: "Failed to delete story" });
  }
});

export default router;
