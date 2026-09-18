import { state, membersApi, findBook, formatDate } from "../data.js";
import {
  icon,
  renderAvatar,
  renderBadge,
  renderEmptyState,
  openModal,
  closeModal,
  showToast,
  inputField,
  formActions,
} from "../components.js";

let ui = { view: "list", search: "", selectedId: null };

function activeLoansCount(id) {
  return state.loans.filter((l) => l.memberId === id && l.status !== "returned")
    .length;
}
function totalLoansCount(id) {
  return state.loans.filter((l) => l.memberId === id).length;
}
function filtered() {
  const q = ui.search.toLowerCase();
  return state.members.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q),
  );
}

export function render() {
  return ui.view === "profile" ? renderProfile() : renderList();
}

/** Appelé par le routeur quand on arrive sur la page via la sidebar : on repart de la liste. */
export function reset() {
  ui.view = "list";
  ui.selectedId = null;
}

function renderList() {
  const rows = filtered();
  return `
  <div class="stack" style="gap:16px;">
    <div class="toolbar" style="margin-bottom:0;">
      <div class="search-field">${icon("search", { size: 14 })}<input id="member-search" placeholder="Rechercher par nom ou email…" value="${ui.search}" /></div>
      <button class="btn btn-primary" id="member-add">${icon("plus", { size: 14, stroke: 2.5 })} Ajouter un adhérent</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        ${
          rows.length === 0
            ? renderEmptyState("member", "Aucun adhérent trouvé")
            : `
        <table>
          <thead><tr><th>Adhérent</th><th>Contact</th><th>En cours</th><th>Total</th><th></th></tr></thead>
          <tbody>
            ${rows
              .map((m, i) => {
                const active = activeLoansCount(m.id);
                return `
              <tr data-id="${m.id}">
                <td class="title-cell">${renderAvatar(m.name, i)}<div><p style="font-weight:600;color:var(--slate-800);">${m.name}</p><p style="font-size:11.5px;color:var(--slate-400);">Membre depuis ${formatDate(m.joinDate)}</p></div></td>
                <td><p style="color:var(--slate-600);">${m.email}</p><p style="font-size:11.5px;color:var(--slate-400);">${m.phone}</p></td>
                <td>${active > 0 ? `<span class="chip chip-blue">${active} en cours</span>` : `<span style="color:var(--slate-400);">—</span>`}</td>
                <td>${totalLoansCount(m.id)}</td>
                <td><div class="action-row"><button class="chip chip-navy" data-profile>Profil</button><button class="chip chip-blue" data-edit>Modifier</button><button class="chip chip-red" data-delete>Supprimer</button></div></td>
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

function renderProfile() {
  const member = state.members.find((m) => m.id === ui.selectedId);
  if (!member) {
    ui.view = "list";
    return renderList();
  }
  const loans = state.loans
    .filter((l) => l.memberId === member.id)
    .sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));
  const active = loans.filter((l) => l.status !== "returned").length;
  const overdue = loans.filter((l) => l.status === "overdue").length;
  const returned = loans.filter((l) => l.status === "returned").length;

  return `
  <button class="back-link" id="back-to-members">${icon("back", { size: 16 })} Retour aux adhérents</button>
  <div class="profile-hero">
    <div class="orb-a"></div><div class="orb-b"></div>
    <div class="profile-hero-row">
      <div class="avatar-lg">${member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}</div>
      <div>
        <h2>${member.name}</h2>
        <p class="sub1">${member.email} · ${member.phone}</p>
        <p class="sub2">Membre depuis le ${new Date(member.joinDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <div class="profile-hero-stats">
        <div class="profile-hero-stat"><p class="num" style="color:#fff;">${loans.length}</p><p class="lbl">Total</p></div>
        <div class="profile-hero-stat"><p class="num" style="color:#7bbfff;">${active}</p><p class="lbl">En cours</p></div>
        <div class="profile-hero-stat"><p class="num" style="color:#fca5a5;">${overdue}</p><p class="lbl">En retard</p></div>
        <div class="profile-hero-stat"><p class="num" style="color:#6ee7b7;">${returned}</p><p class="lbl">Retournés</p></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div style="padding:16px 20px;border-bottom:1px solid var(--slate-100);">
      <h3 style="font-family:var(--font-head);font-weight:700;font-size:14px;color:var(--slate-800);">Historique des emprunts</h3>
      <p style="font-size:12px;color:var(--slate-400);margin-top:2px;">${loans.length} emprunt${loans.length > 1 ? "s" : ""} au total</p>
    </div>
    ${
      loans.length === 0
        ? renderEmptyState("book", "Aucun emprunt enregistré")
        : `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Livre</th><th>Emprunté le</th><th>Retour prévu</th><th>Retourné le</th><th>Statut</th></tr></thead>
        <tbody>
          ${loans
            .map((loan) => {
              const book = findBook(loan.bookId);
              return `
            <tr class="${loan.status === "overdue" ? "row-overdue" : ""}">
              <td class="title-cell"><div class="book-thumb">${icon("bookFilled", { size: 10, filled: true })}</div>${book?.title || "—"}</td>
              <td>${formatDate(loan.loanDate)}</td>
              <td>${formatDate(loan.dueDate)}</td>
              <td>${loan.returnDate ? formatDate(loan.returnDate) : "—"}</td>
              <td>${renderBadge(loan.status)}</td>
            </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`
    }
  </div>`;
}

export function init({ navigate }) {
  const rerender = () => {
    document.getElementById("page-content").innerHTML = render();
    init({ navigate });
  };

  if (ui.view === "profile") {
    document
      .getElementById("back-to-members")
      ?.addEventListener("click", () => {
        ui.view = "list";
        rerender();
      });
    return;
  }

  document.getElementById("member-search").addEventListener("input", (e) => {
    ui.search = e.target.value;
    rerender();
  });
  document
    .getElementById("member-add")
    .addEventListener("click", () => openAddModal(rerender));
  document.querySelectorAll("tr[data-id]").forEach((row) => {
    const member = state.members.find((m) => m.id === row.dataset.id);
    row.querySelector("[data-profile]").addEventListener("click", () => {
      ui.view = "profile";
      ui.selectedId = member.id;
      rerender();
    });
    row
      .querySelector("[data-edit]")
      .addEventListener("click", () => openEditModal(member, rerender));
    row
      .querySelector("[data-delete]")
      .addEventListener("click", () => openDeleteModal(member, rerender));
  });
}

function openAddModal(rerender) {
  openModal({
    title: "Ajouter un adhérent",
    bodyHTML: `
      <form id="member-form">
        ${inputField({ id: "name", label: "Nom complet", placeholder: "Ex: Marie Dupont" })}
        ${inputField({ id: "email", label: "Email", type: "email", placeholder: "marie@email.com" })}
        ${inputField({ id: "phone", label: "Téléphone", type: "tel", placeholder: "06 xx xx xx xx" })}
        ${formActions({ submitLabel: "Ajouter" })}
      </form>`,
    onMount: () => {
      document
        .getElementById("member-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const name = fd.get("name").trim(),
            email = fd.get("email").trim(),
            phone = fd.get("phone").trim();
          if (!name || !email.includes("@")) {
            showToast({ type: "error", message: "Nom ou email invalide." });
            return;
          }
          try {
            await membersApi.add({ name, email, phone });
            closeModal();
            rerender();
            showToast({
              type: "success",
              message: "Adhérent ajouté avec succès.",
            });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openEditModal(member, rerender) {
  openModal({
    title: "Modifier l'adhérent",
    bodyHTML: `
      <form id="member-form">
        ${inputField({ id: "name", label: "Nom complet", value: member.name })}
        ${inputField({ id: "email", label: "Email", type: "email", value: member.email })}
        ${inputField({ id: "phone", label: "Téléphone", type: "tel", value: member.phone })}
        ${formActions()}
      </form>`,
    onMount: () => {
      document
        .getElementById("member-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await membersApi.update({
              ...member,
              name: fd.get("name").trim(),
              email: fd.get("email").trim(),
              phone: fd.get("phone").trim(),
            });
            closeModal();
            rerender();
            showToast({ type: "success", message: "Adhérent modifié." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}

function openDeleteModal(member, rerender) {
  openModal({
    title: "Supprimer l'adhérent",
    bodyHTML: `
      <div class="modal-alert modal-alert-danger">Supprimer <strong>${member.name}</strong> ?</div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-action="cancel">Annuler</button>
        <button type="button" class="btn btn-danger" id="confirm-delete">Supprimer</button>
      </div>`,
    onMount: () => {
      document
        .getElementById("confirm-delete")
        .addEventListener("click", async () => {
          try {
            await membersApi.remove(member.id);
            closeModal();
            rerender();
            showToast({ type: "info", message: "Adhérent supprimé." });
          } catch (err) {
            showToast({ type: "error", message: err.message });
          }
        });
    },
  });
}
