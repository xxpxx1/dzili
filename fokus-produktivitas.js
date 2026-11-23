const FOCUS_KEY = "dzili_focus_v1";
const FORTUNES = [
  {
    "tag": "Ramalan Kuliah",
    "text": "Hari ini dosen akan selesai menjelaskan 10 menit lebih awal. Aamiin paling kencang!"
  },
  {
    "tag": "Ramalan Kuliah",
    "text": "Dosen yang biasanya killer hari ini lagi mode baik hati dan nggak jadi ngasih kuis dadakan."
  },
  {
    "tag": "Ramalan Kuliah",
    "text": "Kursi favoritmu di kelas masih kosong dan dingin AC-nya pas banget hari ini."
  },
  {
    "tag": "Ramalan Kuliah",
    "text": "Kelompok presentasimu bakal dapat pertanyaan yang kebetulan banget baru saja kamu baca!"
  },
  {
    "tag": "Ramalan Kuliah",
    "text": "Jam kosong tak terduga akan muncul di saat baterai energimu tinggal 15%."
  },
  {
    "tag": "Ramalan Kuliah",
    "text": "Catatan yang kamu tulis rapi hari ini bakal menyelamatkanmu pas H-1 ujian nanti."
  },
  {
    "tag": "Ramalan Jajan",
    "text": "Seseorang di sekitar sini diam-diam ingin mentraktir kamu kopi atau matcha minggu ini."
  },
  {
    "tag": "Ramalan Jajan",
    "text": "Jajanan yang lagi kamu pengenin sejak kemarin bakal ketemu di jalan pulang nanti."
  },
  {
    "tag": "Ramalan Hari Ini",
    "text": "Antrean makan siangmu hari ini bakal lancar jaya dan porsinya lebih banyak dari biasanya."
  },
  {
    "tag": "Ramalan Hari Ini",
    "text": "Cuaca hari ini bersahabat banget buat pulang kuliah tanpa drama kehujanan."
  },
  {
    "tag": "Hoki Akademik",
    "text": "Materi yang baru saja kamu baca punya peluang 87,4% muncul di kuis atau ujian nanti!"
  },
  {
    "tag": "Hoki Hari Ini",
    "text": "Kamu akan menemukan jawaban soal yang sempat bikin bingung tepat setelah minum sesuatu yang segar."
  },
  {
    "tag": "Hoki Hari Ini",
    "text": "Baterai HP dan baterai semangatmu akan awet sampai kelas terakhir selesai!"
  },
  {
    "tag": "Hoki Hari Ini",
    "text": "Notifikasi yang bikin senyum-senyum sendiri bakal masuk ke HP-mu hari ini."
  },
  {
    "tag": "Humor Math",
    "text": "Kenapa buku matematika selalu kelihatan sedih? Karena punya banyak masalah. Untung kamu jago nyelesainnya!"
  },
  {
    "tag": "Humor Math",
    "text": "Apa bedanya kamu sama integral tentu? Kalau integral tentu ada batasnya, kalau cantiknya kamu tak terhingga."
  },
  {
    "tag": "Humor Math",
    "text": "Sudut apa yang paling hangat? Bukan sudut 90 derajat, tapi sudut bibir kamu pas lagi senyum."
  },
  {
    "tag": "Humor Math",
    "text": "Kenapa garis sejajar nggak pernah ketemu? Soalnya mereka belum install aplikasi Dzili."
  },
  {
    "tag": "Humor Math",
    "text": "Kenapa angka 6 takut sama angka 7? Karena seven eight nine (7 8 9)!"
  },
  {
    "tag": "Humor Math",
    "text": "Apa yang dibilang angka 0 ke angka 8? \"Ikat pinggangnya keren banget, Bro!\""
  },
  {
    "tag": "Humor Math",
    "text": "Kenapa tanaman di jurusan matematika nggak pernah tumbuh normal? Karena akarnya kuadrat semua."
  },
  {
    "tag": "Humor Math",
    "text": "Cintaku ke kamu itu kayak nilai Pi (π): nggak pernah berhenti dan nggak bakal habis dibagi apa pun."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Angka berapa yang paling romantis? Angka 2, soalnya kalau sendiri sepi, kalau berdua jadi asyik."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Kopi apa yang paling pahit? Kopilih dia daripada aku. Bercanda deng, yang manis cuma kamu!"
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Hewan apa yang paling sering telat masuk kelas pagi? Kaki seribu, kelamaan pakai sepatunya."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Kenapa zombie kalau nyerang selalu rame-rame? Kalau sendirian namanya zomblo."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Ikan apa yang paling sering berhenti mendadak? Ikan pause."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Awan apa yang bikin seneng? Awanna be with you terus setiap hari."
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Benda apa yang kalau dipotong malah makin tinggi? Celana panjang!"
  },
  {
    "tag": "Tebak-Tebakan",
    "text": "Sayur apa yang jago nyanyi? Kol-play!"
  },
  {
    "tag": "Cerita Mini",
    "text": "Niat hati buka HP cuma mau cek jam kuliah 5 detik. Eh, tahu-tahu sudah 40 menit nonton video kucing nyanyi."
  },
  {
    "tag": "Cerita Mini",
    "text": "Momen paling menegangkan di kelas: dosen bilang \"Coba yang pojok jawab\", lalu seluruh kelas mendadak pura-pura sibuk nyatet."
  },
  {
    "tag": "Cerita Mini",
    "text": "Definisi percaya diri tingkat dewa: ngerjain soal hitungan 3 halaman penuh tanpa kalkulator, pas dicek ternyata salah tanda minus di baris pertama."
  },
  {
    "tag": "Cerita Mini",
    "text": "Tadi malam sudah pasang 5 alarm buat kelas pagi. Pas pagi bunyi, bukannya bangun malah dimatiin sambil bilang \"5 menit lagi\" dalam mimpi."
  },
  {
    "tag": "Cerita Mini",
    "text": "Di catatan binder tulisannya rapi estetik pakai stabilo pastel. Pas masuk halaman ke-4 dosen ngebut, tulisannya berubah jadi sandi rumput."
  },
  {
    "tag": "Cerita Mini",
    "text": "Status baterai HP 10%: panik cari colokan. Status baterai otak 10%: masih sempat mikir \"habis ini enaknya jajan apa ya?\""
  },
  {
    "tag": "Cerita Mini",
    "text": "Bilangnya ke teman \"Aku belum belajar sama sekali nih\", pas nilai keluar ternyata dapat A. Semoga kejadian ini menular ke kamu!"
  },
  {
    "tag": "Cerita Mini",
    "text": "Hukum kekekalan tugas kuliah: satu tugas selesai dicentang, dua tugas baru langsung muncul di grup kelas."
  },
  {
    "tag": "Cerita Mini",
    "text": "Persiapan belajar: rapikan meja 20 menit, bikin minum 10 menit, pilih lagu 15 menit, belajarnya 5 menit lalu ngantuk."
  },
  {
    "tag": "Cerita Mini",
    "text": "Kalau ketemu soal ujian yang bentuknya aneh banget, tarik napas, baca bismillah, dan ingat: dosennya juga manusia yang suka ngopi."
  },
  {
    "tag": "Cerita Mini",
    "text": "Misteri terbesar mahasiswa: pulpen baru beli kemarin langsung hilang, tapi pulpen nemu di jalan awet sampai lulus."
  },
  {
    "tag": "Cerita Mini",
    "text": "Katanya matematika itu ilmu pasti, tapi kenapa pas ditanya \"Mau makan di mana?\" jawabannya selalu \"Terserah\"?"
  },
  {
    "tag": "Mood Booster",
    "text": "Nggak apa-apa jalan pelan, yang penting nggak mundur. Kamu sudah hebat banget sejauh ini!"
  },
  {
    "tag": "Mood Booster",
    "text": "Kalau hari ini terasa berat, ingat: ada seseorang yang selalu bangga sama setiap usaha kecilmu."
  },
  {
    "tag": "Mood Booster",
    "text": "Jangan lupa minum air putih! Otak yang encer butuh hidrasi, bukan cuma kafein dan harapan."
  },
  {
    "tag": "Mood Booster",
    "text": "Bahu tegang? Tarik napas 4 detik, embuskan pelan. Tugasnya nggak akan kabur kok, santai dulu 2 menit."
  },
  {
    "tag": "Mood Booster",
    "text": "Kamu itu kombinasi langka: pinter ngitung rumus, tapi juga jago bikin hari orang lain jadi lebih cerah."
  },
  {
    "tag": "Mood Booster",
    "text": "Setiap halaman catatan yang kamu tulis hari ini adalah investasi buat versi kamu yang sukses di masa depan."
  },
  {
    "tag": "Pesan Manis",
    "text": "Rumus kebahagiaan hari ini: Istirahat cukup + Minum air putih + Senyum manis kamu."
  },
  {
    "tag": "Pesan Manis",
    "text": "Capek boleh, nyerah jangan. Kalau butuh tempat cerita atau butuh teman jajan, tinggal kabari ya!"
  },
  {
    "tag": "Pesan Manis",
    "text": "Terima kasih sudah bertahan dan berjuang melewati hari ini dengan keren. Selamat istirahat nanti malam!"
  },
  {
    "tag": "Pesan Manis",
    "text": "Dari sekian banyak probabilitas di dunia, ketemu dan kenal kamu tetap jadi hasil perhitungan terbaik."
  },
  {
    "tag": "Pesan Manis",
    "text": "Semangat terus kuliahnya, Bu Matematikawan! Dunia butuh lebih banyak orang hebat dan baik hati kayak kamu."
  },
  {
    "tag": "Pengingat Lembut",
    "text": "Matamu sudah kerja keras menatap layar dan buku hari ini. Kedip-kedip sebentar dan lihat yang hijau-hijau ya."
  },
  {
    "tag": "Pengingat Lembut",
    "text": "Nilai bagus itu bonus, yang paling penting kamu tetap sehat, bahagia, dan nggak telat makan."
  },
  {
    "tag": "Pengingat Lembut",
    "text": "Satu langkah kecil hari ini jauh lebih berarti daripada rencana sempurna yang nggak pernah dimulai."
  }
];

