// Rehab Shop — Google Apps Script backend
// Deploy as Web App: Execute as "Me", Access "Anyone"
//
// Store these in Project Settings → Script Properties (File → Project properties):
//   ADMIN_KEY    — admin password (must match Vercel env)
//   JWT_SECRET   — random string for token signing
//
// The script auto-creates its required sheets on first run.

const ADMIN_KEY = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '';
const APP_NAME = 'Rehab Shop';

const SHEETS = {
  USERS: 'Users',
  CATEGORIES: 'Categories',
  COLLECTIONS: 'Collections',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'OrderItems',
  SETTINGS: 'Settings',
  BACKUPS: 'Backups',
  CARTS: 'Carts',
};

const PRODUCT_COLS = [
  'id', 'name', 'slug', 'subtitle', 'description', 'material', 'price', 'comparePrice',
  'costPrice', 'images', 'thumbnail', 'category', 'sizes', 'colors', 'weight',
  'inStock', 'stockQuantity', 'featured', 'isNew', 'isSale', 'rating', 'reviewCount',
  'tags', 'createdAt', 'updatedAt',
];

const ORDER_COLS = [
  'id', 'orderNumber', 'userId', 'status', 'fulfillmentStatus', 'total', 'subtotal',
  'shipping', 'tax', 'discount', 'couponCode', 'shippingName', 'shippingPhone',
  'shippingAddress', 'shippingCity', 'shippingProvince', 'shippingCountry',
  'shippingMethod', 'paymentMethod', 'paymentStatus', 'paymentId', 'whatsAppNotified',
  'driveBackedUp', 'notes', 'createdAt', 'updatedAt',
];

const ORDER_ITEM_COLS = ['id', 'orderId', 'productId', 'name', 'subtitle', 'price', 'quantity', 'size', 'color', 'image'];

const USER_COLS = ['id', 'email', 'name', 'phone', 'password', 'role', 'locale', 'createdAt', 'updatedAt'];

const CATEGORY_COLS = ['id', 'name', 'slug', 'description', 'image', 'icon', 'parentId', 'sortOrder', 'isActive'];

const SETTING_COLS = ['key', 'value', 'updatedAt'];

// ─── Entry point ───
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    return jsonResponse(handleAction(body));
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';
    return jsonResponse(handleAction({ action }));
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Router ───
function handleAction(body) {
  const action = body.action || 'ping';
  ensureSheets();

  switch (action) {
    case 'ping': return ping();
    case 'getPublicProducts': return getPublicProducts(body);
    case 'getPublicProduct': return getPublicProduct(body);
    case 'getPublicCategories': return getPublicCategories();
    case 'getPublicSettings': return getPublicSettings();

    case 'adminLogin': return adminLogin(body);
    case 'adminRegister': return adminRegister(body);
    case 'adminListProducts': return requireAdmin(body, () => adminListProducts());
    case 'adminUpsertProduct': return requireAdmin(body, () => adminUpsertProduct(body));
    case 'adminDeleteProduct': return requireAdmin(body, () => adminDeleteProduct(body));
    case 'adminStats': return requireAdmin(body, () => adminStats());
    case 'adminListOrders': return requireAdmin(body, () => adminListOrders());
    case 'adminUpdateOrder': return requireAdmin(body, () => adminUpdateOrder(body));
    case 'adminSetSettings': return requireAdmin(body, () => adminSetSettings(body));
    case 'adminBackupOrder': return requireAdmin(body, () => adminBackupOrder(body));
    case 'adminListBackups': return requireAdmin(body, () => adminListBackups());

    case 'createOrder': return createOrder(body);
    case 'listOrdersForUser': return listOrdersForUser(body);
    case 'listCartItems': return listCartItems(body);
    case 'upsertCartItem': return upsertCartItem(body);
    case 'deleteCartItem': return deleteCartItem(body);
    case 'seedSampleData': return requireAdmin(body, () => seedSampleData());

    default: return { ok: false, error: 'Unknown action: ' + action };
  }
}

// ─── Auth helper ───
function requireAdmin(body, fn) {
  if (!ADMIN_KEY) return { ok: false, error: 'ADMIN_KEY not configured on GAS side' };
  if (String(body.admin_key || '') !== ADMIN_KEY) return { ok: false, error: 'Unauthorized' };
  return fn();
}

