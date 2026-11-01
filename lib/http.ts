import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError("Invalid JSON body.", 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(
      "Please check the highlighted fields and try again.",
      422,
      result.error.flatten()
    );
  }
  return result.data;
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.message, error.status, error.details);
  }

  if (error instanceof ZodError) {
    return fail(
      "Please check the highlighted fields and try again.",
      422,
      error.flatten()
    );
  }

  const maybeDb = error as { code?: string; name?: string };
  if (maybeDb?.code === "P2002") {
    return fail("A record with that unique value already exists.", 409);
  }
  if (maybeDb?.code === "P2025") {
    return fail("Record not found.", 404);
  }

  console.error("[AutoForge API]", error);
  return fail("Something went wrong. Please try again.", 500);
}

export function isNotFound(error: unknown) {
  return (error as { code?: string })?.code === "P2025";
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") {
    if (origin === "null") {
      throw new ApiError("Request origin is not allowed.", 403);
    }
    return;
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return;

  try {
    if (new URL(origin).host !== host) {
      throw new ApiError("Request origin is not allowed.", 403);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Request origin is not allowed.", 403);
  }
}
