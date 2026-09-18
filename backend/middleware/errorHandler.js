/**
 * middleware/errorHandler.js
 * Point unique de traduction "erreur JS -> réponse HTTP". Doit être
 * enregistré en dernier dans app.js : Express reconnaît un middleware
 * d'erreur à sa signature à 4 arguments (err, req, res, next).
 *
 * Heuristique utilisée pour choisir le code de statut :
 * - err.status explicite (posé volontairement dans un modèle, ex. le 404
 *   "Emprunt introuvable" dans loans.model.js) -> on l'utilise tel quel.
 * - err.code présent -> c'est une erreur brute remontée par `pg`
 *   (ex: 23503, 23505) qu'aucun modèle n'a attrapée : un cas non prévu.
 *   On répond 500 sans exposer les détails internes, et on logge tout
 *   côté serveur pour pouvoir corriger.
 * - Sinon -> c'est un message métier volontairement construit dans un
 *   modèle (ex: "Cet email est déjà utilisé.") -> 409 Conflict, avec le
 *   message tel quel puisqu'il est déjà écrit pour un humain.
 *
 * Amélioration possible plus tard : poser `err.status` explicitement
 * dans chaque cas métier plutôt que de déduire 409 par défaut ici — ça
 * couvre déjà tous les cas actuels, mais deviendra plus robuste si les
 * erreurs métier se diversifient (validation -> 400, etc.).
 */
export function errorHandler(err, req, res, next) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.code) {
    console.error("Erreur base de données non gérée :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
  console.warn("Erreur métier :", err.message);
  res.status(409).json({ error: err.message });
}
