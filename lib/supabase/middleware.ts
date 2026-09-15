import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Session inactivity timeout (30 minutes)
  if (user) {
    const lastActive = request.cookies.get('mxb_last_active')?.value
    const now = Date.now()
    if (lastActive && now - parseInt(lastActive) > 30 * 60 * 1000) {
      // Session expired — sign out
      await supabase.auth.signOut()
      const dest = pathname.startsWith('/portal') ? '/portal/login' : '/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    // Update last active timestamp
    supabaseResponse.cookies.set('mxb_last_active', String(now), { maxAge: 60 * 60, httpOnly: true, sameSite: 'lax' })
  }

  // Always allow: API routes, static assets, auth callbacks, and self-contained HTML apps
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/portal/member') ||
    pathname.startsWith('/portal/institution') ||
    pathname.startsWith('/portal/members') ||
    pathname.startsWith('/portal/hospitality') ||
    pathname.startsWith('/portal/redcarpet')
  ) {
    return supabaseResponse
  }

  return supabaseResponse
}
