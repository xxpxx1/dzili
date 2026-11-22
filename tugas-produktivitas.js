const TASK_KEY = "dzili_tasks_v1";
const PRIORITIES = ["Tinggi", "Sedang", "Rendah"];

function cleanText(val, max = 180) {
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

function daysDiffFromToday(dueDate, now = new Date()) {
  if (!validDate(dueDate)) return 999;
  const a = new Date(todayISO(now) + "T00:00:00");
  const b = new Date(dueDate + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(TASK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object" && typeof x.title === "string" && x.title.trim())
      .map((x) => ({
        id: typeof x.id === "string" && x.id.length <= 40 ? x.id : `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: cleanText(x.title, 160),
        course: cleanText(x.course, 80),
        priority: PRIORITIES.includes(x.priority) ? x.priority : "Sedang",
        dueDate: validDate(x.dueDate) ? x.dueDate : todayISO(),
        done: Boolean(x.done),
        completedAt: typeof x.completedAt === "string" ? cleanText(x.completedAt, 30) : ""
      }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

function describeDeadline(dueDate, done) {
  if (done) return "Selesai";
  const diff = daysDiffFromToday(dueDate);
  if (diff < 0) return `Terlewat ${Math.abs(diff)} hari (${dueDate})`;
  if (diff === 0) return `Hari ini (${dueDate})`;
  if (diff === 1) return `Besok (${dueDate})`;
  return `${diff} hari lagi (${dueDate})`;
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function priorityRank(p) {
  return p === "Tinggi" ? 0 : p === "Sedang" ? 1 : 2;
}

export function mountTaskProductivity(hostEl) {
  if (!hostEl) return null;
  let tasks = loadTasks();
  let filterMode = "Semua";
  let selectedDate = "";
  let showArchive = false;
  let editingId = null;

  hostEl.textContent = "";
  hostEl.className = "dzili-task-wrap";

  const progressCard = el("div", "dzili-task-progress");
  const progTop = el("div", "dzili-prog-top");
  const progLabel = el("strong", "", "Progress Tugas");
  const progPct = el("span", "", "0%");
  progTop.append(progLabel, progPct);

  const progTrack = el("div", "dzili-prog-track");
  const progFill = el("div", "dzili-prog-fill");
  progTrack.appendChild(progFill);

  const progMeta = el("small", "dzili-prog-meta");
  progressCard.append(progTop, progTrack, progMeta);

  const calStrip = el("div", "dzili-cal-strip");

  const actionBar = el("div", "dzili-task-actions");
  const filterGroup = el("div", "dzili-filter-group");
  const filterBtns = ["Semua", "Mendesak", "Aktif"].map((mode) => {
    const b = el("button", "dzili-chip-btn", mode);
    b.type = "button";
    b.addEventListener("click", () => {
      filterMode = mode;
      selectedDate = "";
      render();
    });
    filterGroup.appendChild(b);
    return b;
  });

  const addBtn = el("button", "dzili-btn-primary", "+ Tugas Baru");
  addBtn.type = "button";
  actionBar.append(filterGroup, addBtn);

  const form = el("form", "dzili-task-form");
  form.hidden = true;

  const titleInput = el("input", "dzili-input");
  titleInput.placeholder = "Judul tugas / PR / proyek";
  titleInput.required = true;

  const courseInput = el("input", "dzili-input");
  courseInput.placeholder = "Mata kuliah (opsional)";

  const prioSelect = el("select", "dzili-input");
  PRIORITIES.forEach((p) => {
    const opt = el("option", "", `Prioritas: ${p}`);
    opt.value = p;
    prioSelect.appendChild(opt);
  });

  const dueInput = el("input", "dzili-input");
  dueInput.type = "date";
  dueInput.value = todayISO();

  const submitBtn = el("button", "dzili-btn-primary", "Simpan Tugas");
  submitBtn.type = "submit";

  const cancelBtn = el("button", "dzili-btn-ghost", "Batal");
  cancelBtn.type = "button";

  form.append(titleInput, courseInput, prioSelect, dueInput, submitBtn, cancelBtn);

  const activeList = el("div", "dzili-task-list");

  const archiveToggle = el("button", "dzili-archive-toggle", "Arsip Tugas Selesai");
  archiveToggle.type = "button";
  archiveToggle.addEventListener("click", () => {
    showArchive = !showArchive;
    render();
  });

  const archiveList = el("div", "dzili-archive-list");
  archiveList.hidden = true;

  function openForm(item = null) {
    editingId = item ? item.id : null;
    titleInput.value = item?.title || "";
    courseInput.value = item?.course || "";
    prioSelect.value = item?.priority || "Sedang";
    dueInput.value = item?.dueDate || todayISO();
    form.hidden = false;
    titleInput.focus();
  }

  addBtn.addEventListener("click", () => openForm(null));
  cancelBtn.addEventListener("click", () => {
    editingId = null;
    form.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = cleanText(titleInput.value, 160);
    if (!title) return;
    const dueDate = validDate(dueInput.value) ? dueInput.value : todayISO();
    const payload = {
      id: editingId || `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      course: cleanText(courseInput.value, 80),
      priority: PRIORITIES.includes(prioSelect.value) ? prioSelect.value : "Sedang",
      dueDate,
      done: editingId ? Boolean(tasks.find((t) => t.id === editingId)?.done) : false,
      completedAt: editingId ? tasks.find((t) => t.id === editingId)?.completedAt || "" : ""
    };
    if (editingId) {
      tasks = tasks.map((t) => (t.id === editingId ? payload : t));
    } else {
      tasks.push(payload);
    }
    saveTasks(tasks);
    editingId = null;
    form.hidden = true;
    render();
  });

  function renderCalendar() {
    calStrip.textContent = "";
    const activeTasks = tasks.filter((t) => !t.done);
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const iso = todayISO(dt);
      const count = activeTasks.filter((t) => t.dueDate === iso).length;
      const btn = el("button", "dzili-cal-day");
      btn.type = "button";
      if (selectedDate === iso) btn.classList.add("is-selected");
      if (count > 0) btn.classList.add("has-due");

      const dayName = dt.toLocaleDateString("id-ID", { weekday: "short" });
      btn.append(
        el("small", "", dayName),
        el("strong", "", String(dt.getDate())),
        el("span", "", count > 0 ? `${count} due` : "·")
      );
      btn.addEventListener("click", () => {
        selectedDate = selectedDate === iso ? "" : iso;
        render();
      });
      calStrip.appendChild(btn);
    }
  }

  function buildTaskCard(item, isArchived) {
    const card = el("div", `dzili-task-card prio-${item.priority.toLowerCase()}`);
    if (isArchived) card.classList.add("is-done");

    const top = el("div", "dzili-task-top");
    const title = el("h4", "", item.title);
    const badge = el("span", "dzili-prio-badge", item.priority);
    top.append(title, badge);

    const metaText = [item.course || "Umum", describeDeadline(item.dueDate, item.done)].join(" • ");
    const meta = el("p", "", metaText);

    const toggleBtn = el("button", "dzili-btn-mini", isArchived ? "Kembalikan" : "Selesai");
    toggleBtn.type = "button";
    toggleBtn.addEventListener("click", () => {
      item.done = !item.done;
      item.completedAt = item.done ? todayISO() : "";
      saveTasks(tasks);
      render();
    });

    const editBtn = el("button", "dzili-btn-mini", "Edit");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => openForm(item));

    const delBtn = el("button", "dzili-btn-mini", "Hapus");
    delBtn.type = "button";
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== item.id);
      saveTasks(tasks);
      render();
    });

    const rowBtns = el("div", "dzili-tl-actions");
    rowBtns.append(toggleBtn, editBtn, delBtn);
    card.append(top, meta, rowBtns);
    return card;
  }

  function render() {
    const total = tasks.length;
    const doneItems = tasks.filter((t) => t.done);
    const activeItems = tasks.filter((t) => !t.done);
    const pct = total > 0 ? Math.round((doneItems.length / total) * 100) : 0;

    progPct.textContent = `${pct}%`;
    progFill.style.width = `${pct}%`;
    progMeta.textContent = `${doneItems.length} selesai • ${activeItems.length} aktif dari ${total} tugas`;

    filterBtns.forEach((b) => b.classList.toggle("is-active", !selectedDate && b.textContent === filterMode));
    renderCalendar();

    let visible = [...activeItems];
    if (selectedDate) {
      visible = visible.filter((t) => t.dueDate === selectedDate);
    } else if (filterMode === "Mendesak") {
      visible = visible.filter((t) => t.priority === "Tinggi" || daysDiffFromToday(t.dueDate) <= 2);
    }

    visible.sort((a, b) => {
      const byDate = a.dueDate.localeCompare(b.dueDate);
      if (byDate !== 0) return byDate;
      return priorityRank(a.priority) - priorityRank(b.priority);
    });

    activeList.textContent = "";
    if (!visible.length) {
      const empty = el("div", "dzili-empty-card");
      empty.append(
        el("strong", "", "Semua Tugas Beres"),
        el("p", "", "Tekan + Tugas Baru jika ada PR, kuis, atau proyek baru.")
      );
      activeList.appendChild(empty);
    } else {
      visible.forEach((t) => activeList.appendChild(buildTaskCard(t, false)));
    }

    archiveToggle.textContent = `Arsip Tugas Selesai (${doneItems.length})`;
    archiveList.hidden = !showArchive;
    archiveList.textContent = "";
    if (showArchive) {
      if (!doneItems.length) {
        archiveList.appendChild(el("p", "dzili-empty-note", "Belum ada tugas yang diarsipkan."));
      } else {
        doneItems.forEach((t) => archiveList.appendChild(buildTaskCard(t, true)));
      }
    }
  }

  hostEl.append(progressCard, calStrip, actionBar, form, activeList, archiveToggle, archiveList);
  render();
  return { refresh: render };
}
