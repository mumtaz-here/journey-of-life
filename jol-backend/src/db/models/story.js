/**
 * Journey of Life — Daily Story (Factual Narrative)
 * -------------------------------------------------
 * A short, objective, third-person narrative of the day.
 * No added details, no dramatization.
 */

import pool from "../index.js";

const storyModel = {
  /**
   * Get all stories sorted by newest first
   */
  async getAll() {
    const { rows } = await pool.query(
      `SELECT id, reflection_date, narrative, created_at
       FROM reflections
       ORDER BY reflection_date DESC, created_at DESC`
    );
    return rows;
  },

  /**
   * Get 1 day by YYYY-MM-DD
   */
  async getByDay(dayKey) {
    const { rows } = await pool.query(
      `SELECT id, reflection_date, narrative, created_at
       FROM reflections
       WHERE reflection_date = $1
       LIMIT 1`,
      [dayKey]
    );
    return rows[0] || null;
  },

  /**
   * Get range of days
   */
  async getRange(from, to) {
    const { rows } = await pool.query(
      `SELECT id, reflection_date, narrative, created_at
       FROM reflections
       WHERE reflection_date BETWEEN $1::date AND $2::date
       ORDER BY reflection_date DESC, created_at DESC`,
      [from, to]
    );
    return rows;
  },

  /**
   * Insert or update a daily narrative
   */
  async save(dayKey, narrative) {
    const found = await pool.query(
      `SELECT id FROM reflections WHERE reflection_date = $1 LIMIT 1`,
      [dayKey]
    );

    if (found.rows.length) {
      const { rows } = await pool.query(
        `UPDATE reflections
         SET narrative = $1
         WHERE id = $2
         RETURNING id, reflection_date, narrative, created_at`,
        [narrative, found.rows[0].id]
      );
      return rows[0];
    }

    const { rows } = await pool.query(
      `INSERT INTO reflections (reflection_date, narrative)
       VALUES ($1, $2)
       RETURNING id, reflection_date, narrative, created_at`,
      [dayKey, narrative]
    );
    return rows[0];
  },

  /**
   * Delete narrative (for admin/debug)
   */
  async remove(id) {
    await pool.query(`DELETE FROM reflections WHERE id = $1`, [id]);
    return true;
  },
};

export default storyModel;
