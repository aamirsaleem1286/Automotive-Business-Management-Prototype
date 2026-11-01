import { generateQuoteRef } from "@/lib/codes";
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
import { quoteSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const quotes = await prisma.quote.findMany({
      orderBy: { issuedAt: "desc" },
      take: 500,
    });
    return ok(serializeMany(quotes));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, quoteSchema);
    const quote = await prisma.quote.create({
      data: {
        ...data,
        ref: await generateQuoteRef(),
        issuedAt: new Date(),
      },
    });
    return created(serialize(quote));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
