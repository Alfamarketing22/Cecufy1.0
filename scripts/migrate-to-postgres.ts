/**
 * Sube la librería local (db/local-data.json) a Postgres.
 *
 *   npm run migrate            # crea el esquema y sube lo que falte
 *   npm run migrate -- --force # además pisa las canciones que ya existan
 *
 * Necesita DATABASE_URL en el entorno (o en .env). Es idempotente: sin
 * --force nunca sobrescribe algo que ya esté en la base, así que se puede
 * correr las veces que haga falta.
 */

import { config as loadEnv } from "dotenv";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { Pool } from "pg";
import type { Song, Songbook } from "../src/types/index.js";

// `.env.migrate` es un archivo aparte a proposito: guarda la cadena de la base
// de produccion sin que el servidor de desarrollo la lea por accidente y
// termine escribiendo sobre los datos reales. Tiene prioridad sobre `.env`.
loadEnv({ path: ".env.migrate" });
loadEnv();

const DATA_FILE = path.resolve(process.cwd(), "db", "local-data.json");
const SCHEMA_FILE = path.resolve(process.cwd(), "db", "schema.sql");
const force = process.argv.includes("--force");

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  fail(
    "Falta DATABASE_URL.\n\n" +
      "  Vercel marca las variables de las integraciones como sensibles, asi que\n" +
      "  `vercel env pull` devuelve un marcador, no la cadena real.\n\n" +
      "  Copiala del dashboard (proyecto -> Storage -> la base -> connection\n" +
      "  string, o desde Neon) y pegala en un archivo .env.migrate:\n\n" +
      "      DATABASE_URL=postgres://usuario:clave@host/basededatos?sslmode=require\n\n" +
      "  Ese archivo esta en .gitignore y el servidor de desarrollo no lo lee,\n" +
      "  asi que no hay riesgo de escribir en produccion sin querer."
  );
}

if (!existsSync(DATA_FILE)) {
  fail(`No encontré ${DATA_FILE}. Corré la app en local al menos una vez para generarlo.`);
}

const data: { songs: Song[]; songbooks: Songbook[] } = JSON.parse(readFileSync(DATA_FILE, "utf8"));

const pool = new Pool({
  connectionString,
  ssl: /neon\.tech|sslmode=require|vercel/.test(connectionString) ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  console.log(`\nOrigen: ${data.songs.length} canciones · ${data.songbooks.length} cancioneros`);
  console.log(`Destino: ${connectionString!.replace(/:[^:@/]+@/, ":****@")}\n`);

  // 1. Esquema
  await pool.query(readFileSync(SCHEMA_FILE, "utf8"));
  await pool.query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS notation TEXT NOT NULL DEFAULT 'latin'`);
  console.log("· esquema aplicado");

  // 2. Canciones
  let creadas = 0;
  let pisadas = 0;
  let salteadas = 0;

  for (const s of data.songs) {
    const conflicto = force
      ? `DO UPDATE SET title = EXCLUDED.title, artist = EXCLUDED.artist,
           original_scale = EXCLUDED.original_scale, notation = EXCLUDED.notation,
           lyrics = EXCLUDED.lyrics, youtube_url = EXCLUDED.youtube_url, updated_at = now()`
      : "DO NOTHING";

    const { rowCount } = await pool.query(
      `INSERT INTO songs (id, title, artist, original_scale, notation, lyrics, youtube_url, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, now()),COALESCE($9, now()))
       ON CONFLICT (id) ${conflicto}`,
      [
        s.id,
        s.title,
        s.artist ?? "",
        s.originalScale ?? "",
        s.notation ?? "latin",
        JSON.stringify(s.lyrics ?? { lines: [], sections: [] }),
        s.youtubeUrl ?? "",
        s.createdAt ?? null,
        s.updatedAt ?? null,
      ]
    );

    if (rowCount) (force ? pisadas++ : creadas++);
    else salteadas++;
  }

  // 3. Cancioneros
  let cancionerosOk = 0;
  let cancionerosSalteados = 0;

  for (const sb of data.songbooks) {
    const conflicto = force
      ? `DO UPDATE SET title = EXCLUDED.title, date = EXCLUDED.date,
           songs = EXCLUDED.songs, updated_at = now()`
      : "DO NOTHING";

    const { rowCount } = await pool.query(
      `INSERT INTO songbooks (id, title, date, songs, created_at, updated_at)
       VALUES ($1,$2,$3,$4,COALESCE($5, now()),COALESCE($6, now()))
       ON CONFLICT (id) ${conflicto}`,
      [
        sb.id,
        sb.title,
        sb.date ?? null,
        JSON.stringify(sb.songs ?? []),
        sb.createdAt ?? null,
        sb.updatedAt ?? null,
      ]
    );

    if (rowCount) cancionerosOk++;
    else cancionerosSalteados++;
  }

  // 4. Verificación contra la base, no contra lo que creemos que hicimos
  const { rows: totales } = await pool.query(
    `SELECT (SELECT count(*) FROM songs) AS canciones,
            (SELECT count(*) FROM songbooks) AS cancioneros`
  );
  const { rows: huerfanas } = await pool.query(
    `SELECT sb.title, elem->>'songId' AS falta
       FROM songbooks sb, jsonb_array_elements(sb.songs) elem
      WHERE NOT EXISTS (SELECT 1 FROM songs s WHERE s.id = elem->>'songId')`
  );

  console.log(
    `· canciones:   ${force ? `${pisadas} actualizadas` : `${creadas} nuevas`}, ${salteadas} ya estaban`
  );
  console.log(`· cancioneros: ${cancionerosOk} escritos, ${cancionerosSalteados} ya estaban`);
  console.log(`\nEn la base ahora: ${totales[0].canciones} canciones · ${totales[0].cancioneros} cancioneros`);

  if (huerfanas.length) {
    console.log("\n⚠ Cancioneros que apuntan a canciones inexistentes:");
    for (const h of huerfanas) console.log(`   "${h.title}" → ${h.falta}`);
  }

  console.log("\n✓ Listo\n");
}

main()
  .catch((e) => fail(e.message))
  .finally(() => pool.end());
