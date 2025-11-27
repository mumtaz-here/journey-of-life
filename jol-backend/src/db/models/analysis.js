/**
 * Journey of Life — Model: Daily Analysis (AI Parsing)
 * ----------------------------------------------------
 * One record per day:
 * mood, energy, focus, highlights[] (JSON text array)
 */

import db from "../index.js";

/**
 * Create table if not exists
 */
export async function initAnalysisTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS analysis (
      id SERIAL PRIMARY KEY,
      analysis_date DATE UNIQUE NOT NULL,
      mood VARCHAR(50),
      energy VARCHAR(50),
      focus VARCHAR(50),
      highlights TEXT, -- stored JSON array
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("🔎 Table 'analysis' ready.");
}

/**
 * Upsert daily analysis
 */
export async function upsertAnalysis(date, data) {
  const { mood, energy, focus, highlights } = data;

  const result = await db.query(
    `
      INSERT INTO analysis (analysis_date, mood, energy, focus, highlights)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (analysis_date)
      DO UPDATE SET
        mood = EXCLUDED.mood,
        energy = EXCLUDED.energy,
        focus = EXCLUDED.focus,
        highlights = EXCLUDED.highlights,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `,
    [date, mood, energy, focus, JSON.stringify(highlights)]
  );
  return result.rows[0];
}

/**
 * Get analysis for specific date
 */
export async function getAnalysis(date) {
  const result = await db.query(
    `SELECT * FROM analysis WHERE analysis_date = $1 LIMIT 1`,
    [date]
  );
  return result.rows[0] || null;
}

/**
 * Get all analysis sorted by newest first
 */
export async function getAllAnalysis() {
  const { rows } = await db.query(
    `SELECT * FROM analysis ORDER BY analysis_date DESC`
  );
  return rows;
}