function ping() {
  return { ok: true, message: 'pong', store: APP_NAME, currency: 'SAR', time: new Date().toISOString() };
}

// ─── Public product reads ───
function getPublicProducts(body) {
  const all = readSheet(SHEETS.PRODUCTS, PRODUCT_COLS);
  let products = all;
  if (body.category && body.category !== 'all') {
    products = products.filter(p => p.category === body.category);
  }
  if (body.search) {
    const q = String(body.search).toLowerCase();
    products = products.filter(p => String(p.name || '').toLowerCase().includes(q));
  }
  if (body.featured === true || body.featured === 'true') {
    products = products.filter(p => p.featured === true || p.featured === 'TRUE');
  }
  products = products.filter(p => p.inStock !== false && p.inStock !== 'FALSE');
  return { ok: true, products, count: products.length };
}

function getPublicProduct(body) {
  const all = readSheet(SHEETS.PRODUCTS, PRODUCT_COLS);
  const product = all.find(p => p.id === body.id || p.slug === body.id) || null;
  if (!product) return { ok: false, error: 'Product not found' };
  return { ok: true, product };
}

function getPublicCategories() {
  const all = readSheet(SHEETS.CATEGORIES, CATEGORY_COLS);
  const active = all.filter(c => c.isActive === true || c.isActive === 'TRUE');
  return { ok: true, categories: active };
}

function getPublicSettings() {
  const settings = {};
  readSheet(SHEETS.SETTINGS, SETTING_COLS).forEach(row => { settings[row.key] = row.value; });
  return { ok: true, settings };
}

// ─── Auth ───
function adminLogin(body) {
  if (!body.email || !body.password) return { ok: false, error: 'Email and password required' };
  // Shared secret path: the ADMIN_KEY script property acts as a master password.
  // If the customer types the shared secret as the password, grant admin access
  // regardless of the email entered. This matches the project taste: simple
  // shared secret instead of JWT or per-user passwords.
  if (ADMIN_KEY && String(body.password) === String(ADMIN_KEY)) {
    const users = readSheet(SHEETS.USERS, USER_COLS);
    const adminUser = users.find(u => String(u.role || '').toLowerCase() === 'admin')
      || users[0]
      || { id: Utilities.getUuid(), email: body.email, name: 'Admin', role: 'admin' };
    return { ok: true, id: adminUser.id, email: body.email || adminUser.email, name: adminUser.name, role: 'admin', phone: adminUser.phone || '' };
  }
  // Per-user password fallback (for normal users / customer accounts).
  const users = readSheet(SHEETS.USERS, USER_COLS);
  const user = users.find(u => String(u.email || '').toLowerCase() === String(body.email).toLowerCase());
  if (!user) return { ok: false, error: 'Invalid credentials' };
  if (String(user.password) !== String(body.password)) return { ok: false, error: 'Invalid credentials' };
  return { ok: true, id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone };
}

function adminRegister(body) {
  if (!body.email || !body.name || !body.password) return { ok: false, error: 'Email, name, and password required' };
  if (String(body.password).length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
  const users = readSheet(SHEETS.USERS, USER_COLS);
  if (users.find(u => String(u.email || '').toLowerCase() === String(body.email).toLowerCase())) {
    return { ok: false, error: 'Email already exists' };
  }
  const now = new Date().toISOString();
  const row = {
    id: Utilities.getUuid(),
    email: body.email,
    name: body.name,
    phone: body.phone || '',
    password: body.password,
    role: body.role || 'customer',
    locale: 'en',
    createdAt: now,
    updatedAt: now,
  };
  appendRow(SHEETS.USERS, USER_COLS, row);
  return { ok: true, id: row.id, email: row.email, name: row.name, role: row.role };
}

// ─── Admin: products ───
function adminListProducts() {
  const products = readSheet(SHEETS.PRODUCTS, PRODUCT_COLS);
  return { ok: true, products, count: products.length };
}

function adminUpsertProduct(body) {
  if (!body.name) return { ok: false, error: 'Name required' };
  const now = new Date().toISOString();
  const id = body.id || Utilities.getUuid();
  const slug = body.slug || String(body.name).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)/g, '');
  const row = {
    id,
    name: body.name,
    slug,
    subtitle: body.subtitle || '',
    description: body.description || '',
    material: body.material || '',
    price: Number(body.price || 0),
    comparePrice: body.comparePrice != null && body.comparePrice !== '' ? Number(body.comparePrice) : '',
    costPrice: body.costPrice != null && body.costPrice !== '' ? Number(body.costPrice) : '',
    images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
    thumbnail: body.thumbnail || '',
    category: body.category || 'uncategorized',
    sizes: body.sizes || '',
    colors: body.colors || '',
    weight: body.weight || '',
    inStock: body.inStock !== false,
    stockQuantity: Number(body.stockQuantity || 100),
    featured: body.featured === true,
    isNew: body.isNew === true,
    isSale: body.isSale === true,
    rating: Number(body.rating || 0),
    reviewCount: Number(body.reviewCount || 0),
    tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  upsertRow(SHEETS.PRODUCTS, PRODUCT_COLS, 'id', row);
  return { ok: true, product: row };
}

