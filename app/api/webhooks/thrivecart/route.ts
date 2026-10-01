import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^﻿/, '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function sendActivationEmail(email: string, name: string, token: string) {
  const key = process.env.BREVO_API_KEY
  if (!key || key.startsWith('REPLACE')) {
    console.warn('[ThriveCart] Brevo key not set — skipping activation email for', email)
    return
  }
  const url = `https://moviesxbrands.com/portal/activate?token=${token}`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Movies × Brands', email: 'noreply@moviesxbrands.com' },
      to: [{ email, name }],
      subject: 'Activa tu cuenta en Movies × Brands',
      htmlContent: `
<div style="background:#08090b;padding:48px 24px;font-family:'Inter',Helvetica,sans-serif;color:#f5f1e8;">
  <div style="max-width:520px;margin:0 auto;background:#141517;border-radius:12px;padding:40px;border:1px solid #353435;">
    <p style="color:#c9a94f;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:0 0 24px;">Movies × Brands</p>
    <h2 style="color:#f5f1e8;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">Bienvenido/a, ${name}</h2>
    <p style="color:#a0998a;line-height:1.7;margin:0 0 12px;">Tu compra ha sido confirmada.</p>
    <p style="color:#a0998a;line-height:1.7;margin:0 0 32px;">Activa tu cuenta para completar tu perfil y acceder al ecosistema que une cine, marcas, inteligencia artificial e impacto humano.</p>
    <a href="${url}" style="display:inline-block;padding:15px 32px;background:#c9a94f;color:#08090b;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px;letter-spacing:.02em;">
      Activar mi cuenta →
    </a>
    <p style="color:#555;font-size:12px;margin-top:36px;line-height:1.6;">Este enlace expira en 48 horas.<br>Si no realizaste esta compra, ignora este correo.</p>
  </div>
</div>`,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[ThriveCart] Brevo error:', err)
  }
}

async function addReferralCredits(
  email: string,
  amount: number,
  source: string,
  idempotencyKey: string
) {
  const admin = getAdmin()
  const { data: existing } = await admin
    .from('mxb_credit_transactions')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .single()
  if (existing) return

  const { data: member } = await admin
    .from('mxb_selection_members')
    .select('credits')
    .eq('email', email)
    .single()
  const before = member?.credits || 0
  const after = before + amount

  await admin.from('mxb_selection_members').update({ credits: after }).eq('email', email)
  await admin.from('mxb_credit_transactions').insert({
    email, amount, source, idempotency_key: idempotencyKey,
    credits_before: before, credits_after: after,
  })
}

export async function POST(req: NextRequest) {
  const TC_SECRET = process.env.THRIVECART_SECRET_KEY || ''
  const body = await req.json()

  if (TC_SECRET && body.thrivecart?.secret_key !== TC_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const event = body.thrivecart?.event || body.event
  const orderId = body.thrivecart?.order_id || body.order_id
  const email = (body.customer?.email || body.thrivecart?.customer?.email || '').toLowerCase().trim()
  const firstName = body.customer?.first_name || body.thrivecart?.customer?.first_name || ''
  const lastName = body.customer?.last_name || body.thrivecart?.customer?.last_name || ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || email

  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  if (event === 'order.success' || event === 'purchase') {
    const idempKey = `tc_${orderId}`
    const admin = getAdmin()

    // Idempotency check
    const { data: txExist } = await admin
      .from('mxb_credit_transactions')
      .select('id')
      .eq('idempotency_key', idempKey)
      .single()
    if (txExist) return NextResponse.json({ ok: true, skipped: true })

    // Generate activation token (48h)
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    // Upsert member
    const { data: existing } = await admin
      .from('mxb_selection_members')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      await admin.from('mxb_selection_members').update({
        paid: true,
        approved: false,
        profile_status: 'pending_activation',
        activation_token: token,
        activation_expires_at: expires,
        updated_at: new Date().toISOString(),
      }).eq('email', email)
    } else {
      await admin.from('mxb_selection_members').insert({
        email,
        contact_name: firstName || name,
        surname: lastName,
        password_hash: '',
        paid: true,
        approved: false,
        profile_status: 'pending_activation',
        activation_token: token,
        activation_expires_at: expires,
      })
    }

    // Record transaction (0 credits — credits come from referrals only)
    await admin.from('mxb_credit_transactions').insert({
      email, amount: 0, source: 'membership_purchase',
      idempotency_key: idempKey, credits_before: 0, credits_after: 0,
    })

    // Admin notification
    await admin.from('mxb_admin_notifications').insert({
      type: 'new_member_purchase',
      unread: true,
      priority: 'high',
      title: `Nuevo pago — ${email}`,
      text: `Membresía confirmada. Activation email enviado a ${name}.`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    })

    await sendActivationEmail(email, name, token)

    // Referral credits
    const referrerId = body.thrivecart?.affiliate?.email || body.affiliate_email
    if (referrerId) {
      await addReferralCredits(referrerId, 30, `referral_${email}`, `tc_ref_${orderId}`)
    }
  }

  return NextResponse.json({ ok: true })
}
