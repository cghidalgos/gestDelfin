import { createClient } from "@supabase/supabase-js"

/**
 * Admin client using the service role key. NEVER import this in client code.
 * Bypasses RLS — only use inside server actions / route handlers with proper
 * authorization checks already performed.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
