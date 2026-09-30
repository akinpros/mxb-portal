import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pbkdf2Sync, randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^﻿/, '')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// GET ?token=xxx — validate token and return member info for the form
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token requerido.' }, { status: 400 })

  const admin = getAdmin()
  const { data, error } = await admin.rpc('get_member_by_activation_token', { p_token: token })

  const member = data?.[0] ?? null
  if (error || !member) return NextResponse.json({ error: 'Enlace inválido o ya utilizado.' }, { status: 404 })

  if (new Date(member.activation_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este enlace ha expirado. Contacta con el equipo de Movies × Brands.' }, { status: 410 })
  }

  return NextResponse.json({
    email: member.email,
    name: [member.contact_name, member.surname].filter(Boolean).join(' ') || '',
  })
}

// POST { token, password } — set password and activate account
export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 422 })
  }

  const admin = getAdmin()
  const { data, error } = await admin.rpc('get_member_by_activation_token', { p_token: token })

  const member = data?.[0] ?? null
  if (error || !member) return NextResponse.json({ error: 'Enlace inválido o ya utilizado.' }, { status: 404 })

  if (new Date(member.activation_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este enlace ha expirado. Contacta con el equipo de Movies × Brands.' }, { status: 410 })
  }

  await admin.rpc('update_member_password', {
    p_member_id: member.id,
    p_password_hash: hashPassword(password),
  })

  await admin.from('mxb_security_log').insert({
    user_email: member.email,
    user_role: 'member',
    action: 'account_activated',
    details: { method: 'activation_link' },
  })

  return NextResponse.json({ ok: true, email: member.email })
}
