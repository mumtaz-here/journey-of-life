/**
 * Journey of Life — Route: Entries (AI summary + Daily Story)
 * -----------------------------------------------------------
 * - Save entries
 * - Auto-update daily summary (summaries table)
 * - Auto-update daily story (reflections table)
 */

import express from "express";
import { getAllEntries, addEntry, getEntriesByDate } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";

// 🌿 AI SDK imports
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

// Daily story model
import storyModel from "../db/models/story.js";

const router = express.Router();

/* ============================================================
   🔑 Init AI Provider (FREE MODEL)
   ============================================================ */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

// Free model instead of GPT-3.5
const FREE_MODEL = "openai/gpt-oss-20b:free";

/* ============================================================
   Helper → get local YYYY-MM-DD
   ============================================================ */
function getDateKey(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* ============================================================
   Daily Story Updater (factual & neutral)
   ============================================================ */
async function updateDailyStory(dayKey, todaysEntries) {
  const total = todaysEntries.length;
  const texts = total
    ? todaysEntries.map((e) => e.text).join("\n")
    : "(Tidak ada teks eksplisit hari ini.)";

  const existing = await storyModel.getByDay(dayKey);
  const hasExisting = !!existing;

  const mode =
    total < 3
      ? "rewrite_total"
      : "merge_with_existing_non_dramatic";

  const existingBlock = hasExisting ? existing.narrative : "(belum ada)";

  const { text: narrative } = await generateText({
    model: openrouter(FREE_MODEL),
    system: `
Kamu penulis narasi harian yang sangat factual dan tenang.

Aturan umum:
- Bahasa Indonesia.
- Sudut pandang orang ketiga: sebut nama "Mumtaz" lalu "ia".
- Jangan mengarang fakta, emosi, atau penilaian yang tidak tertulis.
- Hindari kata-kata penilaian seperti "ringan", "berat", "tanpa beban", dll,
  kecuali jelas tertulis di teks.
- Hindari gaya puitis atau dramatis. Sederhana dan jujur.

Mode:
- Jika mode = "rewrite_total": tulis narasi baru singkat (1–3 kalimat)
  hanya berdasarkan entries hari itu.
- Jika mode = "merge_with_existing_non_dramatic":
  gunakan existing story sebagai dasar, lalu tulis ulang versi ringkas
  yang tetap membawa inti cerita lama tetapi memasukkan informasi baru dari entries.
  Hasil akhirnya tetap satu narasi yang utuh, bukan bullet list.
    `,
    prompt: `
Hari: ${dayKey}
Mode: ${mode}

Existing story (boleh dirapikan / dipadatkan, tapi jangan dibuat dramatis):
${existingBlock}

Entries untuk hari ini (${total} buah):
${texts}

Tulis satu narasi pendek yang utuh untuk hari ini sesuai aturan di atas.
    `,
  });

  return storyModel.save(dayKey, narrative.trim());
}

/* ============================================================
   📌 POST New Entry + AI Summary + Daily Story Sync
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    // 1️⃣ Save entry
    const entry = await addEntry(text);
    const today = getDateKey(entry.created_at);

    // 2️⃣ Get all today's entries
    const todaysEntries = await getEntriesByDate(today);
    const todaysTexts = todaysEntries.map((e) => e.text).join("\n");

    // 3️⃣ AI Summary (FREE MODEL)
    const { text: summaryText } = await generateText({
      model: openrouter(FREE_MODEL),
      system:
        "Ringkas faktual jurnal harian dalam bullet point pendek. Jangan mengarang informasi. Jika mood/aspek tidak jelas, jangan disebutkan.",
      prompt: todaysTexts,
    });

    // 4️⃣ Save summary
    await upsertSummary(today, summaryText);

    // 5️⃣ Story Sync
    const dailyStory = await updateDailyStory(today, todaysEntries);

    res.json({
      ...entry,
      auto_summary: summaryText,
      auto_story: dailyStory,
    });
  } catch (err) {
    console.error("POST /entries error:", err);
    res.status(500).json({ error: "Failed to create entry or summary" });
  }
});

/* ============================================================
   📌 GET all entries
   ============================================================ */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllEntries();
    res.json(rows);
  } catch (err) {
    console.error("GET /entries error:", err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

export default router;
