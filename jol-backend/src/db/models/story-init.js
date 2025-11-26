import db from "../index.js";

export async function initStoryTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reflections (
      id SERIAL PRIMARY KEY,
      reflection_date DATE UNIQUE NOT NULL,
      narrative TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("📚 Table 'reflections' ready.");
}
