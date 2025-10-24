/**
 * Journey of Life — Model: Habits
 * -------------------------------
 * Handles creation, retrieval, and updates of daily habits.
 */

import db from "../index.js";

export async function initHabitsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      streak INT DEFAULT 0,
      last_checked DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
  console.log("🌱 Table 'habits' ready.");
}

export async function getAllHabits() {
  const result = await db.query("SELECT * FROM habits ORDER BY created_at DESC");
  return result.rows;
}

export async function addHabit(title) {
  const result = await db.query(
    "INSERT INTO habits (title) VALUES ($1) RETURNING *",
    [title]
  );
  return result.rows[0];
}

export async function toggleHabit(id) {
  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

  const checkQuery = "SELECT * FROM habits WHERE id = $1";
  const result = await db.query(checkQuery, [id]);
  const habit = result.rows[0];

  if (!habit) throw new Error("Habit not found");

  let newStreak = habit.streak;
  let newDate = habit.last_checked;

  if (habit.last_checked === today) {
    newStreak = Math.max(0, habit.streak - 1);
    newDate = null;
  } else {
    newStreak = habit.streak + 1;
    newDate = today;
  }

  const updateQuery =
    "UPDATE habits SET streak = $1, last_checked = $2 WHERE id = $3 RETURNING *";
  const updated = await db.query(updateQuery, [newStreak, newDate, id]);
  return updated.rows[0];
}

export async function deleteHabit(id) {
  await db.query("DELETE FROM habits WHERE id = $1", [id]);
  return true;
}
