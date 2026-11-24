const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- DB (JSON file) ----------
const DB_PATH = path.join(__dirname, 'data', 'db.json');
function ensureDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seedDB(), null, 2));
  }
}
function loadDB() {
  ensureDB();
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { const d = seedDB(); fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2)); return d; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function uid(p = '') { return p + crypto.randomBytes(6).toString('hex'); }
function genToken() { return crypto.randomBytes(32).toString('hex'); }
function genReferral() { return 'VESTA' + crypto.randomBytes(3).toString('hex').toUpperCase(); }

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

  const P = (id, title, cat, price, old, stock, img, desc, flash=false, rating=4.5) => ({
    id, title, categoryId: cat, price, oldPrice: old || null, stock, image: img,
    images: [img], description: desc, sizes: ['S','M','L','XL'], colors: ['#5e6d8c','#eacec5','#bac2d9','#222','#fff'],
    rating, reviewsCount: Math.floor(Math.random()*40)+5, isFlash: flash, flashEnds: flash ? now + 1000*60*60*26 : null,
    isActive: true, createdAt: now - Math.floor(Math.random()*20)*86400000, createdBy: 'admin', soldCount: Math.floor(Math.random()*120)+10
  });

  const products = [
    P('p1','کاپشن چرم مردانه کلاسیک','cat-winter',2890000,3490000,14,'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop','کاپشن چرم اصل با آستر گرم، دوخت درجه‌یک و طراحی کلاسیک. مناسب پاییز و زمستان، ضد آب و باد.',true,4.8),
    P('p2','هودی اورسایز پشمی','cat-winter',890000,1190000,32,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop','هودی نرم و گرم با پارچه پشمی، جیب کانگورویی و کلاه بزرگ. انتخابی راحت برای روزهای سرد.',true,4.6),
    P('p3','کفش رانینگ نایک ایرزوم','cat-shoes',1950000,2400000,21,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop','کفش رانینگ سبک با زیره ایرزوم، تنفس‌پذیر و مناسب دویدن و استفاده روزانه.',false,4.7),
    P('p4','کفش اسنیکر سفید مینیمال','cat-shoes',1290000,null,45,'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop','اسنیکر سفید مینیمال با چرم طبیعی، ست‌شونده با هر استایلی. زیره راحت و ضد لغزش.',false,4.5),
    P('p5','تیشرت بیسیک نخی یقه‌دار','cat-summer',390000,520000,80,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop','تیشرت نخی ۱۰۰٪ پنبه، نرم و خنک برای تابستان. رنگ‌بندی متنوع و فرم آزاد.',true,4.4),
    P('p6','پیراهن لینن تابستانی','cat-summer',790000,null,28,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop','پیراهن لینن سبک و تنفس‌پذیر، ایده‌آل برای روزهای گرم. برش راحت و شیک.',false,4.6),
    P('p7','پیراهن مجلسی زنانه ساتن','cat-women',1190000,1490000,18,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop','پیراهن ساتن براق با فرم خوش‌نشین، مناسب مهمانی و استفاده روزمره شیک.',false,4.7),
    P('p8','مانتو کتی زنانه','cat-women',1590000,null,22,'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop','مانتو کتی با پارچه کرپ، دوخت تمیز و جزئیات ظریف. مناسب بهار و تابستان.',false,4.5),
    P('p9','شلوار جین اسکینی','cat-men',690000,890000,36,'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop','جین اسکینی کشی با فیت عالی، رنگ ثابت و راحت برای استفاده روزانه.',true,4.4),
    P('p10','پیراهن مردانه آکسفورد','cat-men',590000,null,40,'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop','پیراهن آکسفورد کلاسیک با یقه دکمه‌دار، مناسب کار و مهمانی.',false,4.3),
    P('p11','کیف چرم دوشی','cat-accessories',1490000,1890000,12,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop','کیف چرم طبیعی با جیب‌های کاربردی و بند قابل تنظیم. دست‌ساز و بادوام.',false,4.8),
    P('p12','ساعت مچی کلاسیک','cat-accessories',2290000,null,9,'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop','ساعت مچی با بند چرم و صفحه مینیمال، ضد آب تا ۳ ATM. هدیه‌ای شیک.',false,4.6),
    P('p13','بافت یقه‌دار زنانه','cat-winter',990000,1290000,25,'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop','بافت نرم و لطیف با یقه‌دار، گرم و راحت برای زمستان.',false,4.5),
    P('p14','شلوارک جین تابستانی','cat-summer',490000,null,50,'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop','شلوارک جین خنک و راحت برای تابستان، فیت آزاد و رنگ روشن.',false,4.2),
    P('p15','کت تک مردانه','cat-men',2490000,2990000,11,'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop','کت تک با برش مدرن و پارچه پشمی، مناسب مراسم و استایل رسمی.',false,4.7),
    P('p16','کفش پاشنه‌دار مجلسی','cat-shoes',1390000,null,16,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop','کفش پاشنه‌دار شیک و راحت با زیره نرم، مناسب مجالس.',false,4.4),
  ];

  const users = [
    { id:'u-admin', phone:'09037099476', name:'مدیر کل فروشگاه', role:'super_admin', wallet:500000, points:2500, referralCode:'VESTAADMIN', referredBy:null, createdAt: now-86400000*90, token:null, isBanned:false },
    { id:'u-support', phone:'09961217945', name:'پشتیبان فروشگاه', role:'support', wallet:100000, points:800, referralCode:'VESTASUPPORT', referredBy:null, createdAt: now-86400000*60, token:null, isBanned:false },
    { id:'u-demo', phone:'09120000000', name:'کاربر نمونه', role:'customer', wallet:250000, points:1250, referralCode:'VESTADEMO1', referredBy:null, createdAt: now-86400000*30, token:null, isBanned:false },
  ];

  return {
    users, categories, products,
    otps: [], orders: [], coupons: [
      { id:'c1', code:'WELCOME10', percent:10, maxDiscount:200000, minAmount:500000, isActive:true, usageLimit:1000, usedCount:12, createdAt:now },
      { id:'c2', code:'VESTA20', percent:20, maxDiscount:500000, minAmount:1500000, isActive:true, usageLimit:500, usedCount:5, createdAt:now },
      { id:'c3', code:'FREESHIP', percent:0, maxDiscount:0, minAmount:0, isActive:true, usageLimit:1000, usedCount:20, freeShipping:true, createdAt:now },
    ],
    walletTx: [
      { id: uid('tx_'), userId:'u-demo', amount:250000, type:'gift', description:'هدیه عضویت باشگاه مشتریان', createdAt: now-86400000*30 },
      { id: uid('tx_'), userId:'u-admin', amount:500000, type:'charge', description:'شارژ اولیه کیف پول مدیر', createdAt: now-86400000*90 },
    ],
    reviews: [
      { id: uid('r_'), productId:'p1', userId:'u-demo', userName:'کاربر نمونه', rating:5, comment:'کیفیت عالی، دقیقاً مثل عکس بود. ارسال هم سریع انجام شد.', createdAt: now-86400000*5 },
      { id: uid('r_'), productId:'p3', userId:'u-demo', userName:'کاربر نمونه', rating:4, comment:'خیلی راحته، برای دویدن عالیه.', createdAt: now-86400000*3 },
    ],
    settings: { siteName:'پوشاک وستا', freeShippingThreshold:1000000, shippingCost:49000, pointsPer100k:10, walletGiftOnSignup:50000, referralBonus:30000, supportPhone:'09961217945' },
    seq: { order: 1000 }
  };
}

// ---------- Helpers ----------
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'ابتدا وارد شوید' });
  const db = loadDB();
  const user = db.users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'نشست شما منقضی شده است' });
  if (user.isBanned) return res.status(403).json({ error: 'حساب شما مسدود شده است' });
  req.user = user; req.db = db; next();
}
function optionalAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  if (token) { const db = loadDB(); const u = db.users.find(x => x.token === token); if (u) req.user = u; req.db = db; }
  next();
}
const ADMIN_ROLES = ['super_admin','manager','support','editor'];
function requireAdmin(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'دسترسی ندارید' });
    if (!ADMIN_ROLES.includes(req.user.role)) return res.status(403).json({ error: 'شما مدیر نیستید' });
    if (roles && !roles.includes(req.user.role)) return res.status(403).json({ error: 'دسترسی کافی ندارید' });
    next();
  };
}
function publicUser(u) {
  if (!u) return null;
  const { token, ...rest } = u;
  return rest;
}
function tierOf(points) {
  if (points >= 5000) return { name:'طلایی', color:'#c9a227', discount:5 };
  if (points >= 2000) return { name:'نقره‌ای', color:'#8a94a6', discount:3 };
  if (points >= 500) return { name:'برنزی', color:'#b07a4f', discount:1 };
  return { name:'عضو جدید', color:'#5e6d8c', discount:0 };
}

