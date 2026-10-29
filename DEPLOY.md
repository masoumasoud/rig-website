# Deployment Guide: Rezaei Industrial Group Website

Architecture: **foreign VPS** (Ubuntu 24.04, at least 2GB RAM) behind **ArvanCloud CDN**.
Everything runs on a single server: the Next.js site (PM2) + Caddy (HTTPS) + Stalwart (mail). Every service is free.

```
Visitor ──► ArvanCloud (CDN, DDoS protection, edge cache) ──► Caddy :443 ──► Next.js :3000
Customer email ──► MX: mail.domain ──► Stalwart :25 ──IMAP──► panel inbox
Reply from panel ──► Brevo SMTP (free, 300/day) ──► customer's inbox
```

---

## 1) Server preparation

```bash
apt update && apt install -y git sqlite3 curl debian-keyring debian-archive-keyring apt-transport-https
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm i -g pm2
# Caddy
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
# Docker (for the mail server)
curl -fsSL https://get.docker.com | sh
```

## 2) Installing the site

```bash
mkdir -p /srv/rig && cd /srv/rig
git clone <repo-address> app && cd app
cp .env.example .env && nano .env      # fill in the values (section 6)
./deploy/deploy.sh
pm2 startup                            # auto-start after reboot
```

Every later update: `cd /srv/rig/app && git pull && ./deploy/deploy.sh`

## 3) Caddy

```bash
cp deploy/Caddyfile /etc/caddy/Caddyfile
nano /etc/caddy/Caddyfile   # replace example.com with the real domain + paste Arvan IP ranges
systemctl reload caddy
```

## 4) ArvanCloud settings

**DNS** (move the domain's nameservers to Arvan):

| Type | Name | Value | Cloud (CDN) |
|---|---|---|---|
| A | `@` | server IP | ✅ on |
| A | `www` | server IP | ✅ on |
| A | `mail` | server IP | ❌ **off** (mail can't pass through the CDN) |
| MX | `@` | `mail.domain` priority 10 | — |
| TXT | `@` | `v=spf1 include:spf.brevo.com mx ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:info@domain` | — |
| TXT/CNAME | DKIM | the values Brevo gives you (section 5) | — |

**SSL:** HTTPS enabled, mode **Full (strict)**, HSTS on. If Caddy can't get a certificate behind Arvan, put Arvan's origin certificate on Caddy.

**Caching** (Arvan → Caching):
- Cache mode: **"Respect origin headers"**. The site itself sends the right headers: static files and images get a one-year cache, while HTML pages are rendered by the Next.js cache and updated instantly by every panel change.
- Don't strip query strings from the cache key (Next.js uses the `_rsc` parameter).
- Don't cache `/admin` and `/api` (they already send no-store; for extra safety, add a bypass rule).

**Firewall:** on the server, allow ports 80/443 only from Arvan's IP ranges, so the server's real IP isn't exposed:
```bash
ufw allow 22,25,465,993/tcp
for ip in $(curl -s https://www.arvancloud.ir/fa/ips.txt); do ufw allow from $ip to any port 80,443 proto tcp; done
ufw enable
```

## 5) Email on the site's domain (free)

**a) Receiving: Stalwart on the server**
```bash
mkdir -p /srv/rig/mail
docker compose -f deploy/docker-compose.mail.yml up -d
docker logs stalwart   # the initial admin password is printed here
```
- From `https://mail.domain`, add the domain and create the mailbox `info@domain`.
- In Stalwart settings, set **outgoing relay** to Brevo too (so the phone mail app sends through the same channel).
- Make sure your VPS provider has **incoming** port 25 open (it usually is; outgoing 25 isn't needed).

**b) Sending: Brevo (free, 300 emails a day)**
1. Create an account at brevo.com → Senders & Domains → add the domain and put the given DKIM/DMARC records in Arvan DNS.
2. SMTP & API → build an SMTP key → put it in `.env`:
   `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_USER=<brevo login>`, `SMTP_PASS=<SMTP key>`, `MAIL_FROM=info@domain`

**c) Linking to the panel:** in `.env`:
`IMAP_HOST=127.0.0.1`, `IMAP_USER=info@domain`, `IMAP_PASS=<mailbox password>`, then `pm2 reload rig`.

Result:
- The quote form → appears in the panel's "Messages" + automatic confirmation email to the customer + notification to Gmail (and Bale if set up).
- Reply from the panel → reaches the customer from `info@domain`; the customer's reply comes back into the same conversation in the panel.
- Emails customers send directly to `info@domain` also show up in the panel.
- If needed, `info@domain` can be added to the phone's mail app (IMAP 993 / SMTP 465).

## 6) Main `.env` values

| Variable | Description |
|---|---|
| `SITE_URL` | `https://domain` with no trailing slash; canonical, hreflang and sitemap all come from it |
| `APP_SECRET` | random 40-character string: `openssl rand -hex 20` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first panel user (change the password after first login) |
| `INDEXNOW_KEY` | random 32-character string for fast indexing in Bing: `openssl rand -hex 16` |
| SMTP / IMAP | section 5 |

## 7) SEO and analytics setup (all from the panel → Site settings)

1. **Google Tag Manager:** build a container, enter the `GTM-…` ID. Inside GTM, add the GA4 tag and these events as conversions:
   `quote_submit`, `click_call`, `click_whatsapp`, `click_telegram`, `click_email`, `file_upload`
2. **Microsoft Clarity:** build a project, enter its ID.
3. **Google Search Console:** add a URL-prefix property → the HTML tag method → put the `content` value in the panel. Then submit `https://domain/sitemap.xml`.
4. **Bing Webmaster:** you can import from Search Console, or put the `msvalidate.01` code in the panel. Submit the sitemap.
5. **Google Business Profile:** definitely build a profile for the workshop with the exact same name, address and phone as the site (very effective for local searches like "CNC turning Karaj"). Put the workshop's exact lat/lng in Site settings.

## 8) Backups

```bash
crontab -e
30 3 * * * /srv/rig/app/deploy/backup.sh
```
The database, images, and mail are kept for 14 days in `/srv/rig/backups`. Occasionally copy a backup somewhere else as well.

## Final checklist after launch
- [ ] `https://domain/robots.txt`, `/sitemap.xml`, and `/llms.txt` open
- [ ] Every page type tested in [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] A test form submission → shows up in the panel + email arrives
- [ ] Panel reply → reaches the customer's inbox (not spam); check with mail-tester.com (score ≥ 9)
- [ ] PageSpeed Insights on mobile for the home page
