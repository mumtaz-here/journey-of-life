/**
 * Journey of Life — Page: Home
 * ----------------------------
 * The calm center of the app.
 * Includes:
 * - Quote of the day (rotating)
 * - 3 Light Tasks for Now
 * - Today's Priorities bar
 * - Journal input area
 * - Recent entries preview
 */

import React, { useEffect, useState } from "react";
import Quote from "../components/quote";
import { load, save } from "../utils/storage";
import { parseEntry } from "../utils/parser";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Home() {
  const [journal, setJournal] = useState("");
  const [entries, setEntries] = useState([]);
  const [priorities, setPriorities] = useState(() => load("priorities") || []);
  const [lightTasks, setLightTasks] = useState(() => load("light-tasks") || []);

  // Load previous entries
  useEffect(() => {
    const saved = load("entries") || [];
    setEntries(saved);
  }, []);

  // Persist changes
  useEffect(() => {
    save("priorities", priorities);
    save("light-tasks", lightTasks);
  }, [priorities, lightTasks]);

  function addPriority() {
    const text = prompt("Add a focus for today?");
    if (text && text.trim()) {
      setPriorities([...priorities, text.trim()]);
    }
  }

  function removePriority(i) {
    setPriorities(priorities.filter((_, idx) => idx !== i));
  }

  function handleSaveEntry() {
    if (!journal.trim()) return;
    const newEntry = {
      id: Date.now(),
      text: journal.trim(),
      analysis: parseEntry(journal.trim()),
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    save("entries", updated);
    setJournal("");
  }

  const defaultLight = [
    "Stretch for 2 minutes",
    "Drink a glass of water",
    "Look away from the screen for 10 seconds",
  ];

  useEffect(() => {
    if (lightTasks.length === 0) setLightTasks(defaultLight);
  }, []);

  return (
    <main className={container}>
      {/* 🪞 Quote of the Day */}
      <section>
        <Quote />
      </section>

      {/* 🌿 Today's Priorities */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h2 className="text-lg font-semibold mb-3">Today's Priorities</h2>
        <ul className="space-y-2">
          {priorities.map((p, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#EDE7E0]/50 text-sm"
            >
              <span>{p}</span>
              <button
                onClick={() => removePriority(i)}
                className="text-[#7E7A74] hover:text-[#F2B8A2] transition-colors duration-200"
              >
                ✕
              </button>
            </li>
          ))}
          {priorities.length === 0 && (
            <li className="text-[#7E7A74] italic text-sm">
              No focus yet. Add one below.
            </li>
          )}
        </ul>
        <button
          onClick={addPriority}
          className="mt-3 text-sm text-[#7E7A74] hover:text-[#2E2A26] transition-colors duration-200"
        >
          + Add priority
        </button>
      </section>

      {/* ☁️ Light Tasks for Now */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h2 className="text-lg font-semibold mb-3">3 Light Tasks for Now</h2>
        <ul className="space-y-2">
          {lightTasks.map((t, i) => (
            <li
              key={i}
              className="px-3 py-2 rounded-xl bg-[#E8E1DA]/40 text-[#2E2A26] text-sm hover:bg-[#EDE7E0]/70 transition-all duration-200"
            >
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ✍️ Journal Input */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h2 className="text-lg font-semibold mb-3">How are you feeling today?</h2>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="Write freely... (your words stay private)"
          className="w-full h-32 rounded-xl border border-[#E8E1DA] bg-white/60 px-3 py-2 text-sm focus:outline-none focus:border-[#CBB9A8] transition-all duration-300"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveEntry}
            disabled={!journal.trim()}
            className={`px-4 py-2 rounded-xl text-sm text-[#FAF7F2] transition-all duration-300 ${
              journal.trim()
                ? "bg-[#9EC3B0]/90 hover:bg-[#9EC3B0]"
                : "bg-[#CBB9A8]/40 cursor-not-allowed"
            }`}
          >
            Save entry
          </button>
        </div>
      </section>

      {/* 📜 Recent Entries */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h2 className="text-lg font-semibold mb-3">Recent Reflections</h2>
        {entries.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            You haven’t written anything yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.slice(0, 3).map((e) => (
              <li
                key={e.id}
                className="p-3 rounded-xl bg-[#EDE7E0]/40 hover:bg-[#EDE7E0]/70 transition-all duration-300"
              >
                <p className="text-sm leading-relaxed">{e.text}</p>
                <p className="text-xs text-[#7E7A74] mt-1">
                  {new Date(e.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
