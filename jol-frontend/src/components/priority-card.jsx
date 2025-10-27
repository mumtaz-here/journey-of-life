/**
 * Journey of Life — Priorities (Serif Title + Calm)
 */

import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function PriorityCard() {
  const [items, setItems] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const date = isoToday();

  async function fetchItems() {
    const res = await fetch(`${API}/priorities?date=${date}`);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { fetchItems(); }, []);

  async function toggle(id) {
    await fetch(`${API}/priorities/${id}/toggle`, { method: "PATCH" });
    fetchItems();
  }

  async function add() {
    if (!text.trim()) return;
    await fetch(`${API}/priorities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, date })
    });
    setText("");
    setShowInput(false);
    fetchItems();
  }

  const canAdd = items.length < 3;

  return (
    <section className="p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft space-y-3">
      <h2 className="heading">Today’s Top Priorities</h2>

      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border ${p.status === "done" ? "opacity-65" : ""}`}>
            <input
              type="checkbox"
              checked={p.status === "done"}
              onChange={() => toggle(p.id)}
              className="accent-[#9EC3B0]"
            />
            <span className={`text-sm ${p.status === "done" ? "line-through text-[#7E7A74]" : ""}`}>
              {p.text}
            </span>
          </li>
        ))}
      </ul>

      {canAdd && !showInput && (
        <button
          onClick={() => setShowInput(true)}
          className="w-full px-3 py-2 rounded-xl bg-[#9EC3B0] text-white text-sm hover:bg-[#86b7a0]"
        >
          + Add priority
        </button>
      )}

      {showInput && (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl px-3 py-2 border text-sm bg-[#FAF7F2]"
            placeholder="What matters today?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <button
            onClick={add}
            className="px-3 py-2 rounded-xl bg-[#9EC3B0] text-white text-sm"
          >
            save
          </button>
        </div>
      )}
    </section>
  );
}
