/**
 * Journey of Life — Page: My Story
 * --------------------------------
 * Generates a gentle weekly narrative from recent reflections.
 * Feels like reading your own story softly written on paper.
 */

import React, { useEffect, useState } from "react";
import { load } from "../utils/storage";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function MyStory() {
  const [story, setStory] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const saved = load("entries") || [];
    setEntries(saved);
    generateStory(saved);
  }, []);

  function generateStory(list) {
    if (list.length === 0) {
      setStory("There are no reflections yet — your story is waiting to be written.");
      return;
    }

    const allText = list.slice(0, 7).map((e) => e.text).join(" ");
    const total = allText.split(" ").length;
    const moodCount = list.reduce((acc, e) => {
      const m = e.analysis?.mood || "neutral";
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});

    const dominant = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0];

    const reflections = [
      "You’ve been walking through quiet changes — noticing, adjusting, breathing.",
      "There’s a sense of steadiness forming beneath everything you write.",
      "Some days felt heavier, but you still showed up — and that’s a story in itself.",
      "You’ve spoken with warmth, even when things were uncertain.",
      "Small realizations kept appearing between your words.",
    ];

    const base = reflections[Math.floor(Math.random() * reflections.length)];
    const summary =
      dominant === "calm"
        ? "Overall, you’ve been grounded — letting peace find its way into your rhythm."
        : dominant === "sad"
        ? "It seems you’ve been carrying softness and longing lately. Be kind to that part of you."
        : dominant === "happy"
        ? "Joy has quietly threaded through your week — gentle, not loud."
        : "Your reflections show subtle transitions — learning to stay with what is.";

    setStory(`${base} ${summary} (${total} words this week.)`);
  }

  return (
    <main className={container}>
      {/* 🪞 Header */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">My Story</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          Your weekly narrative, softly written from your reflections.
        </p>
      </section>

      {/* 📜 Narrative */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft whitespace-pre-line animate-fadeIn">
        <p className="text-sm leading-relaxed text-[#2E2A26]/90 font-[Cormorant_Garamond]">
          {story}
        </p>
      </section>
    </main>
  );
}
