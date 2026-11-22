const PREF_KEY = "dzili_prefs_v1";
const FOCUS_KEY = "dzili_focus_v1";

function el(tag, className = "", text = "") {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

function cleanName(v) {
  if (typeof v !== "string") return "Dzili";
  const s = v.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 40);
  return s || "Dzili";
}

export function loadDziliPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { studentName: "Dzili", dailyTargetMin: 75 };
    const p = JSON.parse(raw);
    return {
      studentName: cleanName(p?.studentName),
      dailyTargetMin: Number.isFinite(Number(p?.dailyTargetMin))
        ? Math.max(15, Math.min(600, Math.round(Number(p.dailyTargetMin))))
        : 75
    };
  } catch {
    return { studentName: "Dzili", dailyTargetMin: 75 };
  }
}

export function saveDziliPrefs(prefs) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify({
      studentName: cleanName(prefs?.studentName),
      dailyTargetMin: Math.max(15, Math.min(600, Math.round(Number(prefs?.dailyTargetMin || 75))))
    }));
    return true;
  } catch {
    return false;
  }
}

export function createSettingsModal(onSaved) {
  const backdrop = el("div", "dzili-set-backdrop");
  backdrop.hidden = true;

  const box = el("div", "dzili-set-box");
  const head = el("div", "dzili-calc-head");
  head.appendChild(el("h3", "", "Pengaturan Dzili"));
  const closeBtn = el("button", "dzili-calc-close", "✕");
  closeBtn.type = "button";
  head.appendChild(closeBtn);

  const form = el("form", "dzili-set-form");

  const nameLabel = el("label", "dzili-set-label", "Nama Panggilan");
  const nameInput = el("input", "dzili-input");
  nameInput.maxLength = 40;
  nameInput.required = true;

  const targetLabel = el("label", "dzili-set-label", "Target Fokus Harian (menit)");
  const targetInput = el("input", "dzili-input");
  targetInput.type = "number";
  targetInput.min = "15";
  targetInput.max = "600";
  targetInput.step = "5";

  const statusText = el("p", "dzili-set-status");

  const btnRow = el("div", "dzili-set-actions");
  const resetFocusBtn = el("button", "dzili-btn-ghost", "Reset Statistik Fokus");
  resetFocusBtn.type = "button";
  const saveBtn = el("button", "dzili-btn-primary", "Simpan");
  saveBtn.type = "submit";
  btnRow.append(resetFocusBtn, saveBtn);

  form.append(nameLabel, nameInput, targetLabel, targetInput, statusText, btnRow);
  box.append(head, form);
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  function close() {
    backdrop.hidden = true;
    statusText.textContent = "";
  }

  function open() {
    const cur = loadDziliPrefs();
    nameInput.value = cur.studentName;
    targetInput.value = String(cur.dailyTargetMin);
    statusText.textContent = "";
    backdrop.hidden = false;
    nameInput.focus();
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  resetFocusBtn.addEventListener("click", () => {
    if (!window.confirm("Reset riwayat sesi, streak, dan grafik waktu fokus?")) return;
    try {
      localStorage.removeItem(FOCUS_KEY);
      statusText.textContent = "Statistik fokus direset.";
      if (typeof onSaved === "function") onSaved(loadDziliPrefs());
    } catch {
      statusText.textContent = "Gagal mereset statistik fokus.";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nextPrefs = {
      studentName: cleanName(nameInput.value),
      dailyTargetMin: Math.max(15, Math.min(600, Math.round(Number(targetInput.value || 75))))
    };
    saveDziliPrefs(nextPrefs);
    try {
      const rawFocus = localStorage.getItem(FOCUS_KEY);
      if (rawFocus) {
        const pf = JSON.parse(rawFocus);
        if (pf && typeof pf === "object") {
          pf.dailyTargetMin = nextPrefs.dailyTargetMin;
          localStorage.setItem(FOCUS_KEY, JSON.stringify(pf));
        }
      }
    } catch {}
    if (typeof onSaved === "function") onSaved(nextPrefs);
    close();
  });

  return { open, close };
}
