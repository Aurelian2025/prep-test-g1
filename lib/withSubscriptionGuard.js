// lib/withSubscriptionGuard.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// A higher-order function to protect pages by subscription status
export function withSubscriptionGuard(gssp, options = {}) {
  const {
    redirectIfNoSession = '/login',
    redirectIfInactive = '/subscribe', // page to send non-paying users
  } = options;

  return async (ctx) => {
    const supabase = createServerSupabaseClient(ctx);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 1) Not logged in → send to login
    if (!session) {
      return {
        redirect: {
          destination: redirectIfNoSession,
          permanent: false,
        },
      };
    }

    const userEmail = session.user.email;

    // 2) Look up profile by email (same email your Stripe webhook uses)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, email')
      .eq('email', userEmail)
      .single();

    if (error) {
      console.error('Error fetching profile in guard:', error);
    }

    // 3) No profile or not active → send to subscribe/paywall
    if (!profile || profile.subscription_status !== 'active') {
      return {
        redirect: {
          destination: redirectIfInactive,
          permanent: false,
        },
      };
    }

    // 4) Optionally run page-specific getServerSideProps
    let gsspResult = { props: {} };
    if (gssp) {
      gsspResult = await gssp(ctx, { session, profile, supabase });
    }

    return {
      ...gsspResult,
      props: {
        ...(gsspResult.props || {}),
        initialSession: session,
        user: session.user,
        profile,
      },
    };
  };
}
