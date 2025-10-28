/**
 * Journey of Life — Today's Plans (Bubble Left)
 * --------------------------------------------
 * • Highlights planned for today only
 * • Bubble left: future intention inviting the user
 * • Tiny dot icon for marking done (same logic as Light Tasks)
 * • Calm motion & microcopy
 */

import { useEffect, useMemo, useState } from "react";
import { fetchHighlights, toggleHighlight } from "../utils/api";

const shell = "p-5 rounded-2xl bg-white border border-[#E8E1DA] shadow-sm";
const subtitle = "text-sm text-[#7E7A74]";
const todayISO = () => new Date().toISOString().split("T")[0];

export default function TodayPlansCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  async function load() {
    setLoading(true);
    const data = await fetchHighlights();
    const onlyToday = (Array.isArray(data) ? data : []).filter(
      (h) => h.planned_date?.startsWith(today) && h.status !== "done"
    );
    setItems(onlyToday);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markDone(rawId) {
    await toggleHighlight(rawId);
    load();
  }

  return (
    <section className={shell}>
      <h2 className="font-semibold mb-2">Today's Plans</h2>
      <p className={subtitle}>Small intentions guiding your day.</p>

      {loading ? (
        <div className="mt-3 text-sm opacity-70">Loading…</div>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm italic text-[#7E7A74]">
          No plans set for today 🤍
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex items-end gap-2">
              {/* bubble on the LEFT */}
              <div className="mr-auto max-w-[85%]">
                <div
                  className="relative px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm text-sm animate-[fadeIn_220ms_ease-out]"
                  style={{ willChange: "transform" }}
                  title="A gentle intention for today"
                >
                  <div className="leading-relaxed pr-8">{p.text}</div>

                  {/* tiny skip icon (X) */}
                  <button
                    onClick={() =>
                      setItems((prev) => prev.filter((i) => i.id !== p.id))
                    }
                    className="absolute top-1.5 right-1.5 text-[11px] px-2 py-0.5 rounded-full border border-[#E8E1DA] text-[#7E7A74] hover:bg-white"
                  >
                    skip
                  </button>
                </div>
              </div>

              {/* tiny confirm dot */}
              <button
                aria-label="mark as done"
                title="Mark as done"
                onClick={() => markDone(p.id)}
                className="shrink-0 w-6 h-6 rounded-full border border-[#E8E1DA] bg-white grid place-items-center hover:shadow-sm transition"
              >
                <span className="block w-2.5 h-2.5 rounded-full bg-[#9EC3B0]" />
              </button>
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
