/**
 * Journey of Life — Page: My Journey (Telegram-style)
 * ---------------------------------------------------
 * - Tabs: Summary | Highlights | Progress
 * - Summary & Highlights: full scroll history, grouped by day
 * - Date picker = jump-to-date (scroll), not filter
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

const TAB_KEY = "jol_myjourney_tab";

function toLocalDateKey(dateOrIso) {
  const d = new Date(dateOrIso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateChip(isoOrDate) {
  const d = new Date(isoOrDate);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyJourney() {
  const [tab, setTab] = useState(
    () => localStorage.getItem(TAB_KEY) || "summary"
  );
  const tabs = ["summary", "highlights", "progress"];

  function handleTab(t) {
    setTab(t);
    localStorage.setItem(TAB_KEY, t);
  }

  return (
    <main className={container}>
      <header className="text-center">
        <h1 className="text-xl font-semibold">My Journey</h1>
        <p className={sub}>Reflections, highlights, and gentle progress.</p>
      </header>

      <nav className="flex items-center justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => handleTab(t)}
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

/* ===============================
   SUMMARY PANEL — full scroll
=============================== */
function SummaryPanel() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jumpDate, setJumpDate] = useState("");
  const listRef = useRef(null);
  const dateInputRef = useRef(null);
  const dateRefs = useRef({}); // { [dateKey]: HTMLElement }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = (await apiFetchSummaries()) || [];
        data.sort(
          (a, b) => new Date(a.summary_date) - new Date(b.summary_date)
        );
        setSummaries(data);
      } catch (err) {
        console.error("❌ Failed to fetch summaries:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // auto-scroll ke bawah waktu pertama kali load
  useEffect(() => {
    if (listRef.current && summaries.length > 0) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [summaries.length]);

  function handleJumpChange(e) {
    const value = e.target.value;
    setJumpDate(value);
    if (!value) return;

    const el = dateRefs.current[value];
    if (el && listRef.current) {
      const containerTop = listRef.current.getBoundingClientRect().top;
      const targetTop = el.getBoundingClientRect().top;
      const currentScroll = listRef.current.scrollTop;
      const offset = targetTop - containerTop - 40;
      listRef.current.scrollTo({
        top: currentScroll + offset,
        behavior: "smooth",
      });
    }
  }

  return (
    <section className={`${card} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <h2 className={title}>Summary</h2>
        <button
          type="button"
          className="text-[11px] px-3 py-1 rounded-full border border-[#D8C2AE] bg-[#F4E6D7] text-[#5C5147] shadow-sm hover:bg-[#EAD7C5]"
          onClick={() => dateInputRef.current?.showPicker()}
        >
          {jumpDate ? jumpDate : "Jump to date"}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={jumpDate}
          onChange={handleJumpChange}
        />
      </div>

      <div
        ref={listRef}
        className="flex-1 max-h-[65vh] overflow-y-auto pr-1"
      >
        {loading && (
          <p className="text-sm italic text-[#8C7F78] text-center mt-4">
            Loading summaries…
          </p>
        )}
        {!loading && summaries.length === 0 && (
          <p className="text-sm italic text-[#8C7F78] text-center mt-4">
            No summaries yet 🌿
          </p>
        )}

        {summaries.map((s) => {
          const dateKey = toLocalDateKey(s.summary_date);
          return (
            <div key={s.summary_date} className="mt-3">
              {/* date chip center */}
              <div
                className="flex justify-center mb-2"
                ref={(el) => {
                  if (el) dateRefs.current[dateKey] = el;
                }}
              >
                <span className="text-[11px] text-white bg-[#A89786] px-3 py-1 rounded-full shadow-sm">
                  {formatDateChip(s.summary_date)}
                </span>
              </div>
              {/* bubble left */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-[#F9F5F0] border border-[#E8E1DA] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {s.summary_text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ===============================
   HIGHLIGHTS PANEL — full scroll
=============================== */
function HighlightsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [jumpDate, setJumpDate] = useState("");
  const listRef = useRef(null);
  const dateInputRef = useRef(null);
  const dateRefs = useRef({}); // { [dateKey]: HTMLElement }
  const didRunRef = useRef(false);

  const dateKeyFor = (h) =>
    h.planned_date ? toLocalDateKey(h.planned_date) : toLocalDateKey(h.created_at);

  const loadList = async () => {
    const data = (await apiFetchHighlights()) || [];
    data.sort(
      (a, b) =>
        new Date(a.planned_date || a.created_at) -
        new Date(b.planned_date || b.created_at)
    );
    setItems(data);
  };

  const autoGenerateToday = async () => {
    try {
      setStatus("Detecting today’s highlights…");
      await fetch("http://localhost:5000/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto: true }),
      });
      setStatus("Updated from today’s entries ✓");
    } catch (e) {
      setStatus("");
      console.error("auto-generate highlights failed:", e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!didRunRef.current) {
        didRunRef.current = true;
        await autoGenerateToday();
      }
      await loadList();
      setLoading(false);
    })();
  }, []);

  // auto-scroll ke bawah waktu pertama kali load
  useEffect(() => {
    if (listRef.current && items.length > 0) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [items.length]);

  function handleJumpChange(e) {
    const value = e.target.value;
    setJumpDate(value);
    if (!value) return;

    const el = dateRefs.current[value];
    if (el && listRef.current) {
      const containerTop = listRef.current.getBoundingClientRect().top;
      const targetTop = el.getBoundingClientRect().top;
      const currentScroll = listRef.current.scrollTop;
      const offset = targetTop - containerTop - 40;
      listRef.current.scrollTo({
        top: currentScroll + offset,
        behavior: "smooth",
      });
    }
  }

  // group highlights by day (pakai planned_date kalau ada)
  const byDate = useMemo(() => {
    const map = {};
    for (const h of items) {
      const key = dateKeyFor(h);
      (map[key] ||= []).push(h);
    }
    return map;
  }, [items]);

  const sortedDateKeys = Object.keys(byDate).sort();

  return (
    <section className={`${card} p-4`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className={title}>Highlights</h2>
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker()}
          className="text-[11px] px-3 py-1 rounded-full border border-[#D8C2AE] bg-[#F4E6D7] text-[#5C5147] shadow-sm hover:bg-[#EAD7C5]"
        >
          {jumpDate ? jumpDate : "Jump to date"}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={jumpDate}
          onChange={handleJumpChange}
        />
      </div>

      {status && (
        <div className="text-[11px] text-[#7E7A74] mb-1">{status}</div>
      )}

      <div
        ref={listRef}
        className="overflow-y-auto max-h-[65vh] pr-1 flex flex-col gap-3"
      >
        {loading && (
          <p className="text-center text-sm opacity-70">Loading…</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-center text-sm opacity-70">
            No highlights yet.
          </p>
        )}

        {sortedDateKeys.map((dateKey) => {
          const dayItems = byDate[dateKey];
          const refDate = dayItems[0].planned_date || dayItems[0].created_at;
          return (
            <div key={dateKey} className="mt-2">
              {/* date chip center */}
              <div
                className="flex justify-center mb-1"
                ref={(el) => {
                  if (el) dateRefs.current[dateKey] = el;
                }}
              >
                <span className="text-[11px] text-white bg-[#A89786] px-3 py-1 rounded-full shadow-sm">
                  {formatDateChip(refDate)}
                </span>
              </div>

              {dayItems.map((h) => (
                <div key={h.id} className="flex justify-start px-1 mt-1">
                  <div className="bg-[#F9F5F0] rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%] shadow-sm text-left border border-[#E8E1DA]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {h.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ===============================
   PROGRESS PANEL — sama seperti sebelumnya
=============================== */
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
      const k = toLocalDateKey(e.created_at);
      map.set(k, (map.get(k) || 0) + 1);
    }
    return map;
  }, [entries]);

  const lastNDays = (n) => {
    const arr = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toLocalDateKey(d);
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

  const streak = useMemo(() => {
    let s = 0;
    const todayKey = toLocalDateKey(new Date());
    let cur = new Date();
    while (true) {
      const key = toLocalDateKey(cur);
      const v = countsByDay.get(key) || 0;
      if (v > 0) {
        s += 1;
        cur.setDate(cur.getDate() - 1);
      } else {
        if (key === todayKey) return 0;
        break;
      }
    }
    return s;
  }, [countsByDay]);

  const woW = useMemo(() => {
    const mapSum = (start, end) => {
      let sum = 0;
      for (const [k, v] of countsByDay.entries()) {
        const d = new Date(k);
        if (d >= start && d < end) sum += v;
      }
      return sum;
    };

    const startOfWeek = (d) => {
      const copy = new Date(d);
      const day = copy.getDay(); // 0 Sun ... 6 Sat
      const diff = (day + 6) % 7; // Monday-based
      copy.setHours(0, 0, 0, 0);
      copy.setDate(copy.getDate() - diff);
      return copy;
    };
    const endOfWeek = (start) => {
      const e = new Date(start);
      e.setDate(e.getDate() + 7);
      return e;
    };

    const now = new Date();
    const thisStart = startOfWeek(now);
    const lastStart = new Date(thisStart);
    lastStart.setDate(lastStart.getDate() - 7);
    const thisEnd = endOfWeek(thisStart);
    const lastEnd = endOfWeek(lastStart);

    const thisSum = mapSum(thisStart, thisEnd);
    const lastSum = mapSum(lastStart, lastEnd);
    const diff = thisSum - lastSum;
    const trend = diff === 0 ? "same" : diff > 0 ? "up" : "down";
    return { thisSum, lastSum, diff, trend };
  }, [countsByDay]);

  const dailyAvg7 = useMemo(() => {
    const sum = last7.reduce((a, b) => a + b.count, 0);
    return (sum / 7).toFixed(1);
  }, [last7]);

  const bestDay = useMemo(() => {
    let best = { key: null, count: -1 };
    for (const d of last14) {
      if (d.count > best.count) best = { key: d.key, count: d.count };
    }
    return best.count > 0 ? best : null;
  }, [last14]);

  const max = Math.max(1, ...last7.map((d) => d.count));

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Progress</h2>
      <p className={`${sub} mt-1`}>Entries in the last 7 days</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <KpiCard
          label="Writing Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          hint="consecutive days with entries"
        />
        <KpiCard
          label="This Week vs Last"
          value={`${woW.thisSum} vs ${woW.lastSum}`}
          hint={
            woW.trend === "up"
              ? "↑ more active"
              : woW.trend === "down"
              ? "↓ less active"
              : "— same pace"
          }
        />
        <KpiCard
          label="Daily Avg (7d)"
          value={dailyAvg7}
          hint="entries / day"
        />
        <KpiCard
          label="Best Day (14d)"
          value={bestDay ? `${bestDay.count}` : "—"}
          hint={
            bestDay
              ? `on ${new Date(bestDay.key).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}`
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
              title={`${d.count} entries`}
            />
            <span className="text-[11px] opacity-70">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function KpiCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-[#E8E1DA] bg-[#F9F5F0] p-3">
      <div className="text-[11px] text-[#7E7A74]">{label}</div>
      <div className="text-lg font-semibold text-[#2E2A26] leading-tight">
        {value}
      </div>
      <div className="text-[11px] text-[#9C8E85]">{hint}</div>
    </div>
  );
}
