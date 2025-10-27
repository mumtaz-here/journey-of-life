/**
 * Journey of Life — Route: Entries (with auto Highlights + Priorities)
 */

import express from "express";
import {
  getAllEntries,
  addEntry,
  deleteEntry,
  initEntriesTable,
} from "../db/models/entries.js";
import { addHighlight, initHighlightsTable } from "../db/models/highlights.js";
import {
  initPrioritiesTable,
  countPrioritiesByDate,
  addPriority as addPrio,
} from "../db/models/priorities.js";
import { parseEntry } from "../utils/parser.js";

const router = express.Router();

await initEntriesTable();
await initHighlightsTable();
await initPrioritiesTable();

// GET all
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllEntries();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new entry → parse → save → create highlights + (up to) 3 priorities (today)
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const analysis = parseEntry(text);
    const entry = await addEntry(text, analysis);

    // highlights from plans
    if (analysis?.plans?.length) {
      for (const p of analysis.plans) {
        await addHighlight(p.title, p.planned_date || null, entry.id);
      }
    }

    // priorities from parser (today), cap at 3 per date
    if (analysis?.priorities?.length) {
      const today = analysis.priorities[0].date; // they are all today by design
      let count = await countPrioritiesByDate(today);
      for (const p of analysis.priorities) {
        if (count >= 3) break;
        await addPrio({ text: p.title, date: today, source_entry_id: entry.id });
        count += 1;
      }
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await deleteEntry(req.params.id);
  } catch (_) {}
  res.json({ message: "Deleted" });
});

export default router;
