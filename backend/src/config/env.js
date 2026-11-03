import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  isProd: process.env.NODE_ENV === "production",
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,
};

if (env.accessTokenSecret.length < 32) {
  throw new Error("ACCESS_TOKEN_SECRET must be at least 32 characters long");
}
