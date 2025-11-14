/**
 * Journey of Life — Route: Highlights (CONTEXT-AWARE v7, STYLE B)
 * ---------------------------------------------------------------
 * Style B: Human & Soft Continuity
 * - Extracts only meaningful plans / changes from entries
 * - When a plan is postponed/cancelled:
 *    • adds a change-note highlight on that day
 *    • also adds a new future plan (for reschedule)
 * - Uses planned_date so future plans land on the right day
 * - Skips mood-only and meta lines
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
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

// 🧠 AI provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

// 🧭 Helpers
function getDateKey(date = new Date()) {
  return new Date(date).toISOString().split("T")[0];
}

function shiftDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
}

// detect future date from text (English + sedikit Indo)
function detectFutureDate(base, text) {
  const t = text.toLowerCase();

  if (/\b(tomorrow|besok)\b/.test(t)) return shiftDate(base, 1);
  if (/\b(day after tomorrow|lusa)\b/.test(t)) return shiftDate(base, 2);
  if (/\b(next week|minggu depan)\b/.test(t)) return shiftDate(base, 7);
  if (/\b(next month|bulan depan)\b/.test(t)) return shiftDate(base, 30);
  if (/\b(next year|tahun depan)\b/.test(t)) return shiftDate(base, 365);

  const mDays = t.match(/\bin\s+(\d+)\s+(day|days|hari)\b/);
  if (mDays) return shiftDate(base, Number(mDays[1]));

  const mWeeks = t.match(/\bin\s+(\d+)\s+(week|weeks|minggu)\b/);
  if (mWeeks) return shiftDate(base, Number(mWeeks[1]) * 7);

  const mMonths = t.match(/\bin\s+(\d+)\s+(month|months|bulan)\b/);
  if (mMonths) return shiftDate(base, Number(mMonths[1]) * 30);

  const mYears = t.match(/\bin\s+(\d+)\s+(year|years|tahun)\b/);
  if (mYears) return shiftDate(base, Number(mYears[1]) * 365);

  return base;
}

// normalize text
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// topic key (very simple, just main content words)
// dipakai buat “feeling” continuity, bukan dedup berat
function topicKey(str) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "about",
    "next",
    "week",
    "month",
    "year",
    "tomorrow",
    "today",
    "besok",
    "depan",
    "plan",
    "rencana",
  ]);
  const tokens = normalize(str)
    .split(" ")
    .filter((w) => w.length >= 4 && !stop.has(w));
  if (!tokens.length) return normalize(str);
  return tokens.slice(0, 3).join(" ");
}

// buang noise: mood-only / meta
function isNoise(line) {
  const t = line.toLowerCase();

  if (!t || t.length < 8) return true;

  // mood-only / emotion-only
  if (
    /^felt\b/.test(t) &&
    !/\b(before|after|during|because|when|while)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(i feel|i'm feeling|feeling good|feeling calm|mood|vibes)\b/.test(t) &&
    !/\b(before|after|during|because|when|while)\b/.test(t)
  ) {
    return true;
  }

  // meta / advice-y
  if (
    /\b(maintain|stay positive|keep going|stay open|insights|engagement|reflection|attitude)\b/.test(
      t
    )
  )
    return true;

  return false;
}

// parse status perubahan rencana
function parsePlanChange(line) {
  const t = line.toLowerCase();
  const isCancel =
    /\b(cancel|cancelled|dibatalkan|batal|drop|won't do|ga jadi|nggak jadi|tidak jadi)\b/.test(
      t
    );
  const isReschedule =
    /\b(postpone|postponed|reschedule|rescheduled|delay|delayed|move|moved|push|pushed|undur|tunda|ditunda|ganti ke|pindah ke)\b/.test(
      t
    );

  let reason = null;
  const r1 = line.match(/\b(because|due to|karena|soalnya)\b(.+)/i);
  if (r1) reason = r1[2].trim().replace(/[.]+$/, "");

  // future phrase (untuk tanggal baru)
  let timePhrase = null;
  const mNext =
    line.match(
      /\b(next week|next month|next year|day after tomorrow|tomorrow|besok|minggu depan|bulan depan|tahun depan|lusa)\b/i
    ) ||
    line.match(
      /\bin\s+\d+\s+(day|days|week|weeks|month|months|year|years|hari|minggu|bulan|tahun)\b/i
    );
  if (mNext) timePhrase = mNext[0];

  return { isCancel, isReschedule, reason, timePhrase };
}

// prompt AI
const SYSTEM_PROMPT = `
You are a calm, human journaling assistant.
From the text, extract only:
- concrete plans or future intentions
- important actions/decisions
- plan changes (postponed/cancelled) with reasons if given

Rules:
- Ignore pure emotions like "feeling calm" or "feeling good".
- If a plan is changed, describe it clearly (postponed/cancelled + when + why).
- Keep each highlight as one short natural sentence.
- Maximum 5 lines per day.
- No bullet markers, no emojis, no advice.
`;

// core: proses 1 hari → generate + simpan highlights
async function processDay(dateKey, texts) {
  const joined = texts.join("\n").trim();
  if (!joined || joined.length < 10) return { count: 0 };

  const { text: aiText } = await generateText({
    model: openrouter("openai/gpt-3.5-turbo"),
    system: SYSTEM_PROMPT,
    prompt: joined,
  });

  let lines = aiText
    .split("\n")
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter((l) => l.length > 0 && !isNoise(l));

  if (!lines.length) return { count: 0 };

  // limit 5
  if (lines.length > 5) lines = lines.slice(0, 5);

  let inserted = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length < 5) continue;

    const { isCancel, isReschedule, reason, timePhrase } = parsePlanChange(line);
    const topic = topicKey(line);

    // CASE 1: cancel
    if (isCancel) {
      const cancelText = reason
        ? `Plan cancelled: ${topic} (reason: ${reason})`
        : `Plan cancelled: ${topic}`;
      await addHighlight(cancelText, dateKey);
      inserted += 1;
      continue;
    }

    // CASE 2: reschedule → Style B:
    //  (a) note di hari ini
    //  (b) rencana baru di tanggal baru
    if (isReschedule) {
      const changeNote = reason
        ? `Plan updated: ${topic} moved${timePhrase ? ` to ${timePhrase}` : ""} (reason: ${reason})`
        : `Plan updated: ${topic} moved${timePhrase ? ` to ${timePhrase}` : ""}`;
      await addHighlight(changeNote, dateKey);
      inserted += 1;

      const newDate = timePhrase ? detectFutureDate(dateKey, timePhrase) : dateKey;
      const futurePlan = `Plan: ${topic}`;
      await addHighlight(futurePlan, newDate);
      inserted += 1;
      continue;
    }

    // CASE 3: normal plan / important action
    const planned = detectFutureDate(dateKey, line);
    await addHighlight(line, planned);
    inserted += 1;
  }

  return { count: inserted };
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
   POST /highlights
   - Manual: { text, planned_date }
   - Auto today: { auto: true }
=============================== */
router.post("/", async (req, res) => {
  try {
    const { text, planned_date = null, source_entry_id = null, auto = false } =
      req.body || {};

    // 🌱 Manual add
    if (!auto) {
      if (!text?.trim()) {
        return res.status(400).json({ error: "text required" });
      }
      const row = await addHighlight(text.trim(), planned_date, source_entry_id);
      return res.json(row);
    }

    // 🤖 Auto: today only
    const today = getDateKey();
    const entries = await getAllEntries();
    const todaysTexts = entries
      .filter((e) => getDateKey(e.created_at) === today)
      .map((e) => e.text);

    if (!todaysTexts.length) {
      return res.status(200).json({ message: "no_entries_for_today" });
    }

    const { count } = await processDay(today, todaysTexts);
    res.json({ message: "auto_highlights_done", date: today, count });
  } catch (err) {
    console.error("POST /highlights error:", err);
    res.status(500).json({ error: "Failed to generate/add highlights" });
  }
});

