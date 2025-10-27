/**
 * Journey of Life — Route: Priorities
 * -----------------------------------
 * GET    /api/priorities?date=YYYY-MM-DD
 * POST   /api/priorities { text, date?, source_entry_id? } (date default: today)
 * PATCH  /api/priorities/:id { text?, status? }
 * PATCH  /api/priorities/:id/toggle
 * DELETE /api/priorities/:id
 * Constraint: max 3 per date
 */

import express from "express";
import {
  initPrioritiesTable,
  getPrioritiesByDate,
  countPrioritiesByDate,
  addPriority,
  updatePriority,
  togglePriority,
  deletePriority,
} from "../db/models/priorities.js";

const router = express.Router();
await initPrioritiesTable();

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

router.get("/", async (req, res) => {
  try {
    const date = req.query.date || isoToday();
    const rows = await getPrioritiesByDate(date);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, date, source_entry_id } = req.body;
    const day = date || isoToday();
    if (!text) return res.status(400).json({ error: "Text is required" });

    const count = await countPrioritiesByDate(day);
    if (count >= 3) return res.status(400).json({ error: "Max 3 priorities for the day" });

    const row = await addPriority({ text, date: day, source_entry_id: source_entry_id || null });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { text, status } = req.body;
    const row = await updatePriority(req.params.id, { text, status });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const row = await togglePriority(req.params.id);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deletePriority(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
