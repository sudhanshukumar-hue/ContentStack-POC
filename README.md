# Contentstack homepage POC

A Next.js site that renders a homepage, navigation, and footer from Contentstack.

The in-site write-up is at `/contentstack` locally, and on GitHub Pages at `/ContentStack-POC/contentstack/`.

## Local development

Copy `.env.example` to `.env.local` and fill in the stack API key, delivery token, environment, and region. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Mega menu

The navbar renders a full-width mega menu for every published `mega_menu` entry. An entry whose title matches a header nav item label (for example `Product`) replaces that item's dropdown; other entries are appended to the nav in `order`.

To create the content type and sample entries, add a management token (Settings > Tokens > Management Tokens, read/write) to `.env.local` as `CONTENTSTACK_MANAGEMENT_TOKEN`, then run:

```bash
npm run setup:mega-menu
```

The script is safe to re-run: it updates the content type and entries if they already exist, then publishes to `CONTENTSTACK_ENVIRONMENT`.

## Pages

`npm run setup:pages` creates a **Page** content type and publishes Product, Solutions, Customers, Pricing, About, Security, Resources, and Contact. It also points the header, footer, and mega menu at those URLs. Re-running it updates the same entries.

To add a page later, in Contentstack:

1. Entries → Page → New entry.
2. Set the URL, for example `/partners`.
3. Add sections (hero, feature grid, stats, and the other blocks).
4. Publish to the environment in `.env.local`.

Refresh the local site. A GitHub Pages build picks the new page up on the next deploy, because the static export reads published entries at build time.

## GitHub Pages

Pushes to `main` build a static export and deploy it with GitHub Actions. The Contentstack credentials are repository secrets, not files in this repo:

- `CONTENTSTACK_API_KEY`
- `CONTENTSTACK_DELIVERY_TOKEN`
- `CONTENTSTACK_ENVIRONMENT`
- `CONTENTSTACK_REGION`
