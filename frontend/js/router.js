/**
 * router.js — mini routeur 
 * Affiche la sidebar + la topbar une seule fois, puis ne remplace que le
 * contenu de #page-content à chaque navigation.
 */
import { state } from "./data.js";
import { renderSidebar, renderTopbar } from "./components.js";
import { setAuthenticated } from "./auth.js";
import { initNotifDropdown } from "./pages/notifications.js";

import * as Dashboard from "./pages/dashboard.js";
import * as Livres from "./pages/livre.js";
import * as Auteurs from "./pages/auteur.js";
import * as Adherents from "./pages/adherant.js";
import * as Emprunts from "./pages/emprunt.js";
import * as Statistiques from "./pages/statistique.js";
import * as Profil from "./pages/profil.js";
import * as Parametres from "./pages/parametre.js";

const PAGES = {
  dashboard: {
    title: "Tableau de bord",
    subtitle: () => `Bienvenue, ${state.currentUser.name.split(" ")[0]} 👋`,
    mod: Dashboard,
  },
  livres: {
    title: "Livres",
    subtitle: () => "Gérez votre catalogue",
    mod: Livres,
  },
  auteurs: {
    title: "Auteurs",
    subtitle: () => "Gérez les auteurs",
    mod: Auteurs,
  },
  adherents: {
    title: "Adhérents",
    subtitle: () => "Gérez les membres",
    mod: Adherents,
  },
  emprunts: {
    title: "Emprunts",
    subtitle: () => "Suivez les emprunts",
    mod: Emprunts,
  },
  statistiques: {
    title: "Statistiques",
    subtitle: () => "Analyses et rapports",
    mod: Statistiques,
  },
  profil: {
    title: "Profil",
    subtitle: () => "Vos informations personnelles",
    mod: Profil,
  },
  parametres: {
    title: "Paramètres",
    subtitle: () => "Préférences de l'application",
    mod: Parametres,
  },
};

let currentKey = "dashboard";
let onLogout = () => {};

export function mountAppShell(handleLogout) {
  onLogout = handleLogout;
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar(currentKey)}
      <div class="main-area">
        <div id="topbar-slot"></div>
        <div id="page-content" class="page-content"></div>
      </div>
    </div>`;
  wireSidebar();
  navigate("dashboard");
}

function wireSidebar() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-nav");
      if (key === "logout") {
        setAuthenticated(false);
        onLogout();
        return;
      }
      navigate(key);
    });
  });
}

export function navigate(key) {
  const page = PAGES[key];
  if (!page) return;
  currentKey = key;

  // Sidebar : ré-applique l'état actif
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-nav") === key);
  });

  // Topbar
  document.getElementById("topbar-slot").innerHTML = renderTopbar(
    page.title,
    page.subtitle(),
  );
  initNotifDropdown();

  // Contenu de page
  if (typeof page.mod.reset === "function") page.mod.reset();
  const content = document.getElementById("page-content");
  content.innerHTML = page.mod.render();
  if (typeof page.mod.init === "function") page.mod.init({ navigate });
}
