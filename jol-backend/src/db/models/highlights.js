/**
 * Journey of Life — DB Model: Highlights (CONTEXT-SYNC FINAL)
 * -----------------------------------------------------------
 * - Simple, explicit CRUD
 * - No hidden “smart” side effects (semua logika di routes)
 * - Supports querying per-day (for backfill skipping)
 */

import db from "../index.js";

// 🧱 Create table if not exists
export async function initHighlightsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS highlights (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'planned',
        planned_date DATE,
        source_entry_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("🧱 Highlights table ready.");
  } catch (err) {
    console.error("❌ Failed to create highlights table:", err.message);
  }
}

// 🔍 Get all highlights (ordered by planned_date or created_at)
export async function getAllHighlights() {
  const res = await db.query(
    `SELECT id, text, status, planned_date, created_at
     FROM highlights
     ORDER BY COALESCE(planned_date, created_at) ASC, id ASC`
  );
  return res.rows;
}

// 🔍 Get highlights by a specific date (planned_date or created_at::date)
export async function getHighlightsByDay(dateKey) {
  const res = await db.query(
    `
    SELECT id, text, status, planned_date, created_at
    FROM highlights
    WHERE COALESCE(planned_date::date, created_at::date) = $1::date
    ORDER BY created_at ASC, id ASC
    `,
    [dateKey]
  );
  return res.rows;
}

// ➕ Insert highlight (no smart magic)
export async function addHighlight(
  text,
  planned_date = null,
  source_entry_id = null
) {
  if (!text || !text.trim()) return null;
  const res = await db.query(
    `
    INSERT INTO highlights (text, planned_date, source_entry_id)
    VALUES ($1, $2, $3)
    RETURNING id, text, status, planned_date, created_at
    `,
    [text.trim(), planned_date, source_entry_id]
  );
  return res.rows[0];
}

// 🔄 Toggle planned/done
export async function toggleHighlight(id) {
  const cur = await db.query(
    "SELECT status FROM highlights WHERE id = $1",
    [id]
  );
  if (cur.rows.length === 0) return null;

  const next = cur.rows[0].status === "done" ? "planned" : "done";
  const res = await db.query(
    `
    UPDATE highlights
    SET status = $1
    WHERE id = $2
    RETURNING id, text, status, planned_date, created_at
    `,
    [next, id]
  );
  return res.rows[0];
}

// 🗑️ Delete highlight
export async function deleteHighlight(id) {
  await db.query("DELETE FROM highlights WHERE id = $1", [id]);
}
