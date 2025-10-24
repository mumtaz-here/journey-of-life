/**
 * Journey of Life — Page: Habits Main
 * -----------------------------------
 * Shows cozy daily rhythm & streaks for small consistent actions.
 */

import React, { useEffect, useState } from "react";
import { load, save } from "../../utils/storage";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function HabitMain() {
  const [habits, setHabits] = useState(() => load("habits") || []);

  useEffect(() => {
    save("habits", habits);
  }, [habits]);

  function addHabit() {
    const title = prompt("Add a habit to track:");
    if (title && title.trim()) {
      const newHabit = {
        id: Date.now(),
        title: title.trim(),
        streak: 0,
        lastChecked: null,
      };
      const updated = [...habits, newHabit];
      setHabits(updated);
      save("habits", updated);
    }
  }

  function toggleHabit(id) {
    const today = new Date().toDateString();
    const updated = habits.map((h) => {
      if (h.id === id) {
        const isSameDay = h.lastChecked === today;
        return {
          ...h,
          lastChecked: isSameDay ? null : today,
          streak: isSameDay ? h.streak - 1 : h.streak + 1,
        };
      }
      return h;
    });
    setHabits(updated);
    save("habits", updated);
  }

  function removeHabit(id) {
    if (confirm("Remove this habit?")) {
      const updated = habits.filter((h) => h.id !== id);
      setHabits(updated);
      save("habits", updated);
    }
  }

  return (
    <main className={container}>
      {/* 🪞 Header */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">Daily Rhythm</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          Gentle consistency builds quiet strength.
        </p>
      </section>

      {/* 🌿 Habit List */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Habits</h3>
          <button
            onClick={addHabit}
            className="text-sm text-[#7E7A74] hover:text-[#2E2A26] transition-all duration-200"
          >
            + Add
          </button>
        </div>

        {habits.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Add small habits that anchor your days.
          </p>
        ) : (
          <ul className="space-y-3">
            {habits.map((h) => (
              <li
                key={h.id}
                className="p-3 rounded-xl bg-[#EDE7E0]/40 hover:bg-[#EDE7E0]/70 transition-all duration-300 flex items-center justify-between"
              >
                <span className="text-sm">{h.title}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      h.lastChecked
                        ? "bg-[#9EC3B0]/50 text-[#2E2A26]"
                        : "bg-[#CBB9A8]/40 text-[#7E7A74]"
                    }`}
                  >
                    {h.lastChecked ? "✓ done" : "mark"}
                  </button>
                  <span className="text-xs text-[#7E7A74]">
                    🔁 {h.streak} day{h.streak !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => removeHabit(h.id)}
                    className="text-[#7E7A74] hover:text-[#F2B8A2] text-sm transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🌸 Reflection */}
      {habits.length > 0 && (
        <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
          <h3 className="text-lg font-semibold mb-3">Reflection</h3>
          <p className="text-sm leading-relaxed text-[#2E2A26]/90">
            You’re nurturing{" "}
            <span className="font-medium text-[#9EC3B0]">
              {habits.length}
            </span>{" "}
            habits right now — remember, showing up matters more than perfection.
          </p>
        </section>
      )}
    </main>
  );
}
