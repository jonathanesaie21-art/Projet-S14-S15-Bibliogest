/**
 * middleware/errorHandler.js
 * Point unique de traduction "erreur JS -> réponse HTTP". 
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
