/**
 * components.js — briques d'interface réutilisées par toutes les pages.
 * Aucune dépendance externe : tout est du HTML / SVG généré en template strings.
 */
import { state, initials } from "./data.js";

/* ------------------------------- ICONES --------------------------------- */
const ICON_PATHS = {
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  bookFilled:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  member:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock:
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  search:
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  circleCheck:
    '<circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  close:
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  barChart:
    '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  moreVertical:
    '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
};

export function icon(name, { size = 18, stroke = 2, filled = false } = {}) {
  const d = ICON_PATHS[name] || "";
  if (filled)
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}

/* ------------------------------- AVATARS --------------------------------- */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#2a5298)",
  "linear-gradient(135deg,#3b8ff3,#1a6fd4)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
  "linear-gradient(135deg,#ec4899,#db2777)",
];
export function renderAvatar(name, index = 0, size = 40) {
  const bg = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const fs = Math.round(size * 0.32);
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${fs}px;">${initials(name)}</div>`;
}

/* -------------------------------- BADGE ---------------------------------- */
const BADGE_MAP = {
  available: ["Disponible", "badge-available"],
  borrowed: ["Emprunté", "badge-borrowed"],
  reserved: ["Réservé", "badge-reserved"],
  active: ["En cours", "badge-active"],
  overdue: ["En retard", "badge-overdue"],
  returned: ["Retourné", "badge-returned"],
};
export function renderBadge(statusKey) {
  const [label, cls] = BADGE_MAP[statusKey] || [statusKey, ""];
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ------------------------------ STAT CARD -------------------------------- */
export function renderStatCard({
  label,
  value,
  iconName,
  variant = "navy",
  delta = "",
}) {
  return `
  <div class="stat-card stat-${variant}">
    <div class="stat-icon">${icon(iconName, { size: 18 })}</div>
    <div>
      <p class="stat-label">${label}</p>
      <p class="stat-value">${value}</p>
      ${delta ? `<p class="stat-delta">${delta}</p>` : ""}
    </div>
  </div>`;
}

/* -------------------------------- EMPTY ---------------------------------- */
export function renderEmptyState(iconName, title, subtitle = "") {
  return `
  <div class="empty-state">
    <div class="empty-icon">${icon(iconName, { size: 24 })}</div>
    <p class="title">${title}</p>
    ${subtitle ? `<p>${subtitle}</p>` : ""}
  </div>`;
}

/* ------------------------------ FORM FIELDS ------------------------------ */
export function inputField({
  id,
  label,
  type = "text",
  value = "",
  placeholder = "",
  error = "",
  extra = "",
}) {
  return `
  <div class="form-group">
    <label class="form-label" for="${id}">${label}</label>
    <input class="form-input ${error ? "has-error" : ""}" id="${id}" name="${id}" type="${type}"
      value="${value ?? ""}" placeholder="${placeholder}" ${extra} />
    ${error ? `<span class="form-error">${error}</span>` : ""}
  </div>`;
}

export function selectField({
  id,
  label,
  options = [],
  value = "",
  placeholder = "— Choisir —",
  error = "",
}) {
  const opts = options
    .map(
      (o) =>
        `<option value="${o.value}" ${o.value === value ? "selected" : ""}>${o.label}</option>`,
    )
    .join("");
  return `
  <div class="form-group">
    <label class="form-label" for="${id}">${label}</label>
    <select class="form-select ${error ? "has-error" : ""}" id="${id}" name="${id}">
      <option value="">${placeholder}</option>
      ${opts}
    </select>
    ${error ? `<span class="form-error">${error}</span>` : ""}
  </div>`;
}

export function formActions({
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  disabled = false,
} = {}) {
  return `
  <div class="modal-actions">
    <button type="button" class="btn btn-ghost" data-action="cancel">${cancelLabel}</button>
    <button type="submit" class="btn btn-primary" ${disabled ? "disabled" : ""}>${submitLabel}</button>
  </div>`;
}

/* --------------------------------- MODAL ---------------------------------- */
export function openModal({ title, bodyHTML, size = "", onMount }) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-overlay" data-modal-overlay>
      <div class="modal-box ${size === "lg" ? "modal-lg" : ""}">
        <div class="modal-head">
          <h3>${title}</h3>
          <button type="button" class="modal-close" data-modal-close>${icon("close", { size: 15, stroke: 2.5 })}</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
      </div>
    </div>`;
  root.querySelector("[data-modal-overlay]").addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-modal-overlay")) closeModal();
  });
  root
    .querySelector("[data-modal-close]")
    .addEventListener("click", closeModal);
  root
    .querySelectorAll('[data-action="cancel"]')
    .forEach((b) => b.addEventListener("click", closeModal));
  if (onMount) onMount(root);
}
export function closeModal() {
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
}

/* --------------------------------- TOAST ----------------------------------- */
const TOAST_ICONS = { success: "check", info: "clock", error: "warn" };
export function showToast({ type = "info", message }) {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icon(TOAST_ICONS[type] || "clock", { size: 16 })}</span><span>${message}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .2s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 3200);
}

/* ============================= SIDEBAR / TOPBAR ============================ */
const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", iconName: "grid" },
  { key: "livres", label: "Livres", iconName: "book" },
  { key: "auteurs", label: "Auteurs", iconName: "pen" },
  { key: "adherents", label: "Adhérents", iconName: "member" },
  { key: "emprunts", label: "Emprunts", iconName: "swap" },
  { key: "statistiques", label: "Statistiques", iconName: "barChart" },
];
const NAV_BOTTOM = [
  { key: "parametres", label: "Paramètres", iconName: "gear" },
  { key: "profil", label: "Profil", iconName: "user" },
];

export function renderSidebar(activeKey) {
  const items = NAV_ITEMS.map(
    (n) =>
      `<button class="nav-item ${n.key === activeKey ? "active" : ""}" data-nav="${n.key}">${icon(n.iconName, { size: 18 })}<span>${n.label}</span></button>`,
  ).join("");
  const bottom = NAV_BOTTOM.map(
    (n) =>
      `<button class="nav-item ${n.key === activeKey ? "active" : ""}" data-nav="${n.key}">${icon(n.iconName, { size: 18 })}<span>${n.label}</span></button>`,
  ).join("");
  const u = state.currentUser;
  return `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-badge">B</div>
      <div class="logo-text"><p>BiblioGest</p><span>BIBLIOTHÈQUE</span></div>
    </div>
    <p class="nav-section-label">NAVIGATION</p>
    <nav class="sidebar-nav">${items}</nav>
    <div class="sidebar-divider"></div>
    <nav class="sidebar-nav">
      ${bottom}
      <button class="nav-item danger" data-nav="logout">${icon("logout", { size: 18 })}<span>Déconnexion</span></button>
    </nav>
    <div class="sidebar-spacer"></div>
    <div class="sidebar-user-card">
      ${renderAvatar(u.name, 0, 34)}
      <div><p>${u.name}</p><span>${u.role}</span></div>
    </div>
  </aside>`;
}

/** Ferme le menu topbar mobile (Paramètres/Profil/Déconnexion) s'il est ouvert. */
function closeTopbarMenu() {
  document.querySelector(".topbar-menu")?.classList.remove("open");
}

// Câblage global du menu topbar mobile : ouverture/fermeture au clic sur le
// bouton "...", fermeture au clic sur une entrée du menu ou en dehors.
// Posé une seule fois sur le document (délégation), quel que soit le nombre
// de fois où renderTopbar() est appelé pour re-rendre la page.
let topbarMenuWired = false;
function wireTopbarMenu() {
  if (topbarMenuWired) return;
  topbarMenuWired = true;
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-topbar-menu-toggle]");
    if (toggle) {
      document.querySelector(".topbar-menu")?.classList.toggle("open");
      return;
    }
    if (e.target.closest(".topbar-menu-dropdown")) {
      // clic sur une entrée (Paramètres/Profil/Déconnexion) : on referme,
      // la navigation elle-même est gérée par le routeur via data-nav
      closeTopbarMenu();
      return;
    }
    if (!e.target.closest(".topbar-menu")) {
      closeTopbarMenu();
    }
  });
}

export function renderTopbar(title, subtitle) {
  const overdueCount = state.loans.filter((l) => l.status === "overdue").length;
  const u = state.currentUser;
  wireTopbarMenu();
  return `
  <header class="topbar">
    <div>
      <h1>${title}</h1>
      <p class="page-subtitle">${subtitle}</p>
    </div>
    <div class="topbar-actions">
      <div class="search-pill">${icon("search", { size: 14 })}<input type="text" placeholder="Rechercher..." /></div>
      <button class="icon-btn" data-notif-toggle>${icon("bell", { size: 16 })}${overdueCount > 0 ? `<span class="badge-dot">${overdueCount}</span>` : ""}</button>
      <div class="topbar-menu">
        <button class="icon-btn" data-topbar-menu-toggle title="Plus d'options">${icon("moreVertical", { size: 16 })}</button>
        <div class="topbar-menu-dropdown">
          <button class="topbar-menu-item" data-nav="parametres">${icon("gear", { size: 16 })}<span>Paramètres</span></button>
          <button class="topbar-menu-item" data-nav="profil">${icon("user", { size: 16 })}<span>Profil</span></button>
          <button class="topbar-menu-item danger" data-nav="logout">${icon("logout", { size: 16 })}<span>Déconnexion</span></button>
        </div>
      </div>
      <div class="lang-badge" title="${u.name}">${initials(u.name)}</div>
    </div>
  </header>`;
}

/* ================================ GRAPHIQUES ================================*/

/** Convertit une série de points en tracé lissé (spline Catmull-Rom -> Bézier). */
function smoothLine(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ---------------------------- INFOBULLES (hover) --------------------------*/
let tooltipEl = null;
function ensureTooltipEl() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "chart-tooltip";
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}
export function showChartTooltip(
  clientX,
  clientY,
  html,
  { isEnter = false, originEl = null } = {},
) {
  const el = ensureTooltipEl();
  el.innerHTML = html;

  if (isEnter) {
    // Point de départ : coin haut-gauche du graphique survolé.
    const origin = originEl?.getBoundingClientRect();
    el.style.transitionDuration = "0s";
    el.style.left = `${origin ? origin.left : 0}px`;
    el.style.top = `${origin ? origin.top : 0}px`;
    void el.offsetWidth; // force le reflow pour figer ce point de départ
    el.style.transitionDuration = "";
  }

  el.style.left = `${clientX}px`;
  el.style.top = `${clientY}px`;
  el.classList.add("visible");
}

export function hideChartTooltip() {
  if (tooltipEl) tooltipEl.classList.remove("visible");
}

export function wireChartTooltips(root) {
  root.querySelectorAll("[data-tooltip]").forEach((el) => {
    // Graphiques exemptés de l'effet "sort du coin" (donut, barres H/V des statistiques)
    const noSlide = !!el.closest("[data-tooltip-no-slide]");
    // Conteneur qui sert de point de départ ET de mémoire "première fois"
    // (fraîchement recréé à chaque affichage de page → se réinitialise tout seul)
    const chartBox = el.closest(".chart-reveal") || el.closest(".card") || el;

    el.addEventListener("mouseenter", (e) => {
      const isFirstHover = !noSlide && !chartBox.dataset.tooltipIntroDone;
      showChartTooltip(e.clientX, e.clientY, el.getAttribute("data-tooltip"), {
        isEnter: isFirstHover,
        originEl: chartBox,
      });
      chartBox.dataset.tooltipIntroDone = "1";
    });
    el.addEventListener("mousemove", (e) =>
      showChartTooltip(e.clientX, e.clientY, el.getAttribute("data-tooltip")),
    );
    el.addEventListener("mouseleave", hideChartTooltip);
  });
}

/** Graphique en aire (tendance des emprunts). */
export function createAreaChart(
  data,
  {
    xKey = "day",
    yKey = "loans",
    color = "#3b8ff3",
    gradId = "areaGrad",
    unit = "emprunts",
  } = {},
) {
  const W = 560,
    H = 200,
    padL = 26,
    padR = 8,
    padT = 10,
    padB = 24;
  const max = Math.max(...data.map((d) => d[yKey]));
  const niceMax = Math.max(2, Math.ceil(max / 2) * 2);
  const step = niceMax / 4;
  const innerW = W - padL - padR,
    innerH = H - padT - padB;
  const stepX = innerW / (data.length - 1);
  const points = data.map((d, i) => [
    padL + i * stepX,
    padT + innerH - (d[yKey] / niceMax) * innerH,
  ]);
  const linePath = smoothLine(points);
  const areaPath = `${linePath} L ${points[points.length - 1][0]},${padT + innerH} L ${points[0][0]},${padT + innerH} Z`;

  const grid = [0, 1, 2, 3, 4]
    .map((i) => {
      const val = step * i;
      const y = padT + innerH - (val / niceMax) * innerH;
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" class="chart-grid" />
            <text x="${padL - 8}" y="${y + 3}" text-anchor="end" class="chart-tick">${Number.isInteger(val) ? val : val.toFixed(1)}</text>`;
    })
    .join("");

  const xLabels = data
    .map(
      (d, i) =>
        `<text x="${points[i][0]}" y="${H - 4}" text-anchor="middle" class="chart-tick">${d[xKey]}</text>`,
    )
    .join("");

  const dots = points
    .map((p, i) => {
      const tip = `<strong>${data[i][xKey]}</strong><br/>${data[i][yKey]} ${unit}`;
      return `
    <circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${color}" class="chart-dot" />
    <circle cx="${p[0]}" cy="${p[1]}" r="12" fill="transparent" class="chart-hit" data-tooltip="${tip.replace(/"/g, "&quot;")}" />`;
    })
    .join("");

  return `
  <div class="chart-reveal">
  <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.22" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${grid}
    <path d="${areaPath}" fill="url(#${gradId})" stroke="none" />
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
    ${dots}
    ${xLabels}
  </svg>
  </div>`;
}

