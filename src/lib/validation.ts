import { z } from "zod";
import { PRAYER_POINT_MAX } from "./config";

// Field rules shared by forms and the mock API. They mirror the backend (prd.md section 3.3).

/** Counts characters the way the backend does (Unicode code points), so emoji count as one. */
export function codePointLength(text: string): number {
  return [...text].length;
}

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your full name.")
  .max(100, "Use 100 characters or fewer.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address, like name@example.com.").max(254));

/** Accepts "(416) 555-0123" style input and normalises it to digits with an optional leading +. */
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{7,15}$/, "Use 7 to 15 digits, with an optional + at the start."));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");

export const prayerPointSchema = z
  .string()
  .refine((value) => value.trim().length > 0, "Write your prayer point.")
  .refine(
    (value) => codePointLength(value) <= PRAYER_POINT_MAX,
    `Use ${PRAYER_POINT_MAX.toLocaleString("en-US")} characters or fewer.`,
  );
