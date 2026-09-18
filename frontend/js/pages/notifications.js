/**
 * pages/notifications.js
 * Gère le petit panneau déroulant de la cloche de notifications, dans la topbar.
 * (Ce n'est pas une page de navigation à part entière, mais un module de
 * la même famille que les autres pages : il pourra facilement devenir une
 * vraie page "Notifications" plus tard si besoin.)
 */
import { state } from "../data.js";

export function getNotifications() {
  const overdue = state.loans.filter((l) => l.status === "overdue");
  const reservedBooks = state.books.filter((b) => b.reservations.length > 0);
  const items = [];
  if (overdue.length > 0) {
    items.push({
      color: "#ef4444",
      text: `${overdue.length} emprunt${overdue.length > 1 ? "s sont" : " est"} en retard`,
      meta: "À relancer aujourd'hui",
    });
  }
  reservedBooks.slice(0, 2).forEach((b) => {
    items.push({
      color: "#f59e0b",
      text: `Nouvelle réservation sur « ${b.title} »`,
      meta: "Il y a 1 heure",
    });
  });
  return items;
}

export function renderNotifPanel() {
  const items = getNotifications();
  return `
  <div class="notif-panel">
    <div class="notif-panel-header">Notifications</div>
    ${
      items.length === 0
        ? `<div class="notif-item"><p>Aucune nouvelle notification.</p></div>`
        : items
            .map(
              (n) =>
                `<div class="notif-item"><span class="dot" style="background:${n.color}"></span><div><p>${n.text}</p><span>${n.meta}</span></div></div>`,
            )
            .join("")
    }
  </div>`;
}

export function initNotifDropdown() {
  const btn = document.querySelector("[data-notif-toggle]");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const existing = document.querySelector(".notif-panel");
    if (existing) {
      existing.remove();
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderNotifPanel();
    const panel = wrapper.firstElementChild;
    document.body.appendChild(panel);
    setTimeout(
      () =>
        document.addEventListener("click", function h() {
          panel.remove();
          document.removeEventListener("click", h);
        }),
      0,
    );
  });
}
