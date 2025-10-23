// src/pages/habit/HabitMain.jsx
import { useEffect, useState } from "react";

export default function HabitMain() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("journeyHabits") || "[]");
    setHabits(saved.filter((h) => h.status === "active"));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <h1 className="text-base font-semibold text-neutral-900 mb-2">Habit Utama</h1>
        {!habits.length ? (
          <p className="text-sm text-neutral-500">Belum ada habit aktif.</p>
        ) : (
          <ul className="space-y-2">
            {habits.map((h) => (
              <li key={h.id} className="border border-neutral-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">{h.title}</span>
                  <span className="text-xs text-neutral-500">{h.schedule || "fleksibel"}</span>
                </div>
                {h.note ? (
                  <p className="text-xs text-neutral-600 mt-1">{h.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
