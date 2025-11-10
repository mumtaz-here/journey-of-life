/**
 * Journey of Life — Backend Server (Full Fixed Stable)
 * ----------------------------------------------------
 * Handles API routes, DB init, and AI integration.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/index.js";

// 🪶 Routes
import entriesRoute from "./routes/entries.js";
import highlightsRoute from "./routes/highlights.js";
import habitsRoute from "./routes/habits.js";
import summariesRoute from "./routes/summaries.js";
import chatRoute from "./routes/chat.js";

// 🧱 Table initializers (correct imports from models)
import { initEntriesTable } from "./db/models/entries.js";
import { initHighlightsTable } from "./db/models/highlights.js";
import { initHabitsTable } from "./db/models/habits.js";
import { initSummariesTable } from "./db/models/summaries.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🌿 Root test
app.get("/", (_req, res) => {
  res.send("🌿 Journey of Life API is running smoothly.");
});

// 🧩 Routes
app.use("/api/entries", entriesRoute);
app.use("/api/highlights", highlightsRoute);
app.use("/api/habits", habitsRoute);
app.use("/api/summaries", summariesRoute);
app.use("/api/chat", chatRoute);

// 🚀 Start server
app.listen(PORT, async () => {
  try {
    await db.connect();
    console.log("✅ Database connected");

    // Initialize tables
    await initEntriesTable();
    await initHighlightsTable();
    await initHabitsTable();
    await initSummariesTable();

    console.log("🧱 All tables are ready");
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Server init error:", err);
  }
});
