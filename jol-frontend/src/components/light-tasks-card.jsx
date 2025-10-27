/**
 * Journey of Life — Light Tasks (Serif Title)
 */

import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function LightTasksCard() {
  const [habits, setHabits] = useState([]);
  const [skipped, setSkipped] = useState([]);

  async function fetchHabits() {
    const res = await fetch(`${API}/habits`);
    const data = await res.json();
    setHabits(data);
  }

  useEffect(() => { fetchHabits(); }, []);

  const today = isoToday();
  const candidates = habits.filter(h => h.last_checked !== today && !skipped.includes(h.id));
  const three = useMemo(() => candidates.slice(0, 3), [candidates]);

  async function handleCheck(id) {
    await fetch(`${API}/habits/${id}/toggle`, { method: "PATCH" });
    fetchHabits();
  }

  function handleSkip(id) {
    setSkipped(prev => [...prev, id]);
  }

  return (
    <section className="p-5 rounded-soft bg-white border border-[#ECE5DD] shadow-soft space-y-3">
      <h2 className="heading">3 Light Tasks for Now</h2>
      {three.length === 0 ? (
        <p className="text-[#7E7A74] text-sm italic">You’re all set for now 🤍</p>
      ) : (
        <ul className="space-y-2">
          {three.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border hover:shadow-md transition"
            >
              <span className="text-sm">{h.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCheck(h.id)}
                  className="px-3 py-1 rounded-lg text-xs text-white bg-[#9EC3B0] hover:bg-[#86b7a0]"
                >
                  done
                </button>
                <button
                  onClick={() => handleSkip(h.id)}
                  className="px-3 py-1 rounded-lg text-xs text-[#7E7A74] hover:text-[#2E2A26]"
                >
                  skip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
