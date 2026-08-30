-- =====================================================================
--  ZEBRA BAGS — Base de données Turso (SQLite cloud)
-- =====================================================================
--  Ce fichier est complet et peut être exécuté tel quel dans la console
--  Turso (Run SQL) ou via la CLI :  turso db shell <db-name> < schema.sql
--
--  Conseils / big-int :
--    * Les tableaux imbriqués (couleurs, caractéristiques, cotes…)
--      sont stockés en JSON — simple et robuste pour ce site.
--    * Le catalogue (les 16 produits, catégories, publications) est
--      réinséré automatiquement par le serveur au premier démarrage
--      à partir de src/data/products.ts (il suffit d'exécuter les
--      instructions CREATE INDEX ci-dessous, les tables se créent
--      toutes seules avec CREATE TABLE IF NOT EXISTS).
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- PRODUITS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL DEFAULT '',
  tagline         TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT '',
  category_name   TEXT NOT NULL DEFAULT '',
  price           REAL NOT NULL DEFAULT 0,
  original_price  REAL,
  rating          REAL NOT NULL DEFAULT 5,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  is_new          INTEGER NOT NULL DEFAULT 0,
  is_best_seller  INTEGER NOT NULL DEFAULT 0,
  is_limited      INTEGER NOT NULL DEFAULT 0,
  stock_count     INTEGER NOT NULL DEFAULT 0,
  image_main      TEXT NOT NULL DEFAULT '',
  image_hover     TEXT NOT NULL DEFAULT '',
  image_detail    TEXT,
  image_lifestyle TEXT,
  colors_json     TEXT NOT NULL DEFAULT '[]',
  description     TEXT NOT NULL DEFAULT '',
  details_json    TEXT NOT NULL DEFAULT '[]',
  dimensions_json TEXT NOT NULL DEFAULT '{"width":30,"height":22,"depth":12,"unit":"cm"}',
  weight          TEXT NOT NULL DEFAULT '',
  material        TEXT NOT NULL DEFAULT '',
  lining          TEXT NOT NULL DEFAULT '',
  hardware        TEXT NOT NULL DEFAULT '',
  strap_drop      TEXT NOT NULL DEFAULT '',
  features_json   TEXT NOT NULL DEFAULT '[]',
  zebra_accent_style TEXT NOT NULL DEFAULT '',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- CATÉGORIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  tagline    TEXT NOT NULL DEFAULT '',
  item_count INTEGER NOT NULL DEFAULT 0,
  image      TEXT NOT NULL DEFAULT '',
  badge      TEXT NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------------
-- PUBLICATIONS INSTAGRAM
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instagram_posts (
  id                   TEXT PRIMARY KEY,
  handle               TEXT NOT NULL DEFAULT '',
  image_url            TEXT NOT NULL DEFAULT '',
  likes                INTEGER NOT NULL DEFAULT 0,
  comments             INTEGER NOT NULL DEFAULT 0,
  caption              TEXT NOT NULL DEFAULT '',
  product_tagged_name  TEXT NOT NULL DEFAULT '',
  product_tagged_price REAL NOT NULL DEFAULT 0,
  product_id           TEXT NOT NULL DEFAULT '',
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- ADMIN (une seule ligne, id = 1)
-- ---------------------------------------------------------------------
-- password_hash = hash scrypt défini par le serveur : "$salt$hexHash"
-- L'adresse e-mail et le mot de passe par défaut (admin@zebrabags.com /
-- zebra2026) sont créés et hachés par le serveur au premier démarrage.
CREATE TABLE IF NOT EXISTS admin_credentials (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- SESSIONS (jetons de connexion)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- COMMANDES (reçues depuis le paiement de la boutique)
-- ---------------------------------------------------------------------
-- customer_json / items_json sont des objets JSON — voir les types
-- OrderCustomer et OrderItem dans src/types.ts.
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  customer_json    TEXT NOT NULL DEFAULT '{}',
  items_json       TEXT NOT NULL DEFAULT '[]',
  subtotal         REAL NOT NULL DEFAULT 0,
  discount_percent REAL NOT NULL DEFAULT 0,
  shipping         REAL NOT NULL DEFAULT 0,
  total            REAL NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'DH',
  gift_note        TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'nouvelle',
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- INDEX
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_new     ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_posts_product_id    ON instagram_posts(product_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token      ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders(created_at);