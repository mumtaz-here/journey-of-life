/**
 * Journey of Life — Database Connection (Final Fix)
 * Override Railway PGHOST/base issue
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// 🧹 Hapus environment bawaan Railway yang bikin override
delete process.env.PGHOST;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGPASSWORD;
delete process.env.PGPORT;

console.log("🧩 Using DATABASE_URL from env only");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false },
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
