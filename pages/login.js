import { useState } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "../lib/SupabaseContext";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();

  const nextUrl =
    typeof router.query.next === "string" ? router.query.next : "/";

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        const userId = data?.user?.id;
        if (!userId) {
          setMessage("Login failed. Please try again.");
          return;
        }

        // After login, load profile by id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_subscribed,subscription_status")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          setMessage("Could not load your profile.");
          return;
        }

        const isActive =
          !!profile?.is_subscribed ||
          profile?.subscription_status === "ACTIVE" ||
          profile?.subscription_status === "active";

        // If they came here to subscribe, always go to subscribe
        if (nextUrl === "/subscribe") {
          await router.push("/subscribe");
          return;
        }

        // Otherwise: active users can go to app, inactive go to subscribe
        if (isActive) {
          await router.push("/app");
        } else {
          await router.push("/subscribe");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Sign up successful. You can now sign in.");
        setMode("signin");
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");
    if (!email) {
      setMessage('Enter your email above first, then click "Forgot password?".');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) setMessage(error.message);
      else setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setMessage("Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "60px auto",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>{mode === "signin" ? "Sign in" : "Sign up"}</h1>
      <p>Use your email + password.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, marginTop: 16 }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: "#4f46e5",
            color: "white",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading
            ? mode === "signin"
              ? "Signing in…"
              : "Signing up…"
            : mode === "signin"
            ? "Sign in"
            : "Sign up"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          style={{
            marginTop: 4,
            border: "none",
            background: "transparent",
            color: "#4f46e5",
            textDecoration: "underline",
            cursor: "pointer",
            textAlign: "left",
            padding: 0,
          }}
        >
          Forgot password?
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage("");
          }}
          style={{
            marginTop: 8,
            border: "none",
            background: "transparent",
            color: "#111827",
            cursor: "pointer",
            textAlign: "left",
            padding: 0,
          }}
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>

      {message && <p style={{ marginTop: 16, color: "#b91c1c" }}>{message}</p>}
    </main>
  );
}
