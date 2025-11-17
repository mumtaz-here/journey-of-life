/**
 * Journey of Life — Route: Daily Story + Range Filter
 * ---------------------------------------------------
 * - GET /story                → semua story (terbaru di atas)
 * - GET /story?from=&to=      → story dalam rentang tanggal
 * - POST /story/generate      → refresh story HARI INI
 * - POST /story/backfill      → generate story untuk semua hari yang punya entry
 */

import express from "express";
import pool from "../db/index.js";
import storyModel from "../db/models/story.js";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const router = express.Router();

/* 🌿 OpenRouter client */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

/* 📅 Helper: YYYY-MM-DD (lokal) */
function getDateKey(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* 🎯 Helper: generate / update daily story untuk 1 hari */
async function generateDailyStoryForDay(dayKey, entriesForDay) {
  const total = entriesForDay.length;
  const texts = total
    ? entriesForDay.map((e) => e.text).join("\n")
    : "(Tidak ada teks eksplisit hari ini.)";

  const existing = await storyModel.getByDay(dayKey);
  const hasExisting = !!existing;

  const mode =
    total < 3
      ? "rewrite_total"
      : "merge_with_existing_non_dramatic";

  const existingBlock = hasExisting ? existing.narrative : "(belum ada)";

  const { text: narrative } = await generateText({
    model: openrouter("openai/gpt-3.5-turbo"),
    system: `
Kamu penulis narasi harian yang factual dan tenang.

Aturan:
- Bahasa Indonesia.
- Sudut pandang orang ketiga: sebut nama "Mumtaz" lalu "ia".
- Jangan mengarang fakta/emosi/penilaian yang tidak tertulis.
- Hindari kata "ringan", "berat", "tanpa beban", dll kecuali jelas ada di teks.
- Hindari gaya puitis/dramatis.

Mode:
- "rewrite_total": tulis narasi baru singkat (1–3 kalimat) hanya dari entries hari itu.
- "merge_with_existing_non_dramatic":
   pakai existing story sebagai dasar, lalu tulis ulang versi ringkas
   yang tetap membawa inti cerita lama + info baru dari entries,
   jadi satu paragraf utuh (bukan bullet).
    `,
    prompt: `
Hari: ${dayKey}
Mode: ${mode}

Existing story (boleh dipadatkan, jangan didramatisir):
${existingBlock}

Entries hari itu (${total} buah):
${texts}

Tulis SATU narasi pendek yang utuh untuk hari ini.
    `,
  });

  const saved = await storyModel.save(dayKey, narrative.trim());
  return saved;
}

/* ========================================================
   GET — semua daily story / range-filter
======================================================== */
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    // kalau ada from & to → filter rentang
    if (from && to) {
      const rows = await storyModel.getRange(from, to);
      return res.json(rows);
    }

    // kalau cuma from → anggap to = from
    if (from && !to) {
      const rows = await storyModel.getRange(from, from);
      return res.json(rows);
    }

    // default: semua story
    const rows = await storyModel.getAll();
    res.json(rows);
  } catch (err) {
    console.error("GET /story error:", err);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

/* ========================================================
   POST /story/generate — refresh story HARI INI
======================================================== */
router.post("/generate", async (_req, res) => {
  try {
    const dayKey = getDateKey();

    const entriesQ = await pool.query(
      `
      SELECT id, text, analysis, created_at
      FROM entries
      WHERE created_at::date = $1::date
      ORDER BY created_at ASC
      `,
      [dayKey]
    );
    const entriesForDay = entriesQ.rows;

    const saved = await generateDailyStoryForDay(dayKey, entriesForDay);
    res.json(saved);
  } catch (err) {
    console.error("POST /story/generate error:", err);
    res.status(500).json({ error: "Failed to generate daily story" });
  }
});

/* ========================================================
   POST /story/backfill — generate story untuk semua hari
   yang punya entries tapi belum ada narasi
======================================================== */
router.post("/backfill", async (_req, res) => {
  try {
    const entriesQ = await pool.query(
      `
      SELECT id, text, analysis, created_at
      FROM entries
      ORDER BY created_at ASC
      `
    );
    const allEntries = entriesQ.rows;

    // group by dayKey
    const grouped = allEntries.reduce((acc, e) => {
      const dayKey = getDateKey(e.created_at);
      acc[dayKey] = acc[dayKey] || [];
      acc[dayKey].push(e);
      return acc;
    }, {});

    const existing = await storyModel.getAll();
    const existingDays = new Set(existing.map((s) => s.week));

    const added = [];
    for (const [dayKey, entriesForDay] of Object.entries(grouped)) {
      if (existingDays.has(dayKey)) continue; // sudah ada, skip
      const saved = await generateDailyStoryForDay(dayKey, entriesForDay);
      added.push(saved);
    }

    res.json({
      message: `Backfill complete (${added.length} stories added).`,
      added,
    });
  } catch (err) {
    console.error("POST /story/backfill error:", err);
    res.status(500).json({ error: "Failed to backfill stories" });
  }
});

/* ========================================================
   DELETE — hapus 1 story
======================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await storyModel.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /story error:", err);
    res.status(500).json({ error: "Failed to delete story" });
  }
});

export default router;
