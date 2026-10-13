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

## GitHub Pages

Pushes to `main` build a static export and deploy it with GitHub Actions. The Contentstack credentials are repository secrets, not files in this repo:

- `CONTENTSTACK_API_KEY`
- `CONTENTSTACK_DELIVERY_TOKEN`
- `CONTENTSTACK_ENVIRONMENT`
- `CONTENTSTACK_REGION`
