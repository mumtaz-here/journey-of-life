// src/pages/habit/HabitBuild.jsx
import { useEffect, useState } from "react";

export default function HabitBuild() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // contoh data kandidat habit hasil deteksi AI (dummy dulu)
    const saved = JSON.parse(localStorage.getItem("journeyHabitCandidates") || "[]");
    if (saved.length) setCandidates(saved);
    else {
      setCandidates([
        { id: "h1", title: "Mandi pagi", note: "", status: "candidate" },
        { id: "h2", title: "Peregangan 5 menit setelah kerja", note: "", status: "candidate" },
      ]);
    }
  }, []);

  const activate = (h) => {
    const habits = JSON.parse(localStorage.getItem("journeyHabits") || "[]");
    const newHabit = { ...h, status: "active", schedule: "harian" };
    localStorage.setItem("journeyHabits", JSON.stringify([newHabit, ...habits]));
    setCandidates((prev) => prev.filter((x) => x.id !== h.id));
  };

  const dismiss = (h) => {
    setCandidates((prev) => prev.filter((x) => x.id !== h.id));
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <h1 className="text-base font-semibold text-neutral-900 mb-2">Habit yang Akan Dibangun</h1>
        {!candidates.length ? (
          <p className="text-sm text-neutral-500">Belum ada usulan habit.</p>
        ) : (
          <ul className="space-y-3">
            {candidates.map((c) => (
              <li key={c.id} className="border border-neutral-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">{c.title}</span>
                </div>
                {c.note ? <p className="text-xs text-neutral-600 mt-1">{c.note}</p> : null}

                <div className="mt-2 flex gap-2 justify-end">
                  <button
                    onClick={() => dismiss(c)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  >
                    Lewati
                  </button>
                  <button
                    onClick={() => activate(c)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-neutral-900 text-white"
                  >
                    Aktifkan
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
