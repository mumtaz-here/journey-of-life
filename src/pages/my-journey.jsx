/**
 * Journey of Life — Page: My Journey (auto factual summary + calm bubble)
 * ------------------------------------------------
 * - Summary: auto-fetches & auto-backfills (no button)
 * - Highlights: left beige bubble
 * - Progress: mini calm bars
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
        <p className={sub}>Results & reflections from your writing</p>
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

/* ===============================
   SUMMARY PANEL — AUTO REFRESH & BACKFILL
=============================== */
function SummaryPanel() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  async function fetchSummaries() {
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
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }

  // 🪄 otomatis backfill di background (sekali doang)
  async function autoBackfill() {
    try {
      await fetch("http://localhost:5000/api/summaries/backfill", { method: "POST" });
      await fetchSummaries(); // refresh sesudah generate
    } catch (err) {
      console.error("⚠️ Auto backfill failed:", err);
    }
  }

  useEffect(() => {
    fetchSummaries();
    autoBackfill(); // jalankan sekali pas panel dibuka
    const interval = setInterval(fetchSummaries, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col gap-3 bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E1DA] shadow-sm">
      <h2 className="text-lg font-semibold text-[#2E2A26] mb-1">
        Summary
      </h2>

      <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-2">
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
        {summaries.map((s) => (
          <div key={s.summary_date} className="flex flex-col items-start">
            <div className="self-center bg-[#D8CFC5] text-white text-xs px-3 py-1 rounded-full mb-1">
              {new Date(s.summary_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="max-w-[85%] bg-[#F9F5F0] border border-[#E8E1DA] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm text-[#2E2A26] text-left leading-relaxed whitespace-pre-wrap">
              {s.summary_text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}

/* =========================================================
   HIGHLIGHTS PANEL
========================================================= */
function HighlightsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = (await apiFetchHighlights()) || [];
      data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setItems(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  return (
    <section className={`${card} p-4`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className={title}>Highlights</h2>
        <p className={sub}>Detected from your entries</p>
      </div>

      <div className="overflow-y-auto max-h-[65vh] pr-1 flex flex-col gap-3">
        {loading && <p className="text-center text-sm opacity-70">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-center text-sm opacity-70">No highlights yet.</p>
        )}
        {items.map((h) => (
          <div key={h.id} className="flex justify-start px-1">
            <div className="relative bg-[#F9F5F0] rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%] shadow-sm text-left">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {h.text}
              </p>
              <span className="text-[10px] text-[#9C8E85] absolute bottom-1 right-3">
                {h.planned_date
                  ? new Date(h.planned_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}

/* =========================================================
   PROGRESS PANEL
========================================================= */
function ProgressPanel() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    (async () => {
      const data = (await apiFetchEntries()) || [];
      setEntries(data);
    })();
  }, []);

  const last7 = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, label: d.toLocaleDateString("en-GB", { day: "2-digit" }), count: 0 });
    }
    for (const e of entries) {
      const k = new Date(e.created_at).toISOString().slice(0, 10);
      const found = days.find((d) => d.key === k);
      if (found) found.count += 1;
    }
    return days;
  }, [entries]);

  const max = Math.max(1, ...last7.map((d) => d.count));

  return (
    <section className={`${card} p-5`}>
      <h2 className={title}>Progress</h2>
      <p className={`${sub} mt-1`}>Entries in the last 7 days</p>

      <div className="mt-4 grid grid-cols-7 gap-2 items-end">
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
