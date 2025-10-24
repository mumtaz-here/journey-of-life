/**
 * Journey of Life — Route: Habits
 * -------------------------------
 * /api/habits → CRUD for daily rhythm tracking.
 */

import express from "express";
import {
  getAllHabits,
  addHabit,
  toggleHabit,
  deleteHabit,
  initHabitsTable,
} from "../db/models/habits.js";

const router = express.Router();

// 🪴 Initialize table
await initHabitsTable();

// 🌿 GET all habits
router.get("/", async (req, res) => {
  try {
    const habits = await getAllHabits();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌸 POST new habit
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });
    const habit = await addHabit(title);
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌿 PATCH toggle (mark done / undone)
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await toggleHabit(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🍂 DELETE habit
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHabit(id);
    res.json({ message: "Habit deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
