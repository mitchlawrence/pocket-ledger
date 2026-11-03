import { Router } from "express";
import argon2 from "argon2";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { deleteAccountSchema } from "../validators/authSchemas.js";
import { clearRefreshCookie } from "../utils/cookies.js";

const router = Router();

router.delete(
  "/",
  requireAuth,
  authLimiter,
  validate(deleteAccountSchema),
  async (req, res) => {
    const { rows } = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.userId],
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Account not found" });
    }

    const passwordOk = await argon2.verify(
      user.password_hash,
      req.body.password,
    );
    if (!passwordOk) {
      return res.status(403).json({
        error: "Incorrect password",
        fields: { password: "Incorrect password" },
      });
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [req.userId]);

    clearRefreshCookie(res);
    res.status(204).end();
  },
);

export default router;
