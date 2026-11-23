import { runSafeOCR } from "./binder-ocr.js?v=37";
const DB_NAME = "dzili_binder_v2";
const DB_VERSION = 1;
const STORE = "notes";

export const FOLDERS = ["Kalkulus", "Aljabar", "Statistika", "Geometri", "Analisis", "Umum"];
const SYMBOLS = ["∫", "∬", "∑", "∏", "∂", "∇", "Δ", "∞", "→", "lim", "dx", "dy", "≈", "≠"];

function cleanText(val, max = 12000) {
  if (typeof val !== "string") return "";
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

function normFolder(f) {
  const s = cleanText(f, 40);
  return FOLDERS.includes(s) ? s : "Umum";
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("DB error"));
  });
}

async function loadNotes() {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const list = (req.result || [])
          .filter((x) => x && typeof x.id === "string" && typeof x.title === "string")
          .map((x) => ({
            id: cleanText(x.id, 50),
            folder: normFolder(x.folder),
            title: cleanText(x.title, 150) || "Catatan",
            body: cleanText(x.body, 15000),
            ocr: cleanText(x.ocr, 10000),
            favorite: Boolean(x.favorite),
            hasImage: Boolean(x.hasImage),
            updatedAt: cleanText(x.updatedAt, 30) || new Date().toISOString().slice(0, 10)
          }))
          .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function putNote(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function removeNote(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function exportNoteToPDF(note) {
  const win = window.open("", "_blank", "width=780,height=900");
  if (!win) return;
  const doc = win.document;
  doc.title = `${note.title} - Dzili Binder`;

  const style = doc.createElement("style");
  style.textContent =
    "body{font-family:system-ui,sans-serif;padding:28px;color:#2b1420;line-height:1.5}" +
    ".meta{color:#ec3a68;font-weight:700;font-size:13px;margin-bottom:6px}" +
    "h1{margin:0 0 14px;font-size:22px}" +
    "pre{white-space:pre-wrap;background:#fff5f8;border:1px solid #f5c7d6;padding:14px;border-radius:12px;font-family:inherit}" +
    ".ocr-box{margin-top:16px}";
  doc.head.appendChild(style);

  const meta = doc.createElement("div");
  meta.className = "meta";
  meta.textContent = `Folder: ${note.folder} • Diperbarui: ${note.updatedAt}`;

  const h1 = doc.createElement("h1");
  h1.textContent = note.title;

  const bodyPre = doc.createElement("pre");
  bodyPre.textContent = note.body || "(Tidak ada isi catatan)";

  doc.body.append(meta, h1, bodyPre);

  if (note.ocr) {
    const ocrWrap = doc.createElement("div");
    ocrWrap.className = "ocr-box";
    const ocrLabel = doc.createElement("div");
    ocrLabel.className = "meta";
    ocrLabel.textContent = "Hasil Scan OCR";
    const ocrPre = doc.createElement("pre");
    ocrPre.textContent = note.ocr;
    ocrWrap.append(ocrLabel, ocrPre);
    doc.body.appendChild(ocrWrap);
  }

  win.focus();
  win.print();
}

export function mountBinderLibrary(hostEl) {
  if (!hostEl) return null;
  let notes = [];
  let activeFolder = "Semua";
  let onlyFav = false;
  let searchQuery = "";
  let editingId = null;
  let pendingImageFlag = false;

  hostEl.textContent = "";
  hostEl.className = "dzili-bdr-wrap";

  const topBar = el("div", "dzili-bdr-top");
  const searchInput = el("input", "dzili-input dzili-bdr-search");
  searchInput.type = "search";
  searchInput.placeholder = "Cari judul, rumus, atau hasil OCR...";

  const favToggle = el("button", "dzili-chip-btn", "★ Favorit");
  favToggle.type = "button";
  favToggle.addEventListener("click", () => {
    onlyFav = !onlyFav;
    favToggle.classList.toggle("is-active", onlyFav);
    render();
  });

  const newBtn = el("button", "dzili-btn-primary", "+ Lembar Baru");
  newBtn.type = "button";
  topBar.append(searchInput, favToggle, newBtn);

  const folderShelf = el("div", "dzili-folder-shelf");

  const editor = el("form", "dzili-bdr-form");
  editor.hidden = true;

  const folderSelect = el("select", "dzili-input");
  FOLDERS.forEach((f) => {
    const opt = el("option", "", `Folder: ${f}`);
    opt.value = f;
    folderSelect.appendChild(opt);
  });

  const titleInput = el("input", "dzili-input");
  titleInput.placeholder = "Judul materi / bab (mis. Integral Lipat Dua)";
  titleInput.required = true;

  const toolRow = el("div", "dzili-bdr-tools");

  const cameraInput = el("input", "dzili-file-hidden");
  cameraInput.type = "file";
  cameraInput.accept = "image/*";
  cameraInput.setAttribute("capture", "environment");

  const galleryInput = el("input", "dzili-file-hidden");
  galleryInput.type = "file";
  galleryInput.accept = "image/png,image/jpeg,image/webp";

  const camBtn = el("button", "dzili-btn-ghost", "Kamera + OCR");
  camBtn.type = "button";
  camBtn.addEventListener("click", () => cameraInput.click());

  const galleryBtn = el("button", "dzili-btn-ghost", "Galeri + OCR");
  galleryBtn.type = "button";
  galleryBtn.addEventListener("click", () => galleryInput.click());

  const statusNote = el("span", "dzili-bdr-status");
  toolRow.append(camBtn, galleryBtn, cameraInput, galleryInput, statusNote);

  const bodyArea = el("textarea", "dzili-textarea");
  bodyArea.rows = 5;
  bodyArea.placeholder = "Tulis catatan, teorema, atau rumus...";

  const ocrArea = el("textarea", "dzili-textarea");
  ocrArea.rows = 2;
  ocrArea.placeholder = "Hasil scan OCR (bisa diedit atau dilengkapi manual)...";

  const snippetBar = el("div", "dzili-bdr-snippets");

  function insertSnippet(snippet) {
    const start = bodyArea.selectionStart ?? bodyArea.value.length;
    const end = bodyArea.selectionEnd ?? bodyArea.value.length;
    bodyArea.value = bodyArea.value.slice(0, start) + snippet + bodyArea.value.slice(end);
    bodyArea.focus();
  }

  [
    ["+ Teorema", "\n[Teorema] "],
    ["+ Rumus", "\n[Rumus] "],
    ["+ Definisi", "\n[Definisi] "],
    ...SYMBOLS.map((s) => [s, s])
  ].forEach(([label, snip]) => {
    const b = el("button", "dzili-sym-btn", label);
    b.type = "button";
    b.addEventListener("click", () => insertSnippet(snip));
    snippetBar.appendChild(b);
  });

  async function handlePickedImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type) || file.size > 8 * 1024 * 1024) {
      statusNote.textContent = "Pilih gambar PNG/JPG/WEBP maks 8 MB.";
      e.target.value = "";
      return;
    }
    pendingImageFlag = true;
    statusNote.textContent = "Menyiapkan & memindai OCR...";
    const res = await runSafeOCR(file, "ind+eng");
    if (res && res.text) {
      ocrArea.value = res.text;
    }
    statusNote.textContent = res?.message || "Gambar siap disimpan.";
    e.target.value = "";
  }

  cameraInput.addEventListener("change", handlePickedImage);
  galleryInput.addEventListener("change", handlePickedImage);

  const saveBtn = el("button", "dzili-btn-primary", "Simpan ke Binder");
  saveBtn.type = "submit";
  const cancelBtn = el("button", "dzili-btn-ghost", "Batal");
  cancelBtn.type = "button";
  editor.append(folderSelect, titleInput, toolRow, snippetBar, bodyArea, ocrArea, saveBtn, cancelBtn);

  const listEl = el("div", "dzili-bdr-list");

  function openEditor(item = null) {
    editingId = item ? item.id : null;
    pendingImageFlag = Boolean(item?.hasImage);
    folderSelect.value = item?.folder || (activeFolder !== "Semua" ? activeFolder : "Kalkulus");
    titleInput.value = item?.title || "";
    bodyArea.value = item?.body || "";
    ocrArea.value = item?.ocr || "";
    statusNote.textContent = "";
    editor.hidden = false;
    titleInput.focus();
  }

  newBtn.addEventListener("click", () => openEditor(null));
  cancelBtn.addEventListener("click", () => {
    editingId = null;
    editor.hidden = true;
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value || "";
    render();
  });

  editor.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = cleanText(titleInput.value, 150) || "Catatan";
    const body = cleanText(bodyArea.value, 15000);
    const ocr = cleanText(ocrArea.value, 10000);
    const folder = normFolder(folderSelect.value);
    const updatedAt = new Date().toISOString().slice(0, 10);
    const existing = editingId ? notes.find((n) => n.id === editingId) : null;

    const record = {
      id: editingId || `bdr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      folder,
      title,
      body,
      ocr,
      favorite: existing ? Boolean(existing.favorite) : false,
      hasImage: Boolean(pendingImageFlag || ocr),
      updatedAt
    };

    try {
      await putNote(record);
      notes = await loadNotes();
      editingId = null;
      pendingImageFlag = false;
      editor.hidden = true;
      statusNote.textContent = "Tersimpan ke Binder.";
      render();
    } catch {
      statusNote.textContent = "Gagal menyimpan catatan ke penyimpanan lokal.";
    }
  });

  function renderFolders() {
    folderShelf.textContent = "";
    ["Semua", ...FOLDERS].forEach((f) => {
      const btn = el("button", "dzili-chip-btn", f);
      btn.type = "button";
      btn.classList.toggle("is-active", activeFolder === f);
      btn.addEventListener("click", () => {
        activeFolder = f;
        render();
      });
      folderShelf.appendChild(btn);
    });
  }

  function render() {
    renderFolders();
    const q = searchQuery.trim().toLowerCase();
    const filtered = notes.filter((n) => {
      if (activeFolder !== "Semua" && n.folder !== activeFolder) return false;
      if (onlyFav && !n.favorite) return false;
      if (!q) return true;
      return `${n.title} ${n.folder} ${n.body} ${n.ocr}`.toLowerCase().includes(q);
    });

    listEl.textContent = "";
    if (!filtered.length) {
      const empty = el("div", "dzili-empty-card");
      empty.append(
        el("strong", "", "Binder Masih Kosong"),
        el("p", "", "Tekan + Lembar Baru untuk menyimpan rumus, catatan kuliah, atau hasil OCR.")
      );
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach((item) => {
      const card = el("div", "dzili-bdr-card");
      const head = el("div", "dzili-bdr-card-head");
      const badge = el("span", "dzili-bdr-folder", item.folder);
      const favBtn = el("button", "dzili-fav-btn", item.favorite ? "★" : "☆");
      favBtn.type = "button";
      favBtn.addEventListener("click", async () => {
        item.favorite = !item.favorite;
        await putNote(item);
        notes = await loadNotes();
        render();
      });
      head.append(badge, favBtn);

      const title = el("h4", "", item.title);
      const previewSource = item.body || item.ocr || (item.hasImage ? "Lampiran foto catatan" : "");
      const preview = el("pre", "dzili-bdr-preview", previewSource.slice(0, 240));

      const actions = el("div", "dzili-tl-actions");
      const editBtn = el("button", "dzili-btn-mini", "Edit");
      editBtn.type = "button";
      editBtn.addEventListener("click", () => openEditor(item));

      const pdfBtn = el("button", "dzili-btn-mini", "PDF");
      pdfBtn.type = "button";
      pdfBtn.addEventListener("click", () => exportNoteToPDF(item));

      const delBtn = el("button", "dzili-btn-mini", "Hapus");
      delBtn.type = "button";
      delBtn.addEventListener("click", async () => {
        if (!window.confirm("Hapus lembar binder ini?")) return;
        await removeNote(item.id);
        notes = await loadNotes();
        render();
      });

      actions.append(editBtn, pdfBtn, delBtn);
      card.append(head, title, preview, actions);
      listEl.appendChild(card);
    });
  }

  hostEl.append(topBar, folderShelf, editor, listEl);
  loadNotes().then((loaded) => {
    notes = loaded;
    render();
  });
  return { refresh: async () => { notes = await loadNotes(); render(); } };
}
