import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "./errors";

/**
 * Puts the API's `INVALID_INPUT.fields` messages onto the matching form fields
 * (ENGINEERING.md section 6). Returns true if every field error found a home, so
 * the caller only shows a form-level banner when something is left over.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly Path<T>[],
): boolean {
  if (!isApiError(error, "INVALID_INPUT") || !error.fields) return false;
  let allPlaced = true;
  for (const [field, message] of Object.entries(error.fields)) {
    const name = fieldNames.find((f) => f === field);
    if (name) setError(name, { type: "server", message }, { shouldFocus: true });
    else allPlaced = false;
  }
  return allPlaced;
}
