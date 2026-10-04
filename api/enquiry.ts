export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }
  try {
    const body = (await req.json()) as Record<string, string>;
    const required = ["name", "email", "message"];
    const missing = required.filter((f) => !body[f]?.trim());
    if (missing.length) {
      return new Response(
        JSON.stringify({ error: `Missing fields: ${missing.join(", ")}` }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
    // In production, forward to an email service here.
    return new Response(
      JSON.stringify({
        ok: true,
        reference: `WBS-${Date.now().toString().slice(-6)}`,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
