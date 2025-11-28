/**
 * Journey of Life — My Habits (Ultra Clean + Fast)
 * ------------------------------------------------
 * - Zero flicker toggle
 * - One refetch only
 * - True anti-duplicate logging (700ms buffer)
 * - Memoized habit list (super fast)
 */

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHabits,
  addHabit,
  toggleHabit,
  deleteHabit,
  createEntry,
} from "../utils/api.js";

/* -----------------------
   SHARED STYLE TOKENS
------------------------- */
const container =
  "max-w-2xl mx-auto px-4 sm:px-5 py-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen flex flex-col gap-4";

const card = "bg-white border border-[#E8E1DA] rounded-2xl shadow-sm";
const sub = "text-sm opacity-70";

/* -----------------------
   HABIT ITEM COMPONENT
------------------------- */
function HabitItem({ habit, onToggle, onDelete }) {
  return (
    <li
      className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-[#F9F5F0]"
    >
      <button
        type="button"
        onClick={() => onToggle(habit)}
        className="flex items-center gap-2"
      >
        <span
          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] transition ${
            habit.status === "done"
              ? "bg-[#2E2A26] border-[#2E2A26] text-white"
              : "bg-white border-[#CBB9A8] text-transparent"
          }`}
        >
          ✓
        </span>

        <span
          className={`text-sm transition ${
            habit.status === "done" ? "line-through opacity-60" : ""
          }`}
        >
          {habit.title}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onDelete(habit.id)}
        className="text-[11px] text-[#B08A7A] hover:text-[#8C5E48]"
      >
        Delete
      </button>
    </li>
  );
}

/* ==========================================================
   PAGE COMPONENT
========================================================== */
export default function MyHabits() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  // REAL anti-double-log (buffer 700ms)
  const lastLogRef = useRef(0);

  /* Load habits */
  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const habits = habitsQuery.data || [];

  /* Add habit */
  const addMutation = useMutation({
    mutationFn: addHabit,
    onSuccess: () => {
      queryClient.invalidateQueries(["habits"]);
      setTitle("");
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMutation.mutate(title.trim());
  };

  /* Toggle habit */
  const toggleMutation = useMutation({
    mutationFn: (habit) => toggleHabit(habit.id),

    async onSuccess(updatedHabit, originalHabit) {
      // update UI only once
      queryClient.invalidateQueries(["habits"]);

      const newStatus = updatedHabit.status;
      if (!newStatus) return;

      // anti spam (700ms = lebih manusiawi)
      const now = Date.now();
      if (now - lastLogRef.current < 700) return;
      lastLogRef.current = now;

      // write entry
      const base =
        newStatus === "done"
          ? "(habit) Completed: "
          : "(habit) Uncompleted: ";

      await createEntry(base + originalHabit.title);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries(["habits"]);
    },
  });

  /* Memoize items for speed */
  const renderedList = useMemo(
    () =>
      habits.map((h) => (
        <HabitItem
          key={h.id}
          habit={h}
          onToggle={(hb) => toggleMutation.mutate(hb)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )),
    [habits, toggleMutation.isLoading, deleteMutation.isLoading]
  );

  /* ==========================================================
     RENDER
  ========================================================== */
  return (
    <main className={container}>
      <header className="text-center">
        <h1 className="text-xl font-semibold">My Habits</h1>
        <p className={sub}>Small daily actions that support your journey.</p>
      </header>

      {/* Add Habit */}
      <section className={`${card} p-4`}>
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a gentle habit…"
            className="flex-1 px-3 py-2 rounded-xl border border-[#E8E1DA] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D8C2AE]/50"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition ${
              addMutation.isPending
                ? "bg-[#D8C2AE]/60 cursor-wait"
                : "bg-[#D8C2AE] hover:opacity-90 active:scale-95"
            }`}
          >
            {addMutation.isPending ? "Adding…" : "Add"}
          </button>
        </form>
      </section>

      {/* Habit List */}
      <section className={`${card} p-4 flex-1`}>
        {habitsQuery.isLoading && (
          <p className="text-sm text-center text-[#8C7F78]">Loading habits…</p>
        )}

        {!habitsQuery.isLoading && habits.length === 0 && (
          <p className="text-sm text-center text-[#8C7F78]">
            No habits yet. Start with something very small 🌱
          </p>
        )}

        {!habitsQuery.isLoading && habits.length > 0 && (
          <ul className="flex flex-col gap-2">{renderedList}</ul>
        )}
      </section>
    </main>
  );
}
