/**
 * Journey of Life — Route: Habits (FINAL ✅)
 * ----------------------------------------------------
 * Handles all CRUD routes for the Habits table.
 */

import express from "express";
import {
  getAll,
  addHabit,
  toggleHabit,
  deleteHabit,
} from "../db/models/habits.js";

const router = express.Router();

/* 🟢 GET all habits */
router.get("/", async (_req, res) => {
  try {
    const data = await getAll();
    res.json(data);
  } catch (err) {
    console.error("GET /habits error:", err);
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

/* 🟢 POST create new habit */
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "title required" });
    }

    const habit = await addHabit(title.trim());
    res.json(habit);
  } catch (err) {
    console.error("POST /habits error:", err);
    res.status(500).json({ error: "Failed to add habit" });
  }
});

/* 🟢 PATCH toggle habit (done/undone) */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await toggleHabit(id);
    res.json(updated);
  } catch (err) {
    console.error("PATCH /habits/:id/toggle error:", err);
    res.status(500).json({ error: "Failed to toggle habit" });
  }
});

/* 🟢 DELETE habit by ID */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHabit(id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /habits/:id error:", err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
