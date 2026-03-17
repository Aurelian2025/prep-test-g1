export default async function handler(req, res) {
  try {
    // 1️⃣ Get Access Token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

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

    // 2️⃣ Create Plan
    const planRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/billing/plans`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: "PROD-4HL682851A5663836",
          name: "G1 Monthly Plan",
          description: "Monthly subscription for premium access",
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: "9.99",
                  currency_code: "USD"
                }
              }
            }
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
          }
        })
      }
    );

    const planData = await planRes.json();

    res.status(200).json(planData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
