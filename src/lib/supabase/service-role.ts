// Service-role client — bypasses all RLS policies.
// ONLY import this in src/app/api/** route handlers, never in client components.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
