/**
 * Journey of Life — Model: Highlights (FINAL)
 * ------------------------------------------
 * Supports auto-planning from journaling & provenance.
 */

import db from "../index.js";

export async function initHighlightsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS highlights (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'ongoing',
      planned_date DATE,
      source_entry_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name='highlights'
        AND column_name='source_entry_id'
      ) THEN
        ALTER TABLE highlights
        ADD CONSTRAINT highlights_source_entry_fk
        FOREIGN KEY (source_entry_id)
        REFERENCES entries(id)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  console.log("✨ highlights table ready");
}

export async function getAllHighlights() {
  const res = await db.query(
    `SELECT *
     FROM highlights
     ORDER BY COALESCE(planned_date, created_at) DESC`
  );
  return res.rows;
}

export async function addHighlight(
  text,
  planned_date = null,
  source_entry_id = null
) {
  const res = await db.query(
    `INSERT INTO highlights (text, planned_date, source_entry_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [text, planned_date, source_entry_id]
  );
  return res.rows[0];
}

export async function toggleHighlight(id) {
  const cur = await db.query(
    `SELECT status
     FROM highlights
     WHERE id = $1`,
    [id]
  );

  const row = cur.rows[0];
  if (!row) throw new Error("Highlight not found");

  const next = row.status === "done" ? "ongoing" : "done";

  const updated = await db.query(
    `UPDATE highlights
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [next, id]
  );

  return updated.rows[0];
}

export async function deleteHighlight(id) {
  await db.query(`DELETE FROM highlights WHERE id = $1`, [id]);
  return true;
}
