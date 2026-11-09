import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { type ContactResult, honeypotField, turnstileAction } from "../../lib/contact";

// The contact form posts here. This route runs in the Worker; every page is prerendered.
export const prerender = false;

const limits = { name: 200, email: 254, phone: 40, message: 5000 };

const reply = (result: ContactResult, status = 200) => Response.json(result, { status });

const tooLong = (field: keyof typeof limits) =>
	reply({ ok: false, error: `Please shorten this to ${limits[field]} characters or fewer.`, field }, 400);

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData().catch(() => null);
	if (!form) {
		return reply({ ok: false, error: "Something went wrong sending your message. Please try again." }, 400);
	}
	const text = (key: string) => String(form.get(key) ?? "").trim();

	// Tell a bot it worked, so it has no reason to try again.
	if (text(honeypotField)) {
		return reply({ ok: true });
	}

	if (!(await passedTurnstile(text("cf-turnstile-response"), request.headers.get("CF-Connecting-IP")))) {
		return reply({ ok: false, error: "Please complete the spam check, then send again.", field: "turnstile" }, 400);
	}

	const name = text("name");
	const email = text("email");
	const phone = text("phone");
	const dueDate = text("dueDate");
	const message = text("message");

	if (!name) return reply({ ok: false, error: "Please enter your name.", field: "name" }, 400);
	if (name.length > limits.name) return tooLong("name");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return reply({ ok: false, error: "Please enter a valid email address.", field: "email" }, 400);
	}
	if (email.length > limits.email) return tooLong("email");
	if (phone.length > limits.phone) return tooLong("phone");
	if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
		return reply({ ok: false, error: "Please enter the due date as a date.", field: "dueDate" }, 400);
	}
	if (!message) return reply({ ok: false, error: "Please write a message.", field: "message" }, 400);
	if (message.length > limits.message) return tooLong("message");

	// A name with a line break could otherwise add lines to the subject.
	const oneLine = (value: string) => value.replace(/\s+/g, " ");
	const details = [`Name: ${oneLine(name)}`, `Email: ${email}`, phone && `Phone: ${oneLine(phone)}`, dueDate && `Due date: ${dueDate}`]
		.filter(Boolean)
		.join("\n");

	try {
		await env.EMAIL.send({
			from: { name: "New Moon Birth website", email: "website@newmoonbirth.com" },
			to: env.CONTACT_EMAIL_TO,
			replyTo: { name: oneLine(name), email },
			subject: `Website message from ${oneLine(name)}`,
			text: `${details}\n\n${message}\n\nSent from the contact form at newmoonbirth.com. Reply to this email to answer ${oneLine(name)}.\n`,
		});
	} catch (error) {
		console.error("Contact form email failed", error);
		return reply(
			{
				ok: false,
				error: "Your message didn’t send. Please email starlee@newmoonbirth.com or call 281-995-4078 instead.",
			},
			502,
		);
	}

	return reply({ ok: true });
};

type Siteverify = {
	success?: boolean;
	hostname?: string;
	action?: string;
	"error-codes"?: string[];
	metadata?: { result_with_testing_key?: boolean };
};

// Asks Cloudflare whether the visitor passed the Turnstile check. Each token works once, for five minutes.
// The check must also come from our own widget, on one of our hostnames. Cloudflare's test secret, used in
// `astro dev`, reports the hostname example.com and no action.
async function passedTurnstile(token: string, ip: string | null): Promise<boolean> {
	const hostnames = env.TURNSTILE_HOSTNAMES.split(",").map((hostname) => hostname.trim()).filter(Boolean);
	if (!token || token.length > 2048 || hostnames.length === 0) return false;
	const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
	if (ip) body.append("remoteip", ip);
	try {
		const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			body,
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) throw new Error(`Siteverify answered ${response.status}`);
		const result: Siteverify = await response.json();
		if (result.success !== true) {
			console.warn("Turnstile rejected a token", result["error-codes"]);
			return false;
		}
		const testing = result.metadata?.result_with_testing_key === true;
		return hostnames.includes(result.hostname ?? "") && (testing || result.action === turnstileAction);
	} catch (error) {
		console.error("Turnstile check failed", error);
		return false;
	}
}