function adminDeleteProduct(body) {
  if (!body.id) return { ok: false, error: 'id required' };
  deleteRow(SHEETS.PRODUCTS, 'id', body.id);
  return { ok: true };
}

// ─── Admin: orders ───
function adminListOrders() {
  const orders = readSheet(SHEETS.ORDERS, ORDER_COLS);
  const items = readSheet(SHEETS.ORDER_ITEMS, ORDER_ITEM_COLS);
  const users = readSheet(SHEETS.USERS, USER_COLS);
  orders.forEach(o => {
    o.items = items.filter(i => i.orderId === o.id);
    const u = users.find(x => x.id === o.userId);
    if (u) o.user = { name: u.name, email: u.email };
  });
  orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { ok: true, orders };
}

function adminUpdateOrder(body) {
  if (!body.id) return { ok: false, error: 'id required' };
  const sheet = _getSpreadsheet().getSheetByName(SHEETS.ORDERS);
  const all = readSheet(SHEETS.ORDERS, ORDER_COLS);
  const existing = all.find(o => o.id === body.id);
  if (!existing) return { ok: false, error: 'Order not found' };
  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
  upsertRow(SHEETS.ORDERS, ORDER_COLS, 'id', updated);
  return { ok: true, order: updated };
}

// ─── Admin: stats ───
function adminStats() {
  const orders = readSheet(SHEETS.ORDERS, ORDER_COLS);
  const products = readSheet(SHEETS.PRODUCTS, PRODUCT_COLS);
  const users = readSheet(SHEETS.USERS, USER_COLS);
  const total_orders = orders.length;
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const by_status = {};
  orders.forEach(o => { by_status[o.status] = (by_status[o.status] || 0) + 1; });
  const total_products = products.length;
  const low_stock_count = products.filter(p => Number(p.stockQuantity || 0) < 5).length;
  const total_customers = users.filter(u => u.role === 'customer' || !u.role).length;
  return { ok: true, stats: { total_orders, revenue, by_status, total_products, low_stock_count, total_customers } };
}

// ─── Admin: settings ───
function adminSetSettings(body) {
  if (!body.settings || typeof body.settings !== 'object') return { ok: false, error: 'settings object required' };
  const now = new Date().toISOString();
  Object.entries(body.settings).forEach(([key, value]) => {
    upsertRow(SHEETS.SETTINGS, SETTING_COLS, 'key', { key, value: String(value), updatedAt: now });
  });
  return { ok: true };
}

// ─── Admin: backups ───
function adminBackupOrder(body) {
  if (!body.orderId) return { ok: false, error: 'orderId required' };
  const orders = readSheet(SHEETS.ORDERS, ORDER_COLS);
  const items = readSheet(SHEETS.ORDER_ITEMS, ORDER_ITEM_COLS);
  const order = orders.find(o => o.id === body.orderId);
  if (!order) return { ok: false, error: 'Order not found' };
  const backup = {
    order: { ...order, items: items.filter(i => i.orderId === order.id) },
    backupTimestamp: new Date().toISOString(),
  };
  const all = readSheet(SHEETS.BACKUPS, ['key', 'value', 'updatedAt']);
  const key = 'backup_order_' + order.orderNumber;
  const value = JSON.stringify(backup);
  upsertRow(SHEETS.BACKUPS, ['key', 'value', 'updatedAt'], 'key', { key, value, updatedAt: new Date().toISOString() });
  return { ok: true, message: 'Order backed up', orderNumber: order.orderNumber };
}

