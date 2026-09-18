import { state } from "../data.js";
import { icon, showToast, inputField } from "../components.js";

export function render() {
  const u = state.currentUser;
  return `
  <div class="profile-hero" style="margin-bottom:20px;">
    <div class="orb-a"></div><div class="orb-b"></div>
    <div class="profile-hero-row">
      <div class="avatar-lg">${u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}</div>
      <div>
        <h2>${u.name}</h2>
        <p class="sub1">${u.role}</p>
        <p class="sub2">${u.email} · ${u.phone}</p>
      </div>
    </div>
  </div>

  <div class="card card-pad" style="max-width:480px;">
    <div class="card-header"><h3>Modifier mes informations</h3><p>Ces informations sont visibles par les autres administrateurs</p></div>
    <form id="profile-form">
      ${inputField({ id: "name", label: "Nom complet", value: u.name })}
      ${inputField({ id: "email", label: "Email", type: "email", value: u.email })}
      ${inputField({ id: "phone", label: "Téléphone", type: "tel", value: u.phone })}
      <div class="modal-actions" style="justify-content:flex-start;">
        <button type="submit" class="btn btn-primary">${icon("check", { size: 14, stroke: 2.5 })} Enregistrer les modifications</button>
      </div>
    </form>
  </div>`;
}

export function init() {
  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.currentUser.name = fd.get("name").trim() || state.currentUser.name;
    state.currentUser.email = fd.get("email").trim() || state.currentUser.email;
    state.currentUser.phone = fd.get("phone").trim() || state.currentUser.phone;
    showToast({ type: "success", message: "Profil mis à jour." });
    document.querySelector(".sidebar-user-card p").textContent =
      state.currentUser.name;
  });
}
