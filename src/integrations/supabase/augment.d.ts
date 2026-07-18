import { SupabaseClient, PostgrestQueryBuilder } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(relation: string & {}): PostgrestQueryBuilder<any, any, any, any>
  }
}
