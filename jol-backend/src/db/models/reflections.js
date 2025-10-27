/**
 * Journey of Life — Model: Reflections
 * -----------------------------------
 * Weekly narrative storage from journaling analysis.
 */

import db from "../index.js";

export async function initReflectionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS reflections (
      id SERIAL PRIMARY KEY,
      week VARCHAR(20) NOT NULL,
      narrative TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
  console.log("📖 Table 'reflections' ready.");
}

export async function getAllReflections() {
  const result = await db.query(
    "SELECT * FROM reflections ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function addReflection(week, narrative) {
  const result = await db.query(
    "INSERT INTO reflections (week, narrative) VALUES ($1, $2) RETURNING *",
    [week, narrative]
  );
  return result.rows[0];
}

export async function updateReflection(id, narrative) {
  const result = await db.query(
    "UPDATE reflections SET narrative = $1 WHERE id = $2 RETURNING *",
    [narrative, id]
  );
  return result.rows[0];
}

export async function deleteReflection(id) {
  await db.query("DELETE FROM reflections WHERE id = $1", [id]);
  return true;
}
