/**
 * Journey of Life — Page: My Habits (Playful Deep Pastel)
 */

import { useEffect, useState } from "react";
import {
  fetchHabits,
  addHabit,
  toggleHabit,
  deleteHabit,
  createEntry,
  deleteEntryByText,    // ← NEW
} from "../utils/api";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen";

export default function MyHabits() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // load habits
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchHabits();
    if (Array.isArray(data)) setHabits(data);
  }

  // add new habit
  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setAdding(true);
    await addHabit(newHabit.trim());
    setNewHabit("");
    await load();
    setAdding(false);
  }

  // toggle today's completion
  async function handleToggle(habit) {
    const wasDone = habit.today_done;
    setTogglingId(habit.id);

    await toggleHabit(habit.id);
    await load();
    setTogglingId(null);

    // ✔ add bubble when checking
    if (!wasDone) {
      await createEntry(`(habit) Completed: ${habit.title}`);
    }

    // ✔ remove bubble when unchecking
    if (wasDone) {
      await deleteEntryByText(`(habit) Completed: ${habit.title}`);
    }
  }

  // delete habit
  async function handleDelete(habit) {
    setDeletingId(habit.id);
    await deleteHabit(habit.id);
    await load();
    setDeletingId(null);
  }

  return (
    <main className={container}>
      <header>
        <h1 className="text-xl font-semibold">My Habits</h1>
        <p className="text-sm text-[#7E7A74] mt-1">
          Gentle checklists to support your days.
        </p>
      </header>

      {/* Add habit */}
      <section className="bg-white border border-[#E8E1DA] rounded-2xl p-5 shadow-sm">
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit…"
            className="flex-1 p-3 rounded-xl bg-[#FFFBF4] border border-[#E8E1DA] text-sm"
          />
          <button
            type="submit"
            disabled={adding}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition ${
              adding
                ? "bg-[#CBB9A8]/40 cursor-wait"
                : "bg-[#9EC3B0] hover:bg-[#86b7a0]"
            }`}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </section>

      {/* Habits list */}
      <section className="bg-white border border-[#E8E1DA] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        {habits.length === 0 ? (
          <p className="text-sm text-[#7E7A74] italic">
            No habits yet.
          </p>
        ) : (
          habits.map((h) => {
            const isToggling = togglingId === h.id;
            const isDeleting = deletingId === h.id;
            const streakLabel =
              h.streak > 0
                ? `${h.streak} day${h.streak > 1 ? "s" : ""} in a row`
                : "No streak yet";

            return (
              <div
                key={h.id}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl border bg-[#FFF8EE] hover:bg-[#F9EEDC]"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(h)}
                  disabled={isToggling}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center ${
                    h.today_done
                      ? "bg-[#9EC3B0] border-[#7FAE97] text-white"
                      : "bg-white border-[#D8C2AE] text-transparent"
                  }`}
                >
                  ✓
                </button>

                <div className="flex-1 flex flex-col min-w-0">
                  <span
                    className={`text-sm truncate ${
                      h.today_done ? "line-through text-[#9C8F86]" : "text-[#2E2A26]"
                    }`}
                  >
                    {h.title}
                  </span>
                  <span className="text-[11px] text-[#A09184]">🔥 {streakLabel}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(h)}
                  disabled={isDeleting}
                  className="text-[11px] px-2 py-1 rounded-full border border-[#D4B0A8]"
                >
                  {isDeleting ? "…" : "delete"}
                </button>
              </div>
            );
          })
        )}
      </section>

      <p className="text-center text-[11px] text-[#A6998C] italic mt-2">
        You don&apos;t have to be perfect—showing up counts.
      </p>
    </main>
  );
}
