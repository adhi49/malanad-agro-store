import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("🟢 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🔴 Unexpected error on idle client", err);
  process.exit(-1);
});

// Actually test the connection when this module is imported
// This will trigger the "connect" event above
(async () => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    console.log(`📅 Database connection verified at: ${result.rows[0].current_time}`);
  } catch (err) {
    console.error("🔴 Failed to connect to database:", err.message);
  }
})();
