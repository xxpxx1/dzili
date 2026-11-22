if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js').catch(() => {}); }

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_SHORT = { Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', Jumat: 'Jum', Sabtu: 'Sab', Minggu: 'Min' };
const ICO_CAL = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICO_EDIT = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICO_DEL = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
function renderEmptyState(title, sub) {
  return `<div class="empty-state"><div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.8L20 10.7l-5 3.6 1.9 5.7-4.9-3.5-4.9 3.5 1.9-5.7-5-3.6 6.1-1.9z"/></svg></div><div class="empty-title">${title}</div><div class="empty-sub">${sub}</div></div>`;
}
const BINDER_CATS = ['Semua', 'Kalkulus', 'Aljabar', 'Statistika', 'Geometri', 'Matematika Diskrit', 'Umum'];

const MATH_SYMBOLS = {
  Kalkulus: ['∫', '∬', '∮', '∑', '∏', '∂', '∇', '∆', '∞', '→', '↦', 'lim', 'dx', 'dy', '≈', '≠'],
  Himpunan: ['∀', '∃', '∈', '∉', '⊂', '⊆', '∪', '∩', '∅', 'ℝ', 'ℤ', 'ℕ', 'ℚ', 'ℂ', '⇒', '⇔'],
  'Akar/Geo': ['√', '∛', '²', '³', 'ⁿ', '⁻¹', '±', '×', '÷', '·', '≤', '≥', '≡', '°', '∠', '⊥'],
  Yunani: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'ψ', 'ω', 'Ω']
};

const FORTUNES = [
  // Ramalan Kuliah & Kampus
  { tag: 'Ramalan Kuliah', text: 'Hari ini dosen akan selesai menjelaskan 10 menit lebih awal. Aamiin paling kencang!' },
  { tag: 'Ramalan Kuliah', text: 'Dosen yang biasanya killer hari ini lagi mode baik hati dan nggak jadi ngasih kuis dadakan.' },
  { tag: 'Ramalan Kuliah', text: 'Kursi favoritmu di kelas masih kosong dan dingin AC-nya pas banget hari ini.' },
  { tag: 'Ramalan Kuliah', text: 'Kelompok presentasimu bakal dapat pertanyaan yang kebetulan banget baru saja kamu baca!' },
  { tag: 'Ramalan Kuliah', text: 'Jam kosong tak terduga akan muncul di saat baterai energimu tinggal 15%.' },
  { tag: 'Ramalan Kuliah', text: 'Catatan yang kamu tulis rapi hari ini bakal menyelamatkanmu pas H-1 ujian nanti.' },
  { tag: 'Ramalan Jajan', text: 'Seseorang di sekitar sini diam-diam ingin mentraktir kamu kopi atau matcha minggu ini.' },
  { tag: 'Ramalan Jajan', text: 'Jajanan yang lagi kamu pengenin sejak kemarin bakal ketemu di jalan pulang nanti.' },
  { tag: 'Ramalan Hari Ini', text: 'Antrean makan siangmu hari ini bakal lancar jaya dan porsinya lebih banyak dari biasanya.' },
  { tag: 'Ramalan Hari Ini', text: 'Cuaca hari ini bersahabat banget buat pulang kuliah tanpa drama kehujanan.' },
  { tag: 'Hoki Akademik', text: 'Materi yang baru saja kamu baca punya peluang 87,4% muncul di kuis atau ujian nanti!' },
  { tag: 'Hoki Hari Ini', text: 'Kamu akan menemukan jawaban soal yang sempat bikin bingung tepat setelah minum sesuatu yang segar.' },
  { tag: 'Hoki Hari Ini', text: 'Baterai HP dan baterai semangatmu akan awet sampai kelas terakhir selesai!' },
  { tag: 'Hoki Hari Ini', text: 'Notifikasi yang bikin senyum-senyum sendiri bakal masuk ke HP-mu hari ini.' },

  // Tebak-Tebakan & Humor Matematika
  { tag: 'Humor Math', text: 'Kenapa buku matematika selalu kelihatan sedih? Karena punya banyak masalah. Untung kamu jago nyelesainnya!' },
  { tag: 'Humor Math', text: 'Apa bedanya kamu sama integral tentu? Kalau integral tentu ada batasnya, kalau cantiknya kamu tak terhingga.' },
  { tag: 'Humor Math', text: 'Sudut apa yang paling hangat? Bukan sudut 90 derajat, tapi sudut bibir kamu pas lagi senyum.' },
  { tag: 'Humor Math', text: 'Kenapa garis sejajar nggak pernah ketemu? Soalnya mereka belum install aplikasi Dzili.' },
  { tag: 'Humor Math', text: 'Kenapa angka 6 takut sama angka 7? Karena seven eight nine (7 8 9)!' },
  { tag: 'Humor Math', text: 'Apa yang dibilang angka 0 ke angka 8? "Ikat pinggangnya keren banget, Bro!"' },
  { tag: 'Humor Math', text: 'Kenapa tanaman di jurusan matematika nggak pernah tumbuh normal? Karena akarnya kuadrat semua.' },
  { tag: 'Humor Math', text: 'Cintaku ke kamu itu kayak nilai Pi (π): nggak pernah berhenti dan nggak bakal habis dibagi apa pun.' },
  { tag: 'Tebak-Tebakan', text: 'Angka berapa yang paling romantis? Angka 2, soalnya kalau sendiri sepi, kalau berdua jadi asyik.' },
  { tag: 'Tebak-Tebakan', text: 'Kopi apa yang paling pahit? Kopilih dia daripada aku. Bercanda deng, yang manis cuma kamu!' },
  { tag: 'Tebak-Tebakan', text: 'Hewan apa yang paling sering telat masuk kelas pagi? Kaki seribu, kelamaan pakai sepatunya.' },
  { tag: 'Tebak-Tebakan', text: 'Kenapa zombie kalau nyerang selalu rame-rame? Kalau sendirian namanya zomblo.' },
  { tag: 'Tebak-Tebakan', text: 'Ikan apa yang paling sering berhenti mendadak? Ikan pause.' },
  { tag: 'Tebak-Tebakan', text: 'Awan apa yang bikin seneng? Awanna be with you terus setiap hari.' },
  { tag: 'Tebak-Tebakan', text: 'Benda apa yang kalau dipotong malah makin tinggi? Celana panjang!' },
  { tag: 'Tebak-Tebakan', text: 'Sayur apa yang jago nyanyi? Kol-play!' },

  // Cerita Mini Lucu (Relatable Kampus & Sehari-hari)
  { tag: 'Cerita Mini', text: 'Niat hati buka HP cuma mau cek jam kuliah 5 detik. Eh, tahu-tahu sudah 40 menit nonton video kucing nyanyi.' },
  { tag: 'Cerita Mini', text: 'Momen paling menegangkan di kelas: dosen bilang "Coba yang pojok jawab", lalu seluruh kelas mendadak pura-pura sibuk nyatet.' },
  { tag: 'Cerita Mini', text: 'Definisi percaya diri tingkat dewa: ngerjain soal hitungan 3 halaman penuh tanpa kalkulator, pas dicek ternyata salah tanda minus di baris pertama.' },
  { tag: 'Cerita Mini', text: 'Tadi malam sudah pasang 5 alarm buat kelas pagi. Pas pagi bunyi, bukannya bangun malah dimatiin sambil bilang "5 menit lagi" dalam mimpi.' },
  { tag: 'Cerita Mini', text: 'Di catatan binder tulisannya rapi estetik pakai stabilo pastel. Pas masuk halaman ke-4 dosen ngebut, tulisannya berubah jadi sandi rumput.' },
  { tag: 'Cerita Mini', text: 'Status baterai HP 10%: panik cari colokan. Status baterai otak 10%: masih sempat mikir "habis ini enaknya jajan apa ya?"' },
  { tag: 'Cerita Mini', text: 'Bilangnya ke teman "Aku belum belajar sama sekali nih", pas nilai keluar ternyata dapat A. Semoga kejadian ini menular ke kamu!' },
  { tag: 'Cerita Mini', text: 'Hukum kekekalan tugas kuliah: satu tugas selesai dicentang, dua tugas baru langsung muncul di grup kelas.' },
  { tag: 'Cerita Mini', text: 'Persiapan belajar: rapikan meja 20 menit, bikin minum 10 menit, pilih lagu 15 menit, belajarnya 5 menit lalu ngantuk.' },
  { tag: 'Cerita Mini', text: 'Kalau ketemu soal ujian yang bentuknya aneh banget, tarik napas, baca bismillah, dan ingat: dosennya juga manusia yang suka ngopi.' },
  { tag: 'Cerita Mini', text: 'Misteri terbesar mahasiswa: pulpen baru beli kemarin langsung hilang, tapi pulpen nemu di jalan awet sampai lulus.' },
  { tag: 'Cerita Mini', text: 'Katanya matematika itu ilmu pasti, tapi kenapa pas ditanya "Mau makan di mana?" jawabannya selalu "Terserah"?' },

  // Mood Booster & Penyemangat Manis
  { tag: 'Mood Booster', text: 'Nggak apa-apa jalan pelan, yang penting nggak mundur. Kamu sudah hebat banget sejauh ini!' },
  { tag: 'Mood Booster', text: 'Kalau hari ini terasa berat, ingat: ada seseorang yang selalu bangga sama setiap usaha kecilmu.' },
  { tag: 'Mood Booster', text: 'Jangan lupa minum air putih! Otak yang encer butuh hidrasi, bukan cuma kafein dan harapan.' },
  { tag: 'Mood Booster', text: 'Bahu tegang? Tarik napas 4 detik, embuskan pelan. Tugasnya nggak akan kabur kok, santai dulu 2 menit.' },
  { tag: 'Mood Booster', text: 'Kamu itu kombinasi langka: pinter ngitung rumus, tapi juga jago bikin hari orang lain jadi lebih cerah.' },
  { tag: 'Mood Booster', text: 'Setiap halaman catatan yang kamu tulis hari ini adalah investasi buat versi kamu yang sukses di masa depan.' },
  { tag: 'Pesan Manis', text: 'Rumus kebahagiaan hari ini: Istirahat cukup + Minum air putih + Senyum manis kamu.' },
  { tag: 'Pesan Manis', text: 'Capek boleh, nyerah jangan. Kalau butuh tempat cerita atau butuh teman jajan, tinggal kabari ya!' },
  { tag: 'Pesan Manis', text: 'Terima kasih sudah bertahan dan berjuang melewati hari ini dengan keren. Selamat istirahat nanti malam!' },
  { tag: 'Pesan Manis', text: 'Dari sekian banyak probabilitas di dunia, ketemu dan kenal kamu tetap jadi hasil perhitungan terbaik.' },
  { tag: 'Pesan Manis', text: 'Semangat terus kuliahnya, Bu Matematikawan! Dunia butuh lebih banyak orang hebat dan baik hati kayak kamu.' },
  { tag: 'Pengingat Lembut', text: 'Matamu sudah kerja keras menatap layar dan buku hari ini. Kedip-kedip sebentar dan lihat yang hijau-hijau ya.' },
  { tag: 'Pengingat Lembut', text: 'Nilai bagus itu bonus, yang paling penting kamu tetap sehat, bahagia, dan nggak telat makan.' },
  { tag: 'Pengingat Lembut', text: 'Satu langkah kecil hari ini jauh lebih berarti daripada rencana sempurna yang nggak pernah dimulai.' }
];

