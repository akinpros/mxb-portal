import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { contact_name, surname, brand, phone, website, email, password } = await req.json()

  if (!email || !password || !contact_name) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { mxb_role: 'awards' },
  })

  if (authError) {
    const msg = authError.message.includes('already registered')
      ? 'Este email ya está registrado.'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { error: dbError } = await admin.from('mxb_awards_members').insert({
    user_id: authData.user.id,
    contact_name,
    surname: surname ?? null,
    brand: brand ?? null,
    phone: phone ?? null,
    website: website ?? null,
    email,
    approved: false,
  })

  if (dbError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