/** Anneau (disponibilité des livres). */
/** Anneau (disponibilité des livres). */
export function createDonutChart(items, { size = 190, thickness = 28 } = {}) {
  const total = items.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const circles = items
    .map((d) => {
      const len = (d.value / total) * c;
      const pct = Math.round((d.value / total) * 100);
      const seg = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${thickness}"
      stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})"
      stroke-linecap="butt" class="chart-hit donut-seg" data-tooltip="<strong>${d.name}</strong><br/>${d.value} (${pct}%)" />`;
      offset += len;
      return seg;
    })
    .join("");
  const legend = items
    .map(
      (d) =>
        `<div class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${d.name}</div>`,
    )
    .join("");
  return `
  <div class="donut-wrap chart-reveal" data-tooltip-no-slide>
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg>
  </div>
  <div class="legend-row">${legend}</div>`;
}

/** Barres horizontales (livres les plus empruntés). */
export function createBarChartH(
  items,
  { colorStart = 210, colorStep = 15, unit = "emprunt" } = {},
) {
  const max = Math.max(...items.map((d) => d.count), 1);
  const rows = items
    .map((d, i) => {
      const pct = Math.max((d.count / max) * 100, 6);
      const tip = `<strong>${d.name}</strong><br/>${d.count} ${unit}${d.count > 1 ? "s" : ""}`;
      return `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="width:130px;flex-shrink:0;font-size:11.5px;color:var(--slate-600);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.name}</span>
      <div style="flex:1;background:#f1f5f9;border-radius:6px;height:20px;overflow:hidden;">
        <div class="chart-hit" data-tooltip="${tip.replace(/"/g, "&quot;")}" style="width:${pct}%;height:100%;border-radius:6px;background:hsl(${colorStart + i * colorStep},75%,${50 - i * 4}%);"></div>
      </div>
    </div>`;
    })
    .join('<div style="height:12px"></div>');
  return `<div data-tooltip-no-slide>${rows}</div>`;
}

/** Barres verticales (adhérents les plus actifs). */
export function createBarChartV(
  items,
  { hueStart = 220, hueStep = 25, unit = "emprunt" } = {},
) {
  const W = 520,
    H = 200,
    padB = 24,
    padT = 10;
  const max = Math.max(...items.map((d) => d.count), 1);
  const bw = (W / items.length) * 0.5;
  const gap = (W / items.length) * 0.5;
  const bars = items
    .map((d, i) => {
      const h = Math.max((d.count / max) * (H - padT - padB), 4);
      const x = i * (bw + gap) + gap / 2;
      const y = H - padB - h;
      const tip = `<strong>${d.name}</strong><br/>${d.count} ${unit}${d.count > 1 ? "s" : ""}`;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="hsl(${hueStart + i * hueStep},70%,${45 + i * 5}%)" class="chart-hit" data-tooltip="${tip.replace(/"/g, "&quot;")}" />
            <text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" class="chart-tick">${d.name}</text>`;
    })
    .join("");
  return `<svg class="chart-svg" data-tooltip-no-slide viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}</svg>`;
}
