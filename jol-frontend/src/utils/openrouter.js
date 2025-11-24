/**
 * Journey of Life — OpenRouter Provider (FREE ONLY)
 * -------------------------------------------------
 * Primary:  openai/gpt-oss-20b:free
 * Fallback: mistralai/mistral-7b-instruct (free)
 */

import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

// 🌱 Init provider
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  }
});

/* ============================================================
   🧠 SAFE AI WRAPPER
   - Always tries gpt-oss-20b:free first
   - If throttled/failed → fallback to Mistral
   - Always returns: { text, raw }
============================================================ */
export async function askAI({ system, prompt }) {
  try {
    // 🏆 Primary model (FREE)
    return await generateText({
      model: openrouter("openai/gpt-oss-20b:free"),
      system,
      prompt
    });

  } catch (err) {
    console.warn("⚠️ [AI] Primary model failed → using Mistral fallback.");

    // 🔁 Fallback model (FREE)
    return await generateText({
      model: openrouter("mistralai/mistral-7b-instruct"),
      system,
      prompt
    });
  }
}
