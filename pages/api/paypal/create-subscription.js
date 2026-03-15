import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

function getOrigin(req) {
  const proto =
    req.headers["x-forwarded-proto"] ||
    (req.socket?.encrypted ? "https" : "http");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch(`${process.env.PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    return { error: tokenData || { error: "Failed to get PayPal access token" } };
  }
  return { accessToken: tokenData.access_token };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Require logged-in user (server verified)
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2) Confirm profile exists (optional but safer)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id,is_subscribed,subscription_status")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      return res.status(400).json({ error: "Profile not found" });
    }

    // If already active, short-circuit
    const alreadyActive =
      !!profile.is_subscribed ||
      profile.subscription_status === "ACTIVE" ||
      profile.subscription_status === "active";

    if (alreadyActive) {
      return res.status(200).json({ alreadyActive: true });
    }

    // 3) Get PayPal token
    const { accessToken, error: tokenError } = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(400).json(tokenError);
    }

    // 4) Create subscription
    const origin = getOrigin(req);

    const subRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/billing/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: process.env.PAYPAL_PLAN_ID,
          custom_id: session.user.id,
          application_context: {
            brand_name: "G1 Practice Test",
            return_url: `${origin}/checkout-success`,
            cancel_url: `${origin}/subscribe`,
            user_action: "SUBSCRIBE_NOW",
          },
        }),
      }
    );

    const subData = await subRes.json();
    if (!subRes.ok) {
      return res.status(400).json(subData);
    }

    return res.status(200).json(subData);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
