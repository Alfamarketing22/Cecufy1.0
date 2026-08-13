import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrors } from "../../db/http.js";
import { getStore } from "../../db/store.js";
import { requireAdmin } from "../../db/adminAuth.js";

export default withErrors(async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await getStore();

  if (req.method === "GET") {
    const songbooks = await store.listSongbooks();
    return res.status(200).json(songbooks);
  }

  if (req.method === "POST") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "No autorizado" });
    const songbook = await store.createSongbook(req.body);
    return res.status(201).json(songbook);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Metodo no permitido" });
});