function adminListBackups() {
  const all = readSheet(SHEETS.BACKUPS, ['key', 'value', 'updatedAt']);
  return { ok: true, backups: all.map(b => ({ key: b.key, timestamp: b.updatedAt })), count: all.length };
}

// ─── Customer: orders ───
function createOrder(body) {
  if (!body.userId) return { ok: false, error: 'userId required' };
  if (!Array.isArray(body.items) || body.items.length === 0) return { ok: false, error: 'items required' };
  const now = new Date().toISOString();
  const orderId = Utilities.getUuid();
  const orderRow = {
    id: orderId,
    orderNumber: body.orderNumber || ('RB-' + Date.now().toString(36).toUpperCase()),
    userId: body.userId,
    status: 'pending',
    fulfillmentStatus: 'unfulfilled',
    total: Number(body.total || 0),
    subtotal: Number(body.subtotal || 0),
    shipping: Number(body.shipping || 0),
    tax: Number(body.tax || 0),
    discount: Number(body.discount || 0),
    couponCode: body.couponCode || '',
    shippingName: body.shippingName || '',
    shippingPhone: body.shippingPhone || '',
    shippingAddress: body.shippingAddress || '',
    shippingCity: body.shippingCity || '',
    shippingProvince: body.shippingProvince || '',
    shippingCountry: body.shippingCountry || 'SA',
    shippingMethod: body.shippingMethod || '',
    paymentMethod: body.paymentMethod || 'cod',
    paymentStatus: 'pending',
    paymentId: body.paymentId || '',
    whatsAppNotified: false,
    driveBackedUp: false,
    notes: body.notes || '',
    createdAt: now,
    updatedAt: now,
  };
  appendRow(SHEETS.ORDERS, ORDER_COLS, orderRow);
  body.items.forEach(item => {
    appendRow(SHEETS.ORDER_ITEMS, ORDER_ITEM_COLS, {
      id: Utilities.getUuid(),
      orderId,
      productId: item.productId || '',
      name: item.name || '',
      subtitle: item.subtitle || '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      size: item.size || '',
      color: item.color || '',
      image: item.image || '',
    });
  });
  return { ok: true, order: orderRow };
}

function listOrdersForUser(body) {
  if (!body.userId) return { ok: false, error: 'userId required' };
  const orders = readSheet(SHEETS.ORDERS, ORDER_COLS).filter(o => o.userId === body.userId);
  const items = readSheet(SHEETS.ORDER_ITEMS, ORDER_ITEM_COLS);
  orders.forEach(o => { o.items = items.filter(i => i.orderId === o.id); });
  orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { ok: true, orders };
}

// ─── Customer: cart ───
function listCartItems(body) {
  if (!body.userId) return { ok: false, error: 'userId required' };
  const all = readSheet(SHEETS.CARTS, ['id', 'userId', 'productId', 'quantity', 'size', 'color', 'createdAt', 'updatedAt']);
  const items = all.filter(c => c.userId === body.userId);
  const products = readSheet(SHEETS.PRODUCTS, PRODUCT_COLS);
  items.forEach(i => { i.product = products.find(p => p.id === i.productId) || null; });
  return { ok: true, items };
}

function upsertCartItem(body) {
  if (!body.userId || !body.productId) return { ok: false, error: 'userId and productId required' };
  const cols = ['id', 'userId', 'productId', 'quantity', 'size', 'color', 'createdAt', 'updatedAt'];
  const all = readSheet(SHEETS.CARTS, cols);
  const size = body.size || '';
  const color = body.color || '';
  const existing = all.find(c => c.userId === body.userId && c.productId === body.productId && c.size === size && c.color === color);
  const now = new Date().toISOString();
  if (existing) {
    const updated = { ...existing, quantity: Number(existing.quantity || 0) + Number(body.quantity || 1), updatedAt: now };
    upsertRow(SHEETS.CARTS, cols, 'id', updated);
    return { ok: true, item: updated };
  }
  const row = {
    id: Utilities.getUuid(),
    userId: body.userId,
    productId: body.productId,
    quantity: Number(body.quantity || 1),
    size,
    color,
    createdAt: now,
    updatedAt: now,
  };
  appendRow(SHEETS.CARTS, cols, row);
  return { ok: true, item: row };
}

