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
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res, next) => {
  try {
    const dbTime = await testConnection();
    res.json({ status: "ok", dbTime });
  } catch (err) {
    next(err);
  }
});

// C'est la route qui délivre le token, on ne
// peut pas exiger un token pour l'obtenir.
app.use("/api/auth", authRoutes);
app.use("/api/authors", requireAuth, authorsRoutes);
app.use("/api/books", requireAuth, booksRoutes);
app.use("/api/members", requireAuth, membersRoutes);
app.use("/api/loans", requireAuth, loansRoutes);

// Toute route /api/... non reconnue par les routers ci-dessus tombe ici.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.use(errorHandler);
