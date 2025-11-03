/**
 * Journey of Life — Backend Server (Final AI + Routes + CORS Integration)
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/index.js";

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// 📦 Import semua route
import entriesRoute from "./routes/entries.js";
import habitsRoute from "./routes/habits.js";
import highlightsRoute from "./routes/highlights.js";
import storyRoutes from "./routes/story.js";
import prioritiesRoute, { initPrioritiesTable } from "./routes/priorities.js";

const app = express();

// 🌐 CORS setup
app.use(
  cors({
    origin: [
      "https://journey-of-life.pages.dev",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: false,
  })
);

// 🧠 Middleware
app.use(express.json());

// 🔑 OpenAI setup
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🚀 Koneksi DB & inisialisasi tabel
try {
  await db.connect();
  console.log("✅ Database terkoneksi");

  await initPrioritiesTable();
  console.log("🧱 Priorities table siap digunakan");
} catch (err) {
  console.error("❌ Gagal konek database:", err.message);
}

// 🌱 Root route
app.get("/", (req, res) => {
  res.json({ message: "Journey of Life API is breathing ✨" });
});

// 📚 API routes
app.use("/api/entries", entriesRoute);
app.use("/api/habits", habitsRoute);
app.use("/api/highlights", highlightsRoute);
app.use("/api/story", storyRoutes);
app.use("/api/priorities", prioritiesRoute);

// 🤖 AI route — OpenAI integration
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      prompt: message,
    });

    let text = "";
    for await (const delta of result.textStream) {
      text += delta;
    }

    try {
      await db.query(
        "INSERT INTO chat_history (user_message, ai_reply) VALUES ($1, $2)",
        [message, text]
      );
      console.log("💾 Chat tersimpan ke database");
    } catch (err) {
      console.error("❌ Gagal simpan chat:", err.message);
    }

    res.json({ reply: text });
  } catch (err) {
    console.error("❌ Error AI:", err.message);
    res.status(500).json({ error: "Gagal memproses permintaan AI" });
  }
});

// ▶️ Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server jalan di http://localhost:" + PORT);
});
