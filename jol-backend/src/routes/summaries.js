/**
 * Journey of Life — Route: Summaries (AI SDK Backfill ✅)
 * -------------------------------------------------------
 * Handles:
 * - GET /summaries → get all summaries
 * - POST /summaries/backfill → generate missing summaries from old entries
 * Uses OpenRouter AI SDK instead of manual fetch.
 */

import express from "express";
import db from "../db/index.js";
import { getAllSummaries, upsertSummary } from "../db/models/summaries.js";
import { getAllEntries } from "../db/models/entries.js";
import { openrouter } from "@ai-sdk/openrouter";
import { generateText } from "ai";

const router = express.Router();

/** ✅ GET all summaries */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllSummaries();
    res.json(rows);
  } catch (err) {
    console.error("GET /summaries error:", err);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
});

/** 🧠 POST /summaries/backfill → generate summaries for missing dates */
router.post("/backfill", async (_req, res) => {
  try {
    console.log("🧩 Backfill summaries started...");
    const entries = await getAllEntries();

    // Group entries by date
    const grouped = entries.reduce((acc, e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      acc[date] = acc[date] || [];
      acc[date].push(e.text);
      return acc;
    }, {});

    // Get existing summaries
    const existing = await getAllSummaries();
    const existingDates = new Set(
      existing.map((s) => s.summary_date.toISOString().split("T")[0])
    );

    const newSummaries = [];

    for (const [date, texts] of Object.entries(grouped)) {
      if (existingDates.has(date)) continue; // skip already summarized

      const combinedText = texts.join("\n");
      console.log(`✨ Generating summary for ${date}...`);

      // 🧠 Use AI SDK instead of fetch
      const { text: summaryText } = await generateText({
        model: openrouter("gpt-3.5-turbo"),
        prompt: `
You are a factual journaling summarizer.
Summarize the user's daily reflections strictly based on facts from the text.
Include:
- Total number of entries
- Main moods/feelings detected
- Key activities or focus areas
- General tone (productive, restful, social, etc.)

Be objective, structured, and concise (use bullet points).

Entries:
${combinedText}
        `,
      });

      // Save summary to DB
      const saved = await upsertSummary(date, summaryText.trim());
      newSummaries.push(saved);
    }

    console.log(`✅ Backfill complete. Added ${newSummaries.length} summaries.`);
    res.json({
      message: `✅ Backfill complete. Added ${newSummaries.length} summaries.`,
      added: newSummaries,
    });
  } catch (err) {
    console.error("POST /summaries/backfill error:", err);
    res.status(500).json({ error: "Failed to backfill summaries" });
  }
});

export default router;
