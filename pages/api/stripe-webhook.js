// pages/api/stripe-webhook.js
import Stripe from 'stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: false, // must be false so we can verify signature
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const resend = new Resend(process.env.RESEND_API_KEY || '');

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return res.status(400).send('Missing Stripe signature or webhook secret');
  }

  const buf = await getRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Webhook event received:', event.type);

  try {
    switch (event.type) {
      // -----------------------------
      // 1) PAYMENT COMPLETED
      // -----------------------------
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail =
          session.customer_details?.email || session.customer_email;
        const stripeCustomerId = session.customer;

        if (!customerEmail) {
          console.warn('checkout.session.completed without email');
          break;
        }

        // 1a) Ensure profile exists and is active
        try {
          const { data: existingProfile, error: selectProfileError } =
            await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .maybeSingle();

          if (selectProfileError) {
            console.error(
              'Error checking profile on checkout.session.completed:',
              selectProfileError
            );
          }

          if (!existingProfile) {
            const { error: insertProfileError } = await supabaseAdmin
              .from('profiles')
              .insert({
                email: customerEmail,
                subscription_status: 'active',
                stripe_customer_id: stripeCustomerId,
              });

            if (insertProfileError) {
              console.error(
                'Error inserting profile on checkout.session.completed:',
                insertProfileError
              );
            } else {
              console.log(
                `Inserted new profile and marked ${customerEmail} as active (customer ${stripeCustomerId}).`
              );
            }
          } else {
            const { error: updateProfileError } = await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'active',
                stripe_customer_id: stripeCustomerId,
              })
              .eq('email', customerEmail);

            if (updateProfileError) {
              console.error(
                'Error updating profile on checkout.session.completed:',
                updateProfileError
              );
            } else {
              console.log(
                `Updated profile and marked ${customerEmail} as active (customer ${stripeCustomerId}).`
              );
            }
          }
        } catch (err) {
          console.error(
            'Unexpected error handling profile on checkout.session.completed:',
            err
          );
        }

        // 1b) Create or reuse a signup token
        let token;
        try {
          const nowIso = new Date().toISOString();

          const { data: existingToken, error: existingTokenError } =
            await supabaseAdmin
              .from('signup_tokens')
              .select('id, token, used_at, expires_at')
              .eq('email', customerEmail)
              .is('used_at', null)
              .gt('expires_at', nowIso)
              .maybeSingle();

          if (existingTokenError) {
            console.error(
              'Error checking existing signup token:',
              existingTokenError
            );
          }

          if (existingToken && !existingToken.used_at) {
            token = existingToken.token;
            console.log('Reusing existing signup token for', customerEmail);
          } else {
            const { data: newTokenRow, error: insertTokenError } =
              await supabaseAdmin
                .from('signup_tokens')
                .insert({ email: customerEmail })
                .select('token')
                .single();

            if (insertTokenError) {
              console.error('Error creating signup token:', insertTokenError);
            } else {
              token = newTokenRow.token;
              console.log('Created new signup token for', customerEmail);
            }
          }
        } catch (err) {
          console.error('Unexpected error handling signup token:', err);
        }

        // 1c) Send email with claim link
        if (token) {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || 'https://g1-q8un.vercel.app';
          const claimUrl = `${baseUrl}/claim?token=${token}`;

          console.log('Signup link for', customerEmail, '=>', claimUrl);

          if (process.env.RESEND_API_KEY) {
            try {
              await resend.emails.send({
                from: 'Ontario G1 Practice Test <no-reply@yourdomain.com>',
                to: customerEmail,
                subject: 'Set up your G1 Practice Test account',
                html: `
                  <p>Hi,</p>
                  <p>Thanks for your purchase of the Ontario G1 Practice Test subscription.</p>
                  <p>Click the link below to create your account and set your password:</p>
                  <p><a href="${claimUrl}">${claimUrl}</a></p>
                  <p>This link will expire in 7 days. After that, you can always reset your password from the login page.</p>
                  <p>Once you set your password, you can log in anytime at <a href="${baseUrl}/login">${baseUrl}/login</a>.</p>
                `,
              });
              console.log('Sent signup email to', customerEmail);
            } catch (emailErr) {
              console.error('Error sending signup email:', emailErr);
            }
          } else {
            console.log(
              'RESEND_API_KEY not set, not sending email. Signup URL:',
              claimUrl
            );
          }
        }

        break;
      }

      // -----------------------------
      // 2) SUBSCRIPTION STATUS CHANGES
      // -----------------------------
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        const status = subscription.status;

        const mappedStatus = status === 'active' ? 'active' : 'inactive';

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: mappedStatus })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(
            'Error updating profile from subscription event:',
            error
          );
        } else {
          console.log(
            `Updated subscription_status for customer ${stripeCustomerId} to ${mappedStatus}`
          );
        }
        break;
      }

      // -----------------------------
      // 3) PAYMENT FAILED
      // -----------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer;

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(
            'Error updating profile from invoice.payment_failed:',
            error
          );
        } else {
          console.log(
            `Marked customer ${stripeCustomerId} as inactive due to failed payment`
          );
        }
        break;
      }

      default:
        console.log(`Ignoring unsupported event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler error');
  }

  res.json({ received: true });
}
