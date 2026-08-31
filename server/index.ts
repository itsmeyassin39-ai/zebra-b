import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import webpush from 'web-push';
import { openDb, generateToken } from './db';
import type { Db } from './db';
import { PRODUCTS, CATEGORIES, INSTAGRAM_POSTS } from '../src/data/products';
import type { Product, CategoryInfo, InstagramPost, ProductColor, Order, OrderCustomer } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3001);

const ROOT_URL = (process.env.APP_URL?.trim() || `http://localhost:${PORT}`).replace(/\/+$/, '');

// ----- Web Push (notifications téléphone) -----
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY?.trim() || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY?.trim() || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@zebrabags.com';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ----- Pushy (App Android native "Zebra Bags - Commandes") -----
// Clé secrète Pushy pour envoyer les notifications vers l'app Android,
// même quand l'app / Chrome est fermé (téléphone allumé).
const PUSHY_SECRET_KEY = process.env.PUSHY_SECRET_KEY?.trim() || '';

// ----- ntfy (app Play Store "ntfy") -----
// Topic secret utilisé par l'app ntfy sur votre téléphone. Choisissez un nom
// long et aléatoire (ex. zebra-orders-Kx9f2m) pour éviter que des tiers y lisent.
const NTFY_TOPIC = process.env.NTFY_TOPIC?.trim() || 'zebrano-kalamano53628';

let db: Db;

// =====================================================================
// SCHÉMA
// =====================================================================
const DDL = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    category_name TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    original_price REAL,
    rating REAL NOT NULL DEFAULT 5,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_new INTEGER NOT NULL DEFAULT 0,
    is_best_seller INTEGER NOT NULL DEFAULT 0,
    is_limited INTEGER NOT NULL DEFAULT 0,
    stock_count INTEGER NOT NULL DEFAULT 0,
    image_main TEXT NOT NULL DEFAULT '',
    image_hover TEXT NOT NULL DEFAULT '',
    image_detail TEXT,
    image_lifestyle TEXT,
    colors_json TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '',
    details_json TEXT NOT NULL DEFAULT '[]',
    dimensions_json TEXT NOT NULL DEFAULT '{"width":30,"height":22,"depth":12,"unit":"cm"}',
    weight TEXT NOT NULL DEFAULT '',
    material TEXT NOT NULL DEFAULT '',
    lining TEXT NOT NULL DEFAULT '',
    hardware TEXT NOT NULL DEFAULT '',
    strap_drop TEXT NOT NULL DEFAULT '',
    features_json TEXT NOT NULL DEFAULT '[]',
    zebra_accent_style TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    item_count INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS uploaded_images (
    id TEXT PRIMARY KEY,
    mime TEXT NOT NULL DEFAULT 'image/jpeg',
    data TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS instagram_posts (
    id TEXT PRIMARY KEY,
    handle TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    caption TEXT NOT NULL DEFAULT '',
    product_tagged_name TEXT NOT NULL DEFAULT '',
    product_tagged_price REAL NOT NULL DEFAULT 0,
    product_id TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS admin_credentials (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    sub_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS pushy_tokens (
    token TEXT PRIMARY KEY,
    platform TEXT NOT NULL DEFAULT 'android',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_json TEXT NOT NULL DEFAULT '{}',
    items_json TEXT NOT NULL DEFAULT '[]',
    subtotal REAL NOT NULL DEFAULT 0,
    discount_percent REAL NOT NULL DEFAULT 0,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'DH',
    gift_note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'nouvelle',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
  'CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new)',
  'CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller)',
  'CREATE INDEX IF NOT EXISTS idx_posts_product_id ON instagram_posts(product_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)',
  'CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)',
];

// =====================================================================
// HELPERS
// =====================================================================
function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type SqlArgs = Array<string | number | null | boolean | bigint>;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = String(stored).split('$');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

function rowToProduct(row: Record<string, any>): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    category: row.category,
    categoryName: row.category_name,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    rating: Number(row.rating),
    reviewsCount: Number(row.reviews_count),
    isNew: !!row.is_new,
    isBestSeller: !!row.is_best_seller,
    isLimited: !!row.is_limited,
    stockCount: Number(row.stock_count),
    images: {
      main: row.image_main,
      hover: row.image_hover,
      detail: row.image_detail || undefined,
      lifestyle: row.image_lifestyle || undefined,
    },
    colors: parseJson<ProductColor[]>(row.colors_json, []),
    description: row.description,
    details: parseJson<string[]>(row.details_json, undefined),
    dimensions: parseJson(row.dimensions_json, { width: 30, height: 22, depth: 12, unit: 'cm' }),
    weight: row.weight,
    material: row.material,
    lining: row.lining,
    hardware: row.hardware,
    strapDrop: row.strap_drop,
    features: parseJson<string[]>(row.features_json, []),
    zebraAccentStyle: row.zebra_accent_style,
  };
}

function productRow(p: Product): { sql: string; args: SqlArgs } {
  return {
    sql: `INSERT OR REPLACE INTO products (
      id, name, tagline, category, category_name, price, original_price, rating,
      reviews_count, is_new, is_best_seller, is_limited, stock_count,
      image_main, image_hover, image_detail, image_lifestyle,
      colors_json, description, details_json, dimensions_json, weight, material,
      lining, hardware, strap_drop, features_json, zebra_accent_style
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`,
    args: [
      p.id,
      p.name,
      p.tagline,
      p.category,
      p.categoryName,
      p.price,
      p.originalPrice ?? null,
      p.rating,
      p.reviewsCount,
      p.isNew ? 1 : 0,
      p.isBestSeller ? 1 : 0,
      p.isLimited ? 1 : 0,
      p.stockCount,
      p.images.main,
      p.images.hover,
      p.images.detail ?? null,
      p.images.lifestyle ?? null,
      JSON.stringify(p.colors),
      p.description,
      JSON.stringify(p.details ?? []),
      JSON.stringify(p.dimensions),
      p.weight,
      p.material,
      p.lining,
      p.hardware,
      p.strapDrop,
      JSON.stringify(p.features),
      p.zebraAccentStyle,
    ],
  };
}

function categoryRow(c: CategoryInfo): { sql: string; args: SqlArgs } {
  return {
    sql: 'INSERT OR REPLACE INTO categories (id, name, tagline, item_count, image, badge) VALUES (?, ?, ?, ?, ?, ?)',
    args: [c.id, c.name, c.tagline, c.itemCount, c.image, c.badge ?? ''],
  };
}

function postRow(p: InstagramPost): { sql: string; args: SqlArgs } {
  return {
    sql: 'INSERT OR REPLACE INTO instagram_posts (id, handle, image_url, likes, comments, caption, product_tagged_name, product_tagged_price, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      p.id,
      p.handle,
      p.imageUrl,
      p.likes,
      p.comments,
      p.caption,
      p.productTaggedName,
      p.productTaggedPrice,
      p.productId,
    ],
  };
}

