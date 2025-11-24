/**
 * Journey of Life — Route: Habits (SYNC ENTRY + SUMMARY + STORY + Habit Filter)
 */

import express from "express";

import {
  getHabitsWithTodayStatus,
  getHabitWithTodayStatus,
  addHabit,
  deleteHabit
} from "../db/models/habits.js";

import {
  getLogForDate,
  createLog,
  deleteLog
} from "../db/models/habit-logs.js";

import { addEntry, getAllEntries } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import storyModel from "../db/models/story.js";

// 🌿 AI SDK
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

const router = express.Router();

/* ========== Local Date Key (NO UTC SHIFT) ========== */
function todayKey() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* ===================================================
   📝 STORY GENERATION — IGNORE Individual Habits
=================================================== */
async function updateDailyStory(dayKey, todaysEntries) {
  // 🔍 Ambil teks selain habit-logs
  let filtered = todaysEntries
    .map(e => e.text)
    .filter(text => !text.trim().startsWith("(habit)"))
    .join("\n")
    .trim();

  // 🌱 Kalau tidak ada teks selain habit
  if (filtered === "") {
    filtered = "(Catatan menunjukkan rutinitas harian tanpa detail lain.)";
  }

  const existing = await storyModel.getByDay(dayKey);
  const hasExisting = !!existing;

  const mode =
    todaysEntries.length < 3
      ? "rewrite_total"
      : "merge_with_existing_non_dramatic";

  const existingBlock = hasExisting ? existing.narrative : "(belum ada)";

  const { text: narrative } = await generateText({
    model: openrouter("openai/gpt-3.5-turbo"),
    system: `
Kamu penulis narasi harian yang sangat factual dan tenang.

Aturan:
- Bahasa Indonesia.
- Sudut pandang orang ketiga: sebut nama "Mumtaz" dan gunakan "ia".
- Jangan mengarang emosi, motivasi, atau opini yang tidak tercatat secara eksplisit.
- Ceritakan secara netral, sederhana, dan jujur.
- Jika hanya ada rutinitas harian tanpa detail lain, jelaskan secara umum (tanpa angka/tanpa menghitung).
- Jangan dramatis atau puitis.

Mode:
- rewrite_total → buat narasi 1–3 kalimat dari data hari itu.
- merge_with_existing_non_dramatic → rapikan versi lama, gabungkan aktivitas baru tanpa dramatisasi.
    `,
    prompt: `
Hari: ${dayKey}
Mode: ${mode}

Narasi sebelumnya (boleh dirapikan & dipadatkan):
${existingBlock}

Data hari ini (Sudah difilter, tanpa detail habit):
${filtered}

Tulis narasi faktual & singkat untuk hari ini.
    `,
  });

  return storyModel.save(dayKey, narrative.trim());
}

/* ===================================================
   ROUTES
=================================================== */

// GET all habits
router.get("/", async (_req, res) => {
  try {
    const tk = todayKey();
    const data = await getHabitsWithTodayStatus(tk);
    res.json(data);
  } catch (err) {
    console.error("GET /habits error:", err);
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

// Add habit
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "title required" });

    const created = await addHabit(title.trim());
    res.json(created);
  } catch (err) {
    console.error("POST /habits error:", err);
    res.status(500).json({ error: "Failed to add habit" });
  }
});

// Toggle + entry + summary + story
router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tk = todayKey();

    const existing = await getLogForDate(id, tk);
    if (existing) await deleteLog(id, tk);
    else await createLog(id, tk);

    const habit = await getHabitWithTodayStatus(id, tk);

    const baseText = habit.today_done
      ? "(habit) Completed: "
      : "(habit) Uncompleted: ";

    await addEntry(`${baseText}${habit.title}`);

    const allEntries = await getAllEntries();
    const todaysEntries = allEntries.filter(
      e => e.created_at.toISOString().startsWith(tk)
    );

    // Summary (tidak diubah dulu, ini sudah oke)
    const { text: summaryText } = await generateText({
      model: openrouter("openai/gpt-3.5-turbo"),
      system: "You are a factual journaling summarizer. Summarize real activities only.",
      prompt: todaysEntries.map(e => e.text).join("\n"),
    });
    await upsertSummary(tk, summaryText);

    // Story (pakai filter di atas)
    await updateDailyStory(tk, todaysEntries);

    res.json(habit);
  } catch (err) {
    console.error("PATCH /habits/:id/toggle error:", err);
    res.status(500).json({ error: "Failed to toggle habit" });
  }
});

// Delete habit
router.delete("/:id", async (req, res) => {
  try {
    await deleteHabit(Number(req.params.id));
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /habits/:id error:", err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
