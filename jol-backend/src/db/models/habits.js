/**
 * Journey of Life — Model: Habits (FINAL FIXED)
 */

import db from "../index.js";

// CREATE TABLE
export async function initHabitsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("🌿 Table 'habits' ready.");
}

// Convert date → YYYY-MM-DD
function toKey(d) {
  return new Date(d).toISOString().split("T")[0];
}

/* --------------------------------------------------------
   GET ALL HABITS + TODAY STATUS + STREAK
   🔥 FIXED:
   - log_date::text for all comparisons
   -------------------------------------------------------- */
export async function getHabitsWithTodayStatus(todayKey) {
  const habitsRes = await db.query(`SELECT * FROM habits ORDER BY id ASC`);
  const habits = habitsRes.rows;

  if (habits.length === 0) return [];

  // ⭐ FIX: log_date::text <= $1
  const logsRes = await db.query(
    `
      SELECT habit_id, log_date, status
      FROM habit_logs
      WHERE log_date::text <= $1
    `,
    [todayKey]
  );

  const byHabit = new Map();
  for (const log of logsRes.rows) {
    if (!byHabit.has(log.habit_id)) byHabit.set(log.habit_id, []);
    byHabit.get(log.habit_id).push(log);
  }

  function computeStreak(id) {
    const logs = byHabit.get(id) || [];
    const doneDates = new Set(
      logs
        .filter(l => l.status === "done")
        .map(l => toKey(l.log_date))
    );

    let streak = 0;
    let cursor = new Date(todayKey);

    for (let i = 0; i < 365; i++) {
      const k = toKey(cursor);
      if (doneDates.has(k)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  }

  return habits.map(h => {
    const logs = byHabit.get(h.id) || [];
    const doneToday = logs.some(
      l => toKey(l.log_date) === todayKey && l.status === "done"
    );

    return {
      ...h,
      today_done: doneToday,
      streak: computeStreak(h.id),
    };
  });
}

export async function getHabitWithTodayStatus(id, todayKey) {
  const list = await getHabitsWithTodayStatus(todayKey);
  return list.find(h => h.id === Number(id)) || null;
}

export async function addHabit(title) {
  const res = await db.query(
    `INSERT INTO habits (title) VALUES ($1) RETURNING *`,
    [title]
  );

  return {
    ...res.rows[0],
    today_done: false,
    streak: 0,
  };
}

export async function deleteHabit(id) {
  await db.query(`DELETE FROM habits WHERE id = $1`, [id]);
  return true;
}
