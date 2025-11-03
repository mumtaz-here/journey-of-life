// import db from "../index.js";

const habitsModel = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT * FROM habits ORDER BY created_at ASC`
    );
    return rows;
  },

  async create(title) {
    const { rows } = await pool.query(
      `INSERT INTO habits (title)
       VALUES ($1)
       RETURNING *`,
      [title]
    );
    return rows[0];
  },

  async toggle(id) {
    const today = new Date().toISOString().split("T")[0];

    const current = await pool.query(
      `SELECT * FROM habits WHERE id = $1`,
      [id]
    );
    const h = current.rows[0];
    if (!h) throw new Error("Habit not found");

    const newStreak =
      h.last_checked === today ? Math.max(0, h.streak - 1) : h.streak + 1;
    const newDate =
      h.last_checked === today ? null : today;

    const updated = await pool.query(
      `UPDATE habits
       SET streak = $1, last_checked = $2
       WHERE id = $3
       RETURNING *`,
      [newStreak, newDate, id]
    );
    return updated.rows[0];
  },

  async remove(id) {
    await pool.query(`DELETE FROM habits WHERE id = $1`, [id]);
    return true;
  }
};

export default habitsModel;
