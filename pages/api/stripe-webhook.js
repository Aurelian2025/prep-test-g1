// pages/api/stripe-webhook.js
import Stripe from 'stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = {
  api: {
    bodyParser: false, // ❗ must be false so we get the raw body
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Read raw body into a Buffer
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
    console.error('Missing Stripe signature or webhook secret', {
      hasSig: !!sig,
      hasSecret: !!webhookSecret,
    });
    return res
      .status(400)
      .send('Missing Stripe signature or webhook secret');
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
      // Payment Link / Checkout completed
      case 'checkout.session.completed': {
  const session = event.data.object;
  const customerEmail =
    session.customer_details?.email || session.customer_email;
  const stripeCustomerId = session.customer;

  if (customerEmail) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          email: customerEmail,
          subscription_status: 'active',
          stripe_customer_id: stripeCustomerId,
        },
        {
          onConflict: 'email',
        }
      );

    if (error) {
      console.error(
        'Error upserting profile on checkout.session.completed:',
        error
      );
    } else {
      console.log(
        `Upserted profile for ${customerEmail} and marked active (customer ${stripeCustomerId}).`
      );
    }
  } else {
    console.warn(
      'checkout.session.completed received without customer email'
    );
  }
  break;
}


      // Subscription status changes
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        const status = subscription.status; // 'active', 'canceled', etc.

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

      // Mark inactive if payment fails
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
