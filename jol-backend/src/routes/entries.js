/**
 * Journey of Life — Route: Entries (FINAL AUTO SUMMARY ✅)
 * --------------------------------------------------------
 * When a user writes:
 * 1️⃣ Saves the entry
 * 2️⃣ Collects all entries from today
 * 3️⃣ Sends them to OpenRouter AI (factual summary)
 * 4️⃣ Saves/updates daily summary in 'summaries' table
 */

import express from "express";
import { getAllEntries, addEntry } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import { extractPlans } from "../utils/intent-parser.js";
import fetch from "node-fetch";

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

    // 3️⃣ Generate factual summary via OpenRouter AI
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a factual daily summarizer. Only return real, objective bullet points. Include total messages count, detected moods, main activities, and general productivity level. Keep it short and factual.",
          },
          {
            role: "user",
            content: todaysTexts,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("❌ AI request failed:", await aiResponse.text());
      throw new Error("AI response not OK");
    }

    const aiData = await aiResponse.json();
    const summaryText =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "⚠️ Could not generate summary.";

    // 4️⃣ Save or update today's summary
    await upsertSummary(today, summaryText);

    // Extract user "plans" (if any)
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
