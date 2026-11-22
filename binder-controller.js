import {
  sanitizeString,
  normalizeCategory,
  getAllBinderSheets,
  upsertBinderSheet,
  deleteBinderSheet,
  filterAndSearchSheets,
  exportBinderBackup,
  restoreBinderBackup
} from "./binder-store.js";
import { compressImageFile, runSafeOCR } from "./binder-ocr.js";

export class BinderController {
  constructor(dom) {
    this.dom = dom;
    this.sheets = [];
    this.activeCategory = "Semua";
    this.searchQuery = "";
    this.editingId = null;
    this.currentImageDataUrl = "";
    this.cameraStream = null;
  }

  async init() {
    this.bindEvents();
    await this.refresh();
  }

  setStatus(msg) {
    if (this.dom.statusEl) {
      this.dom.statusEl.textContent = sanitizeString(msg, 240);
    }
  }

  async refresh() {
    this.sheets = await getAllBinderSheets();
    this.renderList();
  }

  openModal(sheet = null) {
    this.editingId = sheet ? sheet.id : null;
    this.currentImageDataUrl = sheet?.imageDataUrl || "";
    if (this.dom.modalTitleEl) {
      this.dom.modalTitleEl.textContent = sheet ? "Edit Lembar Binder" : "Lembar Binder Baru";
    }
    if (this.dom.categorySelect) {
      this.dom.categorySelect.value = normalizeCategory(sheet?.category || "Kalkulus");
    }
    if (this.dom.titleInput) this.dom.titleInput.value = sheet?.title || "";
    if (this.dom.contentTextarea) this.dom.contentTextarea.value = sheet?.content || "";
    if (this.dom.ocrOutputTextarea) this.dom.ocrOutputTextarea.value = sheet?.ocrText || "";
    if (this.dom.previewImg) {
      if (this.currentImageDataUrl) {
        this.dom.previewImg.src = this.currentImageDataUrl;
        this.dom.previewImg.hidden = false;
      } else {
        this.dom.previewImg.removeAttribute("src");
        this.dom.previewImg.hidden = true;
      }
    }
    if (this.dom.modalEl) this.dom.modalEl.hidden = false;
  }

  closeModal() {
    this.stopCamera();
    this.editingId = null;
    this.currentImageDataUrl = "";
    if (this.dom.galleryInput) this.dom.galleryInput.value = "";
    if (this.dom.modalEl) this.dom.modalEl.hidden = true;
  }

