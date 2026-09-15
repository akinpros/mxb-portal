import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { factorId, code, action } = await req.json()

  const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeErr || !challenge) {
    return NextResponse.json({ error: 'Challenge failed' }, { status: 400 })
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })

  if (error) {
    await adminClient.from('mxb_security_log').insert({
      user_email: user.email,
      action: 'mfa_verify_failed',
      details: { attempted_action: action },
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    })
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })
  }

  await adminClient.from('mxb_security_log').insert({
    user_email: user.email,
    action: action === 'enroll' ? 'mfa_enrolled' : 'mfa_verified',
    details: {},
    ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
  })

  return NextResponse.json({ ok: true })
}
