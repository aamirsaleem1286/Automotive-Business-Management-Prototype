import { apiErrorResponse, fail, ok } from "@/lib/http";
import { getSession } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Authentication required.", 401);
    return ok(session);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