// ---------- Auth ----------
app.post('/api/auth/request-otp', (req, res) => {
  const { phone } = req.body || {};
  if (!phone || !/^09\d{9}$/.test(phone)) return res.status(400).json({ error: 'شماره موبایل معتبر وارد کنید (مثل 09123456789)' });
  const db = loadDB();
  const code = String(Math.floor(10000 + Math.random()*90000));
  db.otps = db.otps.filter(o => o.phone !== phone);
  db.otps.push({ phone, code, expires: Date.now() + 5*60*1000, createdAt: Date.now() });
  saveDB(db);
  // در حالت Production اینجا پیامک ارسال می‌شود؛ برای دمو کد را برمی‌گردانیم
  console.log(`[OTP] ${phone} -> ${code}`);
  res.json({ success: true, message: 'کد تایید ارسال شد', demoCode: code, expiresIn: 300 });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code, name, referralCode } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: 'شماره و کد تایید لازم است' });
  const db = loadDB();
  const otp = db.otps.find(o => o.phone === phone && o.code === String(code));
  if (!otp) return res.status(400).json({ error: 'کد تایید اشتباه است' });
  if (otp.expires < Date.now()) return res.status(400).json({ error: 'کد تایید منقضی شده است' });
  db.otps = db.otps.filter(o => o !== otp);

  let user = db.users.find(u => u.phone === phone);
  const isNew = !user;
  if (!user) {
    user = {
      id: uid('u_'), phone, name: name || 'کاربر جدید', role: 'customer',
      wallet: db.settings.walletGiftOnSignup || 50000, points: 100,
      referralCode: genReferral(), referredBy: null, createdAt: Date.now(), token: null, isBanned: false
    };
    // کد معرف
    if (referralCode) {
      const ref = db.users.find(u => u.referralCode === referralCode.trim().toUpperCase());
      if (ref && ref.id !== user.id) {
        user.referredBy = ref.id;
        ref.wallet += db.settings.referralBonus;
        ref.points += 50;
        db.walletTx.push({ id: uid('tx_'), userId: ref.id, amount: db.settings.referralBonus, type:'referral', description:`پاداش معرفی کاربر جدید (${phone})`, createdAt: Date.now() });
        db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: db.settings.referralBonus, type:'referral', description:'پاداش عضویت با کد معرف', createdAt: Date.now() });
        user.wallet += db.settings.referralBonus;
      }
    }
    db.users.push(user);
    db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: db.settings.walletGiftOnSignup, type:'gift', description:'هدیه عضویت باشگاه مشتریان', createdAt: Date.now() });
  } else if (name) {
    user.name = name;
  }
  user.token = genToken();
  saveDB(db);
  res.json({ success: true, token: user.token, user: publicUser(user), isNew, tier: tierOf(user.points) });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: publicUser(req.user), tier: tierOf(req.user.points) });
});
app.post('/api/auth/logout', auth, (req, res) => {
  const db = loadDB(); const u = db.users.find(x => x.id === req.user.id); if (u) u.token = null; saveDB(db);
  res.json({ success: true });
});
app.patch('/api/auth/profile', auth, (req, res) => {
  const db = loadDB(); const u = db.users.find(x => x.id === req.user.id);
  if (req.body.name) u.name = req.body.name;
  saveDB(db); res.json({ user: publicUser(u), tier: tierOf(u.points) });
});

