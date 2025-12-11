// pages/api/claim-signup.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Missing token or password' });
  }

  try {
    const nowIso = new Date().toISOString();

    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from('signup_tokens')
      .select('id, email, used_at, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) {
      console.error('Error fetching signup token:', tokenError);
      return res.status(500).json({ error: 'Server error' });
    }

    if (
      !tokenRow ||
      tokenRow.used_at ||
      (tokenRow.expires_at && tokenRow.expires_at < nowIso)
    ) {
      return res
        .status(400)
        .json({ error: 'This signup link is invalid or has expired.' });
    }

    const email = tokenRow.email;

    // Create Supabase auth user and mark email confirmed
    const { data: userData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError) {
      console.error('Error creating user from signup token:', createUserError);
      return res
        .status(400)
        .json({ error: createUserError.message || 'Could not create user.' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('signup_tokens')
      .update({ used_at: nowIso })
      .eq('id', tokenRow.id);

    if (updateError) {
      console.error('Error marking token used:', updateError);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('claim-signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
