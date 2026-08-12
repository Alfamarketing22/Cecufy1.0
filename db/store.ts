import type { Store } from "./types";

let storePromise: Promise<Store> | null = null;

async function loadStore(): Promise<Store> {
  if (process.env.DATABASE_URL) {
    const { pgStore } = await import("./pgStore");
    return pgStore;
  }
  const { fileStore } = await import("./fileStore");
  return fileStore;
}

export function getStore(): Promise<Store> {
  if (!storePromise) storePromise = loadStore();
  return storePromise;
}
