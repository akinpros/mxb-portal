import { NextResponse } from 'next/server'
import { MEMBER_COOKIE } from '@/lib/member-session'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(MEMBER_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
