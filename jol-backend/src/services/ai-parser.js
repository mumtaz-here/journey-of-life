/**
 * Journey of Life — AI Parser (Mood + Energy + Focus + Highlights)
 * ----------------------------------------------------------------
 * Input: array of today's entries (plain text)
 * Output stored per-day as: { mood, energy, focus, highlights[] }
 */

import { generateText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";
import "dotenv/config";

// 🧠 OpenRouter Provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Journey of Life",
  },
});

// 🎯 Model
const MODEL = "openai/gpt-4.1-mini";

/**
 * Parse daily analysis from raw entries.
 * @param {Array} entries - list of entries from the same day
 * @returns {Object} { mood, energy, focus, highlights[] }
 */
export async function parseAnalysis(entries = []) {
  const text = entries.map((e) => e.text).join("\n") || "(no text)";

  // Batasi input biar gak over-token
  const limitedText = text.slice(0, 4000);

  const SYSTEM = `
Analyze daily journal entries.

Return JSON only. Follow these rules strictly:

DO:
- Extract mood, mental energy, and focus level from the content only
- Provide short single-word or short-phrase results
- Create up to 6 daily highlights (facts or actions)

DO NOT:
- Add any new details not mentioned in the text
- Add medical or psychological assumptions
- Infer causes or diagnoses
- Use emojis or storytelling
- Output anything outside JSON
`;

  let raw;

  try {
    const response = await generateText({
      model: openrouter(MODEL),
      system: SYSTEM,
      prompt: `
Journal content:
"${limitedText}"

Return in this strict JSON format:
{
  "mood": "...",
  "energy": "...",
  "focus": "...",
  "highlights": ["...", "..."]
}
`,
      max_tokens: 500, // ⬅️ FIX PENTING
    });

    raw = response.text;
  } catch (err) {
    console.error("❌ AI parseAnalysis error:", err.message);
    return {
      mood: null,
      energy: null,
      focus: null,
      highlights: [],
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      mood: null,
      energy: null,
      focus: null,
      highlights: [],
    };
  }
}