function rowToOrder(row: Record<string, any>): Order {
  return {
    id: row.id,
    customer: parseJson<OrderCustomer>(row.customer_json, {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      paymentMethod: '',
    }),
    items: parseJson<Order['items']>(row.items_json, []),
    subtotal: Number(row.subtotal),
    discountPercent: Number(row.discount_percent),
    shipping: Number(row.shipping),
    total: Number(row.total),
    currency: row.currency,
    giftNote: (row.gift_note as string) || undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

function orderRow(o: Order): { sql: string; args: SqlArgs } {
  return {
    sql: 'INSERT OR REPLACE INTO orders (id, customer_json, items_json, subtotal, discount_percent, shipping, total, currency, gift_note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      o.id,
      JSON.stringify(o.customer ?? {}),
      JSON.stringify(o.items ?? []),
      o.subtotal ?? 0,
      o.discountPercent ?? 0,
      o.shipping ?? 0,
      o.total ?? 0,
      o.currency ?? 'DH',
      o.giftNote ?? '',
      o.status ?? 'nouvelle',
    ],
  };
}

const ORDER_STATUSES = ['nouvelle', 'en_cours', 'expediee', 'livree'];

const selectProducts = 'SELECT * FROM products ORDER BY created_at DESC, rowid DESC';
const selectCategories = 'SELECT * FROM categories';
const selectPosts = 'SELECT * FROM instagram_posts';

async function fetchAll(): Promise<{ products: Product[]; categories: CategoryInfo[]; instagramPosts: InstagramPost[] }> {
  const [productsRes, categoriesRes, postsRes] = await Promise.all([
    db.all(selectProducts, []),
    db.all(selectCategories, []),
    db.all(selectPosts, []),
  ]);
  return {
    products: productsRes.map((r) => rowToProduct(r)),
    categories: categoriesRes.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      tagline: String(r.tagline),
      itemCount: Number(r.item_count),
      image: String(r.image),
      badge: (r.badge as string) || undefined,
    })),
    instagramPosts: postsRes.map((r) => ({
      id: String(r.id),
      handle: String(r.handle),
      imageUrl: String(r.image_url),
      likes: Number(r.likes),
      comments: Number(r.comments),
      caption: String(r.caption),
      productTaggedName: String(r.product_tagged_name),
      productTaggedPrice: Number(r.product_tagged_price),
      productId: String(r.product_id),
    })),
  };
}

