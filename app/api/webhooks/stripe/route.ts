import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  // Verify Stripe signature if secret is configured
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      // Dynamic import to avoid build errors when stripe package not installed
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
      const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)

      const body = event.data.object as unknown as Record<string, unknown>
      const email = (body.customer_email as string) ||
        ((body.customer_details as Record<string, unknown>)?.email as string)

      if (!email) return NextResponse.json({ received: true })

      const idempotencyKey = `stripe_${event.id}`

      // Check idempotency
      const { data: existing } = await admin
        .from('mxb_credit_transactions')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .single()

      if (existing) return NextResponse.json({ received: true, skipped: true })

      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        await admin
          .from('mxb_selection_members')
          .update({ paid: true, approved: true })
          .eq('email', email)

        await admin.from('mxb_credit_transactions').insert({
          email,
          amount: 0,
          source: 'stripe_membership',
          idempotency_key: idempotencyKey,
        })

        await admin.from('mxb_admin_notifications').insert({
          type: 'new_member_purchase',
          unread: true,
          priority: 'high',
          title: `Pago Stripe — ${email}`,
          text: `Membresía activada vía Stripe.`,
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        })

        await admin.from('mxb_security_log').insert({
          user_email: email,
          action: 'payment_completed',
          details: { provider: 'stripe', event: event.type, event_id: event.id },
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Webhook error'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
  } else {
    // No secret configured yet — log for debugging
    console.log('[Stripe webhook] No secret configured, skipping verification')
  }

  return NextResponse.json({ received: true })
}
