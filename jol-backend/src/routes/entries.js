/**
 * Journey of Life — Route: Entries (FINAL AI SDK ✅)
 * --------------------------------------------------------
 * When a user writes:
 * 1️⃣ Saves the entry
 * 2️⃣ Collects all entries from today
 * 3️⃣ Sends them to OpenRouter AI SDK (factual summary)
 * 4️⃣ Saves/updates daily summary in 'summaries' table
 */

import express from "express";
import { getAllEntries, addEntry } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import { extractPlans } from "../utils/intent-parser.js";

// 🌿 AI SDK imports
import { openrouter } from "@ai-sdk/openrouter";
import { generateText } from "ai";

const router = express.Router();

/* Helper: get date key (YYYY-MM-DD) */
function getDateKey(date = new Date()) {
  return new Date(date).toISOString().split("T")[0];
}

/* GET all entries */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllEntries();
    res.json(rows);
  } catch (err) {
    console.error("GET /entries error:", err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

/* POST new entry → auto summary + highlights */
router.post("/", async (req, res) => {
  try {
    const { text, analysis = null } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    // 1️⃣ Save entry
    const entry = await addEntry(text, analysis);
    const today = getDateKey(entry.created_at);

    // 2️⃣ Collect all entries from today
    const allEntries = await getAllEntries();
    const todaysTexts = allEntries
      .filter((e) => getDateKey(e.created_at) === today)
      .map((e) => e.text)
      .join("\n");

    // 3️⃣ Generate factual summary via AI SDK
    const { text: summaryText } = await generateText({
      model: openrouter("gpt-3.5-turbo"),
      prompt: `
You are a factual journaling summarizer.
Summarize the user's daily reflections based on *real facts only*.
Include: total messages, overall mood (if mentioned),
main activities, and key focus areas.
Output short bullet points only.

${todaysTexts}
      `,
    });

    // 4️⃣ Save or update today's summary
    await upsertSummary(today, summaryText);

    // Extract any detected "plans"
    const plans = extractPlans(text);

    res.json({
      ...entry,
      auto_highlights: plans,
      auto_summary: summaryText,
    });
  } catch (err) {
    console.error("POST /entries error:", err);
    res.status(500).json({ error: "Failed to create entry or summary" });
  }
});

export default router;