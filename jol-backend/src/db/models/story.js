import pool from "../index.js";

const storyModel = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT * FROM reflections ORDER BY created_at DESC`
    );
    return rows;
  },

  async save(week, narrative) {
    const found = await pool.query(
      `SELECT id FROM reflections WHERE week = $1 LIMIT 1`,
      [week]
    );

    if (found.rows.length) {
      const { rows } = await pool.query(
        `UPDATE reflections SET narrative = $1 WHERE id = $2 RETURNING *`,
        [narrative, found.rows[0].id]
      );
      return rows[0];
    }

    const { rows } = await pool.query(
      `INSERT INTO reflections (week, narrative)
       VALUES ($1, $2)
       RETURNING *`,
      [week, narrative]
    );
    return rows[0];
  },

  async remove(id) {
    await pool.query(`DELETE FROM reflections WHERE id=$1`, [id]);
    return true;
  }
};

export default storyModel;
