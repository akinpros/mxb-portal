import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assignCredits(email: string, amount: number, source: string, idempotencyKey: string) {
  const admin = getAdmin()
  // Idempotency: skip if already processed
  const { data: existing } = await admin
    .from('mxb_credit_transactions')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .single()

  if (existing) return { skipped: true }

  // Get current credits
  const { data: member } = await admin
    .from('mxb_selection_members')
    .select('credits')
    .eq('email', email)
    .single()

  const currentCredits = member?.credits || 0
  const newCredits = currentCredits + amount

  await admin
    .from('mxb_selection_members')
    .update({ credits: newCredits, paid: true, approved: true })
    .eq('email', email)

  // Record transaction
  await admin.from('mxb_credit_transactions').insert({
    email,
    amount,
    source,
    idempotency_key: idempotencyKey,
    credits_before: currentCredits,
    credits_after: newCredits,
  })

  // Log to security audit
  await admin.from('mxb_security_log').insert({
    user_email: email,
    user_role: 'member',
    action: 'credits_assigned',
    details: { amount, source, idempotencyKey, credits_before: currentCredits, credits_after: newCredits },
  })

  // Notify admin
  await admin.from('mxb_admin_notifications').insert({
    type: 'new_member_purchase',
    unread: true,
    priority: 'high',
    title: `Nuevo pago — ${email}`,
    text: `Membresía completada. +${amount} créditos asignados. Total: ${newCredits}`,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  })

  return { ok: true, credits: newCredits }
}

export async function POST(req: NextRequest) {
  const TC_SECRET = process.env.THRIVECART_SECRET_KEY || ''
  const body = await req.json()

  // Verify ThriveCart secret
  if (TC_SECRET && body.thrivecart?.secret_key !== TC_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const event = body.thrivecart?.event || body.event
  const orderId = body.thrivecart?.order_id || body.order_id
  const email = body.customer?.email || body.thrivecart?.customer?.email

  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  const idempotencyKey = `tc_${orderId}`

  if (event === 'order.success' || event === 'purchase') {
    // Members get 30 credits per referral signup+payment — but base membership itself = mark paid+approved
    const result = await assignCredits(email, 0, 'membership_purchase', idempotencyKey)
    if (result.skipped) return NextResponse.json({ ok: true, skipped: true })

    // If there's a referrer, give them 30 credits
    const referrerId = body.thrivecart?.affiliate?.email || body.affiliate_email
    if (referrerId) {
      await assignCredits(referrerId, 30, `referral_${email}`, `tc_ref_${orderId}`)
    }
  }

  return NextResponse.json({ ok: true })
}
