const DB_NAME = "dzili_binder_db";
const DB_VERSION = 1;
const STORE_NAME = "sheets";

export const ALLOWED_CATEGORIES = [
  "Kalkulus",
  "Aljabar",
  "Statistika",
  "Geometri",
  "Analisis",
  "Umum"
];

export function sanitizeString(val, maxLen = 4000) {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export function normalizeCategory(cat) {
  const clean = sanitizeString(cat, 40);
  return ALLOWED_CATEGORIES.includes(clean) ? clean : "Umum";
}

export function validateSheet(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{4,64}$/.test(item.id)) return false;
  if (typeof item.title !== "string" || item.title.trim().length === 0) return false;
  if (typeof item.content !== "string") return false;
  return true;
}

function sanitizeSheetRecord(raw) {
  const now = new Date().toISOString();
  const id =
    typeof raw?.id === "string" && /^[a-zA-Z0-9_-]{4,64}$/.test(raw.id)
      ? raw.id
      : `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    category: normalizeCategory(raw?.category),
    title: sanitizeString(raw?.title, 160) || "Tanpa Judul",
    content: sanitizeString(raw?.content, 15000),
    ocrText: sanitizeString(raw?.ocrText, 10000),
    imageDataUrl:
      typeof raw?.imageDataUrl === "string" &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.imageDataUrl) &&
      raw.imageDataUrl.length < 1_500_000
        ? raw.imageDataUrl
        : "",
    createdAt: sanitizeString(raw?.createdAt, 40) || now,
    updatedAt: now
  };
}

export function openBinderDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Gagal membuka IndexedDB"));
  });
}

export async function getAllBinderSheets() {
  const db = await openBinderDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const valid = (req.result || [])
        .filter(validateSheet)
        .map(sanitizeSheetRecord)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      resolve(valid);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function upsertBinderSheet(input) {
  const db = await openBinderDB();
  const record = sanitizeSheetRecord(input);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBinderSheet(id) {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{4,64}$/.test(id)) return false;
  const db = await openBinderDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export function filterAndSearchSheets(sheets, { category = "Semua", query = "" } = {}) {
  const q = sanitizeString(query, 120).toLowerCase();
  return sheets.filter((s) => {
    const matchCat = !category || category === "Semua" || s.category === category;
    if (!matchCat) return false;
    if (!q) return true;
    const hay = `${s.title} ${s.category} ${s.content} ${s.ocrText}`.toLowerCase();
    return hay.includes(q);
  });
}

export async function exportBinderBackup() {
  const sheets = await getAllBinderSheets();
  return JSON.stringify(
    { app: "dzili-binder", schema: 1, exportedAt: new Date().toISOString(), items: sheets },
    null,
    2
  );
}

export async function restoreBinderBackup(jsonText, { merge = true } = {}) {
  if (typeof jsonText !== "string" || jsonText.length > 10_000_000) {
    throw new Error("Ukuran file backup terlalu besar atau tidak valid.");
  }
  const parsed = JSON.parse(jsonText);
  if (!parsed || parsed.app !== "dzili-binder" || !Array.isArray(parsed.items)) {
    throw new Error("Format backup Binder tidak sesuai.");
  }
  const db = await openBinderDB();
  if (!merge) {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const req = tx.objectStore(STORE_NAME).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
  let count = 0;
  for (const rawItem of parsed.items.slice(0, 500)) {
    if (validateSheet(rawItem)) {
      await upsertBinderSheet(rawItem);
      count++;
    }
  }
  return count;
}
