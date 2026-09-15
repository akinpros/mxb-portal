import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { brand, name, email, role, message } = await req.json()

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'REPLACE_WITH_BREVO_API_KEY') {
    console.log('Brevo API key not set — email not sent')
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
      subject: `🤝 Nueva solicitud Brand Partner: ${brand}`,
      htmlContent: `
        <h2>Nueva solicitud Brand Partner</h2>
        <p><strong>Marca:</strong> ${brand}</p>
        <p><strong>Contacto:</strong> ${name} — ${role}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${message || '—'}</p>
        <br/>
        <a href="https://mxb-portal.vercel.app/admin" style="background:#C9A227;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver en Admin →</a>
      `,
    }),
  })

  return NextResponse.json({ ok: res.ok })
}
