import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStore } from "../../db/store";
import { requireAdmin } from "../../db/adminAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await getStore();

  if (req.method === "GET") {
    const songs = await store.listSongs();
    return res.status(200).json(songs);
  }

  if (req.method === "POST") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const song = await store.createSong(req.body);
    return res.status(201).json(song);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Metodo no permitido" });
}
