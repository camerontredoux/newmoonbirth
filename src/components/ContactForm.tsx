import { type FormEvent, useEffect, useRef, useState } from "react";
import { type ContactResult, honeypotField, turnstileAction, turnstileSiteKey } from "../lib/contact";

// The parts of Cloudflare's Turnstile script this form uses.
interface Turnstile {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: "auto" | "light" | "dark";
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "before-interactive-callback"?: () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const turnstileScript = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Loads Turnstile's script once, however many times the form mounts.
let turnstileLoaded: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  turnstileLoaded ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = turnstileScript;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not load")));
    script.onerror = () => reject(new Error("Turnstile did not load"));
    document.head.appendChild(script);
  });
  return turnstileLoaded;
}

type Status = { state: "idle" | "sending" | "sent" } | { state: "failed"; error: string; field?: string };

const inputClass =
  "mt-2 block w-full rounded-none border-0 border-b border-moon-navy/35 bg-transparent px-0 py-2.5 text-moon-ink placeholder:text-moon-ink/40 focus:border-moon-navy focus:ring-0 focus:outline-none aria-invalid:border-b-2 aria-invalid:border-moon-navy";

/** The contact form. It posts to /api/contact/, which checks Turnstile and emails Starlee. */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const turnstileBox = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !turnstileBox.current) return;
        // Depending on the widget's mode, Cloudflare may show a box while it checks the visitor, or ask for a click.
        // The box always uses the light theme, to sit on the cream page. It fades away shortly after it says
        // "Success!", and comes back if Cloudflare asks for a click.
        widgetId.current = turnstile.render(turnstileBox.current, {
          sitekey: turnstileSiteKey,
          action: turnstileAction,
          theme: "light",
          appearance: "interaction-only",
          callback: () => {
            clearTimeout(fadeTimer);
            fadeTimer = setTimeout(() => setChallengeDone(true), 1500);
          },
          "before-interactive-callback": () => {
            clearTimeout(fadeTimer);
            setChallengeDone(false);
          },
        });
      })
      .catch(() => !cancelled && setTurnstileFailed(true));
    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, []);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "sending" });
    let result: ContactResult;
    try {
      const response = await fetch("/api/contact/", { method: "POST", body: new FormData(event.currentTarget) });
      result = await response.json();
    } catch {
      result = { ok: false, error: "Your message didn’t send. Check your connection and try again." };
    }
    if (widgetId.current) {
      if (result.ok) {
        // The thank-you message replaces the form, and the widget with it.
        window.turnstile?.remove(widgetId.current);
        widgetId.current = undefined;
      } else {
        // A Turnstile token works only once, so get a fresh one for the next try.
        window.turnstile?.reset(widgetId.current);
      }
    }
    setStatus(result.ok ? { state: "sent" } : { state: "failed", error: result.error, field: result.field });
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="py-10">
        <p className="font-display text-[clamp(2rem,1.6rem+1.2vw,2.75rem)] leading-[1.15] text-moon-navy">
          Thank you. Your message is on its way to Starlee.
        </p>
        <p className="mt-4">She’ll reply to the email address you gave.</p>
      </div>
    );
  }

  const failed = status.state === "failed" ? status : undefined;
  const invalid = (field: string) => (failed?.field === field ? { "aria-invalid": true, "aria-describedby": "contact-error" } : {});

  return (
    <form onSubmit={send} className="relative grid gap-x-8 gap-y-8 sm:grid-cols-2">
      <label className="block">
        <span className="caps">Name</span>
        <input name="name" required maxLength={200} autoComplete="name" className={inputClass} {...invalid("name")} />
      </label>
      <label className="block">
        <span className="caps">Email</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} {...invalid("email")} />
      </label>
      <label className="block">
        <span className="caps">
          Phone <span className="text-moon-ink/50 normal-case tracking-normal">(optional)</span>
        </span>
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={inputClass} {...invalid("phone")} />
      </label>
      <label className="block">
        <span className="caps">
          Due date <span className="text-moon-ink/50 normal-case tracking-normal">(optional)</span>
        </span>
        <input name="dueDate" type="date" className={inputClass} {...invalid("dueDate")} />
      </label>
      <label className="block sm:col-span-2">
        <span className="caps">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="Tell me a little about you and the support you’re looking for."
          className={`${inputClass} resize-y`}
          {...invalid("message")}
        />
      </label>
      {/* The honeypot. It's hidden from people and screen readers, so only a bot fills it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input name={honeypotField} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="sm:col-span-2">
        <div
          className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-700 ${challengeDone ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"}`}
        >
          <div ref={turnstileBox} className="overflow-hidden" />
        </div>
        {turnstileFailed && (
          <p className="text-sm">
            The spam check didn’t load. If sending fails, email{" "}
            <a href="mailto:starlee@newmoonbirth.com" className="underline underline-offset-4">
              starlee@newmoonbirth.com
            </a>{" "}
            instead.
          </p>
        )}
        {failed && (
          <p id="contact-error" role="alert" className="mb-6 border-l-2 border-moon-gold pl-4 font-medium text-moon-navy">
            {failed.error}
          </p>
        )}
        <button type="submit" disabled={status.state === "sending"} className="button-solid cursor-pointer disabled:opacity-60">
          {status.state === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
