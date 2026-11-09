## Project

Website for New Moon Birth, Starlee Brown's doula practice. Read `README.md` first. It covers the stack, commands, palette, and hosting.

- New pages and sections reuse the home page's design: `.reveal` scroll fade-ins, `.caps` labels, `ArchPhoto`, and `MoonPhase`. `README.md` tracks which pages still hold placeholder content.
- Use the `moon-*` colors from `src/styles/global.css`. Do not add one-off hex values.
- Run `pnpm check` and `pnpm build` before you report work as done.
- Deploy by committing and pushing to `main`. The GitHub Actions workflow `.github/workflows/deploy.yml` runs `pnpm check`, then `pnpm run deploy`. Never commit `.env`.
- The project uses TypeScript `7.1.0-beta`. `astro check` does not support it. Use `pnpm check`.
- The `www` → apex redirect is a Cloudflare dashboard rule, not code. The Cloudflare API token cannot edit redirect rules, so ask the user to change it.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
