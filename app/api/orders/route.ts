import { generateOrderRef } from "@/lib/codes";
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
import { orderSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const orders = await prisma.order.findMany({
      orderBy: { orderedAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(orders));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, orderSchema);
    const order = await prisma.order.create({
      data: {
        ...data,
        ref: await generateOrderRef(),
        orderedAt: new Date(),
      },
    });
    return created(serialize(order));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
