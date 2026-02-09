import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hero_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Public hero error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || {})
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

