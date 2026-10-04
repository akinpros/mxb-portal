import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyMemberSession, MEMBER_COOKIE } from '@/lib/member-session'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^﻿/, '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  // Verify session cookie
  const token = req.cookies.get(MEMBER_COOKIE)?.value
  const sessionEmail = token ? await verifyMemberSession(token) : null

  // Also accept email from body (for cases where cookie isn't set yet)
  const { email: bodyEmail } = await req.json().catch(() => ({}))
  const email = sessionEmail || bodyEmail
  if (!email) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const admin = getAdmin()
  const { error } = await admin
    .from('mxb_selection_members')
    .update({
      paid: true,
      profile_status: 'pending_approval',
      updated_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim())
    .eq('paid', false) // only update if not already paid (idempotency)

  if (error) {
    console.error('[confirm-payment]', error)
    return NextResponse.json({ error: 'Error al confirmar el pago.' }, { status: 500 })
  }

  // Admin notification
  try {
    await admin.from('mxb_admin_notifications').insert({
      type: 'new_member_purchase',
      unread: true,
      priority: 'high',
      title: `Nuevo pago — ${email}`,
      text: `Membresía confirmada vía ThriveCart. Pendiente de aprobación.`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, status: 'pending_approval' })
}
