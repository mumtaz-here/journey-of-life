/**
 * Journey of Life — Page: HabitInsight
 * ------------------------------------
 * Reflective page to show patterns in habit completion.
 * Calm visualization + text reflection (non-gamified, mindful tone).
 *
 * Features:
 * - Summaries: completion rate by day
 * - Highlights: most/least consistent habits
 * - Gentle textual insight (no judgment)
 */

import React, { useEffect, useState, useMemo } from "react";
import { load } from "../../utils/storage";

const container =
  "max-w-3xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitInsight() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const data = load("habits-plan") || [];
    setHabits(data);
  }, []);

  const stats = useMemo(() => {
    if (habits.length === 0) return null;

    const byDay = Array(7).fill(0);
    const byHabit = habits.map((h) => ({ title: h.title, done: 0 }));
    let total = 0;

    habits.forEach((h, hi) => {
      h.days.forEach((done, di) => {
        if (done) {
          byDay[di]++;
          byHabit[hi].done++;
          total++;
        }
      });
    });

    const totalSlots = habits.length * 7;
    const rate = +(total / totalSlots).toFixed(2);
    const bestHabit = byHabit.reduce((a, b) => (a.done > b.done ? a : b), byHabit[0]);
    const weakHabit = byHabit.reduce((a, b) => (a.done < b.done ? a : b), byHabit[0]);

    return { byDay, byHabit, rate, bestHabit, weakHabit };
  }, [habits]);

  if (!stats) {
    return (
      <main className={container}>
        <h1 className="text-2xl font-[Playfair_Display] mb-1">Habit Insights</h1>
        <p className="text-sm text-[#7E7A74] italic">
          Insights will appear once you start tracking habits.
        </p>
      </main>
    );
  }

  const tone =
    stats.rate > 0.7
      ? "Your rhythm feels steady — most days show gentle follow-through."
      : stats.rate > 0.4
      ? "There’s movement, though some days drift quietly by."
      : "It’s okay to rest — awareness is the first habit of all.";

  return (
    <main className={container}>
      <h1 className="text-2xl font-[Playfair_Display] mb-1">Habit Insights</h1>
      <p className="text-sm text-[#7E7A74] mb-4">
        Calm reflections on your weekly pattern.
      </p>

      {/* Overall completion */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">Overall</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-[#E8E1DA] overflow-hidden">
            <div
              className="h-full bg-[#9EC3B0] transition-all duration-500"
              style={{ width: `${stats.rate * 100}%` }}
            />
          </div>
          <span className="text-sm text-[#7E7A74]">
            {(stats.rate * 100).toFixed(0)}%
          </span>
        </div>
      </section>

      {/* By day */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Days Overview</h2>
        <div className="grid grid-cols-7 gap-2 text-center">
          {stats.byDay.map((v, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#EDE7E0]/40 hover:bg-[#E8E1DA]/70 transition-all duration-200"
            >
              <p className="font-medium text-sm text-[#2E2A26]">{DAYS[i]}</p>
              <p className="text-[#7E7A74] text-xs">{v} done</p>
            </div>
          ))}
        </div>
      </section>

      {/* Habit comparison */}
      <section className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Highlights</h2>
        <div className="space-y-1 text-sm">
          <p>
            🌿 Most consistent: <strong>{stats.bestHabit.title}</strong> ({
              stats.bestHabit.done
            }/7)
          </p>
          <p>
            ☁️ Needs gentler attention: <strong>{stats.weakHabit.title}</strong> ({
              stats.weakHabit.done
            }/7)
          </p>
        </div>
      </section>

      {/* Reflection text */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm text-center">
        <p className="text-sm italic text-[#2E2A26] max-w-md mx-auto leading-relaxed">
          {tone}
        </p>
      </section>
    </main>
  );
}