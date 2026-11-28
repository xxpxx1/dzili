import { mountScheduleDashboard } from "./jadwal-dashboard.js";
import { mountTaskProductivity } from "./tugas-produktivitas.js";
import { mountBinderLibrary } from "./binder-library.js?v=47";
import { mountFocusProductivity } from "./fokus-produktivitas.js";
import { mountAcademicSemester } from "./akademik-semester.js";
import { createScientificCalculatorModal } from "./kalkulator-ilmiah.js";
import { createSettingsModal, loadDziliPrefs } from "./pengaturan-dzili.js";

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
  const prefs = loadDziliPrefs();
  let studentName =
    typeof options.studentName === "string" && options.studentName.trim()
      ? options.studentName.trim().slice(0, 40)
      : prefs.studentName;

  rootEl.textContent = "";
  rootEl.className = "dzili-shell";

  const calcModal = createScientificCalculatorModal();

  function svgIcon(paths) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    paths.forEach((d) => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
    });
    return svg;
  }

  const topBar = make("header", "dzili-topbar");
  const greetBox = make("div", "dzili-greet");
  const greetTitle = make("h2", "", `Selamat Pagi, ${studentName}!`);
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
  greetBox.append(greetTitle, make("small", "", dateStr));

  const actionIcons = make("div", "dzili-top-actions");

  const homeBtn = make("button", "dzili-icon-btn");
  homeBtn.type = "button";
  homeBtn.title = "Landing Page";
  homeBtn.setAttribute("aria-label", "Kembali ke Landing Page");
  homeBtn.appendChild(svgIcon(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]));
  homeBtn.addEventListener("click", () => {
    if (typeof options.onBackLanding === "function") {
      options.onBackLanding();
    } else {
      const lp = document.getElementById("dziliLandingView");
      if (lp) {
        rootEl.style.display = "none";
        lp.style.display = "block";
      }
    }
  });

  const calcBtn = make("button", "dzili-icon-btn");
  calcBtn.type = "button";
  calcBtn.title = "Kalkulator Ilmiah";
  calcBtn.setAttribute("aria-label", "Buka Kalkulator Ilmiah");
  calcBtn.appendChild(svgIcon(["M4 4h16v16H4z", "M8 8h8", "M8 12h2", "M14 12h2", "M8 16h2", "M14 16h2"]));
  calcBtn.addEventListener("click", () => calcModal.open());

  const settingsBtn = make("button", "dzili-icon-btn");
  settingsBtn.type = "button";
  settingsBtn.title = "Pengaturan";
  settingsBtn.setAttribute("aria-label", "Buka Pengaturan");
  settingsBtn.appendChild(svgIcon(["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]));

  actionIcons.append(homeBtn, calcBtn, settingsBtn);
  topBar.append(greetBox, actionIcons);

  const banner = make(
    "div",
    "dzili-banner",
    prefs.bannerMessage
  );

  const stage = make("main", "dzili-stage");
  const panels = {};
  const mounted = {};

  TABS.forEach((t) => {
    const panel = make("section", "dzili-panel");
    panel.id = `dzili-panel-${t.id}`;
    panel.setAttribute("data-panel", t.id);
    panel.style.setProperty("display", "none", "important");
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
      const isTarget = t.id === target.id;
      const panel = panels[t.id];
      panel.hidden = !isTarget;
      panel.style.setProperty("display", isTarget ? "grid" : "none", "important");
      if (isTarget && !mounted[t.id]) {
        try {
          mounted[t.id] = target.mount(panel);
        } catch (err) {
          panel.textContent = "";
          const errBox = make("div", "dzili-card");
          errBox.append(
            make("strong", "", `Error memuat ${t.label}:`),
            make("pre", "", String(err && (err.stack || err.message) || err))
          );
          panel.appendChild(errBox);
        }
      } else if (isTarget && mounted[t.id] && typeof mounted[t.id].refresh === "function") {
        mounted[t.id].refresh();
      }
    });
    navBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === target.id));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const settingsModal = createSettingsModal((updated) => {
    studentName = updated.studentName;
    greetTitle.textContent = `Selamat Pagi, ${studentName}!`;
    if (updated.bannerMessage) banner.textContent = updated.bannerMessage;
    Object.values(mounted).forEach((m) => {
      if (m && typeof m.refresh === "function") m.refresh();
    });
  });

  settingsBtn.addEventListener("click", () => settingsModal.open());

  rootEl.append(topBar, banner, stage, nav);
  switchTab("jadwal");

  return {
    switchTab,
    openCalculator: () => calcModal.open(),
    openSettings: () => settingsModal.open()
  };
}
