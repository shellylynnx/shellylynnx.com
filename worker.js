const PUBLICATION_ID = "pub_7a87cacc-76f6-44c2-8194-579a21e85939";

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleSubscribe(request, env) {
  try {
    if (!env.BEEHIIV_API_KEY) {
      return Response.json(
        { ok: false, error: "not_configured" },
        { status: 500 },
      );
    }

    if (env.RATE_LIMIT) {
      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      const key = `rl:subscribe:${ip}`;
      const now = Math.floor(Date.now() / 1000);
      const windowSeconds = 3600;
      const maxHits = 5;

      const existing = await env.RATE_LIMIT.get(key, { type: "json" });
      const entry =
        existing && now - existing.windowStart < windowSeconds
          ? existing
          : { count: 0, windowStart: now };

      if (entry.count >= maxHits) {
        return Response.json(
          { ok: false, error: "rate_limited" },
          { status: 429 },
        );
      }

      entry.count += 1;
      await env.RATE_LIMIT.put(key, JSON.stringify(entry), {
        expirationTtl: windowSeconds,
      });
    }

    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "shellylynnx.com",
        }),
      },
    );

    if (!res.ok) {
      return Response.json(
        { ok: false, error: "upstream_error" },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response =
      url.pathname === "/api/subscribe" && request.method === "POST"
        ? await handleSubscribe(request, env)
        : await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },
};
