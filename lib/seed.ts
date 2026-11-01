import { prisma } from "./prisma";
import {
  sampleCustomerUpdates,
  sampleLeads,
  sampleOrders,
  sampleParts,
  sampleProjects,
  sampleQuotes,
  sampleSettings,
  sampleWorkshopTasks,
} from "./seed-data";

type SeedResult = {
  reset: boolean;
  inserted: Record<string, number>;
};

type SeedDelegate = {
  count: () => Promise<number>;
  deleteMany: () => Promise<unknown>;
  createMany: (args: { data: unknown[] }) => Promise<unknown>;
};

async function seedCollection(
  name: string,
  delegate: SeedDelegate,
  docs: readonly unknown[],
  reset: boolean,
  inserted: Record<string, number>
) {
  if (reset) {
    await delegate.deleteMany();
  }
  const count = await delegate.count();
  if (reset || count === 0) {
    await delegate.createMany({ data: docs.map((doc) => ({ ...(doc as object) })) });
    inserted[name] = docs.length;
  } else {
    inserted[name] = 0;
  }
}

export async function seedContent(reset = false): Promise<SeedResult> {
  const inserted: Record<string, number> = {};

  await seedCollection(
    "leads",
    prisma.lead as unknown as SeedDelegate,
    sampleLeads,
    reset,
    inserted
  );
  await seedCollection(
    "projects",
    prisma.project as unknown as SeedDelegate,
    sampleProjects,
    reset,
    inserted
  );
  await seedCollection(
    "quotes",
    prisma.quote as unknown as SeedDelegate,
    sampleQuotes,
    reset,
    inserted
  );
  await seedCollection(
    "parts",
    prisma.part as unknown as SeedDelegate,
    sampleParts,
    reset,
    inserted
  );
  await seedCollection(
    "orders",
    prisma.order as unknown as SeedDelegate,
    sampleOrders,
    reset,
    inserted
  );
  await seedCollection(
    "updates",
    prisma.customerUpdate as unknown as SeedDelegate,
    sampleCustomerUpdates,
    reset,
    inserted
  );
  await seedCollection(
    "workshopTasks",
    prisma.workshopTask as unknown as SeedDelegate,
    sampleWorkshopTasks,
    reset,
    inserted
  );

  if (reset) {
    await prisma.settings.deleteMany();
  }

  const settings = await prisma.settings.findUnique({ where: { key: "global" } });
  if (!settings) {
    await prisma.settings.create({
      data: {
        key: sampleSettings.key,
        businessName: sampleSettings.businessName,
        framework: sampleSettings.framework,
        workshopAddress: sampleSettings.workshopAddress,
        contactEmail: sampleSettings.contactEmail,
        contactPhone: sampleSettings.contactPhone,
        readiness: JSON.stringify(sampleSettings.readiness),
      },
    });
    inserted.settings = 1;
  } else {
    inserted.settings = 0;
  }

  return { reset, inserted };
}
