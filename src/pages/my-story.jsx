/**
 * Journey of Life — My Story (API connected, 3rd-person weekly narrative)
 * -----------------------------------------------------------------------
 * - Lists saved weekly stories (latest first)
 * - One-click "Generate this week" → calls /api/reflections/generate
 * - English-only copy
 */

import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";
const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function MyStory() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStories(); }, []);

  async function fetchStories() {
    const res = await fetch(`${API}/reflections`);
    const data = await res.json();
    setStories(data); // already ordered desc by created_at
  }

  async function generateThisWeek() {
    try {
      setLoading(true);
      await fetch(`${API}/reflections/generate`, { method: "POST" });
      await fetchStories();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={container}>
      {/* Header */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">My Story</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          A weekly third-person narrative drawn from your real entries, plans, and habits.
        </p>
      </section>

      {/* Actions */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Weekly Narrative</h3>
          <button
            onClick={generateThisWeek}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              loading ? "bg-[#CBB9A8]/50 cursor-not-allowed" : "bg-[#9EC3B0] hover:bg-[#86b7a0]"
            }`}
          >
            {loading ? "Generating…" : "Generate this week"}
          </button>
        </div>
        <p className="text-xs text-[#7E7A74] mt-1">
          Stories reflect exactly what you wrote — in English — without judgment.
        </p>
      </section>

      {/* Stories list */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft whitespace-pre-line">
        {stories.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">No stories yet — write a little, then generate.</p>
        ) : (
          <ul className="space-y-4">
            {stories.map((s) => (
              <li key={s.id} className="p-4 rounded-xl bg-white border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Week {s.week}</h4>
                  <span className="text-xs text-[#7E7A74]">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#2E2A26]/90 mt-2">
                  {s.narrative}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
