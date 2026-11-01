import { NextResponse } from "next/server";
import {
  apiErrorResponse,
  assertSameOrigin,
} from "@/lib/http";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ data: { ok: true } });
    response.cookies.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
