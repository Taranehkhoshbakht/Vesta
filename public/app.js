/* ===== پوشاک وستا - منطق فرانت‌اند ===== */
const API = '';
let state = {
  user: null, token: localStorage.getItem('vesta_token') || null,
  products: [], categories: [], cart: JSON.parse(localStorage.getItem('vesta_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vesta_wish') || '[]'),
  activeCat: '', search: '', settings: {}, walletData: null, orders: [],
  selectedProduct: null, selSize: 'M', selColor: '#5e6d8c', coupon: null, checkoutCoupon: null,
  adminTab: 'dashboard'
};
const fmt = n => Number(n || 0).toLocaleString('fa-IR');
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = 'Bearer ' + state.token;
  const r = await fetch(API + path, { ...opts, headers });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'خطایی رخ داد');
  return data;
}
function toast(msg, err = false) {
  const t = $('toast'); t.textContent = msg; t.className = 'toast' + (err ? ' err' : '');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 3500);
}
function openModal(html) { $('modalBox').innerHTML = `<button class="close-x" onclick="closeModal()">✕</button>` + html; $('modalOverlay').classList.remove('hidden'); }
function closeModal() { $('modalOverlay').classList.add('hidden'); }
function saveCart() { localStorage.setItem('vesta_cart', JSON.stringify(state.cart)); updateBadges(); }
function saveWish() { localStorage.setItem('vesta_wish', JSON.stringify(state.wishlist)); updateBadges(); }
function updateBadges() {
  $('cartCount').textContent = fmt(state.cart.reduce((s, i) => s + i.qty, 0));
  $('wishCount').textContent = fmt(state.wishlist.length);
}
function isAdmin() { return state.user && ['super_admin','manager','support','editor'].includes(state.user.role); }
function roleName(r) { return { super_admin:'مدیر کل', manager:'مدیر فروش', support:'پشتیبان', editor:'ویراستار محصول', customer:'مشتری' }[r] || r; }
function statusName(s) { return { pending:'در انتظار بررسی', confirmed:'تایید شده', shipped:'ارسال شده', delivered:'تحویل داده شده', cancelled:'لغو شده' }[s] || s; }

