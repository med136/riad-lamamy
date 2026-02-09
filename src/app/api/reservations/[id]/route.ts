import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

const sendEmail = async (payload: { to: string; subject: string; html: string; text?: string }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    
    const supabase = createAdminClient()
    
    const {
      guest_name,
      guest_email,
      guest_phone,
      guest_count,
      room_id,
      check_in,
      check_out,
      total_amount,
      paid_amount,
      status,
      special_requests,
      admin_notes
    } = body

    const { data: existing, error: existingError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const updatePayload: any = {}

    if (guest_name !== undefined) updatePayload.guest_name = guest_name
    if (guest_email !== undefined) updatePayload.guest_email = guest_email
    if (guest_phone !== undefined) updatePayload.guest_phone = guest_phone
    if (guest_count !== undefined) updatePayload.guest_count = guest_count
    if (room_id !== undefined) updatePayload.room_id = room_id
    if (check_in !== undefined) updatePayload.check_in = check_in
    if (check_out !== undefined) updatePayload.check_out = check_out
    if (total_amount !== undefined) updatePayload.total_amount = parseFloat(total_amount)
    if (paid_amount !== undefined) updatePayload.paid_amount = parseFloat(paid_amount)
    if (status !== undefined) updatePayload.status = status
    if (special_requests !== undefined) updatePayload.special_requests = special_requests
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes

    const { data, error } = await supabase
      .from('reservations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const statusChanged = existing.status !== data.status
    const modified =
      existing.check_in !== data.check_in ||
      existing.check_out !== data.check_out ||
      existing.room_id !== data.room_id ||
      existing.guest_count !== data.guest_count ||
      existing.total_amount !== data.total_amount

    if (data.guest_email && (statusChanged || modified)) {
      if (data.status === 'cancelled') {
        const cancelSubject = `Reservation cancelled ${data.reference}`
        const cancelHtml = `
          <p>Hello ${data.guest_name},</p>
          <p>Your reservation has been cancelled.</p>
          <p><strong>Reference:</strong> ${data.reference}</p>
        `
        await sendEmail({ to: data.guest_email, subject: cancelSubject, html: cancelHtml })
      } else {
        const updateSubject = `Reservation updated ${data.reference}`
        const updateHtml = `
          <p>Hello ${data.guest_name},</p>
          <p>Your reservation has been updated.</p>
          <p><strong>Reference:</strong> ${data.reference}</p>
          <p><strong>Dates:</strong> ${data.check_in} to ${data.check_out}</p>
          <p><strong>Total:</strong> ${data.total_amount} MAD</p>
        `
        await sendEmail({ to: data.guest_email, subject: updateSubject, html: updateHtml })
      }
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Reservation deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
