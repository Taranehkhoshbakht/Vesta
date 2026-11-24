/* ===================================================================
   پوشاک وستا — منطق فرانت‌اند (نسخه موبایل-فرست + PWA)
   =================================================================== */

const API = '';

const state = {
  user: null,
  token: localStorage.getItem('vesta_token') || null,
  products: [],      // لیست فعلی نمایش‌داده‌شده (بعد از فیلتر)
  allProducts: [],   // همه محصولات (برای علاقه‌مندی‌ها)
  categories: [],
  cart: JSON.parse(localStorage.getItem('vesta_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vesta_wish') || '[]'),
  activeCat: '', search: '',
  sort: 'new', minPrice: '', maxPrice: '', onlyFlash: false,
  visible: 12,
  settings: {}, walletData: null, orders: [],
  selectedProduct: null, selSize: 'M', selColor: '#5e6d8c',
  coupon: null, checkoutCoupon: null,
  adminTab: 'dashboard',
  deferredPrompt: null,
};

const ICO = {
  user: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2.2l2.5 12.4a2 2 0 0 0 2 1.6h9.1a2 2 0 0 0 2-1.6L22 7H6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3.5l5 5L8 21H3v-5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M7 3v6h9M7 21v-6h10v6"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/><circle cx="17.5" cy="15" r="1.3"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/><path d="M9 12l2 2 4-4"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a3.5 3.5 0 0 0 0 7V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a3.5 3.5 0 0 0 0-7z"/><path d="M13 5v14" stroke-dasharray="2 3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M17 5.5a3.5 3.5 0 0 1 0 7M18.5 20c0-2.5-.8-4-2-5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5L3 5l2 5 2-.8V21h10V9.2l2 .8 2-5-5-2.5-4 2.5z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5a2 2 0 0 1 2-2h4l2 2.5h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11.5 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 22.4 11a2 2 0 1 1 0 4z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>',
  install: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11M7.5 10l4.5 4.5L16.5 10"/><path d="M4 17v3h16v-3"/></svg>',
};
const fmt = n => Number(n || 0).toLocaleString('fa-IR');
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- API ---------------- */
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = 'Bearer ' + state.token;
  const r = await fetch(API + path, { ...opts, headers });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'خطایی رخ داد');
  return data;
}

/* ---------------- UI helpers ---------------- */
function toast(msg, err = false) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' err' : '');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add('hidden'), 3200);
}
function openModal(html) {
  $('modalBox').innerHTML = `<button class="close-x" onclick="closeModal()" aria-label="بستن">✕</button>` + html;
  $('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('modalOverlay').classList.add('hidden');
  $('modalBox').innerHTML = '';
  document.body.style.overflow = '';
  setActiveTab('home');
}
function openSheet(title, bodyHtml, footHtml = '') {
  $('sheetTitle').textContent = title;
  $('sheetBody').innerHTML = bodyHtml;
  $('sheetFoot').innerHTML = footHtml;
  $('sheetFoot').classList.toggle('hidden', !footHtml);
  $('bottomSheet').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  $('bottomSheet').classList.add('hidden');
  document.body.style.overflow = '';
  setActiveTab('home');
}

function saveCart() { localStorage.setItem('vesta_cart', JSON.stringify(state.cart)); updateBadges(); }
function saveWish() { localStorage.setItem('vesta_wish', JSON.stringify(state.wishlist)); updateBadges(); }

function updateBadges() {
  const c = state.cart.reduce((s, i) => s + i.qty, 0);
  $('cartCount').textContent = fmt(c);
  $('wishCount').textContent = fmt(state.wishlist.length);
  const tb = $('tabCartBadge');
  if (tb) { tb.textContent = fmt(c); tb.classList.toggle('zero', c === 0); }
}
function setActiveTab(view = 'home') {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
}

const isAdmin = () => state.user && ['super_admin', 'manager', 'support', 'editor'].includes(state.user.role);
const roleName = r => ({ super_admin: 'مدیر کل', manager: 'مدیر فروش', support: 'پشتیبان', editor: 'ویراستار محصول', customer: 'مشتری' }[r] || r);
const statusName = s => ({ pending: 'در انتظار بررسی', confirmed: 'تایید شده', shipped: 'ارسال شده', delivered: 'تحویل داده شده', cancelled: 'لغو شده' }[s] || s);
const catName = id => (state.categories.find(c => c.id === id) || {}).name || '';
const PRODUCT_FALLBACKS = {
  'cat-shoes': 'shoes', 'cat-winter': 'winter', 'cat-summer': 'summer',
  'cat-accessories': 'accessories', 'cat-women': 'women', 'cat-men': 'men',
};
function localImageFallback(item = {}) {
  const id = item.categoryId || item.id || '';
  return `/images/product-${PRODUCT_FALLBACKS[id] || 'fashion'}.svg`;
}
function imageAttrs(item = {}, priority = false) {
  const fallback = localImageFallback(item);
  return `loading="${priority ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer" ${priority ? 'fetchpriority="high"' : ''} onerror="this.onerror=null;this.src='${fallback}'"`;
}

/* ---------------- PWA ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  state.deferredPrompt = e;
  if (!localStorage.getItem('vesta_install_dismissed')) $('installBar').classList.remove('hidden');
});
async function installPWA() {
  if (!state.deferredPrompt) {
    openModal(`<h2>نصب وستا روی گوشی</h2>
      <p style="font-size:13px;color:var(--muted);line-height:2">
        <b>آیفون (Safari):</b> دکمه اشتراک‌گذاری (مربع با فلش بالا) پایین صفحه را بزنید ← «Add to Home Screen».<br><br>
        <b>اندروید (Chrome):</b> منوی سه‌نقطه <b>⋮</b> بالا ← «Install app» / «نصب برنامه».
      </p>
      <button class="btn btn-primary w100" onclick="closeModal()">متوجه شدم</button>`);
    return;
  }
  state.deferredPrompt.prompt();
  const { outcome } = await state.deferredPrompt.userChoice;
  if (outcome === 'accepted') toast('وستا نصب شد ');
  state.deferredPrompt = null;
  $('installBar').classList.add('hidden');
}
function dismissInstall() {
  $('installBar').classList.add('hidden');
  localStorage.setItem('vesta_install_dismissed', '1');
}

/* ---------------- INIT ---------------- */
async function init() {
  try {
    const s = await api('/api/settings');
    state.settings = s.settings;
    if ($('freeShipTop')) $('freeShipTop').textContent = fmt(state.settings.freeShippingThreshold);
  } catch {}
  if (state.token) {
    try { const me = await api('/api/auth/me'); state.user = me.user; }
    catch { state.token = null; localStorage.removeItem('vesta_token'); }
  }
  await loadAll();
  renderAuthArea(); updateBadges(); startCountdown();

  // اکشن‌های میان‌بر PWA
  const action = new URLSearchParams(location.search).get('action');
  if (action === 'cart') openCart();
  else if (action === 'wishlist') toggleWishlistView();
  else if (action === 'profile') openAccount();
}

async function loadAll() {
  const d = await api('/api/products');
  state.allProducts = d.products;
  state.categories = d.categories;
  renderCatNav(); renderCats();
  if (state.activeCat && !state.categories.some(c => c.id === state.activeCat)) state.activeCat = '';
  await applyFilters(false);
}

/* ---------------- ناوبری دسته‌ها ---------------- */
function renderCatNav() {
  $('catNav').innerHTML =
    `<button class="${!state.activeCat ? 'active' : ''}" onclick="setCat('')">همه</button>` +
    state.categories.map(c =>
      `<button class="${state.activeCat === c.id ? 'active' : ''}" onclick="setCat('${c.id}')">${esc(c.name)}</button>`
    ).join('');
}
function renderCats() {
  $('catGrid').innerHTML = state.categories.map((c, index) => `
    <button class="cat-card" style="background-image:url('${localImageFallback(c)}')" onclick="setCat('${c.id}')">
      <img src="${esc(c.image || localImageFallback(c))}" alt="${esc(c.name)}" ${imageAttrs(c, index < 3)}>
      <span>${esc(c.name)}</span>
    </button>`).join('');
}
const MENU_HOME = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>';
let menuReturnFocus = null;
function menuEntry(icon, label, onClick, detail = '') {
  return `<button class="menu-entry" type="button" onclick="${onClick}">
    <span class="menu-entry-icon">${icon}</span><span class="menu-entry-copy"><b>${esc(label)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span><span class="menu-entry-arrow">‹</span>
  </button>`;
}
function renderMobileMenu() {
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  $('mobileMenuNav').innerHTML = `
    <section class="mobile-menu-group" aria-label="فروشگاه">
      <b class="mobile-menu-label">فروشگاه</b>
      ${menuEntry(MENU_HOME, 'صفحه اصلی', 'closeMenu();goHome()')}
      ${menuEntry(ICO.shirt, 'مشاهده همه محصولات', 'closeMenu();scrollToProducts()')}
      ${menuEntry(ICO.heart, 'علاقه‌مندی‌ها', 'closeMenu();toggleWishlistView()', `${fmt(state.wishlist.length)} محصول`)}
      ${menuEntry(ICO.cart, 'سبد خرید', 'closeMenu();openCart()', `${fmt(cartCount)} کالا`)}
    </section>
    <section class="mobile-menu-group" aria-label="حساب کاربری">
      <b class="mobile-menu-label">حساب کاربری</b>
      ${state.user
        ? `${menuEntry(ICO.user, 'حساب کاربری من', 'closeMenu();openAccount()', state.user.name)}
           ${menuEntry(ICO.box, 'سفارش‌های من', 'closeMenu();openMyOrders()')}
           ${menuEntry(ICO.wallet, 'کیف پول', 'closeMenu();openWallet()')}
           ${menuEntry(ICO.star, 'باشگاه مشتریان', 'closeMenu();openClub()')}
           ${isAdmin() ? menuEntry(ICO.cog, 'پنل مدیریت', 'closeMenu();showView(\'admin\')') : ''}`
        : menuEntry(ICO.user, 'ورود / ثبت‌نام', 'closeMenu();openAuth()')}
    </section>
    <section class="mobile-menu-group mobile-menu-categories" aria-label="دسته‌بندی‌ها">
      <b class="mobile-menu-label">خرید بر اساس دسته</b>
      <div class="menu-category-grid">
        <button type="button" class="menu-category ${!state.activeCat ? 'selected' : ''}" data-category="" onclick="selectMenuCategory(this)">همه محصولات</button>
        ${state.categories.map(c => `<button type="button" class="menu-category ${state.activeCat === c.id ? 'selected' : ''}" data-category="${esc(c.id)}" onclick="selectMenuCategory(this)">${esc(c.name)}</button>`).join('')}
      </div>
    </section>
    <div class="mobile-menu-footer">ارسال سریع · بازگشت ۷ روزه · خرید امن</div>`;
}
function openMenu() {
  const backdrop = $('mobileMenuBackdrop');
  if (!backdrop) return;
  menuReturnFocus = document.activeElement;
  renderMobileMenu();
  backdrop.classList.remove('hidden');
  backdrop.setAttribute('aria-hidden', 'false');
  $('menuToggle').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => $('menuClose').focus());
}
function closeMenu() {
  const backdrop = $('mobileMenuBackdrop');
  if (!backdrop || backdrop.classList.contains('hidden')) return;
  backdrop.classList.add('hidden');
  backdrop.setAttribute('aria-hidden', 'true');
  $('menuToggle').setAttribute('aria-expanded', 'false');
  const stillOpen = ['modalOverlay', 'bottomSheet', 'drawerOverlay'].some(id => !$(id).classList.contains('hidden'));
  document.body.style.overflow = stillOpen ? 'hidden' : '';
  if (menuReturnFocus && menuReturnFocus.isConnected) menuReturnFocus.focus({ preventScroll: true });
  menuReturnFocus = null;
}
function selectMenuCategory(button) {
  const id = button.dataset.category || '';
  closeMenu();
  setCat(id);
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('mobileMenuBackdrop') && !$('mobileMenuBackdrop').classList.contains('hidden')) closeMenu();
});

