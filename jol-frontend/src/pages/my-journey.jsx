/**
 * Journey of Life — Page: My Journey
 * ----------------------------------
 * Scrollable archive of all journal entries.
 * Emphasis: reflection, continuity, and calm pacing.
 *
 * Features:
 * - Lists all entries saved in localStorage (latest first)
 * - Uses <EntryCard /> for visual consistency
 * - Optional search filter (simple text)
 */

import React, { useState, useEffect } from "react";
import EntryCard from "../components/entry-card";
import { load } from "../utils/storage";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26]";

export default function MyJourney() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const data = load("entries") || [];
    setEntries(data);
  }, []);

  const filtered = entries.filter((e) =>
    e.text.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className={container}>
      <h1 className="text-2xl font-[Playfair_Display] mb-2">
        My Journey
      </h1>
      <p className="text-sm text-[#7E7A74] mb-4">
        A quiet archive of your reflections. Scroll slowly.
      </p>

      <input
        type="text"
        placeholder="Search thoughts..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-xl border border-[#E8E1DA] bg-[#FAF7F2] px-3 py-2 text-sm focus:outline-none focus:border-[#CBB9A8] transition-all duration-200"
      />

      <div className="mt-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            Nothing found. Try another word or write something new.
          </p>
        ) : (
          filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </main>
  );
}
