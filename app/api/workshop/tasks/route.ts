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
import { workshopTaskSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const tasks = await prisma.workshopTask.findMany({
      orderBy: { order: "asc" },
      take: 100,
    });
    return ok(serializeMany(tasks));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, workshopTaskSchema);
    const order = await prisma.workshopTask.count();
    const task = await prisma.workshopTask.create({
      data: { ...data, order },
    });
    return created(serialize(task));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
