// Shared by the contact form (ContactForm.tsx) and the route it posts to (pages/api/contact.ts).

/** What the form shows after a submission. `field` names the input to fix, when there is one. */
export type ContactResult = { ok: true } | { ok: false; error: string; field?: string };

/** The form's hidden honeypot field. People never see it, so only bots fill it in. */
export const honeypotField = "website";

/**
 * The Turnstile widget's public site key. `astro dev` uses Cloudflare's test key, which always passes and pairs with
 * the test secret in `.dev.vars.example`. Production uses the widget for newmoonbirth.com, whose secret is the Worker
 * secret TURNSTILE_SECRET_KEY.
 */
export const turnstileSiteKey = import.meta.env.DEV ? "1x00000000000000000000AA" : "0x4AAAAAAF6gqgBgUOSGCcOS";

/** The Turnstile action the form's widget reports, which the route checks. */
export const turnstileAction = "contact";
