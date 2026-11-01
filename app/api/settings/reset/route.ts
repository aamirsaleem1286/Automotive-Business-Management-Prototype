import { requireAdmin } from "@/lib/guard";
import {
  ApiError,
  apiErrorResponse,
  assertSameOrigin,
  ok,
} from "@/lib/http";
import { seedContent } from "@/lib/seed";
import { serialize } from "@/lib/serializers";
import { getSettingsDocument } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    assertSameOrigin(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("A confirmation payload is required.", 400);
    }

    if (
      typeof body !== "object" ||
      body === null ||
      (body as { confirm?: string }).confirm !== "RESET"
    ) {
      throw new ApiError("Type RESET to confirm this action.", 400);
    }

    const result = await seedContent(true);
    const settings = await getSettingsDocument();
    return ok({
      reset: true,
      inserted: result.inserted,
      settings: serialize(settings),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
