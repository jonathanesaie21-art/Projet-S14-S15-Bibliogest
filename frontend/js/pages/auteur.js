import { state, authorsApi } from "../data.js";
import {
  icon,
  renderAvatar,
  renderEmptyState,
  openModal,
  closeModal,
  showToast,
  inputField,
  formActions,
} from "../components.js";

let search = "";

function bookCount(authorId) {
  return state.books.filter((b) => b.authorId === authorId).length;
}
function filtered() {
  const q = search.toLowerCase();
  return state.authors.filter(
    (a) =>
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.nationality.toLowerCase().includes(q),
  );
}

export function render() {
  const rows = filtered();
  return `
  <div class="stack" style="gap:16px;">
    <div class="toolbar" style="margin-bottom:0;">
      <div class="search-field">${icon("search", { size: 14 })}<input id="author-search" placeholder="Rechercher un auteur…" value="${search}" /></div>
      <button class="btn btn-primary" id="author-add">${icon("plus", { size: 14, stroke: 2.5 })} Ajouter un auteur</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        ${
          rows.length === 0
            ? renderEmptyState("pen", "Aucun auteur trouvé")
            : `
        <table>
          <thead><tr><th>Auteur</th><th>Nationalité</th><th>Livres</th><th></th></tr></thead>
          <tbody>
            ${rows
              .map(
                (a, i) => `
            <tr data-id="${a.id}">
              <td class="title-cell">${renderAvatar(a.name, i)}${a.name}</td>
              <td>${a.nationality}</td>
              <td><span class="chip chip-navy">${icon("book", { size: 10 })} ${bookCount(a.id)} livre${bookCount(a.id) !== 1 ? "s" : ""}</span></td>
              <td><div class="action-row"><button class="chip chip-blue" data-edit>Modifier</button><button class="chip chip-red" data-delete>Supprimer</button></div></td>
            </tr>`,
              )
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
  document.getElementById("author-search").addEventListener("input", (e) => {
    search = e.target.value;
    rerender();
  });
  document
    .getElementById("author-add")
    .addEventListener("click", () => openAddModal(rerender));
  document.querySelectorAll("tr[data-id]").forEach((row) => {
    const author = state.authors.find((a) => a.id === row.dataset.id);
    row
      .querySelector("[data-edit]")
      .addEventListener("click", () => openEditModal(author, rerender));
    row
      .querySelector("[data-delete]")
      .addEventListener("click", () => openDeleteModal(author, rerender));
  });
}

function openAddModal(rerender) {
  openModal({
    title: "Ajouter un auteur",
    bodyHTML: `
      <form id="author-form">
        ${inputField({ id: "name", label: "Nom complet", placeholder: "Ex: Albert Camus" })}
        ${inputField({ id: "nationality", label: "Nationalité", placeholder: "Ex: Français" })}
        ${formActions({ submitLabel: "Ajouter" })}
      </form>`,
    onMount: () => {
      document
        .getElementById("author-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const name = fd.get("name").trim(),
            nationality = fd.get("nationality").trim();
          if (!name || !nationality) {
            showToast({
              type: "error",
              message: "Merci de remplir tous les champs.",
            });
            return;
          }
          try {
            await authorsApi.add({ name, nationality });
            closeModal();
            rerender();
            showToast({
              type: "success",
              message: "Auteur ajouté avec succès.",
            });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openEditModal(author, rerender) {
  openModal({
    title: "Modifier l'auteur",
    bodyHTML: `
      <form id="author-form">
        ${inputField({ id: "name", label: "Nom complet", value: author.name })}
        ${inputField({ id: "nationality", label: "Nationalité", value: author.nationality })}
        ${formActions()}
      </form>`,
    onMount: () => {
      document
        .getElementById("author-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await authorsApi.update({
              ...author,
              name: fd.get("name").trim(),
              nationality: fd.get("nationality").trim(),
            });
            closeModal();
            rerender();
            showToast({ type: "success", message: "Auteur modifié." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openDeleteModal(author, rerender) {
  const count = bookCount(author.id);
  openModal({
    title: "Supprimer l'auteur",
    bodyHTML: `
      <div class="modal-alert modal-alert-danger">
        Supprimer <strong>${author.name}</strong> ?
        ${count > 0 ? `<br /><span style="color:#b45309;font-weight:600;">⚠ Cet auteur a ${count} livre(s) associé(s).</span>` : ""}
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-action="cancel">Annuler</button>
        <button type="button" class="btn btn-danger" id="confirm-delete">Supprimer</button>
      </div>`,
    onMount: () => {
      document
        .getElementById("confirm-delete")
        .addEventListener("click", async () => {
          try {
            await authorsApi.remove(author.id);
            closeModal();
            rerender();
            showToast({ type: "info", message: "Auteur supprimé." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}
