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
import { partSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const parts = await prisma.part.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(parts));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, partSchema);
    const part = await prisma.part.create({ data });
    return created(serialize(part));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
