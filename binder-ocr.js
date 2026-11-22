import { sanitizeString } from "./binder-store.js";

export function compressImageFile(file, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(png|jpeg|webp)$/i.test(file.type)) {
      reject(new Error("Hanya mendukung format PNG, JPG, atau WEBP."));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error("Ukuran gambar maksimal 6 MB."));
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
  const TesseractGlobal = typeof window !== "undefined" ? window.Tesseract : null;
  if (!TesseractGlobal || typeof TesseractGlobal.recognize !== "function") {
    return {
      ok: false,
      text: "",
      message: "Mesin OCR belum termuat. Catatan/foto tetap bisa disimpan manual."
    };
  }
  try {
    const result = await TesseractGlobal.recognize(imageSource, lang);
    const cleanText = sanitizeString(result?.data?.text || "", 10000);
    return {
      ok: true,
      text: cleanText,
      message: cleanText ? "Scan OCR selesai." : "Tidak ada teks terbaca jelas."
    };
  } catch {
    return { ok: false, text: "", message: "Proses OCR gagal dijalankan pada gambar ini." };
  }
}
