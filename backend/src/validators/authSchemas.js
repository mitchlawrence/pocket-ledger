import { z } from "zod";
import { cleanText } from "./common.js";

const name = z
  .string()
  .transform(cleanText)
  .pipe(
    z
      .string()
      .min(1, "Name is required")
      .max(60, "Name must be 60 characters or fewer")
      // Letters (any language), spaces, apostrophes, periods, hyphens only.
      .regex(
        /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u,
        "Name contains invalid characters",
      ),
  );

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .email("Enter a valid email address");

const newPassword = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password must be 128 characters or fewer");

export const signupSchema = z
  .object({ name, email, password: newPassword })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, "Password is required").max(128),
  })
  .strict();

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Password is required").max(128),
  })
  .strict();
