/**
 * models/members.model.js
 * Équivalent backend de membersApi dans data.js.
 */
import { query } from "../config/db.js";

function mapMember(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    joinDate: row.join_date,
  };
}

export const membersApi = {
  async list() {
    const { rows } = await query("SELECT * FROM members ORDER BY name");
    return rows.map(mapMember);
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM members WHERE id = $1", [id]);
    return rows[0] ? mapMember(rows[0]) : null;
  },

  async add({ name, email, phone }) {
    try {
      const { rows } = await query(
        "INSERT INTO members (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
        [name, email, phone],
      );
      return mapMember(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("Cet email est déjà utilisé par un autre adhérent.");
      }
      throw err;
    }
  },

  async update({ id, name, email, phone }) {
    try {
      const { rows } = await query(
        "UPDATE members SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
        [name, email, phone, id],
      );
      return rows[0] ? mapMember(rows[0]) : null;
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("Cet email est déjà utilisé par un autre adhérent.");
      }
      throw err;
    }
  },

  async remove(id) {
    // Même logique que pour authors/books : loans.member_id est
    // ON DELETE RESTRICT, donc un adhérent avec un historique d'emprunts
    // ne peut pas être supprimé — la base protège l'intégrité de
    // l'historique à notre place.
    try {
      await query("DELETE FROM members WHERE id = $1", [id]);
    } catch (err) {
      if (err.code === "23503") {
        throw new Error(
          "Impossible de supprimer : cet adhérent a un historique d'emprunts.",
        );
      }
      throw err;
    }
  },
};
