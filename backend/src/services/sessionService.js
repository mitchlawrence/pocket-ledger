import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { generateRefreshToken, hashToken } from "../utils/tokens.js";

function expiryDate() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}

export async function createSession(userId) {
  const token = generateRefreshToken();

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
     VALUES ($1, gen_random_uuid(), $2, $3)`,
    [userId, hashToken(token), expiryDate()],
  );

  return token;
}

export async function rotateSession(oldToken) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, user_id, family_id, expires_at, revoked_at
         FROM refresh_tokens
        WHERE token_hash = $1
        FOR UPDATE`,
      [hashToken(oldToken)],
    );
    const record = rows[0];

    if (!record) {
      await client.query("ROLLBACK");
      return null;
    }

    if (record.revoked_at) {
      await client.query(
        `UPDATE refresh_tokens
            SET revoked_at = now()
          WHERE family_id = $1 AND revoked_at IS NULL`,
        [record.family_id],
      );
      await client.query("COMMIT");
      return null;
    }

    if (new Date(record.expires_at) <= new Date()) {
      await client.query("ROLLBACK");
      return null;
    }

    const newToken = generateRefreshToken();

    await client.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`,
      [record.id],
    );
    await client.query(
      `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [record.user_id, record.family_id, hashToken(newToken), expiryDate()],
    );

    await client.query("COMMIT");
    return { userId: record.user_id, refreshToken: newToken };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function revokeSession(token) {
  await pool.query(
    `UPDATE refresh_tokens
        SET revoked_at = now()
      WHERE revoked_at IS NULL
        AND family_id = (
          SELECT family_id FROM refresh_tokens WHERE token_hash = $1
        )`,
    [hashToken(token)],
  );
}
