export const config = { runtime: "edge" };

/**
 * Enquiry endpoint. Receives the public contact form, validates and sanitises
 * every field, and (TODO) forwards the result to an email service. Nothing here
 * is trusted: the payload is attacker-controlled, so all input is coerced,
 * length-capped and stripped of control characters before use.
 */

const MAX_BODY_BYTES = 20_000;
const MAX = {
  name: 100,
  company: 100,
  email: 254,
  phone: 40,
  vessel: 100,
  message: 5_000,
} as const;

// Deliberately permissive but strict enough to reject header-injection and
// obviously malformed addresses. The real deliverability check happens at send
// time; this only stops garbage reaching the mailer's headers.
const EMAIL_RE = /^[^\s@<>,;:"\\]+@[^\s@<>,;:"\\]+\.[^\s@<>,;:"\\]+$/;

// Best-effort, in-memory throttle. Edge isolates are per-instance and short
// lived, so this is NOT a substitute for platform-level rate limiting (e.g. a
// Vercel WAF rule or Upstash) — it only blunts a single hot instance.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** Coerce to string, drop control chars, and cap length. `multiline` keeps newlines. */
function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = multiline
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : value.replace(/[\u0000-\u001F\u007F]/g, " ");
  return stripped.trim().slice(0, max);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
    return json({ error: "Unsupported media type" }, 415);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return json({ error: "Too many requests. Please try again later." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);
    body = JSON.parse(raw) as Record<string, unknown>;
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new Error();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const name = clean(body.name, MAX.name);
  const company = clean(body.company, MAX.company);
  const email = clean(body.email, MAX.email);
  const phone = clean(body.phone, MAX.phone);
  const vessel = clean(body.vessel, MAX.vessel);
  const message = clean(body.message, MAX.message, true);

  const missing = (["name", "email", "message"] as const).filter((f) => !{ name, email, message }[f]);
  if (missing.length) {
    return json({ error: `Missing fields: ${missing.join(", ")}` }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: "A valid email address is required." }, 400);
  }

  // In production, forward { name, company, email, phone, vessel, message } to
  // an email service here. Treat every value as untrusted: keep them out of
  // mail headers (subject is fine, but never interpolate into To/From/Reply-To)
  // and send as a plain-text body.
  return json({ ok: true, reference: `WBS-${Date.now().toString().slice(-6)}` }, 200);
}
