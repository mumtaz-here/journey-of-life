/**
 * Journey of Life — Model: Summaries
 * ----------------------------------
 * One summary per day, saved in the database.
 * - Used for "My Journey" / Summary bubbles (left side).
 */

import db from "../index.js";

/**
 * Create table "summaries" if not exists.
 * One row per date.
 */
export async function initSummariesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS summaries (
      id SERIAL PRIMARY KEY,
      summary_date DATE UNIQUE NOT NULL,
      summary_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
  console.log("📝 Table 'summaries' ready.");
}

/**
 * Get all summaries ordered by date ascending.
 */
export async function getAllSummaries() {
  const result = await db.query(
    "SELECT * FROM summaries ORDER BY summary_date ASC"
  );
  return result.rows;
}

/**
 * Get summary for a specific date (YYYY-MM-DD).
 */
export async function getSummaryByDate(date) {
  const result = await db.query(
    "SELECT * FROM summaries WHERE summary_date = $1 LIMIT 1",
    [date]
  );
  return result.rows[0] || null;
}

/**
 * Insert or update summary for a given date.
 * If a summary already exists for that date, it will be updated.
 */
export async function upsertSummary(date, text) {
  const query = `
    INSERT INTO summaries (summary_date, summary_text)
    VALUES ($1, $2)
    ON CONFLICT (summary_date)
    DO UPDATE SET
      summary_text = EXCLUDED.summary_text,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const result = await db.query(query, [date, text]);
  return result.rows[0];
}
