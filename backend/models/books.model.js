/**
 * models/books.model.js
 * Équivalent backend de booksApi dans data.js.
 */
import { query, pool } from "../config/db.js";

function mapBook(row) {
  return {
    id: String(row.id),
    title: row.title,
    authorId: String(row.author_id),
    authorName: row.author_name,
    year: row.year,
    status: row.status,
    reservations: (row.reservations || []).filter(Boolean).map(String),
  };
}

async function listBooks(whereClause = "", params = []) {
  const { rows } = await query(
    `
    SELECT
      books.*,
      authors.name AS author_name,
      COALESCE(
        array_agg(reservations.member_id ORDER BY reservations.reserved_at)
          FILTER (WHERE reservations.member_id IS NOT NULL),
        '{}'
      ) AS reservations
    FROM books
    LEFT JOIN authors ON authors.id = books.author_id
    LEFT JOIN reservations ON reservations.book_id = books.id
    ${whereClause}
    GROUP BY books.id, authors.name
    ORDER BY books.title
    `,
    params,
  );
  return rows.map(mapBook);
}

export const booksApi = {
  async list() {
    return listBooks();
  },

  async findById(id) {
    const rows = await listBooks("WHERE books.id = $1", [id]);
    return rows[0] || null;
  },

  async add({ title, authorId, year, status = "available" }) {
    const { rows } = await query(
      "INSERT INTO books (title, author_id, year, status) VALUES ($1, $2, $3, $4) RETURNING id",
      [title, authorId, year, status],
    );
    return booksApi.findById(rows[0].id);
  },

  async update({ id, title, authorId, year }) {
    await query(
      "UPDATE books SET title = $1, author_id = $2, year = $3 WHERE id = $4",
      [title, authorId, year, id],
    );
    return booksApi.findById(id);
  },

  async remove(id) {
    // loans.book_id est ON DELETE RESTRICT : impossible de supprimer un
    // livre qui a un historique d'emprunts (même retournés). C'est
    // volontaire côté schéma pour ne jamais perdre l'historique.
    try {
      await query("DELETE FROM books WHERE id = $1", [id]);
    } catch (err) {
      if (err.code === "23503") {
        throw new Error(
          "Impossible de supprimer : ce livre a un historique d'emprunts.",
        );
      }
      throw err;
    }
  },

  /**
   * Ajoute une réservation. Contrairement au mock (qui pousse juste dans
   * un tableau), on passe par une transaction courte pour renvoyer une
   * position de file d'attente qui reflète vraiment l'état en base au
   * moment de l'écriture, même si deux personnes réservent en même temps.
   */
  async reserve(bookId, memberId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO reservations (book_id, member_id) VALUES ($1, $2)
       ON CONFLICT (book_id, member_id) DO NOTHING`,
        [bookId, memberId],
      );
      const { rows } = await client.query(
        "SELECT COUNT(*)::int AS position FROM reservations WHERE book_id = $1",
        [bookId],
      );
      await client.query("COMMIT");
      return {
        book: await booksApi.findById(bookId),
        position: rows[0].position,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      if (err.code === "23503") {
        const notFound = new Error("Adhérent introuvable pour ce memberId.");
        notFound.status = 400;
        throw notFound;
      }
      throw err;
    } finally {
      client.release();
    }
  },

  async add({ title, authorId, year, status = "available" }) {
    try {
      const { rows } = await query(
        "INSERT INTO books (title, author_id, year, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [title, authorId, year, status],
      );
      return booksApi.findById(rows[0].id);
    } catch (err) {
      if (err.code === "23503") {
        const notFound = new Error("Auteur introuvable pour cet authorId.");
        notFound.status = 400;
        throw notFound;
      }
      throw err;
    }
  },

  async update({ id, title, authorId, year }) {
    try {
      await query(
        "UPDATE books SET title = $1, author_id = $2, year = $3 WHERE id = $4",
        [title, authorId, year, id],
      );
      return booksApi.findById(id);
    } catch (err) {
      if (err.code === "23503") {
        const notFound = new Error("Auteur introuvable pour cet authorId.");
        notFound.status = 400;
        throw notFound;
      }
      throw err;
    }
  },
};
