/* eslint-disable no-console */
import path from "node:path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), ".env"));
  } catch {
    // Environment variables may already be supplied by the shell.
  }
}

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { hashPassword } = await import("../lib/auth");
  const { seedContent } = await import("../lib/seed");

  const reset = process.argv.includes("--reset");
  const email = (process.env.ADMIN_EMAIL ?? "admin@autoforge.local")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "AutoForge Admin";

  if (!password || password.length < 8) {
    throw new Error(
      "Set ADMIN_PASSWORD (minimum 8 characters) in .env before seeding."
    );
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "admin",
        active: true,
      },
    });
    console.log(`Created admin account: ${email}`);
  } else if (reset) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: {
        name,
        passwordHash: await hashPassword(password),
        role: "admin",
        active: true,
      },
    });
    console.log(`Updated admin account password: ${email}`);
  } else {
    console.log(`Admin account already exists: ${email}`);
  }

  const result = await seedContent(reset);
  console.log(
    `${reset ? "Reset" : "Seeded"} content:`,
    JSON.stringify(result.inserted)
  );
  console.log("Done.");
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