async function seed(): Promise<void> {
  const admin = await db.all('SELECT COUNT(*) AS c FROM admin_credentials WHERE id = 1', []);
  if (Number(admin[0]?.c ?? 0) === 0) {
    await db.run('INSERT INTO admin_credentials (id, email, password_hash) VALUES (1, ?, ?)', [
      'admin@zebrabags.com',
      hashPassword('zebra2026'),
    ]);
  }

  const count = await db.all('SELECT COUNT(*) AS c FROM products', []);
  if (Number(count[0]?.c ?? 0) > 0) return;

  await db.transaction(async (tx) => {
    for (const c of CATEGORIES) {
      const row = categoryRow(c);
      await tx.run(row.sql, row.args);
    }
    for (const p of PRODUCTS) {
      const row = productRow(p);
      await tx.run(row.sql, row.args);
    }
    for (const p of INSTAGRAM_POSTS) {
      const row = postRow(p);
      await tx.run(row.sql, row.args);
    }
  });
}

// =====================================================================
// AUTH
// =====================================================================
async function tokenFrom(req: Request): Promise<string | null> {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const res = await db.all('SELECT token FROM sessions WHERE token = ?', [token]);
  return res.length > 0 ? token : null;
}

function requireAuth(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = await tokenFrom(req);
      if (!token) {
        res.status(401).json({ error: 'Accès refusé. Veuillez vous connecter.' });
        return;
      }
      (req as any).token = token;
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}

// =====================================================================
// EXPRESS
// =====================================================================
const app = express();
app.use(express.json({ limit: '15mb' }));

// ----- Auth -----
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String((req.body as any)?.email ?? '').trim();
    const password = String((req.body as any)?.password ?? '');
    const admin = await db.all(
      'SELECT email, password_hash FROM admin_credentials WHERE id = 1',
      []
    );
    if (admin.length === 0) {
      res.status(500).json({ error: 'Aucun compte administrateur configuré.' });
      return;
    }
    const row = admin[0];
    const emailOk = String(row.email).toLowerCase() === email.toLowerCase();
    const passOk = row.password_hash ? verifyPassword(password, String(row.password_hash)) : false;
    if (!emailOk || !passOk) {
      res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
      return;
    }
    const token = generateToken();
    await db.run('INSERT INTO sessions (token) VALUES (?)', [token]);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/logout', requireAuth(async (req, res) => {
  await db.run('DELETE FROM sessions WHERE token = ?', [(req as any).token]);
  res.json({ ok: true });
}));

app.put('/api/auth/credentials', requireAuth(async (req, res) => {
  const { currentPassword, email, newPassword } = req.body as any;
  const admin = await db.all(
    'SELECT email, password_hash FROM admin_credentials WHERE id = 1',
    []
  );
  const row = admin[0];
  if (!row || !verifyPassword(String(currentPassword ?? ''), String(row.password_hash))) {
    res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
    return;
  }
  if (!email || !String(email).includes('@')) {
    res.status(400).json({ error: 'Adresse e-mail invalide.' });
    return;
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    return;
  }
  await db.run('UPDATE admin_credentials SET email = ?, password_hash = ? WHERE id = 1', [
    String(email).trim(),
    hashPassword(newPassword),
  ]);
  res.json({ ok: true });
}));

// ----- Data (lecture publique pour la boutique ; écritures protégées) -----
app.get('/api/all', async (_req, res, next) => {
  try {
    res.json(await fetchAll());
  } catch (err) {
    next(err);
  }
});

