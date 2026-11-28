import { runSafeOCR } from "./binder-ocr.js?v=45";
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

function compressImageToDataUrl(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format gambar tidak dapat dimuat."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas tidak tersedia."));
        ctx.drawImage(img, 0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export function downloadNoteImage(note) {
  if (!note || !note.imageData) return false;
  const safeName = (note.title || "foto-kamera-binder")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "foto-kamera-binder";
  const a = document.createElement("a");
  a.href = note.imageData;
  a.download = `${safeName}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
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
  let pendingImageData = "";
  let imageMode = "ocr"; // "photo" = potret saja, "ocr" = potret/galeri + scan OCR

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

  const photoOnlyInput = el("input", "dzili-file-hidden");
  photoOnlyInput.type = "file";
  photoOnlyInput.accept = "image/*";
  photoOnlyInput.setAttribute("capture", "environment");

  const ocrCameraInput = el("input", "dzili-file-hidden");
  ocrCameraInput.type = "file";
  ocrCameraInput.accept = "image/*";
  ocrCameraInput.setAttribute("capture", "environment");

  const ocrGalleryInput = el("input", "dzili-file-hidden");
  ocrGalleryInput.type = "file";
  ocrGalleryInput.accept = "image/png,image/jpeg,image/webp";

  const cameraBtn = el("button", "dzili-btn-ghost", "Kamera");
  cameraBtn.type = "button";

  const ocrBtn = el("button", "dzili-btn-ghost", "OCR");
  ocrBtn.type = "button";

  const ocrSourceBox = el("div", "dzili-bdr-tools");
  ocrSourceBox.hidden = true;

  const ocrFromCamBtn = el("button", "dzili-chip-btn", "Kamera OCR");
  ocrFromCamBtn.type = "button";

  const ocrFromGalleryBtn = el("button", "dzili-chip-btn", "Galeri OCR");
  ocrFromGalleryBtn.type = "button";

  ocrSourceBox.append(ocrFromCamBtn, ocrFromGalleryBtn);

  const statusNote = el("span", "dzili-bdr-status");
  toolRow.append(
    cameraBtn,
    ocrBtn,
    photoOnlyInput,
    ocrCameraInput,
    ocrGalleryInput,
    statusNote
  );

  cameraBtn.addEventListener("click", () => {
    ocrSourceBox.hidden = true;
    photoOnlyInput.click();
  });

  ocrBtn.addEventListener("click", () => {
    ocrSourceBox.hidden = !ocrSourceBox.hidden;
    if (!ocrSourceBox.hidden) {
      statusNote.textContent = "Pilih sumber OCR: Kamera OCR atau Galeri OCR.";
    }
  });

  ocrFromCamBtn.addEventListener("click", () => {
    ocrSourceBox.hidden = true;
    ocrCameraInput.click();
  });

  ocrFromGalleryBtn.addEventListener("click", () => {
    ocrSourceBox.hidden = true;
    ocrGalleryInput.click();
  });

  photoOnlyInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp|heic|heif)$/i.test(file.type) && !file.type.startsWith("image/")) {
      statusNote.textContent = "File harus berupa gambar.";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      statusNote.textContent = "Ukuran foto maksimal 10 MB.";
      return;
    }

    statusNote.textContent = "Menyiapkan foto catatan...";
    try {
      pendingImageData = await compressImageToDataUrl(file);
      pendingImageFlag = true;
    } catch {
      statusNote.textContent = "Gagal memproses foto.";
      return;
    }

    if (!titleInput.value.trim()) {
      const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      titleInput.value = `Potret Catatan (${nowStr})`;
    }

    const record = {
      id: editingId || `bdr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      folder: normFolder(folderSelect.value),
      title: cleanText(titleInput.value, 150) || "Potret Catatan",
      body: cleanText(bodyArea.value, 15000),
      ocr: cleanText(ocrArea.value, 10000),
      favorite: editingId ? Boolean(notes.find((n) => n.id === editingId)?.favorite) : false,
      hasImage: true,
      imageData: pendingImageData,
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    try {
      await putNote(record);
      notes = await loadNotes();
      editingId = null;
      pendingImageFlag = false;
      pendingImageData = "";
      pendingImageData = "";
      editor.hidden = true;
      ocrSourceBox.hidden = true;
      statusNote.textContent = "Foto .jpg tersimpan di Binder. Tekan Unduh di kartu untuk menyimpan ke perangkat.";
      render();
    } catch {
      statusNote.textContent = "Foto siap, tekan Simpan ke Binder untuk menyimpan.";
    }
  });

  async function handleOcrFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type) || file.size > 8 * 1024 * 1024) {
      statusNote.textContent = "Pilih gambar PNG/JPG/WEBP maks 8 MB untuk OCR.";
      return;
    }
    pendingImageFlag = true;
    try {
      pendingImageData = await compressImageToDataUrl(file);
    } catch {
      pendingImageData = "";
    }
    statusNote.textContent = "Memindai teks OCR...";
    const res = await runSafeOCR(file, "ind+eng");
    if (res && res.text) {
      ocrArea.value = res.text;
    }
    statusNote.textContent = res?.message || "Proses OCR selesai.";
  }

  ocrCameraInput.addEventListener("change", handleOcrFile);
  ocrGalleryInput.addEventListener("change", handleOcrFile);

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

  const saveBtn = el("button", "dzili-btn-primary", "Simpan ke Binder");
  saveBtn.type = "submit";
  const cancelBtn = el("button", "dzili-btn-ghost", "Batal");
  cancelBtn.type = "button";
  editor.append(folderSelect, titleInput, toolRow, ocrSourceBox, snippetBar, bodyArea, ocrArea, saveBtn, cancelBtn);

  const listEl = el("div", "dzili-bdr-list");

  function openEditor(item = null) {
    editingId = item ? item.id : null;
    pendingImageFlag = Boolean(item?.hasImage || item?.imageData);
    pendingImageData = item?.imageData || "";
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
      hasImage: Boolean(pendingImageFlag || pendingImageData || ocr),
      imageData: pendingImageData || existing?.imageData || "",
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
      const previewSource = item.body || item.ocr || (item.imageData || item.hasImage ? "Lampiran foto catatan" : "");
      const preview = el("pre", "dzili-bdr-preview", previewSource.slice(0, 240));

      let photoThumb = null;
      if (item.imageData) {
        photoThumb = document.createElement("img");
        photoThumb.src = item.imageData;
        photoThumb.alt = item.title;
        photoThumb.className = "dzili-bdr-photo";
        photoThumb.style.width = "100%";
        photoThumb.style.maxHeight = "220px";
        photoThumb.style.objectFit = "cover";
        photoThumb.style.borderRadius = "12px";
        photoThumb.style.margin = "8px 0";
      }

      const actions = el("div", "dzili-tl-actions");
      const editBtn = el("button", "dzili-btn-mini", "Edit");
      editBtn.type = "button";
      editBtn.addEventListener("click", () => openEditor(item));

      const jpgBtn = el("button", "dzili-btn-mini", "JPG");
      jpgBtn.type = "button";
      jpgBtn.addEventListener("click", async () => {
        if (item.imageData) {
          downloadNoteImage(item);
        } else if (typeof exportNoteToJPG === "function") {
          await exportNoteToJPG(item);
        }
      });

      const dlBtn = el("button", "dzili-btn-mini", "Unduh");
      dlBtn.type = "button";
      dlBtn.addEventListener("click", async () => {
        if (item.imageData) {
          downloadNoteImage(item);
        } else if (typeof downloadNoteAsset === "function") {
          await downloadNoteAsset(item);
        } else if (typeof exportNoteToJPG === "function") {
          await exportNoteToJPG(item);
        }
      });

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

      actions.append(editBtn, jpgBtn, dlBtn, pdfBtn, delBtn);
      if (photoThumb) {
        card.append(head, title, photoThumb, preview, actions);
      } else {
        card.append(head, title, preview, actions);
      }
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
