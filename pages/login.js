export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = createPagesBrowserClient();

  async function handleSignIn(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signIn result", data, error);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <div style={{ padding: 20, maxWidth: 380, margin: "40px auto" }}>
      <h1>Sign in</h1>

      <form onSubmit={handleSignIn}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          type="email"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          required
        />

        <button type="submit">Sign in</button>
      </form>

      {/* 👇 INSERT FORGOT PASSWORD HERE */}
      <div style={{ marginTop: 12 }}>
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            const email = prompt("Enter your email to reset your password:");
            if (!email) return;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: "https://g1-q8un.vercel.app/reset-password",
            });

            if (error) {
              alert("Error: " + error.message);
            } else {
              alert("Password reset email sent! Check your inbox.");
            }
          }}
          style={{
            color: "#6366f1",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Forgot password?
        </a>
      </div>
      {/* 👆 END FORGOT PASSWORD BLOCK */}

      <p style={{ marginTop: 20 }}>
        Don’t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
