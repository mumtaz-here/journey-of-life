/**
 * Journey of Life — My Habits v1 (FULL)
 * -------------------------------------
 * Features:
 * ✅ Daily habits checklist (toggle)
 * ✅ Smart suggestions placeholder
 * ✅ Recap of habits done recently
 * ✅ Calm UI matching HOME + My Journey
 *
 * Notes:
 * - Every checkbox → logs habit event to backend
 * - Keeps experience planner-focused & warm
 */

import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";
const card =
  "p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft";
const heading = "heading mb-1";
const subtext = "text-sm text-[#7E7A74]";

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function HabitMain() {
  const [habits, setHabits] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchHabits();
    fetchRecent();
    fetchSuggestions();
  }, []);

  async function fetchHabits() {
    const res = await fetch(`${API}/habits`);
    const data = await res.json();
    setHabits(data);
  }

  async function fetchRecent() {
    const res = await fetch(`${API}/habits/recent`);
    const data = await res.json();
    setRecent(data);
  }

  async function fetchSuggestions() {
    const res = await fetch(`${API}/habits/suggestions`);
    const data = await res.json();
    setSuggested(data);
  }

  async function toggle(id) {
    await fetch(`${API}/habits/${id}/toggle`, { method: "PATCH" });
    fetchHabits();
    fetchRecent();
  }

  return (
    <main className={container}>
      {/* Header */}
      <section className={card}>
        <h1 className="heading text-[1.35rem]">My Habits</h1>
        <p className={subtext}>
          Gentle structure to care for your everyday rhythm.
        </p>
      </section>

      {/* Daily habits */}
      <section className={`${card} space-y-3`}>
        <h2 className={heading}>Today</h2>
        <p className={subtext}>
          Tiny consistent actions build a grounded life.
        </p>

        {habits.length === 0 ? (
          <p className="text-sm italic text-[#7E7A74] mt-2">
            You haven’t set any habits yet.
          </p>
        ) : (
          <ul className="space-y-2 mt-2">
            {habits.map((h) => (
              <li
                key={h.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border ${
                  h.last_checked?.startsWith(isoToday()) ? "opacity-70" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={h.last_checked?.startsWith(isoToday())}
                  onChange={() => toggle(h.id)}
                  className="accent-[#9EC3B0]"
                />
                <span className="text-sm">{h.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Suggestions */}
      <section className={`${card} space-y-3`}>
        <h2 className={heading}>Recommended</h2>
        <p className={subtext}>
          Based on things you often mention or seem to care about.
        </p>

        {suggested.length === 0 ? (
          <p className="text-sm italic text-[#7E7A74] mt-2">
            No suggestions yet — keep writing in My Journey 🤍
          </p>
        ) : (
          <ul className="space-y-2 mt-2">
            {suggested.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border"
              >
                <span className="text-sm">{s.title}</span>
                <button className="text-xs px-3 py-1 rounded-lg bg-[#CBB9A8] text-white hover:bg-[#b9a088]">
                  add
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Recap */}
      <section className={`${card} space-y-3`}>
        <h2 className={heading}>Recent Activity</h2>

        {recent.length === 0 ? (
          <p className="text-sm italic text-[#7E7A74] mt-2">
            Nothing tracked yet — that’s okay 🤍
          </p>
        ) : (
          <ul className="space-y-2 mt-2">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#9EC3B0]" />
                <span className="text-sm">
                  {r.title} — {new Date(r.last_checked).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
