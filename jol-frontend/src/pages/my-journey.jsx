/**
 * Journey of Life — My Journey (User-Only Chat)
 * Write tab shows ONLY user's bubbles (no app reflections).
 */

import React, { useEffect, useRef, useState } from "react";
import "../app.css";

const API = "http://localhost:5000/api";

const pageContainer =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26]";
const card =
  "p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft";
const heading = "heading mb-1";
const subtext = "text-sm text-[#7E7A74]";

const tabBtn = "px-4 py-2 rounded-full text-sm transition-colors border";
const activeTab = "bg-[#2E2A26] text-white border-[#2E2A26]";
const idleTab = "bg-white text-[#2E2A26] border-[#E8E1DA] hover:bg-[#FAF7F2]";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export default function MyJourney() {
  const [tab, setTab] = useState("write");
  const tabs = ["write", "summary", "progress", "highlights"];

  return (
    <main className={pageContainer}>
      <section className={card}>
        <h1 className="heading text-[1.35rem]">My Journey</h1>
        <p className={subtext}>Your story in a calm flow.</p>
      </section>

      <nav className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${tabBtn} ${tab === t ? activeTab : idleTab} capitalize`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "write" && <WritePanel />}
      {tab === "summary" && <SummaryPanel />}
      {tab === "progress" && <ProgressPanel />}
      {tab === "highlights" && <HighlightsPanel />}
    </main>
  );
}

/* ===============================
   WRITE PANEL — USER-ONLY BUBBLES
   =============================== */
function WritePanel() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const endRef = useRef(null);

  async function fetchEntries() {
    const res = await fetch(`${API}/entries`);
    const data = await res.json();
    // oldest → newest
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setEntries(data);
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    await fetch(`${API}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setSaving(false);
    setText("");
    fetchEntries();
  }

  return (
    <section className={`${card} flex flex-col gap-4`}>
      <div className="flex justify-between items-center">
        <h2 className={heading}>Write</h2>
        <p className={subtext}>Only your words here.</p>
      </div>

      {/* feed */}
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <p className="text-sm italic text-[#7E7A74]">
              Start writing your thoughts…
            </p>
          ) : (
            entries.map((e) => <UserBubble key={e.id} data={e} />)
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* composer */}
      <div className="flex gap-2">
        <textarea
          className="flex-1 h-24 px-3 py-2 rounded-xl bg-[#FAF7F2] border text-sm"
          placeholder="Write freely (English only)…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={submit}
          disabled={!text.trim() || saving}
          className={`px-4 py-2 rounded-xl text-sm text-white ${
            saving
              ? "bg-[#CBB9A8]/40 cursor-not-allowed"
              : "bg-[#9EC3B0] hover:bg-[#86b7a0]"
          }`}
        >
          {saving ? "Saving…" : "Send"}
        </button>
      </div>
    </section>
  );
}

function UserBubble({ data }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-[#F2B8A2]/40 border border-[#E8E1DA] rounded-2xl rounded-br-md px-3 py-2 shadow-soft">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.text}</p>
        <p className="text-[11px] text-[#7E7A74] mt-1 text-right">
          {formatDate(data.created_at)}
        </p>
      </div>
    </div>
  );
}

/* ===============================
   SUMMARY / PROGRESS / HIGHLIGHTS
   (placeholders — analysis shown here later)
   =============================== */
function SummaryPanel() {
  return (
    <section className={card}>
      <p className={subtext}>Summary appears here (no chat reflections in Write).</p>
    </section>
  );
}

function ProgressPanel() {
  return (
    <section className={card}>
      <p className={subtext}>Progress appears here.</p>
    </section>
  );
}

function HighlightsPanel() {
  return (
    <section className={card}>
      <p className={subtext}>Highlights appear here.</p>
    </section>
  );
}
