import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyMemberSession, MEMBER_COOKIE } from '@/lib/member-session'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Session inactivity timeout (30 minutes) for Supabase-auth users
  if (user) {
    const lastActive = request.cookies.get('mxb_last_active')?.value
    const now = Date.now()
    if (lastActive && now - parseInt(lastActive) > 30 * 60 * 1000) {
      await supabase.auth.signOut()
      const dest = pathname.startsWith('/portal') ? '/portal/login' : '/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    supabaseResponse.cookies.set('mxb_last_active', String(now), { maxAge: 60 * 60, httpOnly: true, sameSite: 'lax' })
  }

  // Always allow: API routes, auth callbacks, static assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    return supabaseResponse
  }

  // Guard member portal — requires valid mxb_ms session cookie
  if (pathname.startsWith('/portal/member')) {
    const token = request.cookies.get(MEMBER_COOKIE)?.value
    const email = token ? await verifyMemberSession(token) : null
    if (!email) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}