// ---------- Products ----------
app.get('/api/products', (req, res) => {
  const db = loadDB();
  let list = db.products.filter(p => p.isActive !== false);
  const { category, search, sort, minPrice, maxPrice, flash } = req.query;
  if (category) list = list.filter(p => p.categoryId === category);
  if (search) { const q = search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q)); }
  if (minPrice) list = list.filter(p => p.price >= +minPrice);
  if (maxPrice) list = list.filter(p => p.price <= +maxPrice);
  if (flash === '1') list = list.filter(p => p.isFlash);
  if (sort === 'cheap') list.sort((a,b)=>a.price-b.price);
  if (sort === 'expensive') list.sort((a,b)=>b.price-a.price);
  if (sort === 'popular') list.sort((a,b)=>(b.soldCount||0)-(a.soldCount||0));
  if (sort === 'new') list.sort((a,b)=>b.createdAt-a.createdAt);
  if (sort === 'rating') list.sort((a,b)=>b.rating-a.rating);
  res.json({ products: list, categories: db.categories });
});
// لیست کامل محصولات برای پنل مدیریت (شامل غیرفعال‌ها)
app.get('/api/admin/products', auth, requireAdmin(), (req, res) => {
  const db = loadDB();
  res.json({ products: [...db.products].sort((a,b)=>b.createdAt-a.createdAt), categories: db.categories });
});
app.get('/api/products/:id', (req, res) => {
  const db = loadDB(); const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'محصول یافت نشد' });
  const reviews = db.reviews.filter(r => r.productId === p.id);
  res.json({ product: p, reviews });
});
app.post('/api/products', auth, requireAdmin(['super_admin','manager','support','editor']), (req, res) => {
  const db = loadDB();
  const b = req.body;
  if (!b.title || !b.price) return res.status(400).json({ error: 'عنوان و قیمت الزامی است' });
  const p = {
    id: uid('p_'), title: b.title, categoryId: b.categoryId || db.categories[0]?.id,
    price: +b.price, oldPrice: b.oldPrice ? +b.oldPrice : null, stock: +(b.stock ?? 10),
    image: b.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    images: b.images || [b.image].filter(Boolean), description: b.description || '',
    sizes: b.sizes || ['S','M','L','XL'], colors: b.colors || ['#5e6d8c','#eacec5','#bac2d9'],
    rating: 4.5, reviewsCount: 0, isFlash: !!b.isFlash, flashEnds: b.isFlash ? Date.now()+1000*60*60*24 : null,
    isActive: b.isActive !== false, createdAt: Date.now(), createdBy: req.user.phone, soldCount: 0
  };
  db.products.unshift(p); saveDB(db); res.json({ success: true, product: p });
});
app.put('/api/products/:id', auth, requireAdmin(['super_admin','manager','support','editor']), (req, res) => {
  const db = loadDB(); const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'محصول یافت نشد' });
  const b = req.body;
  Object.assign(p, {
    title: b.title ?? p.title, categoryId: b.categoryId ?? p.categoryId,
    price: b.price ? +b.price : p.price, oldPrice: b.oldPrice ? +b.oldPrice : p.oldPrice,
    stock: b.stock !== undefined ? +b.stock : p.stock, image: b.image ?? p.image,
    description: b.description ?? p.description, sizes: b.sizes ?? p.sizes, colors: b.colors ?? p.colors,
    isFlash: b.isFlash !== undefined ? !!b.isFlash : p.isFlash, isActive: b.isActive !== undefined ? !!b.isActive : p.isActive,
  });
  if (b.isFlash) p.flashEnds = Date.now()+1000*60*60*24;
  saveDB(db); res.json({ success: true, product: p });
});
app.delete('/api/products/:id', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); db.products = db.products.filter(x => x.id !== req.params.id); saveDB(db); res.json({ success: true });
});

