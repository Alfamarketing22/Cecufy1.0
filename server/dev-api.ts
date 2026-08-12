import "dotenv/config";
import express from "express";
import songsIndex from "../api/songs/index";
import songsId from "../api/songs/[id]";
import songbooksIndex from "../api/songbooks/index";
import songbooksId from "../api/songbooks/[id]";
import adminLogin from "../api/admin/login";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.all("/api/songs", (req, res) => songsIndex(req as any, res as any));
app.all("/api/songs/:id", (req, res) => {
  (req.query as Record<string, string>).id = req.params.id;
  songsId(req as any, res as any);
});
app.all("/api/songbooks", (req, res) => songbooksIndex(req as any, res as any));
app.all("/api/songbooks/:id", (req, res) => {
  (req.query as Record<string, string>).id = req.params.id;
  songbooksId(req as any, res as any);
});
app.all("/api/admin/login", (req, res) => adminLogin(req as any, res as any));

const port = Number(process.env.API_PORT) || 3001;
app.listen(port, () => {
  console.log(`API local escuchando en http://localhost:${port}`);
});
