/**
 * Journey of Life — Model: Habits (Fixed)
 * ---------------------------------------
 * Manages table creation and CRUD for habits.
 */

import db from "../index.js";

// ✅ Create table
export async function initHabitsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      is_done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
  console.log("🌿 Table 'habits' ready.");
}

// ✅ Get all
export async function getAll() {
  const result = await db.query("SELECT * FROM habits ORDER BY id ASC");
  return result.rows;
}

// ✅ Add habit
export async function addHabit(title) {
  const result = await db.query(
    "INSERT INTO habits (title) VALUES ($1) RETURNING *",
    [title]
  );
  return result.rows[0];
}

// ✅ Toggle habit done
export async function toggleHabit(id) {
  const result = await db.query(
    `UPDATE habits
     SET is_done = NOT is_done
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
}

// ✅ Delete habit
export async function deleteHabit(id) {
  await db.query("DELETE FROM habits WHERE id = $1", [id]);
  return true;
}
