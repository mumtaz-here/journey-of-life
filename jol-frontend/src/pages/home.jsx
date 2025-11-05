/**
 * Journey of Life — Page: Home (WhatsApp-perfect, JOL style)
 * Rebranding v9
 *
 * - Calm beige theme + subtle pattern background
 * - User-only chat (right side bubbles)
 * - WhatsApp-like grouping (same minute → one stack)
 * - Timestamp inside last bubble (bottom-right)
 * - Date separator capsule (DD/MM/YYYY)
 * - Compact rhythm (2px within group, 8px between groups)
 */

import { useEffect, useRef, useState } from "react";
import { createEntry, fetchEntries } from "../utils/api";

/* ---------------- Helpers ---------------- */

function formatDateCapsule(iso) {
  // DD/MM/YYYY (WhatsApp-like in your screenshot)
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sameMinute(a, b) {
  if (!a || !b) return false;
  const da = new Date(a.created_at);
  const db = new Date(b.created_at);
  return Math.abs(db - da) < 60000; // 60s
}

/* ---------------- Component ---------------- */

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const data = await fetchEntries();
    if (Array.isArray(data)) {
      setMessages(
        data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      );
    }
  }

  useEffect(() => {
    // auto-scroll to bottom like WhatsApp
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const local = {
      id: Date.now(),
      text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, local]);
    setText("");
    setLoading(true);
    await createEntry(local.text);
    setLoading(false);
    loadEntries();
  }

  // group by date (day)
  const byDate = messages.reduce((acc, m) => {
    const key = new Date(m.created_at).toDateString();
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  return (
    <main className="h-screen flex flex-col text-[#2E2A26] bg-[#FAF7F2] font-[Inter,Roboto,system-ui]">
      {/* Inline tiny pattern (subtle, calm) */}
      <style>{`
        .jol-pattern {
          background-image:
            radial-gradient(#00000008 1px, transparent 1px),
            radial-gradient(#00000006 1px, transparent 1px);
          background-position: 0 0, 12px 12px;
          background-size: 24px 24px;
        }
      `}</style>

      {/* Header (clean) */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/85 backdrop-blur border-b border-[#E8E1DA] py-3 text-center text-sm font-medium">
        💬 Personal Chat Room
      </header>

      {/* Chat feed */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 max-w-2xl w-full mx-auto flex flex-col jol-pattern"
      >
        {Object.keys(byDate).map((dateKey) => {
          const msgs = byDate[dateKey];

          return (
            <div key={dateKey} className="mt-3">
              {/* Date capsule */}
              <div className="flex justify-center mb-2">
                <span className="text-[11px] leading-none text-white bg-[#A89786] px-3 py-1 rounded-full shadow-sm">
                  {formatDateCapsule(msgs[0].created_at)}
                </span>
              </div>

              {/* Messages of the day */}
              {msgs.map((m, i) => {
                const prev = msgs[i - 1];
                const next = msgs[i + 1];
                const start = !sameMinute(prev, m);
                const end = !sameMinute(m, next);

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col items-end ${
                      start ? "mt-2" : "mt-[2px]"
                    }`}
                  >
                    <div
                      className={[
                        "relative max-w-[80%] px-4 py-2 text-[14px] leading-relaxed bg-white",
                        "border border-[#E8E1DA] shadow-sm",
                        // WA bubble: big round, but bottom-right sharper
                        start ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-md",
                        // compact stack rhythm like WA
                        end ? "pr-12 pb-4" : "", // space for timestamp inside
                      ].join(" ")}
                    >
                      {m.text}
                      {end && (
                        <span className="absolute bottom-1 right-3 text-[10px] text-[#6E6A65] opacity-75 select-none">
                          {formatTime(m.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="border-t border-[#E8E1DA] bg-[#FAF7F2] px-3 sm:px-4 py-3 flex items-center gap-2 max-w-2xl mx-auto w-full"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          rows={1}
          className="flex-1 p-3 rounded-full border border-[#E8E1DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#D8C2AE]/50 resize-none text-[14px]"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-full text-white text-sm font-medium transition
            ${loading ? "bg-[#D8C2AE]/50 cursor-wait" : "bg-[#D8C2AE] hover:opacity-90 active:scale-[.97]"}`}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </main>
  );
}
