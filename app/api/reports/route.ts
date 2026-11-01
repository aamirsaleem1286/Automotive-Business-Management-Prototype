import { LEAD_STATUSES, QUOTE_STATUSES } from "@/lib/constants";
import { requireSession } from "@/lib/guard";
import { apiErrorResponse, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { ReportData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();

    const [
      leadCount,
      quoteCount,
      approvedQuotes,
      parts,
      openValue,
      leadRows,
      quoteRows,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "Approved" } }),
      prisma.part.findMany({ select: { stock: true, minStock: true } }),
      prisma.lead.aggregate({
        where: { status: { notIn: ["Won", "Lost"] } },
        _sum: { value: true },
      }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.quote.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const leadMap = new Map(
      leadRows.map((row) => [row.status, row._count._all])
    );
    const quoteMap = new Map(
      quoteRows.map((row) => [row.status, row._count._all])
    );

    const data: ReportData = {
      kpis: {
        leadCount,
        quoteApprovalRate: quoteCount
          ? Math.round((approvedQuotes / quoteCount) * 100)
          : 0,
        openJobValue: openValue._sum.value ?? 0,
        lowStockSkus: parts.filter((part) => part.stock <= part.minStock).length,
      },
      leadMix: LEAD_STATUSES.map((status) => ({
        status,
        count: leadMap.get(status) ?? 0,
      })),
      quoteMix: QUOTE_STATUSES.map((status) => ({
        status,
        count: quoteMap.get(status) ?? 0,
      })),
    };

    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
