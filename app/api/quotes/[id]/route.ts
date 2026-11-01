import { requireAdmin, requireSession } from "@/lib/guard";
import {
  ApiError,
  apiErrorResponse,
  assertSameOrigin,
  fail,
  isNotFound,
  ok,
  parseJson,
} from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";
import { idSchema, quoteUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const { id } = await params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError("Invalid quote id.", 400);
    const data = await parseJson(request, quoteUpdateSchema);
    const quote = await prisma.quote.update({
      where: { id: parsedId.data },
      data,
    });
    return ok(serialize(quote));
  } catch (error) {
    if (isNotFound(error)) return fail("Quote not found.", 404);
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const { id } = await params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError("Invalid quote id.", 400);
    await prisma.quote.delete({ where: { id: parsedId.data } });
    return ok({ id: parsedId.data });
  } catch (error) {
    if (isNotFound(error)) return fail("Quote not found.", 404);
    return apiErrorResponse(error);
  }
}
