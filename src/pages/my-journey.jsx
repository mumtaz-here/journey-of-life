/**
 * Journey of Life — Page: My Journey (v6.1 FINAL POLISHED)
 * --------------------------------------------------------
 * - Summary: calm 1-paragraph reflection
 * - Highlights: chat-style bubbles with date separators
 * - Progress: streak, weekly trend, daily avg, best day
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchEntries as apiFetchEntries,
  fetchHighlights as apiFetchHighlights,
  fetchSummaries as apiFetchSummaries,
} from "../utils/api";

const container =
  "max-w-2xl mx-auto px-4 py-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen flex flex-col gap-4";
const card =
  "bg-white border border-[#E8E1DA] rounded-2xl shadow-sm";
const title = "text-lg font-semibold";
const sub = "text-sm opacity-70";

export default function MyJourney() {
  const [tab, setTab] = useState("summary");
  const tabs = ["summary", "highlights", "progress"];

  return (
    <main className={container}>
      <header className="text-center">
        <h1 className="text-xl font-semibold">My Journey</h1>
        <p className={sub}>Results & reflections from your writings</p>
      </header>

      <nav className="flex items-center justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm capitalize border transition ${
              tab === t
                ? "bg-[#2E2A26] text-white border-[#2E2A26]"
                : "bg-white text-[#2E2A26] border-[#E8E1DA] hover:bg-[#F2ECE6]"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "summary" && <SummaryPanel />}
      {tab === "highlights" && <HighlightsPanel />}
      {tab === "progress" && <ProgressPanel />}
    </main>
  );
}

/* ===================================
   SUMMARY PANEL (Calm)
=================================== */
function SummaryPanel() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSummaries() {
    try {
      const data = (await apiFetchSummaries()) || [];
      data.sort((a, b) => new Date(a.summary_date) - new Date(b.summary_date));
      setSummaries(data);
    } catch (err) {
      console.error("❌ Failed to fetch summaries:", err);
    } finally {
      setLoading(false);
    }
  }

  async function backfill() {
    try {
      await fetch("http://localhost:5000/api/summaries/backfill", {
        method: "POST",
      });
      await fetchSummaries();
    } catch (err) {
      console.error("⚠️ Backfill failed:", err);
    }
  }

  useEffect(() => {
    fetchSummaries();
    backfill();
  }, []);

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Summary</h2>
      <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto mt-2">
        {loading && (
          <p className="text-sm italic text-[#8C7F78] text-center mt-4">
            Loading summaries…
          </p>
        )}
        {!loading &&
          summaries.map((s) => (
            <div key={s.summary_date} className="flex flex-col items-start">
              <div className="self-center bg-[#D8CFC5] text-white text-xs px-3 py-1 rounded-full mb-1">
                {new Date(s.summary_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="max-w-[85%] bg-[#F9F5F0] border border-[#E8E1DA] rounded-2xl px-4 py-3 text-left text-[#2E2A26] leading-relaxed whitespace-pre-wrap">
                {s.summary_text}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

/* ===================================
   HIGHLIGHTS PANEL (Telegram Style)
=================================== */
function HighlightsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const didRunRef = useRef(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!didRunRef.current) {
        didRunRef.current = true;
        // optional backfill (silent)
        await fetch("http://localhost:5000/api/highlights/backfill", {
          method: "POST",
        }).catch(() => {});
      }
      const data = (await apiFetchHighlights()) || [];
      data
        .filter((h) => h.text?.trim()?.length > 3)
        .sort(
          (a, b) =>
            new Date(a.planned_date || a.created_at) -
            new Date(b.planned_date || b.created_at)
        );
      setItems(data);
      setLoading(false);
    })();
  }, []);

  // group by date
  const grouped = useMemo(() => {
    const groups = {};
    for (const h of items) {
      const key = (h.planned_date || h.created_at).slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(h);
    }
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [items]);

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Highlights</h2>
      <div className="overflow-y-auto max-h-[65vh] flex flex-col gap-5 mt-3">
        {loading && <p className="text-center text-sm opacity-70">Loading…</p>}
        {!loading &&
          grouped.map(([date, list]) => (
            <div key={date} className="flex flex-col gap-3">
              <div className="flex justify-center mb-1">
                <span className="text-xs bg-[#E2DAD2] text-[#2E2A26] px-3 py-1 rounded-full opacity-90">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {list.map(
                (h) =>
                  h.text?.trim() && (
                    <div key={h.id} className="flex justify-start pl-1">
                      <div className="relative bg-[#FCFAF8] border border-[#E8E1DA] rounded-2xl px-4 py-2 shadow-sm max-w-[80%] text-left leading-relaxed whitespace-pre-wrap">
                        <p className="text-sm break-words">{h.text}</p>
                        <span className="absolute bottom-1 right-3 text-[10px] text-[#A59B93]">
                          {new Date(h.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  )
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

/* ===================================
   PROGRESS PANEL
=================================== */
function ProgressPanel() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    (async () => {
      const data = (await apiFetchEntries()) || [];
      setEntries(data);
    })();
  }, []);

  const countsByDay = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [entries]);

  const lastNDays = (n) => {
    const arr = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push({
        key,
        label: d.toLocaleDateString("en-GB", { day: "2-digit" }),
        count: countsByDay.get(key) || 0,
      });
    }
    return arr;
  };

  const last7 = useMemo(() => lastNDays(7), [countsByDay]);
  const last14 = useMemo(() => lastNDays(14), [countsByDay]);
  const max = Math.max(1, ...last7.map((d) => d.count));

  const streak = useMemo(() => {
    let s = 0;
    let cur = new Date();
    while (true) {
      const key = cur.toISOString().slice(0, 10);
      if ((countsByDay.get(key) || 0) > 0) {
        s += 1;
        cur.setDate(cur.getDate() - 1);
      } else break;
    }
    return s;
  }, [countsByDay]);

  const woW = useMemo(() => {
    const startOfWeek = (d) => {
      const c = new Date(d);
      const day = c.getDay();
      const diff = (day + 6) % 7;
      c.setDate(c.getDate() - diff);
      return c;
    };
    const endOfWeek = (s) => {
      const e = new Date(s);
      e.setDate(e.getDate() + 7);
      return e;
    };
    const now = new Date();
    const thisStart = startOfWeek(now);
    const lastStart = new Date(thisStart);
    lastStart.setDate(lastStart.getDate() - 7);
    const thisEnd = endOfWeek(thisStart);
    const lastEnd = endOfWeek(lastStart);
    let thisSum = 0,
      lastSum = 0;
    for (const [k, v] of countsByDay.entries()) {
      const d = new Date(k);
      if (d >= thisStart && d < thisEnd) thisSum += v;
      else if (d >= lastStart && d < lastEnd) lastSum += v;
    }
    const diff = thisSum - lastSum;
    const trend = diff === 0 ? "same" : diff > 0 ? "up" : "down";
    return { thisSum, lastSum, diff, trend };
  }, [countsByDay]);

  const dailyAvg = useMemo(() => {
    const sum = last7.reduce((a, b) => a + b.count, 0);
    return (sum / 7).toFixed(1);
  }, [last7]);

  const bestDay = useMemo(() => {
    let best = { key: null, count: -1 };
    for (const d of last14) {
      if (d.count > best.count) best = d;
    }
    return best.count > 0 ? best : null;
  }, [last14]);

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Progress</h2>
      <p className={`${sub} mt-1`}>Entries in the last 7 days</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Kpi label="Streak" value={`${streak}d`} hint="days in a row" />
        <Kpi
          label="This Week / Last"
          value={`${woW.thisSum}/${woW.lastSum}`}
          hint={
            woW.trend === "up"
              ? "↑ more active"
              : woW.trend === "down"
              ? "↓ less active"
              : "— same pace"
          }
        />
        <Kpi label="Daily Avg" value={dailyAvg} hint="entries per day" />
        <Kpi
          label="Best Day"
          value={bestDay ? bestDay.count : "—"}
          hint={
            bestDay
              ? new Date(bestDay.key).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              : "no entries yet"
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 items-end">
        {last7.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1">
            <div
              className="w-7 rounded-xl bg-[#CBB9A8]"
              style={{ height: `${(d.count / max) * 110 + 6}px` }}
            />
            <span className="text-[11px] opacity-70">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-[#E8E1DA] bg-[#F9F5F0] p-3 text-left">
      <div className="text-[11px] text-[#7E7A74]">{label}</div>
      <div className="text-lg font-semibold text-[#2E2A26] leading-tight">{value}</div>
      <div className="text-[11px] text-[#9C8E85]">{hint}</div>
    </div>
  );
}
