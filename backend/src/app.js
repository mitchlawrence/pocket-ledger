import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pool } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";

const app = express();

app.use(helmet());
app.use("/api", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: "error", database: "unreachable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? "Something went wrong" : "Invalid request",
  });
});

export default app;
