/*
 * Vesta demo API.
 * All reads and mutations stay in this browser (localStorage); no /api request,
 * server, database, payment gateway, SMS, or Cloudflare binding is used.
 */
(() => {
  const STORAGE_KEY = 'vesta_mock_state_v1';
  const DEMO_OTP = '12345';
  const ADMIN_ROLES = ['super_admin', 'manager', 'support', 'editor'];
  const FALLBACK_SEED = {
    users: [], categories: [], products: [], otps: [], orders: [], coupons: [],
    walletTx: [], reviews: [], settings: {}, seq: { order: 1000 },
  };
  let db = null;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }
  function readStored() {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.products) && Array.isArray(parsed.users) ? parsed : null;
    } catch { return null; }
  }
  function getDb() {
    if (db) return db;
    const seed = globalThis.window?.VESTA_MOCK_SEED || globalThis.VESTA_MOCK_SEED || FALLBACK_SEED;
    db = readStored() || clone(seed);
    db.otps ||= [];
    db.orders ||= [];
    db.coupons ||= [];
    db.walletTx ||= [];
    db.reviews ||= [];
    db.settings ||= {};
    db.seq ||= { order: 1000 };
    return db;
  }
  function saveDb() {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(getDb())); }
    catch { /* The demo remains usable in private browsing; it just won't persist. */ }
  }
  function reset() {
    try { globalThis.localStorage?.removeItem(STORAGE_KEY); } catch {}
    db = clone(globalThis.window?.VESTA_MOCK_SEED || globalThis.VESTA_MOCK_SEED || FALLBACK_SEED);
    saveDb();
    return clone(db);
  }
  function makeId(prefix = 'mock_') {
    return prefix + Math.random().toString(36).slice(2, 10);
  }
  function referralCode() {
    return 'VESTA' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  function publicUser(user) {
    if (!user) return null;
    const { token, ...data } = user;
    return clone(data);
  }
  function tierOf(points = 0) {
    if (points >= 5000) return { name: 'طلایی', color: '#c9a227', discount: 5 };
    if (points >= 2000) return { name: 'نقره‌ای', color: '#8a94a6', discount: 3 };
    if (points >= 500) return { name: 'برنزی', color: '#b07a4f', discount: 1 };
    return { name: 'عضو جدید', color: '#5e6d8c', discount: 0 };
  }
  function fail(message) { throw new Error(message); }
  function requireUser(token) {
    const user = token && getDb().users.find(item => item.token === token);
    if (!user) fail('ابتدا وارد شوید');
    if (user.isBanned) fail('حساب شما مسدود شده است');
    return user;
  }
  function requireAdmin(token, roles) {
    const user = requireUser(token);
    if (!ADMIN_ROLES.includes(user.role)) fail('شما مدیر نیستید');
    if (roles && !roles.includes(user.role)) fail('دسترسی کافی ندارید');
    return user;
  }
  function parseBody(options) {
    if (!options?.body) return {};
    if (typeof options.body === 'string') {
      try { return JSON.parse(options.body); } catch { return {}; }
    }
    return options.body || {};
  }
  function productList(params) {
    const database = getDb();
    let products = database.products.filter(product => product.isActive !== false);
    const category = params.get('category');
    const search = (params.get('search') || '').trim().toLocaleLowerCase();
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const flash = params.get('flash');
    const sort = params.get('sort');
    if (category) products = products.filter(product => product.categoryId === category);
    if (search) products = products.filter(product =>
      String(product.title || '').toLocaleLowerCase().includes(search) ||
      String(product.description || '').toLocaleLowerCase().includes(search));
    if (minPrice !== null && minPrice !== '') products = products.filter(product => product.price >= Number(minPrice));
    if (maxPrice !== null && maxPrice !== '') products = products.filter(product => product.price <= Number(maxPrice));
    if (flash === '1') products = products.filter(product => product.isFlash);
    const sorts = {
      cheap: (a, b) => a.price - b.price,
      expensive: (a, b) => b.price - a.price,
      popular: (a, b) => (b.soldCount || 0) - (a.soldCount || 0),
      new: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    };
    if (sorts[sort]) products = [...products].sort(sorts[sort]);
    return { products: clone(products), categories: clone(database.categories) };
  }
  function validateCoupon(code, amount) {
    const normalized = String(code || '').trim().toUpperCase();
    const total = Number(amount);
    if (!Number.isFinite(total) || total < 0) fail('مبلغ سبد خرید معتبر نیست');
    const coupon = getDb().coupons.find(item => item.code === normalized);
    if (!coupon || !coupon.isActive) fail('کد تخفیف معتبر نیست');
    if (coupon.usedCount >= coupon.usageLimit) fail('سقف استفاده از این کد پر شده است');
    if (coupon.minAmount && total < coupon.minAmount) {
      fail(`حداقل مبلغ خرید برای این کد ${coupon.minAmount.toLocaleString('fa-IR')} تومان است`);
    }
    const percent = Number(coupon.percent) || 0;
    if (percent < 0 || percent > 100) fail('درصد تخفیف باید بین صفر و صد باشد');
    const discount = percent
      ? Math.min(Math.floor(total * percent / 100), coupon.maxDiscount || Infinity)
      : 0;
    return { coupon: clone(coupon), discount };
  }
  function ensureCoupon(body, existingId = '') {
    const database = getDb();
    const code = String(body.code || '').trim().toUpperCase();
    if (!code) fail('کد تخفیف الزامی است');
    if (database.coupons.some(item => item.code === code && item.id !== existingId)) fail('این کد قبلاً استفاده شده است');
    return code;
  }
  function stats() {
    const database = getDb();
    const activeOrders = database.orders.filter(order => order.status !== 'cancelled');
    const totalSales = activeOrders.reduce((sum, order) => sum + order.total, 0);
    const today = new Date().toDateString();
    const todaySales = activeOrders.filter(order => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + order.total, 0);
    const chart = [];
    for (let ago = 6; ago >= 0; ago--) {
      const day = new Date(Date.now() - ago * 86400000);
      const sum = database.orders.filter(order => new Date(order.createdAt).toDateString() === day.toDateString())
        .reduce((total, order) => total + order.total, 0);
      chart.push({ label: day.toLocaleDateString('fa-IR', { weekday: 'short' }), sum });
    }
    return {
      totalSales, todaySales,
      ordersCount: database.orders.length,
      productsCount: database.products.length,
      usersCount: database.users.filter(user => user.role === 'customer').length,
      adminsCount: database.users.filter(user => ADMIN_ROLES.includes(user.role)).length,
      lowStock: clone(database.products.filter(product => product.stock <= 5)),
      chart,
      pendingOrders: database.orders.filter(order => order.status === 'pending').length,
      topProducts: clone([...database.products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5)),
    };
  }

  async function request(path, options = {}, token = null) {
    const url = new URL(path, 'https://vesta.mock');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const method = String(options.method || 'GET').toUpperCase();
    const body = parseBody(options);
    const database = getDb();
    let match;

    if (pathname === '/api/settings' && method === 'GET') return { settings: clone(database.settings) };

    if (pathname === '/api/auth/request-otp' && method === 'POST') {
      const phone = String(body.phone || '').trim();
      if (!/^09\d{9}$/.test(phone)) fail('شماره موبایل معتبر وارد کنید (مثل 09123456789)');
      database.otps = database.otps.filter(otp => otp.phone !== phone);
      database.otps.push({ phone, code: DEMO_OTP, expires: Date.now() + 5 * 60 * 1000, createdAt: Date.now() });
      saveDb();
      return { success: true, message: 'کد نمایشی آماده است', demoCode: DEMO_OTP, expiresIn: 300, mock: true };
    }
    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
      const phone = String(body.phone || '').trim();
      const otp = database.otps.find(item => item.phone === phone && item.code === String(body.code || ''));
      if (!otp) fail('کد تایید اشتباه است؛ کد دمو ۱۲۳۴۵ است');
      if (otp.expires < Date.now()) fail('کد تایید منقضی شده است');
      database.otps = database.otps.filter(item => item !== otp);
      let user = database.users.find(item => item.phone === phone);
      const isNew = !user;
      if (!user) {
        const gift = Number(database.settings.walletGiftOnSignup ?? 50000);
        const referralBonus = Number(database.settings.referralBonus ?? 30000);
        user = {
          id: makeId('u_'), phone, name: String(body.name || '').trim() || 'کاربر جدید',
          role: 'customer', wallet: gift, points: 100, referralCode: referralCode(),
          referredBy: null, createdAt: Date.now(), token: null, isBanned: false,
        };
        const ref = database.users.find(item => item.referralCode === String(body.referralCode || '').trim().toUpperCase());
        if (ref && ref.id !== user.id) {
          user.referredBy = ref.id;
          ref.wallet += referralBonus;
          ref.points += 50;
          database.walletTx.push({ id: makeId('tx_'), userId: ref.id, amount: referralBonus, type: 'referral', description: `پاداش معرفی کاربر جدید (${phone})`, createdAt: Date.now() });
          user.wallet += referralBonus;
          database.walletTx.push({ id: makeId('tx_'), userId: user.id, amount: referralBonus, type: 'referral', description: 'پاداش عضویت با کد معرف', createdAt: Date.now() });
        }
        database.users.push(user);
        database.walletTx.push({ id: makeId('tx_'), userId: user.id, amount: gift, type: 'gift', description: 'هدیه عضویت باشگاه مشتریان', createdAt: Date.now() });
      } else if (String(body.name || '').trim()) {
        user.name = String(body.name).trim();
      }
      if (user.isBanned) fail('حساب شما مسدود شده است');
      user.token = makeId('demo-session-');
      saveDb();
      return { success: true, token: user.token, user: publicUser(user), isNew, tier: tierOf(user.points), mock: true };
    }
    if (pathname === '/api/auth/me' && method === 'GET') {
      const user = requireUser(token);
      return { user: publicUser(user), tier: tierOf(user.points), mock: true };
    }
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const user = requireUser(token);
      user.token = null;
      saveDb();
      return { success: true, mock: true };
    }
    if (pathname === '/api/auth/profile' && method === 'PATCH') {
      const user = requireUser(token);
      if (body.name) user.name = String(body.name).trim();
      saveDb();
      return { user: publicUser(user), tier: tierOf(user.points), mock: true };
    }

    if (pathname === '/api/products' && method === 'GET') return productList(url.searchParams);
    if (pathname === '/api/admin/products' && method === 'GET') {
      requireAdmin(token);
      return { products: clone([...database.products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))), categories: clone(database.categories) };
    }
    if ((match = pathname.match(/^\/api\/products\/([^/]+)$/)) && method === 'GET') {
      const product = database.products.find(item => item.id === decodeURIComponent(match[1]));
      if (!product) fail('محصول یافت نشد');
      return { product: clone(product), reviews: clone(database.reviews.filter(review => review.productId === product.id)) };
    }
    if (pathname === '/api/products' && method === 'POST') {
      const user = requireAdmin(token, ['super_admin', 'manager', 'support', 'editor']);
      if (!body.title || !Number(body.price)) fail('عنوان و قیمت الزامی است');
      const product = {
        id: makeId('p_'), title: String(body.title).trim(), categoryId: body.categoryId || database.categories[0]?.id,
        price: Number(body.price), oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        stock: Number(body.stock ?? 10), image: String(body.image || ''), images: body.image ? [body.image] : [],
        description: String(body.description || ''), sizes: body.sizes || ['S', 'M', 'L', 'XL'],
        colors: body.colors || ['#5e6d8c', '#eacec5', '#bac2d9'], rating: 4.5, reviewsCount: 0,
        isFlash: !!body.isFlash, flashEnds: body.isFlash ? Date.now() + 86400000 : null,
        isActive: body.isActive !== false, createdAt: Date.now(), createdBy: user.phone, soldCount: 0,
      };
      database.products.unshift(product);
      saveDb();
      return { success: true, product: clone(product) };
    }
    if ((match = pathname.match(/^\/api\/products\/([^/]+)$/)) && method === 'PUT') {
      requireAdmin(token, ['super_admin', 'manager', 'support', 'editor']);
      const product = database.products.find(item => item.id === decodeURIComponent(match[1]));
      if (!product) fail('محصول یافت نشد');
      if (body.title !== undefined) product.title = String(body.title).trim();
      if (body.categoryId !== undefined) product.categoryId = body.categoryId;
      if (body.price !== undefined && Number(body.price) > 0) product.price = Number(body.price);
      if (body.oldPrice !== undefined) product.oldPrice = body.oldPrice ? Number(body.oldPrice) : null;
      if (body.stock !== undefined) product.stock = Number(body.stock);
      if (body.image !== undefined) product.image = String(body.image || '');
      if (body.description !== undefined) product.description = String(body.description || '');
      if (body.sizes !== undefined) product.sizes = body.sizes;
      if (body.colors !== undefined) product.colors = body.colors;
      if (body.isFlash !== undefined) {
        product.isFlash = !!body.isFlash;
        product.flashEnds = product.isFlash ? Date.now() + 86400000 : null;
      }
      if (body.isActive !== undefined) product.isActive = !!body.isActive;
      saveDb();
      return { success: true, product: clone(product) };
    }
    if ((match = pathname.match(/^\/api\/products\/([^/]+)$/)) && method === 'DELETE') {
      requireAdmin(token, ['super_admin', 'manager']);
      database.products = database.products.filter(item => item.id !== decodeURIComponent(match[1]));
      saveDb();
      return { success: true };
    }

    if (pathname === '/api/categories' && method === 'GET') return { categories: clone(database.categories) };
    if (pathname === '/api/categories' && method === 'POST') {
      requireAdmin(token, ['super_admin', 'manager']);
      if (!String(body.name || '').trim()) fail('نام دسته الزامی است');
      const category = { id: makeId('cat_'), name: String(body.name).trim(), slug: body.slug || String(body.name).trim(), image: String(body.image || ''), description: String(body.description || '') };
      database.categories.push(category);
      saveDb();
      return { success: true, category: clone(category) };
    }
    if ((match = pathname.match(/^\/api\/categories\/([^/]+)$/)) && method === 'PUT') {
      requireAdmin(token, ['super_admin', 'manager']);
      const category = database.categories.find(item => item.id === decodeURIComponent(match[1]));
      if (!category) fail('دسته پیدا نشد');
      Object.assign(category, body, { id: category.id });
      saveDb();
      return { success: true, category: clone(category) };
    }
    if ((match = pathname.match(/^\/api\/categories\/([^/]+)$/)) && method === 'DELETE') {
      requireAdmin(token, ['super_admin']);
      const id = decodeURIComponent(match[1]);
      if (database.products.some(product => product.categoryId === id)) fail('ابتدا محصولات این دسته را جابه‌جا یا حذف کنید');
      database.categories = database.categories.filter(item => item.id !== id);
      saveDb();
      return { success: true };
    }

    if (pathname === '/api/coupons/validate' && method === 'POST') {
      requireUser(token);
      const result = validateCoupon(body.code, body.amount);
      return { success: true, ...result };
    }
    if (pathname === '/api/coupons' && method === 'GET') {
      requireAdmin(token, ['super_admin', 'manager']);
      return { coupons: clone(database.coupons) };
    }
    if (pathname === '/api/coupons' && method === 'POST') {
      requireAdmin(token, ['super_admin', 'manager']);
      const code = ensureCoupon(body);
      const percent = Number(body.percent) || 0;
      if (percent < 0 || percent > 100) fail('درصد تخفیف باید بین صفر و صد باشد');
      const coupon = {
        id: makeId('c_'), code, percent,
        maxDiscount: Number(body.maxDiscount) || 0, minAmount: Number(body.minAmount) || 0,
        isActive: body.isActive !== false, usageLimit: Number(body.usageLimit) || 1000,
        usedCount: 0, freeShipping: !!body.freeShipping, createdAt: Date.now(),
      };
      database.coupons.push(coupon);
      saveDb();
      return { success: true, coupon: clone(coupon) };
    }
    if ((match = pathname.match(/^\/api\/coupons\/([^/]+)$/)) && method === 'PUT') {
      requireAdmin(token, ['super_admin', 'manager']);
      const coupon = database.coupons.find(item => item.id === decodeURIComponent(match[1]));
      if (!coupon) fail('کد تخفیف یافت نشد');
      if (body.code !== undefined) coupon.code = ensureCoupon(body, coupon.id);
      if (body.percent !== undefined) {
        const percent = Number(body.percent) || 0;
        if (percent < 0 || percent > 100) fail('درصد تخفیف باید بین صفر و صد باشد');
        coupon.percent = percent;
      }
      for (const key of ['maxDiscount', 'minAmount', 'usageLimit']) {
        if (body[key] !== undefined) coupon[key] = Number(body[key]) || (key === 'usageLimit' ? 1000 : 0);
      }
      if (body.isActive !== undefined) coupon.isActive = !!body.isActive;
      if (body.freeShipping !== undefined) coupon.freeShipping = !!body.freeShipping;
      coupon.updatedAt = Date.now();
      saveDb();
      return { success: true, coupon: clone(coupon) };
    }
    if ((match = pathname.match(/^\/api\/coupons\/([^/]+)$/)) && method === 'DELETE') {
      requireAdmin(token, ['super_admin', 'manager']);
      database.coupons = database.coupons.filter(item => item.id !== decodeURIComponent(match[1]));
      saveDb();
      return { success: true };
    }

    if (pathname === '/api/orders/my' && method === 'GET') {
      const user = requireUser(token);
      return { orders: clone(database.orders.filter(order => order.userId === user.id)) };
    }
    if (pathname === '/api/orders' && method === 'GET') {
      requireAdmin(token, ['super_admin', 'manager', 'support']);
      return { orders: clone(database.orders) };
    }
    if (pathname === '/api/orders' && method === 'POST') {
      const user = requireUser(token);
      if (!Array.isArray(body.items) || !body.items.length) fail('سبد خرید خالی است');
      if (!body.address?.city || !body.address?.address) fail('آدرس کامل لازم است');
      let subtotal = 0;
      const requestedByProduct = new Map();
      const orderItems = body.items.map(item => {
        const product = database.products.find(candidate => candidate.id === item.productId);
        if (!product) fail('محصول نامعتبر در سبد وجود دارد');
        const qty = Number(item.qty);
        if (!Number.isInteger(qty) || qty < 1) fail('تعداد محصول معتبر نیست');
        requestedByProduct.set(product.id, (requestedByProduct.get(product.id) || 0) + qty);
        subtotal += product.price * qty;
        return { productId: product.id, title: product.title, image: product.image, price: product.price, qty, size: item.size || '', color: item.color || '' };
      });
      for (const [productId, qty] of requestedByProduct) {
        const product = database.products.find(candidate => candidate.id === productId);
        if (product.stock < qty) fail(`موجودی «${product.title}» کافی نیست`);
      }
      let discount = 0;
      let freeShipping = false;
      let coupon = null;
      if (body.couponCode) {
        const result = validateCoupon(body.couponCode, subtotal);
        coupon = database.coupons.find(item => item.id === result.coupon.id);
        discount = result.discount;
        freeShipping = !!coupon.freeShipping;
        coupon.usedCount += 1;
      }
      discount += Math.floor((subtotal - discount) * tierOf(user.points).discount / 100);
      const shipping = freeShipping || subtotal >= database.settings.freeShippingThreshold ? 0 : database.settings.shippingCost;
      let total = Math.max(0, subtotal - discount + shipping);
      let walletUsed = 0;
      if (body.useWallet && user.wallet > 0) {
        walletUsed = Math.min(user.wallet, total);
        user.wallet -= walletUsed;
        total -= walletUsed;
        database.walletTx.push({ id: makeId('tx_'), userId: user.id, amount: -walletUsed, type: 'purchase', description: 'پرداخت نمایشی از کیف پول', createdAt: Date.now() });
      }
      for (const item of orderItems) {
        const product = database.products.find(candidate => candidate.id === item.productId);
        product.stock -= item.qty;
        product.soldCount = (product.soldCount || 0) + item.qty;
      }
      const pointsEarned = Math.floor(subtotal / 100000) * Number(database.settings.pointsPer100k ?? 10);
      user.points += pointsEarned;
      const order = {
        id: makeId('ord_'), number: ++database.seq.order, userId: user.id, userPhone: user.phone,
        userName: user.name, items: orderItems, subtotal, discount, shipping, walletUsed, total,
        couponCode: body.couponCode || null, paymentMethod: body.paymentMethod || 'demo',
        status: 'pending', address: clone(body.address), trackingCode: 'VST' + makeId('').slice(0, 8).toUpperCase(),
        pointsEarned, createdAt: Date.now(), mock: true,
      };
      database.orders.unshift(order);
      saveDb();
      return { success: true, order: clone(order), pointsEarned, mock: true };
    }
    if ((match = pathname.match(/^\/api\/orders\/([^/]+)\/status$/)) && method === 'PATCH') {
      requireAdmin(token, ['super_admin', 'manager', 'support']);
      const order = database.orders.find(item => item.id === decodeURIComponent(match[1]));
      if (!order) fail('سفارش یافت نشد');
      const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(body.status)) fail('وضعیت سفارش معتبر نیست');
      order.status = body.status;
      saveDb();
      return { success: true, order: clone(order) };
    }

    if (pathname === '/api/wallet/me' && method === 'GET') {
      const user = requireUser(token);
      return {
        wallet: user.wallet, points: user.points, tier: tierOf(user.points),
        transactions: clone(database.walletTx.filter(item => item.userId === user.id).sort((a, b) => b.createdAt - a.createdAt)),
        referralCode: user.referralCode,
      };
    }
    if (pathname === '/api/wallet/charge' && method === 'POST') {
      const user = requireUser(token);
      const amount = Number(body.amount);
      if (!amount || amount < 10000) fail('حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است');
      user.wallet += amount;
      database.walletTx.push({ id: makeId('tx_'), userId: user.id, amount, type: 'charge', description: 'شارژ نمایشی کیف پول', createdAt: Date.now() });
      saveDb();
      return { success: true, wallet: user.wallet, mock: true };
    }
    if (pathname === '/api/wallet/adjust' && method === 'POST') {
      requireAdmin(token, ['super_admin', 'manager']);
      const user = database.users.find(item => item.id === body.userId);
      if (!user) fail('کاربر یافت نشد');
      const amount = Number(body.amount);
      user.wallet += amount;
      database.walletTx.push({ id: makeId('tx_'), userId: user.id, amount, type: 'adjust', description: body.description || 'تنظیم نمایشی توسط مدیر', createdAt: Date.now() });
      saveDb();
      return { success: true, wallet: user.wallet, mock: true };
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const user = requireUser(token);
      const rating = Number(body.rating);
      if (!body.productId || rating < 1 || rating > 5) fail('امتیاز معتبر لازم است');
      const product = database.products.find(item => item.id === body.productId);
      if (!product) fail('محصول یافت نشد');
      const review = { id: makeId('r_'), productId: product.id, userId: user.id, userName: user.name, rating, comment: String(body.comment || ''), createdAt: Date.now() };
      database.reviews.push(review);
      const reviews = database.reviews.filter(item => item.productId === product.id);
      product.rating = Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1));
      product.reviewsCount = reviews.length;
      saveDb();
      return { success: true, review: clone(review), mock: true };
    }

    if (pathname === '/api/admin/stats' && method === 'GET') {
      requireAdmin(token);
      return stats();
    }
    if (pathname === '/api/admin/users' && method === 'GET') {
      requireAdmin(token, ['super_admin', 'manager', 'support']);
      return { users: database.users.map(publicUser) };
    }
    if ((match = pathname.match(/^\/api\/admin\/users\/([^/]+)\/ban$/)) && method === 'PATCH') {
      requireAdmin(token, ['super_admin', 'manager']);
      const user = database.users.find(item => item.id === decodeURIComponent(match[1]));
      if (!user) fail('کاربر یافت نشد');
      user.isBanned = !user.isBanned;
      saveDb();
      return { success: true, user: publicUser(user) };
    }
    if (pathname === '/api/admin/subadmins' && method === 'GET') {
      requireAdmin(token, ['super_admin']);
      return { admins: database.users.filter(user => ADMIN_ROLES.includes(user.role)).map(publicUser) };
    }
    if (pathname === '/api/admin/subadmins' && method === 'POST') {
      requireAdmin(token, ['super_admin']);
      const phone = String(body.phone || '').trim();
      const role = String(body.role || '');
      if (!/^09\d{9}$/.test(phone)) fail('شماره موبایل معتبر وارد کنید');
      if (!['manager', 'support', 'editor'].includes(role)) fail('نقش نامعتبر است');
      let user = database.users.find(item => item.phone === phone);
      if (user) { user.role = role; if (body.name) user.name = String(body.name).trim(); }
      else {
        user = { id: makeId('u_'), phone, name: String(body.name || '').trim() || 'مدیر جدید', role, wallet: 0, points: 0, referralCode: referralCode(), referredBy: null, createdAt: Date.now(), token: null, isBanned: false };
        database.users.push(user);
      }
      saveDb();
      return { success: true, admin: publicUser(user) };
    }
    if ((match = pathname.match(/^\/api\/admin\/subadmins\/([^/]+)$/)) && method === 'DELETE') {
      requireAdmin(token, ['super_admin']);
      const user = database.users.find(item => item.id === decodeURIComponent(match[1]));
      if (!user) fail('کاربر پیدا نشد');
      if (user.phone === '09037099476') fail('مدیر اصلی قابل حذف نیست');
      user.role = 'customer';
      saveDb();
      return { success: true };
    }
    if (pathname === '/api/admin/settings' && method === 'GET') {
      requireAdmin(token, ['super_admin', 'manager']);
      return { settings: clone(database.settings) };
    }
    if (pathname === '/api/admin/settings' && method === 'PUT') {
      requireAdmin(token, ['super_admin']);
      Object.assign(database.settings, body);
      saveDb();
      return { success: true, settings: clone(database.settings) };
    }

    fail(`آدرس نمایشی شناخته نشد: ${method} ${pathname}`);
  }

  globalThis.VestaMock = { request, reset, snapshot: () => clone(getDb()), DEMO_OTP, enabled: true };
})();
