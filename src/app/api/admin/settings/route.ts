import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const requestedKey = searchParams.get('key')

    if (requestedKey) {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', requestedKey)
        .limit(1)

      if (error) throw error

      return NextResponse.json({ key: requestedKey, value: data?.[0]?.value ?? null })
    }

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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()
    const rows = Object.entries(body).map(([key, value]) => ({ key, value }))
    const result = await supabase.from('settings').upsert(rows)

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
