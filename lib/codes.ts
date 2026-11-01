import { prisma } from "./prisma";
import { ApiError } from "./http";

async function uniqueCode(
  prefix: string,
  exists: (code: string) => Promise<boolean>
) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const code = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await exists(code))) return code;
  }
  throw new ApiError("Could not generate a unique record code.", 500);
}

export function generateProjectRef() {
  return uniqueCode("AF-", async (code) =>
    Boolean(
      await prisma.project.findUnique({ where: { ref: code }, select: { id: true } })
    )
  );
}

export function generateQuoteRef() {
  return uniqueCode("QT-", async (code) =>
    Boolean(
      await prisma.quote.findUnique({ where: { ref: code }, select: { id: true } })
    )
  );
}

export function generateOrderRef() {
  return uniqueCode("ORD-", async (code) =>
    Boolean(
      await prisma.order.findUnique({ where: { ref: code }, select: { id: true } })
    )
  );
}
