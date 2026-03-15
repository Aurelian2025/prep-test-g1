import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get logged-in user session
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;

    // Get PayPal access token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(400).json(tokenData);
    }

    const accessToken = tokenData.access_token;

    // Create subscription tied to user ID
    const subRes = await fetch(
      `${process.env.PAYPAL_BASE}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: process.env.PAYPAL_PLAN_ID,
          custom_id: userId,
          application_context: {
            brand_name: 'G1 Practice Test',
            return_url: 'https://g1-q8un.vercel.app/checkout-success',
            cancel_url: 'https://g1-q8un.vercel.app/subscribe',
            user_action: 'SUBSCRIBE_NOW',
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
    return res.status(500).json({ error: error.message });
  }
}
