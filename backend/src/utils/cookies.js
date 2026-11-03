import { env } from "../config/env.js";

export const REFRESH_COOKIE_NAME = "refresh_token";

const baseOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "strict",
  path: "/api/auth",
};

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions);
}
