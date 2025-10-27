/**
 * Journey of Life — Today’s Plans (Serif Title)
 */

import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function TodayPlansCard() {
  const [items, setItems] = useState([]);
  const today = isoToday();

  async function fetchPlans() {
    const res = await fetch(`${API}/highlights`);
    const data = await res.json();
    const t = data.filter(h => (h.planned_date || "").startsWith(today));
    setItems(t);
  }

  useEffect(() => { fetchPlans(); }, []);

  async function toggle(id) {
    await fetch(`${API}/highlights/${id}/toggle`, { method: "PATCH" });
    fetchPlans();
  }

  return (
    <section className="p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft space-y-3">
      <h2 className="heading">Today’s Plans</h2>

      {items.length === 0 ? (
        <p className="text-[#7E7A74] text-sm italic">No plans for today yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border">
              <span className="text-sm">{p.text}</span>
              <button
                onClick={() => toggle(p.id)}
                className="px-3 py-1 rounded-lg text-xs text-[#7E7A74] hover:text-[#2E2A26]"
              >
                toggle
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
