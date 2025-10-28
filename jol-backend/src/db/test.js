import pool from "./index.js";

async function testDB() {
  try {
    const res = await pool.query("SELECT NOW() as now");
    console.log("✅ DB Test OK:", res.rows[0].now);
  } catch (err) {
    console.error("❌ DB Test Failed");
    console.error(err.message);
  }
}

testDB();