// ---------- Categories ----------
app.get('/api/categories', (req, res) => { const db = loadDB(); res.json({ categories: db.categories }); });
app.post('/api/categories', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); const b = req.body;
  if (!b.name) return res.status(400).json({ error: 'نام دسته الزامی است' });
  const c = { id: uid('cat_'), name: b.name, slug: b.slug || b.name, image: b.image || '', description: b.description || '' };
  db.categories.push(c); saveDB(db); res.json({ success: true, category: c });
});
app.put('/api/categories/:id', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); const c = db.categories.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'یافت نشد' });
  Object.assign(c, req.body); saveDB(db); res.json({ success: true, category: c });
});
app.delete('/api/categories/:id', auth, requireAdmin(['super_admin']), (req, res) => {
  const db = loadDB(); db.categories = db.categories.filter(x => x.id !== req.params.id); saveDB(db); res.json({ success: true });
});

// ---------- Coupons ----------
app.post('/api/coupons/validate', auth, (req, res) => {
  const db = loadDB(); const { code, amount } = req.body;
  const c = db.coupons.find(x => x.code === String(code||'').toUpperCase());
  if (!c || !c.isActive) return res.status(400).json({ error: 'کد تخفیف معتبر نیست' });
  if (c.usedCount >= c.usageLimit) return res.status(400).json({ error: 'سقف استفاده از این کد پر شده است' });
  if (c.minAmount && amount < c.minAmount) return res.status(400).json({ error: `حداقل مبلغ خرید برای این کد ${c.minAmount.toLocaleString('fa-IR')} تومان است` });
  let discount = 0;
  if (c.percent) discount = Math.min(Math.floor(amount * c.percent / 100), c.maxDiscount || Infinity);
  res.json({ success: true, coupon: c, discount });
});
app.get('/api/coupons', auth, requireAdmin(['super_admin','manager']), (req, res) => { res.json({ coupons: req.db.coupons }); });
app.put('/api/coupons/:id', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB();
  const c = db.coupons.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'کد تخفیف یافت نشد' });
  const b = req.body || {};
  if (b.code !== undefined) {
    const code = String(b.code).trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'کد تخفیف نمی‌تواند خالی باشد' });
    if (db.coupons.some(x => x.id !== c.id && x.code === code))
      return res.status(400).json({ error: 'این کد قبلاً استفاده شده است' });
    c.code = code;
  }
  if (b.percent !== undefined) c.percent = +b.percent || 0;
  if (b.maxDiscount !== undefined) c.maxDiscount = +b.maxDiscount || 0;
  if (b.minAmount !== undefined) c.minAmount = +b.minAmount || 0;
  if (b.usageLimit !== undefined) c.usageLimit = +b.usageLimit || 1000;
  if (b.isActive !== undefined) c.isActive = !!b.isActive;
  if (b.freeShipping !== undefined) c.freeShipping = !!b.freeShipping;
  c.updatedAt = Date.now();
  saveDB(db);
  res.json({ success: true, coupon: c });
});
app.post('/api/coupons', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); const b = req.body;
  const code = String(b.code||'').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'کد تخفیف الزامی است' });
  if (db.coupons.some(x => x.code === code)) return res.status(400).json({ error: 'این کد قبلاً استفاده شده است' });
  const c = { id: uid('c_'), code, percent: +b.percent||0, maxDiscount: +b.maxDiscount||0, minAmount: +b.minAmount||0, isActive: b.isActive !== false, usageLimit: +b.usageLimit||1000, usedCount: 0, freeShipping: !!b.freeShipping, createdAt: Date.now() };
  db.coupons.push(c); saveDB(db); res.json({ success: true, coupon: c });
});
app.delete('/api/coupons/:id', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); db.coupons = db.coupons.filter(x => x.id !== req.params.id); saveDB(db); res.json({ success: true });
});

