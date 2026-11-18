if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js').catch(() => {}); }

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_SHORT = { Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', Jumat: 'Jum', Sabtu: 'Sab', Minggu: 'Min' };
const BINDER_CATS = ['Semua', 'Kalkulus', 'Aljabar', 'Statistika', 'Geometri', 'Matematika Diskrit', 'Umum'];

const MATH_SYMBOLS = {
  Kalkulus: ['∫', '∬', '∮', '∑', '∏', '∂', '∇', '∆', '∞', '→', '↦', 'lim', 'dx', 'dy', '≈', '≠'],
  Himpunan: ['∀', '∃', '∈', '∉', '⊂', '⊆', '∪', '∩', '∅', 'ℝ', 'ℤ', 'ℕ', 'ℚ', 'ℂ', '⇒', '⇔'],
  'Akar/Geo': ['√', '∛', '²', '³', 'ⁿ', '⁻¹', '±', '×', '÷', '·', '≤', '≥', '≡', '°', '∠', '⊥'],
  Yunani: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'ψ', 'ω', 'Ω']
};

const defaultData = {
  userName: 'Dzili',
  bannerMsg: 'Semangat kuliahnya hari ini! Jangan lupa minum air putih dan istirahat cukup.',
  secretPin: '2026', voucher: null,
  jadwal: [], tugas: [], binder: [], ujian: [], gpaCourses: [],
  note: '', sessions: 0, updatedAt: 0
};

let syncCfg = JSON.parse(localStorage.getItem('dzili_sync_cfg')) || { cloudUrl: '', roomId: 'dzili-01' };
let state = JSON.parse(localStorage.getItem('dzili_data')) || defaultData;
if (!state.binder) state.binder = [];
if (!state.ujian) state.ujian = [];
if (!state.gpaCourses) state.gpaCourses = [];
if (!state.secretPin) state.secretPin = '2026';

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
  document.getElementById('bentoClassCount').textContent = tc.length;
  document.getElementById('bentoClassSub').textContent = tc.length > 0 ? `Mulai ${tc[0].jam.split('-')[0].trim()}` : `Hari ${todayName} libur kelas`;
  const at = state.tugas.filter(t => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline));
  document.getElementById('bentoTaskCount').textContent = at.length;
  document.getElementById('bentoTaskSub').textContent = at.length > 0 ? `Terdekat: ${at[0].matkul}` : 'Semua tugas beres!';
}

function renderVoucher() {
  const box = document.getElementById('voucherContainer');
  if (!state.voucher || !state.voucher.title) { box.innerHTML = ''; return; }
  const v = state.voucher;
  box.innerHTML = `<div class="voucher-card ${v.claimed ? 'claimed' : ''}"><div class="voucher-info"><h4>${v.title}</h4><p>${v.desc}</p></div><button class="claim-btn" onclick="toggleClaimVoucher()">${v.claimed ? 'Sudah Diklaim' : 'Klaim'}</button></div>`;
}
function toggleClaimVoucher() {
  if (!state.voucher) return; state.voucher.claimed = !state.voucher.claimed; persist(); renderVoucher();
}

