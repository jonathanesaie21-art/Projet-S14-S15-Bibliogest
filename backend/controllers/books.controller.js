import { booksApi } from "../models/books.model.js";

export async function listBooks(req, res, next) {
  try {
    res.json(await booksApi.list());
  } catch (err) {
    next(err);
  }
}

export async function getBook(req, res, next) {
  try {
    const book = await booksApi.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre introuvable." });
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function createBook(req, res, next) {
  try {
    const { title, authorId, year } = req.body;
    if (!title || !authorId || !year) {
      return res
        .status(400)
        .json({ error: "Titre, auteur et année sont requis." });
    }
    const currentYear = new Date().getFullYear();
    if (Number(year) > currentYear) {
      return res
        .status(400)
        .json({ error: `L'année ne peut pas dépasser ${currentYear}.` });
    }
    res.status(201).json(await booksApi.add({ title, authorId, year }));
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req, res, next) {
  try {
    const { title, authorId, year } = req.body;
    if (!title || !authorId || !year) {
      return res
        .status(400)
        .json({ error: "Titre, auteur et année sont requis." });
    }
    const currentYear = new Date().getFullYear();
    if (Number(year) > currentYear) {
      return res
        .status(400)
        .json({ error: `L'année ne peut pas dépasser ${currentYear}.` });
    }
    const book = await booksApi.update({
      id: req.params.id,
      title,
      authorId,
      year,
    });
    if (!book) return res.status(404).json({ error: "Livre introuvable." });
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req, res, next) {
  try {
    await booksApi.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function reserveBook(req, res, next) {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ error: "memberId est requis." });
    }
    res.status(201).json(await booksApi.reserve(req.params.id, memberId));
  } catch (err) {
    next(err);
  }
}