function formatFortuneItem(item) {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    return item.tag ? `[${item.tag}] ${item.text}` : String(item.text || '');
  }
  return String(item || '');
}

function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function cleanText(val, max = 1000) {
  if (typeof val !== "string") return "";
  return val.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function defaultState() {
  return {
    dailyTargetMin: 75,
    streak: 0,
    lastActiveDate: "",
    dailyMinutes: {},
    sessions: [],
    quickNote: "",
    cookieSession: "",
    cookiesLeft: 3
  };
}

export function loadFocusState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return base;

    const cleanDaily = {};
    if (p.dailyMinutes && typeof p.dailyMinutes === "object") {
      for (const [k, v] of Object.entries(p.dailyMinutes)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(Number(v))) {
          cleanDaily[k] = Math.max(0, Math.min(1440, Math.round(Number(v))));
        }
      }
    }

    const cleanSessions = Array.isArray(p.sessions)
      ? p.sessions.slice(0, 40).filter((s) => s && typeof s === "object").map((s) => ({
          id: cleanText(String(s.id || ""), 40) || `ses_${Date.now()}`,
          mode: cleanText(String(s.mode || "Fokus 25m"), 24),
          minutes: Number.isFinite(Number(s.minutes)) ? Math.max(1, Math.min(180, Math.round(Number(s.minutes)))) : 25,
          date: /^\d{4}-\d{2}-\d{2}$/.test(String(s.date || "")) ? String(s.date) : todayISO(),
          time: cleanText(String(s.time || ""), 12)
        }))
      : [];

    const sessionSlot = new Date().getHours() < 15 ? "Sesi Pagi–Siang" : "Sesi Sore–Malam";
    const sameSlot = p.cookieSession === sessionSlot;

    return {
      dailyTargetMin: Number.isFinite(Number(p.dailyTargetMin))
        ? Math.max(15, Math.min(600, Math.round(Number(p.dailyTargetMin))))
        : 75,
      streak: Number.isFinite(Number(p.streak)) ? Math.max(0, Math.min(3650, Math.round(Number(p.streak)))) : 0,
      lastActiveDate: /^\d{4}-\d{2}-\d{2}$/.test(String(p.lastActiveDate || "")) ? String(p.lastActiveDate) : "",
      dailyMinutes: cleanDaily,
      sessions: cleanSessions,
      quickNote: cleanText(String(p.quickNote || ""), 2000),
      cookieSession: sessionSlot,
      cookiesLeft: sameSlot && Number.isFinite(Number(p.cookiesLeft))
        ? Math.max(0, Math.min(3, Math.round(Number(p.cookiesLeft))))
        : 3
    };
  } catch {
    return base;
  }
}

