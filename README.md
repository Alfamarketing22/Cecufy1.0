# CecuFy

Cancionero digital para la alabanza: letras, acordes transponibles (notación
Nashville) y cancioneros por domingo. Réplica funcional de la arquitectura de
presbify.vercel.app, construida desde cero.

> **Nota sobre el contenido**: la base de datos arranca con 2 canciones de
> ejemplo originales (sin copyright) solo para validar el formato de acordes.
> No incluye letras de canciones de terceros. Cargá tu propio repertorio
> desde el panel `/admin` — si tu iglesia usa canciones con copyright,
> asegurate de tener la licencia correspondiente (ej. CCLI) para reproducirlas.

## Arquitectura

- **Frontend**: React + Vite + React Router, SPA con tema oscuro (variables
  CSS en `src/styles/tokens.css`).
- **API**: funciones serverless de Node (`/api/*.ts`), listas para Vercel.
- **Datos**: Postgres (pensado para Vercel Postgres / Neon) vía `pg`. Si no
  hay `DATABASE_URL` configurada, cae automáticamente a un almacén local en
  `db/local-data.json` (útil para desarrollar sin base de datos).
- **Acordes**: cada canción guarda las líneas de letra con acordes en números
  romanos (`I`, `IV`, `VIm`, `IVmaj7`, `bVII`...) posicionados por caracter,
  igual que el original. `src/lib/transpose.ts` calcula el acorde real para
  cualquier tono elegido.
- **Cifrado**: cada canción tiene un cifrado por defecto (`notation`):
  `latin` (DO RE MI) o `american` (C D E). En el visor hay dos perillas a la
  derecha del panel de transposición: una alterna el cifrado y otra la grafía
  de alteraciones (♯ / ♭). Como los acordes se guardan como grados, ambas
  conversiones son de presentación: no tocan los datos.
- **Admin**: panel protegido por una clave simple (`ADMIN_PASSWORD`). El
  login devuelve un token de sesión opaco que el cliente guarda en
  `localStorage` y manda como `Authorization: Bearer` en las escrituras
  (`POST`/`PUT`/`DELETE`), que el servidor valida.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completá ADMIN_PASSWORD
npm run dev
```

Esto levanta en paralelo:
- Vite en `http://localhost:5173` (frontend)
- Una API Express local en `http://localhost:3001` que monta los mismos
  handlers de `api/*.ts` (proxeada desde Vite en `/api`)

Sin `DATABASE_URL`, los datos se guardan en `db/local-data.json` (ignorado
por git). Borrá ese archivo para volver al estado semilla.

## Despliegue en Vercel + Neon Postgres

1. `vercel link` para conectar el proyecto.
2. Agregá una base Postgres desde el Marketplace de Vercel (Neon) o
   `vercel storage create postgres`, y linkeala al proyecto — esto define
   automáticamente `DATABASE_URL` (o `POSTGRES_URL`) en las env vars.
3. Corré el esquema una vez contra esa base:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
   Si la base ya existía desde antes del campo `notation`, aplicá la migración:
   ```bash
   psql "$DATABASE_URL" -f db/migrations/001-add-notation.sql
   ```
4. Configurá `ADMIN_PASSWORD` en las env vars del proyecto (Vercel dashboard
   o `vercel env add ADMIN_PASSWORD`).
5. `vercel deploy` (o conectá el repo para deploys automáticos). El
   `vercel.json` incluido agrega el rewrite de SPA para que rutas como
   `/admin` o `/songbooks/:id` funcionen en refresh/deep-link.

## Estructura

```
api/                  funciones serverless (Vercel Node)
  songs/index.ts       GET lista / POST crear
  songs/[id].ts         GET / PUT / DELETE una canción
  songbooks/index.ts    GET lista / POST crear
  songbooks/[id].ts      GET / PUT / DELETE un cancionero
  admin/login.ts        POST clave -> token de sesión
db/
  schema.sql            esquema Postgres
  pgStore.ts / fileStore.ts  implementaciones intercambiables del store
  store.ts               selecciona pg o file según DATABASE_URL
  seedData.ts             canciones/cancionero de ejemplo
server/dev-api.ts      shim Express que monta los handlers de api/ para dev local
src/
  pages/                Home, Buscar, Songbooks, SongbookDetail, SongbookPrint, Admin, SongDetail
  components/           Layout, SongCard, ChordSheetView, SongEditor...
  lib/transpose.ts       Nashville -> acorde real por tono
  lib/chordPro.ts         formato de edición en texto plano <-> modelo de datos
```

## Formato de edición de canciones

En el editor de `/admin` la letra se escribe así:

```
## coro
[SOL]Letra de la primera linea[DO]mas letra
[MIm]Segunda linea[DO]
```

- `## nombre` marca el inicio de una sección. La barra de herramientas tiene
  botones para las habituales (intro, estrofa, pre-coro, coro, puente,
  interludio, instrumental, final).
- `[acorde]` va justo antes de la sílaba donde se toca. Hay un botón para
  insertar los corchetes y una paleta con los acordes del tono elegido.

### Acordes reales vs. grados

El selector **"Los acordes los escribo en"** define cómo se tipea:

- **Cifrado** (por defecto): escribís acordes reales — `SOL`, `REm`, `G`,
  `Am7`. Al guardar se convierten a grados relativos al tono declarado.
- **Grados**: escribís directamente `I`, `IV`, `VIm`, `IVmaj7`, `bVII`.

En los dos casos **la base de datos guarda grados**, que es lo que permite
transponer después a cualquier tonalidad. Al reabrir una canción el texto se
vuelve a mostrar en el modo elegido.

Detalles de comportamiento:

- Cambiar el **cifrado** (normal ↔ americano) reescribe lo tipeado: `SOL` → `G`.
- Cambiar el **tono original** *no* toca el texto: los acordes escritos son
  literales, y el tono sólo define contra qué se calculan los grados. Así se
  puede escribir primero y declarar el tono después.
- El tono se almacena siempre en cifrado latino, aunque se muestre en
  americano, para que el dato no dependa de cómo lo estaba viendo quien editó.
