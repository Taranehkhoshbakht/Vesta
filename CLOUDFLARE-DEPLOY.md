# استقرار فروشگاه وستا روی Cloudflare

## حالت پیشنهادی MOCK — فقط فرانت‌اند، بدون دیتابیس یا بک‌اند

برای نسخه‌ی نمایشی فعلی، از **Cloudflare Pages** استفاده کنید؛ این روش فقط فایل‌های داخل `public/` را منتشر می‌کند و به Worker، KV، Node یا تنظیم API نیاز ندارد:

1. در Cloudflare از **Workers & Pages → Create → Pages → Connect to Git** مخزن را انتخاب کنید.
2. Build command را خالی بگذارید و **Build output directory** را `public` قرار دهید.
3. برنچ Production را برنچی بگذارید که نسخه‌ی نهایی را دریافت می‌کند؛ پس از merge شدن تغییرات به `main`، همان برنچ را انتخاب کنید.

ورود و خرید در این نسخه نمایشی است؛ کد تایید `12345` است و همه‌ی داده‌ها فقط در localStorage مرورگر می‌مانند. هیچ فراخوانی `/api/*` یا پرداخت واقعی انجام نمی‌شود.

## حالت Worker اختیاری (نسخه‌ی قدیمی با API و KV)

این پروژه علاوه‌بر حالت MOCK، یک **Cloudflare Worker به‌همراه Static Assets** اختیاری هم دارد. فایل Worker در `cloudflare/worker.js` و فایل‌های سایت در `public/` قرار دارند. API این Worker به KV نیاز دارد؛ اما رابط فعلی MOCK آن API را صدا نمی‌زند.

### استقرار از ترمینال

```bash
npm ci
npm run cf:dry-run       # بررسی تنظیمات و فایل‌های سایت، بدون انتشار
npx --yes wrangler@4 login
npm run cf:kv            # فقط یک‌بار: ساخت KV برای دیتابیس
npm run cf:deploy
```

بعد از اجرای `cf:kv`، Wrangler یک شناسه‌ی KV برمی‌گرداند. شناسه را در `wrangler.toml` اضافه کنید:

```toml
[[kv_namespaces]]
binding = "DB"
id = "شناسه‌ای-که-wrangler-برگرداند"
```

سپس دوباره `npm run cf:dry-run` و `npm run cf:deploy` را اجرا کنید. اگر KV را از داشبورد Cloudflare می‌سازید، آن را به Worker با نام دقیق `DB` وصل کنید و **Save and Deploy** بزنید. شناسه‌ی KV محرمانه نیست؛ اما توکن‌های Cloudflare را در فایل‌ها یا چت قرار ندهید.

## استقرار خودکار از GitHub

1. در Cloudflare از بخش **Workers & Pages**، همین Worker را به مخزن Git متصل کنید؛ مسیر پروژه را روی ریشه‌ی مخزن بگذارید.
2. **Build command** را خالی بگذارید و **Deploy command** را `npm run cf:deploy` قرار دهید.
3. **Production branch** باید همان برنچی باشد که تغییرات را در آن commit و push می‌کنید. Cloudflare تغییرات محلی یا push‌نشده را نمی‌بیند.
4. مطمئن شوید KV با نام `DB` برای Worker تنظیم شده است؛ در غیر این صورت Worker ممکن است منتشر شود، اما API فروشگاه کار نخواهد کرد.

اسکریپت‌های `cf:dev`، `cf:dry-run`، `cf:deploy` و `cf:kv` از Wrangler نسخه‌ی ۴ با `npx` استفاده می‌کنند؛ نصب Wrangler به‌عنوان dependency پروژه لازم نیست.

## بررسی انتشار

پس از Deploy این آدرس را باز کنید:

```text
https://<نام-worker>.<زیر دامنه‌ی شما>.workers.dev/api/products
```

پاسخ موفق، JSON شامل محصولات و دسته‌هاست.

## خطاهای رایج

- **`KV binding "DB" تنظیم نشده است`** — KV را با نام دقیق `DB` به Worker وصل کنید یا شناسه‌ی درست را در `wrangler.toml` بگذارید.
- **`Authentication` / `Not logged in`** — برای استقرار محلی `npx --yes wrangler@4 login` را اجرا کنید. در Git integration، اتصال Cloudflare به Git و دسترسی‌های آن را بررسی کنید؛ توکن را برای کسی نفرستید.
- **`wrangler: command not found`** — از `npm run cf:deploy` استفاده کنید؛ اسکریپت خودش Wrangler ۴ را با `npx` اجرا می‌کند.
- **انتشار انجام می‌شود ولی نسخه‌ی قبلی دیده می‌شود** — Production branch و آخرین commit موفق در بخش Deployments را بررسی کنید؛ push‌کردن به برنچ دیگری لزوماً Production را به‌روزرسانی نمی‌کند.
- **صفحه باز می‌شود ولی API کار نمی‌کند** — Binding دیتابیس `DB` را بررسی کنید. درخواست `/api/*` به Worker هدایت می‌شود و Static Assets از `public/` سرو می‌شوند.
