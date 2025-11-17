// Model: Daily Stories (pakai tabel reflections, kolom week = day_key: 'YYYY-MM-DD')

import pool from "../index.js";

const storyModel = {
  // ambil semua story, terbaru dulu
  async getAll() {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM reflections
      ORDER BY week::date DESC, created_at DESC
      `
    );
    return rows;
  },

  // ambil story untuk 1 hari (dayKey = 'YYYY-MM-DD')
  async getByDay(dayKey) {
    const { rows } = await pool.query(
      `SELECT * FROM reflections WHERE week = $1 LIMIT 1`,
      [dayKey]
    );
    return rows[0] || null;
  },

  // ambil story untuk rentang tanggal (from, to)
  async getRange(from, to) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM reflections
      WHERE week::date BETWEEN $1::date AND $2::date
      ORDER BY week::date DESC, created_at DESC
      `,
      [from, to]
    );
    return rows;
  },

  // simpan / update story per dayKey
  async save(dayKey, narrative) {
    const found = await pool.query(
      `SELECT id FROM reflections WHERE week = $1 LIMIT 1`,
      [dayKey]
    );

    if (found.rows.length) {
      const { rows } = await pool.query(
        `
        UPDATE reflections
        SET narrative = $1
        WHERE id = $2
        RETURNING *
        `,
        [narrative, found.rows[0].id]
      );
      return rows[0];
    }

    const { rows } = await pool.query(
      `
      INSERT INTO reflections (week, narrative)
      VALUES ($1, $2)
      RETURNING *
      `,
      [dayKey, narrative]
    );

    return rows[0];
  },

  async remove(id) {
    await pool.query(`DELETE FROM reflections WHERE id = $1`, [id]);
    return true;
  },
};

export default storyModel;
