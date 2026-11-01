import type { BusinessSettings, ReadinessItem } from "./types";
import { prisma } from "./prisma";
import { sampleSettings } from "./seed-data";

export function parseReadiness(value: string): ReadinessItem[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ReadinessItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ReadinessItem).key === "string" &&
        typeof (item as ReadinessItem).label === "string" &&
        typeof (item as ReadinessItem).completed === "boolean"
    );
  } catch {
    return [];
  }
}

export async function getSettingsDocument(): Promise<BusinessSettings> {
  const record = await prisma.settings.upsert({
    where: { key: "global" },
    update: {},
    create: {
      key: sampleSettings.key,
      businessName: sampleSettings.businessName,
      framework: sampleSettings.framework,
      workshopAddress: sampleSettings.workshopAddress,
      contactEmail: sampleSettings.contactEmail,
      contactPhone: sampleSettings.contactPhone,
      readiness: JSON.stringify(sampleSettings.readiness),
    },
  });

  return {
    id: record.id,
    businessName: record.businessName,
    framework: record.framework,
    workshopAddress: record.workshopAddress,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    readiness: parseReadiness(record.readiness),
    updatedAt: record.updatedAt.toISOString(),
  };
}
