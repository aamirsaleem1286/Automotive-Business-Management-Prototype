import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import {
  ApiError,
  apiErrorResponse,
  assertSameOrigin,
  parseJson,
} from "@/lib/http";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "local";
    const key = `login:${ip}`;
    const limit = rateLimit(key, 10, 15 * 60 * 1000);
    if (!limit.ok) {
      throw new ApiError(
        `Too many login attempts. Try again in ${limit.retryAfter} seconds.`,
        429
      );
    }

    const { email, password } = await parseJson(request, loginSchema);
    const user = await authenticateAdmin(email, password);
    if (!user) {
      throw new ApiError("Invalid email or password.", 401);
    }

    resetRateLimit(key);
    const token = await signSession(user);
    const response = NextResponse.json({ data: user });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
