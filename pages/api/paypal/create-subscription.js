export default async function handler(req, res) {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    // 1️⃣ Get Access Token
    const tokenRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2️⃣ Create Subscription
    const subRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/billing/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: "P-6FB9846876198302PNG3KW7Q",
          application_context: {
            brand_name: "G1 Practice Test",
            return_url: "https://g1-q8un.vercel.app/success",
            cancel_url: "https://g1-q8un.vercel.app/cancel",
            user_action: "SUBSCRIBE_NOW"
          }
        })
      }
    );

    const subData = await subRes.json();

    res.status(200).json(subData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
