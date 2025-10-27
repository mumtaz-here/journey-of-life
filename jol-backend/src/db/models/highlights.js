/**
 * Journey of Life — Model: Highlights
 * -----------------------------------
 * Adds planned_date + source_entry_id for provenance and scheduling.
 */

import db from "../index.js";

export async function initHighlightsTable() {
  // base table
  await db.query(`
    CREATE TABLE IF NOT EXISTS highlights (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'ongoing',
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // safe migrations
  await db.query(`ALTER TABLE highlights ADD COLUMN IF NOT EXISTS planned_date DATE;`);
  await db.query(`ALTER TABLE highlights ADD COLUMN IF NOT EXISTS source_entry_id INT;`);
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name='highlights' AND constraint_name='highlights_source_entry_fk'
      ) THEN
        BEGIN
          ALTER TABLE highlights
            ADD CONSTRAINT highlights_source_entry_fk
            FOREIGN KEY (source_entry_id)
            REFERENCES entries(id)
            ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN
          -- ignore
          NULL;
        END;
      END IF;
    END $$;
  `);
  console.log("✨ Table 'highlights' ready (with planned_date & source_entry_id).");
}

export async function getAllHighlights() {
  const res = await db.query(
    "SELECT * FROM highlights ORDER BY COALESCE(planned_date, date) DESC"
  );
  return res.rows;
}

export async function addHighlight(text, planned_date = null, source_entry_id = null) {
  const res = await db.query(
    "INSERT INTO highlights (text, planned_date, source_entry_id) VALUES ($1, $2, $3) RETURNING *",
    [text, planned_date, source_entry_id]
  );
  return res.rows[0];
}

export async function toggleHighlight(id) {
  const find = await db.query("SELECT * FROM highlights WHERE id = $1", [id]);
  const h = find.rows[0];
  if (!h) throw new Error("Highlight not found");

  const next =
    h.status === "ongoing" ? "done" :
    h.status === "done" ? "wish" : "ongoing";

  const updated = await db.query(
    "UPDATE highlights SET status = $1 WHERE id = $2 RETURNING *",
    [next, id]
  );
  return updated.rows[0];
}

export async function deleteHighlight(id) {
  await db.query("DELETE FROM highlights WHERE id = $1", [id]);
  return true;
}
