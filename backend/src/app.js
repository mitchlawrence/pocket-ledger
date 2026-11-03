import express from "express";
import { pool } from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: "error", database: "unreachable" });
  }
});

export default app;
