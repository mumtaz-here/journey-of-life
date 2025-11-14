/**
 * Journey of Life — Route: Habits (FINAL STABLE)
 * Works with: habit-logs.js + habits.js (fixed)
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

const router = express.Router();

// today key → YYYY-MM-DD
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

/* ----------------------------------------------------
   GET — all habits + today_done + streak
---------------------------------------------------- */
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

/* ----------------------------------------------------
   POST — Add habit
---------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "title required" });
    }

    const created = await addHabit(title.trim());
    res.json(created);
  } catch (err) {
    console.error("POST /habits error:", err);
    res.status(500).json({ error: "Failed to add habit" });
  }
});

/* ----------------------------------------------------
   PATCH — Toggle today's habit completion
---------------------------------------------------- */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tk = todayKey();

    // check existing log
    const existing = await getLogForDate(id, tk);

    if (existing) {
      // uncheck
      await deleteLog(id, tk);
    } else {
      // check
      await createLog(id, tk);
    }

    const updated = await getHabitWithTodayStatus(id, tk);
    res.json(updated);
  } catch (err) {
    console.error("PATCH /habits/:id/toggle error:", err);
    res.status(500).json({ error: "Failed to toggle habit" });
  }
});

/* ----------------------------------------------------
   DELETE — Remove habit
---------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteHabit(id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /habits/:id error:", err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
