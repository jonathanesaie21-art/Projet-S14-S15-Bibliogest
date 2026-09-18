/**
 * config/db.js — connexion PostgreSQL centralisée.
 */
import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bibliogest",
});

pool.on("error", (err) => {
  console.error("Erreur inattendue sur le pool PostgreSQL :", err.message);
});

/**
 * Point d'entrée unique pour toutes les requêtes SQL de l'app.
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("[db]", text, {
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
  }
  return result;
}

export async function testConnection() {
  const { rows } = await query("SELECT NOW() AS now");
  return rows[0].now;
}
