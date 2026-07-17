import { SupabaseClient } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(relation: string): any
  }
}