// Products

// Upload d'une image depuis le téléphone : stocke les octets dans la base
// (compatible SQLite local + Turso) et renvoie une URL servie par le serveur.
app.post('/api/upload', requireAuth(async (req, res) => {
  try {
    const body = req.body as { name?: string; data?: string };
    const b64 = String(body?.data ?? '');
    if (!b64 || b64.length < 100) {
      res.status(400).json({ error: 'Image vide.' });
      return;
    }
    const buf = Buffer.from(b64, 'base64');
    if (buf.length > 8 * 1024 * 1024) {
      res.status(413).json({ error: 'Image trop lourde (max 8 Mo).' });
      return;
    }
    let mime = 'image/jpeg';
    if (b64.startsWith('/9j/')) mime = 'image/jpeg';
    else if (b64.startsWith('iVBORw0KGgo')) mime = 'image/png';
    else if (b64.startsWith('UklGR')) mime = 'image/webp';
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await db.run(
      'INSERT INTO uploaded_images (id, mime, data) VALUES (?, ?, ?)',
      [id, mime, b64]
    );
    res.json({ url: `/api/uploaded/${id}` });
  } catch (e) {
    console.error('Erreur upload:', e);
    res.status(500).json({ error: 'Erreur serveur lors de l\u2019envoi de la photo.' });
  }
}));

app.get('/api/uploaded/:id', async (req, res, next) => {
  try {
    const rows = await db.all(
      'SELECT mime, data FROM uploaded_images WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Image introuvable.' });
      return;
    }
    res.setHeader('Content-Type', String(rows[0].mime));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(String(rows[0].data), 'base64'));
  } catch (e) {
    next(e);
  }
});

app.get('/api/products', requireAuth(async (_req, res) => {
  const result = await db.all(selectProducts, []);
  res.json(result.map((r) => rowToProduct(r)));
}));

app.post('/api/products', requireAuth(async (req, res) => {
  const p = req.body as Product;
  if (!p || !p.id || !p.name) {
    res.status(400).json({ error: 'Produit invalide.' });
    return;
  }
  const row = productRow(p);
  await db.run(row.sql, row.args);
  const result = await db.all('SELECT * FROM products WHERE id = ?', [p.id]);
  res.json(rowToProduct(result[0]));
}));

app.put('/api/products/:id', requireAuth(async (req, res) => {
  const id = req.params.id;
  const patch = req.body as Partial<Product>;
  const existing = await db.all('SELECT * FROM products WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404).json({ error: 'Produit introuvable.' });
    return;
  }
  const merged = rowToProduct(existing[0]);
  const next: Product = { ...merged, ...patch, id };
  const row = productRow(next);
  await db.run(row.sql, row.args);
  res.json(next);
}));

app.delete('/api/products/:id', requireAuth(async (req, res) => {
  const id = req.params.id;
  await db.transaction(async (tx) => {
    await tx.run('DELETE FROM products WHERE id = ?', [id]);
    await tx.run(
      "UPDATE instagram_posts SET product_id = '', product_tagged_name = '', product_tagged_price = 0 WHERE product_id = ?",
      [id]
    );
  });
  res.json({ id });
}));

// Categories
app.post('/api/categories', requireAuth(async (req, res) => {
  const c = req.body as CategoryInfo;
  if (!c || !c.id || !c.name) {
    res.status(400).json({ error: 'Catégorie invalide.' });
    return;
  }
  const row = categoryRow(c);
  await db.run(row.sql, row.args);
  res.json(c);
}));

app.put('/api/categories/:id', requireAuth(async (req, res) => {
  const id = req.params.id;
  const patch = req.body as Partial<CategoryInfo>;
  const existing = await db.all('SELECT * FROM categories WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404).json({ error: 'Catégorie introuvable.' });
    return;
  }
  const cur = existing[0];
  const renamed = patch.name && patch.name !== cur.name;
  const next: CategoryInfo = {
    id,
    name: (patch.name ?? cur.name) as string,
    tagline: (patch.tagline ?? cur.tagline) as string,
    itemCount: patch.itemCount ?? Number(cur.item_count),
    image: (patch.image ?? cur.image) as string,
    badge: patch.badge ?? ((cur.badge as string) || undefined),
  };
  await db.transaction(async (tx) => {
    const row = categoryRow(next);
    await tx.run(row.sql, row.args);
    if (renamed) {
      await tx.run('UPDATE products SET category_name = ? WHERE category = ?', [patch.name, id]);
    }
  });
  res.json(next);
}));

