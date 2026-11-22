export function cleanText(val, max = 2000) {
  if (typeof val !== "string") return "";
  return val.replace(/\u0000/g, "").trim().slice(0, max);
}

export function loadStore(key, fallback, validateFn) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (typeof validateFn === "function" && !validateFn(parsed)) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveStore(key, data) {
  try {
    const prev = localStorage.getItem(key);
    if (prev !== null) {
      localStorage.setItem(`${key}.bak`, prev);
    }
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function exportAllDziliData(keys) {
  const payload = {
    app: "dzili",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {}
  };
  for (const k of keys) {
    payload.data[k] = loadStore(k, null, null);
  }
  return JSON.stringify(payload, null, 2);
}

export function importDziliData(jsonString, allowedKeys, validatorsByKey) {
  if (typeof jsonString !== "string" || jsonString.length > 2_000_000) {
    return { ok: false, reason: "Ukuran atau format file tidak valid." };
  }
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || parsed.app !== "dzili" || typeof parsed.data !== "object" || parsed.data === null) {
      return { ok: false, reason: "Struktur backup Dzili tidak dikenali." };
    }
    let importedCount = 0;
    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(parsed.data, key)) {
        const val = parsed.data[key];
        const validator = validatorsByKey?.[key];
        if (val !== null && (!validator || validator(val))) {
          saveStore(key, val);
          importedCount++;
        }
      }
    }
    return { ok: true, importedCount };
  } catch {
    return { ok: false, reason: "File JSON rusak atau tidak bisa dibaca." };
  }
}
