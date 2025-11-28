/**
 * Journey of Life — Route: Highlights (FREE MODEL Context AI)
 */

import express from "express";
import {
  getAllHighlights,
  addHighlight,
  toggleHighlight,
  deleteHighlight,
} from "../db/models/highlights.js";

import { getEntriesByDate } from "../db/models/entries.js";

import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import adminAuth from "../middleware/admin-auth.js";

const router = express.Router();
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

const FREE_MODEL = "openai/gpt-oss-20b:free";

router.get("/", async (_req, res) => {
  try {
    res.json(await getAllHighlights());
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.post("/", adminAuth, async (req, res) => {
  try {
    const { text, planned_date = null, auto = false } = req.body || {};

    // Manual create
    if (!auto) {
      if (!text?.trim())
        return res.status(400).json({ error: "text required" });
      return res.json(await addHighlight(text.trim(), planned_date));
    }

    // Auto mode (admin only, e.g. cron)
    const today = new Date();
    const dayKey = today.toISOString().split("T")[0];
    const todaysEntries = await getEntriesByDate(dayKey);
    const todaysTexts = todaysEntries.map((e) => e.text);

    if (!todaysTexts.length)
      return res.json({ message: "no_entries_for_today" });

    const { text: aiText } = await generateText({
      model: openrouter(FREE_MODEL),
      system: "Extract factual plans.",
      prompt: todaysTexts.join("\n"),
    });

    // NOTE: di sini kamu bisa parse `aiText` → `addHighlight` kalau mau
    return res.json({ message: "auto_done", extracted: aiText });
  } catch (err) {
    console.error("POST /highlights error:", err);
    res.status(500).json({ error: "failed" });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    res.json(await toggleHighlight(req.params.id));
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteHighlight(req.params.id);
    res.json({ message: "deleted" });
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

export default router;
