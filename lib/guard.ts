import { cookies } from "next/headers";
import { ApiError } from "./http";
import {
  SESSION_COOKIE,
  verifySession,
} from "./session";
import type { SessionUser } from "./types";

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new ApiError("Authentication required.", 401);
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new ApiError("Administrator authorization required.", 403);
  }
  return session;
}
