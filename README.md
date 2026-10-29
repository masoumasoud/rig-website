# Rezaei Industrial Group (R.I.G) website

A six-language company website (fa, en, ar, zh, de, nl) with a custom Persian admin panel, a quote-request form with drawing uploads, and an inbox wired to the site's email address.

## Development

```bash
cp .env.example .env      # set ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run db:setup          # migrations, seed content, first admin user
npm run dev               # http://localhost:3000  —  panel: /admin
```

## Structure

| Path | Contents |
|---|---|
| `src/app/[lang]/` | Public pages; Persian has no URL prefix (`src/proxy.ts`) |
| `src/app/admin/` | Admin panel (auth, inbox, content, media, settings) |
| `src/content/seed/` | Initial content for every language |
| `src/i18n/dictionaries/` | Interface text for each language |
| `src/lib/structured-data.ts` | Schema.org JSON-LD builders |
| `src/lib/inbox.ts`, `imap-worker.ts`, `mail.ts` | Form → panel → email and back |
| `src/components/fx/` | Animations: lightweight core + GSAP/physics loaded only on capable devices |
| `deploy/` | Caddy, PM2, mail server, backups |

Deployment: [DEPLOY.md](DEPLOY.md)

After changing `src/db/schema.ts`: `npm run db:generate` and then `npm run db:setup`.
