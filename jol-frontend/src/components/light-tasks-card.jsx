/**
 * Journey of Life — Light Tasks (Smart, Bubble, Tiny Toggle)
 * ----------------------------------------------------------
 * • Picks up to 3 gentle tasks:
 *    1) Highlights planned for today (status !== "done")
 *    2) Habits not done today (sorted by longest since last_checked)
 * • Bubble style on the right (user voice)
 * • Tiny circle button to confirm (reduces accidental taps)
 * • Skip hides item for now (no DB change)
 * • English only
 */

import { useEffect, useMemo, useState } from "react";
import {
  fetchHabits,
  toggleHabit,
  fetchHighlights,
  toggleHighlight,
} from "../utils/api";

const shell = "p-5 rounded-2xl bg-white border border-[#E8E1DA] shadow-sm";
const subtitle = "text-sm text-[#7E7A74]";
const todayISO = () => new Date().toISOString().split("T")[0];

function daysSince(dateStr) {
  if (!dateStr) return 9999;
  const a = new Date(dateStr);
  const b = new Date();
  const diff = Math.floor((b - a) / 86400000);
  return Number.isFinite(diff) ? diff : 9999;
}

export default function LightTasksCard() {
  const [habits, setHabits] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState([]); // ["habit-1","hl-3"]

  async function load() {
    setLoading(true);
    const [h, hl] = await Promise.all([fetchHabits(), fetchHighlights()]);
    setHabits(Array.isArray(h) ? h : []);
    setHighlights(Array.isArray(hl) ? hl : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // --- Build smart candidates ------------------------------------------------
  const tasks = useMemo(() => {
    const today = todayISO();

    // 1) Highlights planned for today (or without date but not done)
    const planned = highlights
      .filter((x) => x.status !== "done")
      .filter((x) => {
        if (x.planned_date) return x.planned_date.startsWith(today);
        // no planned_date: de-prioritize later, but still eligible
        return true;
      })
      .map((x) => ({
        id: `hl-${x.id}`,
        type: "highlight",
        rawId: x.id,
        title: x.text,
        weight: x.planned_date?.startsWith(today) ? 100 : 60, // today first
      }));

    // 2) Habits not done today
    const habitCandidates = habits
      .filter((h) => h.last_checked !== today)
      .map((h) => ({
        id: `habit-${h.id}`,
        type: "habit",
        rawId: h.id,
        title: h.title,
        weight: 50 + Math.min(40, daysSince(h.last_checked || "")), // longer gap => higher weight
      }));

    // Merge, remove skipped, sort by weight desc, take first 3
    return [...planned, ...habitCandidates]
      .filter((t) => !skipped.includes(t.id))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }, [habits, highlights, skipped]);

  // --- Actions ---------------------------------------------------------------
  async function handleConfirm(task) {
    if (task.type === "habit") {
      await toggleHabit(task.rawId);
    } else {
      // Toggle highlight planned -> done
      await toggleHighlight(task.rawId);
    }
    load();
  }

  function handleSkip(task) {
    setSkipped((prev) => (prev.includes(task.id) ? prev : [...prev, task.id]));
  }

  // --- UI --------------------------------------------------------------------
  return (
    <section className={shell}>
      <h2 className="font-semibold mb-2">3 Light Tasks for Now</h2>
      <p className={subtitle}>Tiny steps that gently help today.</p>

      {loading ? (
        <div className="mt-3 text-sm opacity-70">Loading…</div>
      ) : tasks.length === 0 ? (
        <p className="mt-3 text-sm italic text-[#7E7A74]">
          You’re all set for now.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-end gap-2">
              {/* tiny confirm button (separate from bubble to avoid mis-tap) */}
              <button
                aria-label="mark done"
                title="Mark done"
                onClick={() => handleConfirm(t)}
                className="shrink-0 w-6 h-6 rounded-full border border-[#E8E1DA] bg-white grid place-items-center hover:shadow-sm transition"
              >
                <span className="block w-2.5 h-2.5 rounded-full bg-[#9EC3B0]" />
              </button>

              {/* bubble (right aligned) */}
              <div className="ml-auto max-w-[85%]">
                <div
                  className="relative px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm text-sm animate-[fadeIn_220ms_ease-out]"
                  style={{ willChange: "transform" }}
                >
                  <div className="pr-8 leading-relaxed">{t.title}</div>

                  {/* top-right skip */}
                  <button
                    onClick={() => handleSkip(t)}
                    className="absolute top-1.5 right-1.5 text-[11px] px-2 py-0.5 rounded-full border border-[#E8E1DA] text-[#7E7A74] hover:bg-white"
                    aria-label="skip for now"
                    title="Skip for now"
                  >
                    skip
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </section>
  );
}
