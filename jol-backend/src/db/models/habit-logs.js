/**
 * Journey of Life — Model: Habit Logs (FINAL FIX FOR LOCAL DATE MATCH)
 */

import db from "../index.js";

// CREATE TABLE
export async function initHabitLogsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id SERIAL PRIMARY KEY,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      log_date DATE NOT NULL,
      status VARCHAR(10) DEFAULT 'done',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (habit_id, log_date)
    );
  `);

  console.log("🟩 Table 'habit_logs' ready.");
}

/* ---------------------------------------------------
   LOCAL-DATE MATCHING USING log_date::text = YYYY-MM-DD
--------------------------------------------------- */

// GET LOG FOR SPECIFIC DAY
export async function getLogForDate(habitId, dateKey) {
  const result = await db.query(
    `
      SELECT *
      FROM habit_logs
      WHERE habit_id = $1
        AND log_date::text = $2
      LIMIT 1;
    `,
    [habitId, dateKey]
  );
  return result.rows[0] || null;
}

// CREATE DONE LOG
export async function createLog(habitId, dateKey) {
  const result = await db.query(
    `
      INSERT INTO habit_logs (habit_id, log_date, status)
      VALUES ($1, $2::date, 'done')
      ON CONFLICT (habit_id, log_date)
      DO UPDATE SET status = 'done'
      RETURNING *;
    `,
    [habitId, dateKey]
  );
  return result.rows[0];
}

// DELETE
export async function deleteLog(habitId, dateKey) {
  await db.query(
    `
      DELETE FROM habit_logs
      WHERE habit_id = $1
        AND log_date::text = $2;
    `,
    [habitId, dateKey]
  );
  return true;
}
