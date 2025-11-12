/**
 * Journey of Life — DB Model: Highlights (SMART SYNC FINAL)
 * ---------------------------------------------------------
 * Stores only meaningful highlights with proper date linking.
 * Supports smart update if a plan is changed or postponed.
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

// 🔍 Get all highlights
export async function getAllHighlights() {
  const res = await db.query(
    `SELECT id, text, status, planned_date, created_at 
     FROM highlights
     ORDER BY COALESCE(planned_date, created_at) ASC`
  );
  return res.rows;
}

// ➕ Add or update highlight (smart)
export async function addHighlight(text, planned_date = null, source_entry_id = null) {
  if (!text?.trim()) return null;
  text = text.trim();

  // detect if this plan already exists (similar phrase)
  const find = await db.query(
    `SELECT id, text FROM highlights 
     WHERE LOWER(text) LIKE LOWER($1) 
     ORDER BY id DESC LIMIT 1`,
    [`%${text.split(" ")[0]}%`] // match by first keyword
  );

  // if contains "cancel", "batal", "postpone" → update old one
  const isCancel =
    /\b(cancel|batal|postpone|undur|reschedule|delay|tunda)\b/i.test(text);

  if (find.rows.length && isCancel) {
    const target = find.rows[0];
    const upd = await db.query(
      `UPDATE highlights 
       SET text = $1, planned_date = $2, status = 'planned', created_at = NOW()
       WHERE id = $3 RETURNING *`,
      [text, planned_date, target.id]
    );
    return upd.rows[0];
  }

  // otherwise, insert new highlight
  const res = await db.query(
    `INSERT INTO highlights (text, planned_date, source_entry_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [text, planned_date, source_entry_id]
  );
  return res.rows[0];
}

// 🔄 Toggle planned/done
export async function toggleHighlight(id) {
  const cur = await db.query("SELECT status FROM highlights WHERE id=$1", [id]);
  if (cur.rows.length === 0) return null;
  const next = cur.rows[0].status === "done" ? "planned" : "done";
  const res = await db.query(
    "UPDATE highlights SET status=$1 WHERE id=$2 RETURNING *",
    [next, id]
  );
  return res.rows[0];
}

// 🗑️ Delete highlight
export async function deleteHighlight(id) {
  await db.query("DELETE FROM highlights WHERE id=$1", [id]);
}
