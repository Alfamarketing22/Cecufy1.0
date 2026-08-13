import type { Store } from "./types.js";

let storePromise: Promise<Store> | null = null;

/** True cuando corremos como funcion serverless (Vercel define ambas). */
function isServerless(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function loadStore(): Promise<Store> {
  if (process.env.DATABASE_URL) {
    const { pgStore } = await import("./pgStore.js");
    return pgStore;
  }

  // El almacen en archivo no puede funcionar en serverless: el disco es de
  // solo lectura y efimero. Fallar aca con un mensaje claro es mucho mejor
  // que un EROFS a mitad de una escritura.
  if (isServerless()) {
    throw new Error(
      "Falta DATABASE_URL. En producción hace falta una base de datos: " +
        "creá una Postgres en Vercel → Storage y conectala a este proyecto."
    );
  }

  const { fileStore } = await import("./fileStore.js");
  return fileStore;
}

export function getStore(): Promise<Store> {
  if (!storePromise) storePromise = loadStore();
  return storePromise;
}
