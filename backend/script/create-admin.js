/*scripts/create-admin.js*/
import "dotenv/config";
import bcrypt from "bcrypt";
import { query } from "../config/db.js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error(
    'Usage : node scripts/create-admin.js "Nom" email@ex.com motdepasse',
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const { rows } = await query(
  `INSERT INTO users (name, email, role, password_hash)
   VALUES ($1, $2, 'admin', $3)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING id, email`,
  [name, email, hash],
);
console.log(`Compte prêt : ${rows[0].email}`);
process.exit(0);