// === MATH KEYPAD & PHOTO / OCR ENGINE ===
let activeMathCat = 'Kalkulus';
function renderMathPad(containerId, targetInputId) {
  const box = document.getElementById(containerId); if (!box) return;
  const cats = Object.keys(MATH_SYMBOLS);
  box.innerHTML = `
    <div class="math-pad">
      <div class="math-tabs">
        ${cats.map(c => `<button type="button" class="math-tab ${c === activeMathCat ? 'active' : ''}" onclick="switchMathCat('${c}')">${c}</button>`).join('')}
      </div>
      <div class="math-keys">
        ${MATH_SYMBOLS[activeMathCat].map(s => `<button type="button" class="math-key" onclick="insertAtCursor('${targetInputId}', '${s}')">${s}</button>`).join('')}
      </div>
    </div>`;
}
function switchMathCat(cat) {
  activeMathCat = cat;
  renderMathPad('tugasMathPad', 'inputTugasJudul');
  renderMathPad('binderMathPad', 'inputBinderBody');
}
function insertAtCursor(elId, text) {
  const el = document.getElementById(elId); if (!el) return;
  const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  el.focus(); el.setSelectionRange(start + text.length, start + text.length);
}
function insertBinderBlock(type) {
  insertAtCursor('inputBinderBody', `\n【${type}】 `);
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 720, scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.62));
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
    document.getElementById('tugasPhotoPreview').innerHTML = tempTugasPhoto
      ? `<div class="preview-box"><img src="${tempTugasPhoto}" onclick="openLightbox(this.src)" /><button type="button" class="preview-del" onclick="tempTugasPhoto='';renderPhotoPreview('tugas')">✕</button></div>` : '';
  } else {
    document.getElementById('binderPhotoPreview').innerHTML = tempBinderPhoto
      ? `<div class="preview-box"><img src="${tempBinderPhoto}" onclick="openLightbox(this.src)" /><button type="button" class="preview-del" onclick="tempBinderPhoto='';renderPhotoPreview('binder')">✕</button></div>` : '';
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
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }
    const result = await window.Tesseract.recognize(tempBinderPhoto, 'eng', {
      logger: m => { if (m.status === 'recognizing text') statusEl.textContent = `Memindai tulisan di foto... ${Math.round(m.progress * 100)}%`; }
    });
    const clean = (result.data.text || '').trim();
    if (clean) {
      const box = document.getElementById('inputBinderBody');
      box.value = (box.value ? box.value + '\n\n' : '') + clean;
      statusEl.textContent = 'Teks dari foto berhasil disalin ke catatan!';
    } else { statusEl.textContent = 'Tulisan tidak terbaca jelas, coba foto lebih dekat & terang.'; }
  } catch (err) { statusEl.textContent = 'Gagal memindai. Pastikan koneksi internet aktif.'; }
}
// === JADWAL ===
function renderDayPills() {
  document.getElementById('dayPills').innerHTML = DAYS.map(d => `<button class="day-pill ${d === selectedDay ? 'active' : ''}" onclick="selectDay('${d}')">${DAY_SHORT[d]}</button>`).join('');
}
function selectDay(d) { selectedDay = d; document.getElementById('inputHari').value = d; renderDayPills(); renderJadwal(); }
function renderJadwal() {
  document.getElementById('selectedDayTitle').textContent = `Jadwal Hari ${selectedDay}`;
  const list = document.getElementById('jadwalList');
  const items = state.jadwal.filter(i => i.hari === selectedDay).sort((a, b) => a.jam.localeCompare(b.jam));
  if (!items.length) { list.innerHTML = `<div class="empty-state">Tidak ada jadwal kuliah di hari ${selectedDay}.</div>`; return; }
  list.innerHTML = items.map(i => `<div class="timeline-item"><div class="timeline-track"><div class="timeline-dot"></div><div class="timeline-line"></div></div><div class="card"><div class="card-main"><span class="badge">${i.jam}</span>${i.remind ? ` <span class="badge done">🔔 ${i.remind}m</span>` : ''}<div class="card-title">${i.matkul}</div><div class="card-meta">${i.ruang || '-'}</div></div><div class="card-actions"><button class="edit-btn" onclick="exportJadwalIcs(${i.id})" title="Alarm Kalender HP">📅</button><button class="edit-btn" onclick="editJadwal(${i.id})">✎</button><button class="del-btn" onclick="deleteJadwal(${i.id})">✕</button></div></div></div>`).join('');
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

// === TUGAS + DOKUMENTASI FOTO ===
function getDeadlineBadge(d, done) {
  if (done) return { text: 'Selesai', cls: 'done' }; if (!d) return { text: 'Tanpa deadline', cls: '' };
  const t = new Date(); t.setHours(0,0,0,0); const diff = Math.round((new Date(d + 'T00:00:00') - t) / 86400000);
  if (diff < 0) return { text: `Terlewat ${Math.abs(diff)} hari`, cls: 'urgent' }; if (diff === 0) return { text: 'Deadline Hari Ini!', cls: 'urgent' };
  if (diff === 1) return { text: 'Besok', cls: 'soon' }; return { text: `${diff} hari lagi (${d})`, cls: '' };
}
function renderTugas() {
  const list = document.getElementById('tugasList');
  const sorted = [...state.tugas].sort((a, b) => a.done - b.done || a.deadline.localeCompare(b.deadline));
  if (!sorted.length) { list.innerHTML = `<div class="empty-state">Belum ada tugas tercatat.</div>`; return; }
  list.innerHTML = sorted.map(t => {
    const b = getDeadlineBadge(t.deadline, t.done);
    return `<div class="card tugas-card"><div class="check-circle ${t.done ? 'checked' : ''}" onclick="toggleTugas(${t.id})">${t.done ? '✓' : ''}</div><div class="card-main"><span class="badge ${b.cls}">${b.text}</span>${t.remind && t.remind !== 'none' ? ` <span class="badge math">🔔 Pengingat</span>` : ''}<div class="card-title ${t.done ? 'completed' : ''}">${t.judul}</div><div class="card-meta">${t.matkul}</div>${t.photo ? `<img class="thumb-img" src="${t.photo}" onclick="openLightbox(this.src)" />` : ''}</div><div class="card-actions"><button class="edit-btn" onclick="exportTugasIcs(${t.id})" title="Alarm Kalender HP">📅</button><button class="edit-btn" onclick="editTugas(${t.id})">✎</button><button class="del-btn" onclick="deleteTugas(${t.id})">✕</button></div></div>`;
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
// === BUKU BINDER DIGITAL ===
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
  const items = selectedBinderCat === 'Semua' ? state.binder : state.binder.filter(b => b.cat === selectedBinderCat);
  if (!items.length) { list.innerHTML = `<div class="empty-state">Belum ada catatan di binder.<br>Tekan <b>+ Lembar Baru</b> untuk mencatat rumus atau foto papan tulis.</div>`; return; }
  list.innerHTML = [...items].reverse().map(b => `
    <div class="binder-sheet">
      <div class="binder-header">
        <div>
          <span class="badge math">${b.cat}</span> <span style="font-size:11px; color:var(--muted);">${b.date || ''}</span>
          <div class="card-title" style="margin-top:2px;">${b.title}</div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="editBinder(${b.id})">✎</button>
          <button class="del-btn" onclick="deleteBinder(${b.id})">✕</button>
        </div>
      </div>
      <div class="binder-body">${formatBinderText(b.body)}</div>
      ${b.photo ? `<img class="thumb-img" src="${b.photo}" onclick="openLightbox(this.src)" />` : ''}
    </div>
  `).join('');
}
function openAddBinder() {
  editingBinderId = null; tempBinderPhoto = '';
  document.getElementById('modalBinderTitle').textContent = 'Lembar Binder Baru';
  document.getElementById('inputBinderCat').value = selectedBinderCat === 'Semua' ? 'Kalkulus' : selectedBinderCat;
  document.getElementById('inputBinderTitle').value = '';
  document.getElementById('inputBinderBody').value = '';
  renderPhotoPreview('binder'); renderMathPad('binderMathPad', 'inputBinderBody');
  openModal('modal-binder');
}
function editBinder(id) {
  const b = state.binder.find(x => x.id === id); if (!b) return;
  editingBinderId = id; tempBinderPhoto = b.photo || '';
  document.getElementById('modalBinderTitle').textContent = 'Edit Lembar Binder';
  document.getElementById('inputBinderCat').value = b.cat || 'Umum';
  document.getElementById('inputBinderTitle').value = b.title;
  document.getElementById('inputBinderBody').value = b.body || '';
  renderPhotoPreview('binder'); renderMathPad('binderMathPad', 'inputBinderBody');
  openModal('modal-binder');
}
function saveBinder() {
  const cat = document.getElementById('inputBinderCat').value;
  const title = document.getElementById('inputBinderTitle').value.trim();
  const body = document.getElementById('inputBinderBody').value.trim();
  if (!title) return alert('Judul materi wajib diisi.');
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  if (editingBinderId !== null) {
    const idx = state.binder.findIndex(x => x.id === editingBinderId);
    if (idx !== -1) state.binder[idx] = { ...state.binder[idx], cat, title, body, photo: tempBinderPhoto };
  } else {
    state.binder.push({ id: Date.now(), cat, title, body, photo: tempBinderPhoto, date: dateStr });
  }
  persist(); renderBinder(); closeModals();
}
function deleteBinder(id) { state.binder = state.binder.filter(b => b.id !== id); persist(); renderBinder(); }

// === KALKULATOR ILMIAH ===
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
    let expr = calcStr
      .replace(/(\d+(?:\.\d+)?)!/g, (_, n) => `fact(${n})`)
      .replace(/\^/g, '**').replace(/pi/g, 'Math.PI').replace(/\be\b/g, 'Math.E')
      .replace(/sqrt\(/g, 'Math.sqrt(').replace(/abs\(/g, 'Math.abs(')
      .replace(/ln\(/g, 'Math.log(').replace(/log\(/g, 'Math.log10(')
      .replace(/sin\(/g, 'Math.sin(toRad(').replace(/cos\(/g, 'Math.cos(toRad(').replace(/tan\(/g, 'Math.tan(toRad(');
    const openDiff = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    if (openDiff > 0) expr += ')'.repeat(openDiff);
    const val = Function('toRad', 'fact', `return (${expr})`)(toRad, fact);
    document.getElementById('calcRes').textContent = Number.isFinite(val) ? Number(val.toPrecision(10)).toString() : 'Error';
  } catch (e) { document.getElementById('calcRes').textContent = 'Error'; }
}
function copyCalcRes() {
  const val = document.getElementById('calcRes').textContent;
  navigator.clipboard?.writeText(val).then(() => alert(`Hasil ${val} disalin!`));
}
let timerSeconds = 1500, currentModeMinutes = 25, timerInterval = null;
function updateTimerUI() { document.getElementById('timerDisplay').textContent = `${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`; }
function setTimerMode(m, btn) { clearInterval(timerInterval); timerInterval = null; document.getElementById('timerStartBtn').textContent = 'Mulai'; currentModeMinutes = m; timerSeconds = m * 60; document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateTimerUI(); }
function toggleTimer() {
  const btn = document.getElementById('timerStartBtn');
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; btn.textContent = 'Lanjut'; return; }
  btn.textContent = 'Jeda';
  timerInterval = setInterval(() => { timerSeconds--; updateTimerUI(); if (timerSeconds <= 0) { clearInterval(timerInterval); timerInterval = null; btn.textContent = 'Mulai'; if (currentModeMinutes === 25) { state.sessions++; persist(); document.getElementById('sessionCount').textContent = state.sessions; } alert('Waktu selesai!'); resetTimer(); } }, 1000);
}
function resetTimer() { clearInterval(timerInterval); timerInterval = null; document.getElementById('timerStartBtn').textContent = 'Mulai'; timerSeconds = currentModeMinutes * 60; updateTimerUI(); }
const noteEl = document.getElementById('quickNote'); noteEl.addEventListener('input', () => { state.note = noteEl.value; persist(); });

function renderUjian() {
  const list = document.getElementById('ujianList'), sorted = [...state.ujian].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  if (!sorted.length) { list.innerHTML = `<div class="empty-state">Belum ada jadwal ujian.</div>`; return; }
  const today = new Date(); today.setHours(0,0,0,0);
  list.innerHTML = sorted.map(u => { const diff = Math.round((new Date(u.tanggal + 'T00:00:00') - today) / 86400000); let bt = `H-${diff} (${u.tanggal})`, bc = ''; if (diff < 0) { bt = 'Selesai'; bc = 'done'; } else if (diff === 0) { bt = 'HARI INI!'; bc = 'urgent'; } else if (diff <= 3) { bt = `H-${diff} • Segera!`; bc = 'soon'; } return `<div class="card tugas-card"><div class="card-main"><span class="badge ${bc}">${bt}</span><div class="card-title">${u.nama}</div><div class="card-meta">${u.info || '-'}</div></div><div class="card-actions"><button class="edit-btn" onclick="editUjian(${u.id})">✎</button><button class="del-btn" onclick="deleteUjian(${u.id})">✕</button></div></div>`; }).join('');
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
  document.getElementById('gpaRowsContainer').innerHTML = state.gpaCourses.map(c => { const s = Number(c.sks)||0, g = Number(c.grade)||0; sks += s; pts += s * g; return `<div class="gpa-row"><input type="text" value="${c.name}" placeholder="Matkul" onchange="updateGpa(${c.id},'name',this.value)" /><input type="number" min="1" max="6" value="${c.sks}" onchange="updateGpa(${c.id},'sks',this.value)" /><select onchange="updateGpa(${c.id},'grade',this.value)">${GRADES.map(x => `<option value="${x.val}" ${Number(c.grade)===x.val?'selected':''}>${x.label}</option>`).join('')}</select><button class="del-btn" onclick="deleteGpaRow(${c.id})" style="padding:2px;">✕</button></div>`; }).join('');
  document.getElementById('totalSksText').textContent = sks; document.getElementById('ipsResultText').textContent = sks > 0 ? (pts / sks).toFixed(2) : '0.00';
}
function addGpaRow() { state.gpaCourses.push({ id: Date.now(), name: '', sks: 3, grade: 4.0 }); persist(); renderGpa(); }
function updateGpa(id, f, v) { const r = state.gpaCourses.find(c => c.id === id); if (r) r[f] = f === 'name' ? v : Number(v); persist(); renderGpa(); }
function deleteGpaRow(id) { state.gpaCourses = state.gpaCourses.filter(c => c.id !== id); persist(); renderGpa(); }

let tapCount = 0, tapTimer = null;
function handleSecretTap() { tapCount++; clearTimeout(tapTimer); tapTimer = setTimeout(() => { tapCount = 0; }, 1500); if (tapCount >= 5) { tapCount = 0; document.getElementById('inputSecretPin').value = ''; openModal('modal-pin'); } }
function verifyPin() {
  if (document.getElementById('inputSecretPin').value.trim() === (state.secretPin || '2026')) {
    closeModals(); document.getElementById('secretBannerInput').value = state.bannerMsg || '';
    document.getElementById('secretVoucherTitle').value = state.voucher ? state.voucher.title : '';
    document.getElementById('secretVoucherDesc').value = state.voucher ? state.voucher.desc : ''; document.getElementById('secretFortuneInput').value = state.customFortune || '';
    document.getElementById('secretNewPin').value = ''; openModal('modal-secret');
  } else { alert('PIN salah!'); document.getElementById('inputSecretPin').value = ''; }
}
function applyAndPushSecret() {
  const msg = document.getElementById('secretBannerInput').value.trim(), vTitle = document.getElementById('secretVoucherTitle').value.trim(), vDesc = document.getElementById('secretVoucherDesc').value.trim(), newPin = document.getElementById('secretNewPin').value.trim();
  if (newPin.length >= 4) state.secretPin = newPin; if (msg) state.bannerMsg = msg;
  state.voucher = vTitle ? { title: vTitle, desc: vDesc || 'Hadiah spesial buat kamu!', claimed: false } : null; state.customFortune = document.getElementById('secretFortuneInput').value.trim();
  persist(); renderHeader(); closeModals();
  if (syncCfg.cloudUrl) { pushToCloud(); alert('Kejutan tersimpan & otomatis terkirim ke HP Dzili!'); }
}
function copyGiftLink() {
  const msg = document.getElementById('secretBannerInput').value.trim(), vTitle = document.getElementById('secretVoucherTitle').value.trim(), vDesc = document.getElementById('secretVoucherDesc').value.trim();
  const giftUrl = `${window.location.origin}${window.location.pathname}#gift=${btoa(encodeURIComponent(JSON.stringify({ msg, vTitle, vDesc })))}`;
  navigator.clipboard?.writeText(giftUrl).then(() => { alert('Link kejutan disalin!'); closeModals(); }).catch(() => prompt('Salin link ini:', giftUrl));
}
function switchTab(t) { document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); document.getElementById(`nav-${t}`)?.classList.add('active'); }
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModals() { editingJadwalId = null; editingTugasId = null; editingBinderId = null; editingUjianId = null; document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open')); }
function backdropClose(e, id) { if (e.target.id === id) closeModals(); }
function openSettings() { document.getElementById('inputUserName').value = state.userName; document.getElementById('inputBannerMsg').value = state.bannerMsg; document.getElementById('inputCloudUrl').value = syncCfg.cloudUrl || ''; document.getElementById('inputSyncRoom').value = syncCfg.roomId || 'dzili-01'; openModal('modal-settings'); }
function saveSettings() {
  const name = document.getElementById('inputUserName').value.trim(), msg = document.getElementById('inputBannerMsg').value.trim(), url = document.getElementById('inputCloudUrl').value.trim(), room = document.getElementById('inputSyncRoom').value.trim() || 'dzili-01';
  if (name) state.userName = name; if (msg) state.bannerMsg = msg; syncCfg = { cloudUrl: url, roomId: room }; localStorage.setItem('dzili_sync_cfg', JSON.stringify(syncCfg));
  persist(); renderHeader(); closeModals(); if (url) pullFromCloud(true);
}
function manualSyncNow() { const url = document.getElementById('inputCloudUrl').value.trim(), room = document.getElementById('inputSyncRoom').value.trim() || 'dzili-01'; if (!url) return alert('Isi URL Firebase terlebih dahulu.'); syncCfg = { cloudUrl: url, roomId: room }; localStorage.setItem('dzili_sync_cfg', JSON.stringify(syncCfg)); pullFromCloud(true); alert('Sinkronisasi dijalankan!'); }
function copySyncLink() { const url = document.getElementById('inputCloudUrl').value.trim(), room = document.getElementById('inputSyncRoom').value.trim() || 'dzili-01'; if (!url) return alert('Isi URL Firebase terlebih dahulu.'); const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${btoa(encodeURIComponent(JSON.stringify({ url, room })))}`; navigator.clipboard?.writeText(syncUrl).then(() => alert('Link Setup 2 HP disalin!')).catch(() => prompt('Salin link ini:', syncUrl)); }
function redeemGiftPrompt() { const raw = prompt('Tempel link kejutan:'); if (!raw) return; const idx = raw.indexOf('#gift='); if (idx === -1) return alert('Format link tidak valid.'); try { const p = JSON.parse(decodeURIComponent(atob(raw.slice(idx + 6).trim()))); if (p.msg) state.bannerMsg = p.msg; if (p.vTitle) state.voucher = { title: p.vTitle, desc: p.vDesc || 'Hadiah spesial!', claimed: false }; persist(); renderAll(); closeModals(); alert('Kejutan berhasil dipasang!'); } catch (e) { alert('Gagal membaca link.'); } }

function renderAll() {
  noteEl.value = state.note || ''; document.getElementById('sessionCount').textContent = state.sessions || 0;
  renderHeader(); renderDayPills(); renderJadwal(); renderTugas(); renderBinderFilters(); renderBinder(); renderUjian(); renderGpa();
}
checkIncomingLinks(); document.getElementById('inputHari').value = selectedDay; renderAll(); if (syncCfg.cloudUrl) pullFromCloud();
document.addEventListener('visibilitychange', () => { if (!document.hidden && syncCfg.cloudUrl) pullFromCloud(); });
setInterval(() => { if (!document.hidden && syncCfg.cloudUrl) pullFromCloud(); }, 15000);

// === SISTEM NOTIFIKASI & ALARM KALENDER ===
async function requestNotifPermission() {
  if (!('Notification' in window)) return alert('Browser ini tidak mendukung notifikasi web. Gunakan tombol 📅 di kartu matkul/tugas untuk alarm Kalender HP.');
  const res = await Notification.requestPermission();
  updateNotifBtnLabel();
  if (res === 'granted') {
    triggerReminderAlert('Notifikasi Dzili Aktif!', 'Pengingat jadwal kuliah dan deadline tugas siap berjalan.');
  } else {
    alert('Izin notifikasi ditolak. Aktifkan lewat Pengaturan HP atau gunakan tombol 📅 di tiap matkul/tugas.');
  }
}

function updateNotifBtnLabel() {
  const btn = document.getElementById('btnEnableNotif');
  if (!btn || !('Notification' in window)) return;
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
    navigator.serviceWorker?.ready.then(reg => {
      reg.showNotification(title, { body, icon: './icon-180.png', badge: './icon-180.png', tag: title });
    }).catch(() => { try { new Notification(title, { body, icon: './icon-180.png' }); } catch (e) {} });
  }
}

function checkReminders() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let log = JSON.parse(localStorage.getItem('dzili_notified') || '{}');
  let changed = false;

  state.jadwal.filter(j => j.hari === todayName && Number(j.remind) > 0).forEach(j => {
    const m = (j.jam || '').match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return;
    const startMins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const diff = startMins - nowMins;
    const key = `j_${j.id}_${todayStr}_${j.remind}`;
    if (diff >= 0 && diff <= Number(j.remind) && !log[key]) {
      log[key] = true; changed = true;
      triggerReminderAlert(`Kuliah ${j.matkul}`, `Mulai ${diff === 0 ? 'sekarang' : diff + ' menit lagi'} (${j.jam}) • ${j.ruang || ''}`);
    }
  });

  const todayZero = new Date(); todayZero.setHours(0,0,0,0);
  state.tugas.filter(t => !t.done && t.deadline && t.remind && t.remind !== 'none').forEach(t => {
    const diffDays = Math.round((new Date(t.deadline + 'T00:00:00') - todayZero) / 86400000);
    const shouldAlert = (t.remind === 'h0' && diffDays === 0) ||
                        (t.remind === 'h1' && (diffDays === 1 || diffDays === 0)) ||
                        (t.remind === 'h3' && (diffDays === 3 || diffDays === 1 || diffDays === 0));
    const key = `t_${t.id}_${todayStr}_${diffDays}`;
    if (shouldAlert && now.getHours() >= 7 && !log[key]) {
      log[key] = true; changed = true;
      const waktu = diffDays === 0 ? 'HARI INI!' : `H-${diffDays} (${t.deadline})`;
      triggerReminderAlert(`Pengingat Tugas: ${t.matkul}`, `${t.judul} — Deadline ${waktu}`);
    }
  });

  if (changed) localStorage.setItem('dzili_notified', JSON.stringify(log));
}

function downloadIcsFile(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

function exportJadwalIcs(id) {
  const j = state.jadwal.find(x => x.id === id); if (!j) return;
  const dayMap = { Senin: [1,'MO'], Selasa: [2,'TU'], Rabu: [3,'WE'], Kamis: [4,'TH'], Jumat: [5,'FR'], Sabtu: [6,'SA'], Minggu: [0,'SU'] };
  const [targetDow, byDay] = dayMap[j.hari] || [1,'MO'];
  const times = (j.jam || '08:00').match(/(\d{1,2})[:.](\d{2})/g) || ['08:00'];
  const [sh, sm] = times[0].split(/[:.]/).map(Number);
  const [eh, em] = times[1] ? times[1].split(/[:.]/).map(Number) : [sh + 1, sm];
  const d = new Date();
  const addDays = (targetDow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + addDays);
  const pad = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const mins = Number(j.remind) || 15;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dzili//Planner//ID',
    'BEGIN:VEVENT', `UID:dzili-j-${j.id}@dzili.app`,
    `DTSTART:${ymd}T${pad(sh)}${pad(sm)}00`, `DTEND:${ymd}T${pad(eh)}${pad(em)}00`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
    `SUMMARY:Kuliah ${j.matkul}`, `LOCATION:${j.ruang || ''}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Pengingat Kuliah', `TRIGGER:-PT${mins}M`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  downloadIcsFile(`Kuliah-${j.matkul.replace(/\s+/g,'-')}.ics`, ics);
}

function exportTugasIcs(id) {
  const t = state.tugas.find(x => x.id === id); if (!t || !t.deadline) return alert('Isi tanggal deadline tugas terlebih dahulu.');
  const ymd = t.deadline.replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dzili//Planner//ID',
    'BEGIN:VEVENT', `UID:dzili-t-${t.id}@dzili.app`,
    `DTSTART:${ymd}T073000`, `DTEND:${ymd}T080000`,
    `SUMMARY:Deadline Tugas ${t.matkul}: ${t.judul}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Deadline Tugas', 'TRIGGER:-PT0M', 'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:H-1 Tugas', 'TRIGGER:-P1D', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  downloadIcsFile(`Tugas-${t.matkul.replace(/\s+/g,'-')}.ics`, ics);
}

updateNotifBtnLabel();
setTimeout(checkReminders, 1500);
setInterval(checkReminders, 30000);

// === FORTUNE COOKIE HIBURAN ===
const FORTUNES = [
  { tag: 'Ramalan Kuliah', text: 'Hari ini dosen akan selesai menjelaskan 10 menit lebih awal. Aamiin paling kencang!' },
  { tag: 'Tebak-Tebakan', text: 'Kenapa buku matematika selalu kelihatan sedih? Karena punya banyak masalah. Untung kamu jago nyelesainnya!' },
  { tag: 'Pesan Manis', text: 'Rumus kebahagiaan hari ini: Istirahat cukup + Minum air putih + Senyum manis kamu.' },
  { tag: 'Hoki Hari Ini', text: 'Kamu akan menemukan jawaban soal yang sempat bikin bingung tepat setelah minum sesuatu yang segar.' },
  { tag: 'Receh Dikit', text: 'Apa bedanya kamu sama integral tentu? Kalau integral tentu ada batasnya, kalau cantiknya kamu tak terhingga.' },
  { tag: 'Mood Booster', text: 'Nggak apa-apa jalan pelan, yang penting nggak mundur. Kamu sudah hebat banget sejauh ini!' },
  { tag: 'Ramalan Jajan', text: 'Seseorang di sekitar sini diam-diam ingin mentraktir kamu kopi atau matcha minggu ini.' },
  { tag: 'Tebak-Tebakan', text: 'Angka berapa yang paling romantis? Angka 2, soalnya kalau sendiri sepi, kalau berdua jadi asyik.' },
  { tag: 'Pengingat Lembut', text: 'Bahu tegang? Tarik napas 4 detik, embuskan pelan. Tugasnya nggak akan kabur kok, santai dulu 2 menit.' },
  { tag: 'Hoki Akademik', text: 'Materi yang baru saja kamu baca punya peluang 87,4% muncul di kuis atau ujian nanti!' },
  { tag: 'Receh Dikit', text: 'Sudut apa yang paling hangat? Bukan sudut 90 derajat, tapi sudut bibir kamu pas lagi senyum.' },
  { tag: 'Ramalan Hari Ini', text: 'Hari ini antrean makan siangmu bakal lancar dan dapat tempat duduk paling nyaman.' },
  { tag: 'Tebak-Tebakan', text: 'Kenapa garis sejajar nggak pernah ketemu? Soalnya mereka belum install aplikasi Dzili.' },
  { tag: 'Pesan Spesial', text: 'Kalau hari ini terasa berat, ingat: ada seseorang yang selalu bangga sama setiap usaha kecilmu.' },
  { tag: 'Hoki Hari Ini', text: 'Baterai HP dan baterai semangatmu akan awet sampai kelas terakhir selesai!' }
];

let cookieTaps = 0, cookieOpened = false, currentFortune = null;

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

function tapFortuneCookie() {
  if (cookieOpened) return;
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
  if (state.customFortune && state.customFortune.trim()) {
    currentFortune = { tag: '✨ Pesan Rahasia Spesial', text: state.customFortune.trim() };
  } else {
    currentFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  }
  renderFortuneCookie();
}

function resetFortuneCookie() {
  cookieTaps = 0; cookieOpened = false; currentFortune = null;
  renderFortuneCookie();
}

function renderFortuneCookie() {
  const box = document.getElementById('fortuneCookieBox');
  if (!box) return;
  if (!cookieOpened) {
    box.innerHTML = `
      <div class="cookie-stage" onclick="tapFortuneCookie()">
        <svg id="cookieSvg" class="cookie-svg" viewBox="0 0 120 96">
          <path d="M22 64 C14 40, 38 14, 64 16 C88 18, 108 42, 98 66 C90 80, 72 72, 60 56 C48 72, 30 80, 22 64 Z" fill="#F2CC8F" stroke="#D9A05B" stroke-width="3"/>
          <path d="M44 48 Q60 36 76 48" fill="none" stroke="#C6883E" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="38" cy="36" r="2" fill="#D9A05B"/><circle cx="82" cy="38" r="2" fill="#D9A05B"/>
        </svg>
        <div class="cookie-hint" id="cookieHint">Ketuk kuenya 3x untuk melihat isi keberuntunganmu</div>
      </div>`;
  } else {
    const nums = [Math.floor(Math.random()*9)+1, Math.floor(Math.random()*20)+10, ['π', 'e', 'φ', '∞'][Math.floor(Math.random()*4)]];
    box.innerHTML = `
      <div class="fortune-paper">
        <span class="fortune-tag">${currentFortune.tag}</span>
        <div class="fortune-text">"${currentFortune.text}"</div>
        <div class="fortune-lucky">Angka hoki: ${nums.join(' • ')}</div>
      </div>
      <button class="btn-secondary" style="padding:8px 16px; font-size:12.5px;" onclick="resetFortuneCookie()">Buka Kue Lain</button>`;
  }
}

renderFortuneCookie();
