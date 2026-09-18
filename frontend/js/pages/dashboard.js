import {
  state,
  findAuthor,
  findMember,
  findBook,
  daysBetween,
  formatDate,
  computeLoanTrend,
} from "../data.js";
import {
  renderStatCard,
  createAreaChart,
  icon,
  wireChartTooltips,
} from "../components.js";

function topBooks() {
  const counts = {};
  state.loans.forEach((l) => (counts[l.bookId] = (counts[l.bookId] || 0) + 1));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ book: findBook(id), count }))
    .filter((x) => x.book);
}
function topMembers() {
  const counts = {};
  state.loans.forEach(
    (l) => (counts[l.memberId] = (counts[l.memberId] || 0) + 1),
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ member: findMember(id), count }))
    .filter((x) => x.member);
}

export function render() {
  const activeLoans = state.loans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  );
  const overdueLoans = state.loans.filter((l) => l.status === "overdue");
  const tBooks = topBooks();
  const tMembers = topMembers();
  const maxCount = tMembers[0]?.count || 1;
  const rankColors = ["#1e3a5f", "#3b8ff3", "#10b981", "#f59e0b", "#8b5cf6"];

  return `
  <div class="stack">
    <div class="grid cols-4">
      ${renderStatCard({ label: "Total livres", value: state.books.length, iconName: "book", variant: "navy", delta: `${state.authors.length} auteurs référencés` })}
      ${renderStatCard({ label: "Adhérents", value: state.members.length, iconName: "member", variant: "blue", delta: "membres inscrits" })}
      ${renderStatCard({ label: "Emprunts en cours", value: activeLoans.length, iconName: "swap", variant: "green", delta: "livres actuellement sortis" })}
      ${renderStatCard({ label: "En retard", value: overdueLoans.length, iconName: "warn", variant: "red", delta: "à relancer urgemment" })}
    </div>

    <div class="grid cols-3">
      <div class="card card-pad" style="grid-column:span 2;">
        <div class="card-header-row">
          <div><h3>Activité d'emprunt</h3><p style="font-size:12px;color:var(--slate-400);margin-top:2px;">7 derniers jours</p></div>
          <span class="chip chip-blue">Cette semaine</span>
        </div>
        ${createAreaChart(computeLoanTrend())}
      </div>

      <div class="card card-pad">
        <div class="card-header"><h3>Top 5 livres</h3><p>Les plus empruntés</p></div>
        ${tBooks
          .map(({ book, count }, i) => {
            const author = findAuthor(book.authorId);
            return `
          <div class="list-rank">
            <span class="rank-badge" style="background:${rankColors[i] || "#64748b"}">${i + 1}</span>
            <div style="flex:1;min-width:0;">
              <p class="rank-title">${book.title}</p>
              <p class="rank-sub">${author?.name || ""}</p>
            </div>
            <span class="rank-count">${count}×</span>
          </div>`;
          })
          .join("")}
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card card-pad">
        <div class="card-header"><h3>Adhérents les plus actifs</h3><p>Top 5 par nombre d'emprunts</p></div>
        ${tMembers
          .map(
            ({ member, count }, i) => `
          <div class="list-rank">
            <div class="avatar" style="width:36px;height:36px;font-size:12px;background:hsl(${200 + i * 20},70%,${40 + i * 5}%)">${member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}</div>
            <div style="flex:1;">
              <p class="rank-title" style="white-space:normal;">${member.name}</p>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, (count / maxCount) * 100)}%"></div></div>
            </div>
            <span style="font-size:11.5px;color:var(--slate-400);font-weight:600;flex-shrink:0;">${count} emprunt${count > 1 ? "s" : ""}</span>
          </div>`,
          )
          .join("")}
      </div>

      <div class="card card-pad">
        <div class="card-header-row">
          <div><h3>Emprunts en retard</h3><p style="font-size:12px;color:var(--slate-400);margin-top:2px;">À relancer en priorité</p></div>
          <button class="link-btn" data-goto="emprunts">Voir tout →</button>
        </div>
        ${
          overdueLoans.length === 0
            ? `<div class="empty-state" style="padding:32px 0;">
               <div class="empty-icon" style="background:rgba(16,185,129,.1);">${icon("check", { size: 20 })}</div>
               <p class="title">Aucun retard</p><p>Tout est à jour !</p>
             </div>`
            : overdueLoans
                .map((loan) => {
                  const book = findBook(loan.bookId);
                  const member = findMember(loan.memberId);
                  const d = daysBetween(loan.dueDate);
                  return `
              <div class="overdue-row">
                <div class="overdue-icon">${icon("warn", { size: 14 })}</div>
                <div style="flex:1;min-width:0;">
                  <p class="rank-title">${book?.title || ""}</p>
                  <p class="rank-sub">${member?.name || ""}</p>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  <p style="font-size:11.5px;font-weight:800;color:var(--red);">${d}j</p>
                  <p style="font-size:10px;color:var(--slate-400);">${formatDate(loan.dueDate)}</p>
                </div>
              </div>`;
                })
                .join("")
        }
      </div>
    </div>
  </div>`;
}

export function init({ navigate }) {
  document
    .querySelectorAll("[data-goto]")
    .forEach((b) =>
      b.addEventListener("click", () => navigate(b.getAttribute("data-goto"))),
    );
  wireChartTooltips(document.getElementById("page-content"));
}
