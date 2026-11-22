const ACAD_KEY = "dzili_academic_v1";

const GRADE_POINTS = {
  A: 4.0,
  AB: 3.5,
  B: 3.0,
  BC: 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0
};

const GRADES = Object.keys(GRADE_POINTS);

function cleanText(val, max = 140) {
  if (typeof val !== "string") return "";
  return val.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function validDate(d) {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function examCountdownLabel(dateStr, now = new Date()) {
  if (!validDate(dateStr)) return "Tanggal belum valid";
  const a = new Date(todayISO(now) + "T00:00:00");
  const b = new Date(dateStr + "T00:00:00");
  const diff = Math.round((b - a) / 86400000);
  if (diff < 0) return `Sudah lewat (${dateStr})`;
  if (diff === 0) return `Hari ini! (${dateStr})`;
  if (diff === 1) return `Besok (H-1 • ${dateStr})`;
  return `H-${diff} (${diff} hari lagi • ${dateStr})`;
}

function defaultState() {
  return {
    targetIps: 3.5,
    courses: [],
    exams: [],
    semesters: []
  };
}

export function loadAcademicState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(ACAD_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return base;

    const targetIps = Number.isFinite(Number(p.targetIps))
      ? Math.max(0, Math.min(4, Number(Number(p.targetIps).toFixed(2))))
      : 3.5;

    const courses = Array.isArray(p.courses)
      ? p.courses
          .filter((c) => c && typeof c === "object" && typeof c.name === "string" && c.name.trim())
          .map((c) => ({
            id: cleanText(String(c.id || ""), 40) || `mk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            name: cleanText(c.name, 100),
            sks: Number.isFinite(Number(c.sks)) ? Math.max(1, Math.min(12, Math.round(Number(c.sks)))) : 3,
            grade: GRADES.includes(c.grade) ? c.grade : "A"
          }))
      : [];

    const exams = Array.isArray(p.exams)
      ? p.exams
          .filter((x) => x && typeof x === "object" && typeof x.course === "string" && x.course.trim())
          .map((x) => ({
            id: cleanText(String(x.id || ""), 40) || `ex_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            course: cleanText(x.course, 100),
            kind: x.kind === "UAS" ? "UAS" : "UTS",
            date: validDate(x.date) ? x.date : todayISO(),
            room: cleanText(String(x.room || ""), 60)
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
      : [];

    const semesters = Array.isArray(p.semesters)
      ? p.semesters
          .filter((s) => s && typeof s === "object" && typeof s.label === "string" && s.label.trim())
          .slice(0, 12)
          .map((s) => ({
            id: cleanText(String(s.id || ""), 40) || `sem_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            label: cleanText(s.label, 40),
            ips: Number.isFinite(Number(s.ips)) ? Math.max(0, Math.min(4, Number(Number(s.ips).toFixed(2)))) : 0,
            sks: Number.isFinite(Number(s.sks)) ? Math.max(0, Math.min(40, Math.round(Number(s.sks)))) : 0
          }))
      : [];

    return { targetIps, courses, exams, semesters };
  } catch {
    return base;
  }
}

export function saveAcademicState(state) {
  try {
    localStorage.setItem(ACAD_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function calcIps(courses) {
  let totalSks = 0;
  let totalPoints = 0;
  for (const c of courses) {
    const sks = Number(c.sks) || 0;
    const pt = GRADE_POINTS[c.grade] ?? 0;
    totalSks += sks;
    totalPoints += sks * pt;
  }
  const ips = totalSks > 0 ? totalPoints / totalSks : 0;
  return { totalSks, ips: Number(ips.toFixed(2)) };
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function mountAcademicSemester(hostEl) {
  if (!hostEl) return null;
  const state = loadAcademicState();

  hostEl.textContent = "";
  hostEl.className = "dzili-acd-wrap";

  const summaryRow = el("div", "dzili-acd-summary");
  const cardSks = el("div", "dzili-acd-stat");
  const cardIps = el("div", "dzili-acd-stat");
  const cardTarget = el("div", "dzili-acd-stat");
  summaryRow.append(cardSks, cardIps, cardTarget);

  const targetBar = el("div", "dzili-acd-target-bar");
  targetBar.appendChild(el("label", "", "Target IPS Semester:"));
  const targetInput = el("input", "dzili-input dzili-acd-target-input");
  targetInput.type = "number";
  targetInput.step = "0.05";
  targetInput.min = "0";
  targetInput.max = "4";
  targetInput.value = String(state.targetIps);
  targetInput.addEventListener("change", () => {
    const val = Number(targetInput.value);
    if (Number.isFinite(val)) {
      state.targetIps = Math.max(0, Math.min(4, Number(val.toFixed(2))));
      targetInput.value = String(state.targetIps);
      saveAcademicState(state);
      render();
    }
  });
  targetBar.appendChild(targetInput);

  const examCard = el("div", "dzili-acd-card");
  const examHead = el("div", "dzili-acd-head");
  examHead.appendChild(el("h4", "", "Hitung Mundur Ujian"));
  const toggleExamBtn = el("button", "dzili-btn-mini", "+ Jadwal Ujian");
  toggleExamBtn.type = "button";
  examHead.appendChild(toggleExamBtn);

  const examForm = el("form", "dzili-acd-inline-form");
  examForm.hidden = true;
  const exCourse = el("input", "dzili-input");
  exCourse.placeholder = "Mata kuliah ujian";
  exCourse.required = true;
  const exKind = el("select", "dzili-input");
  ["UTS", "UAS"].forEach((k) => {
    const o = el("option", "", k);
    o.value = k;
    exKind.appendChild(o);
  });
  const exDate = el("input", "dzili-input");
  exDate.type = "date";
  exDate.value = todayISO();
  const exRoom = el("input", "dzili-input");
  exRoom.placeholder = "Ruang / jam (opsional)";
  const exSave = el("button", "dzili-btn-primary", "Simpan");
  exSave.type = "submit";

  examForm.append(exCourse, exKind, exDate, exRoom, exSave);
  toggleExamBtn.addEventListener("click", () => {
    examForm.hidden = !examForm.hidden;
    if (!examForm.hidden) exCourse.focus();
  });

  examForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const course = cleanText(exCourse.value, 100);
    if (!course) return;
    state.exams.push({
      id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      course,
      kind: exKind.value === "UAS" ? "UAS" : "UTS",
      date: validDate(exDate.value) ? exDate.value : todayISO(),
      room: cleanText(exRoom.value, 60)
    });
    state.exams.sort((a, b) => a.date.localeCompare(b.date));
    saveAcademicState(state);
    exCourse.value = "";
    exRoom.value = "";
    examForm.hidden = true;
    render();
  });

  const examList = el("div", "dzili-acd-list");
  examCard.append(examHead, examForm, examList);

  const simCard = el("div", "dzili-acd-card");
  const simHead = el("div", "dzili-acd-head");
  simHead.appendChild(el("h4", "", "Simulasi Nilai Mata Kuliah"));
  const toggleCourseBtn = el("button", "dzili-btn-mini", "+ Matkul");
  toggleCourseBtn.type = "button";
  simHead.appendChild(toggleCourseBtn);

  const courseForm = el("form", "dzili-acd-inline-form");
  courseForm.hidden = true;
  const mkName = el("input", "dzili-input");
  mkName.placeholder = "Nama mata kuliah";
  mkName.required = true;
  const mkSks = el("input", "dzili-input");
  mkSks.type = "number";
  mkSks.min = "1";
  mkSks.max = "12";
  mkSks.value = "3";
  mkSks.placeholder = "SKS";
  const mkGrade = el("select", "dzili-input");
  GRADES.forEach((g) => {
    const o = el("option", "", `Nilai ${g} (${GRADE_POINTS[g].toFixed(1)})`);
    o.value = g;
    mkGrade.appendChild(o);
  });
  const mkSave = el("button", "dzili-btn-primary", "Tambah");
  mkSave.type = "submit";

  courseForm.append(mkName, mkSks, mkGrade, mkSave);
  toggleCourseBtn.addEventListener("click", () => {
    courseForm.hidden = !courseForm.hidden;
    if (!courseForm.hidden) mkName.focus();
  });

  courseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = cleanText(mkName.value, 100);
    if (!name) return;
    state.courses.push({
      id: `mk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      name,
      sks: Math.max(1, Math.min(12, Math.round(Number(mkSks.value || 3)))),
      grade: GRADES.includes(mkGrade.value) ? mkGrade.value : "A"
    });
    saveAcademicState(state);
    mkName.value = "";
    courseForm.hidden = true;
    render();
  });

  const courseList = el("div", "dzili-acd-list");
  simCard.append(simHead, courseForm, courseList);

  const histCard = el("div", "dzili-acd-card");
  const histHead = el("div", "dzili-acd-head");
  histHead.appendChild(el("h4", "", "Grafik IPS & Riwayat Semester"));
  const saveSemBtn = el("button", "dzili-btn-mini", "Arsipkan Semester Ini");
  saveSemBtn.type = "button";
  histHead.appendChild(saveSemBtn);

  saveSemBtn.addEventListener("click", () => {
    const { totalSks, ips } = calcIps(state.courses);
    if (totalSks <= 0) return;
    const label = `Sem ${state.semesters.length + 1}`;
    state.semesters.push({
      id: `sem_${Date.now()}`,
      label,
      ips,
      sks: totalSks
    });
    state.semesters = state.semesters.slice(-8);
    saveAcademicState(state);
    render();
  });

  const ipsChart = el("div", "dzili-acd-chart");
  const semList = el("div", "dzili-acd-list");
  histCard.append(histHead, ipsChart, semList);

  function render() {
    const { totalSks, ips } = calcIps(state.courses);
    const gap = Number((ips - state.targetIps).toFixed(2));

    cardSks.textContent = "";
    cardSks.append(el("small", "", "Total SKS"), el("strong", "", String(totalSks)), el("span", "", `${state.courses.length} matkul`));

    cardIps.textContent = "";
    cardIps.append(el("small", "", "Estimasi IPS"), el("strong", "", ips.toFixed(2)), el("span", "", "Skala 4.00"));

    cardTarget.textContent = "";
    cardTarget.append(
      el("small", "", "Target"),
      el("strong", "", state.targetIps.toFixed(2)),
      el("span", "", totalSks > 0 ? (gap >= 0 ? `+${gap.toFixed(2)} di atas target` : `${gap.toFixed(2)} dari target`) : "Tambah matkul")
    );

    examList.textContent = "";
    if (!state.exams.length) {
      examList.append(el("strong", "dzili-empty-title", "Belum Ada Jadwal Ujian"), el("p", "dzili-empty-note", "Tambahkan jadwal UTS/UAS agar hitung mundurnya aktif."));
    } else {
      state.exams.forEach((ex) => {
        const row = el("div", "dzili-acd-row");
        const info = el("div", "");
        info.append(el("strong", "", `${ex.kind}: ${ex.course}`), el("small", "", `${examCountdownLabel(ex.date)}${ex.room ? ` • ${ex.room}` : ""}`));
        const del = el("button", "dzili-btn-mini", "Hapus");
        del.type = "button";
        del.addEventListener("click", () => {
          state.exams = state.exams.filter((item) => item.id !== ex.id);
          saveAcademicState(state);
          render();
        });
        row.append(info, del);
        examList.appendChild(row);
      });
    }

    courseList.textContent = "";
    if (!state.courses.length) {
      courseList.append(el("p", "dzili-empty-note", "Belum ada mata kuliah. Tekan + Matkul untuk mensimulasikan IPS."));
    } else {
      state.courses.forEach((c) => {
        const row = el("div", "dzili-acd-row");
        const info = el("div", "");
        info.append(el("strong", "", c.name), el("small", "", `${c.sks} SKS • Bobot ${(GRADE_POINTS[c.grade] ?? 0).toFixed(1)}`));

        const sel = el("select", "dzili-input dzili-acd-grade-sel");
        GRADES.forEach((g) => {
          const o = el("option", "", g);
          o.value = g;
          if (g === c.grade) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener("change", () => {
          c.grade = GRADES.includes(sel.value) ? sel.value : c.grade;
          saveAcademicState(state);
          render();
        });

        const del = el("button", "dzili-btn-mini", "×");
        del.type = "button";
        del.addEventListener("click", () => {
          state.courses = state.courses.filter((item) => item.id !== c.id);
          saveAcademicState(state);
          render();
        });

        const right = el("div", "dzili-acd-row-right");
        right.append(sel, del);
        row.append(info, right);
        courseList.appendChild(row);
      });
    }

    ipsChart.textContent = "";
    if (!state.semesters.length) {
      ipsChart.append(el("p", "dzili-empty-note", "Grafik IPS akan muncul setelah Anda mengarsipkan riwayat semester."));
    } else {
      state.semesters.forEach((s) => {
        const col = el("div", "dzili-acd-bar-col");
        const track = el("div", "dzili-acd-bar-track");
        const fill = el("div", "dzili-acd-bar-fill");
        fill.style.height = `${Math.max(8, Math.round((s.ips / 4) * 100))}%`;
        track.appendChild(fill);
        col.append(track, el("small", "", s.label), el("span", "", s.ips.toFixed(2)));
        ipsChart.appendChild(col);
      });
    }

    semList.textContent = "";
    state.semesters.forEach((s) => {
      const row = el("div", "dzili-acd-row");
      const info = el("div", "");
      info.append(el("strong", "", s.label), el("small", "", `IPS ${s.ips.toFixed(2)} • ${s.sks} SKS`));
      semList.appendChild(info);
    });
  }

  hostEl.append(summaryRow, targetBar, examCard, simCard, histCard);
  render();
  return { refresh: render };
}
