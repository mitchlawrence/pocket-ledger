import { pool } from "../config/db.js";

const DEFAULT_CATEGORIES = [
  ["Food", "expense"],
  ["Transport", "expense"],
  ["Bills", "expense"],
  ["School", "expense"],
  ["Health", "expense"],
  ["Shopping", "expense"],
  ["Entertainment", "expense"],
  ["Other", "expense"],
  ["Allowance", "income"],
  ["Salary", "income"],
  ["Side income", "income"],
  ["Other income", "income"],
];

export async function seedDefaultCategories(userId) {
  const names = DEFAULT_CATEGORIES.map(([name]) => name);
  const types = DEFAULT_CATEGORIES.map(([, type]) => type);

  await pool.query(
    `INSERT INTO categories (user_id, name, type)
     SELECT $1::uuid, d.name, d.type
       FROM unnest($2::text[], $3::text[]) AS d(name, type)`,
    [userId, names, types],
  );
}
