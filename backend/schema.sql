-- =====================================================================
--  BiblioGest — schema.sql
--  Modèle de données PostgreSQL
-- =====================================================================

DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------------------
-- USERS — comptes du personnel de la bibliothèque.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'admin',
    password_hash VARCHAR(225),        -- NULL si le compte n'utilise QUE Google
    google_id VARCHAR(225) UNIQUE,     -- NULL si le compte n'utilise pas Google
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT users_has_login_method CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- PASSWORD_RESET_TOKENS — flux "mot de passe oublié"
-- Un token à usage unique, envoyé par e-mail, valable un temps limité.
-- ---------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- AUTHORS — auteurs
-- ---------------------------------------------------------------------
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    nationality VARCHAR(80)
);

-- ---------------------------------------------------------------------
-- MEMBERS — adhérents de la bibliothèque
-- ---------------------------------------------------------------------
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------
-- BOOKS — livres
-- status : 'available' | 'borrowed' | 'reserved'.
-- Mis à jour par la logique métier, jamais choisi librement par
-- l'utilisateur : 'borrowed' à la création d'un emprunt, puis
-- 'available' ou 'reserved' (s'il y a une file d'attente) au retour.
-- ---------------------------------------------------------------------
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL CHECK (year > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'borrowed', 'reserved'))
);

-- ---------------------------------------------------------------------
-- LOANS — emprunts
-- status stocké : 'active' | 'returned' seulement.
-- "En retard" n'est PAS une valeur stockée : elle se calcule à la
-- lecture (status = 'active' AND due_date < CURRENT_DATE), pour éviter
-- qu'une colonne devienne périmée faute d'un job de rafraîchissement.
-- ---------------------------------------------------------------------
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'returned')),
  CONSTRAINT loan_dates_valid CHECK (due_date >= loan_date)
);

-- Garde-fou au niveau base : un même livre ne peut avoir qu'UN SEUL
-- emprunt actif à la fois (en plus de la vérification côté contrôleur).
CREATE UNIQUE INDEX one_active_loan_per_book
  ON loans (book_id)
  WHERE status = 'active';

-- ---------------------------------------------------------------------
-- RESERVATIONS — file d'attente sur un livre déjà emprunté.
-- La position dans la file = rang de reserved_at (le plus ancien = 1er).
-- La ligne est supprimée dès que la réservation est honorée ou annulée.
-- ---------------------------------------------------------------------
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, member_id)
);

-- ---------------------------------------------------------------------
-- INDEX pour les recherches et statistiques fréquentes
-- ---------------------------------------------------------------------
CREATE INDEX idx_books_author ON books (author_id);
CREATE INDEX idx_books_status ON books (status);
CREATE INDEX idx_loans_member ON loans (member_id);
CREATE INDEX idx_loans_book ON loans (book_id);
CREATE INDEX idx_loans_due_date ON loans (due_date);
CREATE INDEX idx_reservations_book ON reservations (book_id);

-- ---------------------------------------------------------------------
-- Compte admin de démarrage (exemple, à adapter)
-- Ne jamais insérer un mot de passe en clair : générer le hash bcrypt
-- côté Node (ex. via un petit script seed.js) puis coller le résultat ici.
-- ---------------------------------------------------------------------
-- INSERT INTO users (name, email, role, password_hash)
-- VALUES ('Euloge Ngouma', 'jonathanesaie21@gmail.com', 'admin', '<hash_bcrypt_ici>');