/* ---------- بارگذاری اولیه ---------- */
async function init() {
  try {
    const s = await api('/api/settings'); state.settings = s.settings;
    $('freeShipTop').textContent = fmt(state.settings.freeShippingThreshold);
  } catch {}
  await loadProducts();
  if (state.token) { try { const me = await api('/api/auth/me'); state.user = me.user; } catch { state.token = null; localStorage.removeItem('vesta_token'); } }
  renderAuthArea(); updateBadges(); startCountdown();
}
async function loadProducts() {
  const d = await api('/api/products'); state.products = d.products; state.categories = d.categories;
  renderCatNav(); renderCats(); renderProducts(); renderFlash();
}
function renderCatNav() {
  $('catNav').innerHTML = `<button class="${!state.activeCat?'active':''}" onclick="setCat('')">همه</button>` +
    state.categories.map(c => `<button class="${state.activeCat===c.id?'active':''}" onclick="setCat('${c.id}')">${esc(c.name)}</button>`).join('');
}
function renderCats() {
  $('catGrid').innerHTML = state.categories.map(c => `
    <button class="cat-card" onclick="setCat('${c.id}')">
      <img src="${esc(c.image||'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop')}" alt="${esc(c.name)}">
      <span>${esc(c.name)}</span>
    </button>`).join('');
}
function setCat(id) { state.activeCat = id; renderCatNav(); applyFilters(); $('productsSec').scrollIntoView({ behavior:'smooth' }); }
function doSearch() { state.search = $('searchInput').value.trim(); applyFilters(); $('productsSec').scrollIntoView({ behavior:'smooth' }); }
$('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
function clearFilters() { state.activeCat=''; state.search=''; $('searchInput').value=''; $('minPrice').value=''; $('maxPrice').value=''; $('onlyFlash').checked=false; $('sortSel').value='new'; renderCatNav(); applyFilters(); }
async function applyFilters() {
  const q = new URLSearchParams();
  if (state.activeCat) q.set('category', state.activeCat);
  if (state.search) q.set('search', state.search);
  q.set('sort', $('sortSel').value);
  if ($('minPrice').value) q.set('minPrice', $('minPrice').value);
  if ($('maxPrice').value) q.set('maxPrice', $('maxPrice').value);
  if ($('onlyFlash').checked) q.set('flash', '1');
  const d = await api('/api/products?' + q.toString());
  state.products = d.products;
  const cat = state.categories.find(c => c.id === state.activeCat);
  $('productsTitle').textContent = state.search ? `نتایج جستجو: «${state.search}»` : (cat ? cat.name : 'همه محصولات');
  renderProducts();
}
function offPercent(p) { return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }
function productCard(p) {
  const wished = state.wishlist.includes(p.id);
  return `<div class="pcard" onclick="openProduct('${p.id}')">
    <div class="pimg"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
      ${offPercent(p) ? `<span class="off">٪${fmt(offPercent(p))} تخفیف</span>` : ''}
      <button class="wish" onclick="event.stopPropagation();toggleWish('${p.id}')">${wished ? '❤️' : '🤍'}</button>
    </div>
    <div class="pbody">
      <span class="pcat">${esc((state.categories.find(c=>c.id===p.categoryId)||{}).name || '')}</span>
      <h3>${esc(p.title)}</h3>
      <span class="rate">⭐ ${fmt(p.rating)} (${fmt(p.reviewsCount)} دیدگاه)</span>
      ${p.stock <= 5 && p.stock > 0 ? `<span class="stock-low">🔥 فقط ${fmt(p.stock)} عدد باقی مانده!</span>` : ''}
      ${p.stock === 0 ? `<span class="stock-low">ناموجود</span>` : ''}
      <div class="price">${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}<b>${fmt(p.price)} تومان</b></div>
      <button class="add-btn" ${p.stock===0?'disabled':''} onclick="event.stopPropagation();addToCart('${p.id}')">افزودن به سبد 🛒</button>
    </div></div>`;
}
function renderProducts() {
  $('productGrid').innerHTML = state.products.length ? state.products.map(productCard).join('') : `<div class="empty">😕 محصولی پیدا نشد. فیلترها را تغییر دهید.</div>`;
}
function renderFlash() {
  const flash = state.products.filter(p => p.isFlash);
  $('flashRow').innerHTML = flash.length ? flash.map(productCard).join('') : '<div class="empty">فروش فلش به‌زودی...</div>';
}
function startCountdown() {
  setInterval(() => {
    const p = state.products.find(x => x.isFlash && x.flashEnds);
    if (!p) { $('countdown').textContent = '--:--:--'; return; }
    let s = Math.max(0, Math.floor((p.flashEnds - Date.now()) / 1000));
    const h = String(Math.floor(s/3600)).padStart(2,'0'), m = String(Math.floor(s%3600/60)).padStart(2,'0'), sec = String(s%60).padStart(2,'0');
    $('countdown').textContent = `${h}:${m}:${sec}`;
  }, 1000);
}

/* ---------- علاقه‌مندی ---------- */
function toggleWish(id) {
  const i = state.wishlist.indexOf(id);
  if (i >= 0) state.wishlist.splice(i, 1); else state.wishlist.push(id);
  saveWish(); renderProducts(); renderFlash();
  toast(i >= 0 ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد ❤️');
}
function toggleWishlistView() {
  const items = state.products.filter(p => state.wishlist.includes(p.id));
  openModal(`<h2>❤️ علاقه‌مندی‌های من</h2>` + (items.length ? `<div class="product-grid">${items.map(productCard).join('')}</div>` : '<p>هنوز چیزی را نشان نکرده‌اید.</p>'));
}

/* ---------- جزئیات محصول ---------- */
async function openProduct(id) {
  const d = await api('/api/products/' + id);
  const p = d.product; state.selectedProduct = p; state.selSize = (p.sizes||[])[1] || 'M'; state.selColor = (p.colors||[])[0] || '#5e6d8c';
  const reviews = d.reviews.map(r => `<div class="review"><span class="stars">${'⭐'.repeat(r.rating)}</span> <b>${esc(r.userName)}</b><br>${esc(r.comment)}<br><small>${new Date(r.createdAt).toLocaleDateString('fa-IR')}</small></div>`).join('');
  openModal(`<div class="pdetail">
    <div><img class="main" src="${esc(p.image)}" alt="${esc(p.title)}"></div>
    <div>
      <span class="pcat">${esc((state.categories.find(c=>c.id===p.categoryId)||{}).name||'')}</span>
      <h2 style="margin:6px 0">${esc(p.title)}</h2>
      <div class="rate">⭐ ${fmt(p.rating)} · ${fmt(p.reviewsCount)} دیدگاه · ${fmt(p.soldCount||0)} فروش</div>
      <div class="price" style="margin:10px 0">${p.oldPrice?`<s>${fmt(p.oldPrice)}</s>`:''}<b style="font-size:22px;color:var(--c60-dark)">${fmt(p.price)} تومان</b> ${offPercent(p)?`<span class="off" style="position:static">٪${fmt(offPercent(p))}</span>`:''}</div>
      <p style="color:var(--muted);font-size:14px">${esc(p.description)}</p>
      <div style="margin-top:12px"><b>سایز:</b><div class="size-row">${(p.sizes||[]).map(s=>`<button class="size-btn ${s===state.selSize?'sel':''}" onclick="selSize('${s}',this)">${s}</button>`).join('')}</div></div>
      <div><b>رنگ:</b><div class="color-row">${(p.colors||[]).map(c=>`<button class="color-dot ${c===state.selColor?'sel':''}" style="background:${c}" onclick="selColor('${c}',this)"></button>`).join('')}</div></div>
      <div style="margin:12px 0">موجودی: <b>${fmt(p.stock)} عدد</b></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" ${p.stock===0?'disabled':''} onclick="addToCart('${p.id}',true)">🛒 افزودن به سبد</button>
        <button class="btn btn-outline" onclick="toggleWish('${p.id}')">❤️ علاقه‌مندی</button>
      </div>
      <h3 style="margin-top:20px">دیدگاه‌ها</h3>
      <div id="reviewsBox">${reviews || '<p style="color:var(--muted)">هنوز دیدگاهی ثبت نشده است.</p>'}</div>
      ${state.user ? `<div class="field" style="margin-top:12px"><label>امتیاز شما (۱ تا ۵)</label>
        <select id="revRating"><option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option></select></div>
        <div class="field"><label>دیدگاه</label><textarea id="revText" rows="2" placeholder="نظر شما..."></textarea></div>
        <button class="btn btn-ok" onclick="submitReview('${p.id}')">ثبت دیدگاه</button>` : '<p style="color:var(--muted);margin-top:8px">برای ثبت دیدگاه وارد شوید.</p>'}
    </div></div>`);
}
function selSize(s, el) { state.selSize = s; el.parentElement.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('sel')); el.classList.add('sel'); }
function selColor(c, el) { state.selColor = c; el.parentElement.querySelectorAll('.color-dot').forEach(b=>b.classList.remove('sel')); el.classList.add('sel'); }
async function submitReview(pid) {
  try { await api('/api/reviews', { method:'POST', body: JSON.stringify({ productId: pid, rating: +$('revRating').value, comment: $('revText').value }) }); toast('دیدگاه شما ثبت شد ✅'); openProduct(pid); }
  catch(e) { toast(e.message, true); }
}

/* ---------- سبد خرید ---------- */
function addToCart(id, fromDetail = false) {
  const p = state.products.find(x => x.id === id) || state.selectedProduct;
  if (!p) return;
  const size = fromDetail ? state.selSize : ((p.sizes||[])[1] || 'M');
  const color = fromDetail ? state.selColor : ((p.colors||[])[0] || '#5e6d8c');
  const ex = state.cart.find(i => i.productId === id && i.size === size && i.color === color);
  if (ex) ex.qty++; else state.cart.push({ productId: id, title: p.title, image: p.image, price: p.price, qty: 1, size, color });
  saveCart(); renderCart(); toast('به سبد خرید اضافه شد 🛒');
}
function changeQty(idx, d) { state.cart[idx].qty += d; if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1); saveCart(); renderCart(); }
function removeFromCart(idx) { state.cart.splice(idx, 1); saveCart(); renderCart(); }
function cartSubtotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function openCart() { renderCart(); $('cartDrawer').classList.remove('hidden'); $('drawerOverlay').classList.remove('hidden'); }
function closeCart() { $('cartDrawer').classList.add('hidden'); $('drawerOverlay').classList.add('hidden'); }
function renderCart() {
  const box = $('cartItems');
  if (!state.cart.length) { box.innerHTML = '<div class="empty">سبد خرید شما خالی است 🛒</div>'; $('cartFoot').innerHTML = ''; return; }
  box.innerHTML = state.cart.map((i, idx) => `<div class="cart-item">
    <img src="${esc(i.image)}"><div style="flex:1">
      <b style="font-size:14px">${esc(i.title)}</b><br>
      <small>سایز ${esc(i.size)} · <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${esc(i.color)};vertical-align:middle"></span></small><br>
      <b>${fmt(i.price * i.qty)} تومان</b>
      <div class="qty"><button onclick="changeQty(${idx},-1)">−</button><span>${fmt(i.qty)}</span><button onclick="changeQty(${idx},1)">+</button>
      <button style="border:0;background:none;color:var(--bad)" onclick="removeFromCart(${idx})">🗑️</button></div>
    </div></div>`).join('');
  const sub = cartSubtotal();
  const threshold = state.settings.freeShippingThreshold || 1000000;
  const pct = Math.min(100, Math.round(sub / threshold * 100));
  const remain = threshold - sub;
  $('cartFoot').innerHTML = `
    <div>${remain > 0 ? `🎁 فقط <b>${fmt(remain)} تومان</b> تا ارسال رایگان فاصله داری!` : '🎉 ارسال این سفارش رایگان است!'}</div>
    <div class="ship-progress"><i style="width:${pct}%"></i></div>
    <div class="summary"><span>جمع اقلام</span><b>${fmt(sub)} تومان</b></div>
    <div class="summary"><span>ارسال</span><b>${sub >= threshold ? 'رایگان' : fmt(state.settings.shippingCost || 49000) + ' تومان'}</b></div>
    <button class="btn btn-primary btn-lg w100" onclick="openCheckout()">ادامه و تسویه ✅</button>
    <button class="btn btn-outline w100" onclick="closeCart()">ادامه خرید</button>`;
}

