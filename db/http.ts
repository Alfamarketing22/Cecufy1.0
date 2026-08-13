import type { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

/**
 * Envuelve un handler para que un error no termine en FUNCTION_INVOCATION_FAILED.
 * Sin esto, una excepcion (por ejemplo, falta DATABASE_URL) devuelve un 500
 * opaco y el motivo solo aparece en los logs de la plataforma.
 */
export function withErrors(handler: Handler): Handler {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error inesperado";
      console.error("[api]", message, e);
      if (res.headersSent) return;
      return res.status(500).json({ error: message });
    }
  };
}