function deleteCartItem(body) {
  const cols = ['id', 'userId', 'productId', 'quantity', 'size', 'color', 'createdAt', 'updatedAt'];
  if (body.id) {
    deleteRow(SHEETS.CARTS, 'id', body.id);
  } else if (body.userId) {
    deleteRows(SHEETS.CARTS, 'userId', body.userId);
  }
  return { ok: true };
}

// ─── Seed ───
function seedSampleData() {
  const SEED = [
    ['Dresses','dresses','Elegant dresses for every occasion','','dress','',0,true,0],
    ['Tops','tops','Stylish tops and blouses','','shirt','',1,true,0],
    ['Bottoms','bottoms','Pants, skirts, and shorts','','shopping-bag','',2,true,0],
    ['Activewear','activewear','Workout and sportswear','','dumbbell','',3,true,0],
    ['Outerwear','outerwear','Coats, jackets, and layers','','shield','',4,true,0],
    ['Shoes','shoes','Heels, sneakers, and boots','','footprints','',5,true,0],
    ['Accessories','accessories','Bags, jewelry, and more','','gem','',6,true,0],
    ['Lingerie','lingerie','Intimates and sleepwear','','heart','',7,true,0],
  ];
  SEED.forEach(row => {
    const id = Utilities.getUuid();
    upsertRow(SHEETS.CATEGORIES, CATEGORY_COLS, 'slug', {
      id, name: row[0], slug: row[1], description: row[2], image: row[3], icon: row[4],
      parentId: row[5], sortOrder: row[6], isActive: row[7],
    });
  });

  const products = [
    { name: 'Silk Evening Gown', subtitle: 'Red Carpet Ready', description: 'Floor-length silk evening gown with A-line silhouette. Perfect for galas.', material: '100% Mulberry Silk', price: 189.99, comparePrice: 249.99, images: '["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600"]', category: 'dresses', sizes: 'XS,S,M,L,XL', colors: 'Black,Navy,Burgundy', inStock: true, stockQuantity: 45, featured: true, isNew: true, isSale: true, rating: 4.8, reviewCount: 124 },
    { name: 'Floral Midi Dress', subtitle: 'Spring Romance', description: 'Floral print midi dress with wrap design. Lightweight chiffon with V-neck and flutter sleeves.', material: 'Chiffon Blend', price: 79.99, comparePrice: 99.99, images: '["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600"]', category: 'dresses', sizes: 'XS,S,M,L', colors: 'Blue Floral,Pink Floral', inStock: true, stockQuantity: 80, featured: true, isNew: false, isSale: true, rating: 4.6, reviewCount: 89 },
    { name: 'Cashmere Wrap Blouse', subtitle: 'Luxury Knit', description: 'Soft cashmere wrap blouse with tie-front. Lightweight knit for cool evenings.', material: '100% Cashmere', price: 129.99, comparePrice: '', images: '["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600"]', category: 'tops', sizes: 'S,M,L,XL', colors: 'Cream,Rose,Sage', inStock: true, stockQuantity: 35, featured: true, isNew: true, isSale: false, rating: 4.7, reviewCount: 67 },
    { name: 'Off-Shoulder Crop Top', subtitle: 'Summer Vibes', description: 'Trendy off-shoulder crop top with elastic neckline. Cotton blend, ribbed texture.', material: 'Cotton Blend', price: 34.99, comparePrice: 44.99, images: '["https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600"]', category: 'tops', sizes: 'XS,S,M,L', colors: 'White,Black,Coral', inStock: true, stockQuantity: 120, featured: false, isNew: false, isSale: true, rating: 4.3, reviewCount: 203 },
    { name: 'High-Waist Wide Leg Pants', subtitle: 'Sophisticated', description: 'High-waist wide leg pants in premium crepe. Side pockets, concealed zipper.', material: 'Premium Crepe', price: 89.99, comparePrice: 119.99, images: '["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600"]', category: 'bottoms', sizes: 'XS,S,M,L,XL', colors: 'Black,Beige,Olive', inStock: true, stockQuantity: 60, featured: true, isNew: false, isSale: true, rating: 4.5, reviewCount: 156 },
    { name: 'Performance Yoga Set', subtitle: 'Workout Essential', description: 'Yoga set with sports bra and high-waist leggings. Moisture-wicking four-way stretch.', material: 'Nylon / Spandex', price: 74.99, comparePrice: 94.99, images: '["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600"]', category: 'activewear', sizes: 'XS,S,M,L,XL', colors: 'Black,Plum,Teal', inStock: true, stockQuantity: 70, featured: true, isNew: true, isSale: true, rating: 4.9, reviewCount: 312 },
    { name: 'Wool Blend Trench Coat', subtitle: 'Timeless', description: 'Wool blend trench coat with double-breasted buttons and belt tie. Water-resistant.', material: 'Wool Blend', price: 199.99, comparePrice: 279.99, images: '["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600"]', category: 'outerwear', sizes: 'S,M,L,XL', colors: 'Camel,Black,Grey', inStock: true, stockQuantity: 25, featured: true, isNew: false, isSale: true, rating: 4.7, reviewCount: 94 },
    { name: 'Classic Stiletto Pumps', subtitle: 'Wardrobe Essential', description: 'Timeless stiletto pumps, 3.5-inch heel, pointed toe. Genuine leather.', material: 'Genuine Leather', price: 109.99, comparePrice: 139.99, images: '["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600"]', category: 'shoes', sizes: '36,37,38,39,40,41', colors: 'Black,Nude,Red', inStock: true, stockQuantity: 50, featured: true, isNew: false, isSale: true, rating: 4.6, reviewCount: 201 },
    { name: 'Leather Crossbody Bag', subtitle: 'Everyday Luxury', description: 'Crossbody bag in full-grain leather, gold-tone hardware, adjustable strap.', material: 'Full-Grain Leather', price: 159.99, comparePrice: 199.99, images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"]', category: 'accessories', sizes: 'One Size', colors: 'Tan,Black,Burgundy', inStock: true, stockQuantity: 30, featured: true, isNew: false, isSale: true, rating: 4.8, reviewCount: 178 },
    { name: 'Silk Pajama Set', subtitle: 'Bedtime Luxury', description: 'Mulberry silk pajama set, button-front top and straight-leg pants.', material: '100% Mulberry Silk', price: 119.99, comparePrice: 159.99, images: '["https://images.unsplash.com/photo-1611937663641-5cef5189fc29?w=600"]', category: 'lingerie', sizes: 'S,M,L,XL', colors: 'Champagne,Dusty Rose,Black', inStock: true, stockQuantity: 40, featured: true, isNew: true, isSale: true, rating: 4.9, reviewCount: 267 },
  ];
  products.forEach(p => {
    const now = new Date().toISOString();
    const slug = p.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)/g, '');
    upsertRow(SHEETS.PRODUCTS, PRODUCT_COLS, 'slug', { id: Utilities.getUuid(), slug, ...p, createdAt: now, updatedAt: now });
  });

  // Admin + demo users (default password matching Zcode's seed)
  const now = new Date().toISOString();
  upsertRow(SHEETS.USERS, USER_COLS, 'email', { id: Utilities.getUuid(), email: 'admin@rehabshop.com', name: 'Admin', phone: '+201555121132', password: '', role: 'admin', locale: 'en', createdAt: now, updatedAt: now });
  upsertRow(SHEETS.USERS, USER_COLS, 'email', { id: Utilities.getUuid(), email: 'demo@rehabshop.com', name: 'Demo User', phone: '+1234567890', password: 'demo123', role: 'customer', locale: 'en', createdAt: now, updatedAt: now });

  // Default settings
  const defaults = [
    ['whatsapp_admin_phone', ''],
    ['whatsapp_api_token', ''],
    ['whatsapp_instance_id', ''],
    ['google_drive_credentials', '{}'],
    ['store_name', 'Rehab Shop'],
    ['store_currency', 'SAR'],
    ['store_locale', 'en'],
    ['shipping_free_threshold', '100'],
    ['shipping_flat_rate', '9.99'],
    ['tax_rate', '0.08'],
  ];
  defaults.forEach(([k, v]) => upsertRow(SHEETS.SETTINGS, SETTING_COLS, 'key', { key: k, value: v, updatedAt: new Date().toISOString() }));

  return { ok: true, categories: SEED.length, products: products.length };
}