// ---------- Orders ----------
app.post('/api/orders', auth, (req, res) => {
  const db = loadDB(); const { items, address, couponCode, paymentMethod, useWallet } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'سبد خرید خالی است' });
  if (!address || !address.city || !address.address) return res.status(400).json({ error: 'آدرس کامل لازم است' });
  const user = db.users.find(u => u.id === req.user.id);
  let subtotal = 0; const orderItems = [];
  for (const it of items) {
    const p = db.products.find(x => x.id === it.productId);
    if (!p) return res.status(400).json({ error: 'محصول نامعتبر در سبد وجود دارد' });
    if (p.stock < it.qty) return res.status(400).json({ error: `موجودی «${p.title}» کافی نیست` });
    subtotal += p.price * it.qty;
    orderItems.push({ productId: p.id, title: p.title, image: p.image, price: p.price, qty: it.qty, size: it.size||'', color: it.color||'' });
  }
  let discount = 0, freeShip = false, coupon = null;
  if (couponCode) {
    coupon = db.coupons.find(x => x.code === String(couponCode).toUpperCase());
    if (!coupon || !coupon.isActive) return res.status(400).json({ error: 'کد تخفیف معتبر نیست' });
    if (coupon.percent) discount = Math.min(Math.floor(subtotal * coupon.percent / 100), coupon.maxDiscount || Infinity);
    if (coupon.freeShipping) freeShip = true;
    coupon.usedCount++;
  }
  // تخفیف سطح باشگاه
  const tier = tierOf(user.points);
  const tierDiscount = Math.floor((subtotal - discount) * tier.discount / 100);
  discount += tierDiscount;

  const shipping = (freeShip || subtotal >= db.settings.freeShippingThreshold) ? 0 : db.settings.shippingCost;
  let total = subtotal - discount + shipping;
  let walletUsed = 0;
  if (useWallet && user.wallet > 0) {
    walletUsed = Math.min(user.wallet, total);
    user.wallet -= walletUsed; total -= walletUsed;
    db.walletTx.push({ id: uid('tx_'), userId: user.id, amount: -walletUsed, type:'purchase', description:'پرداخت از کیف پول در سفارش', createdAt: Date.now() });
  }
  // کم کردن موجودی و ثبت فروش
  for (const it of orderItems) { const p = db.products.find(x => x.id === it.productId); p.stock -= it.qty; p.soldCount = (p.soldCount||0)+it.qty; }
  const pointsEarned = Math.floor(subtotal / 100000) * (db.settings.pointsPer100k || 10);
  user.points += pointsEarned;

  const order = {
    id: uid('ord_'), number: ++db.seq.order, userId: user.id, userPhone: user.phone, userName: user.name,
    items: orderItems, subtotal, discount, shipping, walletUsed, total,
    couponCode: couponCode || null, paymentMethod: paymentMethod || 'online', status: 'pending',
    address, trackingCode: 'VST' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    pointsEarned, createdAt: Date.now()
  };
  db.orders.unshift(order); saveDB(db);
  res.json({ success: true, order, pointsEarned });
});
app.get('/api/orders/my', auth, (req, res) => {
  const db = loadDB(); res.json({ orders: db.orders.filter(o => o.userId === req.user.id) });
});
app.get('/api/orders', auth, requireAdmin(['super_admin','manager','support']), (req, res) => {
  const db = loadDB(); res.json({ orders: db.orders });
});
app.patch('/api/orders/:id/status', auth, requireAdmin(['super_admin','manager','support']), (req, res) => {
  const db = loadDB(); const o = db.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'سفارش یافت نشد' });
  o.status = req.body.status; saveDB(db); res.json({ success: true, order: o });
});

