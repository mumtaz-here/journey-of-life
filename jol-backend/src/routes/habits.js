/**
 * Journey of Life — Route: Habits (Full Fixed Version)
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

/** ✅ GET all habits */
router.get("/", async (_req, res) => {
  try {
    const data = await getAll();
    res.json(data);
  } catch (err) {
    console.error("GET /habits error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/** ✅ POST create habit */
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const created = await addHabit(title);
    res.json(created);
  } catch (err) {
    console.error("POST /habits error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/** ✅ PATCH toggle habit */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const updated = await toggleHabit(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("PATCH /habits/:id/toggle error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/** ✅ DELETE habit */
router.delete("/:id", async (req, res) => {
  try {
    await deleteHabit(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE /habits/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
