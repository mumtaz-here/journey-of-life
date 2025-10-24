/**
 * Journey of Life — Model: Entries
 * --------------------------------
 * Handles SQL structure & queries for journal entries.
 */

import db from "../index.js";

export async function initEntriesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      analysis JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
  console.log("🪶 Table 'entries' ready.");
}

export async function getAllEntries() {
  const result = await db.query("SELECT * FROM entries ORDER BY created_at DESC");
  return result.rows;
}

export async function addEntry(text, analysis = null) {
  const result = await db.query(
    "INSERT INTO entries (text, analysis) VALUES ($1, $2) RETURNING *",
    [text, analysis]
  );
  return result.rows[0];
}

export async function deleteEntry(id) {
  await db.query("DELETE FROM entries WHERE id = $1", [id]);
  return true;
}
