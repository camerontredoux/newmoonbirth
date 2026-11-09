# New Moon Birth

Website for New Moon Birth, the doula practice of Starlee Brown. Starlee is based in Washougal, WA. She serves north Oregon and southwest Washington: Portland and Gresham, OR, and Vancouver, Camas, and Washougal, WA.

The site is the landing page for all business inquiries. It explains doula services and pricing, and lets clients send a message and book a consultation.

Live site: https://newmoonbirth.com

## Status

The home page, header, and footer are designed. The other pages are unstyled placeholders inside the shared header and footer.

| Feature | Status |
| :-- | :-- |
| Home page | Designed. Copy is a draft for Starlee to review. Photos are stock stand-ins. |
| Other pages | What is a doula, Services, and Contact are designed, with copy from Starlee's brochure. The package price is a sliding scale (`packagePrice` in `src/lib/price.ts`). |
| Navigation | Done. Below 1280px wide, a **Menu** button opens a full-screen menu. |
| Color palette | Done, taken from the logo |
| Contact form | Posts to `/api/contact/`, which checks a honeypot field and Cloudflare Turnstile, then emails Starlee through Cloudflare Email Sending. Production needs the Worker secrets below. |
| Booking | Visitors book a free consultation through the contact form. |
| Billing | Removed. `/billing/` redirects to Services, which shows the price. |

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

3. For the contact form under `pnpm dev`, copy `.dev.vars.example` to `.dev.vars`. It holds Turnstile's test secret, the hostname the test secret reports, and the address messages go to. In `pnpm dev`, the Worker logs each email to the console instead of sending it.

   Production needs two Worker secrets, set with `pnpm exec wrangler secret put <NAME>`:

   - `TURNSTILE_SECRET_KEY`: the secret of the Turnstile widget for newmoonbirth.com. Its public site key is in `src/lib/contact.ts`.
   - `CONTACT_EMAIL_TO`: the address messages go to, `starlee@newmoonbirth.com`. newmoonbirth.com is onboarded to Cloudflare Email Sending, which needs the Workers Paid plan. Without it, Cloudflare sends only to verified Email Routing destinations, such as the Gmail address that `starlee@` forwards to.

   After changing `wrangler.jsonc`, run `pnpm generate-types` to update `worker-configuration.d.ts`.

## Commands

| Command | Action |
| :-- | :-- |
| `pnpm dev` | Starts the dev server at `localhost:4321`. |
| `pnpm check` | Generates Astro types, then type-checks all `.ts`, `.tsx`, and `.astro` files. |
| `pnpm build` | Builds the site into `dist/`. |
| `pnpm preview` | Builds the site and runs it locally in the Workers runtime. |
| `pnpm run deploy` | Builds the site and deploys it to Cloudflare. |

Use `pnpm run deploy`, not `pnpm deploy`. `pnpm deploy` is a different, built-in pnpm command.

## Project structure

