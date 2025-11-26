/**
 * Journey of Life — Route: Habits (SYNC ENTRY + SUMMARY + STORY)
 */

import express from "express";
import {
  getHabitsWithTodayStatus,
  getHabitWithTodayStatus,
  addHabit,
  deleteHabit
} from "../db/models/habits.js";
import { getLogForDate, createLog, deleteLog } from "../db/models/habit-logs.js";
import { addEntry, getAllEntries } from "../db/models/entries.js";
import { upsertSummary } from "../db/models/summaries.js";
import storyModel from "../db/models/story.js";

import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";

const router = express.Router();

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life"
  }
});

function localKey() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

async function updateStory(tk, todaysEntries) {
  const filtered = todaysEntries.map(e => e.text).filter(t => !t.startsWith("(habit)")).join("\n") || "(rutinitas)";
  const existing = await storyModel.getByDay(tk);

  const { text } = await generateText({
    model: openrouter("openai/gpt-oss-20b:free"),
    system: "Narasi faktual singkat tidak dramatis (orang ketiga, gunakan nama Mumtaz).",
    prompt: filtered
  });

  return storyModel.save(tk, text.trim());
}

router.get("/", async (_req, res) => {
  try {
    res.json(await getHabitsWithTodayStatus(localKey()));
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "title required" });

    res.json(await addHabit(title.trim()));
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tk = localKey();

    const existing = await getLogForDate(id, tk);
    existing ? await deleteLog(id, tk) : await createLog(id, tk);

    const habit = await getHabitWithTodayStatus(id, tk);
    const base = habit.today_done ? "(habit) Completed: " : "(habit) Uncompleted: ";
    await addEntry(`${base}${habit.title}`);

    const allEntries = await getAllEntries();
    const todays = allEntries.filter(e => e.created_at.toISOString().startsWith(tk));

    const { text: summaryText } = await generateText({
      model: openrouter("openai/gpt-oss-20b:free"),
      system: "Ringkas faktual bullet pendek tanpa opini.",
      prompt: todays.map(e => e.text).join("\n")
    });

    await upsertSummary(tk, summaryText.trim());
    await updateStory(tk, todays);

    res.json(habit);
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteHabit(Number(req.params.id));
    res.json({ message: "deleted" });
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

export default router;
