/**
 * Journey of Life — My Journey (Chat + Tabs)
 * ------------------------------------------
 * Tabs:
 *  - Write: chat-style journaling (right: user entry, left: system reflection using analysis)
 *  - Summary: mood & keyword insights from entries
 *  - Progress: weekly entry count chart (recharts)
 *  - Highlights: planned moments w/ subtle status + provenance
 *
 * Notes:
 *  - English only copy
 *  - Calm, planner-first visuals; bubbles feel human but not noisy
 *  - Works with existing backend: /api/entries, /api/highlights
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API = "http://localhost:5000/api";

// ---------- shared styles ----------
const pageContainer =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26]";
const card = "p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft";
const heading = "heading mb-1";
const subtext = "text-sm text-[#7E7A74]";
const tabBtnBase =
  "px-4 py-2 rounded-full text-sm transition-colors border";
const tabBtnActive =
  "bg-[#2E2A26] text-white border-[#2E2A26]";
const tabBtnIdle =
  "bg-white text-[#2E2A26] border-[#E8E1DA] hover:bg-[#FAF7F2]";

// ---------- helpers ----------
function fmtDateTime(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}
function isoWeekKey(d) {
  const date = new Date(d);
  const dup = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = dup.getUTCDay() || 7;
  dup.setUTCDate(dup.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dup.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((dup - yearStart) / 86400000 + 1) / 7);
  return `${dup.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// ---------- main page ----------
export default function MyJourney() {
  const [tab, setTab] = useState("write"); // write | summary | progress | highlights

  return (
    <main className={pageContainer}>
      {/* Header */}
      <section className={`${card}`}>
        <h1 className="heading text-[1.35rem]">My Journey</h1>
        <p className={subtext}>
          A calm space to write, reflect, and see your life take shape.
        </p>
      </section>

      {/* Tabs */}
      <nav className="flex items-center gap-2">
        <button
          className={`${tabBtnBase} ${tab === "write" ? tabBtnActive : tabBtnIdle}`}
          onClick={() => setTab("write")}
        >
          Write
        </button>
        <button
          className={`${tabBtnBase} ${tab === "summary" ? tabBtnActive : tabBtnIdle}`}
          onClick={() => setTab("summary")}
        >
          Summary
        </button>
        <button
          className={`${tabBtnBase} ${tab === "progress" ? tabBtnActive : tabBtnIdle}`}
          onClick={() => setTab("progress")}
        >
          Progress
        </button>
        <button
          className={`${tabBtnBase} ${tab === "highlights" ? tabBtnActive : tabBtnIdle}`}
          onClick={() => setTab("highlights")}
        >
          Highlights
        </button>
      </nav>

      {/* Panels */}
      {tab === "write" && <WritePanel />}
      {tab === "summary" && <SummaryPanel />}
      {tab === "progress" && <ProgressPanel />}
      {tab === "highlights" && <HighlightsPanel />}
    </main>
  );
}

/* =========================
   WRITE — Chat-style panel
   ========================= */
function WritePanel() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  async function fetchEntries() {
    const res = await fetch(`${API}/entries`);
    const data = await res.json();
    // Sort oldest → newest
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setEntries(data);
  }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    await fetch(`${API}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    setSaving(false);
    fetchEntries();
  }

  return (
    <section className={`${card} flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <h2 className={heading}>Write</h2>
        <p className={subtext}>Right side: you · Left side: reflections</p>
      </div>

      {/* Chat feed */}
      <div
        className="max-h-[60vh] overflow-y-auto pr-1"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <div className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <p className="text-sm text-[#7E7A74] italic">
              Start by writing how you feel today…
            </p>
          ) : (
            entries.map((e) => (
              <ChatPair key={e.id} entry={e} />
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="flex gap-2 pt-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write freely (English only)…"
          className="flex-1 h-24 rounded-xl border border-[#E8E1DA] bg-[#FAF7F2] px-3 py-2 text-sm"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || saving}
          className={`px-4 py-2 rounded-xl text-sm text-white ${
            !text.trim() || saving
              ? "bg-[#CBB9A8]/40 cursor-not-allowed"
              : "bg-[#9EC3B0] hover:bg-[#86b7a0]"
          }`}
          title="Save entry"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </section>
  );
}