/* ===============================
   POST /highlights/backfill
   - generate highlights for past days
   - skip day if already has highlights
=============================== */
router.post("/backfill", async (_req, res) => {
  try {
    const entries = await getAllEntries();
    if (!entries.length) {
      return res.status(200).json({ message: "no_entries" });
    }

    // group by date
    const grouped = entries.reduce((acc, e) => {
      const dateKey = getDateKey(e.created_at);
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(e.text);
      return acc;
    }, {});

    let total = 0;
    const perDay = [];

    for (const [dateKey, texts] of Object.entries(grouped)) {
      // skip kalau hari itu sudah punya highlight
      const existing = await getHighlightsByDay(dateKey);
      if (existing.length > 0) {
        perDay.push({ date: dateKey, skipped: true, added: 0 });
        continue;
      }

      const { count } = await processDay(dateKey, texts);
      total += count;
      perDay.push({ date: dateKey, skipped: false, added: count });
    }

    res.json({
      message: "backfill_done",
      total_added: total,
      days: perDay,
    });
  } catch (err) {
    console.error("POST /highlights/backfill error:", err);
    res.status(500).json({ error: "Failed to backfill highlights" });
  }
});

/* ===============================
   PATCH /highlights/:id/toggle
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
   DELETE /highlights/:id
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
