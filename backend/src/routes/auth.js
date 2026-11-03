import { Router } from "express";
import argon2 from "argon2";
import { pool } from "../config/db.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { signupSchema, loginSchema } from "../validators/authSchemas.js";
import { signAccessToken } from "../utils/tokens.js";
import { createSession, rotateSession } from "../services/sessionService.js";
import {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/cookies.js";

const router = Router();

const DUMMY_HASH = await argon2.hash("not-a-real-password");

router.post(
  "/signup",
  authLimiter,
  validate(signupSchema),
  async (req, res) => {
    const { name, email, password } = req.body;
    const passwordHash = await argon2.hash(password);

    let user;
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
        [name, email, passwordHash],
      );
      user = rows[0];
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({
          error: "That email is already registered",
          fields: { email: "That email is already registered" },
        });
      }
      throw err;
    }

    const refreshToken = await createSession(user.id);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken: signAccessToken(user.id) });
  },
);

router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash FROM users WHERE lower(email) = $1`,
    [email],
  );
  const user = rows[0];

  const passwordOk = await argon2.verify(
    user ? user.password_hash : DUMMY_HASH,
    password,
  );

  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const refreshToken = await createSession(user.id);
  setRefreshCookie(res, refreshToken);
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: signAccessToken(user.id),
  });
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "No active session" });
  }

  const result = await rotateSession(token);
  if (!result) {
    clearRefreshCookie(res);
    return res
      .status(401)
      .json({ error: "Session expired. Please log in again." });
  }

  setRefreshCookie(res, result.refreshToken);
  res.json({ accessToken: signAccessToken(result.userId) });
});

router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, created_at FROM users WHERE id = $1`,
    [req.userId],
  );

  if (!rows[0]) {
    return res.status(401).json({ error: "Account not found" });
  }
  res.json({ user: rows[0] });
});

export default router;
