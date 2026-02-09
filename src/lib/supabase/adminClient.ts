import { createClient } from '@supabase/supabase-js'

// Type Database = any (use project's types if available)
type Database = any

export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')

  return createClient<Database>(url, serviceKey)
}
