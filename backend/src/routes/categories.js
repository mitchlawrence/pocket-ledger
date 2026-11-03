import { Router } from "express";
import { pool } from "../config/db.js";
import { validate } from "../middleware/validate.js";
import { categorySchema, idParamsSchema } from "../validators/ledgerSchemas.js";

const router = Router();

const MAX_CATEGORIES = 50;

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, type
       FROM categories
      WHERE user_id = $1
      ORDER BY type, lower(name)`,
    [req.userId],
  );
  res.json({ categories: rows });
});

router.post("/", validate(categorySchema), async (req, res) => {
  const { name, type } = req.body;

  const count = await pool.query(
    `SELECT count(*)::int AS total FROM categories WHERE user_id = $1`,
    [req.userId],
  );
  if (count.rows[0].total >= MAX_CATEGORIES) {
    return res.status(400).json({
      error: `You can have at most ${MAX_CATEGORIES} categories.`,
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, type`,
      [req.userId, name, type],
    );
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "You already have that category",
        fields: { name: "You already have that category" },
      });
    }
    throw err;
  }
});

router.delete("/:id", validate(idParamsSchema, "params"), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
      [req.valid.params.id, req.userId],
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(204).end();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({
        error:
          "This category still has transactions. Delete or change them first.",
      });
    }
    throw err;
  }
});

export default router;
