import { showToast } from "../components.js";

const OPTIONS = [
  {
    id: "notif-email",
    label: "Notifications par email",
    desc: "Recevoir un email pour chaque nouvel emprunt en retard.",
    checked: true,
  },
  {
    id: "notif-reservation",
    label: "Alertes de réservation",
    desc: "Être notifié quand un livre réservé redevient disponible.",
    checked: true,
  },
  {
    id: "notif-relance",
    label: "Relances automatiques",
    desc: "Envoyer un rappel automatique 2 jours avant l'échéance.",
    checked: false,
  },
];

export function render() {
  return `
  <div class="stack">
    <div class="card card-pad" style="max-width:560px;">
      <div class="card-header"><h3>Notifications</h3><p>Choisissez les alertes que vous souhaitez recevoir</p></div>
      <form id="settings-form">
        ${OPTIONS.map(
          (o) => `
          <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--slate-50);cursor:pointer;">
            <input type="checkbox" id="${o.id}" ${o.checked ? "checked" : ""} style="margin-top:3px;width:16px;height:16px;accent-color:#3b8ff3;" />
            <span><span style="display:block;font-weight:600;font-size:13.5px;color:var(--slate-700);">${o.label}</span><span style="display:block;font-size:12px;color:var(--slate-400);margin-top:2px;">${o.desc}</span></span>
          </label>`,
        ).join("")}
        <div class="modal-actions" style="justify-content:flex-start;margin-top:16px;">
          <button type="submit" class="btn btn-primary">Enregistrer les préférences</button>
        </div>
      </form>
    </div>

    <div class="card card-pad" style="max-width:560px;">
      <div class="card-header"><h3>Langue de l'interface</h3><p>Cette option n'affecte pas encore les données</p></div>
      <select class="form-select" style="max-width:220px;">
        <option>Français</option>
        <option>English</option>
      </select>
    </div>
  </div>`;
}

export function init() {
  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    showToast({ type: "success", message: "Préférences enregistrées." });
  });
}
