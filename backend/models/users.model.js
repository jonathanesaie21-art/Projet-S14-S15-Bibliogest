import { query } from "../config/db.js";

function mapUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
  };
}

export const usersApi = {
  async findByGoogleId(googleId) {
    const { rows } = await query("SELECT * FROM users WHERE google_id = $1", [
      googleId,
    ]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async findByEmailWithPassword(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async createFromGoogle({ name, email, googleId }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, role, google_id)
       VALUES ($1, $2, 'admin', $3)
       RETURNING *`,
      [name, email, googleId],
    );
    return mapUser(rows[0]);
  },

  async linkGoogleId(userId, googleId) {
    const { rows } = await query(
      "UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *",
      [googleId, userId],
    );
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async updatePassword(userId, passwordHash) {
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);
  },
};
