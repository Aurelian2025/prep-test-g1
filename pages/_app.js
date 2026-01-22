// pages/_app.js
import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  const router = useRouter();

  useEffect(() => {
    let intervalId = null;
    let isChecking = false;

    async function checkSubscription() {
      if (isChecking) return;
      isChecking = true;

      try {
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
          isChecking = false;
          return;
        }

        const { data: profile, error } = await supabaseClient
          .from("profiles")
          .select("subscription_expires_at, access_disabled")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          console.warn("Subscription check failed or profile missing. Signing out.");
          await supabaseClient.auth.signOut();
          router.replace("/login");
          isChecking = false;
          return;
        }

        const isExpired =
          !profile.subscription_expires_at ||
          new Date(profile.subscription_expires_at).getTime() <= Date.now();

        if (profile.access_disabled || isExpired) {
          console.log("Access disabled or subscription expired. Signing out.");
          await supabaseClient.auth.signOut();
          router.replace("/subscribe");
          isChecking = false;
          return;
        }
      } catch (err) {
        console.error("Error during subscription check:", err);
      } finally {
        isChecking = false;
      }
    }

    // Run once on mount
    checkSubscription();

    // Run every 60 seconds
    intervalId = setInterval(checkSubscription, 60 * 1000);

    // Also run when user comes back to the tab
    function onFocus() {
      checkSubscription();
    }

    window.addEventListener("focus", onFocus);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [supabaseClient, router]);

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXX');
          `,
        }}
      />
      {/* End Google Tag Manager */}

      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </>
  );
}