const defaultData = {
  userName: 'Dzili',
  bannerMsg: 'Semangat kuliahnya hari ini! Jangan lupa minum air putih dan istirahat cukup.',
  secretPin: '2026', voucher: null, customFortune: '',
  jadwal: [], tugas: [], binder: [], ujian: [], gpaCourses: [],
  note: '', sessions: 0, updatedAt: 0
};

let syncCfg = JSON.parse(localStorage.getItem('dzili_sync_cfg')) || { cloudUrl: '', roomId: 'dzili-01' };
let state = JSON.parse(localStorage.getItem('dzili_data')) || defaultData;
if (!state.binder) state.binder = [];
if (!state.ujian) state.ujian = [];
if (!state.gpaCourses) state.gpaCourses = [];
if (!state.secretPin) state.secretPin = '2026';

let isCloudBooting = Boolean(syncCfg.cloudUrl);
function renderSkeletonCards(count = 2) {
  return Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-line w-30"></div>
      <div class="skeleton-line w-75"></div>
      <div class="skeleton-line w-50"></div>
    </div>`).join('');
}
let pushTimer = null;
function setSyncBadge(text, cls) {
  const el = document.getElementById('syncStatus'); if (!el) return;
  el.textContent = text; el.className = `sync-badge ${cls || ''}`;
}
function persist(skipCloud = false) {
  if (!skipCloud) state.updatedAt = Date.now();
  localStorage.setItem('dzili_data', JSON.stringify(state));
  renderBento();
  if (!skipCloud && syncCfg.cloudUrl) { clearTimeout(pushTimer); pushTimer = setTimeout(() => pushToCloud(), 700); }
}
function getEndpoint() {
  const base = (syncCfg.cloudUrl || '').trim().replace(/\/+$/, '');
  const room = (syncCfg.roomId || 'dzili-01').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'dzili-01';
  return base ? `${base}/dzili_rooms/${room}.json` : '';
}
async function pushToCloud() {
  const url = getEndpoint(); if (!url) { setSyncBadge('Lokal', 'offline'); return; }
  setSyncBadge('Sync...', 'syncing');
  try {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
    if (!res.ok) throw new Error();
    setSyncBadge('☁️ Tersinkron', '');
  } catch (e) { setSyncBadge('Offline', 'offline'); }
  if (isCloudBooting) { isCloudBooting = false; renderAll(); }
}
async function pullFromCloud(force = false) {
  const url = getEndpoint(); if (!url) { setSyncBadge('Lokal', 'offline'); return; }
  setSyncBadge('Cek...', 'syncing');
  try {
    const res = await fetch(url); if (!res.ok) throw new Error();
    const remote = await res.json();
    if (remote && (force || (remote.updatedAt && remote.updatedAt > (state.updatedAt || 0)))) {
      state = { ...defaultData, ...remote, jadwal: remote.jadwal || [], tugas: remote.tugas || [], binder: remote.binder || [], ujian: remote.ujian || [], gpaCourses: remote.gpaCourses || [] };
      persist(true); renderAll();
    } else if (!remote && state.updatedAt > 0) { await pushToCloud(); }
    setSyncBadge('☁️ Tersinkron', '');
  } catch (e) { setSyncBadge('Offline', 'offline'); }
  if (isCloudBooting) { isCloudBooting = false; renderAll(); }
}
function checkIncomingLinks() {
  const hash = window.location.hash; if (!hash) return;
  try {
    if (hash.startsWith('#sync=')) {
      const cfg = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
      if (cfg.url) {
        syncCfg = { cloudUrl: cfg.url, roomId: cfg.room || 'dzili-01' };
        localStorage.setItem('dzili_sync_cfg', JSON.stringify(syncCfg));
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setTimeout(() => { pullFromCloud(true); alert('Sinkronisasi 2 HP berhasil terhubung!'); }, 300);
      }
    } else if (hash.startsWith('#gift=')) {
      const p = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
      if (p.msg) state.bannerMsg = p.msg;
      if (p.fortune !== undefined) state.customFortune = p.fortune;
      if (p.vTitle) state.voucher = { title: p.vTitle, desc: p.vDesc || 'Hadiah spesial buat kamu!', claimed: false };
      persist(); history.replaceState(null, '', window.location.pathname + window.location.search);
      setTimeout(() => alert('Ada pesan & kejutan baru buat kamu di Dzili!'), 350);
    }
  } catch (e) {}
}

const jsDay = new Date().getDay();
const todayName = jsDay === 0 ? 'Minggu' : DAYS[jsDay - 1];
let selectedDay = todayName, selectedBinderCat = 'Semua';
let editingJadwalId = null, editingTugasId = null, editingBinderId = null, editingUjianId = null;
let tempTugasPhoto = '', tempBinderPhoto = '';

function renderHeader() {
  const h = new Date().getHours();
  const salam = h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam';
  document.getElementById('greetingText').textContent = `${salam}, ${state.userName}!`;
  document.getElementById('todayDateText').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  document.getElementById('dailyBanner').textContent = state.bannerMsg;
  renderVoucher(); renderBento();
}

function renderBento() {
  const tc = state.jadwal.filter(j => j.hari === todayName).sort((a, b) => a.jam.localeCompare(b.jam));
  const ccEl = document.getElementById('bentoClassCount');
  if (ccEl.textContent !== String(tc.length)) { ccEl.classList.remove('bento-pop'); void ccEl.offsetWidth; ccEl.classList.add('bento-pop'); }
  ccEl.textContent = tc.length;
  document.getElementById('bentoClassSub').textContent = tc.length > 0 ? `Mulai ${tc[0].jam.split('-')[0].trim()}` : `Hari ${todayName} libur kelas`;
  const at = state.tugas.filter(t => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const tcEl = document.getElementById('bentoTaskCount');
  if (tcEl.textContent !== String(at.length)) { tcEl.classList.remove('bento-pop'); void tcEl.offsetWidth; tcEl.classList.add('bento-pop'); }
  tcEl.textContent = at.length;
  document.getElementById('bentoTaskSub').textContent = at.length > 0 ? `Terdekat: ${at[0].matkul}` : 'Semua tugas beres!';
}

function renderVoucher() {
  const box = document.getElementById('voucherContainer');
  if (!state.voucher || !state.voucher.title) { box.innerHTML = ''; return; }
  const v = state.voucher;
  box.innerHTML = `<div class="voucher-card ${v.claimed ? 'claimed' : ''}"><div class="voucher-info"><h4>${v.title}</h4><p>${v.desc}</p></div><button class="claim-btn" onclick="toggleClaimVoucher()">${v.claimed ? 'Sudah Diklaim' : 'Klaim'}</button></div>`;
}
function toggleClaimVoucher() { if (!state.voucher) return; state.voucher.claimed = !state.voucher.claimed; persist(); renderVoucher(); }

let activeMathCat = 'Kalkulus';
function renderMathPad(containerId, targetInputId) {
  const box = document.getElementById(containerId); if (!box) return;
  const cats = Object.keys(MATH_SYMBOLS);
  box.innerHTML = `<div class="math-pad"><div class="math-tabs">${cats.map(c => `<button type="button" class="math-tab ${c === activeMathCat ? 'active' : ''}" onclick="switchMathCat('${c}')">${c}</button>`).join('')}</div><div class="math-keys">${MATH_SYMBOLS[activeMathCat].map(s => `<button type="button" class="math-key" onclick="insertAtCursor('${targetInputId}', '${s}')">${s}</button>`).join('')}</div></div>`;
}
function switchMathCat(cat) { activeMathCat = cat; renderMathPad('tugasMathPad', 'inputTugasJudul'); renderMathPad('binderMathPad', 'inputBinderBody'); }
function insertAtCursor(elId, text) {
  const el = document.getElementById(elId); if (!el) return;
  const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  el.focus(); el.setSelectionRange(start + text.length, start + text.length);
}
function insertBinderBlock(type) { insertAtCursor('inputBinderBody', `\n【${type}】 `); }

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 640, scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.55));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
async function handlePhotoPick(e, target) {
  const file = e.target.files?.[0]; if (!file) return;
  const dataUrl = await compressImage(file);
  if (target === 'tugas') { tempTugasPhoto = dataUrl; renderPhotoPreview('tugas'); }
  else { tempBinderPhoto = dataUrl; renderPhotoPreview('binder'); }
  e.target.value = '';
}
function renderPhotoPreview(target) {
  if (target === 'tugas') {
    document.getElementById('tugasPhotoPreview').innerHTML = tempTugasPhoto ? `<div class="preview-box"><img src="${tempTugasPhoto}" onclick="openLightbox(this.src)" /><button type="button" class="preview-del" onclick="tempTugasPhoto='';renderPhotoPreview('tugas')">✕</button></div>` : '';
  } else {
    document.getElementById('binderPhotoPreview').innerHTML = tempBinderPhoto ? `<div class="preview-box"><img src="${tempBinderPhoto}" onclick="openLightbox(this.src)" /><button type="button" class="preview-del" onclick="tempBinderPhoto='';renderPhotoPreview('binder')">✕</button></div>` : '';
    document.getElementById('btnRunOcr').style.display = tempBinderPhoto ? 'inline-flex' : 'none';
    document.getElementById('ocrStatus').textContent = '';
  }
}
function openLightbox(src) { document.getElementById('lightboxImg').src = src; document.getElementById('lightbox').classList.add('open'); }
async function runOcrOnBinder() {
  if (!tempBinderPhoto) return;
  const statusEl = document.getElementById('ocrStatus');
  statusEl.textContent = 'Memuat mesin pemindai tulisan...';
  try {
    if (!window.Tesseract) {
      await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    }
    const result = await window.Tesseract.recognize(tempBinderPhoto, 'eng', { logger: m => { if (m.status === 'recognizing text') statusEl.textContent = `Memindai tulisan... ${Math.round(m.progress * 100)}%`; } });
    const clean = (result.data.text || '').trim();
    if (clean) { const box = document.getElementById('inputBinderBody'); box.value = (box.value ? box.value + '\n\n' : '') + clean; statusEl.textContent = 'Teks dari foto berhasil disalin ke catatan!'; }
    else { statusEl.textContent = 'Tulisan tidak terbaca jelas, coba foto lebih dekat & terang.'; }
  } catch (err) { statusEl.textContent = 'Gagal memindai. Pastikan koneksi internet aktif.'; }
}
function renderDayPills() {
  document.getElementById('dayPills').innerHTML = DAYS.map(d => `<button class="day-pill ${d === selectedDay ? 'active' : ''}" onclick="selectDay('${d}')">${DAY_SHORT[d]}</button>`).join('');
}
function selectDay(d) { selectedDay = d; document.getElementById('inputHari').value = d; renderDayPills(); renderJadwal(); }
function renderJadwal() {
  document.getElementById('selectedDayTitle').textContent = `Jadwal Hari ${selectedDay}`;
  const list = document.getElementById('jadwalList');
  if (isCloudBooting) { list.innerHTML = renderSkeletonCards(2); return; }
  const items = state.jadwal.filter(i => i.hari === selectedDay).sort((a, b) => a.jam.localeCompare(b.jam));
  if (!items.length) { list.innerHTML = renderEmptyState(`Kosong di Hari ${selectedDay}`, "Nikmati waktu istirahatmu atau cicil materi kuliah."); return; }
  list.innerHTML = items.map(i => `<div class="timeline-item"><div class="timeline-track"><div class="timeline-dot"></div><div class="timeline-line"></div></div><div class="card"><div class="card-main"><span class="badge">${i.jam}</span>${i.remind ? ` <span class="badge done">🔔 ${i.remind}m</span>` : ''}<div class="card-title">${i.matkul}</div><div class="card-meta">${i.ruang || '-'}</div></div><div class="card-actions"><button class="icon-act" onclick="exportJadwalIcs(${i.id})" title="Alarm Kalender">${ICO_CAL}</button><button class="icon-act" onclick="editJadwal(${i.id})" title="Edit">${ICO_EDIT}</button><button class="icon-act danger" onclick="deleteJadwal(${i.id})" title="Hapus">${ICO_DEL}</button></div></div></div>`).join('');
}
function openAddJadwal() { editingJadwalId = null; document.getElementById('modalJadwalTitle').textContent = 'Tambah Mata Kuliah'; document.getElementById('inputHari').value = selectedDay; document.getElementById('inputMatkul').value = ''; document.getElementById('inputJam').value = ''; document.getElementById('inputRuang').value = ''; document.getElementById('inputJadwalRemind').value = '15'; openModal('modal-jadwal'); }
function editJadwal(id) { const i = state.jadwal.find(x => x.id === id); if (!i) return; editingJadwalId = id; document.getElementById('modalJadwalTitle').textContent = 'Edit Mata Kuliah'; document.getElementById('inputHari').value = i.hari; document.getElementById('inputMatkul').value = i.matkul; document.getElementById('inputJam').value = i.jam; document.getElementById('inputRuang').value = i.ruang || ''; document.getElementById('inputJadwalRemind').value = String(i.remind || 0); openModal('modal-jadwal'); }
function saveJadwal() {
  const hari = document.getElementById('inputHari').value, matkul = document.getElementById('inputMatkul').value.trim(), jam = document.getElementById('inputJam').value.trim(), ruang = document.getElementById('inputRuang').value.trim(), remind = Number(document.getElementById('inputJadwalRemind').value) || 0;
  if (!matkul || !jam) return alert('Nama mata kuliah dan jam wajib diisi.');
  if (editingJadwalId !== null) { const idx = state.jadwal.findIndex(x => x.id === editingJadwalId); if (idx !== -1) state.jadwal[idx] = { ...state.jadwal[idx], hari, matkul, jam, ruang, remind }; }
  else { state.jadwal.push({ id: Date.now(), hari, matkul, jam, ruang, remind }); }
  persist(); selectDay(hari); closeModals();
}
function deleteJadwal(id) { state.jadwal = state.jadwal.filter(i => i.id !== id); persist(); renderJadwal(); }

function getDeadlineBadge(d, done) {
  if (done) return { text: 'Selesai', cls: 'done' }; if (!d) return { text: 'Tanpa deadline', cls: '' };
  const t = new Date(); t.setHours(0,0,0,0); const diff = Math.round((new Date(d + 'T00:00:00') - t) / 86400000);
  if (diff < 0) return { text: `Terlewat ${Math.abs(diff)} hari`, cls: 'urgent' }; if (diff === 0) return { text: 'Deadline Hari Ini!', cls: 'urgent' };
  if (diff === 1) return { text: 'Besok', cls: 'soon' }; return { text: `${diff} hari lagi (${d})`, cls: '' };
}
function renderTugas() {
  const list = document.getElementById('tugasList');
  if (isCloudBooting) { list.innerHTML = renderSkeletonCards(2); return; }
  const sorted = [...state.tugas].sort((a, b) => a.done - b.done || a.deadline.localeCompare(b.deadline));
  if (!sorted.length) { list.innerHTML = renderEmptyState("Semua Tugas Beres", "Tekan + Tugas Baru jika ada PR atau proyek baru."); return; }
  list.innerHTML = sorted.map(t => {
    const b = getDeadlineBadge(t.deadline, t.done);
    return `<div class="card tugas-card"><div class="check-circle ${t.done ? 'checked' : ''}" onclick="toggleTugas(${t.id})">${t.done ? '✓' : ''}</div><div class="card-main"><span class="badge ${b.cls}">${b.text}</span>${t.remind && t.remind !== 'none' ? ` <span class="badge math">🔔 Pengingat</span>` : ''}<div class="card-title ${t.done ? 'completed' : ''}">${t.judul}</div><div class="card-meta">${t.matkul}</div>${t.photo ? `<img class="thumb-img" src="${t.photo}" onclick="openLightbox(this.src)" />` : ''}</div><div class="card-actions"><button class="icon-act" onclick="exportTugasIcs(${t.id})" title="Alarm Kalender">${ICO_CAL}</button><button class="icon-act" onclick="editTugas(${t.id})" title="Edit">${ICO_EDIT}</button><button class="icon-act danger" onclick="deleteTugas(${t.id})" title="Hapus">${ICO_DEL}</button></div></div>`;
  }).join('');
}
function openAddTugas() { editingTugasId = null; tempTugasPhoto = ''; document.getElementById('modalTugasTitle').textContent = 'Tambah Tugas Kuliah'; document.getElementById('inputTugasMatkul').value = ''; document.getElementById('inputTugasJudul').value = ''; document.getElementById('inputTugasDeadline').value = ''; document.getElementById('inputTugasRemind').value = 'h1'; renderPhotoPreview('tugas'); renderMathPad('tugasMathPad', 'inputTugasJudul'); openModal('modal-tugas'); }
function editTugas(id) { const t = state.tugas.find(x => x.id === id); if (!t) return; editingTugasId = id; tempTugasPhoto = t.photo || ''; document.getElementById('modalTugasTitle').textContent = 'Edit Tugas Kuliah'; document.getElementById('inputTugasMatkul').value = t.matkul; document.getElementById('inputTugasJudul').value = t.judul; document.getElementById('inputTugasDeadline').value = t.deadline || ''; document.getElementById('inputTugasRemind').value = t.remind || 'none'; renderPhotoPreview('tugas'); renderMathPad('tugasMathPad', 'inputTugasJudul'); openModal('modal-tugas'); }
function saveTugas() {
  const matkul = document.getElementById('inputTugasMatkul').value.trim(), judul = document.getElementById('inputTugasJudul').value.trim(), deadline = document.getElementById('inputTugasDeadline').value, remind = document.getElementById('inputTugasRemind').value || 'none';
  if (!matkul || !judul) return alert('Mata kuliah dan deskripsi wajib diisi.');
  if (editingTugasId !== null) { const idx = state.tugas.findIndex(x => x.id === editingTugasId); if (idx !== -1) state.tugas[idx] = { ...state.tugas[idx], matkul, judul, deadline, remind, photo: tempTugasPhoto }; }
  else { state.tugas.push({ id: Date.now(), matkul, judul, deadline, remind, photo: tempTugasPhoto, done: false }); }
  persist(); renderTugas(); closeModals();
}
function toggleTugas(id) { const t = state.tugas.find(x => x.id === id); if (t) t.done = !t.done; persist(); renderTugas(); }
function deleteTugas(id) { state.tugas = state.tugas.filter(t => t.id !== id); persist(); renderTugas(); }
function renderBinderFilters() {
  document.getElementById('binderFilterPills').innerHTML = BINDER_CATS.map(c =>
    `<button class="day-pill ${c === selectedBinderCat ? 'active' : ''}" style="min-width:auto; padding:7px 12px;" onclick="selectBinderCat('${c}')">${c}</button>`
  ).join('');
}
function selectBinderCat(cat) { selectedBinderCat = cat; renderBinderFilters(); renderBinder(); }
function formatBinderText(txt) {
  return (txt || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/(【(?:TEOREMA|RUMUS|DEFINISI)】[^\n]*)/g, '<div class="math-highlight">$1</div>');
}
function renderBinder() {
  const list = document.getElementById('binderList');
  if (isCloudBooting) { list.innerHTML = renderSkeletonCards(2); return; }
  const items = selectedBinderCat === 'Semua' ? state.binder : state.binder.filter(b => b.cat === selectedBinderCat);
  if (!items.length) { list.innerHTML = renderEmptyState("Binder Masih Kosong", "Tekan + Lembar Baru untuk mencatat rumus atau scan papan tulis."); return; }
  list.innerHTML = [...items].reverse().map(b => `
    <div class="binder-sheet">
      <div class="binder-header">
        <div>
          <span class="badge math">${b.cat}</span> <span style="font-size:11px; color:var(--muted);">${b.date || ''}</span>
          <div class="card-title" style="margin-top:2px;">${b.title}</div>
        </div>
        <div class="card-actions"><button class="icon-act" onclick="editBinder(${b.id})" title="Edit">${ICO_EDIT}</button><button class="icon-act danger" onclick="deleteBinder(${b.id})" title="Hapus">${ICO_DEL}</button></div>
      </div>
      <div class="binder-body">${formatBinderText(b.body)}</div>
      ${b.photo ? `<img class="thumb-img" src="${b.photo}" onclick="openLightbox(this.src)" />` : ''}
    </div>`).join('');
}
function openAddBinder() { editingBinderId = null; tempBinderPhoto = ''; document.getElementById('modalBinderTitle').textContent = 'Lembar Binder Baru'; document.getElementById('inputBinderCat').value = selectedBinderCat === 'Semua' ? 'Kalkulus' : selectedBinderCat; document.getElementById('inputBinderTitle').value = ''; document.getElementById('inputBinderBody').value = ''; renderPhotoPreview('binder'); renderMathPad('binderMathPad', 'inputBinderBody'); openModal('modal-binder'); }
function editBinder(id) { const b = state.binder.find(x => x.id === id); if (!b) return; editingBinderId = id; tempBinderPhoto = b.photo || ''; document.getElementById('modalBinderTitle').textContent = 'Edit Lembar Binder'; document.getElementById('inputBinderCat').value = b.cat || 'Umum'; document.getElementById('inputBinderTitle').value = b.title; document.getElementById('inputBinderBody').value = b.body || ''; renderPhotoPreview('binder'); renderMathPad('binderMathPad', 'inputBinderBody'); openModal('modal-binder'); }
function saveBinder() {
  const cat = document.getElementById('inputBinderCat').value, title = document.getElementById('inputBinderTitle').value.trim(), body = document.getElementById('inputBinderBody').value.trim();
  if (!title) return alert('Judul materi wajib diisi.');
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  if (editingBinderId !== null) { const idx = state.binder.findIndex(x => x.id === editingBinderId); if (idx !== -1) state.binder[idx] = { ...state.binder[idx], cat, title, body, photo: tempBinderPhoto }; }
  else { state.binder.push({ id: Date.now(), cat, title, body, photo: tempBinderPhoto, date: dateStr }); }
  persist(); renderBinder(); closeModals();
}
function deleteBinder(id) { state.binder = state.binder.filter(b => b.id !== id); persist(); renderBinder(); }

// === TIMER FOKUS PERSISTEN (ANTI-RESET) ===
let timerState = JSON.parse(localStorage.getItem('dzili_timer') || 'null') || { mode: 25, running: false, endAt: 0, remaining: 1500 };
let timerTick = null;

function saveTimerState() { localStorage.setItem('dzili_timer', JSON.stringify(timerState)); }

function syncModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.mins) === timerState.mode);
  });
}

function updateTimerUI() {
  const sec = Math.max(0, timerState.remaining);
  document.getElementById('timerDisplay').textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  const btn = document.getElementById('timerStartBtn');
  if (timerState.running) btn.textContent = 'Jeda';
  else if (timerState.remaining < timerState.mode * 60 && timerState.remaining > 0) btn.textContent = 'Lanjut';
  else btn.textContent = 'Mulai';
  syncModeButtons();
}

function tickTimer() {
  if (!timerState.running) { updateTimerUI(); return; }
  const left = Math.max(0, Math.ceil((timerState.endAt - Date.now()) / 1000));
  timerState.remaining = left;
  updateTimerUI();
  if (left <= 0) {
    clearInterval(timerTick); timerTick = null;
    const finishedMode = timerState.mode;
    timerState = { mode: finishedMode, running: false, endAt: 0, remaining: finishedMode * 60 };
    saveTimerState();
    updateTimerUI();
    if (finishedMode === 25) {
      state.sessions = (state.sessions || 0) + 1;
      persist();
      document.getElementById('sessionCount').textContent = state.sessions;
    }
    triggerReminderAlert('Sesi Fokus Selesai!', 'Kerja bagus! Waktunya istirahat sebentar ya.');
  }
}

function startTimerLoop() {
  clearInterval(timerTick);
  timerTick = setInterval(tickTimer, 500);
}

function setTimerMode(m, btn) {
  clearInterval(timerTick); timerTick = null;
  timerState = { mode: m, running: false, endAt: 0, remaining: m * 60 };
  saveTimerState();
  updateTimerUI();
}

function toggleTimer() {
  if (timerState.running) {
    const left = Math.max(0, Math.ceil((timerState.endAt - Date.now()) / 1000));
    timerState = { ...timerState, running: false, endAt: 0, remaining: left };
    saveTimerState();
    clearInterval(timerTick); timerTick = null;
    updateTimerUI();
  } else {
    const rem = timerState.remaining > 0 ? timerState.remaining : timerState.mode * 60;
    timerState = { ...timerState, running: true, endAt: Date.now() + rem * 1000, remaining: rem };
    saveTimerState();
    updateTimerUI();
    startTimerLoop();
  }
}

function resetTimer() {
  clearInterval(timerTick); timerTick = null;
  timerState = { mode: timerState.mode, running: false, endAt: 0, remaining: timerState.mode * 60 };
  saveTimerState();
  updateTimerUI();
}
// === FORTUNE COOKIE HIBURAN (LIMIT 6/HARI = 2 SESI x 3 KUE) ===
const MAX_PER_SESSION = 3;
let cookieTaps = 0, cookieOpened = false, currentFortune = null;

function getCookieSessionInfo() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const isSession1 = now.getHours() < 15; // Sesi 1: 00.00-14.59, Sesi 2: 15.00-23.59
  const sessionKey = isSession1 ? 's1' : 's2';
  const sessionLabel = isSession1 ? 'Sesi Pagi–Siang' : 'Sesi Sore–Malam';
  const nextResetText = isSession1 ? 'Sesi Sore–Malam dibuka pukul 15.00' : 'Toples diisi ulang besok pagi pukul 00.00';

  let q = JSON.parse(localStorage.getItem('dzili_cookie_quota') || 'null');
  if (!q || q.date !== today) {
    const prevSeen = (q && Array.isArray(q.seen)) ? q.seen : [];
    const prevCustom = (q && q.lastCustom) ? q.lastCustom : '';
    q = { date: today, s1: 0, s2: 0, seen: prevSeen, lastCustom: prevCustom };
    localStorage.setItem('dzili_cookie_quota', JSON.stringify(q));
  }
  const used = q[sessionKey] || 0;
  const remaining = Math.max(0, MAX_PER_SESSION - used);
  return { q, sessionKey, sessionLabel, nextResetText, used, remaining, totalToday: (q.s1 || 0) + (q.s2 || 0) };
}

function playCookieSound(cracked) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = cracked ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(cracked ? 420 : 280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(cracked ? 880 : 190, ctx.currentTime + (cracked ? 0.25 : 0.1));
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (cracked ? 0.26 : 0.11));
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + (cracked ? 0.27 : 0.12));
  } catch (e) {}
}

function pickUniqueFortune(q) {
  const custom = (state.customFortune || '').trim();
  if (custom && q.lastCustom !== custom) {
    q.lastCustom = custom;
    return { tag: 'Pesan Rahasia Spesial', text: custom };
  }
  if (!Array.isArray(q.seen) || q.seen.length >= FORTUNES.length) q.seen = [];
  const available = [];
  for (let i = 0; i < FORTUNES.length; i++) {
    if (!q.seen.includes(i)) available.push(i);
  }
  const chosenIdx = available[Math.floor(Math.random() * available.length)];
  q.seen.push(chosenIdx);
  return FORTUNES[chosenIdx];
}

function tapFortuneCookie() {
  if (cookieOpened) return;
  const info = getCookieSessionInfo();
  if (info.remaining <= 0) { renderFortuneCookie(); return; }

  cookieTaps++;
  const svg = document.getElementById('cookieSvg');
  if (cookieTaps < 3) {
    playCookieSound(false);
    if (svg) { svg.classList.remove('shake'); void svg.offsetWidth; svg.classList.add('shake'); }
    const hint = document.getElementById('cookieHint');
    if (hint) hint.textContent = cookieTaps === 1 ? 'Krek! Ketuk 2x lagi...' : 'Hampir pecah! Sekali lagi...';
    return;
  }

  playCookieSound(true);
  cookieOpened = true;
  info.q[info.sessionKey] = (info.q[info.sessionKey] || 0) + 1;
  currentFortune = pickUniqueFortune(info.q);
  localStorage.setItem('dzili_cookie_quota', JSON.stringify(info.q));
  renderFortuneCookie();
}

function resetFortuneCookie() {
  cookieTaps = 0; cookieOpened = false; currentFortune = null;
  renderFortuneCookie();
}

function renderFortuneCookie() {
  const box = document.getElementById('fortuneCookieBox');
  if (!box) return;
  const info = getCookieSessionInfo();
  const quotaHeader = `<div class="cookie-quota-bar"><span>${info.sessionLabel}</span><span>Sisa sesi ini: <strong>${info.remaining}/3 kue</strong></span></div>`;

  if (cookieOpened && currentFortune) {
    const nums = [Math.floor(Math.random()*9)+1, Math.floor(Math.random()*20)+10, ['π', 'e', 'φ', '∞'][Math.floor(Math.random()*4)]];
    const nextBtn = info.remaining > 0
      ? `<button class="btn-secondary" style="padding:8px 16px; font-size:12.5px;" onclick="resetFortuneCookie()">Buka Kue Lain (${info.remaining} tersisa)</button>`
      : `<div style="font-size:12px; color:var(--muted); margin-top:4px;">Kuota sesi ini sudah habis. ${info.nextResetText}.</div>`;
    box.innerHTML = `
      ${quotaHeader}
      <div class="fortune-paper">
        <span class="fortune-tag">${currentFortune.tag}</span>
        <div class="fortune-text">"${currentFortune.text}"</div>
        <div class="fortune-lucky">Angka hoki: ${nums.join(' • ')}</div>
      </div>
      ${nextBtn}`;
    return;
  }

  if (info.remaining <= 0) {
    box.innerHTML = `
      ${quotaHeader}
      <div class="cookie-sleep">
        <strong>Toples Kue Sesi Ini Kosong</strong>
        Kamu sudah membuka 3/3 kue keberuntungan di ${info.sessionLabel.toLowerCase()}.<br>${info.nextResetText}.
      </div>`;
    return;
  }

  box.innerHTML = `
    ${quotaHeader}
    <div class="cookie-stage" onclick="tapFortuneCookie()">
      <svg id="cookieSvg" class="cookie-svg" viewBox="0 0 120 96">
        <path d="M22 64 C14 40, 38 14, 64 16 C88 18, 108 42, 98 66 C90 80, 72 72, 60 56 C48 72, 30 80, 22 64 Z" fill="#F2CC8F" stroke="#D9A05B" stroke-width="3"/>
        <path d="M44 48 Q60 36 76 48" fill="none" stroke="#C6883E" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="38" cy="36" r="2" fill="#D9A05B"/><circle cx="82" cy="38" r="2" fill="#D9A05B"/>
      </svg>
      <div class="cookie-hint" id="cookieHint">Ketuk kuenya 3x untuk melihat isi keberuntunganmu</div>
    </div>`;
}

// === KALKULATOR ILMIAH, UJIAN & GPA ===
let calcStr = '', calcDeg = true;
function toggleCalcAngle() { calcDeg = !calcDeg; document.getElementById('calcAngleBtn').textContent = calcDeg ? 'DEG' : 'RAD'; }
function calcIn(v) { calcStr += v; document.getElementById('calcExpr').textContent = calcStr || '0'; }
function calcBack() { calcStr = calcStr.slice(0, -1); document.getElementById('calcExpr').textContent = calcStr || '0'; }
function calcClear() { calcStr = ''; document.getElementById('calcExpr').textContent = '0'; document.getElementById('calcRes').textContent = '0'; }
function fact(n) { if (n < 0 || n > 170) return NaN; let r = 1; for (let i = 2; i <= Math.floor(n); i++) r *= i; return r; }
function calcEval() {
  if (!calcStr) return;
  try {
    const toRad = x => calcDeg ? (x * Math.PI / 180) : x;
    let expr = calcStr.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => `fact(${n})`).replace(/\^/g, '**').replace(/pi/g, 'Math.PI').replace(/\be\b/g, 'Math.E').replace(/sqrt\(/g, 'Math.sqrt(').replace(/abs\(/g, 'Math.abs(').replace(/ln\(/g, 'Math.log(').replace(/log\(/g, 'Math.log10(').replace(/sin\(/g, 'Math.sin(toRad(').replace(/cos\(/g, 'Math.cos(toRad(').replace(/tan\(/g, 'Math.tan(toRad(');
    const openDiff = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    if (openDiff > 0) expr += ')'.repeat(openDiff);
    const val = Function('toRad', 'fact', `return (${expr})`)(toRad, fact);
    document.getElementById('calcRes').textContent = Number.isFinite(val) ? Number(val.toPrecision(10)).toString() : 'Error';
  } catch (e) { document.getElementById('calcRes').textContent = 'Error'; }
}
function copyCalcRes() { const val = document.getElementById('calcRes').textContent; navigator.clipboard?.writeText(val).then(() => alert(`Hasil ${val} disalin!`)); }

const noteEl = document.getElementById('quickNote');
noteEl.addEventListener('input', () => { state.note = noteEl.value; persist(); });

function renderUjian() {
  const list = document.getElementById('ujianList'), sorted = [...state.ujian].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  if (!sorted.length) { list.innerHTML = renderEmptyState("Belum Ada Jadwal Ujian", "Tambahkan jadwal UTS/UAS agar hitung mundurnya aktif."); return; }
  const today = new Date(); today.setHours(0,0,0,0);
  list.innerHTML = sorted.map(u => { const diff = Math.round((new Date(u.tanggal + 'T00:00:00') - today) / 86400000); let bt = `H-${diff} (${u.tanggal})`, bc = ''; if (diff < 0) { bt = 'Selesai'; bc = 'done'; } else if (diff === 0) { bt = 'HARI INI!'; bc = 'urgent'; } else if (diff <= 3) { bt = `H-${diff} • Segera!`; bc = 'soon'; } return `<div class="card tugas-card"><div class="card-main"><span class="badge ${bc}">${bt}</span><div class="card-title">${u.nama}</div><div class="card-meta">${u.info || '-'}</div></div><div class="card-actions"><button class="icon-act" onclick="editUjian(${u.id})" title="Edit">${ICO_EDIT}</button><button class="icon-act danger" onclick="deleteUjian(${u.id})" title="Hapus">${ICO_DEL}</button></div></div>`; }).join('');
}
function openAddUjian() { editingUjianId = null; document.getElementById('modalUjianTitle').textContent = 'Tambah Jadwal Ujian'; document.getElementById('inputUjianNama').value = ''; document.getElementById('inputUjianTanggal').value = ''; document.getElementById('inputUjianInfo').value = ''; openModal('modal-ujian'); }
function editUjian(id) { const u = state.ujian.find(x => x.id === id); if (!u) return; editingUjianId = id; document.getElementById('modalUjianTitle').textContent = 'Edit Jadwal Ujian'; document.getElementById('inputUjianNama').value = u.nama; document.getElementById('inputUjianTanggal').value = u.tanggal; document.getElementById('inputUjianInfo').value = u.info || ''; openModal('modal-ujian'); }
function saveUjian() {
  const nama = document.getElementById('inputUjianNama').value.trim(), tanggal = document.getElementById('inputUjianTanggal').value, info = document.getElementById('inputUjianInfo').value.trim();
  if (!nama || !tanggal) return alert('Nama & tanggal wajib diisi.');
  if (editingUjianId !== null) { const idx = state.ujian.findIndex(x => x.id === editingUjianId); if (idx !== -1) state.ujian[idx] = { ...state.ujian[idx], nama, tanggal, info }; }
  else { state.ujian.push({ id: Date.now(), nama, tanggal, info }); }
  persist(); renderUjian(); closeModals();
}
function deleteUjian(id) { state.ujian = state.ujian.filter(u => u.id !== id); persist(); renderUjian(); }

const GRADES = [{ label: 'A (4.0)', val: 4.0 }, { label: 'AB (3.5)', val: 3.5 }, { label: 'B (3.0)', val: 3.0 }, { label: 'BC (2.5)', val: 2.5 }, { label: 'C (2.0)', val: 2.0 }, { label: 'D (1.0)', val: 1.0 }, { label: 'E (0.0)', val: 0.0 }];
function renderGpa() {
  let sks = 0, pts = 0;
  document.getElementById('gpaRowsContainer').innerHTML = state.gpaCourses.map(c => { const s = Number(c.sks)||0, g = Number(c.grade)||0; sks += s; pts += s * g; return `<div class="gpa-row"><input type="text" value="${c.name}" placeholder="Matkul" onchange="updateGpa(${c.id},'name',this.value)" /><input type="number" min="1" max="6" value="${c.sks}" onchange="updateGpa(${c.id},'sks',this.value)" /><select onchange="updateGpa(${c.id},'grade',this.value)">${GRADES.map(x => `<option value="${x.val}" ${Number(c.grade)===x.val?'selected':''}>${x.label}</option>`).join('')}</select><button class="icon-act danger" style="width:30px;height:30px;" onclick="deleteGpaRow(${c.id})" title="Hapus">${ICO_DEL}</button></div>`; }).join('');
  document.getElementById('totalSksText').textContent = sks; document.getElementById('ipsResultText').textContent = sks > 0 ? (pts / sks).toFixed(2) : '0.00';
}
function addGpaRow() { state.gpaCourses.push({ id: Date.now(), name: '', sks: 3, grade: 4.0 }); persist(); renderGpa(); }
function updateGpa(id, f, v) { const r = state.gpaCourses.find(c => c.id === id); if (r) r[f] = f === 'name' ? v : Number(v); persist(); renderGpa(); }
function deleteGpaRow(id) { state.gpaCourses = state.gpaCourses.filter(c => c.id !== id); persist(); renderGpa(); }
// === PENGATURAN, PIN RAHASIA, NOTIFIKASI & KALENDER ===
let tapCount = 0, tapTimer = null;
function handleSecretTap() { tapCount++; clearTimeout(tapTimer); tapTimer = setTimeout(() => { tapCount = 0; }, 1500); if (tapCount >= 5) { tapCount = 0; document.getElementById('inputSecretPin').value = ''; openModal('modal-pin'); } }
function verifyPin() {
  if (document.getElementById('inputSecretPin').value.trim() === (state.secretPin || '2026')) {
    closeModals();
    document.getElementById('secretBannerInput').value = state.bannerMsg || '';
    document.getElementById('secretVoucherTitle').value = state.voucher ? state.voucher.title : '';
    document.getElementById('secretVoucherDesc').value = state.voucher ? state.voucher.desc : '';
    document.getElementById('secretFortuneInput').value = state.customFortune || '';
    document.getElementById('secretNewPin').value = '';
    openModal('modal-secret');
  } else { alert('PIN salah!'); document.getElementById('inputSecretPin').value = ''; }
}
async function applyAndPushSecret() {
  const msg = document.getElementById('secretBannerInput').value.trim();
  const vTitle = document.getElementById('secretVoucherTitle').value.trim();
  const vDesc = document.getElementById('secretVoucherDesc').value.trim();
  const fortune = document.getElementById('secretFortuneInput').value.trim();
  const newPin = document.getElementById('secretNewPin').value.trim();
  if (newPin.length >= 4) state.secretPin = newPin;
  if (msg) state.bannerMsg = msg;
  state.customFortune = fortune;
  state.voucher = vTitle ? { title: vTitle, desc: vDesc || 'Hadiah spesial buat kamu!', claimed: false } : null;
  persist(true); renderAll(); closeModals();
  if (syncCfg.cloudUrl) { await pushToCloud(); alert('Kejutan tersimpan & otomatis terkirim ke HP Dzili!'); }
  else { alert('Kejutan tersimpan lokal.'); }
}
function copyGiftLink() {
  const msg = document.getElementById('secretBannerInput').value.trim();
  const vTitle = document.getElementById('secretVoucherTitle').value.trim();
  const vDesc = document.getElementById('secretVoucherDesc').value.trim();
  const fortune = document.getElementById('secretFortuneInput').value.trim();
  const giftUrl = `${window.location.origin}${window.location.pathname}#gift=${btoa(encodeURIComponent(JSON.stringify({ msg, vTitle, vDesc, fortune })))}`;
  navigator.clipboard?.writeText(giftUrl).then(() => { alert('Link kejutan disalin!'); closeModals(); }).catch(() => prompt('Salin link ini:', giftUrl));
}
function switchTab(t) { document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); document.getElementById(`nav-${t}`)?.classList.add('active'); }
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModals() { editingJadwalId = null; editingTugasId = null; editingBinderId = null; editingUjianId = null; document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open')); }
function backdropClose(e, id) { if (e.target.id === id) closeModals(); }
function openSettings() { document.getElementById('inputUserName').value = state.userName; document.getElementById('inputBannerMsg').value = state.bannerMsg; updateNotifBtnLabel(); openModal('modal-settings'); }
function saveSettings() {
  const name = document.getElementById('inputUserName').value.trim(), msg = document.getElementById('inputBannerMsg').value.trim(), url = syncCfg.cloudUrl || '', room = syncCfg.roomId || 'dzili-01';
  if (name) state.userName = name; if (msg) state.bannerMsg = msg; syncCfg = { cloudUrl: url, roomId: room }; localStorage.setItem('dzili_sync_cfg', JSON.stringify(syncCfg));
  persist(); renderHeader(); closeModals(); if (url) pullFromCloud(true);
}
function manualSyncNow() { const url = syncCfg.cloudUrl || '', room = syncCfg.roomId || 'dzili-01'; if (!url) return alert('Isi URL Firebase terlebih dahulu.'); syncCfg = { cloudUrl: url, roomId: room }; localStorage.setItem('dzili_sync_cfg', JSON.stringify(syncCfg)); pullFromCloud(true); alert('Sinkronisasi dijalankan!'); }
function copySyncLink() { const url = syncCfg.cloudUrl || '', room = syncCfg.roomId || 'dzili-01'; if (!url) return alert('Isi URL Firebase terlebih dahulu.'); const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${btoa(encodeURIComponent(JSON.stringify({ url, room })))}`; navigator.clipboard?.writeText(syncUrl).then(() => alert('Link Setup 2 HP disalin!')).catch(() => prompt('Salin link ini:', syncUrl)); }
function redeemGiftPrompt() { const raw = prompt('Tempel link kejutan:'); if (!raw) return; const idx = raw.indexOf('#gift='); if (idx === -1) return alert('Format link tidak valid.'); try { const p = JSON.parse(decodeURIComponent(atob(raw.slice(idx + 6).trim()))); if (p.msg) state.bannerMsg = p.msg; if (p.fortune !== undefined) state.customFortune = p.fortune; if (p.vTitle) state.voucher = { title: p.vTitle, desc: p.vDesc || 'Hadiah spesial!', claimed: false }; persist(); renderAll(); closeModals(); alert('Kejutan berhasil dipasang!'); } catch (e) { alert('Gagal membaca link.'); } }

async function requestNotifPermission() {
  if (!('Notification' in window)) return alert('Browser ini tidak mendukung notifikasi web. Gunakan tombol 📅 di kartu matkul/tugas untuk alarm Kalender HP.');
  const res = await Notification.requestPermission(); updateNotifBtnLabel();
  if (res === 'granted') triggerReminderAlert('Notifikasi Dzili Aktif!', 'Pengingat jadwal kuliah dan deadline tugas siap berjalan.');
}
function updateNotifBtnLabel() {
  const btn = document.getElementById('btnEnableNotif'); if (!btn || !('Notification' in window)) return;
  btn.textContent = Notification.permission === 'granted' ? '🔔 Notifikasi HP Aktif ✓' : '🔔 Aktifkan Notifikasi HP';
}
function playSoftChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 0.45);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14); osc.stop(ctx.currentTime + idx * 0.14 + 0.46);
    });
  } catch (e) {}
}
function triggerReminderAlert(title, body) {
  playSoftChime();
  const toast = document.getElementById('remindToast');
  if (toast) {
    toast.innerHTML = `<div><strong>🔔 ${title}</strong><span>${body}</span></div><button onclick="document.getElementById('remindToast').classList.remove('show')">Oke</button>`;
    toast.classList.add('show');
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker?.ready.then(reg => reg.showNotification(title, { body, icon: './icon-180.png', tag: title })).catch(() => {});
  }
}
function checkReminders() {
  const now = new Date(), todayStr = now.toISOString().split('T')[0], nowMins = now.getHours() * 60 + now.getMinutes();
  let log = JSON.parse(localStorage.getItem('dzili_notified') || '{}'), changed = false;
  state.jadwal.filter(j => j.hari === todayName && Number(j.remind) > 0).forEach(j => {
    const m = (j.jam || '').match(/(\d{1,2})[:.](\d{2})/); if (!m) return;
    const diff = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10)) - nowMins;
    const key = `j_${j.id}_${todayStr}_${j.remind}`;
    if (diff >= 0 && diff <= Number(j.remind) && !log[key]) { log[key] = true; changed = true; triggerReminderAlert(`Kuliah ${j.matkul}`, `Mulai ${diff === 0 ? 'sekarang' : diff + ' menit lagi'} (${j.jam})`); }
  });
  const todayZero = new Date(); todayZero.setHours(0,0,0,0);
  state.tugas.filter(t => !t.done && t.deadline && t.remind && t.remind !== 'none').forEach(t => {
    const diffDays = Math.round((new Date(t.deadline + 'T00:00:00') - todayZero) / 86400000);
    const should = (t.remind === 'h0' && diffDays === 0) || (t.remind === 'h1' && (diffDays === 1 || diffDays === 0)) || (t.remind === 'h3' && (diffDays === 3 || diffDays === 1 || diffDays === 0));
    const key = `t_${t.id}_${todayStr}_${diffDays}`;
    if (should && now.getHours() >= 7 && !log[key]) { log[key] = true; changed = true; triggerReminderAlert(`Pengingat Tugas: ${t.matkul}`, `${t.judul} — Deadline ${diffDays === 0 ? 'HARI INI!' : 'H-' + diffDays}`); }
  });
  if (changed) localStorage.setItem('dzili_notified', JSON.stringify(log));
}
function downloadIcsFile(filename, content) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' })); a.download = filename; a.click(); }
function exportJadwalIcs(id) {
  const j = state.jadwal.find(x => x.id === id); if (!j) return;
  const dayMap = { Senin: [1,'MO'], Selasa: [2,'TU'], Rabu: [3,'WE'], Kamis: [4,'TH'], Jumat: [5,'FR'], Sabtu: [6,'SA'], Minggu: [0,'SU'] };
  const [targetDow, byDay] = dayMap[j.hari] || [1,'MO'];
  const times = (j.jam || '08:00').match(/(\d{1,2})[:.](\d{2})/g) || ['08:00'];
  const [sh, sm] = times[0].split(/[:.]/).map(Number), [eh, em] = times[1] ? times[1].split(/[:.]/).map(Number) : [sh + 1, sm];
  const d = new Date(); d.setDate(d.getDate() + ((targetDow - d.getDay() + 7) % 7));
  const pad = n => String(n).padStart(2, '0'), ymd = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  downloadIcsFile(`Kuliah-${j.matkul.replace(/\s+/g,'-')}.ics`, ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`DTSTART:${ymd}T${pad(sh)}${pad(sm)}00`,`DTEND:${ymd}T${pad(eh)}${pad(em)}00`,`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,`SUMMARY:Kuliah ${j.matkul}`,`LOCATION:${j.ruang||''}`,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Kuliah',`TRIGGER:-PT${Number(j.remind)||15}M`,'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n'));
}
function exportTugasIcs(id) {
  const t = state.tugas.find(x => x.id === id); if (!t || !t.deadline) return alert('Isi tanggal deadline tugas terlebih dahulu.');
  const ymd = t.deadline.replace(/-/g, '');
  downloadIcsFile(`Tugas-${t.matkul.replace(/\s+/g,'-')}.ics`, ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`DTSTART:${ymd}T073000`,`DTEND:${ymd}T080000`,`SUMMARY:Deadline Tugas ${t.matkul}: ${t.judul}`,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Deadline','TRIGGER:-PT0M','END:VALARM','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:H-1','TRIGGER:-P1D','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n'));
}

function renderAll() {
  if (document.activeElement !== noteEl) noteEl.value = state.note || '';
  document.getElementById('sessionCount').textContent = state.sessions || 0;
  renderHeader(); renderDayPills(); renderJadwal(); renderTugas(); renderBinderFilters(); renderBinder(); renderUjian(); renderGpa(); renderFortuneCookie();
}

checkIncomingLinks();
document.getElementById('inputHari').value = selectedDay;
renderAll();
tickTimer();
if (timerState.running) startTimerLoop();
updateNotifBtnLabel();
setTimeout(checkReminders, 1500);
setInterval(checkReminders, 30000);
if (syncCfg.cloudUrl) { pullFromCloud(); setTimeout(() => { if (isCloudBooting) { isCloudBooting = false; renderAll(); } }, 2200); }
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { tickTimer(); if (syncCfg.cloudUrl) { pullFromCloud(); setTimeout(() => { if (isCloudBooting) { isCloudBooting = false; renderAll(); } }, 2200); } }
});
setInterval(() => { if (!document.hidden && syncCfg.cloudUrl) pullFromCloud(); }, 15000);


