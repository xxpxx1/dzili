if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_SHORT = { Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', Jumat: 'Jum', Sabtu: 'Sab', Minggu: 'Min' };

const defaultData = {
  userName: 'Dzili',
  bannerMsg: 'Semangat kuliahnya hari ini! Jangan lupa minum air putih dan istirahat cukup.',
  secretPin: '2026',
  voucher: null,
  jadwal: [
    { id: 1, hari: 'Senin', matkul: 'Pengantar Sistem Informasi', jam: '08:00 - 09:40', ruang: 'Gedung A - R.201' },
    { id: 2, hari: 'Senin', matkul: 'Bahasa Inggris Akademik', jam: '10:00 - 11:40', ruang: 'Gedung B - R.104' }
  ],
  tugas: [
    { id: 101, matkul: 'Sistem Informasi', judul: 'Rangkuman Bab 1 (Contoh Tugas)', deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], done: false }
  ],
  ujian: [
    { id: 201, nama: 'UTS Sistem Informasi', tanggal: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], info: '08:00 • Ruang Ujian 1' }
  ],
  gpaCourses: [
    { id: 301, name: 'Sistem Informasi', sks: 3, grade: 4.0 },
    { id: 302, name: 'Bahasa Inggris', sks: 2, grade: 3.5 }
  ],
  note: '',
  sessions: 0
};

let state = JSON.parse(localStorage.getItem('dzili_data')) || defaultData;
if (!state.ujian) state.ujian = defaultData.ujian;
if (!state.gpaCourses) state.gpaCourses = defaultData.gpaCourses;
if (!state.secretPin) state.secretPin = '2026';

function persist() {
  localStorage.setItem('dzili_data', JSON.stringify(state));
  renderBento();
}

function checkIncomingGift() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#gift=')) {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
      if (payload.msg) state.bannerMsg = payload.msg;
      if (payload.vTitle) {
        state.voucher = { title: payload.vTitle, desc: payload.vDesc || 'Hadiah spesial buat kamu!', claimed: false };
      }
      persist();
      history.replaceState(null, '', window.location.pathname + window.location.search);
      setTimeout(() => alert('Ada pesan & kejutan baru buat kamu di Dzili! ✨'), 350);
    } catch (e) {}
  }
}

const jsDay = new Date().getDay();
const todayName = jsDay === 0 ? 'Minggu' : DAYS[jsDay - 1];
let selectedDay = todayName;
let editingJadwalId = null, editingTugasId = null, editingUjianId = null;
function renderHeader() {
  const hour = new Date().getHours();
  let salam = 'Selamat Malam';
  if (hour < 11) salam = 'Selamat Pagi';
  else if (hour < 15) salam = 'Selamat Siang';
  else if (hour < 18) salam = 'Selamat Sore';

  document.getElementById('greetingText').textContent = `${salam}, ${state.userName}!`;
  document.getElementById('todayDateText').textContent = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('dailyBanner').textContent = state.bannerMsg;
  renderVoucher();
  renderBento();
}

function renderBento() {
  const todayClasses = state.jadwal.filter(j => j.hari === todayName).sort((a, b) => a.jam.localeCompare(b.jam));
  document.getElementById('bentoClassCount').textContent = todayClasses.length;
  document.getElementById('bentoClassSub').textContent = todayClasses.length > 0
    ? `Mulai ${todayClasses[0].jam.split('-')[0].trim()}`
    : `Hari ${todayName} libur kelas`;

  const activeTasks = state.tugas.filter(t => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline));
  document.getElementById('bentoTaskCount').textContent = activeTasks.length;
  document.getElementById('bentoTaskSub').textContent = activeTasks.length > 0
    ? `Terdekat: ${activeTasks[0].matkul}`
    : 'Semua tugas beres!';
}

function renderVoucher() {
  const box = document.getElementById('voucherContainer');
  if (!state.voucher || !state.voucher.title) { box.innerHTML = ''; return; }
  const v = state.voucher;
  box.innerHTML = `
    <div class="voucher-card ${v.claimed ? 'claimed' : ''}">
      <div class="voucher-info"><h4>${v.title}</h4><p>${v.desc}</p></div>
      <button class="claim-btn" onclick="toggleClaimVoucher()">${v.claimed ? 'Sudah Diklaim ✓' : 'Klaim'}</button>
    </div>
  `;
}

