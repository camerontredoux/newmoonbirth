# New Moon Birth

Website for New Moon Birth, the doula practice of Starlee Brown. Starlee is based in Washougal, WA. She serves north Oregon and southwest Washington: Portland and Gresham, OR, and Vancouver, Camas, and Washougal, WA.

The site is the landing page for all business inquiries. It explains doula services, shows a photo gallery, and lets clients send a message, book a consultation, and get billing help.

Live site: https://newmoonbirth.com

## Status

The pages are unstyled placeholders. Only the color palette is set. The final design is still to come.

| Feature | Status |
| :-- | :-- |
| Pages and navigation | Placeholder content |
| Color palette | Done, taken from the logo |
| Contact form | Form only. It does not send yet. A Cloudflare Worker will send the email. |
| Booking | Not added. A Calendly embed goes on the Contact page. |
| Billing | Explanation only. An optional Stripe or Square invoice link goes on the Billing page. |

## Stack

- [Astro](https://docs.astro.build) for pages.
- React for interactive parts, loaded as Astro islands. An island is a component that runs in the browser while the rest of the page stays static HTML.
- Tailwind CSS v4.
- TypeScript `7.1.0-beta`.
- pnpm.
- Cloudflare Workers for hosting, through the `@astrojs/cloudflare` adapter.

## Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create a `.env` file in the project root with the Cloudflare credentials. You need these only to deploy.

   ```sh
   CLOUDFLARE_ACCOUNT_ID=...
   CLOUDFLARE_API_TOKEN=...
   ```

   Git ignores `.env`. Do not commit it.

## Commands

| Command | Action |
| :-- | :-- |
| `pnpm dev` | Starts the dev server at `localhost:4321`. |
| `pnpm check` | Type-checks all `.ts`, `.tsx`, and `.astro` files. |
| `pnpm build` | Builds the site into `dist/`. |
| `pnpm preview` | Builds the site and runs it locally in the Workers runtime. |
| `pnpm run deploy` | Builds the site and deploys it to Cloudflare. |

Use `pnpm run deploy`, not `pnpm deploy`. `pnpm deploy` is a different, built-in pnpm command.

## Project structure

```text
public/
  logo.png                 Square logo, 2000 x 2000
  logo-wide.png            Wide logo with the name beside the moon. Used in the header.
  favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
                           Moon icons cut from logo.png. site.webmanifest lists the large ones.
  contact-card.png         Contact card image. Not used on a page yet.
src/
  components/
    ContactForm.tsx        React island for the contact form
  layouts/
    Base.astro             Shared page shell: header, navigation, footer
  pages/                   One file per route
    404.astro              Page for missing URLs
    index.astro            /
    what-is-a-doula.astro  /what-is-a-doula/
    services.astro         /services/
    about.astro            /about/
    gallery.astro          /gallery/
    contact.astro          /contact/
    billing.astro          /billing/
  styles/
    global.css             Tailwind import and color palette
wrangler.jsonc             Cloudflare Worker and custom domain config
```

To add a page, create a file in `src/pages/`. Wrap its content in the `Base` layout. Then add a link to the `nav` list in `src/layouts/Base.astro`.

## Color palette

The colors come from the logo. They are Tailwind theme colors in `src/styles/global.css`, so you can use them as classes such as `bg-moon-cream` or `text-moon-navy`.

| Name | Hex | Use |
| :-- | :-- | :-- |
| `moon-cream` | `#f6f1e7` | Page background |
| `moon-sand` | `#e8dcc4` | Warm beige |
| `moon-gold` | `#c9b48a` | Muted gold accent |
| `moon-mist` | `#b9c6d6` | Pale blue |
| `moon-blue` | `#5f7ea8` | Mid blue |
| `moon-navy` | `#3b5683` | Brand navy, from the wordmark. Used for links. |
| `moon-ink` | `#26364f` | Body text |

## Type checking

`astro check` does not support TypeScript 7. This project uses the experimental `@astrojs/ts-content-mapper` package instead. It lets `tsc` type-check `.astro` files.

- `tsconfig.json` registers the mapper under `contentMappers`.
- `pnpm check` runs `tsc --noEmit --runExternalCode`. The `--runExternalCode` flag is required because the mapper runs code from `node_modules`.

If the mapper causes problems, switch to TypeScript 6 and `astro check`.

## Hosting and domain

The site runs on Cloudflare Workers as the `newmoonbirth` Worker.

- `wrangler.jsonc` attaches `newmoonbirth.com` and `www.newmoonbirth.com` as custom domains. Cloudflare creates their DNS records and HTTPS certificates.
- A Single Redirect rule in the Cloudflare dashboard sends `www.newmoonbirth.com/*` to `https://newmoonbirth.com/${1}` with a 301. It keeps the path and query string. This rule is not in the repo. To change it, open the `newmoonbirth.com` zone in the dashboard and go to **Rules**.
- The zone also has email records (MX, SPF, DKIM) for Cloudflare Email Routing. Do not remove them.

All pages are static. The build makes an assets-only Worker, so Worker code does not run yet. That changes when the site gets a server route, such as the contact form endpoint.

## SEO

- `public/robots.txt` allows all crawlers and points to the sitemap.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` at build time. It lists every page automatically.
- `site` in `astro.config.mjs` is `https://newmoonbirth.com`. The sitemap and canonical links use it.
- `trailingSlash` is `always`, so page URLs end in `/`. Write internal links with the slash, for example `/contact/`. Links without it cause an extra redirect.
- `Base.astro` adds a canonical link to every page.

## Deploys

Every push to `main` deploys the site. The GitHub Actions workflow `.github/workflows/deploy.yml` installs dependencies, runs `pnpm check`, and runs `pnpm run deploy`. It reads the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

To deploy without a push, run the workflow from the **Actions** tab, or run `pnpm run deploy` locally.

## Email DNS

The zone has a DMARC record, `_dmarc.newmoonbirth.com`, set to `v=DMARC1; p=none`. This is monitoring only. It does not change delivery. Do not change it to `quarantine` or `reject` until the reports show that all real mail passes SPF and DKIM.
