/**
 * Journey of Life — Backend Server (Entries + Habits)
 * ---------------------------------------------------
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/index.js";

import entriesRoute from "./routes/entries.js";
import habitsRoute from "./routes/habits.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🩷 Root route
app.get("/", (req, res) => {
  res.json({ message: "Journey of Life API — calm and alive 🌱" });
});

// 🪶 API routes
app.use("/api/entries", entriesRoute);
app.use("/api/habits", habitsRoute);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await db.connect();
  console.log("🌿 Connected to PostgreSQL (Journey of Life)");
  console.log(`🌸 Server running on http://localhost:${PORT}`);
});
