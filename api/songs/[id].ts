import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrors } from "../../db/http.js";
import { getStore } from "../../db/store.js";
import { requireAdmin } from "../../db/adminAuth.js";

export default withErrors(async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await getStore();
  const id = req.query.id as string;

  if (req.method === "GET") {
    const song = await store.getSong(id);
    if (!song) return res.status(404).json({ error: "No encontrada" });
    return res.status(200).json(song);
  }

  if (req.method === "PUT") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const song = await store.updateSong(id, req.body);
    if (!song) return res.status(404).json({ error: "No encontrada" });
    return res.status(200).json(song);
  }

  if (req.method === "DELETE") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const ok = await store.deleteSong(id);
    if (!ok) return res.status(404).json({ error: "No encontrada" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Metodo no permitido" });
});