/* ---------- احراز هویت ---------- */
function renderAuthArea() {
  if (state.user) {
    $('authBtn').textContent = `👤 ${esc(state.user.name)}`;
    $('authBtn').onclick = openProfile;
    $('adminBtn').classList.toggle('hidden', !isAdmin());
  } else {
    $('authBtn').textContent = 'ورود / ثبت‌نام';
    $('authBtn').onclick = openAuth;
    $('adminBtn').classList.add('hidden');
  }
}
let otpPhone = '';
function openAuth() {
  if (state.user) return openProfile();
  openModal(`<h2>🔐 ورود / ثبت‌نام</h2>
    <p style="color:var(--muted);font-size:14px">با شماره موبایل وارد شوید. کد تایید پیامک می‌شود.</p>
    <div class="field"><label>شماره موبایل</label><input id="authPhone" placeholder="09123456789" inputmode="numeric" dir="ltr" style="text-align:left"></div>
    <div class="field"><label>نام (برای ثبت‌نام جدید)</label><input id="authName" placeholder="نام و نام خانوادگی"></div>
    <div class="field"><label>کد معرف (اختیاری)</label><input id="authRef" placeholder="مثلاً VESTA1234"></div>
    <button class="btn btn-primary w100" onclick="requestOtp()">📩 ارسال کد تایید</button>
    <div id="otpBox" class="hidden">
      <div class="otp-demo">📱 کد تایید شما (حالت دمو — در نسخه واقعی پیامک می‌شود):<br><b id="demoCode">------</b></div>
      <div class="field"><label>کد تایید ۵ رقمی</label><input id="otpInput" placeholder="12345" inputmode="numeric" dir="ltr" style="text-align:left"></div>
      <button class="btn btn-ok w100" onclick="verifyOtp()">✅ تایید و ورود</button>
    </div>
    <p style="font-size:12px;color:var(--muted);margin-top:12px">💡 حساب‌های مدیریتی: مدیر کل <code>09037099476</code> · پشتیبان <code>09961217945</code> — با همین شماره‌ها وارد شوید.</p>`);
}
async function requestOtp() {
  const phone = $('authPhone').value.trim();
  try {
    const d = await api('/api/auth/request-otp', { method:'POST', body: JSON.stringify({ phone }) });
    otpPhone = phone; $('otpBox').classList.remove('hidden'); $('demoCode').textContent = d.demoCode;
    toast('کد تایید ارسال شد 📩');
  } catch(e) { toast(e.message, true); }
}
async function verifyOtp() {
  try {
    const d = await api('/api/auth/verify-otp', { method:'POST', body: JSON.stringify({ phone: otpPhone, code: $('otpInput').value.trim(), name: $('authName').value.trim(), referralCode: $('authRef').value.trim() }) });
    state.token = d.token; localStorage.setItem('vesta_token', d.token); state.user = d.user;
    closeModal(); renderAuthArea();
    toast(d.isNew ? '🎉 خوش آمدید! هدیه عضویت به کیف پول شما اضافه شد' : 'خوش برگشتید 👋');
    if (isAdmin()) showView('admin');
  } catch(e) { toast(e.message, true); }
}
async function logout() { try { await api('/api/auth/logout', { method:'POST' }); } catch{} state.token = null; localStorage.removeItem('vesta_token'); state.user = null; renderAuthArea(); showView('home'); toast('خروج انجام شد'); }

