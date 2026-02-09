import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase testimonials error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('Testimonials API error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
