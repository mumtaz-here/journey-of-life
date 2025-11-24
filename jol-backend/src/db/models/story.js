/**
 * Journey of Life — Daily Story (Reflections)
 * -------------------------------------------
 * Simple factual narrative for each day.
 * Written in calm Indonesian, third-person: sebut nama "Mumtaz" lalu "ia".
 * Tidak dramatis, tidak menambah fakta baru.
 */

import pool from "../index.js";

const storyModel = {
  /**
   * Ambil semua story terurut terbaru
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
   * Ambil 1 hari (YYYY-MM-DD)
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
   * Ambil rentang tanggal
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
   * Simpan atau update narasi harian (overwrite dengan versi terbaru AI)
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
   * Hapus story (admin/debug)
   */
  async remove(id) {
    await pool.query(`DELETE FROM reflections WHERE id = $1`, [id]);
    return true;
  }
};

export default storyModel;