/* ---------- پروفایل / کیف پول / باشگاه ---------- */
async function openProfile() {
  if (!state.user) return openAuth();
  const w = await api('/api/wallet/me'); state.walletData = w;
  const t = w.tier;
  openModal(`<h2>👤 پروفایل من</h2>
    <div class="profile-head"><b style="font-size:20px">${esc(state.user.name)}</b><br><small>${esc(state.user.phone)} · ${roleName(state.user.role)}</small>
      <div style="margin-top:8px">سطح باشگاه: <b style="color:${t.color}">${t.name}</b> · امتیاز: <b>${fmt(w.points)}</b></div></div>
    <div class="wallet-cards">
      <div class="wcard"><b>${fmt(w.wallet)} تومان</b><span>موجودی کیف پول</span></div>
      <div class="wcard"><b>${fmt(w.points)}</b><span>امتیاز باشگاه</span></div>
      <div class="wcard"><b>${t.discount}٪</b><span>تخفیف سطح شما</span></div>
      <div class="wcard"><b style="font-size:15px">${esc(w.referralCode)}</b><span>کد معرف شما</span></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <button class="btn btn-primary" onclick="openWallet()">👛 کیف پول و تراکنش‌ها</button>
      <button class="btn btn-outline" onclick="openClub()">⭐ باشگاه مشتریان</button>
      <button class="btn btn-outline" onclick="openMyOrders()">📦 سفارش‌های من</button>
      ${isAdmin() ? '<button class="btn btn-dark" onclick="closeModal();showView(\'admin\')">⚙️ پنل مدیریت</button>' : ''}
      <button class="btn btn-danger" onclick="logout()">🚪 خروج</button>
    </div>
    <div class="field"><label>ویرایش نام</label><input id="profileName" value="${esc(state.user.name)}"></div>
    <button class="btn btn-ok" onclick="updateProfile()">💾 ذخیره نام</button>`);
}
async function updateProfile() {
  try { const d = await api('/api/auth/profile', { method:'PATCH', body: JSON.stringify({ name: $('profileName').value }) }); state.user = d.user; renderAuthArea(); toast('نام به‌روز شد ✅'); }
  catch(e) { toast(e.message, true); }
}
async function openWallet() {
  if (!state.user) return openAuth();
  const w = await api('/api/wallet/me'); state.walletData = w;
  const tx = w.transactions.map(t => `<div class="tx"><span>${esc(t.description)}<br><small>${new Date(t.createdAt).toLocaleDateString('fa-IR')}</small></span><span class="${t.amount>=0?'plus':'minus'}">${t.amount>=0?'+':'−'}${fmt(Math.abs(t.amount))}</span></div>`).join('') || '<p>تراکنشی ثبت نشده است.</p>';
  openModal(`<h2>👛 کیف پول من</h2>
    <div class="wallet-cards"><div class="wcard"><b>${fmt(w.wallet)} تومان</b><span>موجودی فعلی</span></div></div>
    <div class="row2">
      <div class="field"><label>مبلغ شارژ (تومان)</label><input id="chargeAmt" type="number" placeholder="مثلاً ۲۰۰۰۰۰"></div>
      <div class="field"><label>&nbsp;</label><button class="btn btn-primary w100" onclick="chargeWallet()">💳 شارژ کیف پول</button></div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">${[100000,200000,500000,1000000].map(a=>`<button class="btn btn-outline" onclick="$('chargeAmt').value=${a}">${fmt(a)}</button>`).join('')}</div>
    <h3>تراکنش‌های اخیر</h3>${tx}`);
}
async function chargeWallet() {
  try { await api('/api/wallet/charge', { method:'POST', body: JSON.stringify({ amount: +$('chargeAmt').value }) }); toast('کیف پول شارژ شد ✅'); openWallet(); }
  catch(e) { toast(e.message, true); }
}
async function openClub() {
  if (!state.user) return openAuth();
  const w = await api('/api/wallet/me'); const t = w.tier;
  const next = w.points < 500 ? { at:500, name:'برنزی' } : w.points < 2000 ? { at:2000, name:'نقره‌ای' } : w.points < 5000 ? { at:5000, name:'طلایی' } : null;
  const pct = next ? Math.min(100, Math.round(w.points / next.at * 100)) : 100;
  openModal(`<h2>⭐ باشگاه مشتریان وستا</h2>
    <div class="profile-head"><b>سطح شما: ${t.name}</b> · <b>${fmt(w.points)} امتیاز</b><br><small>تخفیف دائمی روی همه خریدها: ${t.discount}٪</small></div>
    ${next ? `<p>تا سطح <b>${next.name}</b> فقط <b>${fmt(next.at - w.points)} امتیاز</b> فاصله داری!</p><div class="ship-progress" style="margin:10px 0"><i style="width:${pct}%"></i></div>` : '<p>🎉 شما در بالاترین سطح باشگاه هستید!</p>'}
    <div class="club-tiers" style="margin:14px 0">
      <div class="tier" style="--c:#b07a4f"><b>برنزی</b><span>۵۰۰+ امتیاز</span><small>۱٪ تخفیف</small></div>
      <div class="tier" style="--c:#8a94a6"><b>نقره‌ای</b><span>۲۰۰۰+ امتیاز</span><small>۳٪ تخفیف</small></div>
      <div class="tier" style="--c:#c9a227"><b>طلایی</b><span>۵۰۰۰+ امتیاز</span><small>۵٪ تخفیف</small></div>
    </div>
    <p style="font-size:14px;color:var(--muted)">🎁 با هر ۱۰۰ هزار تومان خرید، ۱۰ امتیاز می‌گیرید. کد معرف شما: <code>${esc(w.referralCode)}</code> — هر دوست که با کد شما عضو شود، هر دو نفر <b>${fmt(state.settings.referralBonus||30000)} تومان</b> پاداش می‌گیرید!</p>
    <button class="btn btn-primary w100" onclick="closeModal();openWallet()">مشاهده کیف پول</button>`);
}
async function openMyOrders() {
  if (!state.user) return openAuth();
  const d = await api('/api/orders/my');
  const html = d.orders.length ? d.orders.map(o => `<div class="order-card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"><b>سفارش #${fmt(o.number)}</b><span class="status ${o.status}">${statusName(o.status)}</span></div>
    <small>کد رهگیری: ${esc(o.trackingCode)} · ${new Date(o.createdAt).toLocaleDateString('fa-IR')}</small>
    ${o.items.map(i=>`<div style="font-size:13px">• ${esc(i.title)} × ${fmt(i.qty)} (سایز ${esc(i.size)}) — ${fmt(i.price*i.qty)} تومان</div>`).join('')}
    <div class="summary" style="margin-top:8px"><span>مبلغ نهایی</span><b>${fmt(o.total)} تومان</b></div>
    <small>⭐ ${fmt(o.pointsEarned)} امتیاز باشگاه کسب کردید</small></div>`).join('') : '<p>هنوز سفارشی ثبت نکرده‌اید.</p>';
  openModal(`<h2>📦 سفارش‌های من</h2>${html}`);
}