// ─── Sheet utilities ───
function _getSpreadsheet() {
  if (typeof SHEET_ID !== "undefined" && SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  try { const ss = SpreadsheetApp.getActive(); if (ss) return ss; } catch (e) {}
  throw new Error("No sheet available: set SHEET_ID Script Property or run from a container-bound script");
}

function ensureSheets() {
  const ss = _getSpreadsheet();
  if (!ss) {
    // No active spreadsheet (e.g. running from a context without a bound
    // sheet). The handler can still respond, but data ops will fail.
    return;
  }
  Object.entries(SHEETS).forEach(([key, name]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const cols = getSheetColumns(key);
    if (cols && sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    }
  });
}

function getSheetColumns(key) {
  switch (key) {
    case 'USERS': return USER_COLS;
    case 'CATEGORIES': return CATEGORY_COLS;
    case 'PRODUCTS': return PRODUCT_COLS;
    case 'ORDERS': return ORDER_COLS;
    case 'ORDER_ITEMS': return ORDER_ITEM_COLS;
    case 'SETTINGS': return SETTING_COLS;
    case 'BACKUPS': return ['key', 'value', 'updatedAt'];
    case 'CARTS': return ['id', 'userId', 'productId', 'quantity', 'size', 'color', 'createdAt', 'updatedAt'];
    case 'COLLECTIONS': return ['id', 'title', 'slug', 'description', 'image', 'isActive', 'createdAt', 'updatedAt'];
    default: return null;
  }
}

function readSheet(name, cols) {
  const sh = _getSpreadsheet().getSheetByName(name);
  if (!sh) return [];
  const last = sh.getLastRow();
  if (last < 2) return [];
  const data = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  return data.map(row => {
    const obj = {};
    for (let i = 0; i < cols.length; i++) obj[cols[i]] = row[i];
    return obj;
  });
}

function appendRow(name, cols, row) {
  const sh = _getSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  const values = cols.map(c => row[c] !== undefined ? row[c] : '');
  sh.appendRow(values);
}

function upsertRow(name, cols, keyField, row) {
  const sh = _getSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  const keyCol = cols.indexOf(keyField) + 1;
  if (keyCol < 1) throw new Error('Key field not in cols: ' + keyField);
  const all = sh.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][keyCol - 1]) === String(row[keyField])) {
      const values = cols.map(c => row[c] !== undefined ? row[c] : all[i][cols.indexOf(c)]);
      sh.getRange(i + 1, 1, 1, cols.length).setValues([values]);
      return;
    }
  }
  const values = cols.map(c => row[c] !== undefined ? row[c] : '');
  sh.appendRow(values);
}

function deleteRow(name, keyField, keyValue) {
  const sh = _getSpreadsheet().getSheetByName(name);
  if (!sh) return;
  const cols = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const keyCol = cols.indexOf(keyField) + 1;
  if (keyCol < 1) return;
  const all = sh.getDataRange().getValues();
  for (let i = all.length - 1; i >= 1; i--) {
    if (String(all[i][keyCol - 1]) === String(keyValue)) {
      sh.deleteRow(i + 1);
    }
  }
}

function deleteRows(name, keyField, keyValue) {
  const sh = _getSpreadsheet().getSheetByName(name);
  if (!sh) return;
  const cols = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const keyCol = cols.indexOf(keyField) + 1;
  if (keyCol < 1) return;
  const all = sh.getDataRange().getValues();
  for (let i = all.length - 1; i >= 1; i--) {
    if (String(all[i][keyCol - 1]) === String(keyValue)) {
      sh.deleteRow(i + 1);
    }
  }
}
