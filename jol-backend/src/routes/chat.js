/**
 * Journey of Life — Route: Chat (OpenRouter Integration, FINAL FIX)
 * -----------------------------------------------------
 * Handles AI reflections using OpenRouter API with proper headers.
 * Calm, simple, and human-friendly summary generation.
 */

import express from "express";
import fetch from "node-fetch";
import "dotenv/config";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // 🧩 wajib ditambah header ini biar OpenRouter terima request-nya
        "HTTP-Referer": "http://localhost:5173", 
        "X-Title": "Journey of Life",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // model gratis yang aman
        messages: [
          {
            role: "system",
            content:
              "You are a calm, empathetic journaling assistant. Summarize the user's reflections kindly and clearly in one short paragraph.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("🧠 OpenRouter Response:", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content?.trim() || "⚠️ No AI reply received.";
    res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter error:", err.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
