import {
  state,
  loansApi,
  findBook,
  findMember,
  formatDate,
  daysBetween,
} from "../data.js";
import {
  icon,
  renderBadge,
  renderEmptyState,
  openModal,
  closeModal,
  showToast,
  selectField,
  inputField,
  formActions,
} from "../components.js";

let ui = { tab: "active" };

export function render() {
  const activeLoans = state.loans.filter((l) => l.status === "active");
  const overdueLoans = state.loans.filter((l) => l.status === "overdue");
  const displayed = ui.tab === "active" ? activeLoans : overdueLoans;

  return `
  <div class="stack" style="gap:16px;">
    <div class="flex items-center gap-3" style="flex-wrap:wrap;justify-content:space-between;">
      <div class="tabs">
        <button class="tab-btn ${ui.tab === "active" ? "active" : ""}" data-tab="active">En cours <span class="count">${activeLoans.length}</span></button>
        <button class="tab-btn tab-danger ${ui.tab === "overdue" ? "active" : ""}" data-tab="overdue">En retard <span class="count">${overdueLoans.length}</span></button>
      </div>
      <div class="flex gap-2">
        ${ui.tab === "overdue" && overdueLoans.length > 0 ? `<button class="btn btn-outline" id="export-csv">${icon("download", { size: 14 })} Export CSV</button>` : ""}
        <button class="btn btn-primary" id="new-loan">${icon("plus", { size: 14, stroke: 2.5 })} Nouvel emprunt</button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        ${
          displayed.length === 0
            ? renderEmptyState(
                ui.tab === "overdue" ? "check" : "swap",
                ui.tab === "active"
                  ? "Aucun emprunt en cours"
                  : "Aucun retard — tout est à jour !",
              )
            : `
        <table>
          <thead><tr><th>Livre</th><th>Adhérent</th><th>Emprunté le</th><th>Retour prévu</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${displayed
              .map((loan) => {
                const book = findBook(loan.bookId);
                const member = findMember(loan.memberId);
                const d =
                  loan.status === "overdue" ? daysBetween(loan.dueDate) : 0;
                return `
              <tr data-id="${loan.id}" class="${loan.status === "overdue" ? "row-overdue" : ""}">
                <td class="title-cell"><div class="book-thumb">${icon("bookFilled", { size: 10, filled: true })}</div>${book?.title || "—"}</td>
                <td>${member?.name || "—"}</td>
                <td style="color:var(--slate-400);">${formatDate(loan.loanDate)}</td>
                <td>
                  <p style="font-weight:600;color:${loan.status === "overdue" ? "var(--red)" : "var(--slate-600)"};">${formatDate(loan.dueDate)}</p>
                  ${loan.status === "overdue" ? `<p style="font-size:11px;font-weight:600;color:var(--red);">${d}j de retard</p>` : ""}
                </td>
                <td>${renderBadge(loan.status)}</td>
                <td><button class="btn btn-success btn-sm" data-return>${icon("check", { size: 11, stroke: 2.5 })} Retour</button></td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>`
        }
      </div>
    </div>
  </div>`;
}

export function init({ navigate }) {
  const rerender = () => {
    document.getElementById("page-content").innerHTML = render();
    init({ navigate });
  };

  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      ui.tab = b.dataset.tab;
      rerender();
    }),
  );
  document
    .getElementById("new-loan")
    .addEventListener("click", () => openNewLoanModal(rerender));
  document.getElementById("export-csv")?.addEventListener("click", exportCSV);
  document.querySelectorAll("tr[data-id]").forEach((row) => {
    const loan = state.loans.find((l) => l.id === row.dataset.id);
    row
      .querySelector("[data-return]")
      .addEventListener("click", () => openReturnModal(loan, rerender));
  });
}

function openNewLoanModal(rerender) {
  const memberOpts = state.members.map((m) => ({ value: m.id, label: m.name }));
  const bookOpts = state.books.map((b) => ({
    value: b.id,
    label: `${b.title}${b.status !== "available" ? " (indisponible)" : ""}`,
  }));
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  openModal({
    title: "Nouvel emprunt",
    size: "lg",
    bodyHTML: `
      <form id="loan-form">
        ${selectField({ id: "memberId", label: "Adhérent", options: memberOpts })}
        ${selectField({ id: "bookId", label: "Livre", options: bookOpts })}
        <div id="book-hint" style="margin:-8px 0 16px;"></div>
        ${inputField({ id: "dueDate", label: "Date de retour prévue", type: "date", extra: `min="${minDateStr}"` })}
        ${formActions({ submitLabel: "Enregistrer l'emprunt" })}
      </form>`,
    onMount: (root) => {
      const bookSelect = root.querySelector("#bookId");
      const hint = root.querySelector("#book-hint");
      const submitBtn = root.querySelector('button[type="submit"]');
      const updateHint = () => {
        const book = state.books.find((b) => b.id === bookSelect.value);
        if (!book) {
          hint.innerHTML = "";
          submitBtn.disabled = false;
          return;
        }
        const ok = book.status === "available";
        hint.innerHTML = `<div class="field-hint ${ok ? "field-hint-ok" : "field-hint-bad"}">${icon(ok ? "check" : "warn", { size: 12, stroke: 2.5 })} ${ok ? "Livre disponible" : "Livre déjà emprunté"}</div>`;
        submitBtn.disabled = !ok;
      };
      bookSelect.addEventListener("change", updateHint);
      root.querySelector("#loan-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const memberId = fd.get("memberId"),
          bookId = fd.get("bookId"),
          dueDate = fd.get("dueDate");
        const book = state.books.find((b) => b.id === bookId);
        if (!memberId || !bookId || !dueDate || book?.status !== "available") {
          showToast({
            type: "error",
            message: "Merci de vérifier les informations saisies.",
          });
          return;
        }
        try {
          await loansApi.create(bookId, memberId, dueDate);
          closeModal();
          rerender();
          showToast({
            type: "success",
            message: "Emprunt enregistré avec succès.",
          });
        } catch (err) {
          // Ex: quelqu'un d'autre a emprunté ce livre entre l'ouverture de la
          // modale et la validation — le serveur refuse, le message l'explique.
          showToast({ type: "error", message: err.message });
        }
      });
    },
  });
}

function openReturnModal(loan, rerender) {
  const book = findBook(loan.bookId);
  openModal({
    title: "Confirmer le retour",
    bodyHTML: `
      <div class="modal-alert modal-alert-success">${icon("circleCheck", { size: 18 })}<p>Confirmer le retour de <strong>${book?.title || ""}</strong> ?</p></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-action="cancel">Annuler</button>
        <button type="button" class="btn btn-success" id="confirm-return">Confirmer le retour</button>
      </div>`,
    onMount: () => {
      document
        .getElementById("confirm-return")
        .addEventListener("click", async () => {
          try {
            await loansApi.markReturned(loan.id);
            closeModal();
            rerender();
            showToast({
              type: "success",
              message: "Retour enregistré avec succès.",
            });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function exportCSV() {
  const overdue = state.loans.filter((l) => l.status === "overdue");
  const rows = [
    ["Livre", "Adhérent", "Emprunté le", "Retour prévu", "Jours de retard"],
    ...overdue.map((l) => {
      const book = findBook(l.bookId),
        member = findMember(l.memberId);
      return [
        book?.title || "",
        member?.name || "",
        l.loanDate,
        l.dueDate,
        daysBetween(l.dueDate),
      ];
    }),
  ];
  const blob = new Blob([rows.map((r) => r.join(";")).join("\n")], {
    type: "text/csv",
  });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "retards.csv",
  });
  a.click();
  URL.revokeObjectURL(a.href);
  showToast({ type: "success", message: "Export CSV téléchargé." });
}
