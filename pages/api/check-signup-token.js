// pages/api/check-signup-token.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('signup_tokens')
      .select('email, used_at, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching signup token:', error);
      return res.status(500).json({ error: 'Server error' });
    }

    if (
      !data ||
      data.used_at ||
      (data.expires_at && data.expires_at < nowIso)
    ) {
      return res
        .status(400)
        .json({ error: 'This signup link is invalid or has expired.' });
    }

    return res.status(200).json({ email: data.email });
  } catch (err) {
    console.error('check-signup-token error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
