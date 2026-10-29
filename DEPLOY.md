<div dir="rtl" align="right">

# راهنمای استقرار: وب‌سایت گروه صنعتی رضایی

معماری: یک **سرور مجازی خارج از ایران** (اوبونتو ۲۴٫۰۴، دست‌کم ۲ گیگابایت رم) پشت **CDN آروان‌کلود**.
همه‌چیز روی یک سرور اجرا می‌شود: سایت Next.js (با PM2)، Caddy (برای HTTPS) و Stalwart (ایمیل). همهٔ سرویس‌ها رایگان‌اند.

```text
بازدیدکننده ─► آروان‌کلود (CDN، محافظت DDoS، کش لبه) ─► Caddy :443 ─► Next.js :3000
ایمیل مشتری ─► MX: mail.دامنه ─► Stalwart :25 ──IMAP──► صندوق پیام پنل
پاسخ از پنل ─► Brevo SMTP (رایگان، ۳۰۰ ایمیل در روز) ─► صندوق مشتری
```

در دستورها، `دامنه` را با دامنهٔ واقعی (مثل `example.ir`) و `<آدرس-مخزن>` را با آدرس مخزن گیت عوض کنید.

---

## ۱) آماده‌سازی سرور

```bash
apt update && apt install -y git sqlite3 curl debian-keyring debian-archive-keyring apt-transport-https
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm i -g pm2
# Caddy
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
# Docker (برای سرور ایمیل)
curl -fsSL https://get.docker.com | sh
```

## ۲) نصب سایت

```bash
mkdir -p /srv/rig && cd /srv/rig
git clone <آدرس-مخزن> app && cd app
cp .env.example .env && nano .env      # مقدارها را پر کنید (بخش ۶)
./deploy/deploy.sh
pm2 startup                            # اجرای خودکار بعد از ریبوت
```

برای هر به‌روزرسانی بعدی: `cd /srv/rig/app && git pull && ./deploy/deploy.sh`

## ۳) Caddy

```bash
cp deploy/Caddyfile /etc/caddy/Caddyfile
nano /etc/caddy/Caddyfile   # example.com را با دامنهٔ واقعی عوض کنید و رنج IPهای آروان را بگذارید
systemctl reload caddy
```

> در فایل، به‌جای `ARVAN_RANGES_HERE` باید فهرست رسمی IPهای آروان‌کلود را از پنل یا مستندات خودش کپی کنید. این فهرست را عمداً حدسی نگذاشته‌ام.

## ۴) تنظیمات آروان‌کلود

**DNS** (نیم‌سرورهای دامنه را به آروان منتقل کنید):

| نوع | نام | مقدار | ابر (CDN) |
|---|---|---|---|
| A | `@` | IP سرور | ✅ روشن |
| A | `www` | IP سرور | ✅ روشن |
| A | `mail` | IP سرور | ❌ **خاموش** (ایمیل از CDN رد نمی‌شود) |
| MX | `@` | `mail.دامنه` با اولویت ۱۰ | — |
| TXT | `@` | `v=spf1 include:spf.brevo.com mx ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:info@دامنه` | — |
| TXT/CNAME | DKIM | مقدارهایی که Brevo می‌دهد (بخش ۵) | — |

**SSL:** HTTPS را روشن کنید، حالت **Full (strict)** و HSTS روشن. اگر Caddy پشت آروان نتوانست گواهی بگیرد، گواهی مبدأ (origin certificate) آروان را روی Caddy بگذارید.

**کش** (آروان ← کش):

- حالت کش: **«احترام به هدرهای مبدأ»**. خود سایت هدرهای درست می‌فرستد: فایل‌های ثابت و تصاویر یک سال کش می‌شوند، ولی صفحه‌های HTML را کش Next.js نگه می‌دارد و با هر تغییر در پنل فوراً به‌روز می‌شوند.
- رشتهٔ پرس‌وجو (query string) را از کلید کش حذف نکنید (Next.js از پارامتر `_rsc` استفاده می‌کند).
- مسیرهای `/admin` و `/api` را کش نکنید (خودشان `no-store` می‌فرستند؛ برای اطمینان یک قانون عبور (bypass) هم اضافه کنید).

**فایروال:** روی سرور، پورت‌های ۸۰ و ۴۴۳ را فقط برای رنج IPهای آروان باز کنید تا IP واقعی سرور فاش نشود:

```bash
ufw allow 22,25,465,993/tcp
for ip in $(curl -s https://www.arvancloud.ir/fa/ips.txt); do ufw allow from $ip to any port 80,443 proto tcp; done
ufw enable
```

## ۵) ایمیل روی دامنهٔ خودتان (رایگان)

**الف) دریافت: Stalwart روی سرور**

```bash
mkdir -p /srv/rig/mail
docker compose -f deploy/docker-compose.mail.yml up -d
docker logs stalwart   # رمز اولیهٔ مدیر اینجا چاپ می‌شود
```

