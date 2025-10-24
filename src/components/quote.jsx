/**
 * Journey of Life — Component: Quote
 * ----------------------------------
 * Calm rotating "Quote of the Day" display.
 * - Cycles softly between quotes (every 12s)
 * - Allows gentle manual refresh
 * - Uses localStorage to remember last shown
 * - Minimal, literary, and emotionally steady
 */

import React, { useEffect, useState } from "react";
import { load, save } from "../utils/storage";

// Internal fallback quotes (used if no DB/remote)
const FALLBACK_QUOTES = [
  {
    text: "Take time to feel what is here before chasing what is next.",
    author: "Journey of Life",
  },
  {
    text: "You don’t have to fix everything today. Some days are for noticing.",
    author: "Unknown",
  },
  {
    text: "Calm isn’t the absence of movement, but the rhythm of awareness.",
    author: "Mumtaz",
  },
  {
    text: "Growth often whispers before it blooms.",
    author: "Soft Journal",
  },
  {
    text: "Peace begins when you stop arguing with your own pace.",
    author: "Journey of Life",
  },
];

export default function Quote() {
  const [quotes, setQuotes] = useState(() => load("quotes") || FALLBACK_QUOTES);
  const [index, setIndex] = useState(() => load("quote-index") || 0);
  const [fade, setFade] = useState(true);

  // Cycle every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 12000);
    return () => clearInterval(interval);
  }, [index]);

  // Persist current index
  useEffect(() => {
    save("quote-index", index);
  }, [index]);

  function handleNext() {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
      setFade(true);
    }, 300); // short fade-out before next
  }

  const current = quotes[index % quotes.length];

  return (
    <div className="w-full p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm text-center select-none transition-all duration-300 ease-out-quart">
      <div
        className={`transition-opacity duration-700 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-lg md:text-xl font-[Playfair_Display] text-[#2E2A26] leading-relaxed">
          “{current.text}”
        </p>
        <p className="mt-3 text-sm text-[#7E7A74] font-[Inter] tracking-wide">
          — {current.author}
        </p>
      </div>

      <button
        onClick={handleNext}
        aria-label="Show another quote"
        className="mt-4 text-[#9EC3B0] hover:text-[#7BA894] transition-colors duration-300 text-sm"
      >
        ↻ new quote
      </button>
    </div>
  );
}
