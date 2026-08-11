import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { pluggyClient } from "../../_lib/pluggy";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await pluggyClient.createConnectToken(undefined, {
      clientUserId: userId,
    });
    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("Erro ao gerar connect token:", error);
    return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 });
  }
}
