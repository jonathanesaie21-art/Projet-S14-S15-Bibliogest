import { query } from "../config/db.js";

function mapAuthor(row) {
  return { id: String(row.id), name: row.name, nationality: row.nationality };
}

export const authorsApi = {
  async list() {
    const { rows } = await query("SELECT * FROM authors ORDER BY name");
    return rows.map(mapAuthor);
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM authors WHERE id = $1", [id]);
    return rows[0] ? mapAuthor(rows[0]) : null;
  },

  async add({ name, nationality }) {
    const { rows } = await query(
      "INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING *",
      [name, nationality],
    );
    return mapAuthor(rows[0]);
  },

  async update({ id, name, nationality }) {
    const { rows } = await query(
      "UPDATE authors SET name = $1, nationality = $2 WHERE id = $3 RETURNING *",
      [name, nationality, id],
    );
    return rows[0] ? mapAuthor(rows[0]) : null;
  },

  async remove(id) {
    // books.author_id est déclaré ON DELETE RESTRICT dans schema.sql :
    // la base refuse elle-même la suppression tant qu'un livre référence
    // encore cet auteur (code erreur PostgreSQL 23503). On laisse la base trancher
    try {
      await query("DELETE FROM authors WHERE id = $1", [id]);
    } catch (err) {
      if (err.code === "23503") {
        throw new Error(
          "Impossible de supprimer : cet auteur a encore des livres associés.",
        );
      }
      throw err;
    }
  },
};
