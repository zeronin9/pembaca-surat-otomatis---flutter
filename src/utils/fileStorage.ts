export interface StoredLetterFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
}

const DB_NAME = 'pembaca_surat_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'letter_files';

const memoryFallback = new Map<string, StoredLetterFile>();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveLetterFile(
  id: string,
  file: Blob,
  meta: { fileName: string; mimeType: string; sizeBytes: number },
): Promise<void> {
  const record: StoredLetterFile = {
    id,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    sizeBytes: meta.sizeBytes,
    blob: file,
  };

  memoryFallback.set(id, record);

  const db = await openDatabase();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export async function getLetterFile(id: string): Promise<StoredLetterFile | null> {
  const db = await openDatabase();
  if (db) {
    const fromDb = await new Promise<StoredLetterFile | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => {
          db.close();
          resolve((req.result as StoredLetterFile | undefined) ?? null);
        };
        req.onerror = () => {
          db.close();
          resolve(null);
        };
      } catch {
        db.close();
        resolve(null);
      }
    });

    if (fromDb) {
      return fromDb;
    }
  }

  return memoryFallback.get(id) ?? null;
}

export async function deleteLetterFile(id: string): Promise<void> {
  memoryFallback.delete(id);

  const db = await openDatabase();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}