function ChatPair({ entry }) {
  const a = entry.analysis || {};
  const mood = a.mood || "neutral";
  const kws = Array.isArray(a.keywords) ? a.keywords : [];

  return (
    <div className="flex flex-col gap-2">
      {/* User bubble (right) */}
      <div className="w-full flex justify-end">
        <div className="max-w-[85%] bg-[#F2B8A2]/40 border border-[#E8E1DA] rounded-2xl rounded-br-md px-3 py-2 shadow-soft">
          <p className="text-sm leading-relaxed">{entry.text}</p>
          <p className="text-[11px] text-[#7E7A74] mt-1 text-right">
            {fmtDateTime(entry.created_at)}
          </p>
        </div>
      </div>

      {/* System reflection bubble (left) */}
      <div className="w-full flex justify-start">
        <div className="max-w-[85%] bg-white border border-[#E8E1DA] rounded-2xl rounded-bl-md px-3 py-2 shadow-soft">
          <p className="text-sm">
            <span className="opacity-80">Mood:</span>{" "}
            <span className="font-medium">{mood}</span>
          </p>
          {kws.length > 0 && (
            <p className="text-sm mt-1">
              <span className="opacity-80">Keywords:</span>{" "}
              <span className="font-medium">{kws.join(", ")}</span>
            </p>
          )}
          <p className="text-[11px] text-[#7E7A74] mt-1">
            Reflected from your entry.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SUMMARY — insights panel
   ========================= */
function SummaryPanel() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/entries`);
      const data = await res.json();
      setEntries(data);
    })();
  }, []);

  const moods = useMemo(() => entries.map((e) => e?.analysis?.mood).filter(Boolean), [entries]);
  const dominantMood = useMemo(() => {
    const m = {};
    for (const x of moods) m[x] = (m[x] || 0) + 1;
    let best = { k: "neutral", c: 0 };
    for (const [k, v] of Object.entries(m)) if (v > best.c) best = { k, c: v };
    return best.k;
  }, [moods]);

  const topKeywords = useMemo(() => {
    const map = {};
    for (const e of entries) {
      const arr = e?.analysis?.keywords || [];
      for (const w of arr) map[w] = (map[w] || 0) + 1;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
  }, [entries]);

  return (
    <section className={`${card} space-y-3`}>
      <h2 className={heading}>Summary</h2>
      <p className={subtext}>Objective, gentle insights from your writing.</p>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="rounded-xl border p-3 bg-[#FAF7F2]">
          <p className="text-xs text-[#7E7A74]">Entries</p>
          <p className="text-lg font-semibold">{entries.length}</p>
        </div>
        <div className="rounded-xl border p-3 bg-[#FAF7F2]">
          <p className="text-xs text-[#7E7A74]">Dominant mood</p>
          <p className="text-lg font-semibold capitalize">{dominantMood}</p>
        </div>
        <div className="rounded-xl border p-3 bg-[#FAF7F2]">
          <p className="text-xs text-[#7E7A74]">Active days</p>
          <p className="text-lg font-semibold">
            {
              new Set(
                entries.map((e) => new Date(e.created_at).toDateString())
              ).size
            }
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-[#7E7A74] mb-1">Top keywords</p>
        {topKeywords.length === 0 ? (
          <p className="text-sm italic text-[#7E7A74]">Not enough data yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((k) => (
              <span
                key={k}
                className="px-2 py-1 rounded-full text-xs bg-[#EDE7E0] border"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   PROGRESS — weekly chart
   ========================= */
function ProgressPanel() {
  const [entries, setEntries] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/entries`);
      const data = await res.json();
      // build weekly counts
      const map = {};
      for (const e of data) {
        const wk = isoWeekKey(e.created_at);
        map[wk] = (map[wk] || 0) + 1;
      }
      const arr = Object.entries(map)
        .map(([week, entries]) => ({ week, entries }))
        .sort((a, b) => a.week.localeCompare(b.week));
      setEntries(data);
      setChartData(arr);
    })();
  }, []);

  const reflectionText =
    entries.length === 0
      ? "You haven’t started yet — every story begins with a first line."
      : entries.length < 4
      ? "You’re building a rhythm. Just showing up counts."
      : "Your reflections are flowing. Awareness is quietly growing.";

  return (
    <section className={`${card} space-y-3`}>
      <h2 className={heading}>Progress</h2>
      <p className={subtext}>A calm look at your weekly consistency.</p>

      {chartData.length === 0 ? (
        <p className="text-sm text-[#7E7A74] italic mt-2">
          Not enough activity to show a pattern yet.
        </p>
      ) : (
        <div className="w-full h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              <XAxis dataKey="week" stroke="#7E7A74" fontSize={12} tickMargin={8} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF7F2",
                  border: "1px solid #E8E1DA",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="entries"
                stroke="#9EC3B0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#CBB9A8" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-2 p-3 rounded-xl bg-[#FAF7F2] border">
        <p className="text-sm">{reflectionText}</p>
      </div>
    </section>
  );
}

/* =========================
   HIGHLIGHTS — list panel
   ========================= */
function HighlightsPanel() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchHighlights();
  }, []);

  async function fetchHighlights() {
    const res = await fetch(`${API}/highlights`);
    const data = await res.json();
    // Newest first by planned or created date
    data.sort((a, b) => {
      const aKey = a.planned_date || a.date;
      const bKey = b.planned_date || b.date;
      return new Date(bKey) - new Date(aKey);
    });
    setItems(data);
  }

  async function toggle(id) {
    await fetch(`${API}/highlights/${id}/toggle`, { method: "PATCH" });
    fetchHighlights();
  }

  async function remove(id) {
    await fetch(`${API}/highlights/${id}`, { method: "DELETE" });
    fetchHighlights();
  }

  return (
    <section className={`${card} space-y-3`}>
      <h2 className={heading}>Highlights</h2>
      <p className={subtext}>Plans and moments derived from your journal.</p>

      {items.length === 0 ? (
        <p className="text-sm text-[#7E7A74] italic">No highlights yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    m.status === "done" ? "bg-[#9EC3B0]" : "bg-[#CBB9A8]"
                  }`}
                  title={m.status === "done" ? "completed" : "planned"}
                />
                <span className="text-sm">{m.text}</span>
              </div>

              <div className="flex items-center gap-3">
                {m.planned_date && (
                  <span className="text-xs text-[#7E7A74]">{m.planned_date}</span>
                )}
                {m.source_entry_id && (
                  <span className="text-xs text-[#7E7A74]">
                    from entry #{m.source_entry_id}
                  </span>
                )}
                <button
                  onClick={() => toggle(m.id)}
                  className="text-xs text-[#7E7A74] hover:text-[#2E2A26]"
                >
                  toggle
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
