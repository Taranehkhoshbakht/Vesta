const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const seedJs = fs.readFileSync(path.join(root, 'public/mock-seed.js'), 'utf8');
const mockJs = fs.readFileSync(path.join(root, 'public/mock-api.js'), 'utf8');

function createDemo(memory = new Map()) {
  const sandbox = {
    URL,
    URLSearchParams,
    localStorage: {
      getItem: key => memory.has(key) ? memory.get(key) : null,
      setItem: (key, value) => memory.set(key, String(value)),
      removeItem: key => memory.delete(key),
    },
  };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(seedJs, context, { filename: 'mock-seed.js' });
  vm.runInContext(mockJs, context, { filename: 'mock-api.js' });
  return { demo: context.VestaMock, storage: memory, context };
}

function plain(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
async function login(demo, phone) {
  const otp = await demo.request('/api/auth/request-otp', {
    method: 'POST', body: { phone },
  });
  assert.equal(otp.demoCode, '12345');
  const result = await demo.request('/api/auth/verify-otp', {
    method: 'POST', body: { phone, code: otp.demoCode },
  });
  return plain(result);
}
async function rejectsWith(promise, expected) {
  await assert.rejects(promise, error => {
    assert.match(error.message, expected);
    return true;
  });
}

// Guard the defining product requirement: static UI, loaded local adapter, no fetch in app code.
test('static entrypoint loads the local seed and mock before the UI and has no network fetch', () => {
  const seedAt = html.indexOf('src="mock-seed.js"');
  const mockAt = html.indexOf('src="mock-api.js"');
  const appAt = html.indexOf('src="app.js"');
  assert.ok(seedAt >= 0 && seedAt < mockAt && mockAt < appAt, 'mock scripts must load before app.js');
  assert.doesNotMatch(appJs, /\bfetch\s*\(/, 'the storefront app must never make a network fetch');
  assert.doesNotMatch(mockJs, /\bfetch\s*\(/, 'the local API adapter must not make a network fetch');
  const { demo } = createDemo();
  assert.equal(demo.enabled, true);
});

test('seed products, categories, search, filters, sorting and product reviews are served locally', async () => {
  const { demo } = createDemo();
  const all = plain(await demo.request('/api/products'));
  assert.equal(all.products.length, 16);
  assert.equal(all.categories.length, 6);
  assert.ok(all.products.every(p => p.isActive));

  const search = plain(await demo.request('/api/products?search=%DA%A9%D8%A7%D9%BE%D8%B4'));
  assert.ok(search.products.length > 0);
  assert.ok(search.products.every(p => p.title.includes('کاپش')));

  const category = plain(await demo.request('/api/products?category=cat-winter'));
  assert.ok(category.products.length > 0);
  assert.ok(category.products.every(p => p.categoryId === 'cat-winter'));

  const filtered = plain(await demo.request('/api/products?minPrice=1000000&maxPrice=2000000&sort=cheap'));
  assert.ok(filtered.products.every(p => p.price >= 1000000 && p.price <= 2000000));
  assert.deepEqual(filtered.products.map(p => p.price), [...filtered.products.map(p => p.price)].sort((a, b) => a - b));

  const detail = plain(await demo.request('/api/products/p1'));
  assert.equal(detail.product.id, 'p1');
  assert.ok(detail.reviews.length > 0);
});

test('OTP login is local, accepts demo users and creates a persistent customer account', async () => {
  const { demo, storage } = createDemo();
  const admin = await login(demo, '09037099476');
  assert.equal(admin.user.role, 'super_admin');
  assert.equal(plain(await demo.request('/api/auth/me', {}, admin.token)).user.phone, '09037099476');
  const reloaded = createDemo(storage);
  assert.equal(plain(await reloaded.demo.request('/api/auth/me', {}, admin.token)).user.role, 'super_admin');

  const newUser = await login(demo, '09123456789');
  assert.equal(newUser.isNew, true);
  assert.equal(newUser.user.wallet, 50000);
  assert.equal(newUser.user.points, 100);
  assert.ok(storage.has('vesta_mock_state_v1'));

  const referred = await demo.request('/api/auth/verify-otp', {
    method: 'POST', body: { phone: '09123456789', code: 'wrong' },
  }).catch(error => error.message);
  assert.match(referred, /کد تایید اشتباه/);
});

test('coupon validation and order placement update stock, wallet, points and order history consistently', async () => {
  const { demo } = createDemo();
  const user = await login(demo, '09120000000');
  const coupon = plain(await demo.request('/api/coupons/validate', {
    method: 'POST', body: { code: 'WELCOME10', amount: 590000 },
  }, user.token));
  assert.equal(coupon.discount, 59000);
  await rejectsWith(demo.request('/api/coupons/validate', {
    method: 'POST', body: { code: 'VESTA20', amount: 1000000 },
  }, user.token), /حداقل مبلغ/);
  await rejectsWith(demo.request('/api/coupons/validate', {
    method: 'POST', body: { code: 'NOT-A-COUPON', amount: 590000 },
  }, user.token), /معتبر نیست/);

  const orderResult = plain(await demo.request('/api/orders', {
    method: 'POST', body: {
      items: [{ productId: 'p10', qty: 1, size: 'M', color: '#5e6d8c' }],
      couponCode: 'WELCOME10', paymentMethod: 'demo_online', useWallet: true,
      address: { state: 'تهران', city: 'تهران', address: 'خیابان نمونه' },
    },
  }, user.token));
  assert.equal(orderResult.mock, true);
  assert.equal(orderResult.order.subtotal, 590000);
  assert.equal(orderResult.order.discount, 64310); // 10% coupon plus 1% bronze tier
  assert.equal(orderResult.order.shipping, 49000);
  assert.equal(orderResult.order.walletUsed, 250000);
  assert.equal(orderResult.order.total, 324690);
  assert.equal(orderResult.pointsEarned, 50);
  assert.equal(plain(await demo.request('/api/orders/my', {}, user.token)).orders.length, 1);
  assert.equal(plain(await demo.request('/api/products/p10')).product.stock, 39);

  const state = plain(demo.snapshot());
  const savedUser = state.users.find(u => u.id === 'u-demo');
  assert.equal(savedUser.wallet, 0);
  assert.equal(savedUser.points, 1300);
  assert.equal(state.coupons.find(c => c.code === 'WELCOME10').usedCount, 13);

  // Quantities across two variants are aggregated; failed orders do not mutate inventory or wallet.
  const pristine = createDemo();
  const user2 = await login(pristine.demo, '09120000000');
  await rejectsWith(pristine.demo.request('/api/orders', {
    method: 'POST', body: {
      items: [
        { productId: 'p14', qty: 30, size: 'M' },
        { productId: 'p14', qty: 30, size: 'L' },
      ],
      address: { city: 'تهران', address: 'خیابان نمونه' },
    },
  }, user2.token), /موجودی/);
  const unchanged = plain(pristine.demo.snapshot());
  assert.equal(unchanged.orders.length, 0);
  assert.equal(unchanged.products.find(p => p.id === 'p14').stock, 50);
  assert.equal(unchanged.users.find(u => u.id === 'u-demo').wallet, 250000);
});

test('admin-only mock panels and mutations work without server state', async () => {
  const { demo } = createDemo();
  const admin = await login(demo, '09037099476');
  const token = admin.token;

  assert.equal(plain(await demo.request('/api/admin/stats', {}, token)).productsCount, 16);
  await rejectsWith(demo.request('/api/admin/stats'), /وارد شوید/);

  const createdProduct = plain(await demo.request('/api/products', {
    method: 'POST', body: { title: 'محصول آزمایشی', categoryId: 'cat-men', price: 100000, stock: 3 },
  }, token));
  assert.equal(createdProduct.product.title, 'محصول آزمایشی');
  await demo.request(`/api/products/${createdProduct.product.id}`, {
    method: 'PUT', body: { price: 120000, stock: 2 },
  }, token);
  assert.equal(plain(await demo.request(`/api/products/${createdProduct.product.id}`)).product.price, 120000);

  const category = plain(await demo.request('/api/categories', {
    method: 'POST', body: { name: 'دسته آزمایشی' },
  }, token));
  await demo.request(`/api/products/${createdProduct.product.id}`, {
    method: 'PUT', body: { categoryId: category.category.id },
  }, token);
  await rejectsWith(demo.request(`/api/categories/${category.category.id}`, { method: 'DELETE' }, token), /ابتدا محصولات/);
  await demo.request(`/api/products/${createdProduct.product.id}`, { method: 'DELETE' }, token);
  await demo.request(`/api/categories/${category.category.id}`, { method: 'DELETE' }, token);

  const coupon = plain(await demo.request('/api/coupons', {
    method: 'POST', body: { code: 'DEMOFREE', freeShipping: true, usageLimit: 1 },
  }, token));
  assert.equal(coupon.coupon.freeShipping, true);
  await demo.request(`/api/coupons/${coupon.coupon.id}`, { method: 'PUT', body: { isActive: false } }, token);
  await rejectsWith(demo.request('/api/coupons/validate', {
    method: 'POST', body: { code: 'DEMOFREE', amount: 100000 },
  }, token), /معتبر نیست/);
  await demo.request(`/api/coupons/${coupon.coupon.id}`, { method: 'DELETE' }, token);

  const settings = plain(await demo.request('/api/admin/settings', {}, token));
  assert.equal(settings.settings.shippingCost, 49000);
  await demo.request('/api/admin/settings', { method: 'PUT', body: { shippingCost: 0 } }, token);
  assert.equal(plain(await demo.request('/api/settings')).settings.shippingCost, 0);

  const customer = await login(demo, '09120000000');
  await demo.request('/api/wallet/adjust', {
    method: 'POST', body: { userId: customer.user.id, amount: 10000, description: 'تست' },
  }, token);
  assert.equal(plain(await demo.request('/api/wallet/me', {}, customer.token)).wallet, 260000);

  const newAdmin = plain(await demo.request('/api/admin/subadmins', {
    method: 'POST', body: { phone: '09900000000', name: 'مدیر نمایشی', role: 'editor' },
  }, token));
  assert.equal(newAdmin.admin.role, 'editor');
  assert.ok(plain(await demo.request('/api/admin/subadmins', {}, token)).admins.some(u => u.id === newAdmin.admin.id));
  await demo.request(`/api/admin/subadmins/${newAdmin.admin.id}`, { method: 'DELETE' }, token);

  const review = plain(await demo.request('/api/reviews', {
    method: 'POST', body: { productId: 'p1', rating: 5, comment: 'تست نمایشی' },
  }, customer.token));
  assert.equal(review.review.comment, 'تست نمایشی');
  assert.ok(plain(await demo.request('/api/products/p1')).reviews.some(r => r.id === review.review.id));
});