/* ---------- تسویه حساب ---------- */
function openCheckout() {
  if (!state.user) { closeCart(); return openAuth(); }
  if (!state.cart.length) return;
  state.checkoutCoupon = null;
  const sub = cartSubtotal();
  const threshold = state.settings.freeShippingThreshold || 1000000;
  const shipping = sub >= threshold ? 0 : (state.settings.shippingCost || 49000);
  openModal(`<h2>🧾 تسویه حساب</h2>
    <div class="row2">
      <div class="field"><label>استان</label><input id="coState" placeholder="تهران"></div>
      <div class="field"><label>شهر</label><input id="coCity" placeholder="تهران"></div>
    </div>
    <div class="field"><label>آدرس کامل</label><textarea id="coAddr" rows="2" placeholder="خیابان، کوچه، پلاک، واحد..."></textarea></div>
    <div class="row2">
      <div class="field"><label>کد پستی</label><input id="coZip" placeholder="1234567890"></div>
      <div class="field"><label>روش پرداخت</label><select id="coPay"><option value="online">پرداخت آنلاین (درگاه)</option><option value="cod">پرداخت در محل</option></select></div>
    </div>
    <div class="field"><label>کد تخفیف (اختیاری)</label>
      <div style="display:flex;gap:8px"><input id="coCoupon" placeholder="WELCOME10" style="flex:1"><button class="btn btn-outline" onclick="applyCoupon()">اعمال</button></div>
      <small id="couponMsg"></small></div>
    <label class="check" style="display:flex;gap:8px;align-items:center;margin:10px 0"><input type="checkbox" id="coWallet" onchange="renderCheckoutSummary()"> پرداخت از کیف پول (موجودی: ${fmt(state.walletData?.wallet ?? state.user.wallet)} تومان)</label>
    <div id="checkoutSummary"></div>
    <button class="btn btn-primary btn-lg w100" onclick="placeOrder()">✅ ثبت سفارش و پرداخت</button>`);
  renderCheckoutSummary();
}
async function applyCoupon() {
  const code = $('coCoupon').value.trim(); if (!code) return;
  try {
    const d = await api('/api/coupons/validate', { method:'POST', body: JSON.stringify({ code, amount: cartSubtotal() }) });
    state.checkoutCoupon = { code, discount: d.discount, freeShipping: !!d.coupon.freeShipping };
    $('couponMsg').textContent = `✅ کد اعمال شد: ${fmt(d.discount)} تومان تخفیف`; $('couponMsg').style.color = 'var(--ok)';
    renderCheckoutSummary();
  } catch(e) { $('couponMsg').textContent = '❌ ' + e.message; $('couponMsg').style.color = 'var(--bad)'; }
}
function renderCheckoutSummary() {
  const el = $('checkoutSummary'); if (!el) return;
  const sub = cartSubtotal();
  const threshold = state.settings.freeShippingThreshold || 1000000;
  let shipping = sub >= threshold ? 0 : (state.settings.shippingCost || 49000);
  let discount = state.checkoutCoupon?.discount || 0;
  if (state.checkoutCoupon?.freeShipping) shipping = 0;
  const useW = $('coWallet')?.checked;
  const walletUse = useW ? Math.min(state.user.wallet, sub - discount + shipping) : 0;
  const total = sub - discount + shipping - walletUse;
  el.innerHTML = `<div class="summary"><span>جمع اقلام</span><b>${fmt(sub)} تومان</b></div>
    ${discount?`<div class="summary"><span>تخفیف کد</span><b style="color:var(--ok)">−${fmt(discount)}</b></div>`:''}
    <div class="summary"><span>ارسال</span><b>${shipping===0?'رایگان':fmt(shipping)+' تومان'}</b></div>
    ${walletUse?`<div class="summary"><span>از کیف پول</span><b style="color:var(--ok)">−${fmt(walletUse)}</b></div>`:''}
    <div class="summary total"><span>قابل پرداخت</span><b>${fmt(total)} تومان</b></div>`;
}
async function placeOrder() {
  const body = {
    items: state.cart, couponCode: state.checkoutCoupon?.code || null,
    paymentMethod: $('coPay').value, useWallet: $('coWallet').checked,
    address: { state: $('coState').value, city: $('coCity').value, address: $('coAddr').value, zip: $('coZip').value }
  };
  try {
    const d = await api('/api/orders', { method:'POST', body: JSON.stringify(body) });
    state.cart = []; saveCart(); closeCart();
    openModal(`<div style="text-align:center;padding:20px">
      <div style="font-size:60px">🎉</div><h2>سفارش شما ثبت شد!</h2>
      <p>شماره سفارش: <b>#${fmt(d.order.number)}</b><br>کد رهگیری: <code>${esc(d.order.trackingCode)}</code><br>
      مبلغ پرداخت‌شده: <b>${fmt(d.order.total)} تومان</b><br>⭐ ${fmt(d.pointsEarned)} امتیاز باشگاه به حساب شما اضافه شد</p>
      <button class="btn btn-primary" onclick="closeModal();openMyOrders()">مشاهده سفارش‌ها</button></div>`);
    state.user.wallet -= d.order.walletUsed || 0; state.user.points += d.pointsEarned;
  } catch(e) { toast(e.message, true); }
}

