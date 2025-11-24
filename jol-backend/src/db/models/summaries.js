/**
 * Journey of Life — Model: Summaries (AI — Daily Summary)
 * -------------------------------------------------------
 * One summary per day, updated every time user sends an entry.
 * Summary is short factual bullet points (AI-generated).
 */

import db from "../index.js";

/**
 * Create table if not exists
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
 * Fetch all summaries sorted by date
 */
export async function getAllSummaries() {
  const result = await db.query(
    `SELECT summary_date, summary_text, created_at, updated_at
     FROM summaries
     ORDER BY summary_date ASC`
  );
  return result.rows;
}

/**
 * Get summary for a specific date
 */
export async function getSummaryByDate(date) {
  const result = await db.query(
    `SELECT id, summary_date, summary_text
     FROM summaries
     WHERE summary_date = $1
     LIMIT 1`,
    [date]
  );
  return result.rows[0] || null;
}

/**
 * Insert or update summary per date
 * Summary is overwritten by latest AI
 */
export async function upsertSummary(date, text) {
  const query = `
    INSERT INTO summaries (summary_date, summary_text)
    VALUES ($1, $2)
    ON CONFLICT (summary_date)
    DO UPDATE SET
      summary_text = EXCLUDED.summary_text,
      updated_at = CURRENT_TIMESTAMP
    RETURNING summary_date, summary_text;
  `;
  const result = await db.query(query, [date, text]);
  return result.rows[0];
}
