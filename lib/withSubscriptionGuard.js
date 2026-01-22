// lib/withSubscriptionGuard.js
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export function withSubscriptionGuard(gssp, options = {}) {
  const {
    redirectIfNoSession = "/login",
    redirectIfInactive = "/subscribe",
  } = options;

  return async (ctx) => {
    const supabase = createServerSupabaseClient(ctx);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 1) Not logged in → send to /login
    if (!session) {
      return {
        redirect: {
          destination: redirectIfNoSession,
          permanent: false,
        },
      };
    }

    const userId = session.user.id;

    // 2) Look up profile by user id (NOT email)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, subscription_expires_at, access_disabled")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile in guard:", error);
    }

    // 3) No profile OR access disabled OR subscription expired → /subscribe
    const isExpired =
      !profile?.subscription_expires_at ||
      new Date(profile.subscription_expires_at).getTime() <= Date.now();

    if (!profile || profile.access_disabled || isExpired) {
      // Optional: sign out server-side
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }

      return {
        redirect: {
          destination: redirectIfInactive,
          permanent: false,
        },
      };
    }

    // 4) Optionally run extra GSSP
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
