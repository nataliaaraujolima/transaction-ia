import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { recordAdImpressionSchema } from "@/app/_ads/_actions/record-ad-impression/schema";
import { recordImpression } from "@/app/_ads/_use-cases/record-impression";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = recordAdImpressionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await recordImpression({
    userId,
    ...parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.status });
  }

  return NextResponse.json(
    {
      ok: true,
      deduplicated: result.deduplicated,
      ...(result.deduplicated ? { reason: result.reason } : {}),
    },
    { status: result.status }
  );
}
