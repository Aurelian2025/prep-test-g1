# Prep test G1

Tiny Next.js scaffold (JavaScript only). Free with ads + mock exams to come.

## Dev
```bash
npm install
npm run dev
```

## Supabase SSR Setup

This project uses [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs) for authentication (migrated from the deprecated `@supabase/auth-helpers-nextjs` / `@supabase/auth-helpers-react`).

### Required environment variables

| Variable | Where used | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`lib/supabaseAdmin.js`) | Service-role key for admin operations |

### Helper files

| File | Purpose |
|---|---|
| `lib/supabaseBrowser.js` | Creates a browser-side Supabase client via `createBrowserClient` |
| `lib/supabaseServer.js` | Creates a server-side Supabase client via `createServerClient` (for API routes and `getServerSideProps`) |
| `lib/SupabaseContext.js` | React context + `useSupabase()` hook for accessing the browser client in components |

### Usage in pages

```js
// Client component
import { useSupabase } from '../lib/SupabaseContext';
const supabase = useSupabase();
```

```js
// API route or getServerSideProps
import { createSupabaseServerClient } from '../lib/supabaseServer';
const supabase = createSupabaseServerClient(req, res);
```

