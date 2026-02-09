import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('settings').select('*')
    if (error) throw error

    const result: Record<string, any> = {}
    data?.forEach((row: any) => {
      result[row.key] = row.value
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
