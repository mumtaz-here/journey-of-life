/**
 * Journey of Life — Page: Home (Stable Send + No Refresh Bug)
 * -----------------------------------------------------------
 * - Setelah kirim, langsung muncul hasil dari server (tidak perlu refresh)
 * - Anti double klik / spam
 * - Habit log bersih (tanpa jam duplikat, jam tetap di pojok bubble)
 */

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createEntry, fetchEntries } from "../utils/api.js";

function dateKey(iso) {
  return new Date(iso).toISOString().split("T")[0];
}

function formatDateChip(iso) {
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

/* 🔧 Hilangkan jam duplikat dari teks habit logs */
function cleanHabitText(text) {
  return text.replace(/—?\s*\d{1,2}:\d{2}$/, "").trim();
}

export default function Home() {
  const [text, setText] = useState("");
  const [jumpDate, setJumpDate] = useState("");
  const chatRef = useRef(null);
  const datePickerRef = useRef(null);
  const dateRefs = useRef({});
  const prevCount = useRef(0);
  const queryClient = useQueryClient();

  /* 📥 Load entries */
  const { data: messages = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: fetchEntries,
  });

  /* 📤 Send entry (tanpa optimistic UI, aman) */
  const sendMutation = useMutation({
    mutationFn: (t) => createEntry(t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setText(""); // reset input setelah server selesai simpan
    },
  });

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sendMutation.isLoading) return;
    sendMutation.mutate(text.trim());
  }

  /* 🔄 Auto-scroll jika ada pesan baru */
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

  /* 🎯 Jump to date */
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

  /* 📌 Group by date */
  const groups = messages.reduce((acc, m) => {
    (acc[dateKey(m.created_at)] ||= []).push(m);
    return acc;
  }, {});
  const sortedDates = Object.keys(groups).sort();

  return (
    <main className="h-screen flex flex-col bg-[#FAF7F2] text-[#2E2A26] font-[Inter,system-ui]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/90 backdrop-blur border-b border-[#E8E1DA] py-3 px-3 sm:px-4 flex items-center justify-between max-w-2xl mx-auto w-full">
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
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 max-w-2xl mx-auto w-full"
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
              {/* Capsule date */}
              <div
                className="flex justify-center mb-2"
                ref={(el) => (dateRefs.current[dKey] = el)}
              >
                <span className="text-[11px] text-white bg-[#A89786] px-3 py-1 rounded-full shadow-sm">
                  {formatDateChip(msgs[0].created_at)}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-[6px]">
                {msgs.map((m) => (
                  <div key={m.id} className="flex justify-end">
                    <div
                      className="max-w-[85%] bg-white border border-[#E8E1DA] rounded-2xl rounded-br-md px-4 py-2 shadow-sm"
                      style={{ wordBreak: "break-word" }}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                        {cleanHabitText(m.text)}
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
          disabled={sendMutation.isLoading}
        />

        <button
          type="submit"
          disabled={sendMutation.isLoading || !text.trim()}
          className={`px-4 py-2 rounded-full text-white text-sm font-medium transition ${
            sendMutation.isLoading || !text.trim()
              ? "bg-[#D8C2AE]/50 cursor-wait"
              : "bg-[#D8C2AE] hover:opacity-90 active:scale-95"
          }`}
        >
          {sendMutation.isLoading ? "…" : "Send"}
        </button>
      </form>
    </main>
  );
}