app.delete('/api/categories/:id', requireAuth(async (req, res) => {
  const id = req.params.id;
  const remaining = await db.all(
    'SELECT id, name FROM categories WHERE id != ? ORDER BY rowid LIMIT 1',
    [id]
  );
  await db.transaction(async (tx) => {
    await tx.run('DELETE FROM categories WHERE id = ?', [id]);
    if (remaining.length > 0) {
      await tx.run('UPDATE products SET category = ?, category_name = ? WHERE category = ?', [
        remaining[0].id,
        remaining[0].name,
        id,
      ]);
    }
  });
  res.json({ id });
}));

// Instagram posts
app.post('/api/posts', requireAuth(async (req, res) => {
  const p = req.body as InstagramPost;
  if (!p || !p.id) {
    res.status(400).json({ error: 'Publication invalide.' });
    return;
  }
  const row = postRow(p);
  await db.run(row.sql, row.args);
  res.json(p);
}));

app.put('/api/posts/:id', requireAuth(async (req, res) => {
  const id = req.params.id;
  const existing = await db.all('SELECT * FROM instagram_posts WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404).json({ error: 'Publication introuvable.' });
    return;
  }
  const cur = existing[0];
  const patch = req.body as Partial<InstagramPost>;
  const next: InstagramPost = {
    id,
    handle: patch.handle ?? (cur.handle as string),
    caption: patch.caption ?? (cur.caption as string),
    imageUrl: patch.imageUrl ?? (cur.image_url as string),
    likes: patch.likes ?? Number(cur.likes),
    comments: patch.comments ?? Number(cur.comments),
    productTaggedName: patch.productTaggedName ?? (cur.product_tagged_name as string),
    productTaggedPrice: patch.productTaggedPrice ?? Number(cur.product_tagged_price),
    productId: patch.productId ?? (cur.product_id as string),
  };
  const row = postRow(next);
  await db.run(row.sql, row.args);
  res.json(next);
}));

app.delete('/api/posts/:id', requireAuth(async (req, res) => {
  await db.run('DELETE FROM instagram_posts WHERE id = ?', [req.params.id]);
  res.json({ id: req.params.id });
}));

// Bulk import (replace everything) & reset
app.post('/api/import', requireAuth(async (req, res) => {
  const { products, categories, instagramPosts } = req.body as any;
  if (
    !Array.isArray(products) ||
    !Array.isArray(categories) ||
    !Array.isArray(instagramPosts)
  ) {
    res.status(400).json({ error: 'Fichier de sauvegarde invalide.' });
    return;
  }
  await db.transaction(async (tx) => {
    await tx.run('DELETE FROM products', []);
    await tx.run('DELETE FROM categories', []);
    await tx.run('DELETE FROM instagram_posts', []);
    for (const p of products as Product[]) {
      const row = productRow(p);
      await tx.run(row.sql, row.args);
    }
    for (const c of categories as CategoryInfo[]) {
      const row = categoryRow(c);
      await tx.run(row.sql, row.args);
    }
    for (const p of instagramPosts as InstagramPost[]) {
      const row = postRow(p);
      await tx.run(row.sql, row.args);
    }
  });
  res.json(await fetchAll());
}));

app.post('/api/reset', requireAuth(async (_req, res) => {
  await db.transaction(async (tx) => {
    await tx.run('DELETE FROM products', []);
    await tx.run('DELETE FROM categories', []);
    await tx.run('DELETE FROM instagram_posts', []);
  });
  await seed();
  res.json(await fetchAll());
}));

// ----- Orders (client can place, admin can view/manage) -----
// Live notifications (SSE) : chaque admin connecté au tableau de bord
// reçoit un événement "order" dès qu'une commande est enregistrée.
const sseClients = new Set<Response>();
let sseHeartbeat: ReturnType<typeof setInterval> | null = null;

