import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrors } from "../../db/http.js";
import { createSessionToken } from "../../db/adminAuth.js";

export default withErrors(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD no esta configurada en el servidor" });
  }

  const { password } = req.body ?? {};
  if (password !== expected) {
    return res.status(401).json({ error: "Clave incorrecta" });
  }

  return res.status(200).json({ token: createSessionToken(expected) });
});
