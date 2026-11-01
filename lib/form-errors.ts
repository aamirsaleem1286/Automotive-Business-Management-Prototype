import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "./api-client";

interface FlattenedErrors {
  fieldErrors?: Record<string, string[] | undefined>;
}

export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallback: string
) {
  let message = fallback;

  if (error instanceof ApiClientError) {
    message = error.message;
    const details = error.details as FlattenedErrors | undefined;
    if (details?.fieldErrors) {
      for (const [field, messages] of Object.entries(details.fieldErrors)) {
        const first = messages?.[0];
        if (first) {
          setError(field as Path<T>, { type: "server", message: first });
        }
      }
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  setError("root", { type: "server", message });
  return message;
}
