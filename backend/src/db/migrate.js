import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "..", "migrations");

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip    ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        file,
      ]);
      await client.query("COMMIT");
      console.log(`applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`failed  ${file}: ${err.message}`);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

run();