export function saveFocusState(state) {
  try {
    localStorage.setItem(FOCUS_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function updateStreakOnComplete(state, dateStr) {
  if (state.lastActiveDate === dateStr) return;
  const dt = new Date(dateStr + "T00:00:00");
  const prev = new Date(dt.getTime() - 86400000);
  const prevISO = todayISO(prev);
  state.streak = state.lastActiveDate === prevISO ? state.streak + 1 : 1;
  state.lastActiveDate = dateStr;
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const MODES = [
  { key: "focus", label: "Fokus 25m", minutes: 25 },
  { key: "short", label: "Istirahat 5m", minutes: 5 },
  { key: "long", label: "Santai 15m", minutes: 15 }
];

export function mountFocusProductivity(hostEl) {
  if (!hostEl) return null;
  const state = loadFocusState();
  let modeIdx = 0;
  let remainingSec = MODES[0].minutes * 60;
  let timerId = null;

  let cookieTaps = 0;
  let currentFortune = "";
  let fortuneIdx = 0;

  hostEl.textContent = "";
  hostEl.className = "dzili-fcs-wrap";

  const sumStrip = el("div", "dzili-fcs-stats");
  const statTarget = el("div", "dzili-fcs-stat-card");
  const statStreak = el("div", "dzili-fcs-stat-card");
  const statWeek = el("div", "dzili-fcs-stat-card");
  sumStrip.append(statTarget, statStreak, statWeek);

  const timerCard = el("div", "dzili-fcs-timer-card");
  const modeBar = el("div", "dzili-fcs-modes");
  const modeBtns = MODES.map((m, idx) => {
    const b = el("button", "dzili-fcs-mode-btn", m.label);
    b.type = "button";
    b.addEventListener("click", () => {
      pauseTimer();
      modeIdx = idx;
      remainingSec = m.minutes * 60;
      renderTimer();
    });
    modeBar.appendChild(b);
    return b;
  });

  const clockEl = el("div", "dzili-fcs-clock", "25:00");
  const ctlRow = el("div", "dzili-fcs-controls");
  const startBtn = el("button", "dzili-btn-primary", "Mulai");
  startBtn.type = "button";
  const resetBtn = el("button", "dzili-btn-ghost", "Reset");
  resetBtn.type = "button";
  ctlRow.append(startBtn, resetBtn);

  const sessionInfo = el("p", "dzili-fcs-session-info");
  timerCard.append(modeBar, clockEl, ctlRow, sessionInfo);

  const chartCard = el("div", "dzili-fcs-chart-card");
  const chartTitle = el("div", "dzili-fcs-sec-head");
  chartTitle.append(el("strong", "", "Grafik Waktu Belajar (7 Hari)"), el("span", "", "Menit fokus"));
  const chartBars = el("div", "dzili-fcs-bars");
  chartCard.append(chartTitle, chartBars);

  const cookieCard = el("div", "dzili-cookie-card");
  const cookieHead = el("div", "dzili-fcs-sec-head");
  const cookieSlotLabel = el("span", "dzili-cookie-slot", state.cookieSession);
  const cookieQuotaLabel = el("span", "dzili-cookie-quota", `Sisa sesi ini: ${state.cookiesLeft}/3 kue`);
  cookieHead.append(cookieSlotLabel, cookieQuotaLabel);

  const cookieStage = el("button", "dzili-cookie-stage");
  cookieStage.type = "button";
  cookieStage.setAttribute("aria-label", "Ketuk kue keberuntungan 3 kali");

  const cookieArt = el("div", "dzili-cookie-art", "🥠");
  const cookieTapHint = el("div", "dzili-cookie-tap-hint", "Ketuk kuenya 3x untuk membuka isi");
  const cookieDots = el("div", "dzili-cookie-dots");
  const dotEls = [0, 1, 2].map(() => el("span", "dzili-cookie-dot"));
  dotEls.forEach((d) => cookieDots.appendChild(d));
  cookieStage.append(cookieArt, cookieTapHint, cookieDots);

  const fortuneBox = el("div", "dzili-fortune-box");
  fortuneBox.hidden = true;
  const fortuneText = el("p", "dzili-fortune-text");
  const nextCookieBtn = el("button", "dzili-btn-mini", "Kue Berikutnya");
  nextCookieBtn.type = "button";
  nextCookieBtn.hidden = true;
  fortuneBox.append(fortuneText, nextCookieBtn);

  cookieCard.append(el("h4", "dzili-fcs-sub", "Kue Keberuntungan • Pojok Istirahat"), cookieHead, cookieStage, fortuneBox);

  const historyCard = el("div", "dzili-fcs-history-card");
  historyCard.appendChild(el("h4", "dzili-fcs-sub", "Riwayat Sesi Terbaru"));
  const historyList = el("div", "dzili-fcs-history-list");
  historyCard.appendChild(historyList);

  const noteCard = el("div", "dzili-fcs-note-card");
  const noteHead = el("div", "dzili-fcs-sec-head");
  noteHead.append(el("h4", "dzili-fcs-sub", "Coretan Cepat"), el("span", "", "Tersimpan otomatis"));
  const noteArea = el("textarea", "dzili-textarea");
  noteArea.rows = 3;
  noteArea.placeholder = "Tulis rumus singkat, ide, atau pengingat kilat...";
  noteArea.value = state.quickNote;
  noteArea.addEventListener("input", () => {
    state.quickNote = cleanText(noteArea.value, 2000);
    saveFocusState(state);
  });
  noteCard.append(noteHead, noteArea);

  function fmtClock(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function pauseTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    startBtn.textContent = "Mulai";
  }

  function completeSession() {
    pauseTimer();
    const curMode = MODES[modeIdx];
    const today = todayISO();
    const nowTime = new Date().toTimeString().slice(0, 5);

    if (curMode.key === "focus") {
      state.dailyMinutes[today] = (state.dailyMinutes[today] || 0) + curMode.minutes;
      updateStreakOnComplete(state, today);
    }

    state.sessions.unshift({
      id: `ses_${Date.now()}`,
      mode: curMode.label,
      minutes: curMode.minutes,
      date: today,
      time: nowTime
    });
    state.sessions = state.sessions.slice(0, 30);
    saveFocusState(state);
    remainingSec = curMode.minutes * 60;
    renderAll();
  }

  function startTimer() {
    if (timerId) return;
    startBtn.textContent = "Jeda";
    timerId = setInterval(() => {
      remainingSec -= 1;
      if (remainingSec <= 0) {
        completeSession();
      } else {
        renderTimer();
      }
    }, 1000);
  }

  startBtn.addEventListener("click", () => {
    if (timerId) pauseTimer();
    else startTimer();
  });

  resetBtn.addEventListener("click", () => {
    pauseTimer();
    remainingSec = MODES[modeIdx].minutes * 60;
    renderTimer();
  });

  function triggerCookieTap() {
    cookieStage.classList.remove("is-wobble");
    void cookieStage.offsetWidth;
    cookieStage.classList.add("is-wobble");

    if (state.cookiesLeft <= 0) {
      cookieTapHint.textContent = "Kuota kue di sesi ini sudah habis. Coba lagi di sesi berikutnya!";
      return;
    }

    cookieTaps += 1;
    dotEls.forEach((d, idx) => d.classList.toggle("is-lit", idx < cookieTaps));

    if (cookieTaps < 3) {
      cookieTapHint.textContent = `Ketuk lagi ${3 - cookieTaps}x (${cookieTaps}/3)`;
      return;
    }

    currentFortune = formatFortuneItem(FORTUNES[fortuneIdx % FORTUNES.length]);
    fortuneIdx += 1;
    state.cookiesLeft = Math.max(0, state.cookiesLeft - 1);
    saveFocusState(state);

    cookieTaps = 0;
    cookieArt.textContent = "✨";
    cookieTapHint.textContent = "Kue terbuka!";
    fortuneText.textContent = currentFortune;
    fortuneBox.hidden = false;
    nextCookieBtn.hidden = state.cookiesLeft <= 0;
    cookieQuotaLabel.textContent = `Sisa sesi ini: ${state.cookiesLeft}/3 kue`;
  }

  cookieStage.addEventListener("click", triggerCookieTap);

  nextCookieBtn.addEventListener("click", () => {
    if (state.cookiesLeft <= 0) return;
    cookieTaps = 0;
    dotEls.forEach((d) => d.classList.remove("is-lit"));
    cookieArt.textContent = "🥠";
    cookieTapHint.textContent = "Ketuk kuenya 3x untuk membuka isi";
    fortuneBox.hidden = true;
    nextCookieBtn.hidden = true;
  });

  function renderTimer() {
    modeBtns.forEach((b, i) => b.classList.toggle("is-active", i === modeIdx));
    clockEl.textContent = fmtClock(remainingSec);
    const today = todayISO();
    const todayCount = state.sessions.filter((s) => s.date === today && s.mode.startsWith("Fokus")).length;
    sessionInfo.textContent = `Sesi fokus selesai hari ini: ${todayCount} sesi`;
  }

  function renderStatsAndChart() {
    const today = todayISO();
    const todayMin = state.dailyMinutes[today] || 0;
    const pct = Math.min(100, Math.round((todayMin / state.dailyTargetMin) * 100));

    statTarget.textContent = "";
    statTarget.append(el("small", "", "Target Hari Ini"), el("strong", "", `${todayMin}/${state.dailyTargetMin}m`), el("span", "", `${pct}% tercapai`));

    statStreak.textContent = "";
    statStreak.append(el("small", "", "Streak Belajar"), el("strong", "", `${state.streak} Hari`), el("span", "", state.lastActiveDate ? `Aktif ${state.lastActiveDate}` : "Mulai hari ini"));

    const now = new Date();
    const days = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const iso = todayISO(dt);
      const mins = state.dailyMinutes[iso] || 0;
      weekTotal += mins;
      days.push({ label: dt.toLocaleDateString("id-ID", { weekday: "short" }), mins, isToday: iso === today });
    }

    statWeek.textContent = "";
    statWeek.append(el("small", "", "Total 7 Hari"), el("strong", "", `${weekTotal} Menit`), el("span", "", `${(weekTotal / 60).toFixed(1)} jam fokus`));

    const maxMin = Math.max(25, ...days.map((d) => d.mins));
    chartBars.textContent = "";
    days.forEach((d) => {
      const col = el("div", "dzili-fcs-bar-col");
      const track = el("div", "dzili-fcs-bar-track");
      const fill = el("div", "dzili-fcs-bar-fill");
      if (d.isToday) fill.classList.add("is-today");
      fill.style.height = `${Math.max(8, Math.round((d.mins / maxMin) * 100))}%`;
      track.appendChild(fill);
      col.append(track, el("small", "", d.label), el("span", "", `${d.mins}m`));
      chartBars.appendChild(col);
    });
  }

  function renderHistory() {
    historyList.textContent = "";
    const recent = state.sessions.slice(0, 5);
    if (!recent.length) {
      historyList.appendChild(el("p", "dzili-empty-note", "Belum ada sesi tercatat. Tekan Mulai untuk memulai."));
      return;
    }
    recent.forEach((s) => {
      const row = el("div", "dzili-fcs-hist-item");
      row.append(el("strong", "", `${s.mode} (${s.minutes}m)`), el("span", "", `${s.date} • ${s.time || ""}`));
      historyList.appendChild(row);
    });
  }

  function renderAll() {
    renderTimer();
    renderStatsAndChart();
    renderHistory();
  }

  hostEl.append(sumStrip, timerCard, chartCard, cookieCard, historyCard, noteCard);
  renderAll();
  return { refresh: renderAll };
}
