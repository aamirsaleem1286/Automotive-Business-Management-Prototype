import { requireSession } from "@/lib/guard";
import {
  apiErrorResponse,
  assertSameOrigin,
  ok,
  parseJson,
} from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";
import {
  getSettingsDocument,
  parseReadiness,
} from "@/lib/settings";
import { settingsUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
    const settings = await getSettingsDocument();
    return ok(serialize(settings));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession();
    assertSameOrigin(request);
    const data = await parseJson(request, settingsUpdateSchema);
    await getSettingsDocument();

    const { readiness, ...rest } = data;
    const update = {
      ...rest,
      ...(readiness ? { readiness: JSON.stringify(readiness) } : {}),
    };

    const settings = await prisma.settings.update({
      where: { key: "global" },
      data: update,
    });

    return ok(
      serialize({
        ...settings,
        readiness: parseReadiness(settings.readiness),
      })
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
