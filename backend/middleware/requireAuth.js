/**
 * middleware/requireAuth.js
 * Bloque l'accès aux routes protégées si le client n'a pas de JWT valide
 * dans l'en-tête Authorization. Posé sur /api/authors, /api/books,
 * /api/members, /api/loans dans app.js — mais PAS sur /api/auth/google
 * (il faut bien pouvoir se connecter avant d'avoir un token) ni sur
 * /api/health.
 */
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Session expirée, reconnecte-toi." });
  }
}
