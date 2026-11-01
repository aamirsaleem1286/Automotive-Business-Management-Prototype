import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { SessionUser } from "./types";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const admin = await prisma.admin.findFirst({
    where: { email: email.trim().toLowerCase(), active: true },
  });

  if (!admin?.passwordHash) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role === "manager" ? "manager" : "admin",
  };
}