// ---------- Wallet & Club ----------
app.get('/api/wallet/me', auth, (req, res) => {
  const db = loadDB();
  const tx = db.walletTx.filter(t => t.userId === req.user.id).sort((a,b)=>b.createdAt-a.createdAt);
  res.json({ wallet: req.user.wallet, points: req.user.points, tier: tierOf(req.user.points), transactions: tx, referralCode: req.user.referralCode });
});
app.post('/api/wallet/charge', auth, (req, res) => {
  const db = loadDB(); const amount = +req.body.amount;
  if (!amount || amount < 10000) return res.status(400).json({ error: 'حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است' });
  const u = db.users.find(x => x.id === req.user.id); u.wallet += amount;
  db.walletTx.push({ id: uid('tx_'), userId: u.id, amount, type:'charge', description:'شارژ کیف پول (درگاه پرداخت)', createdAt: Date.now() });
  saveDB(db); res.json({ success: true, wallet: u.wallet });
});
app.post('/api/wallet/adjust', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); const { userId, amount, description } = req.body;
  const u = db.users.find(x => x.id === userId); if (!u) return res.status(404).json({ error: 'کاربر یافت نشد' });
  u.wallet += +amount;
  db.walletTx.push({ id: uid('tx_'), userId: u.id, amount: +amount, type:'adjust', description: description||'تنظیم دستی توسط مدیر', createdAt: Date.now() });
  saveDB(db); res.json({ success: true, wallet: u.wallet });
});

// ---------- Reviews ----------
app.post('/api/reviews', auth, (req, res) => {
  const db = loadDB(); const { productId, rating, comment } = req.body;
  if (!productId || !rating) return res.status(400).json({ error: 'امتیاز لازم است' });
  const r = { id: uid('r_'), productId, userId: req.user.id, userName: req.user.name, rating: +rating, comment: comment||'', createdAt: Date.now() };
  db.reviews.push(r);
  const p = db.products.find(x => x.id === productId);
  if (p) { const rs = db.reviews.filter(x => x.productId === productId); p.rating = +(rs.reduce((s,x)=>s+x.rating,0)/rs.length).toFixed(1); p.reviewsCount = rs.length; }
  saveDB(db); res.json({ success: true, review: r });
});

