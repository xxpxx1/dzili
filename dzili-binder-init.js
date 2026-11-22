import { ALLOWED_CATEGORIES } from "./binder-store.js";
import { BinderController } from "./binder-controller.js";

function makeEl(tag, attrs = {}, text = "") {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "hidden") el.hidden = Boolean(v);
    else if (k === "className") el.className = v;
    else el.setAttribute(k, v);
  }
  if (text) el.textContent = text;
  return el;
}

function buildBinderShell(hostEl) {
  hostEl.textContent = "";

  const toolbar = makeEl("div", { className: "dzili-binder-toolbar" });
  const newBtn = makeEl("button", { type: "button", id: "dzili-new-binder" }, "+ Lembar Baru");
  const searchInput = makeEl("input", {
    type: "search",
    id: "dzili-binder-search",
    placeholder: "Cari judul, rumus, atau hasil OCR...",
    maxlength: "120"
  });

  const exportBtn = makeEl("button", { type: "button", id: "dzili-export-binder" }, "Backup JSON");
  const restoreBtn = makeEl("button", { type: "button", id: "dzili-restore-binder" }, "Pulihkan");
  const restoreInput = makeEl("input", {
    type: "file",
    id: "dzili-restore-file",
    accept: "application/json,.json",
    hidden: true
  });

  toolbar.append(newBtn, searchInput, exportBtn, restoreBtn, restoreInput);

  const filterBar = makeEl("div", { className: "dzili-binder-filters" });
  const categoryButtons = [];
  ["Semua", ...ALLOWED_CATEGORIES].forEach((cat, idx) => {
    const btn = makeEl(
      "button",
      { type: "button", "data-category": cat, className: idx === 0 ? "is-active" : "" },
      cat
    );
    filterBar.appendChild(btn);
    categoryButtons.push(btn);
  });

  const statusEl = makeEl("p", { id: "dzili-binder-status", className: "dzili-binder-status" });
  const listEl = makeEl("div", { id: "dzili-binder-list", className: "dzili-binder-list" });
  hostEl.append(toolbar, filterBar, statusEl, listEl);

  return { newBtn, searchInput, categoryButtons, listEl, statusEl, exportBtn, restoreBtn, restoreInput };
}

function buildBinderModal() {
  const modalEl = makeEl("div", { id: "dzili-binder-modal", className: "dzili-modal", hidden: true });
  const box = makeEl("div", { className: "dzili-modal-box" });
  const modalTitleEl = makeEl("h2", { id: "dzili-binder-modal-title" }, "Lembar Binder Baru");
  const formEl = makeEl("form", { id: "dzili-binder-form" });

  const categorySelect = makeEl("select", { id: "dzili-binder-category" });
  ALLOWED_CATEGORIES.forEach((cat) => {
    categorySelect.appendChild(makeEl("option", { value: cat }, cat));
  });

  const titleInput = makeEl("input", {
    type: "text",
    id: "dzili-binder-title",
    placeholder: "Contoh: Integral Lipat Dua",
    maxlength: "160",
    required: "required"
  });

  const cameraBtn = makeEl("button", { type: "button", id: "dzili-binder-camera" }, "Kamera");
  const captureBtn = makeEl("button", { type: "button", id: "dzili-binder-capture", hidden: true }, "Ambil & OCR");
  const galleryBtn = makeEl("button", { type: "button", id: "dzili-binder-gallery" }, "Galeri");
  const galleryInput = makeEl("input", {
    type: "file",
    id: "dzili-binder-gallery-file",
    accept: "image/png,image/jpeg,image/webp",
    hidden: true
  });

  const cameraVideo = makeEl("video", { id: "dzili-binder-video", playsinline: "true", autoplay: "true", hidden: true });
  const previewImg = makeEl("img", { id: "dzili-binder-preview", alt: "Pratinjau catatan", hidden: true });

  const insertButtons = [];
  const quickBar = makeEl("div", { className: "dzili-quick-insert" });
  [
    { label: "+ Teorema", snippet: "\n[Teorema] " },
    { label: "+ Rumus", snippet: "\n[Rumus] " },
    { label: "+ Definisi", snippet: "\n[Definisi] " }
  ].forEach((item) => {
    const b = makeEl("button", { type: "button", "data-snippet": item.snippet }, item.label);
    quickBar.appendChild(b);
    insertButtons.push(b);
  });

  ["∫", "∬", "∑", "∏", "∂", "∇", "Δ", "∞", "→", "lim", "dx", "dy", "≈", "≠"].forEach((sym) => {
    const b = makeEl("button", { type: "button", "data-snippet": sym }, sym);
    quickBar.appendChild(b);
    insertButtons.push(b);
  });

  const contentTextarea = makeEl("textarea", {
    id: "dzili-binder-content",
    rows: "5",
    placeholder: "Tulis catatan atau tekan tombol simbol matematika..."
  });

  const ocrOutputTextarea = makeEl("textarea", {
    id: "dzili-binder-ocr-text",
    rows: "3",
    placeholder: "Hasil scan tulisan (OCR) akan muncul di sini dan bisa diedit..."
  });

  const cancelBtn = makeEl("button", { type: "button", id: "dzili-binder-cancel" }, "Batal");
  const saveBtn = makeEl("button", { type: "submit", id: "dzili-binder-save" }, "Simpan ke Binder");

  formEl.append(
    makeEl("label", {}, "Kategori Mata Kuliah"),
    categorySelect,
    makeEl("label", {}, "Judul Materi / Bab"),
    titleInput,
    makeEl("div", { className: "dzili-media-actions" }, ""),
    cameraBtn,
    captureBtn,
    galleryBtn,
    galleryInput,
    cameraVideo,
    previewImg,
    quickBar,
    makeEl("label", {}, "Isi Catatan Binder"),
    contentTextarea,
    makeEl("label", {}, "Hasil OCR"),
    ocrOutputTextarea,
    cancelBtn,
    saveBtn
  );

  box.append(modalTitleEl, formEl);
  modalEl.appendChild(box);
  document.body.appendChild(modalEl);

  return {
    modalEl, modalTitleEl, formEl, categorySelect, titleInput, contentTextarea,
    ocrOutputTextarea, cameraBtn, captureBtn, cameraVideo, galleryBtn, galleryInput,
    previewImg, insertButtons, cancelBtn
  };
}

export async function mountDziliBinder(targetSelector = "#binder-panel") {
  let hostEl = document.querySelector(targetSelector);
  if (!hostEl) {
    hostEl = makeEl("section", { id: targetSelector.replace(/^#/, "") || "dzili-binder-panel" });
    document.body.appendChild(hostEl);
  }
  const shell = buildBinderShell(hostEl);
  const modal = buildBinderModal();
  const controller = new BinderController({ ...shell, ...modal });
  await controller.init();
  return controller;
}
