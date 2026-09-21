export const API_BASE_URL =
  "https://projet-s14-s15-bibliogest.onrender.com/api";

/* ---------------------------- ETAT LOCAL ------------------------------- */

export const state = {
  currentUser: {
    id: "m1",
    name: "Euloge Ngouma",
    role: "Administrateur",
    email: "euloge.ngouma@email.com",
    phone: "06 12 34 56 78",
  },

  authors: [],
  books: [],
  members: [],
  loans: [],
};

/**
 * Calcule le nombre d'emprunts par jour sur les 7 derniers jours glissants
 * (aujourd'hui inclus), directement depuis state.loans — remplace l'ancien
 * tableau loanTrend codé en dur.
 */
export function computeLoanTrend() {
  const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const count = state.loans.filter(
      (l) => new Date(l.loanDate).toISOString().slice(0, 10) === key,
    ).length;
    return { day: DAY_LABELS[d.getDay()], loans: count };
  });
}

/* ------------------------------ AUTH TOKEN ------------------------------- */
// Source unique pour le token de session : auth.js appelle ces fonctions au
// lieu de gérer lui-même sessionStorage, pour éviter un import circulaire
// (auth.js importe déjà `state` depuis ce fichier).
const TOKEN_KEY = "bibliogest_token";

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}
export function setAuthToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

/* ------------------------------ FETCH ----------------------------------- */

async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    // Token absent, invalide ou expiré : inutile de laisser l'appli tourner
    // à moitié chargée. On nettoie et on revient à l'écran de connexion.
    setAuthToken(null);
    window.location.reload();
    throw new Error("Session expirée.");
  }
  if (res.status === 204) return null; // DELETE réussi : pas de corps de réponse
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Le middleware d'erreur du backend renvoie toujours { error: "message
    // lisible" } (voir middleware/errorHandler.js) : on le relaie tel quel.
    throw new Error(body?.error || `Erreur ${res.status}`);
  }
  return body;
}

/**
 * A appeler UNE FOIS au démarrage de l'app (voir main.js), avant le premier
 * rendu : remplit state.authors/books/members/loans avec les vraies données.
 */
export async function loadInitialData() {
  const [authors, books, members, loans] = await Promise.all([
    apiFetch("/authors"),
    apiFetch("/books"),
    apiFetch("/members"),
    apiFetch("/loans"),
  ]);
  state.authors = authors;
  state.books = books;
  state.members = members;
  state.loans = loans;
}

/* ============================== REPOSITORY ==============================
   Même forme qu'avant (list/add/update/remove...), mais chaque méthode
   parle vraiment au serveur, puis répercute le résultat sur `state` pour
   que les pages n'aient rien à changer.
   ========================================================================= */

export const authorsApi = {
  async list() {
    return state.authors;
  },
  async add(data) {
    const author = await apiFetch("/authors", {
      method: "POST",
      body: JSON.stringify(data),
    });
    state.authors.push(author);
    return author;
  },
  async update(author) {
    const updated = await apiFetch(`/authors/${author.id}`, {
      method: "PUT",
      body: JSON.stringify(author),
    });
    const i = state.authors.findIndex((a) => a.id === updated.id);
    if (i !== -1) state.authors[i] = updated;
    return updated;
  },
  async remove(id) {
    // Peut lancer une erreur (ex: "cet auteur a encore des livres
    // associés") si la suppression est refusée côté serveur — voir
    // auteur.js pour la gestion de ce cas.
    await apiFetch(`/authors/${id}`, { method: "DELETE" });
    state.authors = state.authors.filter((a) => a.id !== id);
  },
};

export const membersApi = {
  async list() {
    return state.members;
  },
  async add(data) {
    const member = await apiFetch("/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
    state.members.push(member);
    return member;
  },
  async update(member) {
    const updated = await apiFetch(`/members/${member.id}`, {
      method: "PUT",
      body: JSON.stringify(member),
    });
    const i = state.members.findIndex((m) => m.id === updated.id);
    if (i !== -1) state.members[i] = updated;
    return updated;
  },
  async remove(id) {
    await apiFetch(`/members/${id}`, { method: "DELETE" });
    state.members = state.members.filter((m) => m.id !== id);
  },
};

export const booksApi = {
  async list() {
    return state.books;
  },
  async add(data) {
    const book = await apiFetch("/books", {
      method: "POST",
      body: JSON.stringify(data),
    });
    state.books.push(book);
    return book;
  },
  async update(book) {
    const updated = await apiFetch(`/books/${book.id}`, {
      method: "PUT",
      body: JSON.stringify(book),
    });
    const i = state.books.findIndex((b) => b.id === updated.id);
    if (i !== -1) state.books[i] = updated;
    return updated;
  },
  async remove(id) {
    await apiFetch(`/books/${id}`, { method: "DELETE" });
    state.books = state.books.filter((b) => b.id !== id);
  },
  async reserve(bookId, memberId) {
    await apiFetch(`/books/${bookId}/reserve`, {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
    // La réservation touche une table à part (reservations) : plutôt que
    // de deviner l'état résultant, on relit le livre à jour depuis le
    // serveur et on met à jour l'objet EN PLACE (Object.assign, pas une
    // nouvelle référence) — livre.js garde une référence directe vers cet
    // objet et lit book.reservations.length juste après cet appel.
    const fresh = await apiFetch(`/books/${bookId}`);
    const book = state.books.find((b) => b.id === bookId);
    if (book) Object.assign(book, fresh);
    return book;
  },
};

export const loansApi = {
  async list() {
    return state.loans;
  },
  async create(bookId, memberId, dueDate) {
    const loan = await apiFetch("/loans", {
      method: "POST",
      body: JSON.stringify({ bookId, memberId, dueDate }),
    });
    state.loans.push(loan);
    // Le serveur passe aussi le livre à "borrowed" (même transaction, voir
    // loans.model.js) : on relit ce livre pour que state.books reste exact.
    const freshBook = await apiFetch(`/books/${bookId}`);
    const book = state.books.find((b) => b.id === bookId);
    if (book) Object.assign(book, freshBook);
    return loan;
  },
  async markReturned(loanId) {
    const updated = await apiFetch(`/loans/${loanId}/return`, {
      method: "POST",
    });
    const loan = state.loans.find((l) => l.id === loanId);
    if (loan) Object.assign(loan, updated);
    // Idem : le retour peut repasser le livre à "available" ou "reserved"
    // côté serveur, on relit pour rester synchronisé.
    const freshBook = await apiFetch(`/books/${updated.bookId}`);
    const book = state.books.find((b) => b.id === updated.bookId);
    if (book) Object.assign(book, freshBook);
    return loan;
  },
};

/* ------------------------------ HELPERS --------------------------------- */
// Inchangés : ce sont de simples fonctions de lecture sur `state`, elles
// n'ont pas besoin de savoir d'où viennent les données.
export const findAuthor = (id) => state.authors.find((a) => a.id === id);
export const findBook = (id) => state.books.find((b) => b.id === id);
export const findMember = (id) => state.members.find((m) => m.id === id);

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}
export function daysBetween(a, b = new Date()) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
export function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
