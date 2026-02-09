import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient()
    const { id } = await params
    const body = await req.json()
    const { email, name, role, password } = body

    const updatePayload: any = {}
    if (email) updatePayload.email = email
    if (password) updatePayload.password = password
    if (name || role) updatePayload.user_metadata = { ...(body.user_metadata || {}), ...(name ? { name } : {}), ...(role ? { role } : {}) }

    const { data, error } = await supabase.auth.admin.updateUserById(id, updatePayload)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ user: data.user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
