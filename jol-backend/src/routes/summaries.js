/**
 * Journey of Life — Route: Summaries (READ-ONLY for users)
 */

import express from "express";
import { getAllSummaries } from "../db/models/summaries.js";
import adminAuth from "../middleware/admin-auth.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await getAllSummaries());
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

router.post("/backfill", adminAuth, async (_req, res) => {
  res.json({ message: "disabled for now" });
});

export default router;
