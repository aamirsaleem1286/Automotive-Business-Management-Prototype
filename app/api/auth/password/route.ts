import { requireSession } from "@/lib/guard";
import {
  ApiError,
  apiErrorResponse,
  assertSameOrigin,
  ok,
  parseJson,
} from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);

    const { currentPassword, newPassword } = await parseJson(
      request,
      changePasswordSchema
    );

    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin?.passwordHash) {
      throw new ApiError("Account not found.", 404);
    }

    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      throw new ApiError("Current password is incorrect.", 400);
    }

    if (await verifyPassword(newPassword, admin.passwordHash)) {
      throw new ApiError(
        "New password must be different from the current password.",
        400
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return ok({ updated: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
