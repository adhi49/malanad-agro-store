import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on("connect", () => {
  console.log("🟢 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🔴 Unexpected error on idle client", err);
  process.exit(-1);
});
