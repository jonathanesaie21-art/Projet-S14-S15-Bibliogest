import { authorsApi } from "../models/authors.model.js";

export async function listAuthors(req, res, next) {
  try {
    res.json(await authorsApi.list());
  } catch (err) {
    next(err);
  }
}

export async function getAuthor(req, res, next) {
  try {
    const author = await authorsApi.findById(req.params.id);
    if (!author) return res.status(404).json({ error: "Auteur introuvable." });
    res.json(author);
  } catch (err) {
    next(err);
  }
}

export async function createAuthor(req, res, next) {
  try {
    const { name, nationality } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Le nom est requis." });
    }
    res.status(201).json(await authorsApi.add({ name, nationality }));
  } catch (err) {
    next(err);
  }
}

export async function updateAuthor(req, res, next) {
  try {
    const { name, nationality } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Le nom est requis." });
    }
    const author = await authorsApi.update({
      id: req.params.id,
      name,
      nationality,
    });
    if (!author) return res.status(404).json({ error: "Auteur introuvable." });
    res.json(author);
  } catch (err) {
    next(err);
  }
}

export async function deleteAuthor(req, res, next) {
  try {
    await authorsApi.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
