import express from "express";
import habitsModel from "../db/models/habits.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await habitsModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const created = await habitsModel.create(title);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const updated = await habitsModel.toggle(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await habitsModel.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
