# ☁️ راهنمای استقرار روی Cloudflare

پروژه روی رپو `Taranehkhoshbakht/Vesta` پوش شد. حالا برای اجرا روی Cloudflare دو راه داری:

---

## 🅰️ روش اول: از داشبورد Cloudflare (بدون نصب چیزی — ساده‌ترین)

### ۱. ساخت KV Namespace
1. وارد [dash.cloudflare.com](https://dash.cloudflare.com) شو
2. منوی چپ → **Storage & Databases** → **KV** → **Create a namespace**
3. اسمش رو بذار `DB` → Create
4. روی همون namespace کلیک کن، **Namespace ID** رو کپی کن

### ۲. ساخت Worker از گیت‌هاب
1. منوی چپ → **Workers & Pages** → **Create** → **Workers** → **Import a repository**
2. رپو `Taranehkhoshbakht/Vesta` رو انتخاب کن (اگه نمایش داده نشد، اول GitHub رو به Cloudflare وصل کن)
3. توی صفحه تنظیمات، **Build command** رو خالی بذار و **Deploy command** رو بذار:
   ```
   npx wrangler deploy
   ```
4. **Deploy** بزن

### ۳. وصل کردن KV به Worker
1. بعد از ساخت Worker → **Settings** → **Bindings** → **Add** → **KV Namespace**
2. Variable name: `DB`
3. KV namespace: همون `DB` که ساختی
4. **Save and Deploy**

✅ سایت روی `https://vesta.<subdomain>.workers.dev` بالا میاد.

> ⚠️ فایل `public/` به‌عنوان Assets سرو می‌شه و از `wrangler.toml` خونده می‌شه، پس نیازی به Build جداگانه برای فرانت‌اند نیست.

---

## 🅱️ روش دوم: از ترمینال با Wrangler (سریع‌تر و کامل‌تر)

```bash
# ۱. کلون پروژه
git clone https://github.com/Taranehkhoshbakht/Vesta.git
cd Vesta

# ۲. نصب
npm install

# ۳. ورود به Cloudflare (مرورگر باز می‌شه)
npx wrangler login

# ۴. ساخت KV
npx wrangler kv namespace create DB
# خروجی: id = "abc123..."  ← این مقدار رو کپی کن

# ۵. فایل wrangler.toml رو باز کن و جای REPLACE_WITH_YOUR_KV_ID
#    (هر دو جا: id و preview_id) همون id رو بذار

# ۶. تست لوکال
npx wrangler dev        # → http://localhost:8787

# ۷. انتشار نهایی 🚀
npx wrangler deploy
```

---

## 🔗 وصل کردن دامنه اختصاصی
1. Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**
2. دامنه‌ات رو وارد کن (N​​S دامنه باید روی Cloudflare باشه)
3. تمام — SSL خودکار فعال می‌شه

---

## ✅ چک‌لیست بعد از استقرار

| تست | انتظار |
|---|---|
| باز کردن صفحه اصلی | فروشگاه فارسی RTL با ۶ دسته و ۱۶ محصول |
| ورود با `09037099476` | دکمه «⚙️ پنل مدیریت» ظاهر می‌شه (مدیر کل) |
| ورود با `09961217945` | پنل مدیریت با دسترسی محدود (پشتیبان) |
| `/api/products` | JSON محصولات |
| ثبت سفارش تستی | افزایش موجودی/کاهش و کد رهگیری |

---

## ⚠️ نکات مهم برای محیط Production

1. **کد پیامک واقعی:** در حالت فعلی کد تایید (`demoCode`) توی پاسخ API برمی‌گرده — این برای تست خوبه ولی برای فروشگاه واقعی حتماً باید به سرویس پیامک وصل بشه. این کار در `cloudflare/worker.js` بخش `request-otp` انجام می‌شه:
   ```js
   // بعد از ساخت code، اینجا API سرویس پیامک رو صدا بزن
   // await fetch('https://api.kavenegar.com/v1/YOUR_KEY/verify/lookup.json?...')
   // و demoCode رو از پاسخ حذف کن
   ```

2. **درگاه پرداخت:** شارژ کیف پول و پرداخت آنلاین فعلاً شبیه‌سازی شده. برای واقعی شدن، به زرین‌پال/آی‌دی‌پی وصلش کن.

3. **امنیت توکن:** توکن ورود در KV ذخیره می‌شه. برای فروشگاه پرترافیک، اضافه کردن هش پسورد و rate-limit روی OTP رو پیشنهاد می‌کنم.

4. **محدودیت KV:** کل دیتابیس در یک کلید ذخیره می‌شه. برای فروشگاه کوچک/متوسط (تا چند صد سفارش در روز) کافیه. برای مقیاس بزرگ‌تر → مهاجرت به **Cloudflare D1**.

5. **نرخ نوشتن KV:** KV برای نوشتن مکرر بهینه نیست (محدودیت ~۱ نوشتن در ثانیه روی یک کلید). برای ترافیک بالا حتماً D1 یا Durable Objects استفاده کن.

---

## 📁 ساختار پروژه

```
Vesta/
├── public/              ← فرانت‌اند (HTML/CSS/JS فارسی RTL)
│   ├── index.html
│   ├── style.css        ← پالت ۶۰-۳۰-۱۰
│   └── app.js
├── cloudflare/
│   └── worker.js        ← API روی Cloudflare Workers
├── server.js            ← همان API روی Express (برای VPS/لوکال)
├── wrangler.toml        ← تنظیمات Cloudflare
├── package.json
└── README.md
```
