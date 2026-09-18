import { state, booksApi, findAuthor } from "../data.js";
import {
  icon,
  renderBadge,
  renderEmptyState,
  openModal,
  closeModal,
  showToast,
  inputField,
  selectField,
  formActions,
} from "../components.js";

const PAGE_SIZE = 8;
let ui = { search: "", status: "", author: "", page: 1 };

function filteredBooks() {
  const q = ui.search.toLowerCase();
  return state.books.filter((b) => {
    const author = findAuthor(b.authorId);
    if (
      q &&
      !b.title.toLowerCase().includes(q) &&
      !author?.name.toLowerCase().includes(q)
    )
      return false;
    if (ui.status && b.status !== ui.status) return false;
    if (ui.author && b.authorId !== ui.author) return false;
    return true;
  });
}

export function render() {
  const filtered = filteredBooks();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  ui.page = Math.min(ui.page, totalPages);
  const rows = filtered.slice((ui.page - 1) * PAGE_SIZE, ui.page * PAGE_SIZE);
  const hasFilters = ui.search || ui.status || ui.author;

  return `
  <div class="stack" style="gap:16px;">
    <div class="toolbar" style="margin-bottom:0;">
      <div class="search-field">${icon("search", { size: 14 })}<input id="book-search" placeholder="Rechercher par titre ou auteur…" value="${ui.search}" /></div>
      <select id="book-filter-status" class="select-field">
        <option value="">Tous les statuts</option>
        <option value="available" ${ui.status === "available" ? "selected" : ""}>Disponible</option>
        <option value="borrowed" ${ui.status === "borrowed" ? "selected" : ""}>Emprunté</option>
        <option value="reserved" ${ui.status === "reserved" ? "selected" : ""}>Réservé</option>
      </select>
      <select id="book-filter-author" class="select-field">
        <option value="">Tous les auteurs</option>
        ${state.authors.map((a) => `<option value="${a.id}" ${ui.author === a.id ? "selected" : ""}>${a.name}</option>`).join("")}
      </select>
      ${hasFilters ? `<button class="btn btn-outline" id="book-reset">Réinitialiser</button>` : ""}
      <button class="btn btn-primary" id="book-add">${icon("plus", { size: 14, stroke: 2.5 })} Ajouter un livre</button>
    </div>

    <div class="card" style="display:flex;flex-direction:column;">
      <div class="table-wrap">
        ${
          rows.length === 0
            ? renderEmptyState(
                "book",
                "Aucun livre trouvé",
                "Essayez d'ajuster vos filtres",
              )
            : `
        <table>
          <thead><tr><th>Titre</th><th>Auteur</th><th>Année</th><th>Statut</th><th>Réservations</th><th></th></tr></thead>
          <tbody>
            ${rows
              .map((b) => {
                const author = findAuthor(b.authorId);
                return `
              <tr data-id="${b.id}">
                <td class="title-cell"><div class="book-thumb">${icon("bookFilled", { size: 12, filled: true })}</div>${b.title}</td>
                <td>${author?.name || ""}</td>
                <td>${b.year}</td>
                <td>${renderBadge(b.status)}</td>
                <td>${b.reservations.length ? `<span style="color:var(--amber-dark);font-weight:600;">${b.reservations.length} en attente</span>` : "—"}</td>
                <td>
                  <div class="action-row">
                    <button class="chip chip-blue" data-edit>Modifier</button>
                    ${b.status === "borrowed" ? `<button class="chip chip-amber" data-reserve>Réserver</button>` : ""}
                    <button class="chip chip-red" data-delete>Supprimer</button>
                  </div>
                </td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>`
        }
      </div>
      ${
        totalPages > 1
          ? `
      <div class="pagination">
        <p style="font-size:11.5px;color:var(--slate-400);">${filtered.length} résultat${filtered.length > 1 ? "s" : ""}</p>
        <div class="pages">
          <button class="page-btn" id="page-prev" ${ui.page === 1 ? "disabled" : ""}>← Précédent</button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1)
            .map(
              (p) =>
                `<button class="page-btn ${p === ui.page ? "active" : ""}" data-page="${p}">${p}</button>`,
            )
            .join("")}
          <button class="page-btn" id="page-next" ${ui.page === totalPages ? "disabled" : ""}>Suivant →</button>
        </div>
      </div>`
          : ""
      }
    </div>
  </div>`;
}

export function init({ navigate }) {
  const rerender = () => {
    document.getElementById("page-content").innerHTML = render();
    init({ navigate });
  };

  document.getElementById("book-search").addEventListener("input", (e) => {
    ui.search = e.target.value;
    ui.page = 1;
    rerender();
  });
  document
    .getElementById("book-filter-status")
    .addEventListener("change", (e) => {
      ui.status = e.target.value;
      ui.page = 1;
      rerender();
    });
  document
    .getElementById("book-filter-author")
    .addEventListener("change", (e) => {
      ui.author = e.target.value;
      ui.page = 1;
      rerender();
    });
  document.getElementById("book-reset")?.addEventListener("click", () => {
    ui = { search: "", status: "", author: "", page: 1 };
    rerender();
  });
  document
    .getElementById("book-add")
    .addEventListener("click", () => openAddModal(rerender));
  document.getElementById("page-prev")?.addEventListener("click", () => {
    ui.page--;
    rerender();
  });
  document.getElementById("page-next")?.addEventListener("click", () => {
    ui.page++;
    rerender();
  });
  document.querySelectorAll("[data-page]").forEach((b) =>
    b.addEventListener("click", () => {
      ui.page = Number(b.dataset.page);
      rerender();
    }),
  );

  document.querySelectorAll("tr[data-id]").forEach((row) => {
    const id = row.dataset.id;
    const book = state.books.find((b) => b.id === id);
    row
      .querySelector("[data-edit]")
      ?.addEventListener("click", () => openEditModal(book, rerender));
    row
      .querySelector("[data-delete]")
      ?.addEventListener("click", () => openDeleteModal(book, rerender));
    row
      .querySelector("[data-reserve]")
      ?.addEventListener("click", () => openReserveModal(book, rerender));
  });
}

function authorOptions() {
  return state.authors.map((a) => ({ value: a.id, label: a.name }));
}

function openAddModal(rerender) {
  openModal({
    title: "Ajouter un livre",
    bodyHTML: `
      <form id="book-form">
        ${inputField({ id: "title", label: "Titre du livre", placeholder: "Ex: L'Étranger" })}
        ${selectField({ id: "authorId", label: "Auteur", options: authorOptions() })}
        ${inputField({ id: "year", label: "Année de publication", type: "number", value: new Date().getFullYear(), extra: `max="${new Date().getFullYear()}"` })}
        ${formActions({ submitLabel: "Ajouter le livre" })}
      </form>`,
    onMount: () => {
      document
        .getElementById("book-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const title = fd.get("title").trim(),
            authorId = fd.get("authorId"),
            year = fd.get("year");
          const currentYear = new Date().getFullYear();
          if (!title || !authorId || !year) {
            showToast({
              type: "error",
              message: "Merci de remplir tous les champs.",
            });
            return;
          }
          if (Number(year) > currentYear) {
            showToast({
              type: "error",
              message: `L'année ne peut pas dépasser ${currentYear}.`,
            });
            return;
          }
          try {
            await booksApi.add({
              title,
              authorId,
              year: Number(year),
              status: "available",
            });
            closeModal();
            rerender();
            showToast({
              type: "success",
              message: "Livre ajouté avec succès.",
            });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openEditModal(book, rerender) {
  openModal({
    title: "Modifier le livre",
    bodyHTML: `
      <form id="book-form">
        ${inputField({ id: "title", label: "Titre du livre", value: book.title })}
        ${selectField({ id: "authorId", label: "Auteur", options: authorOptions(), value: book.authorId })}
        ${inputField({ id: "year", label: "Année de publication", type: "number", value: book.year, extra: `max="${new Date().getFullYear()}"` })}
        ${formActions()}
      </form>`,
    onMount: () => {
      document
        .getElementById("book-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const year = fd.get("year");
          const currentYear = new Date().getFullYear();
          if (Number(year) > currentYear) {
            showToast({
              type: "error",
              message: `L'année ne peut pas dépasser ${currentYear}.`,
            });
            return;
          }
          try {
            await booksApi.update({
              ...book,
              title: fd.get("title").trim(),
              authorId: fd.get("authorId"),
              year: Number(year),
            });
            closeModal();
            rerender();
            showToast({ type: "success", message: "Livre modifié." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}
function openDeleteModal(book, rerender) {
  openModal({
    title: "Supprimer le livre",
    bodyHTML: `
      <div class="modal-alert modal-alert-danger">Voulez-vous vraiment supprimer <strong>« ${book.title} »</strong> ? Cette action est irréversible.</div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-action="cancel">Annuler</button>
        <button type="button" class="btn btn-danger" id="confirm-delete">Supprimer</button>
      </div>`,
    onMount: () => {
      document
        .getElementById("confirm-delete")
        .addEventListener("click", async () => {
          try {
            await booksApi.remove(book.id);
            closeModal();
            rerender();
            showToast({ type: "info", message: "Livre supprimé." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openReserveModal(book, rerender) {
  const available = state.members.filter(
    (m) => !book.reservations.includes(m.id),
  );
  openModal({
    title: "Réserver ce livre",
    bodyHTML: `
      <div class="modal-alert modal-alert-amber">${icon("warn", { size: 16 })}<p><strong>${book.title}</strong> est actuellement emprunté. ${book.reservations.length ? `${book.reservations.length} réservation(s) en attente.` : ""}</p></div>
      <div style="margin-top:16px;">${selectField({ id: "memberId", label: "Adhérent", options: available.map((m) => ({ value: m.id, label: m.name })) })}</div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-action="cancel">Annuler</button>
        <button type="button" class="btn btn-primary" id="confirm-reserve" disabled>Réserver</button>
      </div>`,
    onMount: (root) => {
      const select = root.querySelector("#memberId");
      const confirmBtn = root.querySelector("#confirm-reserve");
      select.addEventListener("change", () => {
        confirmBtn.disabled = !select.value;
      });
      confirmBtn.addEventListener("click", async () => {
        if (!select.value) return;
        try {
          await booksApi.reserve(book.id, select.value);
          const pos = book.reservations.length;
          closeModal();
          rerender();
          showToast({
            type: "success",
            message: `Réservé ! Vous êtes en position #${pos}.`,
          });
        } catch (err) {
          showToast({ type: "error", message: err.message });
        }
      });
    },
  });
}
