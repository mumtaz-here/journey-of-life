/**
 * Journey of Life — Page: Home (React Query Version)
 * ---------------------------------------------------
 * - Auto-cache entries
 * - Auto-refetch after sending
 * - Smooth scroll only on new messages
 */

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createEntry, fetchEntries } from "../utils/api";

function dateKey(iso) {
  return new Date(iso).toISOString().split("T")[0];
}

function formatDateCapsule(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Home() {
  const [text, setText] = useState("");
  const [jumpDate, setJumpDate] = useState("");
  const chatRef = useRef(null);
  const datePickerRef = useRef(null);
  const dateRefs = useRef({});
  const prevCount = useRef(0);

  /* =======================
     ⬇ Fetch entries
  ======================= */
  const { data: messages = [], refetch } = useQuery({
    queryKey: ["entries"],
    queryFn: fetchEntries,
  });

  /* =======================
     ⬇ Send Entry
  ======================= */
  const sendMutation = useMutation({
    mutationFn: (text) => createEntry(text),
    onSuccess: () => refetch(),
  });

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const local = {
      id: Date.now(),
      text,
      created_at: new Date().toISOString(),
    };
    sendMutation.mutate(local.text);
    setText("");
  }

  /* =======================
     ⬇ Auto scroll if new
  ======================= */
  useEffect(() => {
    if (!chatRef.current) return;
    if (messages.length > prevCount.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    prevCount.current = messages.length;
  }, [messages.length]);

  /* =======================
     ⬇ Jump to date scroll
  ======================= */
  function onJumpChange(e) {
    const value = e.target.value;
    setJumpDate(value);
    if (!value) return;
    setTimeout(() => {
      const target = dateRefs.current[value];
      if (target && chatRef.current) {
        chatRef.current.scrollTo({
          top: target.offsetTop - 60,
          behavior: "smooth",
        });
      }
    }, 60);
  }

  /* =======================
     ⬇ Group by date
  ======================= */
  const groups = messages.reduce((acc, m) => {
    const key = dateKey(m.created_at);
    (acc[key] ||= []).push(m);
    return acc;
  }, {});
  const sortedDates = Object.keys(groups).sort();

  return (
    <main className="h-screen flex flex-col bg-[#FAF7F2] text-[#2E2A26] font-[Inter,system-ui]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/90 backdrop-blur border-b border-[#E8E1DA] py-3 px-4 sm:px-6 flex items-center justify-between max-w-2xl mx-auto w-full">
        <span className="text-sm font-medium">💬 Personal Chat Room</span>

        <button
          type="button"
          onClick={() => datePickerRef.current?.showPicker()}
          className="text-[11px] px-3 py-1 rounded-full border border-[#D8C2AE] bg-[#F4E6D7] text-[#5C5147] hover:bg-[#EAD7C5]"
        >
          {jumpDate ? jumpDate : "Jump to date"}
        </button>

        <input
          type="date"
          ref={datePickerRef}
          className="hidden"
          value={jumpDate}
          onChange={onJumpChange}
        />
      </header>

      {/* Chat feed */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 max-w-2xl mx-auto w-full"
      >
        {messages.length === 0 && (
          <p className="text-xs text-center text-[#8C7F78] italic mt-6">
            Start writing anything. This space is only for you.
          </p>
        )}

        {sortedDates.map((dKey) => {
          const msgs = groups[dKey];
          return (
            <div key={dKey} className="mt-5">
              <div
                className="flex justify-center mb-2"
                ref={(el) => (dateRefs.current[dKey] = el)}
              >
                <span className="text-[11px] text-white bg-[#A89786] px-3 py-1 rounded-full shadow-sm">
                  {formatDateCapsule(msgs[0].created_at)}
                </span>
              </div>

              <div className="flex flex-col gap-[6px]">
                {msgs.map((m) => (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] bg-white border border-[#E8E1DA] rounded-2xl rounded-br-md px-4 py-2 shadow-sm">
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                        {m.text}
                      </p>
                      <p className="text-[10px] text-[#7E7A74] mt-1 text-right">
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-[#E8E1DA] bg-[#FAF7F2] px-3 sm:px-4 py-3 flex items-center gap-2 max-w-2xl mx-auto w-full"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 p-3 rounded-full border border-[#E8E1DA] bg-white resize-none text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D8C2AE]/40"
          rows={1}
        />

        <button
          type="submit"
          disabled={sendMutation.isLoading}
          className={`px-4 py-2 rounded-full text-white text-sm font-medium transition ${
            sendMutation.isLoading
              ? "bg-[#D8C2AE]/50 cursor-wait"
              : "bg-[#D8C2AE] hover:opacity-90 active:scale-95"
          }`}
        >
          {sendMutation.isLoading ? "..." : "Send"}
        </button>
      </form>
    </main>
  );
}
