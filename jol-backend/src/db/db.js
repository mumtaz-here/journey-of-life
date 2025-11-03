// db.js
import pkg from "pg";
const { Client } = pkg;

// Bikin client PostgreSQL
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

export default db;
