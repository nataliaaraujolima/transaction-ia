import { auth } from "@clerk/nextjs/server";
import { pluggyClient } from "@/app/_lib/pluggy";
import type { PluggyConnectTokenResult } from "../_types/pluggy-sync";

/**
 * A rejeição é capturada aqui para que a Promise entregue ao cliente nunca
 * rejeite: quem consome com `use()` trata a falha com uma guard clause, sem
 * precisar de error boundary. Erros inesperados fora deste fluxo continuam
 * cobertos pelo `error.tsx` do App Router.
 */
export const createPluggyConnectToken = async (): Promise<PluggyConnectTokenResult> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { accessToken } = await pluggyClient.createConnectToken(undefined, {
      clientUserId: userId,
    });

    return { accessToken, errorMessage: null };
  } catch (error) {
    console.error("Erro ao buscar connect token:", error);
    return {
      accessToken: null,
      errorMessage: "Não foi possível gerar o token de conexão.",
    };
  }
};
