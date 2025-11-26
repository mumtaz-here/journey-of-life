/**
 * Journey of Life — Route: Chat (AI SDK Integration)
 */

import express from "express";
import "dotenv/config";
import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";

const router = express.Router();

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life"
  }
});

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message required" });

  try {
    const { text } = await generateText({
      model: openrouter("openai/gpt-oss-20b:free"),
      system: "You are a calm factual journaling assistant. Keep replies short.",
      prompt: message
    });

    res.json({ reply: text.trim() });
  } catch (err) {
    console.error("❌ AI error:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;
