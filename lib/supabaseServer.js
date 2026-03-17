import { createServerClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in API routes and getServerSideProps.
 * Pass `req` and `res` from Next.js (either from an API route handler or
 * from a getServerSideProps context object).
 */
export function createSupabaseServerClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies || {}).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          const cookieStrings = cookiesToSet.map(({ name, value, options = {} }) => {
            const parts = [`${name}=${value}`, "Path=/"];
            if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
            if (options.domain) parts.push(`Domain=${options.domain}`);
            if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options.httpOnly) parts.push("HttpOnly");
            if (options.secure) parts.push("Secure");
            return parts.join("; ");
          });
          if (cookieStrings.length > 0) {
            res.setHeader("Set-Cookie", cookieStrings);
          }
        },
      },
    }
  );
}
