import { z } from "zod";

export const cleanText = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "That is not a real date")
  .refine(
    (value) => value >= "2000-01-01" && value <= "2100-12-31",
    "Date is out of range",
  );

export const uuid = z.string().uuid("Invalid id");
