import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signMemberSession, MEMBER_COOKIE } from '@/lib/member-session'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^﻿/, '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos.' }, { status: 400 })
  }

  const admin = getAdmin()

  // Check if member already exists
  const { data: existing } = await admin
    .from('mxb_selection_members')
    .select('id, paid, approved, profile_status, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing) {
    // Already registered — return their current status so the client can show the right screen
    const token = await signMemberSession(email.toLowerCase().trim())
    const res = NextResponse.json({
      ok: true,
      status: existing.profile_status,
      paid: existing.paid,
      approved: existing.approved,
      existing: true,
    })
    res.cookies.set(MEMBER_COOKIE, token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
    })
    return res
  }

  // Hash password server-side
  const { pbkdf2Sync, randomBytes } = await import('crypto')
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const password_hash = `${salt}:${hash}`

  const { error } = await admin.from('mxb_selection_members').insert({
    email: email.toLowerCase().trim(),
    contact_name: name || '',
    password_hash,
    paid: false,
    approved: false,
    profile_status: 'pending_payment',
  })

  if (error) {
    console.error('[register]', error)
    return NextResponse.json({ error: 'No se pudo crear la cuenta.' }, { status: 500 })
  }

  const token = await signMemberSession(email.toLowerCase().trim())
  const res = NextResponse.json({ ok: true, status: 'pending_payment', paid: false, approved: false })
  res.cookies.set(MEMBER_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
  })
  return res
}
