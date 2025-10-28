/**
 * Journey of Life — Route: Highlights (FINAL FIXED)
 */

import express from "express";
import {
  getAllHighlights,
  addHighlight,
  toggleHighlight,
  deleteHighlight,
} from "../db/models/highlights.js";

const router = express.Router();

/** GET all */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllHighlights();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST create (manual add) */
router.post("/", async (req, res) => {
  try {
    const { text, planned_date = null, source_entry_id = null } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const row = await addHighlight(text, planned_date, source_entry_id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH toggle */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const updated = await toggleHighlight(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE */
router.delete("/:id", async (req, res) => {
  try {
    await deleteHighlight(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
