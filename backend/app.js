import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import authorsRoutes from "./routes/authors.route.js";
import booksRoutes from "./routes/books.route.js";
import membersRoutes from "./routes/members.route.js";
import loansRoutes from "./routes/loans.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { testConnection } from "./config/db.js";

export const app = express();

// cors() sans option = autorise toutes les origines. Pratique en dev
// (frontend sur un port, backend sur un autre), à restreindre à
// l'origine exacte du frontend avant la mise en prod.
app.use(cors());
app.use(express.json());

// Toujours public : sert à vérifier que l'API répond, avant même d'être connecté.
app.get("/api/health", async (req, res, next) => {
  try {
    const dbTime = await testConnection();
    res.json({ status: "ok", dbTime });
  } catch (err) {
    next(err);
  }
});

// Public aussi, forcément : c'est la route qui délivre le token, on ne
// peut pas exiger un token pour l'obtenir.
app.use("/api/auth", authRoutes);

// À partir d'ici, toute route /api/... exige un JWT valide (voir
// middleware/requireAuth.js). req.user contient { sub, name, email, role }
// si jamais un contrôleur a besoin de savoir qui fait la requête.
app.use("/api/authors", requireAuth, authorsRoutes);
app.use("/api/books", requireAuth, booksRoutes);
app.use("/api/members", requireAuth, membersRoutes);
app.use("/api/loans", requireAuth, loansRoutes);

// Toute route /api/... non reconnue par les routers ci-dessus tombe ici.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

// Toujours en dernier : c'est ce qui transforme les erreurs des
// contrôleurs/modèles en réponses HTTP propres (voir middleware/errorHandler.js).
app.use(errorHandler);
