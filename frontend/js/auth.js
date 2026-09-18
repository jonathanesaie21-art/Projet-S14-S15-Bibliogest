/**
 * auth.js — Page de connexion, maintenant branchée sur une vraie
 * authentification Google (Google Identity Services) au lieu du
 * setTimeout simulé.
 *
 * Flux : GIS affiche son propre bouton (rendu dans #google-signin-slot),
 * l'utilisateur clique, Google renvoie un "credential" (un ID token JWT
 * signé par Google) à handleGoogleCredential(). On l'envoie tel quel à
 * notre backend (POST /api/auth/google), qui le vérifie côté serveur et
 * nous renvoie EN ÉCHANGE un token à nous (JWT signé avec notre propre
 * secret) : c'est CE token-là qu'on garde et qu'on utilise pour parler à
 * notre API ensuite (voir data.js : getAuthToken/setAuthToken/apiFetch).
 * On ne fait jamais confiance au ID token Google pour autre chose que ce
 * tout premier échange.
 */
import { state, API_BASE_URL, getAuthToken, setAuthToken } from "./data.js";
import {
  showToast,
  inputField,
  formActions,
  openModal,
  closeModal,
} from "./components.js";

const GOOGLE_CLIENT_ID =
  "995605679479-j2q83lob0ho0o69lrmdkg6o4a15hjchf.apps.googleusercontent.com";

export function isAuthenticated() {
  return !!getAuthToken();
}
export function setAuthenticated(value) {
  if (!value) setAuthToken(null);
}

