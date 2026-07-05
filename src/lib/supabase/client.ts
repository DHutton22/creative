import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern - create client once and reuse
let supabaseClient: SupabaseClient | null = null;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    {
      auth: {
        // Bypass the default navigator.locks-based auth lock. In some browsers
        // and embedded webviews (e.g. the tablets) the exclusive lock on
        // "sb-<ref>-auth-token" can be acquired and never released, which
        // deadlocks every subsequent getSession()/query - leaving pages stuck
        // on "Loading..." forever. Running the callback directly avoids the
        // deadlock; the trade-off (rare cross-tab token-refresh races) is far
        // preferable to a permanent hang.
        lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
      },
    }
  );

  return supabaseClient;
}
