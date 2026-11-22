import { mountScheduleDashboard } from "./jadwal-dashboard.js";
import { mountTaskProductivity } from "./tugas-produktivitas.js";
import { mountBinderLibrary } from "./binder-library.js";
import { mountFocusProductivity } from "./fokus-produktivitas.js";
import { mountAcademicSemester } from "./akademik-semester.js";

const TABS = [
  { id: "jadwal", label: "Jadwal", mount: mountScheduleDashboard },
  { id: "tugas", label: "Tugas", mount: mountTaskProductivity },
  { id: "binder", label: "Binder", mount: mountBinderLibrary },
  { id: "fokus", label: "Fokus", mount: mountFocusProductivity },
  { id: "akademik", label: "Akademik", mount: mountAcademicSemester }
];

function make(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

export function mountDziliWorkspace(rootEl, options = {}) {
  if (!rootEl) return null;
  const studentName =
    typeof options.studentName === "string" && options.studentName.trim()
      ? options.studentName.trim().slice(0, 40)
      : "Dzili";

  rootEl.textContent = "";
  rootEl.className = "dzili-shell";

  const topBar = make("header", "dzili-topbar");
  const greetBox = make("div", "dzili-greet");
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
  greetBox.append(make("h2", "", `Selamat Malam, ${studentName}!`), make("small", "", dateStr));

  const quickChips = make("div", "dzili-quick-chips");
  quickChips.append(
    make("span", "dzili-qchip", "Mode Lokal • Aman"),
    make("span", "dzili-qchip is-accent", "5 Modul Aktif")
  );
  topBar.append(greetBox, quickChips);

  const banner = make(
    "div",
    "dzili-banner",
    "Semangat kuliahnya hari ini! Jaga ritme fokus, simpan rumus di Binder, dan jangan lupa istirahat cukup."
  );

  const stage = make("main", "dzili-stage");
  const panels = {};
  const mounted = {};

  TABS.forEach((t) => {
    const panel = make("section", "dzili-panel");
    panel.id = `dzili-panel-${t.id}`;
    panel.style.display = "none";
    panels[t.id] = panel;
    stage.appendChild(panel);
  });

  const nav = make("nav", "dzili-bottom-nav");
  nav.setAttribute("aria-label", "Navigasi utama Dzili");

  const navBtns = TABS.map((t) => {
    const btn = make("button", "dzili-nav-btn", t.label);
    btn.type = "button";
    btn.dataset.tab = t.id;
    btn.addEventListener("click", () => switchTab(t.id));
    nav.appendChild(btn);
    return btn;
  });

  function switchTab(tabId) {
    const target = TABS.find((t) => t.id === tabId) || TABS[0];
    TABS.forEach((t) => {
      const active = t.id === target.id;
      const panel = panels[t.id];
      panel.hidden = !active;
      panel.style.display = active ? "grid" : "none";
      if (active && !mounted[t.id]) {
        mounted[t.id] = target.mount(panel);
      } else if (active && mounted[t.id] && typeof mounted[t.id].refresh === "function") {
        mounted[t.id].refresh();
      }
    });
    navBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === target.id));
  }

  rootEl.append(topBar, banner, stage, nav);
  switchTab(options.initialTab || "jadwal");

  return { switchTab };
}
