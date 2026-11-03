import { z } from "zod";
import { cleanText, isoDate, uuid } from "./common.js";

const amount = z
  .string()
  .trim()
  .regex(/^\d{1,9}(\.\d{1,2})?$/, "Enter an amount like 150 or 150.50")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

const note = z
  .string()
  .max(500, "Note is too long")
  .transform(cleanText)
  .pipe(z.string().max(200, "Note must be 200 characters or fewer"));

export const transactionSchema = z
  .object({
    categoryId: uuid,
    amount,
    note,
    date: isoDate,
  })
  .strict();

export const categorySchema = z
  .object({
    name: z
      .string()
      .max(100, "Name is too long")
      .transform(cleanText)
      .pipe(
        z
          .string()
          .min(1, "Name is required")
          .max(40, "Name must be 40 characters or fewer"),
      ),
    type: z.enum(["income", "expense"]),
  })
  .strict();

export const idParamsSchema = z.object({ id: uuid }).strict();

// For URLs like /api/transactions?search=lunch&type=expense&page=2
export const listQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: uuid.optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict()
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "The start date must not be after the end date",
    path: ["from"],
  });
