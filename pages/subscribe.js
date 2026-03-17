import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabase } from "../lib/SupabaseContext";

export default function SubscribePage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  async function loadProfile() {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,is_subscribed,subscription_status,paypal_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setStatusText("Could not load your profile.");
      return;
    }
    setProfile(data || null);
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleSubscribe() {
    setStatusText("");
    setLoading(true);
    try {
      if (!user) {
        router.push("/login?next=/subscribe");
        return;
      }

      const r = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await r.json();

      if (data?.alreadyActive) {
        window.location.href = "/";
        return;
      }

      if (!r.ok) {
        setStatusText(data?.error || "Could not start subscription.");
        return;
      }

      const approvalUrl =
        data?.links?.find((l) => l.rel === "approve")?.href ||
        data?.links?.find((l) => l.rel === "payer-action")?.href;

      if (!approvalUrl) {
        setStatusText("Missing PayPal approval link.");
        return;
      }

      window.location.href = approvalUrl;
    } catch (e) {
      setStatusText("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshStatus() {
    setStatusText("");
    setLoading(true);
    try {
      await loadProfile();
      setStatusText("Status refreshed.");
    } finally {
      setLoading(false);
    }
  }

  const isActive =
    !!profile?.is_subscribed ||
    profile?.subscription_status === "ACTIVE" ||
    profile?.subscription_status === "active";

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Subscribe</h1>

      {!user ? (
        <>
          <p style={{ marginTop: 16 }}>You must be logged in before subscribing.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/login?next=/subscribe">Go to login</Link>
          </p>
        </>
      ) : (
        <>
          <p style={{ marginTop: 10 }}>
            Logged in as: <strong>{user.email}</strong>
          </p>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
            }}
          >
            <div>
              <strong>Subscription status:</strong>{" "}
              {profile?.subscription_status || "unknown"}
            </div>
            <div>
              <strong>is_subscribed:</strong> {String(!!profile?.is_subscribed)}
            </div>
            <div>
              <strong>paypal_subscription_id:</strong>{" "}
              {profile?.paypal_subscription_id || "-"}
            </div>
          </div>

          {isActive ? (
            <>
              <p style={{ marginTop: 16 }}>
                Your subscription is active. You can return to the questions.
              </p>
              <Link href="/">Back to practice questions</Link>
            </>
          ) : (
            <>
              <p style={{ marginTop: 16 }}>
                First 20 questions are free. For full access, subscribe via PayPal.
              </p>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  background: loading ? "#e5e7eb" : "#111827",
                  color: "white",
                  fontWeight: 800,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? "Starting PayPal…" : "Subscribe with PayPal"}
              </button>

              <button
                onClick={handleRefreshStatus}
                disabled={loading}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #ccc",
                  background: "#fff",
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                Refresh status
              </button>
            </>
          )}
        </>
      )}

      {statusText && (
        <p style={{ marginTop: 14, color: "#b91c1c" }}>{statusText}</p>
      )}
    </main>
  );
}
