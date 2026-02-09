import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()
    // list users (paginated by default) - get first 100
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 100 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // map useful fields
    const users = data.users.map((u: any) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.user_metadata?.role || null,
      name: u.user_metadata?.name || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at
    }))

    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const createPayload: any = {
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    }

    const { data, error } = await supabase.auth.admin.createUser(createPayload)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ user: data.user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
