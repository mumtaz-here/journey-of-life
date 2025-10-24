/**
 * Journey of Life — Page: Highlights
 * ----------------------------------
 * A cozy archive of meaningful events or moments.
 * Each highlight has text, date, and gentle status (done / ongoing / wish).
 */

import React, { useEffect, useState } from "react";
import { load, save } from "../utils/storage";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Highlights() {
  const [highlights, setHighlights] = useState(() => load("highlights") || []);

  useEffect(() => {
    save("highlights", highlights);
  }, [highlights]);

  function addHighlight() {
    const text = prompt("Write a moment you’d like to remember:");
    if (!text || !text.trim()) return;

    const newHighlight = {
      id: Date.now(),
      text: text.trim(),
      status: "ongoing",
      date: new Date().toISOString(),
    };
    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    save("highlights", updated);
  }

  function toggleStatus(id) {
    const updated = highlights.map((h) =>
      h.id === id
        ? {
            ...h,
            status:
              h.status === "ongoing"
                ? "done"
                : h.status === "done"
                ? "wish"
                : "ongoing",
          }
        : h
    );
    setHighlights(updated);
    save("highlights", updated);
  }

  function removeHighlight(id) {
    if (confirm("Remove this highlight?")) {
      const updated = highlights.filter((h) => h.id !== id);
      setHighlights(updated);
      save("highlights", updated);
    }
  }

  const statusColors = {
    done: "bg-[#9EC3B0]/40 text-[#2E2A26]",
    ongoing: "bg-[#CBB9A8]/30 text-[#2E2A26]",
    wish: "bg-[#F2B8A2]/40 text-[#2E2A26]",
  };

  const statusLabel = {
    done: "✨ done",
    ongoing: "🌿 ongoing",
    wish: "💭 wish",
  };

  return (
    <main className={container}>
      {/* 🪞 Header */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">Highlights</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          Keep small moments that make you feel grateful or alive.
        </p>
      </section>

      {/* 🌸 Highlights List */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Moments Archive</h3>
          <button
            onClick={addHighlight}
            className="text-sm text-[#7E7A74] hover:text-[#2E2A26] transition-all duration-200"
          >
            + Add
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Nothing added yet. Every little good thing counts.
          </p>
        ) : (
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li
                key={h.id}
                className="p-3 rounded-xl bg-[#EDE7E0]/40 hover:bg-[#EDE7E0]/70 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm leading-relaxed w-[80%]">{h.text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(h.id)}
                      className={`text-xs px-3 py-1 rounded-full ${statusColors[h.status]} transition-all duration-200`}
                    >
                      {statusLabel[h.status]}
                    </button>
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="text-[#7E7A74] hover:text-[#F2B8A2] text-sm transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#7E7A74] mt-1">
                  {new Date(h.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🌿 Gentle Insight */}
      {highlights.length > 0 && (
        <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
          <h3 className="text-lg font-semibold mb-3">Gentle Reflection</h3>
          <p className="text-sm leading-relaxed text-[#2E2A26]/90">
            You’ve recorded{" "}
            <span className="font-medium text-[#9EC3B0]">
              {highlights.length}
            </span>{" "}
            meaningful {highlights.length === 1 ? "moment" : "moments"} so far.
            Keep noticing what brings you quiet joy — sometimes that’s the real
            progress.
          </p>
        </section>
      )}
    </main>
  );
}
