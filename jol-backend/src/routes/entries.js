/**
 * Journey of Life — Route: Entries (+ AI Daily Analysis)
 */

import express from "express";
import {
  getAllEntries,
  addEntry,
  getEntriesByDate,
  getEntriesSince,
} from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import { parseAnalysis } from "../services/ai-parser.js";
import { upsertAnalysis } from "../db/models/analysis.js";
import storyModel from "../db/models/story.js";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

/* ============================================================
   Generate factual daily story + factual daily summary
============================================================ */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});
const FREE_MODEL = "openai/gpt-oss-20b:free";

/* 🔎 Local date util */
function getDayKey(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* ============================================================
📌 POST New Entry
- Save entry
- Auto-update summary
- Auto-update story
- Auto-parse analysis (mood/energy/focus/highlights)
============================================================ */
router.post("/", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    // Save entry
    const entry = await addEntry(text.trim());
    const dayKey = getDayKey(entry.created_at);

    // Fetch all entries of the same day
    const entries = await getEntriesByDate(dayKey);

    /* === AI Summary (factual short bullet points) === */
    const { text: summaryText } = await generateText({
      model: openrouter(FREE_MODEL),
      system: `Summarize factually using short bullet points. Do not add interpretations.`,
      prompt: entries.map((e) => e.text).join("\n"),
    });
    const summary = await upsertSummary(dayKey, summaryText.trim());

    /* === AI Story (simple factual narrative) === */
    const { text: storyText } = await generateText({
      model: openrouter(FREE_MODEL),
      system: `Write a very short factual narrative. Do not add new details.`,
      prompt: entries.map((e) => e.text).join("\n"),
    });
    const story = await storyModel.save(dayKey, storyText.trim());

    /* === AI Analysis (mood/energy/focus/highlights) === */
    const analysisData = await parseAnalysis(entries);
    const analysis = await upsertAnalysis(dayKey, analysisData);

    return res.json({
      ...entry,
      auto_summary: summary,
      auto_story: story,
      auto_analysis: analysis,
    });
  } catch (err) {
    console.error("POST /entries error:", err);
    return res.status(500).json({ error: "failed to save or process entry" });
  }
});

/* 📌 GET Entries (optional ?days=N to limit history) */
router.get("/", async (req, res) => {
  try {
    const daysParam = req.query.days ? Number(req.query.days) : null;

    if (daysParam && daysParam > 0) {
      const rows = await getEntriesSince(daysParam);
      return res.json(rows);
    }

    // Fallback lama: semua entries (dipakai internal / debugging)
    res.json(await getAllEntries());
  } catch (err) {
    console.error("GET /entries error:", err);
    res.status(500).json({ error: "failed to fetch entries" });
  }
});

export default router;
