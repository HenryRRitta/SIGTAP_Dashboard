import type { SigtapData } from "./types";

const DB_NAME = "mesa-sigtap";
const STORE = "tabela";
const KEY = "atual";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTabelaLocal(data: SigtapData): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(data, KEY);
  });
  db.close();
}

export async function loadTabelaLocal(): Promise<SigtapData | null> {
  try {
    const db = await openDb();
    const row = await new Promise<SigtapData | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result as SigtapData | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return row && row.meta?.competencia && Array.isArray(row.procedures) ? row : null;
  } catch {
    return null;
  }
}

export function competenciaMaisNova(a?: string, b?: string) {
  const x = a ?? "";
  const y = b ?? "";
  return x >= y ? a : b;
}