function broadcastOrder(order: Order): void {
  const payload = `event: order\nid: ${Date.now()}\ndata: ${JSON.stringify(order)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
  void sendOrderPushNotification(order);
}

// ----- Web Push : envoi d'une notification à chaque appareil abonné -----
async function pushToAll(payload: Record<string, unknown>): Promise<number> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return 0;
  const rows = await db.all('SELECT endpoint, sub_json FROM push_subscriptions', []);
  let sent = 0;
  for (const row of rows) {
    let sub: webpush.PushSubscription;
    try {
      sub = JSON.parse(String(row.sub_json));
    } catch {
      continue;
    }
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      sent++;
    } catch (err) {
      const status = Number((err as { statusCode?: number })?.statusCode) || 0;
      // Abonnement expiré/supprimé côté navigateur -> on le nettoie.
      if (status === 404 || status === 410) {
        await db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', [
          String(row.endpoint),
        ]);
      }
    }
  }
  return sent;
}

async function sendOrderPushNotification(order: Order): Promise<void> {
  const title = `Nouvelle commande ${order.id}`;
  const body = `${order.customer.firstName} ${order.customer.lastName} — ${order.total} ${order.currency}`;

  await pushToAll({
    type: 'order',
    title,
    body,
    orderId: order.id,
    url: '/#/dashboard',
  }).catch((e) => console.error('Web push error:', e));

  // App Android native (Pushy) : fiable même app/Chrome fermé (téléphone allumé)
  if (PUSHY_SECRET_KEY) {
    const rows = await db.all('SELECT token FROM pushy_tokens', []);
    const tokens = rows.map((r) => String(r.token));
    if (tokens.length > 0) {
      await sendPushyToAll(tokens, title, body, { orderId: order.id, url: '/#/dashboard' })
        .catch((e) => console.error('Pushy error:', e));
    }
  }

  // App Play Store "ntfy" : notification même app/Chrome fermé (téléphone allumé)
  await sendNtfyNotification(title, body).catch((e) => console.error('ntfy error:', e));
}

// Envoie une notification via l'app ntfy (topic public ntfy.sh ou auto-hébergé).
async function sendNtfyNotification(title: string, body: string): Promise<void> {
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: `${title}\n${body}`,
  });
  if (!res.ok) {
    console.error('ntfy response', res.status, (await res.text()).slice(0, 200));
  }
}

// Envoie une notification Pushy à chaque token d'appareil Android enregistré.
async function sendPushyToAll(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<number> {
  const res = await fetch(`https://api.pushy.me/push?api_key=${encodeURIComponent(PUSHY_SECRET_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: tokens,
      data: { title, body, ...data },
      notification: { title, body },
    }),
  });
  if (!res.ok) {
    console.error('Pushy API response', res.status, (await res.text()).slice(0, 300));
  }
  return tokens.length;
}