// ---------- Admin ----------
app.get('/api/admin/stats', auth, requireAdmin(), (req, res) => {
  const db = loadDB();
  const totalSales = db.orders.filter(o => o.status !== 'cancelled').reduce((s,o)=>s+o.total,0);
  const todaySales = db.orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'cancelled').reduce((s,o)=>s+o.total,0);
  const lowStock = db.products.filter(p => p.stock <= 5);
  // فروش ۷ روز اخیر برای نمودار
  const days = []; for (let i=6;i>=0;i--) { const d = new Date(Date.now()-i*86400000); const label = d.toLocaleDateString('fa-IR',{weekday:'short'}); const sum = db.orders.filter(o => new Date(o.createdAt).toDateString()===d.toDateString()).reduce((s,o)=>s+o.total,0); days.push({ label, sum }); }
  res.json({
    totalSales, todaySales, ordersCount: db.orders.length, productsCount: db.products.length,
    usersCount: db.users.filter(u=>u.role==='customer').length, adminsCount: db.users.filter(u=>ADMIN_ROLES.includes(u.role)).length,
    lowStock, chart: days, pendingOrders: db.orders.filter(o=>o.status==='pending').length,
    topProducts: [...db.products].sort((a,b)=>(b.soldCount||0)-(a.soldCount||0)).slice(0,5)
  });
});
app.get('/api/admin/users', auth, requireAdmin(['super_admin','manager','support']), (req, res) => {
  const db = loadDB(); res.json({ users: db.users.map(publicUser) });
});
app.get('/api/admin/subadmins', auth, requireAdmin(['super_admin']), (req, res) => {
  const db = loadDB(); res.json({ admins: db.users.filter(u => ADMIN_ROLES.includes(u.role)).map(publicUser) });
});
app.post('/api/admin/subadmins', auth, requireAdmin(['super_admin']), (req, res) => {
  const db = loadDB(); const { phone, name, role } = req.body;
  if (!/^09\d{9}$/.test(phone||'')) return res.status(400).json({ error: 'شماره موبایل معتبر وارد کنید' });
  if (!['manager','support','editor'].includes(role)) return res.status(400).json({ error: 'نقش نامعتبر است' });
  let u = db.users.find(x => x.phone === phone);
  if (u) { u.role = role; if (name) u.name = name; }
  else { u = { id: uid('u_'), phone, name: name||'مدیر جدید', role, wallet: 0, points: 0, referralCode: genReferral(), referredBy: null, createdAt: Date.now(), token: null, isBanned: false }; db.users.push(u); }
  saveDB(db); res.json({ success: true, admin: publicUser(u) });
});
app.delete('/api/admin/subadmins/:id', auth, requireAdmin(['super_admin']), (req, res) => {
  const db = loadDB(); const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'یافت نشد' });
  if (u.phone === '09037099476') return res.status(400).json({ error: 'مدیر اصلی قابل حذف نیست' });
  u.role = 'customer'; saveDB(db); res.json({ success: true });
});
app.patch('/api/admin/users/:id/ban', auth, requireAdmin(['super_admin','manager']), (req, res) => {
  const db = loadDB(); const u = db.users.find(x => x.id === req.params.id); if (!u) return res.status(404).json({ error: 'یافت نشد' });
  u.isBanned = !u.isBanned; saveDB(db); res.json({ success: true, user: publicUser(u) });
});
app.get('/api/admin/settings', auth, requireAdmin(['super_admin','manager']), (req, res) => { res.json({ settings: req.db.settings }); });
app.put('/api/admin/settings', auth, requireAdmin(['super_admin']), (req, res) => {
  const db = loadDB(); Object.assign(db.settings, req.body); saveDB(db); res.json({ success: true, settings: db.settings });
});
app.get('/api/settings', (req, res) => { const db = loadDB(); res.json({ settings: db.settings }); });

// SPA fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`VESTA shop running on http://0.0.0.0:${PORT}`));
