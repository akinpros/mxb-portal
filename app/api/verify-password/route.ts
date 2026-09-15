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
  if (!user?.email) return NextResponse.json({ ok: false }, { status: 401 })

  const { password, action } = await req.json()

  // Re-authenticate with current password
  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
  if (error) {
    // Log failed re-auth attempt
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    await adminClient.from('mxb_security_log').insert({
      user_email: user.email,
      action: 'reauth_failed',
      details: { attempted_action: action },
      ip_address: ip,
      user_agent: req.headers.get('user-agent') || 'unknown',
    })
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 })
  }

  // Log successful re-auth
  await adminClient.from('mxb_security_log').insert({
    user_email: user.email,
    action: 'reauth_success',
    details: { action },
    ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
  })

  return NextResponse.json({ ok: true })
}
