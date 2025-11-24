/**
 * Journey of Life — Page: My Journey (Telegram-style)
 * ---------------------------------------------------
 * - Tabs: Summary | Highlights | Progress
 * - Summary & Highlights: full scroll history, grouped by day
 * - Date picker = jump-to-date (scroll), not filter
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchEntries as apiFetchEntries,
  fetchHighlights as apiFetchHighlights,
  fetchSummaries as apiFetchSummaries,
  fetchEntries,
} from "../utils/api.js";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const container =
  "max-w-2xl mx-auto px-4 py-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen flex flex-col gap-4";
const card = "bg-white border border-[#E8E1DA] rounded-2xl shadow-sm";
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
  const dateRefs = useRef({});

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

      <div ref={listRef} className="flex-1 max-h-[65vh] overflow-y-auto pr-1">
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
  const dateRefs = useRef({});
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

      {status && <div className="text-[11px] text-[#7E7A74] mb-1">{status}</div>}

      <div
        ref={listRef}
        className="overflow-y-auto max-h-[65vh] pr-1 flex flex-col gap-3"
      >
        {loading && (
          <p className="text-center text-sm opacity-70">Loading…</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-center text-sm opacity-70">No highlights yet.</p>
        )}

        {sortedDateKeys.map((dateKey) => {
          const dayItems = byDate[dateKey];
          const refDate = dayItems[0].planned_date || dayItems[0].created_at;
          return (
            <div key={dateKey} className="mt-2">
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
   PROGRESS PANEL — TanStack Query
=============================== */

// Helper: format YYYY-MM-DD
function toLocalKey(dateStr) {
  return new Date(dateStr).toISOString().split("T")[0];
}

function ProgressPanel() {
  const q = useQuery({ queryKey: ["entries"], queryFn: fetchEntries });

  if (q.isLoading)
    return (
      <section className={`${card} p-5`}>
        <p className="text-sm italic text-[#8C7F78] text-center">Loading progress…</p>
      </section>
    );

  const entries = q.data || [];
  const byDay = {};

  entries.forEach((e) => {
    const k = toLocalKey(e.created_at);
    byDay[k] = (byDay[k] || 0) + 1;
  });

  const labels = Object.keys(byDay).sort((a, b) => new Date(a) - new Date(b));
  const dataPoints = labels.map((d) => byDay[d]);

  // Streak
  let streak = 0;
  let cur = toLocalKey(new Date());
  for (const k of labels.slice().reverse()) {
    if (k === cur) {
      streak++;
      const prev = new Date(cur);
      prev.setDate(prev.getDate() - 1);
      cur = toLocalKey(prev);
    } else break;
  }

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Progress</h2>

      <div className="mt-3 flex items-center justify-between">
        <div className="bg-[#F9F5F0] border border-[#E8E1DA] rounded-xl px-4 py-2 shadow-sm">
          <p className="text-[13px] text-[#7E7A74]">🔥 Streak</p>
          <p className="text-lg font-semibold text-[#2E2A26]">{streak} days</p>
        </div>
      </div>

      <div className="mt-5">
        {labels.length > 0 ? (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Entries",
                  data: dataPoints,
                  borderColor: "#CFAE7C",
                  backgroundColor: "rgba(207,174,124,0.35)",
                  tension: 0.35,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
              },
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center mt-6">
            Belum ada entry untuk ditampilkan 🌿
          </p>
        )}
      </div>
    </section>
  );
}