  async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia || !this.dom.cameraVideo) {
      this.setStatus("Kamera tidak didukung. Gunakan tombol Galeri.");
      return;
    }
    this.stopCamera();
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      this.dom.cameraVideo.srcObject = this.cameraStream;
      this.dom.cameraVideo.hidden = false;
      if (this.dom.captureBtn) this.dom.captureBtn.hidden = false;
      this.setStatus("Kamera aktif.");
    } catch {
      this.setStatus("Izin kamera ditolak atau tidak tersedia.");
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((t) => t.stop());
      this.cameraStream = null;
    }
    if (this.dom.cameraVideo) {
      this.dom.cameraVideo.srcObject = null;
      this.dom.cameraVideo.hidden = true;
    }
    if (this.dom.captureBtn) this.dom.captureBtn.hidden = true;
  }

  async capturePhotoAndOCR() {
    const video = this.dom.cameraVideo;
    if (!video || !video.videoWidth || !video.videoHeight) {
      this.setStatus("Frame kamera belum siap.");
      return;
    }
    const canvas = document.createElement("canvas");
    const scale = video.videoWidth > 1280 ? 1280 / video.videoWidth : 1;
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    this.stopCamera();
    await this.processImageDataUrl(dataUrl);
  }

  async handleGalleryFile(file) {
    if (!file) return;
    try {
      this.setStatus("Mengompres gambar...");
      const dataUrl = await compressImageFile(file);
      await this.processImageDataUrl(dataUrl);
    } catch (err) {
      this.setStatus(err?.message || "Gagal memproses gambar.");
    }
  }

  async processImageDataUrl(dataUrl) {
    this.currentImageDataUrl = dataUrl;
    if (this.dom.previewImg) {
      this.dom.previewImg.src = dataUrl;
      this.dom.previewImg.hidden = false;
    }
    this.setStatus("Menjalankan OCR...");
    const ocr = await runSafeOCR(dataUrl);
    if (ocr.text && this.dom.ocrOutputTextarea) {
      this.dom.ocrOutputTextarea.value = ocr.text;
    }
    this.setStatus(ocr.message);
  }

  insertAtCursor(textarea, snippet) {
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const nextVal = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
    if (nextVal.length <= 15000) {
      textarea.value = nextVal;
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    }
    textarea.focus();
  }

  async saveCurrentSheet(e) {
    e?.preventDefault();
    const title = sanitizeString(this.dom.titleInput?.value || "", 160);
    if (!title) {
      this.setStatus("Judul materi / bab wajib diisi.");
      return;
    }
    await upsertBinderSheet({
      id: this.editingId || undefined,
      category: normalizeCategory(this.dom.categorySelect?.value || "Kalkulus"),
      title,
      content: sanitizeString(this.dom.contentTextarea?.value || "", 15000),
      ocrText: sanitizeString(this.dom.ocrOutputTextarea?.value || "", 10000),
      imageDataUrl: this.currentImageDataUrl
    });
    this.closeModal();
    await this.refresh();
    this.setStatus("Lembar binder tersimpan.");
  }

  async removeSheet(id) {
    if (!window.confirm("Hapus lembar binder ini secara permanen?")) return;
    await deleteBinderSheet(id);
    await this.refresh();
    this.setStatus("Lembar binder dihapus.");
  }

  async exportBackup() {
    const jsonStr = await exportBinderBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dzili-binder-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.setStatus("File backup Binder berhasil diunduh.");
  }

  async importBackupFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.setStatus("Ukuran file backup melebihi batas 10 MB.");
      return;
    }
    try {
      const text = await file.text();
      const merge = window.confirm(
        "OK = Gabungkan dengan data yang ada.\nCancel = Ganti seluruh isi Binder dengan file backup."
      );
      const count = await restoreBinderBackup(text, { merge });
      await this.refresh();
      this.setStatus(`Pemulihan selesai: ${count} lembar binder diproses.`);
    } catch (err) {
      this.setStatus(err?.message || "Gagal memulihkan file backup.");
    } finally {
      if (this.dom.restoreInput) this.dom.restoreInput.value = "";
    }
  }

  renderList() {
    const listEl = this.dom.listEl;
    if (!listEl) return;
    listEl.textContent = "";

    const filtered = filterAndSearchSheets(this.sheets, {
      category: this.activeCategory,
      query: this.searchQuery
    });

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.textContent =
        this.sheets.length === 0
          ? "Binder Masih Kosong. Tekan + Lembar Baru untuk mencatat rumus atau scan papan tulis."
          : "Tidak ada lembar binder yang cocok dengan filter/pencarian.";
      listEl.appendChild(empty);
      return;
    }

    for (const item of filtered) {
      const card = document.createElement("article");
      card.className = "binder-item";

      const meta = document.createElement("span");
      meta.textContent = `${item.category} • ${item.updatedAt.slice(0, 10)}`;

      const heading = document.createElement("h3");
      heading.textContent = item.title;

      const bodyText = item.content || item.ocrText || "";
      const snippet = document.createElement("p");
      snippet.textContent = bodyText.slice(0, 220) + (bodyText.length > 220 ? "..." : "");

      const actions = document.createElement("div");

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => this.openModal(item));

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", () => this.removeSheet(item.id));

      actions.append(editBtn, delBtn);
      card.append(meta, heading, snippet, actions);
      listEl.appendChild(card);
    }
  }

  bindEvents() {
    this.dom.newBtn?.addEventListener("click", () => this.openModal(null));
    this.dom.cancelBtn?.addEventListener("click", () => this.closeModal());
    this.dom.formEl?.addEventListener("submit", (e) => this.saveCurrentSheet(e));

    this.dom.searchInput?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value || "";
      this.renderList();
    });

    this.dom.categoryButtons?.forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = btn.dataset.category || "Semua";
        this.activeCategory = chosen === "Semua" ? "Semua" : normalizeCategory(chosen);
        this.dom.categoryButtons.forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        this.renderList();
      });
    });

    this.dom.cameraBtn?.addEventListener("click", () => this.startCamera());
    this.dom.captureBtn?.addEventListener("click", () => this.capturePhotoAndOCR());
    this.dom.galleryBtn?.addEventListener("click", () => this.dom.galleryInput?.click());
    this.dom.galleryInput?.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (f) this.handleGalleryFile(f);
    });

    this.dom.insertButtons?.forEach((btn) => {
      btn.addEventListener("click", () => {
        const snippet = btn.dataset.snippet || "";
        if (snippet) this.insertAtCursor(this.dom.contentTextarea, snippet);
      });
    });

    this.dom.exportBtn?.addEventListener("click", () => this.exportBackup());
    this.dom.restoreBtn?.addEventListener("click", () => this.dom.restoreInput?.click());
    this.dom.restoreInput?.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (f) this.importBackupFile(f);
    });
  }
}
