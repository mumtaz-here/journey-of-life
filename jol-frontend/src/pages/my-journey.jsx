/**
 * Journey of Life — My Journey (FAST + CLEAN VERSION)
 * ----------------------------------------------------
 * - React Virtuoso (no lag)
 * - TanStack Query compatible
 * - FIXED: fetchSummaries & fetchHighlights (no more errors)
 */

import { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";

import {
  fetchSummaries,
  fetchHighlights,
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

function toISO(d) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().split("T")[0];
}

function pretty(d) {
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* ------------------------------------------------------------
   MAIN PAGE
------------------------------------------------------------ */
export default function MyJourney() {
  const [tab, setTab] = useState("summary");

  return (
    <main className="w-full h-full overflow-y-auto p-4 text-[#4A3F35] bg-[#FAF7F2]">
      <header className="text-center mb-4">
        <h1 className="text-xl font-semibold">My Journey</h1>
        <p className="text-sm text-[#7A6A5D]">
          Reflections, highlights, and gentle progress.
        </p>
      </header>

      <nav className="flex gap-2 justify-center mb-4">
        {["summary", "highlights", "progress"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm capitalize transition ${
              tab === t
                ? "bg-[#D7C8B6] text-[#4A3F35]"
                : "bg-[#EEE5DA] text-[#6E5F52]"
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

/* ============================================================
   SUMMARY PANEL
============================================================= */
function SummaryPanel() {
  const dateRefs = useRef({});
  const [jump, setJump] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["summaries"],
    queryFn: fetchSummaries,
  });

  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.summary_date) - new Date(b.summary_date)
    );
  }, [data]);

  return (
    <section>
      {/* jump to date */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="date"
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          className="border px-3 py-2 rounded-md bg-[#F9F2EA] text-sm"
        />

        <button
          onClick={() => {
            if (!jump) return;
            const el = dateRefs.current[jump];
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="text-[11px] px-3 py-1 rounded-full border border-[#D8C2AE] bg-[#F4E6D7] text-[#5C5147] hover:bg-[#EAD7C5]"
        >
          {jump ? "Go" : "Jump"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#7A6A5D]">Loading…</p>
      ) : (
        <Virtuoso
          style={{ height: "70vh" }}
          totalCount={sorted.length}
          itemContent={(index) => {
            const s = sorted[index];
            const day = s.summary_date;

            return (
              <div
                ref={(el) => {
                  if (el) dateRefs.current[day] = el;
                }}
                className="p-4 mb-3 rounded-xl bg-white border border-[#E8DCCF] shadow-sm"
              >
                <p className="text-xs text-[#7A6A5D] mb-1">{pretty(day)}</p>
                <p className="text-sm whitespace-pre-wrap">
                  {s.summary_text}
                </p>
              </div>
            );
          }}
        />
      )}
    </section>
  );
}

/* ============================================================
   HIGHLIGHTS PANEL
============================================================= */
function HighlightsPanel() {
  const dateRefs = useRef({});
  const [jump, setJump] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["highlights"],
    queryFn: fetchHighlights,
  });

  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) =>
        new Date(a.planned_date || a.created_at) -
        new Date(b.planned_date || b.created_at)
    );
  }, [data]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="date"
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          className="border px-3 py-2 rounded-md bg-[#F9F2EA] text-sm"
        />

        <button
          onClick={() => {
            if (!jump) return;
            const el = dateRefs.current[jump];
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="text-[11px] px-3 py-1 rounded-full border border-[#D8C2AE] bg-[#F4E6D7] text-[#5C5147] hover:bg-[#EAD7C5]"
        >
          {jump ? "Go" : "Jump"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#7A6A5D]">Loading…</p>
      ) : (
        <Virtuoso
          style={{ height: "70vh" }}
          totalCount={sorted.length}
          itemContent={(index) => {
            const h = sorted[index];
            const day =
              h.planned_date || h.created_at.split("T")[0] || "0000-00-00";

            return (
              <div
                ref={(el) => {
                  if (el) dateRefs.current[day] = el;
                }}
                className="p-4 mb-3 rounded-xl bg-white border border-[#E8DCCF] shadow-sm"
              >
                <p className="text-xs text-[#7A6A5D] mb-1">{pretty(day)}</p>
                <p className="text-sm">{h.text}</p>
              </div>
            );
          }}
        />
      )}
    </section>
  );
}

/* ============================================================
   PROGRESS PANEL
============================================================= */
function ProgressPanel() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: fetchEntries,
  });

  if (isLoading) return <p className="text-center">Loading…</p>;

  const grouped = {};
  data.forEach((e) => {
    const k = toISO(e.created_at);
    grouped[k] = (grouped[k] || 0) + 1;
  });

  const labels = Object.keys(grouped).sort();
  const points = labels.map((d) => grouped[d]);

  // streak
  let streak = 0;
  let current = toISO(new Date());
  for (const k of labels.slice().reverse()) {
    if (k === current) {
      streak++;
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 1);
      current = toISO(prev);
    } else break;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#E8DCCF] shadow-sm">
        <p className="text-sm text-[#7A6A5D]">🔥 Streak</p>
        <p className="text-2xl font-semibold text-[#4A3F35]">{streak} hari</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E8DCCF] shadow-sm">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Entries",
                data: points,
                borderColor: "#CFAE7C",
                backgroundColor: "rgba(207,174,124,0.35)",
                tension: 0.35,
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          }}
          style={{ maxHeight: 260 }}
        />
      </div>
    </div>
  );
}
