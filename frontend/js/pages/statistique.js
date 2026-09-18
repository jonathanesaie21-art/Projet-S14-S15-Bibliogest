import { state, findBook, findMember, computeLoanTrend } from "../data.js";
import {
  renderStatCard,
  createAreaChart,
  createDonutChart,
  createBarChartH,
  createBarChartV,
  wireChartTooltips,
} from "../components.js";

export function render() {
  const available = state.books.filter((b) => b.status === "available").length;
  const borrowed = state.books.filter((b) => b.status === "borrowed").length;
  const reserved = state.books.filter((b) => b.status === "reserved").length;
  const activeLoans = state.loans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  ).length;
  const overdueLoans = state.loans.filter((l) => l.status === "overdue").length;

  const loanCounts = {};
  state.loans.forEach(
    (l) => (loanCounts[l.bookId] = (loanCounts[l.bookId] || 0) + 1),
  );
  const topBooks = Object.entries(loanCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({
      name: (findBook(id)?.title || id).slice(0, 22),
      count,
    }));

  const memberCounts = {};
  state.loans.forEach(
    (l) => (memberCounts[l.memberId] = (memberCounts[l.memberId] || 0) + 1),
  );
  const topMembers = Object.entries(memberCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      name: findMember(id)?.name?.split(" ")[0] || id,
      count,
    }));

  const pieData = [
    { name: "Disponibles", value: available, color: "#10b981" },
    { name: "Empruntés", value: borrowed, color: "#3b8ff3" },
    { name: "Réservés", value: reserved, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return `
  <div class="stack">
    <div class="grid cols-3">
      ${renderStatCard({ label: "Total livres", value: state.books.length, iconName: "book", variant: "navy" })}
      ${renderStatCard({ label: "Disponibles", value: available, iconName: "check", variant: "green" })}
      ${renderStatCard({ label: "Empruntés", value: borrowed, iconName: "swap", variant: "blue" })}
    </div>
    <div class="grid cols-3">
      ${renderStatCard({ label: "Adhérents", value: state.members.length, iconName: "member", variant: "purple" })}
      ${renderStatCard({ label: "Emprunts actifs", value: activeLoans, iconName: "clock", variant: "amber" })}
      ${renderStatCard({ label: "En retard", value: overdueLoans, iconName: "warn", variant: "red" })}
    </div>

    <div class="grid cols-2">
      <div class="card card-pad">
        <div class="card-header"><h3>Tendance des emprunts</h3><p>7 derniers jours</p></div>
        ${createAreaChart(computeLoanTrend(), { color: "#1e3a5f", gradId: "statAreaGrad" })}
      </div>
      <div class="card card-pad">
        <div class="card-header"><h3>Disponibilité des livres</h3><p>Répartition actuelle</p></div>
        ${createDonutChart(pieData)}
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card card-pad">
        <div class="card-header"><h3>Livres les plus empruntés</h3><p>Top 6</p></div>
        ${createBarChartH(topBooks)}
      </div>
      <div class="card card-pad">
        <div class="card-header"><h3>Adhérents les plus actifs</h3><p>Top 5</p></div>
        ${createBarChartV(topMembers)}
      </div>
    </div>
  </div>`;
}

export function init() {
  wireChartTooltips(document.getElementById("page-content"));
}