function toggleClaimVoucher() {
  if (!state.voucher) return;
  state.voucher.claimed = !state.voucher.claimed;
  persist(); renderVoucher();
  if (state.voucher.claimed) alert('Voucher berhasil diklaim! Screenshot layar ini dan tunjukkan untuk menukarnya 😊');
}

// === KUNCI PIN & PANEL KEJUTAN ===
let tapCount = 0, tapTimer = null;
function handleSecretTap() {
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 1500);
  if (tapCount >= 5) {
    tapCount = 0;
    document.getElementById('inputSecretPin').value = '';
    openModal('modal-pin');
  }
}

function verifyPin() {
  const entered = document.getElementById('inputSecretPin').value.trim();
  if (entered === (state.secretPin || '2026')) {
    closeModals();
    document.getElementById('secretBannerInput').value = state.bannerMsg || '';
    document.getElementById('secretVoucherTitle').value = state.voucher ? state.voucher.title : '';
    document.getElementById('secretVoucherDesc').value = state.voucher ? state.voucher.desc : '';
    document.getElementById('secretNewPin').value = '';
    openModal('modal-secret');
  } else {
    alert('PIN salah!');
    document.getElementById('inputSecretPin').value = '';
  }
}

function saveNewPinIfAny() {
  const newPin = document.getElementById('secretNewPin').value.trim();
  if (newPin.length >= 4) state.secretPin = newPin;
}

function applySecretLocal() {
  const msg = document.getElementById('secretBannerInput').value.trim();
  const vTitle = document.getElementById('secretVoucherTitle').value.trim();
  const vDesc = document.getElementById('secretVoucherDesc').value.trim();
  saveNewPinIfAny();
  if (msg) state.bannerMsg = msg;
  state.voucher = vTitle ? { title: vTitle, desc: vDesc || 'Hadiah spesial buat kamu!', claimed: false } : null;
  persist(); renderHeader(); closeModals();
}

