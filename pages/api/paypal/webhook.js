import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const event = req.body;

    if (!event || !event.event_type) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Subscription Activated
    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscription = event.resource;
      const userId = subscription.custom_id;

      await supabase
        .from('profiles')
        .update({
          is_subscribed: true,
          subscription_status: 'ACTIVE',
          paypal_subscription_id: subscription.id,
        })
        .eq('id', userId);
    }

    // Subscription Cancelled
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED'
    ) {
      const subscription = event.resource;
      const userId = subscription.custom_id;

      await supabase
        .from('profiles')
        .update({
          is_subscribed: false,
          subscription_status: event.event_type,
        })
        .eq('id', userId);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
