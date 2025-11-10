/**
 * Journey of Life — Route: Summaries (with Backfill Support)
 * ----------------------------------------------------------
 * Handles:
 * - GET /summaries → get all summaries
 * - POST /summaries/backfill → generate missing summaries from old entries
 */

import express from "express";
import db from "../db/index.js";
import { getAllSummaries, upsertSummary } from "../db/models/summaries.js";
import { getAllEntries } from "../db/models/entries.js";
import fetch from "node-fetch";

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

/** 🧠 POST /summaries/backfill → generate summaries for dates missing one */
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
    const existingDates = new Set(existing.map((s) => s.summary_date.toISOString().split("T")[0]));

    const newSummaries = [];
    for (const [date, texts] of Object.entries(grouped)) {
      if (existingDates.has(date)) continue; // skip already summarized

      const combinedText = texts.join("\n");
      console.log(`✨ Generating summary for ${date}...`);

      // Call OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Journey of Life",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a factual journaling summarizer. Summarize the user's daily reflections based on real facts only. Include: total entries, main feelings, activities, and main focus areas. Keep it short and structured with bullet points.",
            },
            {
              role: "user",
              content: combinedText,
            },
          ],
        }),
      });

      const data = await response.json();
      const summaryText =
        data?.choices?.[0]?.message?.content?.trim() ||
        "⚠️ Failed to generate summary.";

      // Save summary
      const saved = await upsertSummary(date, summaryText);
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
