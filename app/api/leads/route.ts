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
import { leadSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(leads));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, leadSchema);
    const lead = await prisma.lead.create({ data });
    return created(serialize(lead));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
