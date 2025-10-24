/**
 * Journey of Life — Page: Summary
 * -------------------------------
 * Displays gentle insights based on journal entries:
 * - Mood average
 * - Frequent words
 * - Reflection insight
 */

import React, { useEffect, useState } from "react";
import { load } from "../utils/storage";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Summary() {
  const [entries, setEntries] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    const saved = load("entries") || [];
    setEntries(saved);

    // Extract data for chart
    const moodMap = {};
    const wordCount = {};

    saved.forEach((e) => {
      const a = e.analysis || {};
      const mood = a.mood || "neutral";
      moodMap[mood] = (moodMap[mood] || 0) + 1;

      (a.keywords || []).forEach((w) => {
        wordCount[w] = (wordCount[w] || 0) + 1;
      });
    });

    const moodArr = Object.keys(moodMap).map((m) => ({
      mood: m,
      count: moodMap[m],
    }));

    const keyArr = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => ({ word: k, count: v }));

    setMoodData(moodArr);
    setKeywords(keyArr);
  }, []);

  const mostCommonMood = moodData.reduce(
    (a, b) => (a.count > b.count ? a : b),
    { mood: "neutral", count: 0 }
  );

  return (
    <main className={container}>
      {/* 🪞 Overview */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">Weekly Reflection</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          A calm glance at your recent emotional patterns and key themes.
        </p>
      </section>

      {/* 🌤️ Mood Summary Chart */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Mood Landscape</h3>
        {moodData.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Not enough entries yet for a summary.
          </p>
        ) : (
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData}>
                <XAxis
                  dataKey="mood"
                  stroke="#7E7A74"
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    border: "1px solid #E8E1DA",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#2E2A26",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#9EC3B0"
                  radius={[10, 10, 0, 0]}
                  animationDuration={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 🪶 Keyword Summary */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Frequent Words</h3>
        {keywords.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Words will appear as you keep writing.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li
                key={k.word}
                className="px-3 py-1 rounded-full text-sm bg-[#E8E1DA]/70 text-[#2E2A26] hover:bg-[#E8E1DA] transition-all duration-300"
              >
                {k.word}
                <span className="ml-1 text-[#7E7A74] text-xs">×{k.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🌷 Insight */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Gentle Insight</h3>
        {entries.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Write a few reflections to reveal your patterns.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-[#2E2A26]/90">
            You’ve mostly felt{" "}
            <span className="font-medium text-[#9EC3B0]">
              {mostCommonMood.mood}
            </span>
            {" "}recently — notice how your words often return to{" "}
            <span className="font-medium text-[#CBB9A8]">
              {keywords[0]?.word || "something simple"}
            </span>
            . Maybe it’s quietly asking for your attention.
          </p>
        )}
      </section>
    </main>
  );
}
