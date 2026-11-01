import { BICEP, LEAD_STATUSES } from "@/lib/constants";
import { requireSession } from "@/lib/guard";
import { apiErrorResponse, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeMany } from "@/lib/serializers";
import type { DashboardData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();

    const [
      leads,
      projects,
      scopes,
      openLeads,
      pipelineRows,
      parts,
      activeProjects,
    ] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.project.findMany({ select: { scope: true } }),
      prisma.lead.count({ where: { status: { notIn: ["Won", "Lost"] } } }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { value: true },
      }),
      prisma.part.findMany({ select: { stock: true, minStock: true } }),
      prisma.project.count({ where: { stage: { not: "Ready for handover" } } }),
    ]);

    const pipelineMap = new Map(
      pipelineRows.map((row) => [
        row.status,
        { count: row._count._all, value: row._sum.value ?? 0 },
      ])
    );
    const pipeline = LEAD_STATUSES.map((stage) => ({
      stage,
      count: pipelineMap.get(stage)?.count ?? 0,
      value: pipelineMap.get(stage)?.value ?? 0,
    }));

    const pipelineValue = pipeline.reduce((sum, row) => sum + row.value, 0);

    const bicepJobs: Record<string, number> = {};
    for (const item of BICEP) bicepJobs[item.title] = 0;

    for (const project of scopes) {
      const scope = project.scope ?? "";
      if (scope === "Full BICEP") {
        for (const item of BICEP) bicepJobs[item.title] += 1;
        continue;
      }
      for (const item of BICEP) {
        if (scope.toLowerCase().includes(item.title.toLowerCase())) {
          bicepJobs[item.title] += 1;
        }
      }
    }

    const data: DashboardData = {
      kpis: {
        openLeads,
        activeProjects,
        pipelineValue,
        partsToReorder: parts.filter((part) => part.stock <= part.minStock)
          .length,
      },
      leads: serializeMany(leads) as unknown as DashboardData["leads"],
      projects: serializeMany(projects) as unknown as DashboardData["projects"],
      pipeline,
      bicepJobs,
    };

    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