app.get('/api/events', async (req, res, next) => {
  try {
    const token = String(req.query.token ?? '').trim();
    if (!token) {
      res.status(401).json({ error: 'Accès refusé. Veuillez vous connecter.' });
      return;
    }
    const rows = await db.all('SELECT token FROM sessions WHERE token = ?', [token]);
    if (rows.length === 0) {
      res.status(401).json({ error: 'Accès refusé. Veuillez vous connecter.' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connecté\n\n');

    sseClients.add(res);
    if (!sseHeartbeat) {
      sseHeartbeat = setInterval(() => {
        if (sseClients.size === 0) {
          if (sseHeartbeat) clearInterval(sseHeartbeat);
          sseHeartbeat = null;
          return;
        }
        for (const client of sseClients) {
          try {
            client.write(': ping\n\n');
          } catch {
            sseClients.delete(client);
          }
        }
      }, 25000);
    }
    req.on('close', () => {
      sseClients.delete(res);
      if (sseClients.size === 0 && sseHeartbeat) {
        clearInterval(sseHeartbeat);
        sseHeartbeat = null;
      }
    });
  } catch (err) {
    next(err);
  }
});

// ----- Web Push : abonnement des appareils -----
app.get('/api/push/vapid-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY || null });
});

app.post('/api/push/subscribe', requireAuth(async (req, res) => {
  const sub = (req.body as any)?.subscription;
  if (
    !sub ||
    typeof sub.endpoint !== 'string' ||
    !sub.keys ||
    typeof sub.keys.p256dh !== 'string' ||
    typeof sub.keys.auth !== 'string'
  ) {
    res.status(400).json({ error: 'Abonnement invalide.' });
    return;
  }
  await db.run(
    'INSERT OR REPLACE INTO push_subscriptions (endpoint, sub_json) VALUES (?, ?)',
    [String(sub.endpoint), JSON.stringify(sub)]
  );
  res.json({ ok: true });
}));

app.delete('/api/push/subscribe', requireAuth(async (req, res) => {
  const endpoint = String((req.body as any)?.endpoint ?? '');
  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint manquant.' });
    return;
  }
  await db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
  res.json({ ok: true });
}));

// ----- App Android native (Pushy) : enregistrement d'un appareil -----
app.post('/api/pushy/register', requireAuth(async (req, res) => {
  const token = String((req.body as any)?.token ?? '').trim();
  if (!token) {
    res.status(400).json({ error: 'Token manquant.' });
    return;
  }
  await db.run('INSERT OR REPLACE INTO pushy_tokens (token, platform) VALUES (?, ?)', [
    token,
    String((req.body as any)?.platform ?? 'android'),
  ]);
  res.json({ ok: true });
}));

app.delete('/api/pushy/register', requireAuth(async (req, res) => {
  const token = String((req.body as any)?.token ?? '').trim();
  if (!token) {
    res.status(400).json({ error: 'Token manquant.' });
    return;
  }
  await db.run('DELETE FROM pushy_tokens WHERE token = ?', [token]);
  res.json({ ok: true });
}));

app.post('/api/push/test', requireAuth(async (_req, res) => {
  const sent = await pushToAll({
    type: 'test',
    title: 'Zebra Bags',
    body: 'Notifications opérationnelles ✓',
    url: '/#/dashboard',
  });
  res.json({ ok: true, sent });
}));

app.get('/api/push/status', requireAuth(async (_req, res) => {
  const rows = await db.all('SELECT endpoint, created_at FROM push_subscriptions', []);
  res.json({
    count: rows.length,
    devices: rows.map((r) => ({
      id: String(r.endpoint).slice(-12),
      createdAt: String(r.created_at ?? ''),
    })),
  });
}));

app.post('/api/orders', async (req, res, next) => {
  try {
    const o = req.body as Partial<Order>;
    if (!o || !o.customer || !Array.isArray(o.items)) {
      res.status(400).json({ error: 'Commande invalide.' });
      return;
    }
    const id = o.id || `ZB-${Date.now()}`;
    const full: Order = {
      id,
      customer: o.customer,
      items: o.items,
      subtotal: Number(o.subtotal ?? 0),
      discountPercent: Number(o.discountPercent ?? 0),
      shipping: Number(o.shipping ?? 0),
      total: Number(o.total ?? 0),
      currency: o.currency ?? 'DH',
      giftNote: o.giftNote,
      status: 'nouvelle',
      createdAt: new Date().toISOString(),
    };
    const row = orderRow(full);
    await db.run(row.sql, row.args);
    broadcastOrder(full);
    res.json({ id, ok: true });
  } catch (e) {
    next(e);
  }
});

app.get('/api/orders', requireAuth(async (_req, res) => {
  const rows = await db.all('SELECT * FROM orders ORDER BY created_at DESC, rowid DESC', []);
  res.json(rows.map((r) => rowToOrder(r)));
}));

app.put('/api/orders/:id', requireAuth(async (req, res) => {
  const status = String((req.body as any)?.status ?? '');
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400).json({ error: 'Statut invalide.' });
    return;
  }
  await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true, id: req.params.id, status });
}));

app.delete('/api/orders/:id', requireAuth(async (req, res) => {
  await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
  res.json({ id: req.params.id });
}));

// ----- Static (production) -----
const distDir = path.join(PROJECT_ROOT, 'dist');
app.use(express.static(distDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
    return;
  }
  res
    .status(503)
    .send('Le site n\u2019est pas encore compilé. Lancez d\u2019abord : npm run build');
});

// ----- Boot -----
async function boot() {
  try {
    db = await openDb();
    await db.exec(DDL.join(';\n'));
    await seed();
  } catch (err) {
    console.error(
      'Impossible de préparer la base de données. Vérifiez TURSO_DATABASE_URL / TURSO_AUTH_TOKEN dans .env :',
      err
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Serveur Zebra Bags démarré sur http://localhost:${PORT}  [Base : ${db.mode}]`);
  });
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

boot();