function openCatsSheet() {
  setActiveTab('cats');
  openSheet('دسته‌بندی‌ها',
    `<div class="a-list">
      <button class="a-item" style="text-align:right;width:100%" onclick="closeSheet();setCat('')">
        <span style="color:var(--c60);display:flex">${ICO.folder}</span><span class="grow"><b>همه محصولات</b></span><span>›</span>
      </button>
      ${state.categories.map(c => `
        <button class="a-item" style="text-align:right;width:100%" onclick="closeSheet();setCat('${c.id}')">
          <img src="${esc(c.image || localImageFallback(c))}" alt="" ${imageAttrs(c)}>
          <span class="grow"><b>${esc(c.name)}</b></span><span>›</span>
        </button>`).join('')}
    </div>`);
}
function setCat(id) {
  state.activeCat = id;
  state.visible = 12;
  renderCatNav();
  applyFilters();
  $('productsSec').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function goHome() {
  setActiveTab('home');
  showView('home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showView(v) {
  const isAdminView = v === 'admin';
  if (isAdminView && !isAdmin()) return openAuth();
  $('shopView').classList.toggle('hidden', isAdminView);
  $('adminView').classList.toggle('hidden', !isAdminView);
  document.body.classList.toggle('admin-mode', isAdminView);
  setActiveTab(isAdminView ? '' : 'home');
  if (isAdminView) { renderAdminTabs(); adminTab(state.adminTab); }
  else window.scrollTo({ top: 0 });
  document.body.style.overflow = '';
}

/* ---------------- فیلتر و مرتب‌سازی ---------------- */
function setSort(s) {
  state.sort = s;
  document.querySelectorAll('#sortChips .chip').forEach(c => c.classList.toggle('active', c.dataset.sort === s));
  state.visible = 12;
  applyFilters();
}
async function applyFilters(scroll = true) {
  const q = new URLSearchParams();
  if (state.activeCat) q.set('category', state.activeCat);
  if (state.search) q.set('search', state.search);
  q.set('sort', state.sort);
  if (state.minPrice) q.set('minPrice', state.minPrice);
  if (state.maxPrice) q.set('maxPrice', state.maxPrice);
  if (state.onlyFlash) q.set('flash', '1');

  let list;
  try {
    const d = await api('/api/products?' + q.toString());
    list = d.products;
    if (d.categories) state.categories = d.categories;
  } catch { list = []; }

  state.products = list;
  state.allProducts = state.search || state.activeCat || state.onlyFlash || state.minPrice || state.maxPrice
    ? state.allProducts : list;

  const cat = state.categories.find(c => c.id === state.activeCat);
  $('productsTitle').textContent = state.search
    ? `نتایج: «${state.search}»`
    : (cat ? cat.name : 'همه محصولات');

  const hasFilter = !!(state.minPrice || state.maxPrice || state.onlyFlash);
  $('filterDot').classList.toggle('hidden', !hasFilter);

  renderProducts(); renderFlash();
  if (scroll) $('productsSec').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function doSearch() {
  state.search = $('searchInput').value.trim();
  state.visible = 12;
  applyFilters();
}
$('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); $('searchInput').blur(); } });

function openFilters() {
  const cats = `<div class="size-row" style="margin-bottom:14px">
      <button class="size-btn ${!state.activeCat ? 'sel' : ''}" onclick="pickCat(this,'')">همه</button>
      ${state.categories.map(c => `<button class="size-btn ${state.activeCat === c.id ? 'sel' : ''}" onclick="pickCat(this,'${c.id}')">${esc(c.name)}</button>`).join('')}
    </div>`;
  openSheet('فیلترها',
    `${cats}
    <div class="row2">
      <div class="field"><label>حداقل قیمت (تومان)</label><input type="number" inputmode="numeric" id="fMin" value="${state.minPrice}" placeholder="۰"></div>
      <div class="field"><label>حداکثر قیمت (تومان)</label><input type="number" inputmode="numeric" id="fMax" value="${state.maxPrice}" placeholder="۱۰۰۰۰۰۰۰"></div>
    </div>
    <label class="check"><input type="checkbox" id="fFlash" ${state.onlyFlash ? 'checked' : ''}> فقط محصولات تخفیف‌دار</label>`,
    `<button class="btn btn-outline" onclick="clearFilters()">حذف فیلترها</button>
     <button class="btn btn-primary" onclick="applyFilterSheet()">اعمال فیلتر</button>`);
}
function pickCat(el, id) {
  state.activeCat = id;
  el.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}
function applyFilterSheet() {
  state.minPrice = $('fMin').value;
  state.maxPrice = $('fMax').value;
  state.onlyFlash = $('fFlash').checked;
  state.visible = 12;
  closeSheet();
  renderCatNav();
  applyFilters();
}
function clearFilters() {
  state.activeCat = ''; state.search = ''; state.minPrice = ''; state.maxPrice = '';
  state.onlyFlash = false; state.sort = 'new'; state.visible = 12;
  $('searchInput').value = '';
  document.querySelectorAll('#sortChips .chip').forEach(c => c.classList.toggle('active', c.dataset.sort === 'new'));
  closeSheet();
  renderCatNav();
  applyFilters();
}

/* ---------------- کارت محصول ---------------- */
function offPercent(p) { return p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }

function productCard(p, index = Infinity) {
  const wished = state.wishlist.includes(p.id);
  return `<div class="pcard" onclick="openProduct('${p.id}')">
    <div class="pimg" style="background-image:url('${localImageFallback(p)}')">
      <img src="${esc(p.image || localImageFallback(p))}" alt="${esc(p.title)}" ${imageAttrs(p, index < 4)}>
      ${offPercent(p) ? `<span class="off">٪${fmt(offPercent(p))}</span>` : ''}
      <button class="wish ${wished ? 'on' : ''}" onclick="event.stopPropagation();toggleWish('${p.id}')" aria-label="علاقه‌مندی">${ICO.heart}</button>
    </div>
    <div class="pbody">
      <span class="pcat">${esc(catName(p.categoryId))}</span>
      <h3>${esc(p.title)}</h3>
      <span class="rate">${ICO.star.replace('<svg','<svg style="width:11px;height:11px;fill:currentColor"')} ${fmt(p.rating)} <span style="color:var(--muted);font-weight:400">(${fmt(p.reviewsCount)})</span></span>
      ${p.stock === 0
        ? `<span class="stock-low">ناموجود</span>`
        : (p.stock <= 5 ? `<span class="stock-low">فقط ${fmt(p.stock)} عدد باقی مانده</span>` : '')}
      <div class="price">
        ${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}
        <b>${fmt(p.price)} <small>تومان</small></b>
      </div>
      <button class="add-btn" ${p.stock === 0 ? 'disabled' : ''} onclick="event.stopPropagation();addToCart('${p.id}')">
        ${p.stock === 0 ? 'ناموجود' : 'افزودن به سبد'}
      </button>
    </div>
  </div>`;
}
function renderProducts() {
  const list = state.products.slice(0, state.visible);
  $('productGrid').innerHTML = list.length
    ? list.map((product, index) => productCard(product, index)).join('')
    : `<div class="empty">محصولی پیدا نشد<br><button class="btn btn-outline" style="margin-top:12px" onclick="clearFilters()">حذف فیلترها</button></div>`;
  const more = state.products.length > state.visible;
  $('loadMore').classList.toggle('hidden', !more);
  if (more) $('loadMore').textContent = `نمایش بیشتر (${fmt(state.products.length - state.visible)} محصول دیگر)`;
}
function loadMore() { state.visible += 12; renderProducts(); }
function renderFlash() {
  const flash = state.allProducts.filter(p => p.isFlash);
  $('flashRow').innerHTML = flash.length
    ? flash.map((product, index) => productCard(product, index)).join('')
    : '<div class="empty">فروش فلش به‌زودی...</div>';
}
function startCountdown() {
  setInterval(() => {
    const p = state.allProducts.find(x => x.isFlash && x.flashEnds);
    if (!p) { $('countdown').textContent = '--:--:--'; return; }
    const s = Math.max(0, Math.floor((p.flashEnds - Date.now()) / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor(s % 3600 / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    $('countdown').textContent = `${h}:${m}:${sec}`;
  }, 1000);
}
function scrollToProducts() { $('productsSec').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

/* ---------------- علاقه‌مندی ---------------- */
function toggleWish(id) {
  const i = state.wishlist.indexOf(id);
  if (i >= 0) state.wishlist.splice(i, 1); else state.wishlist.push(id);
  saveWish();
  renderProducts(); renderFlash();
  if (state.wishlistModalOpen) toggleWishlistView();
  toast(i >= 0 ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد');
}
async function toggleWishlistView() {
  setActiveTab('wish');
  let items = state.allProducts.filter(p => state.wishlist.includes(p.id));
  const missing = state.wishlist.filter(id => !state.allProducts.some(p => p.id === id));
  for (const id of missing) {
    try { const d = await api('/api/products/' + id); items.push(d.product); } catch {}
  }
  state.wishlistModalOpen = true;
  openModal(`<h2>علاقه‌مندی‌های من</h2>` +
    (items.length
      ? `<div class="product-grid">${items.map(productCard).join('')}</div>`
      : `<div class="empty">هنوز محصولی را نشان نکرده‌اید</div>`));
}

/* ---------------- جزئیات محصول ---------------- */
async function openProduct(id) {
  try {
    const d = await api('/api/products/' + id);
    const p = d.product;
    state.selectedProduct = p;
    state.selSize = (p.sizes || [])[1] || (p.sizes || [])[0] || 'M';
    state.selColor = (p.colors || [])[0] || '#5e6d8c';
    const off = offPercent(p);
    const reviews = d.reviews.map(r => `<div class="review">
        <span class="stars-g">${ICO.star.repeat(r.rating)}</span> <b>${esc(r.userName)}</b>
        <div>${esc(r.comment)}</div>
        <small>${new Date(r.createdAt).toLocaleDateString('fa-IR')}</small>
      </div>`).join('');

    openModal(`<div class="pdetail">
      <div><img class="main" src="${esc(p.image || localImageFallback(p))}" alt="${esc(p.title)}" ${imageAttrs(p, true)}></div>
      <div>
        <span class="pcat" style="font-size:11px;color:var(--c60);font-weight:700">${esc(catName(p.categoryId))}</span>
        <h2>${esc(p.title)}</h2>
        <div style="font-size:11.5px;color:var(--gold);font-weight:600;margin-bottom:6px">
          امتیاز ${fmt(p.rating)} · ${fmt(p.reviewsCount)} دیدگاه · ${fmt(p.soldCount || 0)} فروش
        </div>
        <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:8px 0 10px">
          ${p.oldPrice ? `<s style="color:#a0a6b5;font-size:13px">${fmt(p.oldPrice)}</s>` : ''}
          <b style="font-size:20px;color:var(--c60-dark)">${fmt(p.price)} تومان</b>
          ${off ? `<span style="background:var(--bad);color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px">٪${fmt(off)} تخفیف</span>` : ''}
        </div>
        <p style="color:var(--muted);font-size:12.5px;line-height:1.85">${esc(p.description)}</p>
        <div style="margin-top:12px"><b style="font-size:13px">سایز:</b>
          <div class="size-row">${(p.sizes || []).map(s => `<button class="size-btn ${s === state.selSize ? 'sel' : ''}" onclick="selSize('${s}',this)">${s}</button>`).join('')}</div>
        </div>
        <div><b style="font-size:13px">رنگ:</b>
          <div class="color-row">${(p.colors || []).map(c => `<button class="color-dot ${c === state.selColor ? 'sel' : ''}" style="background:${c}" onclick="selColor('${c}',this)" aria-label="رنگ"></button>`).join('')}</div>
        </div>
        <div style="margin:10px 0;font-size:12.5px">موجودی: <b>${p.stock > 0 ? fmt(p.stock) + ' عدد' : 'ناموجود'}</b></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" style="flex:1" ${p.stock === 0 ? 'disabled' : ''} onclick="addToCart('${p.id}',true)">${ICO.cart} افزودن به سبد</button>
          <button class="btn btn-outline" onclick="toggleWish('${p.id}')" aria-label="علاقه‌مندی">${ICO.heart}</button>
        </div>
        <h3 style="margin-top:18px;font-size:14px">دیدگاه‌ها (${fmt(d.reviews.length)})</h3>
        <div>${reviews || '<p style="color:var(--muted);font-size:12.5px">هنوز دیدگاهی ثبت نشده است.</p>'}</div>
        ${state.user
          ? `<div class="field" style="margin-top:12px"><label>امتیاز شما</label>
               <select id="revRating">
                 <option value="5">۵ ستاره — عالی</option>
                 <option value="4">۴ ستاره — خوب</option>
                 <option value="3">۳ ستاره — متوسط</option>
                 <option value="2">۲ ستاره — ضعیف</option>
                 <option value="1">۱ ستاره — بد</option>
               </select></div>
             <div class="field"><label>دیدگاه</label><textarea id="revText" rows="2" placeholder="نظر شما درباره این محصول..."></textarea></div>
             <button class="btn btn-ok w100" onclick="submitReview('${p.id}')">ثبت دیدگاه</button>`
          : '<p style="color:var(--muted);font-size:12.5px;margin-top:8px">برای ثبت دیدگاه وارد شوید.</p>'}
      </div>
    </div>`);
  } catch (e) { toast(e.message, true); }
}
function selSize(s, el) {
  state.selSize = s;
  el.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}
function selColor(c, el) {
  state.selColor = c;
  el.parentElement.querySelectorAll('.color-dot').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}
async function submitReview(pid) {
  try {
    await api('/api/reviews', { method: 'POST', body: JSON.stringify({ productId: pid, rating: +$('revRating').value, comment: $('revText').value }) });
    toast('دیدگاه شما ثبت شد ');
    openProduct(pid); loadAll();
  } catch (e) { toast(e.message, true); }
}

/* ---------------- سبد خرید ---------------- */
function findProduct(id) {
  return state.allProducts.find(x => x.id === id)
    || state.products.find(x => x.id === id)
    || (state.selectedProduct && state.selectedProduct.id === id ? state.selectedProduct : null);
}
function addToCart(id, fromDetail = false) {
  const p = findProduct(id);
  if (!p) return;
  if (p.stock === 0) return toast('این محصول ناموجود است', true);
  const size = fromDetail ? state.selSize : ((p.sizes || [])[1] || 'M');
  const color = fromDetail ? state.selColor : ((p.colors || [])[0] || '#5e6d8c');
  const ex = state.cart.find(i => i.productId === id && i.size === size && i.color === color);
  if (ex) {
    if (ex.qty >= p.stock) return toast('بیشتر از موجودی انبار نمی‌توانید اضافه کنید', true);
    ex.qty++;
  } else {
    state.cart.push({ productId: id, title: p.title, image: p.image, categoryId: p.categoryId, price: p.price, qty: 1, size, color });
  }
  saveCart(); renderCart();
  toast('به سبد خرید اضافه شد');
  if (!$('modalOverlay').classList.contains('hidden')) closeModal();
  if (!$('cartDrawer').classList.contains('hidden')) renderCart();
}
function changeQty(idx, d) {
  state.cart[idx].qty += d;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  saveCart(); renderCart();
}
function removeFromCart(idx) { state.cart.splice(idx, 1); saveCart(); renderCart(); }
function cartSubtotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function openCart() {
  setActiveTab('cart');
  renderCart();
  $('cartDrawer').classList.remove('hidden');
  $('drawerOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('cartDrawer').classList.add('hidden');
  $('drawerOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  setActiveTab('home');
}
function renderCart() {
  const box = $('cartItems');
  if (!state.cart.length) {
    box.innerHTML = '<div class="empty">سبد خرید شما خالی است</div>';
    $('cartFoot').innerHTML = '<button class="btn btn-primary btn-lg w100" onclick="closeCart()">شروع خرید</button>';
    return;
  }
  box.innerHTML = state.cart.map((i, idx) => `<div class="cart-item">
    <img src="${esc(i.image || localImageFallback(i))}" alt="" ${imageAttrs(i)}>
    <div style="flex:1;min-width:0">
      <b>${esc(i.title)}</b><br>
      <small>سایز ${esc(i.size)} · <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${esc(i.color)};vertical-align:middle"></span></small><br>
      <b style="color:var(--c60-dark)">${fmt(i.price * i.qty)} تومان</b>
      <div class="qty">
        <button onclick="changeQty(${idx},-1)" aria-label="کاهش">−</button>
        <span>${fmt(i.qty)}</span>
        <button onclick="changeQty(${idx},1)" aria-label="افزایش">+</button>
        <button style="border:0;background:none;color:var(--bad);margin-right:auto" onclick="removeFromCart(${idx})" aria-label="حذف"></button>
      </div>
    </div>
  </div>`).join('');

  const sub = cartSubtotal();
  const threshold = state.settings.freeShippingThreshold || 1000000;
  const pct = Math.min(100, Math.round(sub / threshold * 100));
  const remain = threshold - sub;
  $('cartFoot').innerHTML = `
    <div style="font-size:12px">${remain > 0
      ? `فقط <b>${fmt(remain)} تومان</b> تا ارسال رایگان`
      : 'ارسال این سفارش رایگان است!'}</div>
    <div class="ship-progress"><i style="width:${pct}%"></i></div>
    <div class="summary"><span>جمع اقلام</span><b>${fmt(sub)} تومان</b></div>
    <div class="summary"><span>ارسال</span><b>${sub >= threshold ? 'رایگان' : fmt(state.settings.shippingCost || 49000) + ' تومان'}</b></div>
    <button class="btn btn-primary btn-lg w100" onclick="openCheckout()">ادامه و تسویه</button>
    <button class="btn btn-outline w100" onclick="closeCart()">ادامه خرید</button>`;
}

/* ---------------- احراز هویت ---------------- */
function renderAuthArea() {
  const btn = $('authBtn');
  if (state.user) {
    btn.innerHTML = `<span class="auth-ico">${ICO.user}</span><span class="auth-txt">${esc(state.user.name.split(' ')[0] || 'حساب')}</span>`;
    btn.classList.add('logged');
    btn.onclick = openAccount;
    $('adminBtn').classList.toggle('hidden', !isAdmin());
  } else {
    btn.innerHTML = `<span class="auth-ico">${ICO.user}</span><span class="auth-txt">ورود</span>`;
    btn.classList.remove('logged');
    btn.onclick = openAuth;
    $('adminBtn').classList.add('hidden');
  }
}
let otpPhone = '';
function openAuth() {
  if (state.user) return openAccount();
  openModal(`<h2>ورود / ثبت‌نام</h2>
    <p style="color:var(--muted);font-size:12.5px;margin-bottom:12px">شماره موبایل خود را وارد کنید. کد تایید برایتان ارسال می‌شود.</p>
    <div class="field"><label>شماره موبایل</label>
      <input id="authPhone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="09123456789" dir="ltr" style="text-align:left;letter-spacing:1px"></div>
    <button class="btn btn-primary w100 btn-lg" onclick="requestOtp()">دریافت کد تایید</button>
    <div id="otpBox" class="hidden" style="margin-top:14px">
      <div class="otp-demo">کد تایید (حالت دمو — در نسخه واقعی پیامک می‌شود):<b id="demoCode">------</b></div>
      <div class="field"><label>کد تایید ۵ رقمی</label>
        <input id="otpInput" type="tel" inputmode="numeric" maxlength="5" placeholder="12345" dir="ltr" style="text-align:center;letter-spacing:8px;font-size:20px;font-weight:700"></div>
      <div class="field"><label>نام (برای ثبت‌نام جدید)</label><input id="authName" placeholder="نام و نام خانوادگی"></div>
      <div class="field"><label>کد معرف (اختیاری)</label><input id="authRef" placeholder="VESTA123" dir="ltr" style="text-align:left"></div>
      <button class="btn btn-ok w100 btn-lg" onclick="verifyOtp()">تایید و ورود</button>
      <button class="btn btn-outline w100" style="margin-top:8px" onclick="requestOtp()">ارسال مجدد کد</button>
    </div>
    <p style="font-size:11px;color:var(--muted);margin-top:14px;line-height:1.9">
      حساب‌های مدیریتی — مدیر کل: <code>09037099476</code> · پشتیبان: <code>09961217945</code>
    </p>`);
}
async function requestOtp() {
  const phone = $('authPhone').value.trim();
  if (!/^09\d{9}$/.test(phone)) return toast('شماره موبایل معتبر وارد کنید (مثل 09123456789)', true);
  try {
    const d = await api('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) });
    otpPhone = phone;
    $('otpBox').classList.remove('hidden');
    $('demoCode').textContent = d.demoCode;
    $('otpInput').focus();
    toast('کد تایید ارسال شد');
  } catch (e) { toast(e.message, true); }
}
async function verifyOtp() {
  const code = $('otpInput').value.trim();
  if (code.length < 4) return toast('کد تایید را کامل وارد کنید', true);
  try {
    const d = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: otpPhone, code, name: $('authName').value.trim(), referralCode: $('authRef').value.trim() })
    });
    state.token = d.token;
    localStorage.setItem('vesta_token', d.token);
    state.user = d.user;
    closeModal(); renderAuthArea();
    toast(d.isNew ? 'خوش آمدید! هدیه عضویت به کیف پول اضافه شد' : 'خوش برگشتید');
    if (isAdmin()) { showView('admin'); }
  } catch (e) { toast(e.message, true); }
}
async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
  state.token = null; localStorage.removeItem('vesta_token'); state.user = null;
  renderAuthArea(); closeModal(); showView('home');
  toast('خروج انجام شد');
}

/* ---------------- حساب کاربری (شیت) ---------------- */
async function openAccount() {
  setActiveTab('me');
  if (!state.user) return openAuth();
  const u = state.user;
  openSheet('حساب کاربری من',
    `<div class="profile-head" style="margin:0 0 14px">
      <b style="font-size:15px">${esc(u.name)}</b><br>
      <small style="opacity:.9">${esc(u.phone)} · ${roleName(u.role)}</small>
      <div style="margin-top:8px;display:flex;gap:16px">
        <span>کیف پول: <b>${fmt(u.wallet)}</b> تومان</span>
        <span>امتیاز: <b>${fmt(u.points)}</b></span>
      </div>
    </div>
    <div class="a-list">
      ${isAdmin() ? `<button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();showView('admin')">
        <span style="color:var(--c60);display:flex">${ICO.cog}</span><span class="grow"><b>پنل مدیریت</b><small>${roleName(u.role)}</small></span><span>›</span></button>` : ''}
      <button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();openMyOrders()">
        <span style="color:var(--c60);display:flex">${ICO.box}</span><span class="grow"><b>سفارش‌های من</b></span><span>›</span></button>
      <button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();openWallet()">
        <span style="color:var(--c60);display:flex">${ICO.wallet}</span><span class="grow"><b>کیف پول</b><small>${fmt(u.wallet)} تومان</small></span><span>›</span></button>
      <button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();openClub()">
        <span style="color:var(--c60);display:flex">${ICO.star}</span><span class="grow"><b>باشگاه مشتریان</b><small>${fmt(u.points)} امتیاز</small></span><span>›</span></button>
      <button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();toggleWishlistView()">
        <span style="color:var(--c60);display:flex">${ICO.heart}</span><span class="grow"><b>علاقه‌مندی‌ها</b><small>${fmt(state.wishlist.length)} محصول</small></span><span>›</span></button>
      <button class="a-item" style="width:100%;text-align:right" onclick="closeSheet();installPWA()">
        <span style="color:var(--c60);display:flex">${ICO.install}</span><span class="grow"><b>نصب اپلیکیشن</b><small>وستا را روی گوشی نصب کن</small></span><span>›</span></button>
    </div>
    <div class="field" style="margin-top:14px"><label>ویرایش نام</label><input id="profileName" value="${esc(u.name)}"></div>
    <button class="btn btn-ok w100" onclick="updateProfile()">${ICO.save} ذخیره نام</button>
    <button class="btn btn-danger w100" style="margin-top:8px" onclick="logout()">خروج از حساب</button>`,
    '');
}
async function updateProfile() {
  try {
    const d = await api('/api/auth/profile', { method: 'PATCH', body: JSON.stringify({ name: $('profileName').value }) });
    state.user = d.user; renderAuthArea(); toast('نام به‌روز شد ');
  } catch (e) { toast(e.message, true); }
}

/* ---------------- کیف پول / باشگاه / سفارش‌ها ---------------- */
async function openWallet() {
  if (!state.user) return openAuth();
  try {
    const w = await api('/api/wallet/me');
    state.walletData = w;
    const tx = w.transactions.map(t => `<div class="tx">
        <span>${esc(t.description)}<br><small style="color:var(--muted);font-size:10px">${new Date(t.createdAt).toLocaleDateString('fa-IR')}</small></span>
        <span class="${t.amount >= 0 ? 'plus' : 'minus'}">${t.amount >= 0 ? '+' : '−'}${fmt(Math.abs(t.amount))}</span>
      </div>`).join('') || '<p style="color:var(--muted);font-size:12.5px">تراکنشی ثبت نشده است.</p>';

    openModal(`<h2>کیف پول من</h2>
      <div class="wallet-cards">
        <div class="wcard"><b>${fmt(w.wallet)}</b><span>موجودی (تومان)</span></div>
        <div class="wcard"><b>${fmt(w.points)}</b><span>امتیاز باشگاه</span></div>
      </div>
      <div class="row2">
        <div class="field"><label>مبلغ شارژ (تومان)</label><input id="chargeAmt" type="number" inputmode="numeric" placeholder="۲۰۰۰۰۰"></div>
        <div class="field"><label>&nbsp;</label><button class="btn btn-primary w100" onclick="chargeWallet()">شارژ کیف پول</button></div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
        ${[100000, 200000, 500000, 1000000].map(a => `<button class="chip" onclick="$('chargeAmt').value=${a}">${fmt(a)}</button>`).join('')}
      </div>
      <h3 style="font-size:14px;margin-bottom:8px">تراکنش‌های اخیر</h3>${tx}`);
  } catch (e) { toast(e.message, true); }
}
async function chargeWallet() {
  const amt = +$('chargeAmt').value;
  if (!amt || amt < 10000) return toast('حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است', true);
  try {
    await api('/api/wallet/charge', { method: 'POST', body: JSON.stringify({ amount: amt }) });
    toast('کیف پول شارژ شد '); openWallet(); refreshMe();
  } catch (e) { toast(e.message, true); }
}
async function refreshMe() {
  try { const me = await api('/api/auth/me'); state.user = me.user; renderAuthArea(); } catch {}
}
async function openClub() {
  if (!state.user) return openAuth();
  try {
    const w = await api('/api/wallet/me');
    const t = w.tier;
    const next = w.points < 500 ? { at: 500, name: 'برنزی' }
      : w.points < 2000 ? { at: 2000, name: 'نقره‌ای' }
      : w.points < 5000 ? { at: 5000, name: 'طلایی' } : null;
    const pct = next ? Math.min(100, Math.round(w.points / next.at * 100)) : 100;
    openModal(`<h2>باشگاه مشتریان وستا</h2>
      <div class="profile-head">
        <b>سطح شما: ${t.name}</b> · <b>${fmt(w.points)} امتیاز</b><br>
        <small>تخفیف دائمی روی همه خریدها: <b>${t.discount}٪</b></small>
      </div>
      ${next
        ? `<p style="font-size:12.5px">تا سطح <b>${next.name}</b> فقط <b>${fmt(next.at - w.points)} امتیاز</b> فاصله داری!</p>
           <div class="ship-progress" style="margin:9px 0"><i style="width:${pct}%"></i></div>`
        : '<p style="font-size:12.5px">شما در بالاترین سطح باشگاه هستید!</p>'}
      <div class="club-tiers" style="margin:14px 0">
        <div class="tier" style="--c:#b07a4f"><b>برنزی</b><span>۵۰۰+</span><small>۱٪ تخفیف</small></div>
        <div class="tier" style="--c:#8a94a6"><b>نقره‌ای</b><span>۲۰۰۰+</span><small>۳٪ تخفیف</small></div>
        <div class="tier" style="--c:#c9a227"><b>طلایی</b><span>۵۰۰۰+</span><small>۵٪ تخفیف</small></div>
      </div>
      <p style="font-size:12px;color:var(--muted);line-height:1.9">
        با هر ۱۰۰ هزار تومان خرید، ۱۰ امتیاز می‌گیرید.<br>
        کد معرف شما: <code>${esc(w.referralCode)}</code><br>
        هر دوستی که با کد شما عضو شود، هر دو نفر <b>${fmt(state.settings.referralBonus || 30000)} تومان</b> پاداش می‌گیرید!
      </p>
      <button class="btn btn-primary w100" style="margin-top:10px" onclick="closeModal();openWallet()">مشاهده کیف پول</button>`);
  } catch (e) { toast(e.message, true); }
}
async function openMyOrders() {
  if (!state.user) return openAuth();
  try {
    const d = await api('/api/orders/my');
    const html = d.orders.length ? d.orders.map(o => `<div class="order-card">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
          <b>سفارش #${fmt(o.number)}</b><span class="status ${o.status}">${statusName(o.status)}</span>
        </div>
        <small>کد رهگیری: ${esc(o.trackingCode)} · ${new Date(o.createdAt).toLocaleDateString('fa-IR')}</small>
        ${o.items.map(i => `<div style="font-size:11.5px;margin-top:3px">• ${esc(i.title)} × ${fmt(i.qty)} — ${fmt(i.price * i.qty)} تومان</div>`).join('')}
        <div class="summary total" style="margin-top:6px"><span>مبلغ نهایی</span><b>${fmt(o.total)} تومان</b></div>
        <small>${fmt(o.pointsEarned)} امتیاز کسب کردید</small>
      </div>`).join('')
      : '<div class="empty">هنوز سفارشی ثبت نکرده‌اید</div>';
    openModal(`<h2>سفارش‌های من</h2>${html}`);
  } catch (e) { toast(e.message, true); }
}

/* ---------------- تسویه حساب ---------------- */
function openCheckout() {
  if (!state.user) { closeCart(); return openAuth(); }
  if (!state.cart.length) return;
  state.checkoutCoupon = null;
  openModal(`<h2>تسویه حساب</h2>
    <div class="row2">
      <div class="field"><label>استان</label><input id="coState" placeholder="تهران"></div>
      <div class="field"><label>شهر</label><input id="coCity" placeholder="تهران"></div>
    </div>
    <div class="field"><label>آدرس کامل</label><textarea id="coAddr" rows="2" placeholder="خیابان، کوچه، پلاک، واحد..."></textarea></div>
    <div class="row2">
      <div class="field"><label>کد پستی</label><input id="coZip" inputmode="numeric" placeholder="1234567890"></div>
      <div class="field"><label>روش پرداخت</label>
        <select id="coPay"><option value="online">پرداخت آنلاین</option><option value="cod">پرداخت در محل</option></select></div>
    </div>
    <div class="field"><label>کد تخفیف (اختیاری)</label>
      <div style="display:flex;gap:8px">
        <input id="coCoupon" placeholder="WELCOME10" style="flex:1;text-transform:uppercase">
        <button class="btn btn-outline" onclick="applyCoupon()">اعمال</button>
      </div>
      <small id="couponMsg"></small>
    </div>
    <label class="check"><input type="checkbox" id="coWallet" onchange="renderCheckoutSummary()">
      پرداخت از کیف پول (موجودی: ${fmt(state.user.wallet)} تومان)</label>
    <div id="checkoutSummary" style="margin:10px 0"></div>
    <button class="btn btn-primary btn-lg w100" onclick="placeOrder()">ثبت سفارش</button>`);
  renderCheckoutSummary();
}
async function applyCoupon() {
  const code = $('coCoupon').value.trim();
  if (!code) return;
  try {
    const d = await api('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount: cartSubtotal() }) });
    state.checkoutCoupon = { code, discount: d.discount, freeShipping: !!d.coupon.freeShipping };
    $('couponMsg').textContent = ` کد اعمال شد: ${fmt(d.discount)} تومان تخفیف`;
    $('couponMsg').style.color = 'var(--ok)';
    renderCheckoutSummary();
  } catch (e) {
    state.checkoutCoupon = null;
    $('couponMsg').textContent = ' ' + e.message;
    $('couponMsg').style.color = 'var(--bad)';
    renderCheckoutSummary();
  }
}
function renderCheckoutSummary() {
  const el = $('checkoutSummary'); if (!el) return;
  const sub = cartSubtotal();
  const threshold = state.settings.freeShippingThreshold || 1000000;
  let shipping = sub >= threshold ? 0 : (state.settings.shippingCost || 49000);
  const discount = state.checkoutCoupon?.discount || 0;
  if (state.checkoutCoupon?.freeShipping) shipping = 0;
  const walletUse = $('coWallet')?.checked ? Math.min(state.user.wallet, sub - discount + shipping) : 0;
  const total = sub - discount + shipping - walletUse;
  el.innerHTML = `<div class="summary"><span>جمع اقلام</span><b>${fmt(sub)} تومان</b></div>
    ${discount ? `<div class="summary"><span>تخفیف کد</span><b style="color:var(--ok)">−${fmt(discount)}</b></div>` : ''}
    <div class="summary"><span>ارسال</span><b>${shipping === 0 ? 'رایگان' : fmt(shipping) + ' تومان'}</b></div>
    ${walletUse ? `<div class="summary"><span>از کیف پول</span><b style="color:var(--ok)">−${fmt(walletUse)}</b></div>` : ''}
    <div class="summary total"><span>قابل پرداخت</span><b>${fmt(total)} تومان</b></div>`;
}
async function placeOrder() {
  const city = $('coCity').value.trim();
  const addr = $('coAddr').value.trim();
  if (!city || !addr) return toast('شهر و آدرس را کامل وارد کنید', true);
  const body = {
    items: state.cart.map(i => ({ productId: i.productId, qty: i.qty, size: i.size, color: i.color })),
    couponCode: state.checkoutCoupon?.code || null,
    paymentMethod: $('coPay').value,
    useWallet: $('coWallet').checked,
    address: { state: $('coState').value, city, address: addr, zip: $('coZip').value },
  };
  try {
    const d = await api('/api/orders', { method: 'POST', body: JSON.stringify(body) });
    state.cart = []; saveCart(); closeCart();
    openModal(`<div style="text-align:center;padding:16px 4px">
      <div style="width:66px;height:66px;border-radius:50%;background:var(--c30-light);display:grid;place-items:center;margin:0 auto 10px;color:var(--ok)"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg></div>
      <h2 style="padding:0">سفارش ثبت شد!</h2>
      <p style="font-size:12.5px;line-height:2.1;color:var(--muted)">
        شماره سفارش: <b style="color:var(--ink)">#${fmt(d.order.number)}</b><br>
        کد رهگیری: <code>${esc(d.order.trackingCode)}</code><br>
        مبلغ: <b style="color:var(--ink)">${fmt(d.order.total)} تومان</b><br>
        ${fmt(d.pointsEarned)} امتیاز به حساب شما اضافه شد
      </p>
      <button class="btn btn-primary w100" onclick="closeModal();openMyOrders()">مشاهده سفارش‌ها</button>
    </div>`);
    loadAll(); refreshMe();
  } catch (e) { toast(e.message, true); }
}

/* ===================================================================
   پنل مدیریت
   =================================================================== */

const ADMIN_TABS = [
  { key: 'dashboard', icon: 'chart', label: 'داشبورد', roles: ['super_admin', 'manager', 'support', 'editor'] },
  { key: 'products', icon: 'shirt', label: 'محصولات', roles: ['super_admin', 'manager', 'support', 'editor'] },
  { key: 'categories', icon: 'folder', label: 'دسته‌ها', roles: ['super_admin', 'manager'] },
  { key: 'orders', icon: 'box', label: 'سفارش‌ها', roles: ['super_admin', 'manager', 'support'] },
  { key: 'coupons', icon: 'ticket', label: 'تخفیف‌ها', roles: ['super_admin', 'manager'] },
  { key: 'users', icon: 'users', label: 'مشتریان', roles: ['super_admin', 'manager', 'support'] },
  { key: 'subadmins', icon: 'shield', label: 'زیرمدیران', roles: ['super_admin'] },
  { key: 'settings', icon: 'cog', label: 'تنظیمات', roles: ['super_admin'] },
];

function allowedTabs() {
  const role = state.user?.role;
  return ADMIN_TABS.filter(t => t.roles.includes(role));
}
function renderAdminTabs() {
  if (!state.user) return;
  $('adminRoleBadge').textContent = roleName(state.user.role);
  $('adminRoleBadge').className = 'role-tag ' + state.user.role;
  $('adminTabs').innerHTML = allowedTabs().map(t =>
    `<button class="admin-tab ${state.adminTab === t.key ? 'active' : ''}" data-tab="${t.key}" onclick="adminTab('${t.key}')">
      ${ICO[t.icon] || ''} ${t.label}</button>`).join('');
}
function adminTab(tab) {
  if (!state.user) return;
  const ok = allowedTabs().some(t => t.key === tab);
  if (!ok) tab = 'dashboard';
  state.adminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const map = {
    dashboard: renderDashboard, products: renderAdminProducts, categories: renderAdminCategories,
    orders: renderAdminOrders, coupons: renderAdminCoupons, users: renderAdminUsers,
    subadmins: renderSubadmins, settings: renderAdminSettings,
  };
  $('adminMain').innerHTML = '<div style="padding:30px;text-align:center;color:var(--muted)">در حال بارگذاری…</div>';
  (map[tab] || renderDashboard)();
}

/* ---------- داشبورد ---------- */
async function renderDashboard() {
  try {
    const s = await api('/api/admin/stats');
    const max = Math.max(...s.chart.map(c => c.sum), 1);
    $('adminMain').innerHTML = `<h2>داشبورد</h2>
      <div class="stat-grid">
        <div class="stat"><b>${fmt(s.totalSales)}</b><span>فروش کل (تومان)</span></div>
        <div class="stat"><b>${fmt(s.todaySales)}</b><span>فروش امروز</span></div>
        <div class="stat"><b>${fmt(s.ordersCount)}</b><span>سفارش‌ها (${fmt(s.pendingOrders)} در انتظار)</span></div>
        <div class="stat"><b>${fmt(s.productsCount)}</b><span>محصولات</span></div>
        <div class="stat"><b>${fmt(s.usersCount)}</b><span>مشتریان</span></div>
        <div class="stat"><b>${fmt(s.adminsCount)}</b><span>مدیران</span></div>
      </div>
      ${s.lowStock.length ? `<div class="alert-box">موجودی کم: ${s.lowStock.map(p => esc(p.title)).join('، ')}</div>` : ''}
      <h3>فروش ۷ روز اخیر</h3>
      ${s.chart.some(c => c.sum > 0)
        ? `<div class="chart">${s.chart.map(c => `<div class="bar" style="height:${Math.max(4, c.sum / max * 100)}%" title="${fmt(c.sum)}"><span>${c.label}</span></div>`).join('')}</div>`
        : '<div class="chart-empty">هنوز فروشی ثبت نشده است — نمودار پس از اولین سفارش نمایش داده می‌شود</div>'}
      <h3>پرفروش‌ترین محصولات</h3>
      <div class="a-list">
        ${s.topProducts.map(p => `<div class="a-item">
          <img src="${esc(p.image || localImageFallback(p))}" alt="" ${imageAttrs(p)}>
          <div class="grow"><b>${esc(p.title)}</b><small>${fmt(p.soldCount || 0)} فروش · موجودی ${fmt(p.stock)}</small></div>
          <b style="font-size:11.5px;white-space:nowrap">${fmt(p.price)}</b>
        </div>`).join('')}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}

/* ---------- محصولات ---------- */
async function renderAdminProducts() {
  try {
    const d = await api('/api/admin/products');
    const canDelete = ['super_admin', 'manager'].includes(state.user.role);
    $('adminMain').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">
        <h2 style="margin:0">محصولات (${fmt(d.products.length)})</h2>
        <button class="btn btn-primary btn-sm" onclick="productForm()">${ICO.plus} جدید</button>
      </div>
      <div class="a-list">
        ${d.products.map(p => `<div class="a-item">
          <img src="${esc(p.image || localImageFallback(p))}" alt="" ${imageAttrs(p)}>
          <div class="grow">
            <b>${esc(p.title)}</b>
            <small>${esc(catName(p.categoryId))} · ${fmt(p.price)} تومان · موجودی ${fmt(p.stock)}</small>
            <small><span class="status ${p.isActive !== false ? 'delivered' : 'cancelled'}">${p.isActive !== false ? 'فعال' : 'غیرفعال'}</span>${p.isFlash ? ' <span class="status shipped">فلش</span>' : ''}</small>
          </div>
          <div class="a-actions row">
            <button class="mini-btn mini-edit" onclick="productForm('${p.id}')">${ICO.edit} ویرایش</button>
            ${canDelete ? `<button class="mini-btn mini-del" onclick="deleteProduct('${p.id}')">${ICO.trash}</button>` : ''}
          </div>
        </div>`).join('') || '<div class="empty">محصولی وجود ندارد</div>'}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
async function productForm(id) {
  try {
    if (!state.categories.length) { const c = await api('/api/categories'); state.categories = c.categories; }
    const cats = state.categories;
    const p = id ? (await api('/api/products/' + id)).product : null;
    openModal(`<h2>${p ? 'ویرایش محصول' : 'محصول جدید'}</h2>
      <div class="field"><label>عنوان محصول *</label><input id="pfTitle" value="${esc(p?.title || '')}" placeholder="مثلاً کاپشن چرم مردانه"></div>
      <div class="row2">
        <div class="field"><label>دسته‌بندی</label>
          <select id="pfCat">${cats.map(c => `<option value="${c.id}" ${p?.categoryId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label>موجودی *</label><input id="pfStock" type="number" inputmode="numeric" value="${p?.stock ?? 10}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>قیمت (تومان) *</label><input id="pfPrice" type="number" inputmode="numeric" value="${p?.price || ''}"></div>
        <div class="field"><label>قیمت قبل تخفیف</label><input id="pfOld" type="number" inputmode="numeric" value="${p?.oldPrice || ''}"></div>
      </div>
      <div class="field"><label>آدرس تصویر (URL)</label><input id="pfImg" value="${esc(p?.image || '')}" dir="ltr" style="text-align:left;font-size:13px"></div>
      <div class="field"><label>توضیحات</label><textarea id="pfDesc" rows="3">${esc(p?.description || '')}</textarea></div>
      <div class="row2">
        <div class="field"><label>سایزها (با کاما)</label><input id="pfSizes" value="${esc((p?.sizes || ['S','M','L','XL']).join(', '))}"></div>
        <div class="field"><label>رنگ‌ها (کد hex با کاما)</label><input id="pfColors" value="${esc((p?.colors || ['#5e6d8c','#eacec5','#bac2d9']).join(', '))}" dir="ltr" style="text-align:left;font-size:13px"></div>
      </div>
      <label class="check"><input type="checkbox" id="pfFlash" ${p?.isFlash ? 'checked' : ''}> فروش فلش (۲۴ ساعت)</label>
      <label class="check"><input type="checkbox" id="pfActive" ${p?.isActive !== false ? 'checked' : ''}> نمایش در فروشگاه</label>
      <button class="btn btn-primary w100 btn-lg" onclick="saveProduct('${id || ''}')">${ICO.save} ذخیره محصول</button>`);
  } catch (e) { toast(e.message, true); }
}
async function saveProduct(id) {
  const title = $('pfTitle').value.trim();
  const price = +$('pfPrice').value;
  if (!title) return toast('عنوان محصول را وارد کنید', true);
  if (!price || price <= 0) return toast('قیمت معتبر وارد کنید', true);
  const body = {
    title,
    categoryId: $('pfCat').value,
    price,
    oldPrice: $('pfOld').value ? +$('pfOld').value : null,
    stock: +$('pfStock').value || 0,
    image: $('pfImg').value.trim(),
    description: $('pfDesc').value,
    sizes: $('pfSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    colors: $('pfColors').value.split(',').map(s => s.trim()).filter(Boolean),
    isFlash: $('pfFlash').checked,
    isActive: $('pfActive').checked,
  };
  try {
    if (id) await api('/api/products/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/api/products', { method: 'POST', body: JSON.stringify(body) });
    toast('محصول ذخیره شد ');
    closeModal(); await loadAll(); renderAdminProducts();
  } catch (e) { toast(e.message, true); }
}
async function deleteProduct(id) {
  if (!confirm('این محصول حذف شود؟ این عمل قابل بازگشت نیست.')) return;
  try { await api('/api/products/' + id, { method: 'DELETE' }); toast('محصول حذف شد'); await loadAll(); renderAdminProducts(); }
  catch (e) { toast(e.message, true); }
}

/* ---------- دسته‌بندی‌ها ---------- */
async function renderAdminCategories() {
  try {
    const d = await api('/api/admin/products');
    state.categories = (await api('/api/categories')).categories;
    const canDelete = state.user.role === 'super_admin';
    $('adminMain').innerHTML = `
      <h2>دسته‌بندی‌ها</h2>
      <button class="btn btn-primary w100" style="margin-bottom:14px" onclick="categoryForm()">${ICO.plus} دسته جدید</button>
      <div class="a-list">
        ${state.categories.map(c => {
          const count = d.products.filter(p => p.categoryId === c.id).length;
          return `<div class="a-item">
            ${c.image ? `<img src="${esc(c.image)}" alt="" ${imageAttrs(c)}>` : `<span style="width:46px;height:46px;border-radius:9px;background:var(--c30-light);color:var(--c60);display:grid;place-items:center">${ICO.folder}</span>`}
            <div class="grow"><b>${esc(c.name)}</b><small>${fmt(count)} محصول</small></div>
            <div class="a-actions row">
              <button class="mini-btn mini-edit" onclick="categoryForm('${c.id}')">${ICO.edit}</button>
              ${canDelete ? `<button class="mini-btn mini-del" onclick="deleteCategory('${c.id}')">${ICO.trash}</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
function categoryForm(id) {
  const c = id ? state.categories.find(x => x.id === id) : null;
  openModal(`<h2>${c ? 'ویرایش دسته' : 'دسته جدید'}</h2>
    <div class="field"><label>نام دسته *</label><input id="cfName" value="${esc(c?.name || '')}" placeholder="مثلاً کیف و کفش"></div>
    <div class="field"><label>آدرس تصویر</label><input id="cfImg" value="${esc(c?.image || '')}" dir="ltr" style="text-align:left;font-size:13px"></div>
    <div class="field"><label>توضیح کوتاه</label><input id="cfDesc" value="${esc(c?.description || '')}"></div>
    <button class="btn btn-primary w100 btn-lg" onclick="saveCategory('${id || ''}')">${ICO.save} ذخیره</button>`);
}
async function saveCategory(id) {
  const name = $('cfName').value.trim();
  if (!name) return toast('نام دسته را وارد کنید', true);
  const body = { name, image: $('cfImg').value.trim(), description: $('cfDesc').value.trim() };
  try {
    if (id) await api('/api/categories/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/api/categories', { method: 'POST', body: JSON.stringify(body) });
    toast('دسته ذخیره شد '); closeModal(); await loadAll(); renderAdminCategories();
  } catch (e) { toast(e.message, true); }
}
async function deleteCategory(id) {
  if (!confirm('این دسته حذف شود؟')) return;
  try { await api('/api/categories/' + id, { method: 'DELETE' }); toast('حذف شد'); await loadAll(); renderAdminCategories(); }
  catch (e) { toast(e.message, true); }
}

/* ---------- سفارش‌ها ---------- */
async function renderAdminOrders() {
  try {
    const d = await api('/api/orders');
    $('adminMain').innerHTML = `<h2>سفارش‌ها (${fmt(d.orders.length)})</h2>
      ${d.orders.length ? d.orders.map(o => `<div class="order-card">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">
          <b>#${fmt(o.number)} — ${esc(o.userName)}</b>
          <span class="status ${o.status}">${statusName(o.status)}</span>
        </div>
        <small>تلفن: ${esc(o.userPhone)} · ${new Date(o.createdAt).toLocaleDateString('fa-IR')}<br>
          آدرس: ${esc(o.address?.state || '')} ${esc(o.address?.city || '')} — ${esc(o.address?.address || '')}<br>
          کد رهگیری: ${esc(o.trackingCode)}</small>
        ${o.items.map(i => `<div style="font-size:11.5px;margin-top:3px">• ${esc(i.title)} × ${fmt(i.qty)} (${esc(i.size)}) — ${fmt(i.price * i.qty)}</div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:9px;flex-wrap:wrap">
          <b style="font-size:12.5px">${fmt(o.total)} تومان</b>
          <select onchange="setOrderStatus('${o.id}',this.value)" style="padding:7px 10px;border-radius:9px;border:1.5px solid #e6e8ee;font-size:12px;background:#fafbfc">
            ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusName(s)}</option>`).join('')}
          </select>
        </div>
      </div>`).join('') : '<div class="empty">هنوز سفارشی ثبت نشده است</div>'}`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
async function setOrderStatus(id, status) {
  try { await api('/api/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }); toast('وضعیت به‌روز شد '); }
  catch (e) { toast(e.message, true); renderAdminOrders(); }
}

/* ---------- کدهای تخفیف (کامل با ویرایش) ---------- */
async function renderAdminCoupons() {
  try {
    const d = await api('/api/coupons');
    $('adminMain').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">
        <h2 style="margin:0">کدهای تخفیف (${fmt(d.coupons.length)})</h2>
        <button class="btn btn-primary btn-sm" onclick="couponForm()">${ICO.plus} جدید</button>
      </div>
      <div class="a-list">
        ${d.coupons.map(c => `<div class="a-item col">
          <div style="display:flex;gap:9px;align-items:flex-start">
            <span style="width:40px;height:40px;border-radius:9px;background:var(--c30-light);color:var(--c60);display:grid;place-items:center;flex-shrink:0">${ICO.ticket}</span>
            <div class="grow">
              <b style="font-family:monospace;direction:ltr;text-align:left;font-size:13px;letter-spacing:.5px">${esc(c.code)}</b>
              <small>${c.freeShipping ? 'ارسال رایگان' : `${fmt(c.percent)}٪ تخفیف`}${c.maxDiscount ? ` · سقف ${fmt(c.maxDiscount)}` : ''}</small>
              <small>حداقل خرید ${fmt(c.minAmount)} · ${fmt(c.usedCount)}/${fmt(c.usageLimit)} استفاده</small>
              <small><span class="status ${c.isActive ? 'delivered' : 'cancelled'}">${c.isActive ? 'فعال' : 'غیرفعال'}</span></small>
            </div>
          </div>
          <div class="a-actions">
            <button class="mini-btn mini-edit" onclick="couponForm('${c.id}')">${ICO.edit} ویرایش</button>
            <button class="mini-btn ${c.isActive ? '' : 'mini-ok'}" style="${c.isActive ? 'background:#f2f3f6;color:#6b7386' : ''}" onclick="toggleCoupon('${c.id}')">${c.isActive ? ICO.pause + ' غیرفعال' : ICO.play + ' فعال'}</button>
            <button class="mini-btn mini-del" onclick="deleteCoupon('${c.id}')">${ICO.trash}</button>
          </div>
        </div>`).join('') || '<div class="empty">کد تخفیفی وجود ندارد</div>'}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
function couponForm(id) {
  const c = id ? (state._coupons || []).find(x => x.id === id) : null;
  // اگر کش نداریم، از DOM مقدار نمی‌گیریم؛ مجدد از سرور می‌خوانیم
  if (id && !c) return loadCouponAndEdit(id);
  openCouponEditor(c, id);
}
async function loadCouponAndEdit(id) {
  try {
    const d = await api('/api/coupons');
    state._coupons = d.coupons;
    openCouponEditor(d.coupons.find(x => x.id === id), id);
  } catch (e) { toast(e.message, true); }
}
function openCouponEditor(c, id) {
  openModal(`<h2>${c ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}</h2>
    <div class="field"><label>کد تخفیف *</label>
      <input id="cfCode" value="${esc(c?.code || '')}" placeholder="SUMMER15" dir="ltr" style="text-align:left;text-transform:uppercase;font-family:monospace;letter-spacing:1px"></div>
    <label class="check"><input type="checkbox" id="cfFree" ${c?.freeShipping ? 'checked' : ''}> این کد ارسال رایگان می‌دهد</label>
    <div class="row2">
      <div class="field"><label>درصد تخفیف</label><input id="cfPct" type="number" inputmode="numeric" value="${c?.percent ?? ''}" placeholder="15"></div>
      <div class="field"><label>سقف تخفیف (تومان)</label><input id="cfMax" type="number" inputmode="numeric" value="${c?.maxDiscount || ''}" placeholder="300000"></div>
    </div>
    <div class="row2">
      <div class="field"><label>حداقل مبلغ خرید (تومان)</label><input id="cfMin" type="number" inputmode="numeric" value="${c?.minAmount || ''}" placeholder="500000"></div>
      <div class="field"><label>سقف تعداد استفاده</label><input id="cfLimit" type="number" inputmode="numeric" value="${c?.usageLimit ?? 1000}"></div>
    </div>
    <label class="check"><input type="checkbox" id="cfActive" ${c?.isActive !== false ? 'checked' : ''}> کد فعال باشد</label>
    ${c ? `<div class="alert-box">تا حالا ${fmt(c.usedCount)} بار استفاده شده است.</div>` : ''}
    <button class="btn btn-primary w100 btn-lg" onclick="saveCoupon('${id || ''}')">${ICO.save} ذخیره</button>`);
}
async function saveCoupon(id) {
  const code = $('cfCode').value.trim().toUpperCase();
  if (!code) return toast('کد تخفیف را وارد کنید', true);
  const freeShipping = $('cfFree').checked;
  const percent = +$('cfPct').value || 0;
  if (!freeShipping && percent <= 0) return toast('درصد تخفیف را وارد کنید یا ارسال رایگان را بزنید', true);
  const body = {
    code,
    percent,
    maxDiscount: +$('cfMax').value || 0,
    minAmount: +$('cfMin').value || 0,
    usageLimit: +$('cfLimit').value || 1000,
    isActive: $('cfActive').checked,
    freeShipping,
  };
  try {
    if (id) await api('/api/coupons/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/api/coupons', { method: 'POST', body: JSON.stringify(body) });
    toast('کد تخفیف ذخیره شد ');
    closeModal(); state._coupons = null; renderAdminCoupons();
  } catch (e) { toast(e.message, true); }
}
async function toggleCoupon(id) {
  try {
    const d = await api('/api/coupons');
    const c = d.coupons.find(x => x.id === id);
    if (!c) return;
    await api('/api/coupons/' + id, { method: 'PUT', body: JSON.stringify({ isActive: !c.isActive }) });
    toast(c.isActive ? 'کد غیرفعال شد' : 'کد فعال شد ');
    state._coupons = null; renderAdminCoupons();
  } catch (e) { toast(e.message, true); }
}
async function deleteCoupon(id) {
  if (!confirm('این کد تخفیف حذف شود؟')) return;
  try { await api('/api/coupons/' + id, { method: 'DELETE' }); toast('حذف شد'); state._coupons = null; renderAdminCoupons(); }
  catch (e) { toast(e.message, true); }
}

/* ---------- مشتریان ---------- */
async function renderAdminUsers() {
  try {
    const d = await api('/api/admin/users');
    const canManage = ['super_admin', 'manager'].includes(state.user.role);
    $('adminMain').innerHTML = `<h2>کاربران (${fmt(d.users.length)})</h2>
      <div class="a-list">
        ${d.users.map(u => `<div class="a-item" style="align-items:flex-start">
          <span style="width:42px;height:42px;border-radius:50%;background:var(--c30-light);color:var(--c60);display:grid;place-items:center;flex-shrink:0">${ICO.user}</span>
          <div class="grow">
            <b>${esc(u.name)}</b>
            <small dir="ltr" style="display:block;text-align:right">${esc(u.phone)}</small>
            <small>کیف پول ${fmt(u.wallet)} · ${fmt(u.points)} امتیاز · کد معرف <code>${esc(u.referralCode)}</code></small>
            <small><span class="role-tag ${u.role}">${roleName(u.role)}</span>${u.isBanned ? ' <span class="status cancelled">مسدود</span>' : ''}</small>
          </div>
          ${canManage && u.role === 'customer' ? `<div class="a-actions">
            <button class="mini-btn mini-edit" onclick="adjustWallet('${u.id}')">${ICO.wallet}</button>
            <button class="mini-btn ${u.isBanned ? 'mini-ok' : 'mini-del'}" onclick="banUser('${u.id}')">${u.isBanned ? ICO.refresh : ICO.pause}</button>
          </div>` : ''}
        </div>`).join('')}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
async function banUser(id) {
  try { await api('/api/admin/users/' + id + '/ban', { method: 'PATCH' }); toast('انجام شد'); renderAdminUsers(); }
  catch (e) { toast(e.message, true); }
}
function adjustWallet(id) {
  openModal(`<h2>تنظیم کیف پول کاربر</h2>
    <div class="field"><label>مبلغ (مثبت = شارژ، منفی = برداشت)</label>
      <input id="adjAmt" type="number" inputmode="numeric" placeholder="100000"></div>
    <div class="field"><label>توضیح</label><input id="adjDesc" placeholder="پاداش، جبران خسارت..."></div>
    <button class="btn btn-primary w100" onclick="doAdjust('${id}')">اعمال</button>`);
}
async function doAdjust(id) {
  const amount = +$('adjAmt').value;
  if (!amount) return toast('مبلغ را وارد کنید', true);
  try {
    await api('/api/wallet/adjust', { method: 'POST', body: JSON.stringify({ userId: id, amount, description: $('adjDesc').value }) });
    toast('کیف پول تنظیم شد '); closeModal(); renderAdminUsers();
  } catch (e) { toast(e.message, true); }
}

/* ---------- زیرمدیران ---------- */
async function renderSubadmins() {
  try {
    const d = await api('/api/admin/subadmins');
    $('adminMain').innerHTML = `<h2>زیرمدیران</h2>
      <div class="alert-box">
        <b>مدیر کل</b> (09037099476) همه دسترسی‌ها را دارد و می‌تواند زیرمدیر اضافه کند.<br>
        <b>پشتیبان</b> (09961217945) محصول اضافه/ویرایش می‌کند و سفارش‌ها را مدیریت می‌کند.
      </div>
      <button class="btn btn-primary w100" style="margin-bottom:14px" onclick="subadminForm()">${ICO.plus} افزودن زیرمدیر</button>
      <div class="a-list">
        ${d.admins.map(a => `<div class="a-item">
          <span style="width:42px;height:42px;border-radius:50%;background:var(--c60);color:#fff;display:grid;place-items:center;flex-shrink:0">${ICO.shield}</span>
          <div class="grow"><b>${esc(a.name)}</b>
            <small dir="ltr" style="display:block;text-align:right">${esc(a.phone)}</small>
            <small><span class="role-tag ${a.role}">${roleName(a.role)}</span></small>
          </div>
          ${a.phone === '09037099476'
            ? '<small style="color:var(--muted);white-space:nowrap">مدیر اصلی</small>'
            : `<button class="mini-btn mini-del" onclick="removeSubadmin('${a.id}')">حذف</button>`}
        </div>`).join('')}
      </div>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
function subadminForm() {
  openModal(`<h2>افزودن زیرمدیر</h2>
    <div class="field"><label>شماره موبایل *</label><input id="saPhone" type="tel" inputmode="numeric" placeholder="09123456789" dir="ltr" style="text-align:left"></div>
    <div class="field"><label>نام</label><input id="saName" placeholder="نام زیرمدیر"></div>
    <div class="field"><label>سطح دسترسی</label>
      <select id="saRole">
        <option value="support">پشتیبان — محصولات + سفارش‌ها + مشتریان</option>
        <option value="editor">ویراستار محصول — فقط محصولات</option>
        <option value="manager">مدیر فروش — محصولات، سفارش، مشتری، تخفیف، دسته‌ها</option>
      </select></div>
    <button class="btn btn-primary w100 btn-lg" onclick="addSubadmin()">${ICO.plus} افزودن</button>`);
}
async function addSubadmin() {
  const phone = $('saPhone').value.trim();
  if (!/^09\d{9}$/.test(phone)) return toast('شماره موبایل معتبر وارد کنید', true);
  try {
    await api('/api/admin/subadmins', { method: 'POST', body: JSON.stringify({ phone, name: $('saName').value.trim(), role: $('saRole').value }) });
    toast('زیرمدیر اضافه شد '); closeModal(); renderSubadmins();
  } catch (e) { toast(e.message, true); }
}
async function removeSubadmin(id) {
  if (!confirm('دسترسی مدیریتی این کاربر حذف شود؟')) return;
  try { await api('/api/admin/subadmins/' + id, { method: 'DELETE' }); toast('حذف شد'); renderSubadmins(); }
  catch (e) { toast(e.message, true); }
}

/* ---------- تنظیمات ---------- */
async function renderAdminSettings() {
  try {
    const d = await api('/api/admin/settings');
    const s = d.settings;
    $('adminMain').innerHTML = `<h2>تنظیمات فروشگاه</h2>
      <div class="field"><label>نام فروشگاه</label><input id="stName" value="${esc(s.siteName)}"></div>
      <div class="row2">
        <div class="field"><label>هزینه ارسال (تومان)</label><input id="stShip" type="number" inputmode="numeric" value="${s.shippingCost}"></div>
        <div class="field"><label>حداقل خرید ارسال رایگان</label><input id="stFree" type="number" inputmode="numeric" value="${s.freeShippingThreshold}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>امتیاز هر ۱۰۰ هزار تومان</label><input id="stPts" type="number" inputmode="numeric" value="${s.pointsPer100k}"></div>
        <div class="field"><label>هدیه عضویت (کیف پول)</label><input id="stGift" type="number" inputmode="numeric" value="${s.walletGiftOnSignup}"></div>
      </div>
      <div class="field"><label>پاداش معرفی دوستان</label><input id="stRef" type="number" inputmode="numeric" value="${s.referralBonus}"></div>
      <div class="field"><label>شماره پشتیبانی</label><input id="stPhone" value="${esc(s.supportPhone || '')}" dir="ltr" style="text-align:left"></div>
      <button class="btn btn-primary w100 btn-lg" onclick="saveSettings()">${ICO.save} ذخیره تنظیمات</button>`;
  } catch (e) { $('adminMain').innerHTML = `<div class="alert-box">${esc(e.message)}</div>`; }
}
async function saveSettings() {
  const body = {
    siteName: $('stName').value,
    shippingCost: +$('stShip').value,
    freeShippingThreshold: +$('stFree').value,
    pointsPer100k: +$('stPts').value,
    walletGiftOnSignup: +$('stGift').value,
    referralBonus: +$('stRef').value,
    supportPhone: $('stPhone').value,
  };
  try {
    await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) });
    state.settings = { ...state.settings, ...body };
    if ($('freeShipTop')) $('freeShipTop').textContent = fmt(body.freeShippingThreshold);
    toast('تنظیمات ذخیره شد ');
  } catch (e) { toast(e.message, true); }
}

/* ---------------- start ---------------- */
init();
