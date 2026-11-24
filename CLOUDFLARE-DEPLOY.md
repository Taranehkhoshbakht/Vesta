# ☁️ راهنمای استقرار روی Cloudflare (نسخه اصلاح‌شده)

> 🛠 **رفع خطای `npm ci` / `EUSAGE`:** این خطا به‌خاطر ناهم‌خوانی `package-lock.json` با `package.json` بود (و اضافه‌بودن `wrangler` در devDependencies). هر دو مشکل رفع شد و `npm ci` حالا بدون خطا اجرا می‌شود.

---

## 🚀 روش پیشنهادی: از داشبورد Cloudflare (بدون ترمینال)

### ۱️⃣ ساخت KV Namespace
1. [dash.cloudflare.com](https://dash.cloudflare.com) → منوی چپ **Storage & Databases** → **KV** → **Create a namespace**
2. نام: `DB` → **Create**

### ۲️⃣ ساخت/بازسازی Worker از روی رپو
1. **Workers & Pages** → **Create** → **Workers** → **Import a repository**
2. رپو `Taranehkhoshbakht/Vesta` را انتخاب کن
3. تنظیمات بیلد:
   - **Build command:** *(خالی بگذار)*
   - **Deploy command:** `npx wrangler deploy`
4. **Deploy** → حالا باید با موفقیت بیلد شود ✅

> اگر Worker قبلی را داری: **Settings** → **Build** → **Deploy command** را به `npx wrangler deploy` تغییر بده و **Retry deployment** بزن.

### ۳️⃣ وصل کردن KV — ⚠️ این قدم حیاتی است
بدون این قدم، Worker بالا می‌آید ولی API ارور می‌دهد.

1. Worker → **Settings** → **Variables & Bindings** (یا **Bindings**) → **Add** → **KV Namespace**
2. **Variable name:** `DB`  *(دقیقاً همین حروف بزرگ)*
3. **KV namespace:** `DB`
4. **Save and Deploy**

### ۴️⃣ تست
باز کن:
```
https://vesta.<your-subdomain>.workers.dev/api/products
```
باید JSON محصولات را ببینی. اگر ارور `KV binding "DB" تنظیم نشده است` دیدی → قدم ۳ انجام نشده.

سپس صفحه اصلی → «ورود» → `09037099476` → کد تایید → دکمه «⚙️ پنل مدیریت» ظاهر می‌شود.

---

## 💻 روش دوم: ترمینال با Wrangler

```bash
git clone https://github.com/Taranehkhoshbakht/Vesta.git
cd Vesta
npm install                       # برای لوکال: npx wrangler@4 -y
npx wrangler login
npx wrangler kv namespace create DB
# → خروجی یک id می‌دهد

# بخش [[kv_namespaces]] در wrangler.toml را از حالت کامنت خارج کن و id را بگذار:
#   [[kv_namespaces]]
#   binding = "DB"
#   id = "abc123..."

npx wrangler dev                  # تست لوکال → http://localhost:8787
npx wrangler deploy               # انتشار
```

---

## ❓ چرا Deploy command باید `npx wrangler deploy` باشد؟
Cloudflare به‌صورت خودکار تشخیص می‌دهد پروژه یک Worker است. ولی اگر `wrangler` به‌عنوان devDependency نصب باشد، ممکن است نسخه‌های مختلف با هم تداخل کنند. با `npx wrangler deploy` از نسخه‌ی خود محیط بیلد Cloudflare استفاده می‌شود که همیشه سازگار است.

---

## 🩺 عیب‌یابی خطاهای رایج

| خطا | راه‌حل |
|---|---|
| `npm ci can only install packages when package.json and package-lock.json are in sync` | ✅ رفع شد. اگر باز دیدی: `rm -rf node_modules package-lock.json && npm install` |
| `KV binding "DB" تنظیم نشده است` | KV را در Settings → Bindings با نام `DB` اضافه کن |
| `Assets binding تنظیم نشده است` | `[assets]` در `wrangler.toml` باید حفظ شود |
| صفحه سفید ولی API سالم است | `[assets] directory` باید `./public` باشد |
| `Missing wrangler from lock file` | ✅ رفع شد (wrangler از devDependencies حذف شد) |

---

## 🔐 یادآوری امنیتی
توکن GitHub که در چت فرستادی را **حتماً revoke کن**:
GitHub → Settings → Developer settings → Personal access tokens → Delete

---

## 📌 دو تغییر مهم نسبت به نسخه اول
1. **`wrangler` از devDependencies حذف شد** — دلیل اصلی خطای `npm ci`. حالا نسخه‌ی خود Cloudflare استفاده می‌شود و بیلد سبک‌تر است (به‌جای ~۴۰ بسته اضافه، فقط ۷۱ بسته اکسپرس).
2. **`[[kv_namespaces]]` در wrangler.toml کامنت شد** — چون id KV شما را ندارم و `REPLACE_WITH_YOUR_KV_ID` باعث خطای دیپلوی می‌شد. به‌جایش KV را از داشبورد با نام `DB` وصل کن.
