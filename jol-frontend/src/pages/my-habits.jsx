/**
 * Journey of Life — Page: My Habits
 * ---------------------------------
 * - Centang = log "(habit) Completed: <title>" ke entries
 * - Un-centang = log "(habit) Uncompleted: <title>" ke entries
 * - UI status selalu diambil dari server (NO fallback guessing)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHabits,
  addHabit,
  toggleHabit,
  deleteHabit,
  createEntry,
} from "../utils/api.js";

const container =
  "max-w-2xl mx-auto px-4 py-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen flex flex-col gap-4";
const card = "bg-white border border-[#E8E1DA] rounded-2xl shadow-sm";
const sub = "text-sm opacity-70";

export default function MyHabits() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  /* 🔄 Load habits */
  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });

  /* ➕ Add habit */
  const addMutation = useMutation({
    mutationFn: (newTitle) => addHabit(newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setTitle("");
    },
  });

  /* 🔄 Toggle + log entry */
  const toggleMutation = useMutation({
    mutationFn: (habit) => toggleHabit(habit.id),

    async onSuccess(updatedHabit, originalHabit) {
      // always refresh UI first
      queryClient.invalidateQueries({ queryKey: ["habits"] });

      // FIX: react-query returns data inside `updatedHabit`
      const newStatus = updatedHabit?.status;

      // ❓ if for some reason undefined, DO NOT log anything
      if (!newStatus) return;

      const baseText =
        newStatus === "done"
          ? "(habit) Completed: "
          : "(habit) Uncompleted: ";

      await createEntry(`${baseText}${originalHabit.title}`);
    },
  });

  /* 🗑 Delete habit */
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const habits = habitsQuery.data || [];

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addMutation.mutate(title.trim());
  }

  return (
    <main className={container}>
      <header className="text-center">
        <h1 className="text-xl font-semibold">My Habits</h1>
        <p className={sub}>Small daily actions that support your journey.</p>
      </header>

      {/* Form add habit */}
      <section className={`${card} p-4`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
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

      {/* List habits */}
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
          <ul className="flex flex-col gap-2">
            {habits.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-[#F9F5F0]"
              >
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(h)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] ${
                      h.status === "done"
                        ? "bg-[#2E2A26] border-[#2E2A26] text-white"
                        : "bg-white border-[#CBB9A8] text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-sm ${
                      h.status === "done" ? "line-through opacity-60" : ""
                    }`}
                  >
                    {h.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(h.id)}
                  className="text-[11px] text-[#B08A7A] hover:text-[#8C5E48]"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
