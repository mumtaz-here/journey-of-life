/**
 * Journey of Life — DB Model: Habits (FINAL MATCHING TABLE STRUCTURE)
 */

import db from "../index.js";

// 🔍 Ambil semua habit
export async function getAll() {
  const res = await db.query(
    "SELECT id, title, streak, last_checked, created_at FROM habits ORDER BY id DESC"
  );
  return res.rows;
}

// ➕ Tambah habit baru (default streak 0)
export async function create(title) {
  const res = await db.query(
    `INSERT INTO habits (title, streak, last_checked)
     VALUES ($1, 0, CURRENT_DATE)
     RETURNING *`,
    [title]
  );
  return res.rows[0];
}

// 🔄 Toggle habit (update streak)
export async function toggle(id) {
  // Ambil data habit
  const cur = await db.query("SELECT * FROM habits WHERE id=$1", [id]);
  if (cur.rows.length === 0) return null;

  const habit = cur.rows[0];
  const today = new Date().toISOString().slice(0, 10);

  let newStreak = habit.streak || 0;

  // kalau belum dicentang hari ini, tambah streak
  if (!habit.last_checked || habit.last_checked.toISOString().slice(0, 10) !== today) {
    newStreak += 1;
  }

  // update habit
  const res = await db.query(
    `UPDATE habits
     SET streak=$1, last_checked=CURRENT_DATE
     WHERE id=$2
     RETURNING *`,
    [newStreak, id]
  );

  return res.rows[0];
}

// 🗑️ Hapus habit
export async function remove(id) {
  await db.query("DELETE FROM habits WHERE id=$1", [id]);
}
