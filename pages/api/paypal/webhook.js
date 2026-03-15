import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function bufferFromStream(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
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
  if (!tokenRes.ok) throw new Error("Failed to get PayPal access token");
  return tokenData.access_token;
}

async function verifyPayPalWebhook({ headers, rawBody }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("Missing PAYPAL_WEBHOOK_ID env var");

  const transmissionId = headers["paypal-transmission-id"];
  const transmissionTime = headers["paypal-transmission-time"];
  const certUrl = headers["paypal-cert-url"];
  const authAlgo = headers["paypal-auth-algo"];
  const transmissionSig = headers["paypal-transmission-sig"];

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return { verified: false, reason: "Missing PayPal verification headers" };
  }

  const accessToken = await getPayPalAccessToken();

  const verifyRes = await fetch(
    `${process.env.PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody.toString("utf8")),
      }),
    }
  );

  const verifyData = await verifyRes.json();
  return { verified: verifyData.verification_status === "SUCCESS" };
}

function mapPayPalEventToProfileUpdate(eventType, resource) {
  const userId = resource?.custom_id;
  const subscriptionId = resource?.id;

  if (!userId) return { userId: null, update: null };

  const activeTypes = new Set([
    "BILLING.SUBSCRIPTION.ACTIVATED",
    "BILLING.SUBSCRIPTION.RE-ACTIVATED",
  ]);

  const inactiveTypes = new Set([
    "BILLING.SUBSCRIPTION.CANCELLED",
    "BILLING.SUBSCRIPTION.SUSPENDED",
    "BILLING.SUBSCRIPTION.EXPIRED",
  ]);

  if (activeTypes.has(eventType)) {
    return {
      userId,
      update: {
        is_subscribed: true,
        subscription_status: "ACTIVE",
        paypal_subscription_id: subscriptionId ?? null,
      },
    };
  }

  if (inactiveTypes.has(eventType)) {
    return {
      userId,
      update: {
        is_subscribed: false,
        subscription_status: eventType,
        paypal_subscription_id: subscriptionId ?? null,
      },
    };
  }

  return { userId, update: null };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await bufferFromStream(req);

    const verification = await verifyPayPalWebhook({
      headers: req.headers,
      rawBody,
    });

    if (!verification.verified) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    if (!event || !event.event_type) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const { userId, update } = mapPayPalEventToProfileUpdate(
      event.event_type,
      event.resource
    );

    if (update && userId) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update(update)
        .eq("id", userId);

      if (error) {
        return res.status(500).json({ error: "Failed to update profile" });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Webhook error" });
  }
}
