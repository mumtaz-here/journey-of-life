/**
 * Journey of Life — Route: Entries
 * AUTO Summary + AUTO Story with Multi-language Detection
 */

import express from "express";
import { getAllEntries, addEntry, getEntriesByDate } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import storyModel from "../db/models/story.js";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

/* 🌿 OpenRouter Provider */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});
const FREE_MODEL = "openai/gpt-oss-20b:free";

/* 📌 Helper — Local Date Key */
function getDateKey(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* 🌍 Detect User Language (Simple Heuristics) */
function detectLang(text) {
  const englishHits = (text.match(/[a-z]{3,}/gi) || []).length;
  const indoHits = (text.match(/\b(aku|saya|nggak|lebih|tidur|makan|hari|bangun|lagi|ini|itu)\b/gi) || []).length;

  if (englishHits > indoHits) return "en";
  if (indoHits > englishHits) return "id";
  return "id"; // default
}

/* ✏️ Generate Story + Summary Based on Language */
async function generateStory(dayKey, entries) {
  const fullText = entries.map((e) => e.text).join("\n") || "(Tidak ada teks)";
  const lang = detectLang(fullText);

  // 🗣 Rules Based on Language
  const rules =
    lang === "en"
      ? `
Write a short factual narrative.
- English language
- Third person: mention the user's name if exists in text
- Do not add new details
- Do not dramatize
`
      : `
Tulis narasi faktual sangat singkat.
- Bahasa Indonesia
- Orang ketiga, sebut nama jika muncul di teks
- Jangan menambah detail baru
- Jangan dramatis atau puitis
`;

  const { text } = await generateText({
    model: openrouter(FREE_MODEL),
    system: rules,
    prompt: fullText,
  });

  return storyModel.save(dayKey, text.trim());
}

async function generateSummary(dayKey, entries) {
  const fullText = entries.map((e) => e.text).join("\n") || "(Tidak ada teks)";
  const lang = detectLang(fullText);

  const rules =
    lang === "en"
      ? `Summarize factually in short bullet points. No mood interpretation, no assumptions.`
      : `Ringkas faktual poin-poin pendek. Jangan menambah interpretasi, jangan menambah asumsi.`;

  const { text } = await generateText({
    model: openrouter(FREE_MODEL),
    system: rules,
    prompt: fullText,
  });

  return upsertSummary(dayKey, text.trim());
}

/* ============================================================
📌 POST New Entry + Auto Summary + Auto Story
============================================================ */
router.post("/", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    // Save entry
    const entry = await addEntry(text.trim());
    const dayKey = getDateKey(entry.created_at);

    // Fetch today's entries
    const entries = await getEntriesByDate(dayKey);

    // Auto-process AI results
    const summary = await generateSummary(dayKey, entries);
    const story = await generateStory(dayKey, entries);

    res.json({ ...entry, auto_summary: summary, auto_story: story });
  } catch (err) {
    console.error("POST /entries error:", err);
    res.status(500).json({ error: "failed" });
  }
});

/* 📌 GET All Entries */
router.get("/", async (_req, res) => {
  try {
    res.json(await getAllEntries());
  } catch {
    res.status(500).json({ error: "failed to fetch entries" });
  }
});

export default router;
