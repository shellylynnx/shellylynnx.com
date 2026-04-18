interface Env {
  BEEHIIV_API_KEY: string;
}

interface Body {
  email?: string;
}

const PUBLICATION_ID = "pub_7a87cacc-76f6-44c2-8194-579a21e85939";

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const { request, env } = context;

    if (!env.BEEHIIV_API_KEY) {
      return Response.json(
        { ok: false, error: "not_configured" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as Body;
    const email = body.email?.trim().toLowerCase();

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
