const SCHEDULE_KEY = "dzili_schedule_v1";
export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function cleanText(val, max = 140) {
  if (typeof val !== "string") return "";
  return val.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function validTime(t) {
  return typeof t === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function loadScheduleItems() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object" && DAYS.includes(x.day) && validTime(x.start) && validTime(x.end))
      .map((x) => ({
        id: typeof x.id === "string" && x.id.length <= 40 ? x.id : `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        day: x.day,
        course: cleanText(x.course, 120) || "Mata Kuliah",
        room: cleanText(x.room, 80),
        lecturer: cleanText(x.lecturer, 80),
        start: x.start,
        end: x.end,
        attended: Number.isFinite(Number(x.attended)) ? Math.max(0, Math.min(999, Number(x.attended))) : 0,
        totalMeetings: Number.isFinite(Number(x.totalMeetings)) ? Math.max(0, Math.min(999, Number(x.totalMeetings))) : 0
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
  } catch {
    return [];
  }
}

export function saveScheduleItems(items) {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function getTodayDayLabel(now = new Date()) {
  const map = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return map[now.getDay()];
}

export function describeClassTiming(item, now = new Date()) {
  const [sh, sm] = item.start.split(":").map(Number);
  const [eh, em] = item.end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const curMin = now.getHours() * 60 + now.getMinutes();

  if (curMin >= startMin && curMin <= endMin) {
    return { state: "active", label: `Sedang berlangsung (selesai ${item.end})` };
  }
  if (startMin > curMin) {
    const diff = startMin - curMin;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    const eta = h > 0 ? `${h}j ${m}m lagi` : `${m} menit lagi`;
    return { state: "upcoming", label: `Mulai ${item.start} • ${eta}` };
  }
  return { state: "done", label: `Selesai (${item.start}–${item.end})` };
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function mountScheduleDashboard(hostEl) {
  if (!hostEl) return null;
  let items = loadScheduleItems();
  let selectedDay = getTodayDayLabel();
  let editingId = null;

  hostEl.textContent = "";
  hostEl.className = "dzili-sched-wrap";

  const topMetrics = el("div", "dzili-sched-metrics");
  const mToday = el("div", "dzili-metric-card");
  const mNext = el("div", "dzili-metric-card");
  const mAtt = el("div", "dzili-metric-card");
  topMetrics.append(mToday, mNext, mAtt);

  const dayStrip = el("div", "dzili-day-strip");
  const dayButtons = DAYS.map((d) => {
    const b = el("button", "dzili-day-btn", d);
    b.type = "button";
    b.addEventListener("click", () => {
      selectedDay = d;
      render();
    });
    dayStrip.appendChild(b);
    return b;
  });

  const headerRow = el("div", "dzili-sched-header");
  const heading = el("h3", "dzili-sched-title");
  const addBtn = el("button", "dzili-btn-primary", "+ Mata Kuliah");
  addBtn.type = "button";
  headerRow.append(heading, addBtn);

  const form = el("form", "dzili-sched-form");
  form.hidden = true;
  const courseInput = el("input", "dzili-input");
  courseInput.placeholder = "Nama mata kuliah (mis. Kalkulus II)";
  courseInput.required = true;

  const daySelect = el("select", "dzili-input");
  DAYS.forEach((d) => {
    const opt = el("option", "", d);
    opt.value = d;
    daySelect.appendChild(opt);
  });

  const startInput = el("input", "dzili-input");
  startInput.type = "time";
  startInput.value = "08:00";

  const endInput = el("input", "dzili-input");
  endInput.type = "time";
  endInput.value = "09:40";

  const roomInput = el("input", "dzili-input");
  roomInput.placeholder = "Ruang / Dosen (opsional)";

  const attInput = el("input", "dzili-input");
  attInput.type = "number";
  attInput.min = "0";
  attInput.max = "999";
  attInput.placeholder = "Hadir (sesi)";

  const totInput = el("input", "dzili-input");
  totInput.type = "number";
  totInput.min = "0";
  totInput.max = "999";
  totInput.placeholder = "Total pertemuan";

  const submitBtn = el("button", "dzili-btn-primary", "Simpan Jadwal");
  submitBtn.type = "submit";
  const cancelBtn = el("button", "dzili-btn-ghost", "Batal");
  cancelBtn.type = "button";

  form.append(courseInput, daySelect, startInput, endInput, roomInput, attInput, totInput, submitBtn, cancelBtn);

  const timeline = el("div", "dzili-timeline");

  function openForm(item = null) {
    editingId = item ? item.id : null;
    courseInput.value = item?.course || "";
    daySelect.value = item?.day || selectedDay;
    startInput.value = item?.start || "08:00";
    endInput.value = item?.end || "09:40";
    roomInput.value = item?.room || item?.lecturer || "";
    attInput.value = item?.attended ? String(item.attended) : "";
    totInput.value = item?.totalMeetings ? String(item.totalMeetings) : "";
    form.hidden = false;
    courseInput.focus();
  }

  addBtn.addEventListener("click", () => openForm(null));
  cancelBtn.addEventListener("click", () => {
    editingId = null;
    form.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const course = cleanText(courseInput.value, 120);
    if (!course || !validTime(startInput.value) || !validTime(endInput.value)) return;
    const payload = {
      id: editingId || `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      course,
      day: DAYS.includes(daySelect.value) ? daySelect.value : selectedDay,
      start: startInput.value,
      end: endInput.value,
      room: cleanText(roomInput.value, 80),
      lecturer: "",
      attended: Math.max(0, Number(attInput.value || 0)),
      totalMeetings: Math.max(0, Number(totInput.value || 0))
    };
    if (editingId) {
      items = items.map((x) => (x.id === editingId ? payload : x));
    } else {
      items.push(payload);
    }
    items.sort((a, b) => a.start.localeCompare(b.start));
    saveScheduleItems(items);
    editingId = null;
    form.hidden = true;
    render();
  });

  function render() {
    const todayLabel = getTodayDayLabel();
    const todayClasses = items.filter((x) => x.day === todayLabel);
    const dayClasses = items.filter((x) => x.day === selectedDay);

    dayButtons.forEach((b) => b.classList.toggle("is-active", b.textContent === selectedDay));
    heading.textContent = `Timeline Hari ${selectedDay}`;

    mToday.textContent = "";
    mToday.append(el("small", "", "Kuliah Hari Ini"), el("strong", "", `${todayClasses.length} Kelas`));

    const nextCandidate = todayClasses.find((x) => describeClassTiming(x).state !== "done");
    mNext.textContent = "";
    mNext.append(
      el("small", "", "Jadwal Berikutnya"),
      el("strong", "", nextCandidate ? nextCandidate.course : "Tidak ada lagi"),
      el("span", "", nextCandidate ? describeClassTiming(nextCandidate).label : "Santai / review")
    );

    const sumAtt = items.reduce((acc, x) => acc + (x.attended || 0), 0);
    const sumTot = items.reduce((acc, x) => acc + (x.totalMeetings || 0), 0);
    mAtt.textContent = "";
    mAtt.append(
      el("small", "", "Kehadiran"),
      el("strong", "", sumTot > 0 ? `${Math.round((sumAtt / sumTot) * 100)}%` : "Belum ada data"),
      el("span", "", sumTot > 0 ? `${sumAtt}/${sumTot} sesi` : "Isi hadir & total saat input")
    );

    timeline.textContent = "";
    if (!dayClasses.length) {
      const empty = el("div", "dzili-empty-card");
      empty.append(
        el("strong", "", `Kosong di Hari ${selectedDay}`),
        el("p", "", "Tambahkan mata kuliah agar timeline dan indikator waktu kelas aktif.")
      );
      timeline.appendChild(empty);
      return;
    }

    dayClasses.forEach((item) => {
      const card = el("div", "dzili-tl-card");
      const timeBadge = el("span", "dzili-tl-time", `${item.start} – ${item.end}`);
      const title = el("h4", "", item.course);
      const sub = el(
        "p",
        "",
        `${item.room || "Jadwal teratur"} • ${selectedDay === todayLabel ? describeClassTiming(item).label : item.day}`
      );

      const hadirBtn = el("button", "dzili-btn-mini", "+1 Hadir");
      hadirBtn.type = "button";
      hadirBtn.addEventListener("click", () => {
        item.attended = (item.attended || 0) + 1;
        item.totalMeetings = Math.max(item.totalMeetings || 0, item.attended);
        saveScheduleItems(items);
        render();
      });

      const editBtn = el("button", "dzili-btn-mini", "Edit");
      editBtn.type = "button";
      editBtn.addEventListener("click", () => openForm(item));

      const delBtn = el("button", "dzili-btn-mini", "Hapus");
      delBtn.type = "button";
      delBtn.addEventListener("click", () => {
        items = items.filter((x) => x.id !== item.id);
        saveScheduleItems(items);
        render();
      });

      const actions = el("div", "dzili-tl-actions");
      actions.append(hadirBtn, editBtn, delBtn);
      card.append(timeBadge, title, sub, actions);
      timeline.appendChild(card);
    });
  }

  hostEl.append(topMetrics, dayStrip, headerRow, form, timeline);
  render();
  return { refresh: render };
}
