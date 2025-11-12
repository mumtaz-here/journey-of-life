/**
 * Journey of Life — Route: Chat (AI SDK Integration ✅)
 * -----------------------------------------------------
 * Menggunakan OpenRouter Provider via ai-sdk.
 * Simpel, tenang, dan ramah untuk journaling refleksi.
 */

import express from "express";
import "dotenv/config";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";

const router = express.Router();

// 🔑 Setup provider OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173", // wajib
    "X-Title": "Journey of Life", // wajib
  },
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  try {
    // ✨ Generate AI text
    const { text } = await generateText({
      model: openrouter("openai/gpt-3.5-turbo"), // model gratis
      system:
        "You are a calm, empathetic journaling assistant. Summarize the user's reflections kindly and clearly in one short paragraph.",
      prompt: message,
    });

    res.json({ reply: text.trim() });
  } catch (err) {
    console.error("❌ AI SDK error:", err.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
