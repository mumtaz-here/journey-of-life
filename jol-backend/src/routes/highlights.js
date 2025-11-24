/**
 * Journey of Life — Route: Highlights (FREE MODEL Context AI)
 * -----------------------------------------------------------
 * - Extracts meaningful plans / decisions
 * - Handles postpone / cancel logic
 * - Auto group per-day
 */

import express from "express";
import {
  getAllHighlights,
  getHighlightsByDay,
  addHighlight,
  toggleHighlight,
  deleteHighlight,
  initHighlightsTable,
} from "../db/models/highlights.js";
import { getAllEntries } from "../db/models/entries.js";

// 🌿 AI Provider (FREE)
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

/* ============================================================
   🧠 AI Provider — FREE MODEL
   ============================================================ */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

const FREE_MODEL = "openai/gpt-oss-20b:free";

/* ============================================================
   Helpers
   ============================================================ */
function getDateKey(date = new Date()) {
  return new Date(date).toISOString().split("T")[0];
}

function shiftDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
}

function detectFutureDate(base, text) {
  const t = (text || "").toLowerCase();
  if (/\b(tomorrow|besok)\b/.test(t)) return shiftDate(base, 1);
  if (/\b(day after tomorrow|lusa)\b/.test(t)) return shiftDate(base, 2);
  if (/\b(next week|minggu depan)\b/.test(t)) return shiftDate(base, 7);
  if (/\b(next month|bulan depan)\b/.test(t)) return shiftDate(base, 30);
  if (/\b(in (\d+)\s+(day|days|hari))\b/.test(t)) {
    const num = parseInt(t.match(/\d+/)[0]);
    return shiftDate(base, num);
  }
  return base;
}

// Clean noise (skip mood-only)
function isNoise(line) {
  const t = (line || "").toLowerCase();
  if (t.length < 8) return true;
  if (/^\s*(feeling|mood|vibes)\b/.test(t)) return true;
  if (/^\s*(baik|sedih|sepi|tenang|capek|malas)\b/.test(t)) return true;
  if (/^(felt|feel|i feel)/.test(t) && !/\b(karena|because)\b/.test(t)) return true;
  return false;
}

// Detect plan status changes
function parsePlanChange(line) {
  const t = line.toLowerCase();
  return {
    isCancel: /\b(cancel|batal|ga jadi|tidak jadi)\b/.test(t),
    isReschedule: /\b(postpone|reschedule|undur|tunda|pindah)\b/.test(t),
    reason: line.match(/\b(karena|because)\b(.+)/i)?.[2]?.trim(),
  };
}

/* ============================================================
   🧠 AI PROMPT
   ============================================================ */
const SYSTEM_PROMPT = `
You are an assistant that extracts only clear, factual plans or changes.
Rules:
- Ignore emotions like "capek", "happy", "sedih".
- Output only meaningful plan actions or decisions changing the plan.
- Use a short natural sentence (not bullet).
- NO emojis, NO advice, NO tone words.
- Language must be simple Indonesian.
`;

/* ============================================================
   Process 1 Day & Store Highlights
   ============================================================ */
async function processDay(dateKey, texts) {
  const joined = texts.join("\n").trim();
  if (!joined || joined.length < 10) return { count: 0 };

  const { text: aiText } = await generateText({
    model: openrouter(FREE_MODEL),
    system: SYSTEM_PROMPT,
    prompt: joined,
  });

  let lines = aiText
    .split("\n")
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter((l) => l.length > 0 && !isNoise(l));

  // Limit 5/day
  lines = lines.slice(0, 5);

  let inserted = 0;

  for (const raw of lines) {
    const line = raw.trim();
    const { isCancel, isReschedule, reason } = parsePlanChange(line);

    // Cancel
    if (isCancel) {
      const txt = reason ? `Rencana dibatalkan: ${reason}` : `Rencana dibatalkan.`;
      await addHighlight(txt, dateKey);
      inserted++;
      continue;
    }

    // Reschedule
    if (isReschedule) {
      await addHighlight(`Rencana dipindahkan${reason ? `: ${reason}` : ""}`, dateKey);
      const newDate = detectFutureDate(dateKey, line);
      await addHighlight("Rencana baru.", newDate);
      inserted += 2;
      continue;
    }

    // Normal plan
    const planned = detectFutureDate(dateKey, line);
    await addHighlight(line, planned);
    inserted++;
  }

  return { count: inserted };
}

/* ============================================================
   ROUTES
   ============================================================ */
router.get("/", async (_req, res) => {
  try {
    res.json(await getAllHighlights());
  } catch {
    res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, planned_date = null, auto = false } = req.body || {};

    // Manual
    if (!auto) {
      if (!text?.trim()) return res.status(400).json({ error: "text required" });
      return res.json(await addHighlight(text.trim(), planned_date));
    }

    // Auto: today
    const today = getDateKey();
    const entries = await getAllEntries();
    const todaysTexts = entries.filter(e => getDateKey(e.created_at) === today).map(e => e.text);

    if (!todaysTexts.length) return res.json({ message: "no_entries_for_today" });

    const { count } = await processDay(today, todaysTexts);
    res.json({ message: "auto_highlights_done", date: today, count });
  } catch {
    res.status(500).json({ error: "Failed to generate/add highlights" });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    res.json(await toggleHighlight(req.params.id));
  } catch {
    res.status(500).json({ error: "Failed to toggle highlight" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteHighlight(req.params.id);
    res.json({ message: "deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete highlight" });
  }
});

export { initHighlightsTable };
export default router;
