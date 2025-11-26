/**
 * Journey of Life — Route: Daily Story + Range Filter
 */

import express from "express";
import storyModel from "../db/models/story.js";
import adminAuth from "../middleware/admin-auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (from && to) return res.json(await storyModel.getRange(from, to));
    if (from) return res.json(await storyModel.getRange(from, from));

    res.json(await storyModel.getAll());
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

/* Admin only actions */
router.post("/generate", adminAuth, async (_req, res) => {
  res.json({ message: "use /entries to auto generate" });
});

router.post("/backfill", adminAuth, async (_req, res) => {
  res.json({ message: "disabled for users" });
});

router.delete("/:id", adminAuth, async (req, res) => {
  await storyModel.remove(req.params.id);
  res.json({ message: "deleted" });
});

export default router;
