import crypto from "crypto";
import { query } from "../config/db.js";

const TOKEN_TTL_MINUTES = 30;

export const passwordResetApi = {
  async createToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt],
    );
    return token;
  },

  async findValidToken(token) {
    const { rows } = await query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token],
    );
    return rows[0] || null;
  },

  async markUsed(id) {
    await query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [id],
    );
  },
};
