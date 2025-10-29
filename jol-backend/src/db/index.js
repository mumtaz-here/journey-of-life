/**
 * Journey of Life — Database Connection (Single Env)
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default {
  query: (text, params) => pool.query(text, params),
  connect: async () => {
    try {
      const client = await pool.connect();
      console.log("🌿 Connected to PostgreSQL (Journey of Life)");
      client.release();
    } catch (err) {
      console.error("❌ Database connection error:", err.message);
      process.exit(1);
    }
  },
};
