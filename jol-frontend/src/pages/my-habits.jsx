/**
 * Journey of Life — My Habits (Bubble Style • Option 2)
 * -----------------------------------------------------
 * - All bubbles on the right (user voice)
 * - "Done today" indicated by a tiny green dot on the left
 * - Calm motion (fade + lift), soft colors, planner-first
 * - Backend: GET /habits, POST /habits, PATCH /habits/:id/toggle
 */

import { useEffect, useState, useMemo } from "react";

const shell =
  "max-w-2xl mx-auto px-5 py-8 text-[#2E2A26] bg-[#FAF7F2] min-h-screen";
const card =
  "rounded-2xl bg-white border border-[#E8E1DA] shadow-sm";

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function MyHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = "http://journey-of-life-production-e8af.up.railway.app/api/habits";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setHabits([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const todayKey = useMemo(() => isoToday(), []);
  const hasData = habits.length > 0;

  async function onToggle(id) {
    try {
      await fetch(`${BASE_URL}/${id}/toggle`, { method: "PATCH" });
      load();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  }

  async function onSubmit(e) {
    e?.preventDefault?.();
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.trim() }),
      });
      setDraft("");
      load();
    } catch (err) {
      console.error("Submit error:", err);
    }
    setSubmitting(false);
  }

  return (
    <main className={shell}>
      {/* Header */}
      <section className={`${card} px-5 py-4 mb-6`}>
        <h1 className="text-lg font-semibold tracking-tight">My Habits</h1>
        <p className="text-sm text-[#7E7A74] mt-1">
          Gentle rhythm to support your day.
        </p>
      </section>

      {/* Bubble list */}
      <section className="space-y-3 mb-24">
        {loading && (
          <div className="text-center text-sm opacity-70">Loading…</div>
        )}

        {!loading && !hasData && (
          <div className={`${card} px-4 py-3 text-sm text-center text-[#7E7A74]`}>
            No habits yet. Add one below to begin.
          </div>
        )}

        {!loading &&
          habits.map((h) => {
            const doneToday = h.last_checked?.startsWith(todayKey);
            return (
              <div
                key={h.id}
                className="flex items-end gap-2 animate-[fadeIn_220ms_ease-out] will-change-transform"
              >
                {/* tiny status dot on the LEFT */}
                <button
                  aria-label={doneToday ? "done today" : "not done yet"}
                  onClick={() => onToggle(h.id)}
                  className={`shrink-0 w-2.5 h-2.5 rounded-full translate-y-1 transition
                    ${doneToday ? "bg-[#9EC3B0]" : "bg-[#E8E1DA]"}`}
                  title={doneToday ? "Done today" : "Tap to mark done"}
                />

                {/* bubble on the RIGHT */}
                <div className="ml-auto max-w-[85%]">
                  <button
                    onClick={() => onToggle(h.id)}
                    className={`text-left w-full ${card} px-4 py-2.5 transition
                      hover:shadow-md hover:-translate-y-[1px]
                      ${doneToday ? "opacity-75" : "opacity-100"}`}
                  >
                    <div className="text-sm leading-relaxed">{h.title}</div>
                    {doneToday && (
                      <div className="mt-1 text-[11px] text-[#7E7A74]">
                        marked today
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </section>

      {/* Chat-style input bar (sticky bottom) */}
      <form
        onSubmit={onSubmit}
        className="fixed bottom-0 left-0 right-0 border-t border-[#E8E1DA] bg-[#FAF7F2]/90 backdrop-blur supports-[backdrop-filter]:bg-[#FAF7F2]/70"
      >
        <div className="mx-auto max-w-2xl px-5 py-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a gentle habit…"
            className="flex-1 bg-white border border-[#E8E1DA] rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#CBB9A8]"
          />
          <button
            disabled={!draft.trim() || submitting}
            className="px-4 py-2 rounded-xl text-sm text-white bg-[#9EC3B0] disabled:opacity-50 hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </form>

      {/* keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </main>
  );
}
