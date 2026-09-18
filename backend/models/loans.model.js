/**
 * models/loans.model.js
 * Équivalent backend de loansApi dans data.js.
 *
 * Rappel du schema.sql : loans.status ne stocke que 'active' ou
 * 'returned'. "overdue" n'est jamais écrit en base, pour éviter qu'une
 * colonne devienne fausse le jour où personne ne l'a rafraîchie — on le
 * recalcule ici à chaque lecture, à un seul endroit, comme le faisait
 * déjà refreshOverdueStatuses() côté frontend.
 */
import { query, pool } from "../config/db.js";

function mapLoan(row) {
  const isOverdue =
    row.status === "active" && new Date(row.due_date) < new Date();
  return {
    id: String(row.id),
    bookId: String(row.book_id),
    memberId: String(row.member_id),
    loanDate: row.loan_date,
    dueDate: row.due_date,
    returnDate: row.return_date,
    status: isOverdue ? "overdue" : row.status,
  };
}

export const loansApi = {
  async list() {
    const { rows } = await query("SELECT * FROM loans ORDER BY loan_date DESC");
    return rows.map(mapLoan);
  },

  /**
   * Crée l'emprunt ET passe le livre à "borrowed" dans UNE seule
   * transaction : soit les deux écritures passent, soit aucune. Si le
   * livre a déjà un emprunt actif (quelqu'un a été plus rapide), l'index
   * unique one_active_loan_per_book de schema.sql fait échouer l'INSERT
   * avant que books.status ne soit jamais touché — impossible d'avoir un
   * livre "available" avec un emprunt actif caché derrière.
   */
  async create(bookId, memberId, dueDate) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "INSERT INTO loans (book_id, member_id, due_date) VALUES ($1, $2, $3) RETURNING *",
        [bookId, memberId, dueDate],
      );
      await client.query("UPDATE books SET status = 'borrowed' WHERE id = $1", [
        bookId,
      ]);
      await client.query("COMMIT");
      return mapLoan(rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      if (err.code === "23505") {
        throw new Error("Ce livre a déjà un emprunt actif.");
      }
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

  async markReturned(loanId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `UPDATE loans SET status = 'returned', return_date = CURRENT_DATE
         WHERE id = $1 RETURNING *`,
        [loanId],
      );
      const loan = rows[0];
      if (!loan) {
        const notFound = new Error("Emprunt introuvable.");
        notFound.status = 404;
        throw notFound;
      }

      const { rows: resa } = await client.query(
        "SELECT COUNT(*)::int AS n FROM reservations WHERE book_id = $1",
        [loan.book_id],
      );
      // Dette technique reprise telle quelle du prototype data.js : on
      // marque juste le livre "reserved" s'il y a une file d'attente,
      // sans l'attribuer automatiquement au premier de la liste. À
      // construire avant la mise en prod : un vrai flux "attribuer au
      // suivant + le retirer de la file".
      await client.query("UPDATE books SET status = $1 WHERE id = $2", [
        resa[0].n > 0 ? "reserved" : "available",
        loan.book_id,
      ]);
      await client.query("COMMIT");
      return mapLoan(loan);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