/* ---------- ناوبری ویو ---------- */
function showView(v) {
  if (v === 'admin') {
    if (!isAdmin()) return openAuth();
    $('shopView').classList.add('hidden'); $('adminView').classList.remove('hidden');
    adminTab(state.adminTab);
  } else {
    $('adminView').classList.add('hidden'); $('shopView').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
function scrollToProducts() { $('productsSec').scrollIntoView({ behavior: 'smooth' }); }

/* ---------- پنل مدیریت ---------- */
function adminTab(tab) {
  state.adminTab = tab;
  document.querySelectorAll('.side-btn[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const role = state.user.role;
  const allowed = {
    dashboard: true, products: true, categories: ['super_admin','manager'].includes(role),
    orders: ['super_admin','manager','support'].includes(role), users: ['super_admin','manager','support'].includes(role),
    subadmins: role === 'super_admin', coupons: ['super_admin','manager'].includes(role), settings: role === 'super_admin'
  };
  if (!allowed[tab]) { $('adminMain').innerHTML = '<div class="alert-box">⛔ شما به این بخش دسترسی ندارید. نقش شما: ' + roleName(role) + '</div>'; return; }
  ({ dashboard: renderDashboard, products: renderAdminProducts, categories: renderAdminCategories, orders: renderAdminOrders, users: renderAdminUsers, subadmins: renderSubadmins, coupons: renderAdminCoupons, settings: renderAdminSettings })[tab]();
}
async function renderDashboard() {
  const s = await api('/api/admin/stats');
  const max = Math.max(...s.chart.map(c => c.sum), 1);
  $('adminMain').innerHTML = `<h2>📊 داشبورد مدیریت</h2>
    <div class="stat-grid">
      <div class="stat"><b>${fmt(s.totalSales)} تومان</b><span>فروش کل</span></div>
      <div class="stat"><b>${fmt(s.todaySales)} تومان</b><span>فروش امروز</span></div>
      <div class="stat"><b>${fmt(s.ordersCount)}</b><span>کل سفارش‌ها (${fmt(s.pendingOrders)} در انتظار)</span></div>
      <div class="stat"><b>${fmt(s.productsCount)}</b><span>محصولات</span></div>
      <div class="stat"><b>${fmt(s.usersCount)}</b><span>مشتریان</span></div>
      <div class="stat"><b>${fmt(s.adminsCount)}</b><span>مدیران و زیرمدیران</span></div>
    </div>
    ${s.lowStock.length ? `<div class="alert-box">⚠️ موجودی کم: ${s.lowStock.map(p=>esc(p.title)).join('، ')}</div>` : ''}
    <h3>فروش ۷ روز اخیر</h3>
    <div class="chart">${s.chart.map(c=>`<div class="bar" style="height:${Math.max(4, c.sum/max*100)}%" title="${fmt(c.sum)}"><span>${c.label}</span></div>`).join('')}</div>
    <h3 style="margin-top:36px">پرفروش‌ترین محصولات</h3>
    <table><tr><th>محصول</th><th>فروش</th><th>موجودی</th><th>قیمت</th></tr>
    ${s.topProducts.map(p=>`<tr><td>${esc(p.title)}</td><td>${fmt(p.soldCount||0)}</td><td>${fmt(p.stock)}</td><td>${fmt(p.price)}</td></tr>`).join('')}</table>`;
}
async function renderAdminProducts() {
  const d = await api('/api/products');
  $('adminMain').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h2>👕 محصولات (${fmt(d.products.length)})</h2><button class="btn btn-primary" onclick="productForm()">➕ محصول جدید</button></div>
    <table><tr><th>تصویر</th><th>عنوان</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>وضعیت</th><th>عملیات</th></tr>
    ${d.products.map(p=>`<tr><td><img src="${esc(p.image)}"></td><td>${esc(p.title)}<br><small>${p.isFlash?'⚡ فلش ':''}${fmt(p.soldCount||0)} فروش</small></td>
      <td>${esc((d.categories.find(c=>c.id===p.categoryId)||{}).name||'')}</td><td>${fmt(p.price)}</td><td>${fmt(p.stock)}</td>
      <td>${p.isActive!==false?'✅ فعال':'❌ غیرفعال'}</td>
      <td><button class="mini-btn mini-edit" onclick="productForm('${p.id}')">✏️ ویرایش</button>${['super_admin','manager'].includes(state.user.role)?`<button class="mini-btn mini-del" onclick="deleteProduct('${p.id}')">🗑️ حذف</button>`:''}</td></tr>`).join('')}</table>`;
}
async function productForm(id) {
  const cats = (await api('/api/categories')).categories;
  const p = id ? (await api('/api/products/' + id)).product : null;
  openModal(`<h2>${p ? '✏️ ویرایش محصول' : '➕ محصول جدید'}</h2>
    <div class="field"><label>عنوان محصول</label><input id="pfTitle" value="${esc(p?.title||'')}"></div>
    <div class="row2"><div class="field"><label>دسته‌بندی</label><select id="pfCat">${cats.map(c=>`<option value="${c.id}" ${p?.categoryId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>قیمت (تومان)</label><input id="pfPrice" type="number" value="${p?.price||''}"></div></div>
    <div class="row2"><div class="field"><label>قیمت قبل از تخفیف (اختیاری)</label><input id="pfOld" type="number" value="${p?.oldPrice||''}"></div>
    <div class="field"><label>موجودی</label><input id="pfStock" type="number" value="${p?.stock ?? 10}"></div></div>
    <div class="field"><label>آدرس تصویر (URL)</label><input id="pfImg" value="${esc(p?.image||'')}" dir="ltr" style="text-align:left"></div>
    <div class="field"><label>توضیحات</label><textarea id="pfDesc" rows="3">${esc(p?.description||'')}</textarea></div>
    <div class="row2">
      <label class="check" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="pfFlash" ${p?.isFlash?'checked':''}> فروش فلش ⚡</label>
      <label class="check" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="pfActive" ${p?.isActive!==false?'checked':''}> فعال</label>
    </div>
    <button class="btn btn-primary w100" onclick="saveProduct('${id||''}')">💾 ذخیره محصول</button>`);
}
async function saveProduct(id) {
  const body = { title: $('pfTitle').value, categoryId: $('pfCat').value, price: +$('pfPrice').value, oldPrice: $('pfOld').value ? +$('pfOld').value : null, stock: +$('pfStock').value, image: $('pfImg').value, description: $('pfDesc').value, isFlash: $('pfFlash').checked, isActive: $('pfActive').checked };
  try {
    if (id) await api('/api/products/' + id, { method:'PUT', body: JSON.stringify(body) });
    else await api('/api/products', { method:'POST', body: JSON.stringify(body) });
    toast('محصول ذخیره شد ✅'); closeModal(); loadProducts(); renderAdminProducts();
  } catch(e) { toast(e.message, true); }
}
async function deleteProduct(id) { if (!confirm('این محصول حذف شود؟')) return; await api('/api/products/' + id, { method:'DELETE' }); toast('حذف شد'); loadProducts(); renderAdminProducts(); }

async function renderAdminCategories() {
  const d = await api('/api/categories');
  $('adminMain').innerHTML = `<h2>🗂️ دسته‌بندی‌ها</h2>
    <div class="row2"><div class="field"><label>نام دسته جدید</label><input id="newCatName" placeholder="مثلاً: کیف و کفش"></div>
    <div class="field"><label>آدرس تصویر (اختیاری)</label><input id="newCatImg" dir="ltr" style="text-align:left"></div></div>
    <button class="btn btn-primary" onclick="addCategory()">➕ افزودن دسته</button>
    <table style="margin-top:16px"><tr><th>نام</th><th>تعداد محصول</th><th>عملیات</th></tr>
    ${d.categories.map(c=>`<tr><td>${esc(c.name)}</td><td>${fmt(state.products.filter(p=>p.categoryId===c.id).length)}</td>
      <td>${state.user.role==='super_admin'?`<button class="mini-btn mini-del" onclick="deleteCategory('${c.id}')">🗑️ حذف</button>`:''}</td></tr>`).join('')}</table>`;
}
async function addCategory() {
  try { await api('/api/categories', { method:'POST', body: JSON.stringify({ name: $('newCatName').value, image: $('newCatImg').value }) }); toast('دسته اضافه شد ✅'); loadProducts(); renderAdminCategories(); }
  catch(e) { toast(e.message, true); }
}
async function deleteCategory(id) { if (!confirm('دسته حذف شود؟')) return; await api('/api/categories/' + id, { method:'DELETE' }); loadProducts(); renderAdminCategories(); }

async function renderAdminOrders() {
  const d = await api('/api/orders');
  $('adminMain').innerHTML = `<h2>📦 سفارش‌ها (${fmt(d.orders.length)})</h2>
    ${d.orders.length ? d.orders.map(o => `<div class="order-card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"><b>#${fmt(o.number)} — ${esc(o.userName)} (${esc(o.userPhone)})</b>
      <span class="status ${o.status}">${statusName(o.status)}</span></div>
      <small>کد رهگیری: ${esc(o.trackingCode)} · ${new Date(o.createdAt).toLocaleDateString('fa-IR')} · ${esc(o.address.city||'')}, ${esc(o.address.address||'')}</small>
      ${o.items.map(i=>`<div style="font-size:13px">• ${esc(i.title)} × ${fmt(i.qty)} — ${fmt(i.price*i.qty)} تومان</div>`).join('')}
      <div class="summary"><span>مبلغ نهایی: ${fmt(o.total)} تومان</span>
      <span><select onchange="setOrderStatus('${o.id}',this.value)">
        ${['pending','confirmed','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${statusName(s)}</option>`).join('')}</select></span></div>
    </div>`).join('') : '<p>هنوز سفارشی ثبت نشده است.</p>'}`;
}
async function setOrderStatus(id, status) { await api('/api/orders/' + id + '/status', { method:'PATCH', body: JSON.stringify({ status }) }); toast('وضعیت سفارش به‌روز شد ✅'); }

async function renderAdminUsers() {
  const d = await api('/api/admin/users');
  $('adminMain').innerHTML = `<h2>👥 مشتریان (${fmt(d.users.length)})</h2>
    <table><tr><th>نام</th><th>موبایل</th><th>نقش</th><th>کیف پول</th><th>امتیاز</th><th>کد معرف</th><th>عملیات</th></tr>
    ${d.users.map(u=>`<tr><td>${esc(u.name)}</td><td dir="ltr">${esc(u.phone)}</td><td><span class="role-tag ${u.role}">${roleName(u.role)}</span></td>
      <td>${fmt(u.wallet)}</td><td>${fmt(u.points)}</td><td><code>${esc(u.referralCode)}</code></td>
      <td>${u.role==='customer' ? `<button class="mini-btn ${u.isBanned?'mini-ok':'mini-del'}" onclick="banUser('${u.id}')">${u.isBanned?'رفع مسدودی':'مسدود'}</button>
      <button class="mini-btn mini-edit" onclick="adjustWallet('${u.id}')">👛 تنظیم کیف پول</button>` : ''}</td></tr>`).join('')}</table>`;
}
async function banUser(id) { await api('/api/admin/users/' + id + '/ban', { method:'PATCH' }); toast('انجام شد'); renderAdminUsers(); }
async function adjustWallet(id) {
  openModal(`<h2>👛 تنظیم کیف پول کاربر</h2>
    <div class="field"><label>مبلغ (مثبت = شارژ، منفی = برداشت)</label><input id="adjAmt" type="number" placeholder="مثلاً 100000"></div>
    <div class="field"><label>توضیح</label><input id="adjDesc" placeholder="پاداش، جبران خسارت..."></div>
    <button class="btn btn-primary w100" onclick="doAdjust('${id}')">اعمال</button>`);
}
async function doAdjust(id) {
  try { await api('/api/wallet/adjust', { method:'POST', body: JSON.stringify({ userId: id, amount: +$('adjAmt').value, description: $('adjDesc').value }) }); toast('کیف پول تنظیم شد ✅'); closeModal(); renderAdminUsers(); }
  catch(e) { toast(e.message, true); }
}

async function renderSubadmins() {
  const d = await api('/api/admin/subadmins');
  $('adminMain').innerHTML = `<h2>🛡️ زیرمدیران و دسترسی‌ها</h2>
    <div class="alert-box">مدیر کل (09037099476) همه دسترسی‌ها را دارد و می‌تواند زیرمدیر اضافه کند. پشتیبان (09961217945) می‌تواند محصول اضافه/ویرایش کند و سفارش‌ها را مدیریت کند.</div>
    <div class="row2">
      <div class="field"><label>شماره موبایل زیرمدیر</label><input id="saPhone" placeholder="09123456789" dir="ltr" style="text-align:left"></div>
      <div class="field"><label>نام</label><input id="saName" placeholder="نام زیرمدیر"></div>
    </div>
    <div class="row2">
      <div class="field"><label>نقش / سطح دسترسی</label><select id="saRole">
        <option value="support">پشتیبان — افزودن/ویرایش محصول + مدیریت سفارش</option>
        <option value="editor">ویراستار محصول — فقط محصولات</option>
        <option value="manager">مدیر فروش — محصولات، سفارش، مشتری، کد تخفیف</option>
      </select></div>
      <div class="field"><label>&nbsp;</label><button class="btn btn-primary w100" onclick="addSubadmin()">➕ افزودن زیرمدیر</button></div>
    </div>
    <table style="margin-top:16px"><tr><th>نام</th><th>موبایل</th><th>نقش</th><th>عملیات</th></tr>
    ${d.admins.map(a=>`<tr><td>${esc(a.name)}</td><td dir="ltr">${esc(a.phone)}</td><td><span class="role-tag ${a.role}">${roleName(a.role)}</span></td>
      <td>${a.phone==='09037099476' ? '<small>مدیر اصلی — قابل حذف نیست</small>' : `<button class="mini-btn mini-del" onclick="removeSubadmin('${a.id}')">حذف دسترسی</button>`}</td></tr>`).join('')}</table>`;
}
async function addSubadmin() {
  try { await api('/api/admin/subadmins', { method:'POST', body: JSON.stringify({ phone: $('saPhone').value.trim(), name: $('saName').value.trim(), role: $('saRole').value }) }); toast('زیرمدیر اضافه شد ✅'); renderSubadmins(); }
  catch(e) { toast(e.message, true); }
}
async function removeSubadmin(id) { if (!confirm('دسترسی مدیریتی این کاربر حذف شود؟')) return; await api('/api/admin/subadmins/' + id, { method:'DELETE' }); toast('حذف شد'); renderSubadmins(); }

async function renderAdminCoupons() {
  const d = await api('/api/coupons');
  $('adminMain').innerHTML = `<h2>🎟️ کدهای تخفیف</h2>
    <div class="row2">
      <div class="field"><label>کد</label><input id="cpCode" placeholder="SUMMER15" style="text-transform:uppercase"></div>
      <div class="field"><label>درصد تخفیف</label><input id="cpPct" type="number" placeholder="15"></div>
    </div>
    <div class="row2">
      <div class="field"><label>سقف تخفیف (تومان)</label><input id="cpMax" type="number" placeholder="300000"></div>
      <div class="field"><label>حداقل خرید (تومان)</label><input id="cpMin" type="number" placeholder="500000"></div>
    </div>
    <button class="btn btn-primary" onclick="addCoupon()">➕ ساخت کد تخفیف</button>
    <table style="margin-top:16px"><tr><th>کد</th><th>تخفیف</th><th>حداقل خرید</th><th>استفاده</th><th>عملیات</th></tr>
    ${d.coupons.map(c=>`<tr><td><code>${esc(c.code)}</code></td><td>${c.freeShipping?'ارسال رایگان':fmt(c.percent)+'٪'}</td><td>${fmt(c.minAmount)}</td><td>${fmt(c.usedCount)} / ${fmt(c.usageLimit)}</td>
      <td><button class="mini-btn mini-del" onclick="deleteCoupon('${c.id}')">🗑️ حذف</button></td></tr>`).join('')}</table>`;
}
async function addCoupon() {
  try { await api('/api/coupons', { method:'POST', body: JSON.stringify({ code: $('cpCode').value, percent: +$('cpPct').value, maxDiscount: +$('cpMax').value, minAmount: +$('cpMin').value }) }); toast('کد ساخته شد ✅'); renderAdminCoupons(); }
  catch(e) { toast(e.message, true); }
}
async function deleteCoupon(id) { await api('/api/coupons/' + id, { method:'DELETE' }); renderAdminCoupons(); }

async function renderAdminSettings() {
  const d = await api('/api/admin/settings'); const s = d.settings;
  $('adminMain').innerHTML = `<h2>⚙️ تنظیمات فروشگاه</h2>
    <div class="row2">
      <div class="field"><label>نام فروشگاه</label><input id="stName" value="${esc(s.siteName)}"></div>
      <div class="field"><label>هزینه ارسال (تومان)</label><input id="stShip" type="number" value="${s.shippingCost}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>حداقل خرید برای ارسال رایگان</label><input id="stFree" type="number" value="${s.freeShippingThreshold}"></div>
      <div class="field"><label>امتیاز به ازای هر ۱۰۰ هزار تومان</label><input id="stPts" type="number" value="${s.pointsPer100k}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>هدیه عضویت (کیف پول)</label><input id="stGift" type="number" value="${s.walletGiftOnSignup}"></div>
      <div class="field"><label>پاداش معرفی</label><input id="stRef" type="number" value="${s.referralBonus}"></div>
    </div>
    <button class="btn btn-primary" onclick="saveSettings()">💾 ذخیره تنظیمات</button>`;
}
async function saveSettings() {
  const body = { siteName: $('stName').value, shippingCost: +$('stShip').value, freeShippingThreshold: +$('stFree').value, pointsPer100k: +$('stPts').value, walletGiftOnSignup: +$('stGift').value, referralBonus: +$('stRef').value };
  await api('/api/admin/settings', { method:'PUT', body: JSON.stringify(body) });
  state.settings = body; toast('تنظیمات ذخیره شد ✅');
}

init();
