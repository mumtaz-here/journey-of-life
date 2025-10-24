/**
 * Journey of Life — Page: HabitPlan
 * ---------------------------------
 * Weekly plan for cozy consistency.
 * - Matrix of habits (rows) × days (cols)
 * - Soft toggles, auto-save to localStorage
 * - Minimal, breathable UI matching Playful Serenity
 */

import React, { useEffect, useMemo, useState } from "react";
import { load, save } from "../../utils/storage";

const container =
  "max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26]";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitPlan() {
  const [habits, setHabits] = useState(() => load("habits-plan") || []);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    save("habits-plan", habits);
  }, [habits]);

  function addHabit(e) {
    e?.preventDefault?.();
    const title = (newTitle || "").trim();
    if (!title) return;
    setHabits([
      ...habits,
      { id: Date.now(), title, days: Array(7).fill(false), note: "" },
    ]);
    setNewTitle("");
  }

  function removeHabit(id) {
    setHabits(habits.filter((h) => h.id !== id));
  }

  function toggleDay(id, dayIdx) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, days: h.days.map((v, i) => (i === dayIdx ? !v : v)) }
          : h
      )
    );
  }

  function updateTitle(id, title) {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, title } : h)));
  }

  const completion = useMemo(() => {
    const total = habits.length * 7 || 1;
    const done = habits.reduce((s, h) => s + h.days.filter(Boolean).length, 0);
    return { total, done, pct: +(done / total).toFixed(2) };
  }, [habits]);

  return (
    <main className={container}>
      <header>
        <h1 className="text-2xl font-[Playfair_Display] mb-1">Habit Plan</h1>
        <p className="text-sm text-[#7E7A74]">
          A gentle weekly planner — small boxes, steady pace.
        </p>
      </header>

      {/* Summary bar */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-[#E8E1DA] overflow-hidden">
            <div
              className="h-full bg-[#9EC3B0] transition-all duration-500"
              style={{ width: `${completion.pct * 100}%` }}
            />
          </div>
          <span className="text-sm text-[#7E7A74] min-w-[120px] text-right">
            {completion.done} / {completion.total} checks
          </span>
        </div>
      </section>

      {/* Add habit */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm p-4">
        <form onSubmit={addHabit} className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a habit (e.g., Morning stretch)"
            className="flex-1 rounded-xl px-3 py-2 bg-white/60 border border-[#E8E1DA] focus:outline-none focus:border-[#CBB9A8] text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[#CBB9A8]/90 text-[#FAF7F2] text-sm hover:bg-[#CBB9A8] transition-all"
          >
            Add
          </button>
        </form>
      </section>

      {/* Grid */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EDE7E0]/60">
              <th className="text-left p-3 w-1/3">Habit</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 font-normal text-[#7E7A74]">
                  {d}
                </th>
              ))}
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 && (
              <tr>
                <td colSpan={DAYS.length + 2} className="p-4 text-center text-[#7E7A74] italic">
                  Add your first habit above.
                </td>
              </tr>
            )}

            {habits.map((h) => (
              <tr key={h.id} className="border-t border-[#E8E1DA] hover:bg-white/30">
                <td className="p-3">
                  <input
                    value={h.title}
                    onChange={(e) => updateTitle(h.id, e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-[#CBB9A8] focus:outline-none"
                  />
                </td>
                {h.days.map((v, i) => (
                  <td key={i} className="p-3 text-center">
                    <button
                      onClick={() => toggleDay(h.id, i)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 border ${
                        v
                          ? "bg-[#9EC3B0] border-[#9EC3B0] text-white"
                          : "bg-white/60 border-[#E8E1DA] text-[#7E7A74] hover:bg-white"
                      }`}
                      aria-pressed={v}
                    >
                      {v ? "✓" : ""}
                    </button>
                  </td>
                ))}
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeHabit(h.id)}
                    className="text-[#7E7A74] hover:text-[#F2B8A2] transition-colors"
                    aria-label="Remove habit"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
