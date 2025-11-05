/**
 * Journey of Life — DB Model: Highlights (FINAL STABLE)
 */

import db from "../index.js";

// 🧱 Buat tabel kalau belum ada
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
    console.log("🧱 Highlights table siap digunakan");
  } catch (err) {
    console.error("❌ Gagal membuat tabel highlights:", err.message);
  }
}

// 🔍 Ambil semua highlight
export async function getAllHighlights() {
  const res = await db.query(
    "SELECT id, text, status, planned_date, created_at FROM highlights ORDER BY id DESC"
  );
  return res.rows;
}

// ➕ Tambah highlight
export async function addHighlight(text, planned_date = null, source_entry_id = null) {
  const res = await db.query(
    `INSERT INTO highlights (text, planned_date, source_entry_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [text, planned_date, source_entry_id]
  );
  return res.rows[0];
}

// 🔄 Toggle status planned/done
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

// 🗑️ Hapus highlight
export async function deleteHighlight(id) {
  await db.query("DELETE FROM highlights WHERE id=$1", [id]);
}
