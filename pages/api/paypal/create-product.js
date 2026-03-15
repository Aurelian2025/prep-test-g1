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

    // 2️⃣ Create Product
    const productRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/catalogs/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  name: "G1 Practice Premium",
  description: "Monthly premium access",
  type: "SERVICE"
}),
      }
    );

    const productData = await productRes.json();

    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
