/**
 * Journey of Life — Route: Entries (FINAL)
 */

import express from "express";
import {
  getAllEntries,
  addEntry
} from "../db/models/entries.js";
import {
  addHighlight
} from "../db/models/highlights.js";
import { extractPlans } from "../utils/intent-parser.js";

const router = express.Router();

/** GET all entries */
router.get("/", async (_req, res) => {
  try {
    const rows = await getAllEntries();
    res.json(rows);
  } catch (err) {
    console.error("GET /entries error", err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

/** POST + auto-highlight from intent */
router.post("/", async (req, res) => {
  try {
    const { text, analysis = null } = req.body || {};
    if (!text?.trim()) {
      return res.status(400).json({ error: "text required" });
    }

    // save entry
    const entry = await addEntry(text, analysis);

    // auto create highlights
    const plans = extractPlans(text);
    for (const p of plans) {
      await addHighlight(p.text, p.planned_date, entry.id);
    }

    res.json({
      ...entry,
      auto_highlights: plans
    });

  } catch (err) {
    console.error("POST /entries error", err);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

export default router;