export function renderLoginPage(onLogin) {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div class="login-screen">
    <aside class="login-aside">
      <div class="grid-overlay"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="sidebar-logo" style="padding:0;">
        <div class="logo-badge">B</div>
        <div class="logo-text"><p>BiblioGest</p><span>BIBLIOTHÈQUE</span></div>
      </div>

      <div class="login-headline-wrap">
        <h2 class="login-headline">Gérez votre<br/><span class="accent">bibliothèque</span><br/>simplement.</h2>
      </div>
      <p class="login-tagline">Suivi des emprunts, gestion des adhérents et du catalogue — tout en un seul endroit.</p>
    </aside>

    <main class="login-main">
      <div class="login-form-wrap">
        <div class="login-mobile-logo">
          <div class="logo-badge" style="width:36px;height:36px;">B</div>
          <span style="font-weight:700;color:var(--slate-800);font-family:var(--font-head);">BiblioGest</span>
        </div>

        <h2>Connexion</h2>
        <p class="lead">Connecte-toi avec ton compte Google pour accéder à l'espace admin.</p>

        <div id="google-signin-slot" style="display:flex;justify-content:center;margin:8px 0 4px;"></div>
        <p id="google-signin-fallback" style="display:none;font-size:12.5px;color:var(--red);text-align:center;margin-top:8px;">
          Impossible de charger la connexion Google. Vérifie ta connexion internet et recharge la page.
        </p>

        <div class="login-divider"><span>ou avec votre e-mail (bientôt disponible)</span></div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Adresse e-mail</label>
            <input class="form-input" id="login-email" type="email" placeholder="esaie@bibliotheque.fr" required />
          </div>
          <div class="form-group">
            <div class="field-row-top">
              <label class="form-label" for="login-password" style="margin:0;">Mot de passe</label>
              <button type="button" class="link-btn" id="forgot-password-btn">Mot de passe oublié ?</button>
            </div>
            <input class="form-input" id="login-password" type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" class="login-submit" id="login-submit" >Se connecter →</button>
        </form>

        <p class="login-footer">BiblioGest © 2026 · Système de gestion de bibliothèque</p>
      </div>
    </main>
  </div>`;

  document
    .getElementById("login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const submitBtn = document.getElementById("login-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Connexion en cours…";
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Échec de la connexion.");
        setAuthToken(data.token);
        state.currentUser = { ...state.currentUser, ...data.user };
        onLogin();
      } catch (err) {
        showToast({ type: "error", message: err.message });
        submitBtn.disabled = false;
        submitBtn.textContent = "Se connecter →";
      }
    });

  document
    .getElementById("forgot-password-btn")
    .addEventListener("click", openForgotPasswordModal);

  initGoogleSignIn(onLogin);
}

function initGoogleSignIn(onLogin, attempt = 0) {
  if (!window.google?.accounts?.id) {
    // Le script accounts.google.com/gsi/client (chargé depuis index.html)
    // peut ne pas être encore prêt au tout premier rendu : on réessaie
    // quelques fois avant d'abandonner et d'afficher un message clair.
    if (attempt < 20) {
      setTimeout(() => initGoogleSignIn(onLogin, attempt + 1), 150);
    } else {
      document.getElementById("google-signin-fallback").style.display = "block";
    }
    return;
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => handleGoogleCredential(response, onLogin),
  });
  window.google.accounts.id.renderButton(
    document.getElementById("google-signin-slot"),
    {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      locale: "fr",
    },
  );
}

async function handleGoogleCredential(response, onLogin) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: response.credential }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || "Échec de la connexion Google.");
    }
    setAuthToken(data.token);
    state.currentUser = { ...state.currentUser, ...data.user };
    onLogin();
  } catch (err) {
    showToast({ type: "error", message: err.message });
  }
}

function openForgotPasswordModal() {
  openModal({
    title: "Mot de passe oublié",
    bodyHTML: `
      <p style="font-size:13px;color:var(--slate-500);margin-bottom:16px;">
        Entrez votre adresse e-mail : si un compte existe, un lien de réinitialisation (valable 30 minutes) vous sera envoyé.
      </p>
      <form id="reset-form">
        ${inputField({ id: "reset-email", label: "Adresse e-mail", type: "email", placeholder: "vous@bibliotheque.fr" })}
        ${formActions({ submitLabel: "Envoyer le lien" })}
      </form>`,
    onMount: () => {
      document
        .getElementById("reset-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = new FormData(e.target).get("reset-email")?.trim();
          if (!email || !email.includes("@")) {
            showToast({ type: "error", message: "Adresse e-mail invalide." });
            return;
          }
          try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
              throw new Error(data?.error || `Erreur serveur (${res.status}).`);
            }
            closeModal();
            if (data?.devResetUrl) {
              // Mode dev (pas de SMTP) : on saute directement à l'écran de
              // nouveau mot de passe, pas besoin d'aller chercher le lien.
              window.location.href = data.devResetUrl;
            } else {
              showToast({
                type: "success",
                message: "Si ce compte existe, un email a été envoyé.",
              });
            }
          } catch (err) {
            showToast({
              type: "error",
              message: err.message || "Impossible de contacter le serveur.",
            });
          }
        });
    },
  });
}

export function renderResetPasswordPage(token, onDone) {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div class="login-screen">
    <aside class="login-aside">
      <div class="grid-overlay"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="sidebar-logo" style="padding:0;">
        <div class="logo-badge">B</div>
        <div class="logo-text"><p>BiblioGest</p><span>BIBLIOTHÈQUE</span></div>
      </div>
      <div class="login-headline-wrap">
        <h2 class="login-headline">Choisissez un<br /><span class="accent">nouveau</span><br />mot de passe.</h2>
      </div>
    </aside>
    <main class="login-main">
      <div class="login-form-wrap">
        <h2>Nouveau mot de passe</h2>
        <p class="lead">Au moins 8 caractères.</p>
        <form id="reset-password-form">
          <div class="form-group">
            <label class="form-label" for="new-password">Nouveau mot de passe</label>
            <input class="form-input" id="new-password" type="password" minlength="8" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="confirm-password">Confirmer</label>
            <input class="form-input" id="confirm-password" type="password" minlength="8" required />
          </div>
          <button type="submit" class="login-submit" id="reset-submit">Valider →</button>
        </form>
      </div>
    </main>
  </div>`;

  document
    .getElementById("reset-password-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const password = document.getElementById("new-password").value;
      const confirm = document.getElementById("confirm-password").value;
      if (password !== confirm) {
        showToast({
          type: "error",
          message: "Les mots de passe ne correspondent pas.",
        });
        return;
      }
      const submitBtn = document.getElementById("reset-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Validation…";
      try {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok)
          throw new Error(data?.error || "Échec de la réinitialisation.");
        showToast({
          type: "success",
          message: "Mot de passe mis à jour, connecte-toi.",
        });
        onDone();
      } catch (err) {
        showToast({ type: "error", message: err.message });
        submitBtn.disabled = false;
        submitBtn.textContent = "Valider →";
      }
    });
}
