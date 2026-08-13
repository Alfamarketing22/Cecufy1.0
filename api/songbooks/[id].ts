import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStore } from "../../db/store";
import { requireAdmin } from "../../db/adminAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await getStore();
  const id = req.query.id as string;

  if (req.method === "GET") {
    const songbook = await store.getSongbook(id);
    if (!songbook) return res.status(404).json({ error: "No encontrado" });
    return res.status(200).json(songbook);
  }

  if (req.method === "PUT") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const songbook = await store.updateSongbook(id, req.body);
    if (!songbook) return res.status(404).json({ error: "No encontrado" });
    return res.status(200).json(songbook);
  }

  if (req.method === "DELETE") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const ok = await store.deleteSongbook(id);
    if (!ok) return res.status(404).json({ error: "No encontrado" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Metodo no permitido" });
}
