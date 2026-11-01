import { STAGE_PROGRESS } from "@/lib/constants";
import { generateProjectRef } from "@/lib/codes";
import { requireSession } from "@/lib/guard";
import {
  apiErrorResponse,
  assertSameOrigin,
  created,
  ok,
  parseJson,
} from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serialize, serializeMany } from "@/lib/serializers";
import { projectSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(projects));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, projectSchema);
    const project = await prisma.project.create({
      data: {
        ...data,
        ref: await generateProjectRef(),
        progress: STAGE_PROGRESS[data.stage ?? "Inspection"],
        dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      },
    });
    return created(serialize(project));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
