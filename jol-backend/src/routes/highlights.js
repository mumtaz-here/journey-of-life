/**
 * Journey of Life — Route: Highlights (FREE MODEL Context AI)
 */

import express from "express";
import {
  getAllHighlights,
  addHighlight,
  toggleHighlight,
  deleteHighlight
} from "../db/models/highlights.js";

import { getAllEntries } from "../db/models/entries.js";

import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import adminAuth from "../middleware/admin-auth.js";

const router = express.Router();
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life"
  }
});

const FREE_MODEL = "openai/gpt-oss-20b:free";

router.get("/", async (_req, res) => {
  try {
    res.json(await getAllHighlights());
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, planned_date = null, auto = false } = req.body || {};

    if (!auto) {
      if (!text?.trim()) return res.status(400).json({ error: "text required" });
      return res.json(await addHighlight(text.trim(), planned_date));
    }

    if (auto && !req.headers["x-admin-key"])
      return res.status(403).json({ error: "admin required" });

    if (req.body.auto === true) {
      const entries = await getAllEntries();
      const today = new Date().toISOString().split("T")[0];
      const todaysTexts = entries.filter(e => e.created_at.toISOString().startsWith(today)).map(e => e.text);

      if (!todaysTexts.length) return res.json({ message: "no_entries_for_today" });

      const { text: aiText } = await generateText({
        model: openrouter(FREE_MODEL),
        system: "Extract factual plans.",
        prompt: todaysTexts.join("\n")
      });

      return res.json({ message: "auto_done", extracted: aiText });
    }

  } catch {
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
