import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, apellidos, empresa, cargo, email, pais, presupuesto, mensaje } = body

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'REPLACE_WITH_BREVO_API_KEY') {
    console.log('Brevo API key not set')
    return NextResponse.json({ ok: false, reason: 'no_key' })
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'MXB Portal', email: 'hello@moviesxbrands.com' },
      to: [{ email: 'cannes@moviesxbrands.com', name: 'MXB Team' }],
      subject: `🌟 Nueva solicitud Hospitality · Cannes 2027 — ${empresa}`,
      htmlContent: `
        <h2 style="color:#C9A227;">Nueva solicitud · Hospitality &amp; Celebration · Cannes 2027</h2>
        <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">
          <tr><td style="padding:8px;font-weight:bold;width:160px;">Nombre</td><td style="padding:8px;">${nombre} ${apellidos}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Empresa / Marca</td><td style="padding:8px;">${empresa}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Cargo</td><td style="padding:8px;">${cargo}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;">País</td><td style="padding:8px;">${pais}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Presupuesto</td><td style="padding:8px;">${presupuesto || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Mensaje</td><td style="padding:8px;">${mensaje || '—'}</td></tr>
        </table>
        <br/>
        <a href="https://mxb-portal.vercel.app/admin" style="background:#C9A227;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver en Admin Panel →</a>
      `,
    }),
  })

  return NextResponse.json({ ok: res.ok })
}