(function() {
  const LP_ITEMS = [
    { title: 'Identitas Euler', expr: 'e^(iπ) + 1 = 0', cat: 'Analisis', meaning: 'Lima konstanta fundamental dalam satu persamaan', note: '“Menghubungkan e, i, π, 1, dan 0 secara harmonis.”' },
    { title: 'Teorema Pythagoras', expr: 'a² + b² = c²', cat: 'Geometri', meaning: 'Relasi sisi segitiga siku-siku pada bidang Euclid', note: '“Dasar perhitungan jarak dan vektor di ruang berdimensi n.”' },
    { title: 'Deret Geometri Tak Hingga', expr: 'S∞ = a / (1 − r)', cat: 'Kalkulus', meaning: 'Konvergen saat nilai mutlak rasio |r| < 1', note: '“Penjumlahan tak hingga yang menghasilkan nilai berhingga.”' },
    { title: 'Teorema Dasar Kalkulus', expr: '∫ₐᵇ f(x) dx = F(b) − F(a)', cat: 'Kalkulus', meaning: 'Menghubungkan turunan dan integral tentu', note: '“Luas di bawah kurva cukup dihitung dari antiturunannya.”' },
    { title: 'Identitas Trigonometri', expr: 'sin²θ + cos²θ = 1', cat: 'Trigonometri', meaning: 'Proyeksi koordinat titik pada lingkaran satuan', note: '“Berlaku untuk setiap sudut θ di bilangan real.”' },
    { title: 'Rumus Kombinasi', expr: 'C(n, k) = n! / (k!(n − k)!)', cat: 'Diskrit', meaning: 'Banyak cara memilih k objek tanpa urutan', note: '“Fondasi peluang dan koefisien ekspansi binomial.”' }
  ];
  let lpIdx = 0;

  window.renderLandingFormula = function() {
    const it = LP_ITEMS[lpIdx];
    const elT = document.getElementById('lpFormulaTitle');
    if (!elT) return;
    document.getElementById('lpFormulaIndex').textContent = (lpIdx + 1) + ' / ' + LP_ITEMS.length;
    elT.textContent = it.title;
    document.getElementById('lpFormulaExpr').textContent = it.expr;
    document.getElementById('lpFormulaCat').textContent = it.cat;
    document.getElementById('lpFormulaMeaning').textContent = it.meaning;
    document.getElementById('lpFormulaNote').textContent = it.note;
  };

  window.nextLandingFormula = function() {
    lpIdx = (lpIdx + 1) % LP_ITEMS.length;
    window.renderLandingFormula();
  };

  window.enterDziliApp = function(tabName) {
    const lp = document.getElementById('dziliLandingView');
    const app = document.getElementById('dziliMainApp');
    if (lp) lp.style.display = 'none';
    if (app) app.style.display = 'block';
    try { localStorage.setItem('dzili_seen_landing', '1'); } catch (e) {}
    if (tabName && typeof window.switchTab === 'function') {
      window.switchTab(tabName);
    }
    window.scrollTo(0, 0);
  };

  window.openDziliLanding = function() {
    const lp = document.getElementById('dziliLandingView');
    const app = document.getElementById('dziliMainApp');
    if (app) app.style.display = 'none';
    if (lp) lp.style.display = 'block';
    window.scrollTo(0, 0);
  };

  if (typeof window.openModal !== 'function') {
    window.openModal = function(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('open');
    };
  }
  if (typeof window.closeModals !== 'function') {
    window.closeModals = function() {
      document.querySelectorAll('.modal-backdrop.open').forEach(function(m) {
        m.classList.remove('open');
      });
    };
  }
  if (typeof window.openSettings !== 'function') {
    window.openSettings = function() {
      window.openModal('modal-settings');
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    window.renderLandingFormula();
  });
})();


(function() {
  window.openModal = window.openModal || function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  };
  window.closeModals = window.closeModals || function() {
    document.querySelectorAll('.modal-backdrop.open').forEach(function(el) {
      el.classList.remove('open');
    });
  };
  window.openSettings = window.openSettings || function() {
    window.openModal('modal-settings');
  };
  window.switchTab = window.switchTab || function(tab) {
    document.querySelectorAll('[data-tab-panel]').forEach(function(p) {
      p.style.display = (p.getAttribute('data-tab-panel') === tab) ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(function(n) {
      n.classList.toggle('active', n.getAttribute('data-tab') === tab);
    });
  };
})();
