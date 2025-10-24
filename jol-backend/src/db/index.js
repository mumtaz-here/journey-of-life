/**
 * Journey of Life — Database Connection (Env Split Version)
 * ---------------------------------------------------------
 * Uses PostgreSQL via 'pg' client.
 * Reads connection from individual env variables.
 */

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default {
  /**
   * Run a single SQL query
   * @param {string} text - SQL text
   * @param {Array} params - optional parameters
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Connect to database once on server start
   */
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
