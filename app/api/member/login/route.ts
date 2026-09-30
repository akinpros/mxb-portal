import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pbkdf2Sync } from 'crypto'
import { signMemberSession, MEMBER_COOKIE } from '@/lib/member-session'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^﻿/, '')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  try {
    const test = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return test === hash
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Credenciales requeridas.' }, { status: 400 })
  }

  const admin = getAdmin()
  const { data } = await admin.rpc('get_member_by_email', { p_email: email })
  const member = data?.[0] ?? null

  if (!member) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 })
  }

  if (!member.password_hash) {
    return NextResponse.json({ error: 'Cuenta pendiente de activación. Revisa tu correo.' }, { status: 403 })
  }

  if (!verifyPassword(password, member.password_hash)) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 })
  }

  const sessionToken = await signMemberSession(email)
  const res = NextResponse.json({
    ok: true,
    member: {
      email: member.email,
      contactName: member.contact_name || '',
      surname: member.surname || '',
      displayName: member.display_name || member.contact_name || '',
      phone: member.phone || '',
      brand: member.brand || '',
      website: member.website || '',
      photo: member.photo || '',
      categories: member.categories || [],
      bioShort: member.bio_short || '',
      bioLong: member.bio_long || '',
      editions: member.editions || { cannes: false, berlinale: false },
      approved: !!member.approved,
      profileStatus: member.profile_status || 'pending_basic_info',
      paid: !!member.paid,
      credits: member.credits || 0,
      memberSlug: member.member_slug || '',
      isVerified: !!member.is_verified,
      allowConnections: member.allow_connections !== false,
    },
  })
  res.cookies.set(MEMBER_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return res
}
