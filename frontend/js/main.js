import {
  isAuthenticated,
  renderLoginPage,
  renderResetPasswordPage,
} from "./auth.js";
import { mountAppShell } from "./router.js";
import { loadInitialData } from "./data.js";

async function boot() {
  const resetToken = new URLSearchParams(window.location.search).get(
    "resetToken",
  );
  if (resetToken) {
    renderResetPasswordPage(resetToken, () => {
      window.history.replaceState({}, "", window.location.pathname);
      boot();
    });
    return;
  }

  if (!isAuthenticated()) {
    renderLoginPage(boot);
    return;
  }

  try {
    await loadInitialData();
  } catch (err) {
    console.error("Impossible de charger les données depuis l'API :", err);
    document.getElementById("app").innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#334155;text-align:center;padding:24px;">
        <div>
          <p style="font-weight:700;font-size:18px;margin-bottom:8px;">Impossible de joindre le serveur</p>
          <p style="color:#64748b;">Vérifie que le backend tourne (node server.js) sur http://localhost:3000, puis recharge la page.</p>
        </div>
      </div>`;
    return;
  }

  mountAppShell(boot);
}

document.addEventListener("DOMContentLoaded", boot);
