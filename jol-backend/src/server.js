/**
 * Journey of Life — Backend Server (with AI Daily Parsing)
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/index.js";

/* 🪶 Routes */
import entriesRoute from "./routes/entries.js";
import highlightsRoute from "./routes/highlights.js";
import habitsRoute from "./routes/habits.js";
import summariesRoute from "./routes/summaries.js";
import chatRoute from "./routes/chat.js";
import storyRoute from "./routes/story.js";

/* 🧱 Table Initializers */
import { initEntriesTable } from "./db/models/entries.js";
import { initHighlightsTable } from "./db/models/highlights.js";
import { initHabitsTable } from "./db/models/habits.js";
import { initHabitLogsTable } from "./db/models/habit-logs.js";
import { initSummariesTable } from "./db/models/summaries.js";
import { initStoryTable } from "./db/models/story-init.js";
import { initAnalysisTable } from "./db/models/analysis.js"; // ⭐ NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* 🌿 Health Check */
app.get("/", (_req, res) => {
  res.send("🌿 Journey of Life API is running smoothly.");
});

/* 🚦 API Routes */
app.use("/api/entries", entriesRoute);
app.use("/api/highlights", highlightsRoute);
app.use("/api/habits", habitsRoute);
app.use("/api/summaries", summariesRoute);
app.use("/api/chat", chatRoute);
app.use("/api/story", storyRoute);

/* 🚀 Server Start + Initialize DB Tables */
app.listen(PORT, async () => {
  try {
    await db.connect();
    console.log("✅ Database connected");

    await initEntriesTable();
    await initHighlightsTable();
    await initHabitsTable();
    await initHabitLogsTable();
    await initSummariesTable();
    await initStoryTable();
    await initAnalysisTable(); // ⭐ AI Daily Parsing

    console.log("🧱 All tables are fully ready.");
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Server init error:", err);
  }
});
