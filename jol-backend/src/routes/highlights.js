/**
 * Journey of Life — Route: Highlights (SMART AI FINAL)
 * ----------------------------------------------------
 * Auto-generates meaningful highlights only.
 * Detects future plans (tomorrow, next week, next year, etc.)
 * Updates when plans change, filters out mood-only lines.
 */

import express from "express";
import {
  getAllHighlights,
  addHighlight,
  toggleHighlight,
  deleteHighlight,
  initHighlightsTable,
} from "../db/models/highlights.js";
import { getAllEntries } from "../db/models/entries.js";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

// 🧠 AI setup
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

// Helper: convert relative time to actual date
function resolveDate(ref, phrase) {
  const base = new Date(ref);
  phrase = phrase.toLowerCase();

  if (phrase.includes("tomorrow") || phrase.includes("besok")) {
    base.setDate(base.getDate() + 1);
  } else if (phrase.includes("next week") || phrase.includes("minggu depan")) {
    base.setDate(base.getDate() + 7);
  } else if (phrase.includes("next month") || phrase.includes("bulan depan")) {
    base.setMonth(base.getMonth() + 1);
  } else if (phrase.includes("next year") || phrase.includes("tahun depan")) {
    base.setFullYear(base.getFullYear() + 1);
  } else {
    // detect number + unit
    const match = phrase.match(/(\d+)\s*(day|week|month|year|hari|minggu|bulan|tahun)/i);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.includes("day") || unit.includes("hari")) base.setDate(base.getDate() + num);
      else if (unit.includes("week") || unit.includes("minggu")) base.setDate(base.getDate() + num * 7);
      else if (unit.includes("month") || unit.includes("bulan")) base.setMonth(base.getMonth() + num);
      else if (unit.includes("year") || unit.includes("tahun")) base.setFullYear(base.getFullYear() + num);
    }
  }
  return base.toISOString().split("T")[0];
}

/* ===============================
   GET all highlights
=============================== */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllHighlights();
    res.json(rows);
  } catch (err) {
    console.error("GET /highlights error:", err);
    res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

/* ===============================
   POST /auto — generate via AI
=============================== */
router.post("/", async (req, res) => {
  try {
    const { text, planned_date = null, source_entry_id = null, auto = false } = req.body;

    // 🪶 Manual mode
    if (!auto) {
      if (!text?.trim()) return res.status(400).json({ error: "text required" });
      const row = await addHighlight(text.trim(), planned_date, source_entry_id);
      return res.json(row);
    }

    // 🤖 Auto mode
    const entries = await getAllEntries();
    if (!entries.length) return res.status(400).json({ error: "No entries found" });

    // collect texts grouped by date
    const grouped = {};
    for (const e of entries) {
      const key = new Date(e.created_at).toISOString().split("T")[0];
      grouped[key] = grouped[key] || [];
      grouped[key].push(e.text);
    }

    const allHighlights = [];

    for (const [date, texts] of Object.entries(grouped)) {
      const joined = texts.join("\n").trim();
      if (joined.length < 10) continue;

      const { text: aiResponse } = await generateText({
        model: openrouter("gpt-3.5-turbo"),
        system: `
You are a reflective journaling AI assistant.
Extract only concrete plans, future intentions, or meaningful action points.
Ignore emotions or moods like "feeling good" or "feeling calm".
If user changes or cancels a plan, note it clearly (e.g. "Plan X postponed" or "Plan X cancelled").
Each highlight must be short, factual, human-like.
Output 1-3 bullet lines max.
      `,
        prompt: joined,
      });

      const lines = aiResponse
        .split("\n")
        .map((l) => l.replace(/^[-•\s]+/, "").trim())
        .filter((l) => l.length > 0 && !/^feeling/i.test(l));

      for (const line of lines) {
        // detect time phrase
        const planDate = resolveDate(date, line);
        const added = await addHighlight(line, planDate);
        allHighlights.push(added);
      }
    }

    res.json({ message: "AI highlights generated", count: allHighlights.length });
  } catch (err) {
    console.error("POST /highlights error:", err);
    res.status(500).json({ error: "AI highlight generation failed" });
  }
});

/* ===============================
   PATCH /toggle
=============================== */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const updated = await toggleHighlight(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("PATCH /highlights/:id/toggle error:", err);
    res.status(500).json({ error: "Failed to toggle highlight" });
  }
});

/* ===============================
   DELETE
=============================== */
router.delete("/:id", async (req, res) => {
  try {
    await deleteHighlight(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /highlights/:id error:", err);
    res.status(500).json({ error: "Failed to delete highlight" });
  }
});

export { initHighlightsTable };
export default router;