- از آدرس `https://mail.دامنه` دامنه را اضافه کنید و صندوق `info@دامنه` را بسازید.
- در تنظیمات Stalwart، **رلهٔ خروجی** را هم روی Brevo بگذارید (تا برنامهٔ ایمیل گوشی هم از همان مسیر بفرستد).
- مطمئن شوید ارائه‌دهندهٔ سرور شما پورت **ورودی** ۲۵ را باز گذاشته است (معمولاً باز است؛ پورت خروجی ۲۵ لازم نیست).
- ایمیج `stalwartlabs/stalwart:latest` است. برای پایداری، نسخهٔ مشخصی را در `deploy/docker-compose.mail.yml` ثابت کنید.

**ب) ارسال: Brevo (رایگان، ۳۰۰ ایمیل در روز)**

1. در brevo.com حساب بسازید ← بخش Senders & Domains ← دامنه را اضافه کنید و رکوردهای DKIM و DMARC داده‌شده را در DNS آروان بگذارید.
2. بخش SMTP & API ← یک کلید SMTP بسازید ← در `.env` بگذارید:
   `SMTP_HOST=smtp-relay.brevo.com`، `SMTP_USER=<ورود Brevo>`، `SMTP_PASS=<کلید SMTP>`، `MAIL_FROM=info@دامنه`

**ج) اتصال به پنل:** در `.env`:
`IMAP_HOST=127.0.0.1`، `IMAP_USER=info@دامنه`، `IMAP_PASS=<رمز صندوق>` و سپس `pm2 reload rig`.

نتیجه:

- فرم استعلام ← در «پیام‌ها»ی پنل می‌نشیند + ایمیل تأیید خودکار به مشتری + اعلان به Gmail (و بله، اگر تنظیم شده باشد).
- پاسخ از پنل ← از `info@دامنه` به مشتری می‌رسد؛ جواب مشتری به همان گفتگو در پنل برمی‌گردد.
- ایمیل‌هایی که مشتری مستقیم به `info@دامنه` بفرستد هم در پنل دیده می‌شوند.
- در صورت نیاز می‌شود `info@دامنه` را در برنامهٔ ایمیل گوشی هم اضافه کرد (IMAP روی پورت ۹۹۳ و SMTP روی ۴۶۵).

## ۶) مقدارهای اصلی `.env`

| متغیر | توضیح |
|---|---|
| `SITE_URL` | `https://دامنه` بدون `/` پایانی؛ canonical، hreflang و sitemap همه از آن ساخته می‌شوند |
| `APP_SECRET` | رشتهٔ تصادفی ۴۰ نویسه‌ای: `openssl rand -hex 20` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | اولین کاربر پنل (رمز را بعد از اولین ورود عوض کنید) |
| `INDEXNOW_KEY` | رشتهٔ تصادفی ۳۲ نویسه‌ای برای ایندکس سریع در بینگ: `openssl rand -hex 16` |
| SMTP / IMAP | بخش ۵ |

## ۷) سئو و آنالیتیکس (همه از پنل ← تنظیمات سایت)

1. **Google Tag Manager:** یک کانتینر بسازید و شناسهٔ `GTM-…` را وارد کنید. داخل GTM تگ GA4 را اضافه کنید و این رویدادها را به‌عنوان تبدیل (conversion) تعریف کنید:
   `quote_submit`، `click_call`، `click_whatsapp`، `click_telegram`، `click_email`، `file_upload`
2. **Microsoft Clarity:** یک پروژه بسازید و شناسه‌اش را وارد کنید.
3. **Google Search Console:** یک ویژگی «پیشوند آدرس» اضافه کنید ← روش «تگ HTML» ← مقدار `content` را در پنل بگذارید. بعد `https://دامنه/sitemap.xml` را ثبت کنید.
4. **Bing Webmaster:** می‌توانید از Search Console وارد کنید یا کد `msvalidate.01` را در پنل بگذارید. sitemap را ثبت کنید.
5. **Google Business Profile:** حتماً برای کارگاه یک پروفایل با **همان نام، نشانی و تلفن** سایت بسازید (برای جست‌وجوهای محلی مثل «تراشکاری CNC کرج» بسیار مؤثر است). طول و عرض جغرافیایی دقیق کارگاه را در تنظیمات سایت بگذارید.

## ۸) پشتیبان‌گیری

```bash
crontab -e
30 3 * * * /srv/rig/app/deploy/backup.sh
```

پایگاه داده، تصاویر و ایمیل‌ها ۱۴ روز در `/srv/rig/backups` نگهداری می‌شوند. گاهی یک نسخه را جای دیگری هم کپی کنید.

---

## فهرست بررسی پس از انتشار

- [ ] `https://دامنه/robots.txt`، `/sitemap.xml` و `/llms.txt` باز می‌شوند
- [ ] هر نوع صفحه در [Rich Results Test](https://search.google.com/test/rich-results) آزمایش شد
- [ ] یک استعلام آزمایشی ← در پنل دیده می‌شود + ایمیل می‌رسد
- [ ] پاسخ از پنل ← به صندوق مشتری می‌رسد (نه اسپم)؛ با mail-tester.com بررسی شود (امتیاز ۹ یا بالاتر)
- [ ] PageSpeed Insights برای موبایل صفحهٔ اصلی

</div>
