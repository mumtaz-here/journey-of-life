/**
 * Journey of Life — Model: Priorities
 * -----------------------------------
 * Editable, checkable daily top items (max 3 per date).
 */

import db from "../index.js";


export async function initPrioritiesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS priorities (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'open', -- 'open' | 'done'
      date DATE NOT NULL,                -- which day this priority belongs to
      source_entry_id INT,               -- optional provenance
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // foreign key (safe)
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name='priorities' AND constraint_name='priorities_source_entry_fk'
      ) THEN
        BEGIN
          ALTER TABLE priorities
            ADD CONSTRAINT priorities_source_entry_fk
            FOREIGN KEY (source_entry_id)
            REFERENCES entries(id)
            ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN
          NULL;
        END;
      END IF;
    END $$;
  `);

  console.log("⭐ Table 'priorities' ready.");
}

export async function getPrioritiesByDate(dateISO) {
  const res = await db.query(
    "SELECT * FROM priorities WHERE date = $1 ORDER BY created_at ASC",
    [dateISO]
  );
  return res.rows;
}

export async function countPrioritiesByDate(dateISO) {
  const res = await db.query("SELECT COUNT(*)::int AS c FROM priorities WHERE date = $1", [dateISO]);
  return res.rows[0]?.c ?? 0;
}

export async function addPriority({ text, date, source_entry_id = null }) {
  const res = await db.query(
    "INSERT INTO priorities (text, date, source_entry_id) VALUES ($1, $2, $3) RETURNING *",
    [text, date, source_entry_id]
  );
  return res.rows[0];
}

export async function updatePriority(id, { text, status }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (typeof text === "string") {
    fields.push(`text = $${i++}`);
    values.push(text);
  }
  if (typeof status === "string") {
    fields.push(`status = $${i++}`);
    values.push(status);
  }
  values.push(id);

  const res = await db.query(
    `UPDATE priorities SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.rows[0];
}

export async function togglePriority(id) {
  const res = await db.query("SELECT status FROM priorities WHERE id = $1", [id]);
  if (!res.rows[0]) throw new Error("Priority not found");
  const next = res.rows[0].status === "done" ? "open" : "done";
  const upd = await db.query("UPDATE priorities SET status = $1 WHERE id = $2 RETURNING *", [next, id]);
  return upd.rows[0];
}

export async function deletePriority(id) {
  await db.query("DELETE FROM priorities WHERE id = $1", [id]);
  return true;
}