```text
public/
  logo.png                 Square logo, 2000 x 2000
  logo-wide.png            Wide logo with the name beside the moon. Not used on a page.
  brand/wordmark.svg       "NEW MOON BIRTH" traced from logo.png into a vector mask. The header and footer use it.
  favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
                           Moon icons cut from logo.png. site.webmanifest lists the large ones.
  contact-card.png         Contact card image. Not used on a page yet.
  og-image.png             Share image for Facebook, X, and other link previews, 1200 x 630. It is logo-wide.png with a margin.
src/
  assets/
    moon-mark.png          Moon cut from logo.png with a transparent background, trimmed. The header and menu show it beside the wordmark
    photos/                Stock photos. SOURCES.md lists where each one came from.
  components/
    ContactForm.tsx        React island for the contact form
    SiteHeader.astro       Site header: transparent over a hero, or white and sticky
  layouts/
    Base.astro             Shared page shell: header, mobile menu, footer. A page that fills the `hero` slot gets a transparent header over the hero that fades out once the page scrolls, and a white header that fades in after the hero. On other pages the white header is sticky.
  pages/                   One file per route
    404.astro              Page for missing URLs
    index.astro            /
    what-is-a-doula.astro  /what-is-a-doula/
    services.astro         /services/
    contact.astro          /contact/
  styles/
    global.css             Tailwind import, color palette, fonts, and shared utilities
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

## Fonts

Astro's font loader downloads the fonts from Google Fonts at build time and serves them from the site. `astro.config.mjs` lists them.

| Tailwind class | Font | Use |
| :-- | :-- | :-- |
| `font-display` | Gilda Display | Headings |
| `font-script` | Corinthia | Single script words inside headings. Use the `script` class. |
| `font-sans` | Jost, weights 300 to 500 | Body text, buttons, and navigation |

`global.css` also defines these utilities:

- `script`: sets a word in Corinthia at the right size inside a heading.
- `caps`: small, spaced capitals for labels, buttons, and navigation.
- `button-solid`, `button-light`, `button-outline`: the three button styles.
- `wordmark`: shows the logo wordmark in the current text color.

## Images

Put photos in `src/assets/` and use Astro's `<Picture>` or `<Image>` component. The build makes AVIF and WebP copies at several widths with sharp. `astro.config.mjs` sets `imageService: 'compile'` for this, because every page is static.

## Type checking

`astro check` does not support TypeScript 7. This project uses the experimental `@astrojs/ts-content-mapper` package instead. It lets `tsc` type-check `.astro` files.

- `tsconfig.json` registers the mapper under `contentMappers`.
- `pnpm check` runs `astro sync`, then `tsc --noEmit --runExternalCode`. `astro sync` creates `.astro/types.d.ts`, which is gitignored, so a fresh clone needs it. The `--runExternalCode` flag is required because the mapper runs code from `node_modules`.

If the mapper causes problems, switch to TypeScript 6 and `astro check`.

## Hosting and domain

The site runs on Cloudflare Workers as the `newmoonbirth` Worker.

- `wrangler.jsonc` attaches `newmoonbirth.com` and `www.newmoonbirth.com` as custom domains. Cloudflare creates their DNS records and HTTPS certificates.
- A Single Redirect rule in the Cloudflare dashboard sends `www.newmoonbirth.com/*` to `https://newmoonbirth.com/${1}` with a 301. It keeps the path and query string. This rule is not in the repo. To change it, open the `newmoonbirth.com` zone in the dashboard and go to **Rules**.
- The zone has email records for Cloudflare Email Routing (MX and SPF at the root) and Email Sending (MX, SPF, and DKIM at `cf-bounce`, and DMARC at `_dmarc`). Do not remove them. Keep DMARC at `p=none`.

All pages are static except the contact form endpoint, `/api/contact/`, which runs in the Worker.

## SEO

- `public/robots.txt` allows all crawlers and points to the sitemap.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` at build time. It lists every page automatically.
- `site` in `astro.config.mjs` is `https://newmoonbirth.com`. The sitemap and canonical links use it.
- `trailingSlash` is `always`, so page URLs end in `/`. Write internal links with the slash, for example `/contact/`. Links without it cause an extra redirect.
- `Base.astro` adds a canonical link to every page except the 404 page.
- Each page passes a `title` and a `description` to `Base`. Keep the description under about 160 characters, or Google cuts it off.
- `Base.astro` adds Open Graph and Twitter Card tags to every page. Facebook, X, LinkedIn, Slack, and iMessage use them for link previews. All pages use `public/og-image.png`.
- `Base.astro` adds structured data (JSON-LD) that describes the site, the business, and Starlee. Google uses it for the site name in results and for local business details.
- The 404 page passes `noindex`, so search engines do not list it. The sitemap also leaves it out.
- After a change to tags, check a page with the [Rich Results Test](https://search.google.com/test/rich-results) and the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/). The debugger also clears the cached preview.

## Analytics

The site uses Cloudflare Web Analytics. It uses no cookies and does not track individual visitors. Cloudflare adds the beacon script to each page at the edge, because automatic setup is on for the `newmoonbirth.com` zone. Do not add the script to the code too, or each visit counts twice. See the numbers in the Cloudflare dashboard under **Analytics & Logs** > **Web Analytics**.

Do not add Google Tag Manager, Google Analytics, or ad pixels without legal review. Washington's My Health My Data Act can treat visits to a doula site as consumer health data. That data needs visitor consent and a separate privacy policy.

## Deploys

Every push to `main` deploys the site. The GitHub Actions workflow `.github/workflows/deploy.yml` installs dependencies, runs `pnpm check`, and runs `pnpm run deploy`. It reads the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

To deploy without a push, run the workflow from the **Actions** tab, or run `pnpm run deploy` locally.

## Email DNS

The zone has a DMARC record, `_dmarc.newmoonbirth.com`, set to `v=DMARC1; p=none`. This is monitoring only. It does not change delivery. Do not change it to `quarantine` or `reject` until the reports show that all real mail passes SPF and DKIM.
