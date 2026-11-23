import { sanitizeString } from "./binder-store.js";

let tesseractLoadingPromise = null;

function ensureTesseractLoaded() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Tesseract && typeof window.Tesseract.recognize === "function") {
    return Promise.resolve(window.Tesseract);
  }
  if (tesseractLoadingPromise) return tesseractLoadingPromise;

  tesseractLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-dzili-ocr="tesseract"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Tesseract || null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.dataset.dziliOcr = "tesseract";
    script.onload = () => resolve(window.Tesseract || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return tesseractLoadingPromise;
}

export function compressImageFile(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      reject(new Error("Hanya mendukung format PNG, JPG, atau WEBP."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Ukuran gambar maksimal 8 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gambar rusak atau tidak bisa diproses."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export async function runSafeOCR(imageSource, lang = "ind+eng") {
  const TesseractGlobal = await ensureTesseractLoaded();
  if (!TesseractGlobal || typeof TesseractGlobal.recognize !== "function") {
    return {
      ok: false,
      text: "",
      message: "Mesin OCR offline/gagal dimuat. Foto tetap tersimpan & teks bisa diisi manual."
    };
  }
  try {
    const result = await TesseractGlobal.recognize(imageSource, lang);
    const cleanText = sanitizeString(result?.data?.text || "", 10000);
    return {
      ok: true,
      text: cleanText,
      message: cleanText ? "Scan OCR selesai. Silakan cek/edit teks." : "Tidak ada teks terbaca jelas."
    };
  } catch {
    return {
      ok: false,
      text: "",
      message: "OCR gagal memproses gambar ini. Silakan isi teks secara manual."
    };
  }
}
