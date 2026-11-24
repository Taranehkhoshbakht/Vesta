/**
 * پوشاک وستا — Cloudflare Worker
 * API کامل فروشگاه + سرویس فایل‌های استاتیک (public/)
 * دیتابیس: Cloudflare KV (کلید "db")
 *
 * این فایل معادل server.js (نسخه Express) است اما برای محیط Cloudflare Workers
 * بازنویسی شده تا بدون سرور اختصاصی روی Cloudflare اجرا شود.
 */

const ADMIN_ROLES = ['super_admin', 'manager', 'support', 'editor'];

function uid(p = '') {
  const a = new Uint8Array(6); crypto.getRandomValues(a);
  return p + [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}
function genToken() {
  const a = new Uint8Array(32); crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}
function genReferral() { return 'VESTA' + uid('').slice(0, 6).toUpperCase(); }
function tierOf(points) {
  if (points >= 5000) return { name: 'طلایی', color: '#c9a227', discount: 5 };
  if (points >= 2000) return { name: 'نقره‌ای', color: '#8a94a6', discount: 3 };
  if (points >= 500) return { name: 'برنزی', color: '#b07a4f', discount: 1 };
  return { name: 'عضو جدید', color: '#5e6d8c', discount: 0 };
}
function publicUser(u) { if (!u) return null; const { token, ...rest } = u; return rest; }

function seedDB() {
  const now = Date.now();
  const categories = [
    { id: 'cat-shoes', name: 'کفش', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', description: 'کفش‌های اسپرت، مجلسی و روزمره' },
    { id: 'cat-winter', name: 'لباس زمستانه', slug: 'winter', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', description: 'کاپشن، هودی، بافت و پالتو' },
    { id: 'cat-summer', name: 'لباس تابستونه', slug: 'summer', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', description: 'تیشرت، پیراهن و لباس‌های خنک تابستانی' },
    { id: 'cat-accessories', name: 'اکسسوری', slug: 'accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', description: 'کیف، ساعت، کمربند و اکسسوری‌های شیک' },
    { id: 'cat-women', name: 'زنانه', slug: 'women', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', description: 'پوشاک زنانه؛ مانتو، شومیز و پیراهن' },
    { id: 'cat-men', name: 'مردانه', slug: 'men', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', description: 'پوشاک مردانه؛ پیراهن، شلوار و کت' },
  ];
  const P = (id, title, cat, price, old, stock, img, desc, flash = false, rating = 4.5) => ({
    id, title, categoryId: cat, price, oldPrice: old || null, stock, image: img,
    images: [img], description: desc, sizes: ['S', 'M', 'L', 'XL'], colors: ['#5e6d8c', '#eacec5', '#bac2d9', '#222', '#fff'],
    rating, reviewsCount: Math.floor(Math.random() * 40) + 5, isFlash: flash, flashEnds: flash ? now + 1000 * 60 * 60 * 26 : null,
    isActive: true, createdAt: now - Math.floor(Math.random() * 20) * 86400000, createdBy: 'admin', soldCount: Math.floor(Math.random() * 120) + 10
  });
  const products = [
    P('p1', 'کاپشن چرم مردانه کلاسیک', 'cat-winter', 2890000, 3490000, 14, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', 'کاپشن چرم اصل با آستر گرم، دوخت درجه‌یک و طراحی کلاسیک. مناسب پاییز و زمستان، ضد آب و باد.', true, 4.8),
    P('p2', 'هودی اورسایز پشمی', 'cat-winter', 890000, 1190000, 32, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop', 'هودی نرم و گرم با پارچه پشمی، جیب کانگورویی و کلاه بزرگ. انتخابی راحت برای روزهای سرد.', true, 4.6),
    P('p3', 'کفش رانینگ نایک ایرزوم', 'cat-shoes', 1950000, 2400000, 21, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', 'کفش رانینگ سبک با زیره ایرزوم، تنفس‌پذیر و مناسب دویدن و استفاده روزانه.', false, 4.7),
    P('p4', 'کفش اسنیکر سفید مینیمال', 'cat-shoes', 1290000, null, 45, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', 'اسنیکر سفید مینیمال با چرم طبیعی، ست‌شونده با هر استایلی. زیره راحت و ضد لغزش.', false, 4.5),
    P('p5', 'تیشرت بیسیک نخی یقه‌دار', 'cat-summer', 390000, 520000, 80, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', 'تیشرت نخی ۱۰۰٪ پنبه، نرم و خنک برای تابستان. رنگ‌بندی متنوع و فرم آزاد.', true, 4.4),
    P('p6', 'پیراهن لینن تابستانی', 'cat-summer', 790000, null, 28, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop', 'پیراهن لینن سبک و تنفس‌پذیر، ایده‌آل برای روزهای گرم. برش راحت و شیک.', false, 4.6),
    P('p7', 'پیراهن مجلسی زنانه ساتن', 'cat-women', 1190000, 1490000, 18, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', 'پیراهن ساتن براق با فرم خوش‌نشین، مناسب مهمانی و استفاده روزمره شیک.', false, 4.7),
    P('p8', 'مانتو کتی زنانه', 'cat-women', 1590000, null, 22, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop', 'مانتو کتی با پارچه کرپ، دوخت تمیز و جزئیات ظریف. مناسب بهار و تابستان.', false, 4.5),
    P('p9', 'شلوار جین اسکینی', 'cat-men', 690000, 890000, 36, 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop', 'جین اسکینی کشی با فیت عالی، رنگ ثابت و راحت برای استفاده روزانه.', true, 4.4),
    P('p10', 'پیراهن مردانه آکسفورد', 'cat-men', 590000, null, 40, 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', 'پیراهن آکسفورد کلاسیک با یقه دکمه‌دار، مناسب کار و مهمانی.', false, 4.3),
    P('p11', 'کیف چرم دوشی', 'cat-accessories', 1490000, 1890000, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', 'کیف چرم طبیعی با جیب‌های کاربردی و بند قابل تنظیم. دست‌ساز و بادوام.', false, 4.8),
    P('p12', 'ساعت مچی کلاسیک', 'cat-accessories', 2290000, null, 9, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', 'ساعت مچی با بند چرم و صفحه مینیمال، ضد آب تا ۳ ATM. هدیه‌ای شیک.', false, 4.6),
    P('p13', 'بافت یقه‌دار زنانه', 'cat-winter', 990000, 1290000, 25, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop', 'بافت نرم و لطیف با یقه‌دار، گرم و راحت برای زمستان.', false, 4.5),
    P('p14', 'شلوارک جین تابستانی', 'cat-summer', 490000, null, 50, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop', 'شلوارک جین خنک و راحت برای تابستان، فیت آزاد و رنگ روشن.', false, 4.2),
    P('p15', 'کت تک مردانه', 'cat-men', 2490000, 2990000, 11, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', 'کت تک با برش مدرن و پارچه پشمی، مناسب مراسم و استایل رسمی.', false, 4.7),
    P('p16', 'کفش پاشنه‌دار مجلسی', 'cat-shoes', 1390000, null, 16, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', 'کفش پاشنه‌دار شیک و راحت با زیره نرم، مناسب مجالس.', false, 4.4),
  ];
  const users = [
    { id: 'u-admin', phone: '09037099476', name: 'مدیر کل فروشگاه', role: 'super_admin', wallet: 500000, points: 2500, referralCode: 'VESTAADMIN', referredBy: null, createdAt: now - 86400000 * 90, token: null, isBanned: false },
    { id: 'u-support', phone: '09961217945', name: 'پشتیبان فروشگاه', role: 'support', wallet: 100000, points: 800, referralCode: 'VESTASUPPORT', referredBy: null, createdAt: now - 86400000 * 60, token: null, isBanned: false },
    { id: 'u-demo', phone: '09120000000', name: 'کاربر نمونه', role: 'customer', wallet: 250000, points: 1250, referralCode: 'VESTADEMO1', referredBy: null, createdAt: now - 86400000 * 30, token: null, isBanned: false },
  ];
  return {
    users, categories, products, otps: [], orders: [],
    coupons: [
      { id: 'c1', code: 'WELCOME10', percent: 10, maxDiscount: 200000, minAmount: 500000, isActive: true, usageLimit: 1000, usedCount: 12, createdAt: now },
      { id: 'c2', code: 'VESTA20', percent: 20, maxDiscount: 500000, minAmount: 1500000, isActive: true, usageLimit: 500, usedCount: 5, createdAt: now },
      { id: 'c3', code: 'FREESHIP', percent: 0, maxDiscount: 0, minAmount: 0, isActive: true, usageLimit: 1000, usedCount: 20, freeShipping: true, createdAt: now },
    ],
    walletTx: [
      { id: uid('tx_'), userId: 'u-demo', amount: 250000, type: 'gift', description: 'هدیه عضویت باشگاه مشتریان', createdAt: now - 86400000 * 30 },
      { id: uid('tx_'), userId: 'u-admin', amount: 500000, type: 'charge', description: 'شارژ اولیه کیف پول مدیر', createdAt: now - 86400000 * 90 },
    ],
    reviews: [
      { id: uid('r_'), productId: 'p1', userId: 'u-demo', userName: 'کاربر نمونه', rating: 5, comment: 'کیفیت عالی، دقیقاً مثل عکس بود. ارسال هم سریع انجام شد.', createdAt: now - 86400000 * 5 },
      { id: uid('r_'), productId: 'p3', userId: 'u-demo', userName: 'کاربر نمونه', rating: 4, comment: 'خیلی راحته، برای دویدن عالیه.', createdAt: now - 86400000 * 3 },
    ],
    settings: { siteName: 'پوشاک وستا', freeShippingThreshold: 1000000, shippingCost: 49000, pointsPer100k: 10, walletGiftOnSignup: 50000, referralBonus: 30000, supportPhone: '09961217945' },
    seq: { order: 1000 }
  };
}

async function loadDB(env) {
  if (!env.DB) throw new Error('KV binding "DB" تنظیم نشده است. wrangler.toml را بررسی کنید.');
  const raw = await env.DB.get('db');
  if (!raw) { const db = seedDB(); await env.DB.put('db', JSON.stringify(db)); return db; }
  return JSON.parse(raw);
}
async function saveDB(env, db) { await env.DB.put('db', JSON.stringify(db)); }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' } });
}
function err(msg, status = 400) { return json({ error: msg }, status); }

async function getUser(request, db) {
  const h = request.headers.get('Authorization') || '';
  const token = h.replace('Bearer ', '');
  if (!token) return null;
  return db.users.find(u => u.token === token) || null;
}
async function requireAuth(request, env) {
  const db = await loadDB(env);
  const user = await getUser(request, db);
  if (!user) return { error: err('ابتدا وارد شوید', 401) };
  if (user.isBanned) return { error: err('حساب شما مسدود شده است', 403) };
  return { db, user };
}
function requireAdmin(user, roles) {
  if (!ADMIN_ROLES.includes(user.role)) return err('شما مدیر نیستید', 403);
  if (roles && !roles.includes(user.role)) return err('دسترسی کافی ندارید', 403);
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    if (method === 'OPTIONS') return json({}, 204);

    // فایل‌های استاتیک (فرانت‌اند)
    if (!path.startsWith('/api/')) {
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('Assets binding تنظیم نشده است.', { status: 500 });
    }

    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try { body = await request.json(); } catch { body = {}; }
    }
    const q = url.searchParams;

    try {
      // ---------- Auth ----------
      if (path === '/api/auth/request-otp' && method === 'POST') {
        const { phone } = body;
        if (!phone || !/^09\d{9}$/.test(phone)) return err('شماره موبایل معتبر وارد کنید (مثل 09123456789)');
        const db = await loadDB(env);
        const code = String(Math.floor(10000 + Math.random() * 90000));
        db.otps = db.otps.filter(o => o.phone !== phone);
        db.otps.push({ phone, code, expires: Date.now() + 5 * 60 * 1000, createdAt: Date.now() });
        await saveDB(env, db);
        return json({ success: true, message: 'کد تایید ارسال شد', demoCode: code, expiresIn: 300 });
      }
      if (path === '/api/auth/verify-otp' && method === 'POST') {
        const { phone, code, name, referralCode } = body;
        if (!phone || !code) return err('شماره و کد تایید لازم است');
        const db = await loadDB(env);
        const otp = db.otps.find(o => o.phone === phone && o.code === String(code));
        if (!otp) return err('کد تایید اشتباه است');
        if (otp.expires < Date.now()) return err('کد تایید منقضی شده است');
        db.otps = db.otps.filter(o => o !== otp);
        let user = db.users.find(u => u.phone === phone);
        const isNew = !user;
        if (!user) {
          user = { id: uid('u_'), phone, name: name || 'کاربر جدید', role: 'customer', wallet: db.settings.walletGiftOnSignup || 50000, points: 100, referralCode: genReferral(), referredBy: null, createdAt: Date.now(), token: null, isBanned: false };
          if (referralCode) {
            const ref = db.users.find(u => u.referralCode === String(referralCode).trim().toUpperCase());
            if (ref && ref.id !== user.id) {
              user.referredBy = ref.id; ref.wallet += db.settings.referralBonus; ref.points += 50;
              db.walletTx.push({ id: uid('tx_'), userId: ref.id, amount: db.settings.referralBonus, type: 'referral', description: `پاداش معرفی کاربر جدید (${phone})`, createdAt: Date.now() });
              db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: db.settings.referralBonus, type: 'referral', description: 'پاداش عضویت با کد معرف', createdAt: Date.now() });
              user.wallet += db.settings.referralBonus;
            }
          }
          db.users.push(user);
          db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: db.settings.walletGiftOnSignup, type: 'gift', description: 'هدیه عضویت باشگاه مشتریان', createdAt: Date.now() });
        } else if (name) user.name = name;
        user.token = genToken();
        await saveDB(env, db);
        return json({ success: true, token: user.token, user: publicUser(user), isNew, tier: tierOf(user.points) });
      }
      if (path === '/api/auth/me' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        return json({ user: publicUser(a.user), tier: tierOf(a.user.points) });
      }
      if (path === '/api/auth/logout' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const u = a.db.users.find(x => x.id === a.user.id); if (u) u.token = null; await saveDB(env, a.db);
        return json({ success: true });
      }
      if (path === '/api/auth/profile' && method === 'PATCH') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const u = a.db.users.find(x => x.id === a.user.id); if (body.name) u.name = body.name; await saveDB(env, a.db);
        return json({ user: publicUser(u), tier: tierOf(u.points) });
      }

      // ---------- Products ----------
      if (path === '/api/products' && method === 'GET') {
        const db = await loadDB(env);
        let list = db.products.filter(p => p.isActive !== false);
        const category = q.get('category'), search = q.get('search'), sort = q.get('sort'), minPrice = q.get('minPrice'), maxPrice = q.get('maxPrice'), flash = q.get('flash');
        if (category) list = list.filter(p => p.categoryId === category);
        if (search) { const s = search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s)); }
        if (minPrice) list = list.filter(p => p.price >= +minPrice);
        if (maxPrice) list = list.filter(p => p.price <= +maxPrice);
        if (flash === '1') list = list.filter(p => p.isFlash);
        if (sort === 'cheap') list.sort((a, b) => a.price - b.price);
        if (sort === 'expensive') list.sort((a, b) => b.price - a.price);
        if (sort === 'popular') list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        if (sort === 'new') list.sort((a, b) => b.createdAt - a.createdAt);
        if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
        return json({ products: list, categories: db.categories });
      }
      if (path === '/api/admin/products' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user); if (e) return e;
        return json({ products: [...a.db.products].sort((x, y) => y.createdAt - x.createdAt), categories: a.db.categories });
      }
      const prodMatch = path.match(/^\/api\/products\/(.+)$/);
      if (prodMatch && method === 'GET') {
        const db = await loadDB(env); const p = db.products.find(x => x.id === prodMatch[1]);
        if (!p) return err('محصول یافت نشد', 404);
        return json({ product: p, reviews: db.reviews.filter(r => r.productId === p.id) });
      }
      if (path === '/api/products' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager', 'support', 'editor']); if (e) return e;
        if (!body.title || !body.price) return err('عنوان و قیمت الزامی است');
        const db = a.db;
        const p = { id: uid('p_'), title: body.title, categoryId: body.categoryId || db.categories[0]?.id, price: +body.price, oldPrice: body.oldPrice ? +body.oldPrice : null, stock: +(body.stock ?? 10), image: body.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', images: body.images || [body.image].filter(Boolean), description: body.description || '', sizes: body.sizes || ['S', 'M', 'L', 'XL'], colors: body.colors || ['#5e6d8c', '#eacec5', '#bac2d9'], rating: 4.5, reviewsCount: 0, isFlash: !!body.isFlash, flashEnds: body.isFlash ? Date.now() + 1000 * 60 * 60 * 24 : null, isActive: body.isActive !== false, createdAt: Date.now(), createdBy: a.user.phone, soldCount: 0 };
        db.products.unshift(p); await saveDB(env, db); return json({ success: true, product: p });
      }
      if (prodMatch && method === 'PUT') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager', 'support', 'editor']); if (e) return e;
        const p = a.db.products.find(x => x.id === prodMatch[1]); if (!p) return err('محصول یافت نشد', 404);
        Object.assign(p, { title: body.title ?? p.title, categoryId: body.categoryId ?? p.categoryId, price: body.price ? +body.price : p.price, oldPrice: body.oldPrice ? +body.oldPrice : p.oldPrice, stock: body.stock !== undefined ? +body.stock : p.stock, image: body.image ?? p.image, description: body.description ?? p.description, sizes: body.sizes ?? p.sizes, colors: body.colors ?? p.colors, isFlash: body.isFlash !== undefined ? !!body.isFlash : p.isFlash, isActive: body.isActive !== undefined ? !!body.isActive : p.isActive });
        if (body.isFlash) p.flashEnds = Date.now() + 1000 * 60 * 60 * 24;
        await saveDB(env, a.db); return json({ success: true, product: p });
      }
      if (prodMatch && method === 'DELETE') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        a.db.products = a.db.products.filter(x => x.id !== prodMatch[1]); await saveDB(env, a.db); return json({ success: true });
      }

      // ---------- Categories ----------
      if (path === '/api/categories' && method === 'GET') { const db = await loadDB(env); return json({ categories: db.categories }); }
      if (path === '/api/categories' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        if (!body.name) return err('نام دسته الزامی است');
        const c = { id: uid('cat_'), name: body.name, slug: body.slug || body.name, image: body.image || '', description: body.description || '' };
        a.db.categories.push(c); await saveDB(env, a.db); return json({ success: true, category: c });
      }
      const catMatch = path.match(/^\/api\/categories\/(.+)$/);
      if (catMatch && method === 'PUT') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        const c = a.db.categories.find(x => x.id === catMatch[1]); if (!c) return err('یافت نشد', 404);
        Object.assign(c, body); await saveDB(env, a.db); return json({ success: true, category: c });
      }
      if (catMatch && method === 'DELETE') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin']); if (e) return e;
        a.db.categories = a.db.categories.filter(x => x.id !== catMatch[1]); await saveDB(env, a.db); return json({ success: true });
      }

      // ---------- Coupons ----------
      if (path === '/api/coupons/validate' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const c = a.db.coupons.find(x => x.code === String(body.code || '').toUpperCase());
        if (!c || !c.isActive) return err('کد تخفیف معتبر نیست');
        if (c.usedCount >= c.usageLimit) return err('سقف استفاده از این کد پر شده است');
        if (c.minAmount && body.amount < c.minAmount) return err(`حداقل مبلغ خرید برای این کد ${c.minAmount.toLocaleString('fa-IR')} تومان است`);
        let discount = 0; if (c.percent) discount = Math.min(Math.floor(body.amount * c.percent / 100), c.maxDiscount || Infinity);
        return json({ success: true, coupon: c, discount });
      }
      const couponPutMatch = path.match(/^\/api\/coupons\/(.+)$/);
      if (couponPutMatch && method === 'PUT') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        const c = a.db.coupons.find(x => x.id === couponPutMatch[1]);
        if (!c) return err('کد تخفیف یافت نشد', 404);
        const b = body || {};
        if (b.code !== undefined) {
          const code = String(b.code).trim().toUpperCase();
          if (!code) return err('کد تخفیف نمی‌تواند خالی باشد');
          if (a.db.coupons.some(x => x.id !== c.id && x.code === code)) return err('این کد قبلاً استفاده شده است');
          c.code = code;
        }
        if (b.percent !== undefined) c.percent = +b.percent || 0;
        if (b.maxDiscount !== undefined) c.maxDiscount = +b.maxDiscount || 0;
        if (b.minAmount !== undefined) c.minAmount = +b.minAmount || 0;
        if (b.usageLimit !== undefined) c.usageLimit = +b.usageLimit || 1000;
        if (b.isActive !== undefined) c.isActive = !!b.isActive;
        if (b.freeShipping !== undefined) c.freeShipping = !!b.freeShipping;
        c.updatedAt = Date.now();
        await saveDB(env, a.db);
        return json({ success: true, coupon: c });
      }
      if (path === '/api/coupons' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        return json({ coupons: a.db.coupons });
      }
      if (path === '/api/coupons' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        const code = String(body.code || '').trim().toUpperCase();
        if (!code) return err('کد تخفیف الزامی است');
        if (a.db.coupons.some(x => x.code === code)) return err('این کد قبلاً استفاده شده است');
        const c = { id: uid('c_'), code, percent: +body.percent || 0, maxDiscount: +body.maxDiscount || 0, minAmount: +body.minAmount || 0, isActive: body.isActive !== false, usageLimit: +body.usageLimit || 1000, usedCount: 0, freeShipping: !!body.freeShipping, createdAt: Date.now() };
        a.db.coupons.push(c); await saveDB(env, a.db); return json({ success: true, coupon: c });
      }
      const couponMatch = path.match(/^\/api\/coupons\/(.+)$/);
      if (couponMatch && method === 'DELETE') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        a.db.coupons = a.db.coupons.filter(x => x.id !== couponMatch[1]); await saveDB(env, a.db); return json({ success: true });
      }

      // ---------- Orders ----------
      if (path === '/api/orders' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const db = a.db; const { items, address, couponCode, paymentMethod, useWallet } = body;
        if (!items || !items.length) return err('سبد خرید خالی است');
        if (!address || !address.city || !address.address) return err('آدرس کامل لازم است');
        const user = db.users.find(u => u.id === a.user.id);
        let subtotal = 0; const orderItems = [];
        for (const it of items) {
          const p = db.products.find(x => x.id === it.productId);
          if (!p) return err('محصول نامعتبر در سبد وجود دارد');
          if (p.stock < it.qty) return err(`موجودی «${p.title}» کافی نیست`);
          subtotal += p.price * it.qty;
          orderItems.push({ productId: p.id, title: p.title, image: p.image, price: p.price, qty: it.qty, size: it.size || '', color: it.color || '' });
        }
        let discount = 0, freeShip = false, coupon = null;
        if (couponCode) {
          coupon = db.coupons.find(x => x.code === String(couponCode).toUpperCase());
          if (!coupon || !coupon.isActive) return err('کد تخفیف معتبر نیست');
          if (coupon.percent) discount = Math.min(Math.floor(subtotal * coupon.percent / 100), coupon.maxDiscount || Infinity);
          if (coupon.freeShipping) freeShip = true;
          coupon.usedCount++;
        }
        const tier = tierOf(user.points);
        discount += Math.floor((subtotal - discount) * tier.discount / 100);
        const shipping = (freeShip || subtotal >= db.settings.freeShippingThreshold) ? 0 : db.settings.shippingCost;
        let total = subtotal - discount + shipping; let walletUsed = 0;
        if (useWallet && user.wallet > 0) {
          walletUsed = Math.min(user.wallet, total); user.wallet -= walletUsed; total -= walletUsed;
          db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: -walletUsed, type: 'purchase', description: 'پرداخت از کیف پول در سفارش', createdAt: Date.now() });
        }
        for (const it of orderItems) { const p = db.products.find(x => x.id === it.productId); p.stock -= it.qty; p.soldCount = (p.soldCount || 0) + it.qty; }
        const pointsEarned = Math.floor(subtotal / 100000) * (db.settings.pointsPer100k || 10);
        user.points += pointsEarned;
        const order = { id: uid('ord_'), number: ++db.seq.order, userId: user.id, userPhone: user.phone, userName: user.name, items: orderItems, subtotal, discount, shipping, walletUsed, total, couponCode: couponCode || null, paymentMethod: paymentMethod || 'online', status: 'pending', address, trackingCode: 'VST' + uid('').slice(0, 8).toUpperCase(), pointsEarned, createdAt: Date.now() };
        db.orders.unshift(order); await saveDB(env, db);
        return json({ success: true, order, pointsEarned });
      }
      if (path === '/api/orders/my' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        return json({ orders: a.db.orders.filter(o => o.userId === a.user.id) });
      }
      if (path === '/api/orders' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager', 'support']); if (e) return e;
        return json({ orders: a.db.orders });
      }
      const orderStatusMatch = path.match(/^\/api\/orders\/(.+)\/status$/);
      if (orderStatusMatch && method === 'PATCH') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager', 'support']); if (e) return e;
        const o = a.db.orders.find(x => x.id === orderStatusMatch[1]); if (!o) return err('سفارش یافت نشد', 404);
        o.status = body.status; await saveDB(env, a.db); return json({ success: true, order: o });
      }

      // ---------- Wallet ----------
      if (path === '/api/wallet/me' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const tx = a.db.walletTx.filter(t => t.userId === a.user.id).sort((x, y) => y.createdAt - x.createdAt);
        return json({ wallet: a.user.wallet, points: a.user.points, tier: tierOf(a.user.points), transactions: tx, referralCode: a.user.referralCode });
      }
      if (path === '/api/wallet/charge' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const amount = +body.amount; if (!amount || amount < 10000) return err('حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است');
        const u = a.db.users.find(x => x.id === a.user.id); u.wallet += amount;
        a.db.walletTx.push({ id: uid('tx_'), userId: u.id, amount, type: 'charge', description: 'شارژ کیف پول (درگاه پرداخت)', createdAt: Date.now() });
        await saveDB(env, a.db); return json({ success: true, wallet: u.wallet });
      }
      if (path === '/api/wallet/adjust' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        const u = a.db.users.find(x => x.id === body.userId); if (!u) return err('کاربر یافت نشد', 404);
        u.wallet += +body.amount;
        a.db.walletTx.push({ id: uid('tx_'), userId: u.id, amount: +body.amount, type: 'adjust', description: body.description || 'تنظیم دستی توسط مدیر', createdAt: Date.now() });
        await saveDB(env, a.db); return json({ success: true, wallet: u.wallet });
      }

      // ---------- Reviews ----------
      if (path === '/api/reviews' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        if (!body.productId || !body.rating) return err('امتیاز لازم است');
        const r = { id: uid('r_'), productId: body.productId, userId: a.user.id, userName: a.user.name, rating: +body.rating, comment: body.comment || '', createdAt: Date.now() };
        a.db.reviews.push(r);
        const p = a.db.products.find(x => x.id === body.productId);
        if (p) { const rs = a.db.reviews.filter(x => x.productId === body.productId); p.rating = +(rs.reduce((s, x) => s + x.rating, 0) / rs.length).toFixed(1); p.reviewsCount = rs.length; }
        await saveDB(env, a.db); return json({ success: true, review: r });
      }

      // ---------- Admin ----------
      if (path === '/api/admin/stats' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user); if (e) return e;
        const db = a.db;
        const totalSales = db.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
        const todaySales = db.orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
        const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); days.push({ label: d.toLocaleDateString('fa-IR', { weekday: 'short' }), sum: db.orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((s, o) => s + o.total, 0) }); }
        return json({ totalSales, todaySales, ordersCount: db.orders.length, productsCount: db.products.length, usersCount: db.users.filter(u => u.role === 'customer').length, adminsCount: db.users.filter(u => ADMIN_ROLES.includes(u.role)).length, lowStock: db.products.filter(p => p.stock <= 5), chart: days, pendingOrders: db.orders.filter(o => o.status === 'pending').length, topProducts: [...db.products].sort((x, y) => (y.soldCount || 0) - (x.soldCount || 0)).slice(0, 5) });
      }
      if (path === '/api/admin/users' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager', 'support']); if (e) return e;
        return json({ users: a.db.users.map(publicUser) });
      }
      if (path === '/api/admin/subadmins' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin']); if (e) return e;
        return json({ admins: a.db.users.filter(u => ADMIN_ROLES.includes(u.role)).map(publicUser) });
      }
      if (path === '/api/admin/subadmins' && method === 'POST') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin']); if (e) return e;
        if (!/^09\d{9}$/.test(body.phone || '')) return err('شماره موبایل معتبر وارد کنید');
        if (!['manager', 'support', 'editor'].includes(body.role)) return err('نقش نامعتبر است');
        let u = a.db.users.find(x => x.phone === body.phone);
        if (u) { u.role = body.role; if (body.name) u.name = body.name; }
        else { u = { id: uid('u_'), phone: body.phone, name: body.name || 'مدیر جدید', role: body.role, wallet: 0, points: 0, referralCode: genReferral(), referredBy: null, createdAt: Date.now(), token: null, isBanned: false }; a.db.users.push(u); }
        await saveDB(env, a.db); return json({ success: true, admin: publicUser(u) });
      }
      const subMatch = path.match(/^\/api\/admin\/subadmins\/(.+)$/);
      if (subMatch && method === 'DELETE') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin']); if (e) return e;
        const u = a.db.users.find(x => x.id === subMatch[1]); if (!u) return err('یافت نشد', 404);
        if (u.phone === '09037099476') return err('مدیر اصلی قابل حذف نیست');
        u.role = 'customer'; await saveDB(env, a.db); return json({ success: true });
      }
      const banMatch = path.match(/^\/api\/admin\/users\/(.+)\/ban$/);
      if (banMatch && method === 'PATCH') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        const u = a.db.users.find(x => x.id === banMatch[1]); if (!u) return err('یافت نشد', 404);
        u.isBanned = !u.isBanned; await saveDB(env, a.db); return json({ success: true, user: publicUser(u) });
      }
      if (path === '/api/admin/settings' && method === 'GET') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin', 'manager']); if (e) return e;
        return json({ settings: a.db.settings });
      }
      if (path === '/api/admin/settings' && method === 'PUT') {
        const a = await requireAuth(request, env); if (a.error) return a.error;
        const e = requireAdmin(a.user, ['super_admin']); if (e) return e;
        Object.assign(a.db.settings, body); await saveDB(env, a.db); return json({ success: true, settings: a.db.settings });
      }
      if (path === '/api/settings' && method === 'GET') { const db = await loadDB(env); return json({ settings: db.settings }); }

      return err('مسیر یافت نشد', 404);
    } catch (e) {
      return err('خطای سرور: ' + e.message, 500);
    }
  }
};
