const PUBLICATION_ID = "pub_7a87cacc-76f6-44c2-8194-579a21e85939";

async function handleSubscribe(request, env) {
  try {
    if (!env.BEEHIIV_API_KEY) {
      return Response.json(
        { ok: false, error: "not_configured" },
        { status: 500 },
      );
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
    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      return handleSubscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
