/**
 * Journey of Life — Component: PriorityToday
 * -------------------------------------------
 * Calm interactive bar for "Today's Priorities".
 * - Displays up to 3 editable priorities.
 * - Auto-saves to localStorage via utils/storage.js
 * - Designed to feel quiet, focused, and responsive without rush.
 *
 * Motion: soft fade + slide (250–350ms, ease-out-quad)
 * Colors: warm cream background, espresso text, sage & coral hints
 */

import React, { useEffect, useState } from "react";
import { save, load } from "../utils/storage";

/**
 * Gentle utility: fade-in transition
 */
const fadeClass =
  "transition-all duration-300 ease-out-quart opacity-90 hover:opacity-100";

/**
 * Base styles (Tailwind)
 */
const baseContainer =
  "w-full rounded-2xl bg-[#FAF7F2] p-4 shadow-sm border border-[#E8E1DA]";

const itemClass =
  "flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#EDE7E0]/50 transition-colors duration-200";

const inputClass =
  "flex-1 bg-transparent border-b border-[#CBB9A8] focus:outline-none text-[#2E2A26] placeholder-[#7E7A74]/70 text-base font-medium tracking-wide";

/**
 * PriorityToday Component
 */
export default function PriorityToday() {
  const [priorities, setPriorities] = useState(() => load("priorities") || []);
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Save whenever priorities change
  useEffect(() => {
    save("priorities", priorities);
  }, [priorities]);

  function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const updated = [...priorities, input.trim()].slice(0, 3);
    setPriorities(updated);
    setInput("");
    setIsAdding(false);
  }

  function handleRemove(idx) {
    const updated = priorities.filter((_, i) => i !== idx);
    setPriorities(updated);
  }

  return (
    <div className={`${baseContainer} ${fadeClass}`}>
      <h2 className="text-lg font-semibold text-[#2E2A26] mb-3">
        Today’s Priorities
      </h2>

      <ul className="space-y-2">
        {priorities.length === 0 && (
          <li className="text-[#7E7A74] italic text-sm">
            Nothing yet — add what matters most today.
          </li>
        )}

        {priorities.map((p, idx) => (
          <li key={idx} className={`${itemClass} group`}>
            <span className="flex-1 text-[#2E2A26]">{p}</span>
            <button
              aria-label="Remove priority"
              onClick={() => handleRemove(idx)}
              className="opacity-0 group-hover:opacity-70 transition-opacity duration-200 text-[#7E7A74] hover:text-[#F2B8A2]"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new priority..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={inputClass}
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#CBB9A8]/80 text-[#FAF7F2] text-sm hover:bg-[#CBB9A8] transition-all duration-200"
          >
            Save
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-3 text-sm text-[#7E7A74] hover:text-[#2E2A26] transition-colors duration-200"
        >
          + Add priority
        </button>
      )}
    </div>
  );
}
