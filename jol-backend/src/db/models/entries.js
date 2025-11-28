/**
 * Journey of Life — Model: Entries (AI-only, no manual analysis)
 * --------------------------------------------------------------
 * - Stores raw text from user
 * - Does NOT store parsed analysis anymore
 * - Other tables (summaries, highlights, story) use AI and reference entries
 */

import db from "../index.js";

// 🧱 Create table if not exists (clean, no analysis column)
export async function initEntriesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("🪶 Table 'entries' ready.");
}

// 🔍 Get all entries, newest last (for chat scrolling)
export async function getAllEntries() {
  const result = await db.query(`
    SELECT * FROM entries ORDER BY created_at ASC;
  `);
  return result.rows;
}

// 🔍 Get entries for specific day (YYYY-MM-DD)
export async function getEntriesByDate(dateKey) {
  const result = await db.query(
    `
      SELECT * FROM entries
      WHERE created_at::date = $1::date
      ORDER BY created_at ASC;
    `,
    [dateKey]
  );
  return result.rows;
}

// 🔍 Get entries since N last days (for lighter UIs)
export async function getEntriesSince(days) {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;

  const result = await db.query(
    `
      SELECT *
      FROM entries
      WHERE created_at >= NOW() - $1::interval
      ORDER BY created_at ASC;
    `,
    [`${safeDays} days`]
  );

  return result.rows;
}

// ➕ Insert entry (text only)
export async function addEntry(text) {
  const result = await db.query(
    `
      INSERT INTO entries (text)
      VALUES ($1)
      RETURNING *;
    `,
    [text]
  );
  return result.rows[0];
}

// 🗑️ Delete entry (id)
export async function deleteEntry(id) {
  await db.query(`DELETE FROM entries WHERE id = $1`, [id]);
  return true;
}
