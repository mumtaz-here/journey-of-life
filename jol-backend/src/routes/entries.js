/**
 * Journey of Life — Route: Entries
 * --------------------------------
 * /api/entries → CRUD for journaling entries
 */

import express from "express";
import {
  getAllEntries,
  addEntry,
  deleteEntry,
  initEntriesTable,
} from "../db/models/entries.js";

const router = express.Router();

// 🪶 Initialize table if not exists
await initEntriesTable();

// 🌿 GET all entries
router.get("/", async (req, res) => {
  try {
    const entries = await getAllEntries();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌸 POST new entry
router.post("/", async (req, res) => {
  try {
    const { text, analysis } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required." });
    const newEntry = await addEntry(text, analysis);
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🍂 DELETE entry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEntry(id);
    res.json({ message: "Entry deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
