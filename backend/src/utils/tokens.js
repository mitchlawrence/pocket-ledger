import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.accessTokenSecret, {
    algorithm: "HS256",
    expiresIn: env.accessTokenTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret, { algorithms: ["HS256"] });
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
