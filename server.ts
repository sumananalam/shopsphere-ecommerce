import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'purplecart.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    discount_percentage INTEGER DEFAULT 0,
    rating REAL DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 100,
    brand TEXT,
    is_featured INTEGER DEFAULT 0,
    is_best_seller INTEGER DEFAULT 0,
    is_deal INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    image_url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wishlist_id INTEGER,
    product_id INTEGER,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL NOT NULL,
    shipping_fee REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    status TEXT DEFAULT 'Processing',
    shipping_address_id INTEGER,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Paid',
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    status TEXT DEFAULT 'Success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    fixed_discount REAL DEFAULT 0,
    min_purchase REAL DEFAULT 0,
    expiry_date TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER UNIQUE,
    stock_quantity INTEGER DEFAULT 100,
    low_stock_threshold INTEGER DEFAULT 10,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  console.log('Seeding database with initial data...');

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)');
  const adminRes = insertUser.run('Admin User', 'admin@purplecart.com', adminPassword, 'admin', '+15550199283');
  const customerRes = insertUser.run('Jane Doe', 'jane@example.com', userPassword, 'customer', '+15550148291');

  const insertAddress = db.prepare('INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertAddress.run(customerRes.lastInsertRowid, 'Jane Doe', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', '+15550148291', 1);

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
  const catElectronics = insertCategory.run('Electronics', 'electronics', 'Smartphones, audio, laptops and gadgets', '/src/assets/images/prod_electronics_1794888018993.jpg').lastInsertRowid;
  const catFashion = insertCategory.run('Fashion', 'fashion', 'Trendy apparel, shoes and accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catHome = insertCategory.run('Home & Kitchen', 'home-kitchen', 'Decor, kitchenware, appliances and comfort', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catBeauty = insertCategory.run('Beauty & Personal Care', 'beauty-personal-care', 'Skincare, cosmetics and wellness', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catBooks = insertCategory.run('Books', 'books', 'Bestsellers, fiction, tech and education', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catSports = insertCategory.run('Sports & Fitness', 'sports-fitness', 'Fitness equipment, outdoor gear and apparel', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catToys = insertCategory.run('Toys & Games', 'toys-games', 'Action figures, board games and educational toys', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catGrocery = insertCategory.run('Grocery', 'grocery', 'Organic snacks, beverages and gourmet items', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800').lastInsertRowid;
  const catAccessories = insertCategory.run('Accessories', 'accessories', 'Watches, bags, wallets and sunglasses', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800').lastInsertRowid;

  const insertProduct = db.prepare(`
    INSERT INTO products (category_id, name, slug, description, price, original_price, discount_percentage, rating, review_count, stock, brand, is_featured, is_best_seller, is_deal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)');
  const insertInventory = db.prepare('INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold) VALUES (?, ?, ?)');

  const productsData = [
    {
      cat: catElectronics,
      name: 'PurpleAura Pro Wireless ANC Headphones',
      slug: 'purpleaura-pro-wireless-headphones',
      desc: 'Immersive active noise-canceling headphones with spatial audio, custom 40mm titanium drivers, and 40-hour battery life.',
      price: 249.99,
      orig: 299.99,
      disc: 17,
      rating: 4.8,
      reviews: 320,
      stock: 85,
      brand: 'PurpleAura',
      featured: 1,
      best: 1,
      deal: 1,
      images: [
        '/src/assets/images/prod_electronics_1794888018993.jpg',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catElectronics,
      name: 'Aether Ultra 5G Smartphone 256GB',
      slug: 'aether-ultra-5g-smartphone',
      desc: 'Blazing fast 5G smartphone featuring a stunning 6.8 AMOLED 120Hz display, 108MP quad camera system, and all-day battery.',
      price: 799.99,
      orig: 899.99,
      disc: 11,
      rating: 4.7,
      reviews: 184,
      stock: 45,
      brand: 'Aether',
      featured: 1,
      best: 1,
      deal: 0,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catFashion,
      name: 'Royal Velvet Oversized Streetwear Hoodie',
      slug: 'royal-velvet-oversized-hoodie',
      desc: 'Luxurious heavy-weight cotton fleece hoodie with embroidered PurpleCart monogram and comfortable relaxed drop-shoulder fit.',
      price: 79.99,
      orig: 119.99,
      disc: 33,
      rating: 4.9,
      reviews: 512,
      stock: 120,
      brand: 'VelvetLine',
      featured: 1,
      best: 1,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catFashion,
      name: 'Midnight Lavender Runner Sneakers',
      slug: 'midnight-lavender-runner-sneakers',
      desc: 'Engineered lightweight athletic sneakers with responsive cloud-foam cushioning, breathable mesh upper, and vibrant lavender accents.',
      price: 129.99,
      orig: 159.99,
      disc: 18,
      rating: 4.6,
      reviews: 210,
      stock: 60,
      brand: 'AuraStep',
      featured: 1,
      best: 0,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catHome,
      name: 'AromaLux Smart Espresso & Coffee Machine',
      slug: 'aromalux-smart-espresso-machine',
      desc: 'Barista-grade 20-bar espresso maker with integrated conical burr grinder, milk frother, and smartphone recipe control.',
      price: 449.99,
      orig: 549.99,
      disc: 18,
      rating: 4.8,
      reviews: 145,
      stock: 30,
      brand: 'AromaLux',
      featured: 1,
      best: 1,
      deal: 0,
      images: [
        'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catBeauty,
      name: 'Lumina Glow Botanical Night Serum 50ml',
      slug: 'lumina-glow-botanical-night-serum',
      desc: 'Rejuvenating facial serum infused with organic niacinamide, hyaluronic acid, and purple orchid extract for radiant youthful skin.',
      price: 58.00,
      orig: 75.00,
      disc: 22,
      rating: 4.9,
      reviews: 430,
      stock: 150,
      brand: 'Lumina Botanicals',
      featured: 1,
      best: 1,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1608248597359-97bc618e4fe9?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catBooks,
      name: 'Architects of Tomorrow: The Future of AI & Society',
      slug: 'architects-of-tomorrow-book',
      desc: 'A profound hardcover exploration of artificial intelligence, human consciousness, and global technological transformation.',
      price: 29.99,
      orig: 35.00,
      disc: 14,
      rating: 4.7,
      reviews: 95,
      stock: 200,
      brand: 'Apex Press',
      featured: 0,
      best: 1,
      deal: 0,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catSports,
      name: 'Titan Pro Ergonomic Carbon Fiber Yoga Mat & Set',
      slug: 'titan-pro-carbon-yoga-set',
      desc: 'Non-slip high-density eco yoga mat with alignment markers, cork yoga blocks, and organic cotton stretching strap.',
      price: 69.99,
      orig: 89.99,
      disc: 22,
      rating: 4.8,
      reviews: 178,
      stock: 90,
      brand: 'TitanFit',
      featured: 0,
      best: 0,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catAccessories,
      name: 'Chronos Eclipse Luxury Chronograph Watch',
      slug: 'chronos-eclipse-luxury-watch',
      desc: 'Swiss movement automatic watch with midnight purple dial, sapphire crystal glass, and solid stainless steel bracelet.',
      price: 320.00,
      orig: 400.00,
      disc: 20,
      rating: 4.9,
      reviews: 88,
      stock: 25,
      brand: 'Chronos',
      featured: 1,
      best: 1,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catGrocery,
      name: 'Organic Artisanal Lavender Dark Chocolate Truffles',
      slug: 'organic-lavender-dark-chocolate-truffles',
      desc: 'Handcrafted 72% single-origin dark chocolate truffles infused with organic French lavender blossoms and sea salt.',
      price: 24.99,
      orig: 30.00,
      disc: 16,
      rating: 4.9,
      reviews: 340,
      stock: 300,
      brand: 'CacaoLuxe',
      featured: 0,
      best: 1,
      deal: 0,
      images: [
        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catToys,
      name: 'Neon Cyberpunk Galactic Starship Building Kit',
      slug: 'neon-cyberpunk-galactic-starship',
      desc: '1,250-piece intricate building block set featuring LED lighting modules, movable cockpits, and collector display stand.',
      price: 99.99,
      orig: 129.99,
      disc: 23,
      rating: 4.8,
      reviews: 162,
      stock: 75,
      brand: 'BrickVerse',
      featured: 1,
      best: 0,
      deal: 1,
      images: [
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: catElectronics,
      name: 'Zenith 4K Ultra HD Gaming Monitor 27"',
      slug: 'zenith-4k-uhd-gaming-monitor',
      desc: '144Hz IPS gaming monitor with 1ms response time, HDR600, and immersive RGB ambient backlighting.',
      price: 399.99,
      orig: 499.99,
      disc: 20,
      rating: 4.7,
      reviews: 220,
      stock: 40,
      brand: 'Zenith',
      featured: 0,
      best: 1,
      deal: 0,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
      ]
    }
  ];

  for (const p of productsData) {
    const prodRes = insertProduct.run(
      p.cat, p.name, p.slug, p.desc, p.price, p.orig, p.disc, p.rating, p.reviews, p.stock, p.brand, p.featured, p.best, p.deal
    );
    const productId = prodRes.lastInsertRowid;
    for (const img of p.images) {
      insertImage.run(productId, img);
    }
    insertInventory.run(productId, p.stock, 10);
  }

  const insertCoupon = db.prepare('INSERT INTO coupons (code, discount_percentage, fixed_discount, min_purchase, expiry_date) VALUES (?, ?, ?, ?, ?)');
  insertCoupon.run('PURPLE10', 10, 0, 50, '2027-12-31');
  insertCoupon.run('SAVE20', 20, 0, 100, '2027-12-31');
  insertCoupon.run('WELCOME50', 0, 50, 200, '2027-12-31');

  db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(1);
  db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(2);
  db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(1);
  db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(2);

  console.log('Database seeding completed successfully.');
}

// --- API ROUTES ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)').run(
      name, email, passwordHash, 'customer', phone || ''
    );
    const userId = result.lastInsertRowid;

    db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
    db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);

    const user = db.prepare('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?').get(userId);
    res.json({ message: 'Registration successful', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  const { name, slug, description, image_url } = req.body;
  try {
    const result = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)').run(
      name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, image_url
    );
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const { category, search, brand, minPrice, maxPrice, rating, sort, featured, bestSeller, deal, limit } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (brand) {
      query += ` AND p.brand = ?`;
      params.push(brand);
    }
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }
    if (rating) {
      query += ` AND p.rating >= ?`;
      params.push(Number(rating));
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }
    if (bestSeller === 'true') {
      query += ` AND p.is_best_seller = 1`;
    }
    if (deal === 'true') {
      query += ` AND p.is_deal = 1`;
    }

    if (sort === 'price-low') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price-high') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY p.rating DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`;
    } else if (sort === 'popularity') {
      query += ` ORDER BY p.review_count DESC`;
    } else {
      query += ` ORDER BY p.id DESC`;
    }

    if (limit) {
      query += ` LIMIT ?`;
      params.push(Number(limit));
    }

    const products = db.prepare(query).all(...params);

    const productsWithImages = products.map((prod: any) => {
      const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = ?').all(prod.id);
      return {
        ...prod,
        images: images.map((img: any) => img.image_url)
      };
    });

    res.json(productsWithImages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = ?').all(product.id);
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(product.id);

    res.json({
      ...product,
      images: images.map((img: any) => img.image_url),
      reviews
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  const { category_id, name, slug, description, price, original_price, discount_percentage, stock, brand, is_featured, is_best_seller, is_deal, images } = req.body;
  try {
    const s = slug || name.toLowerCase().replace(/\s+/g, '-');
    const result = db.prepare(`
      INSERT INTO products (category_id, name, slug, description, price, original_price, discount_percentage, stock, brand, is_featured, is_best_seller, is_deal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(category_id, name, s, description, price, original_price, discount_percentage || 0, stock || 100, brand, is_featured ? 1 : 0, is_best_seller ? 1 : 0, is_deal ? 1 : 0);

    const productId = result.lastInsertRowid;
    if (images && Array.isArray(images)) {
      const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)');
      for (const img of images) {
        insertImg.run(productId, img);
      }
    }
    db.prepare('INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)').run(productId, stock || 100);

    res.json({ message: 'Product created successfully', productId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { category_id, name, description, price, original_price, discount_percentage, stock, brand, is_featured, is_best_seller, is_deal } = req.body;
  try {
    db.prepare(`
      UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, original_price = ?, discount_percentage = ?, stock = ?, brand = ?, is_featured = ?, is_best_seller = ?, is_deal = ?
      WHERE id = ?
    `).run(category_id, name, description, price, original_price, discount_percentage, stock, brand, is_featured ? 1 : 0, is_best_seller ? 1 : 0, is_deal ? 1 : 0, req.params.id);

    res.json({ message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cart', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    let cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId) as any;
    if (!cart) {
      const resCart = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
      cart = { id: resCart.lastInsertRowid, user_id: userId };
    }

    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.original_price, p.stock, p.slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `).all(cart.id);

    const itemsWithImages = items.map((item: any) => {
      const img = db.prepare('SELECT image_url FROM product_images WHERE product_id = ? LIMIT 1').get(item.product_id) as any;
      return {
        ...item,
        image_url: img ? img.image_url : ''
      };
    });

    res.json({ cartId: cart.id, items: itemsWithImages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

  try {
    let cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId) as any;
    if (!cart) {
      const resCart = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
      cart = { id: resCart.lastInsertRowid };
    }

    const existingItem = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?').get(cart.id, productId) as any;

    if (existingItem) {
      const newQty = quantity !== undefined ? quantity : existingItem.quantity + 1;
      if (newQty <= 0) {
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(existingItem.id);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existingItem.id);
      }
    } else if (quantity > 0 || quantity === undefined) {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cart.id, productId, quantity || 1);
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:itemId', (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.itemId);
    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wishlist', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    let wishlist = db.prepare('SELECT * FROM wishlists WHERE user_id = ?').get(userId) as any;
    if (!wishlist) {
      const resWish = db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);
      wishlist = { id: resWish.lastInsertRowid };
    }

    const items = db.prepare(`
      SELECT wi.id as wishlist_item_id, p.*
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.wishlist_id = ?
    `).all(wishlist.id);

    const itemsWithImages = items.map((prod: any) => {
      const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = ?').all(prod.id);
      return {
        ...prod,
        images: images.map((img: any) => img.image_url)
      };
    });

    res.json(itemsWithImages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

  try {
    let wishlist = db.prepare('SELECT * FROM wishlists WHERE user_id = ?').get(userId) as any;
    if (!wishlist) {
      const resWish = db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);
      wishlist = { id: resWish.lastInsertRowid };
    }

    const existing = db.prepare('SELECT * FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?').get(wishlist.id, productId);

    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?').run(wishlist.id, productId);
      res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      db.prepare('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)').run(wishlist.id, productId);
      res.json({ message: 'Added to wishlist', action: 'added' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal } = req.body;
  try {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code) as any;
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }
    if (cartTotal < coupon.min_purchase) {
      return res.status(400).json({ error: `Minimum purchase amount of $${coupon.min_purchase} required for this coupon` });
    }

    let discountAmount = 0;
    if (coupon.discount_percentage > 0) {
      discountAmount = (cartTotal * coupon.discount_percentage) / 100;
    } else if (coupon.fixed_discount > 0) {
      discountAmount = coupon.fixed_discount;
    }

    res.json({
      code: coupon.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountPercentage: coupon.discount_percentage
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  const { userId, shippingAddress, items, totalAmount, shippingFee, discountAmount, finalAmount, paymentMethod } = req.body;
  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  try {
    let addressId = null;
    if (shippingAddress) {
      const addrRes = db.prepare(`
        INSERT INTO addresses (user_id, full_name, street, city, state, postal_code, country, phone, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        userId,
        shippingAddress.fullName || 'Customer',
        shippingAddress.street || 'Main St',
        shippingAddress.city || 'City',
        shippingAddress.state || 'State',
        shippingAddress.postalCode || '12345',
        shippingAddress.country || 'USA',
        shippingAddress.phone || '555-0199',
      );
      addressId = addrRes.lastInsertRowid;
    }

    const trackingNumber = 'PC-' + Math.floor(100000 + Math.random() * 900000);

    const orderRes = db.prepare(`
      INSERT INTO orders (user_id, total_amount, shipping_fee, discount_amount, final_amount, status, shipping_address_id, payment_method, payment_status, tracking_number)
      VALUES (?, ?, ?, ?, ?, 'Processing', ?, ?, 'Paid', ?)
    `).run(userId, totalAmount, shippingFee || 0, discountAmount || 0, finalAmount, addressId, paymentMethod || 'Credit Card', trackingNumber);

    const orderId = orderRes.lastInsertRowid;

    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of items) {
      insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)').run(
      orderId, finalAmount, paymentMethod || 'Credit Card', 'Success'
    );

    const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId) as any;
    if (cart) {
      db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
    }

    res.json({ message: 'Order placed successfully', orderId, trackingNumber });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  try {
    let query = `
      SELECT o.*, a.full_name, a.street, a.city, a.state, a.postal_code, a.country 
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
    `;
    const params: any[] = [];
    if (userId) {
      query += ` WHERE o.user_id = ?`;
      params.push(userId);
    }
    query += ` ORDER BY o.created_at DESC`;

    const orders = db.prepare(query).all(...params);

    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.slug
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });

    res.json(ordersWithItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', (req, res) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "customer"').get() as any).count;
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
    const revenueRes = db.prepare('SELECT SUM(final_amount) as total FROM orders WHERE payment_status = "Paid"').get() as any;
    const totalRevenue = revenueRes.total || 0;

    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC LIMIT 5
    `).all();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, phone, created_at FROM users').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { userId, rating, comment } = req.body;
  try {
    db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(
      req.params.id, userId, rating, comment
    );

    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?').get(req.params.id) as any;
    db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(
      stats.avg_rating.toFixed(1), stats.count, req.params.id
    );

    res.json({ message: 'Review added successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PurpleCart server running on http://localhost:${PORT}`);
});
