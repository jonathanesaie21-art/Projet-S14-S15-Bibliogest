import { loansApi } from "../models/loans.model.js";
import { booksApi } from "../models/books.model.js";

export async function listLoans(req, res, next) {
  try {
    res.json(await loansApi.list());
  } catch (err) {
    next(err);
  }
}

export async function createLoan(req, res, next) {
  try {
    const { bookId, memberId, dueDate } = req.body;
    if (!bookId || !memberId || !dueDate) {
      return res
        .status(400)
        .json({ error: "bookId, memberId et dueDate sont requis." });
    }
    // Le frontend vérifie déjà que le livre est "available" avant d'envoyer
    // la requête (voir livre.js / emprunt.js), mais un serveur ne doit
    // jamais faire confiance à ce que le client affirme avoir vérifié :
    // on revalide ici, côté source de vérité.
    const book = await booksApi.findById(bookId);
    if (!book) return res.status(404).json({ error: "Livre introuvable." });
    if (book.status !== "available") {
      return res.status(409).json({ error: "Ce livre n'est pas disponible." });
    }
    res.status(201).json(await loansApi.create(bookId, memberId, dueDate));
  } catch (err) {
    next(err);
  }
}

export async function returnLoan(req, res, next) {
  try {
    res.json(await loansApi.markReturned(req.params.id));
  } catch (err) {
    next(err);
  }
}
