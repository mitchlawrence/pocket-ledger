import { Router } from "express";
import { pool } from "../config/db.js";
import { validate } from "../middleware/validate.js";
import {
  transactionSchema,
  idParamsSchema,
  listQuerySchema,
} from "../validators/ledgerSchemas.js";

const router = Router();

const toTransaction = (row) => ({
  id: row.id,
  amount: row.amount,
  note: row.note,
  date: row.date,
  categoryId: row.category_id,
  categoryName: row.category_name,
  type: row.type,
});

function buildFilters(userId, q) {
  const params = [userId];
  const conditions = ["t.user_id = $1"];

  const add = (sql, value) => {
    params.push(value);
    conditions.push(sql.replaceAll("?", `$${params.length}`));
  };

  if (q.type) add("c.type = ?", q.type);
  if (q.categoryId) add("t.category_id = ?", q.categoryId);
  if (q.from) add("t.occurred_on >= ?", q.from);
  if (q.to) add("t.occurred_on <= ?", q.to);

  if (q.search) {
    const escaped = q.search.replace(/[\\%_]/g, "\\$&");
    add("(t.note ILIKE ? OR c.name ILIKE ?)", `%${escaped}%`);
  }

  return { where: conditions.join(" AND "), params };
}

router.get("/", validate(listQuerySchema, "query"), async (req, res) => {
  const q = req.valid.query;
  const { where, params } = buildFilters(req.userId, q);
  const offset = (q.page - 1) * q.pageSize;

  const [list, summary] = await Promise.all([
    pool.query(
      `SELECT t.id, t.amount, t.note, t.occurred_on AS date,
              t.category_id, c.name AS category_name, c.type
         FROM transactions t
         JOIN categories c ON c.id = t.category_id
        WHERE ${where}
        ORDER BY t.occurred_on DESC, t.created_at DESC, t.id
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.pageSize, offset],
    ),
    pool.query(
      `SELECT count(*)::int AS total,
              COALESCE(SUM(t.amount) FILTER (WHERE c.type = 'income'), 0)  AS income,
              COALESCE(SUM(t.amount) FILTER (WHERE c.type = 'expense'), 0) AS expense
         FROM transactions t
         JOIN categories c ON c.id = t.category_id
        WHERE ${where}`,
      params,
    ),
  ]);

  const { total, income, expense } = summary.rows[0];

  res.json({
    items: list.rows.map(toTransaction),
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
    totals: { income, expense }, // totals for everything matching the filters
  });
});

router.post("/", validate(transactionSchema), async (req, res) => {
  const { categoryId, amount, note, date } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO transactions (user_id, category_id, amount, note, occurred_on)
     SELECT $1::uuid, c.id, $3::numeric, $4::text, $5::date
       FROM categories c
      WHERE c.id = $2::uuid AND c.user_id = $1::uuid
     RETURNING id`,
    [req.userId, categoryId, amount, note, date],
  );

  if (!rows[0]) {
    return res.status(400).json({
      error: "Please check your input.",
      fields: { categoryId: "Choose a valid category" },
    });
  }
  res.status(201).json({ id: rows[0].id });
});

router.put(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(transactionSchema),
  async (req, res) => {
    const { categoryId, amount, note, date } = req.body;

    const { rows } = await pool.query(
      `UPDATE transactions t
          SET category_id = c.id,
              amount = $4::numeric,
              note = $5::text,
              occurred_on = $6::date
         FROM categories c
        WHERE t.id = $1::uuid AND t.user_id = $2::uuid
          AND c.id = $3::uuid AND c.user_id = $2::uuid
        RETURNING t.id`,
      [req.valid.params.id, req.userId, categoryId, amount, note, date],
    );

    if (!rows[0]) {
      return res
        .status(404)
        .json({ error: "Transaction or category not found" });
    }
    res.json({ id: rows[0].id });
  },
);

router.delete("/:id", validate(idParamsSchema, "params"), async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
    [req.valid.params.id, req.userId],
  );

  if (rowCount === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.status(204).end();
});

export default router;
