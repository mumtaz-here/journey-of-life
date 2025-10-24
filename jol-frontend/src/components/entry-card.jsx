/**
 * Journey of Life — Component: EntryCard
 * --------------------------------------
 * Compact, mindful display for a single journal entry.
 * Used in: My Journey, Summary, Highlights.
 *
 * Design philosophy:
 * - Large whitespace, rounded corners, soft tone.
 * - Show essence, not overload: mood + keywords + preview.
 * - Calm hover animation (slight lift + shadow shift).
 */

import React from "react";

export default function EntryCard({ entry, onClick }) {
  if (!entry) return null;

  const { text, created_at, analysis } = entry;
  const mood = analysis?.emotion?.primary || "—";
  const keywords = analysis?.keywords || [];
  const date = new Date(created_at).toLocaleString();

  return (
    <article
      onClick={onClick}
      className="cursor-pointer group p-5 rounded-2xl border border-[#E8E1DA] bg-[#FAF7F2] shadow-sm hover:shadow-md hover:bg-[#EDE7E0]/50 transition-all duration-300 ease-out-quart"
    >
      <p className="text-sm text-[#2E2A26] leading-relaxed line-clamp-4">
        {text}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-[#7E7A74]">
        <span className="italic">{date}</span>
        <span className="text-[#9EC3B0] font-medium">mood: {mood}</span>
      </div>

      {keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {keywords.slice(0, 5).map((k, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-[#9EC3B0]/20 text-[#2E2A26] text-[11px] font-medium tracking-wide"
            >
              #{k}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
