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
import { customerUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const updates = await prisma.customerUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(updates));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, customerUpdateSchema);
    const update = await prisma.customerUpdate.create({
      data: {
        ...data,
        sentAt: data.status === "Sent" ? new Date() : null,
      },
    });
    return created(serialize(update));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
