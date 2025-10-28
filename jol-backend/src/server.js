/**
 * Journey of Life — Backend Server (with Priorities)
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/index.js";

import entriesRoute from "./routes/entries.js";
import habitsRoute from "./routes/habits.js";
import highlightsRoute from "./routes/highlights.js";
import storyRoutes from "./routes/story.js";
import prioritiesRoute from "./routes/priorities.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Journey of Life API is breathing ✨" });
});

app.use("/api/entries", entriesRoute);
app.use("/api/habits", habitsRoute);
app.use("/api/highlights", highlightsRoute);
app.use("/api/story", storyRoutes);
app.use("/api/priorities", prioritiesRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await db.connect();
  console.log("✅ DB & Server running → http://localhost:" + PORT);
});
