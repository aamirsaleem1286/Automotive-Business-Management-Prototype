import { STAGE_PROGRESS } from "@/lib/constants";
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
import { idSchema, projectUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError("Invalid job id.", 400);
    const project = await prisma.project.findUnique({
      where: { id: parsedId.data },
    });
    if (!project) return fail("Restoration job not found.", 404);
    return ok(serialize(project));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const { id } = await params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError("Invalid job id.", 400);
    const data = await parseJson(request, projectUpdateSchema);

    const project = await prisma.project.update({
      where: { id: parsedId.data },
      data: {
        ...data,
        ...(data.dueDate
          ? { dueDate: new Date(`${data.dueDate}T00:00:00.000Z`) }
          : {}),
        ...(data.stage ? { progress: STAGE_PROGRESS[data.stage] } : {}),
      },
    });
    return ok(serialize(project));
  } catch (error) {
    if (isNotFound(error)) return fail("Restoration job not found.", 404);
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const { id } = await params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError("Invalid job id.", 400);
    await prisma.project.delete({ where: { id: parsedId.data } });
    return ok({ id: parsedId.data });
  } catch (error) {
    if (isNotFound(error)) return fail("Restoration job not found.", 404);
    return apiErrorResponse(error);
  }
}