function copyGiftLink() {
  const msg = document.getElementById('secretBannerInput').value.trim();
  const vTitle = document.getElementById('secretVoucherTitle').value.trim();
  const vDesc = document.getElementById('secretVoucherDesc').value.trim();
  saveNewPinIfAny(); persist();
  const encoded = btoa(encodeURIComponent(JSON.stringify({ msg, vTitle, vDesc })));
  const giftUrl = `${window.location.origin}${window.location.pathname}#gift=${encoded}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(giftUrl).then(() => {
      alert('Link kejutan berhasil disalin! Tinggal paste dan kirim ke dia.');
      closeModals();
    }).catch(() => prompt('Salin link kejutan ini:', giftUrl));
  } else {
    prompt('Salin link kejutan ini:', giftUrl);
  }
}
function renderDayPills() {
  document.getElementById('dayPills').innerHTML = DAYS.map(day => `
    <button class="day-pill ${day === selectedDay ? 'active' : ''}" onclick="selectDay('${day}')">${DAY_SHORT[day]}</button>
  `).join('');
}

function selectDay(day) {
  selectedDay = day;
  document.getElementById('inputHari').value = day;
  renderDayPills();
  renderJadwal();
}

function renderJadwal() {
  document.getElementById('selectedDayTitle').textContent = `Jadwal Hari ${selectedDay}`;
  const list = document.getElementById('jadwalList');
  const items = state.jadwal.filter(item => item.hari === selectedDay).sort((a, b) => a.jam.localeCompare(b.jam));
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-state">Tidak ada jadwal kuliah di hari ${selectedDay}.<br>Waktunya istirahat atau cicil tugas!</div>`;
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="timeline-item">
      <div class="timeline-track">
        <div class="timeline-dot"></div>
        <div class="timeline-line"></div>
      </div>
      <div class="card">
        <div class="card-main">
          <span class="badge">🕒 ${item.jam}</span>
          <div class="card-title">${item.matkul}</div>
          <div class="card-meta">📍 ${item.ruang || 'Ruang belum diisi'}</div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="editJadwal(${item.id})">✎</button>
          <button class="del-btn" onclick="deleteJadwal(${item.id})">✕</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddJadwal() {
  editingJadwalId = null;
  document.getElementById('modalJadwalTitle').textContent = 'Tambah Mata Kuliah';
  document.getElementById('inputHari').value = selectedDay;
  document.getElementById('inputMatkul').value = '';
  document.getElementById('inputJam').value = '';
  document.getElementById('inputRuang').value = '';
  openModal('modal-jadwal');
}

function editJadwal(id) {
  const item = state.jadwal.find(i => i.id === id);
  if (!item) return;
  editingJadwalId = id;
  document.getElementById('modalJadwalTitle').textContent = 'Edit Mata Kuliah';
  document.getElementById('inputHari').value = item.hari;
  document.getElementById('inputMatkul').value = item.matkul;
  document.getElementById('inputJam').value = item.jam;
  document.getElementById('inputRuang').value = item.ruang || '';
  openModal('modal-jadwal');
}

function saveJadwal() {
  const hari = document.getElementById('inputHari').value;
  const matkul = document.getElementById('inputMatkul').value.trim();
  const jam = document.getElementById('inputJam').value.trim();
  const ruang = document.getElementById('inputRuang').value.trim();
  if (!matkul || !jam) return alert('Nama mata kuliah dan jam wajib diisi.');
  if (editingJadwalId !== null) {
    const idx = state.jadwal.findIndex(i => i.id === editingJadwalId);
    if (idx !== -1) state.jadwal[idx] = { ...state.jadwal[idx], hari, matkul, jam, ruang };
  } else {
    state.jadwal.push({ id: Date.now(), hari, matkul, jam, ruang });
  }
  persist(); selectDay(hari); closeModals();
}

function deleteJadwal(id) {
  state.jadwal = state.jadwal.filter(i => i.id !== id);
  persist(); renderJadwal();
}
function getDeadlineBadge(deadlineStr, isDone) {
  if (isDone) return { text: 'Selesai', cls: 'done' };
  if (!deadlineStr) return { text: 'Tanpa deadline', cls: '' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((new Date(deadlineStr + 'T00:00:00') - today) / 86400000);
  if (diffDays < 0) return { text: `Terlewat ${Math.abs(diffDays)} hari`, cls: 'urgent' };
  if (diffDays === 0) return { text: 'Deadline Hari Ini!', cls: 'urgent' };
  if (diffDays === 1) return { text: 'Besok', cls: 'soon' };
  return { text: `${diffDays} hari lagi (${deadlineStr})`, cls: '' };
}

function renderTugas() {
  const list = document.getElementById('tugasList');
  const sorted = [...state.tugas].sort((a, b) => a.done - b.done || a.deadline.localeCompare(b.deadline));
  if (sorted.length === 0) { list.innerHTML = `<div class="empty-state">Belum ada tugas tercatat.</div>`; return; }
  list.innerHTML = sorted.map(t => {
    const b = getDeadlineBadge(t.deadline, t.done);
    return `
      <div class="card tugas-card">
        <div class="check-circle ${t.done ? 'checked' : ''}" onclick="toggleTugas(${t.id})">${t.done ? '✓' : ''}</div>
        <div class="card-main">
          <span class="badge ${b.cls}">${b.text}</span>
          <div class="card-title ${t.done ? 'completed' : ''}">${t.judul}</div>
          <div class="card-meta">📘 ${t.matkul}</div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="editTugas(${t.id})">✎</button>
          <button class="del-btn" onclick="deleteTugas(${t.id})">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddTugas() {
  editingTugasId = null;
  document.getElementById('modalTugasTitle').textContent = 'Tambah Tugas Kuliah';
  document.getElementById('inputTugasMatkul').value = '';
  document.getElementById('inputTugasJudul').value = '';
  document.getElementById('inputTugasDeadline').value = '';
  openModal('modal-tugas');
}

function editTugas(id) {
  const item = state.tugas.find(t => t.id === id);
  if (!item) return;
  editingTugasId = id;
  document.getElementById('modalTugasTitle').textContent = 'Edit Tugas Kuliah';
  document.getElementById('inputTugasMatkul').value = item.matkul;
  document.getElementById('inputTugasJudul').value = item.judul;
  document.getElementById('inputTugasDeadline').value = item.deadline || '';
  openModal('modal-tugas');
}

function saveTugas() {
  const matkul = document.getElementById('inputTugasMatkul').value.trim();
  const judul = document.getElementById('inputTugasJudul').value.trim();
  const deadline = document.getElementById('inputTugasDeadline').value;
  if (!matkul || !judul) return alert('Mata kuliah dan deskripsi tugas wajib diisi.');
  if (editingTugasId !== null) {
    const idx = state.tugas.findIndex(t => t.id === editingTugasId);
    if (idx !== -1) state.tugas[idx] = { ...state.tugas[idx], matkul, judul, deadline };
  } else {
    state.tugas.push({ id: Date.now(), matkul, judul, deadline, done: false });
  }
  persist(); renderTugas(); closeModals();
}

function toggleTugas(id) {
  const item = state.tugas.find(t => t.id === id);
  if (item) item.done = !item.done;
  persist(); renderTugas();
}

function deleteTugas(id) {
  state.tugas = state.tugas.filter(t => t.id !== id);
  persist(); renderTugas();
}
let timerSeconds = 25 * 60, currentModeMinutes = 25, timerInterval = null;
function updateTimerUI() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
}
function setTimerMode(mins, btn) {
  clearInterval(timerInterval); timerInterval = null;
  document.getElementById('timerStartBtn').textContent = 'Mulai';
  currentModeMinutes = mins; timerSeconds = mins * 60;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); updateTimerUI();
}
function toggleTimer() {
  const btn = document.getElementById('timerStartBtn');
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; btn.textContent = 'Lanjut'; return; }
  btn.textContent = 'Jeda';
  timerInterval = setInterval(() => {
    timerSeconds--; updateTimerUI();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval); timerInterval = null; btn.textContent = 'Mulai';
      if (currentModeMinutes === 25) {
        state.sessions++; persist();
        document.getElementById('sessionCount').textContent = state.sessions;
      }
      alert('Waktu selesai! Kerja bagus, istirahat sebentar ya.'); resetTimer();
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval); timerInterval = null;
  document.getElementById('timerStartBtn').textContent = 'Mulai';
  timerSeconds = currentModeMinutes * 60; updateTimerUI();
}

const noteEl = document.getElementById('quickNote');
noteEl.value = state.note || '';
noteEl.addEventListener('input', () => { state.note = noteEl.value; persist(); });

function renderUjian() {
  const list = document.getElementById('ujianList');
  const sorted = [...state.ujian].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  if (sorted.length === 0) { list.innerHTML = `<div class="empty-state">Belum ada jadwal ujian.</div>`; return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  list.innerHTML = sorted.map(u => {
    const diff = Math.round((new Date(u.tanggal + 'T00:00:00') - today) / 86400000);
    let badgeText = `H-${diff} (${u.tanggal})`, badgeCls = '';
    if (diff < 0) { badgeText = 'Selesai'; badgeCls = 'done'; }
    else if (diff === 0) { badgeText = 'HARI INI!'; badgeCls = 'urgent'; }
    else if (diff <= 3) { badgeText = `H-${diff} • Segera!`; badgeCls = 'soon'; }
    return `
      <div class="card tugas-card">
        <div class="card-main">
          <span class="badge ${badgeCls}">⏳ ${badgeText}</span>
          <div class="card-title">${u.nama}</div>
          <div class="card-meta">📌 ${u.info || 'Info ruang belum diisi'}</div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="editUjian(${u.id})">✎</button>
          <button class="del-btn" onclick="deleteUjian(${u.id})">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddUjian() {
  editingUjianId = null; document.getElementById('modalUjianTitle').textContent = 'Tambah Jadwal Ujian';
  document.getElementById('inputUjianNama').value = ''; document.getElementById('inputUjianTanggal').value = '';
  document.getElementById('inputUjianInfo').value = ''; openModal('modal-ujian');
}
function editUjian(id) {
  const item = state.ujian.find(u => u.id === id); if (!item) return;
  editingUjianId = id; document.getElementById('modalUjianTitle').textContent = 'Edit Jadwal Ujian';
  document.getElementById('inputUjianNama').value = item.nama; document.getElementById('inputUjianTanggal').value = item.tanggal;
  document.getElementById('inputUjianInfo').value = item.info || ''; openModal('modal-ujian');
}
function saveUjian() {
  const nama = document.getElementById('inputUjianNama').value.trim();
  const tanggal = document.getElementById('inputUjianTanggal').value;
  const info = document.getElementById('inputUjianInfo').value.trim();
  if (!nama || !tanggal) return alert('Nama ujian dan tanggal wajib diisi.');
  if (editingUjianId !== null) {
    const idx = state.ujian.findIndex(u => u.id === editingUjianId);
    if (idx !== -1) state.ujian[idx] = { ...state.ujian[idx], nama, tanggal, info };
  } else { state.ujian.push({ id: Date.now(), nama, tanggal, info }); }
  persist(); renderUjian(); closeModals();
}
function deleteUjian(id) { state.ujian = state.ujian.filter(u => u.id !== id); persist(); renderUjian(); }

const GRADES = [
  { label: 'A (4.0)', val: 4.0 }, { label: 'AB (3.5)', val: 3.5 }, { label: 'B (3.0)', val: 3.0 },
  { label: 'BC (2.5)', val: 2.5 }, { label: 'C (2.0)', val: 2.0 }, { label: 'D (1.0)', val: 1.0 }, { label: 'E (0.0)', val: 0.0 }
];
function renderGpa() {
  let totalSks = 0, totalPoints = 0;
  document.getElementById('gpaRowsContainer').innerHTML = state.gpaCourses.map(c => {
    const sks = Number(c.sks) || 0, grade = Number(c.grade) || 0;
    totalSks += sks; totalPoints += sks * grade;
    return `
      <div class="gpa-row">
        <input type="text" value="${c.name}" placeholder="Nama Matkul" onchange="updateGpa(${c.id}, 'name', this.value)" />
        <input type="number" min="1" max="6" value="${c.sks}" onchange="updateGpa(${c.id}, 'sks', this.value)" />
        <select onchange="updateGpa(${c.id}, 'grade', this.value)">
          ${GRADES.map(g => `<option value="${g.val}" ${Number(c.grade) === g.val ? 'selected' : ''}>${g.label}</option>`).join('')}
        </select>
        <button class="del-btn" onclick="deleteGpaRow(${c.id})" style="padding:2px;">✕</button>
      </div>
    `;
  }).join('');
  document.getElementById('totalSksText').textContent = totalSks;
  document.getElementById('ipsResultText').textContent = totalSks > 0 ? (totalPoints / totalSks).toFixed(2) : '0.00';
}
function addGpaRow() { state.gpaCourses.push({ id: Date.now(), name: '', sks: 3, grade: 4.0 }); persist(); renderGpa(); }
function updateGpa(id, field, val) { const r = state.gpaCourses.find(c => c.id === id); if (r) r[field] = field === 'name' ? val : Number(val); persist(); renderGpa(); }
function deleteGpaRow(id) { state.gpaCourses = state.gpaCourses.filter(c => c.id !== id); persist(); renderGpa(); }

function switchTab(tabName) {
  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${tabName}`);
  if (navBtn) navBtn.classList.add('active');
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModals() {
  editingJadwalId = null; editingTugasId = null; editingUjianId = null;
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
}
function backdropClose(e, id) { if (e.target.id === id) closeModals(); }
function openSettings() {
  document.getElementById('inputUserName').value = state.userName;
  document.getElementById('inputBannerMsg').value = state.bannerMsg;
  openModal('modal-settings');
}
function saveSettings() {
  const name = document.getElementById('inputUserName').value.trim();
  const msg = document.getElementById('inputBannerMsg').value.trim();
  if (name) state.userName = name;
  if (msg) state.bannerMsg = msg;
  persist(); renderHeader(); closeModals();
}

checkIncomingGift();
document.getElementById('inputHari').value = selectedDay;
document.getElementById('sessionCount').textContent = state.sessions || 0;
renderHeader(); renderDayPills(); renderJadwal(); renderTugas(); renderUjian(); renderGpa();

function redeemGiftPrompt() {
  const raw = prompt('Tempel link kejutan yang dikirim ke kamu:');
  if (!raw) return;
  const idx = raw.indexOf('#gift=');
  if (idx === -1) return alert('Format link kejutan tidak valid.');
  try {
    const payload = JSON.parse(decodeURIComponent(atob(raw.slice(idx + 6).trim())));
    if (payload.msg) state.bannerMsg = payload.msg;
    if (payload.vTitle) {
      state.voucher = { title: payload.vTitle, desc: payload.vDesc || 'Hadiah spesial buat kamu!', claimed: false };
    }
    persist(); renderAll(); closeModals();
    alert('Pesan & kejutan berhasil dipasang! ✨');
  } catch (e) {
    alert('Gagal membaca link kejutan.');
  }
}
