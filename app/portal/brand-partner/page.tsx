'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const GOLD = '#C9A227'
const BLACK = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 8,
  border: '1.5px solid #2c2c2c', background: '#1a1a1a', color: '#fff',
  fontSize: 15, outline: 'none', fontFamily: "'Inter', Arial, sans-serif",
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
  marginBottom: 6, letterSpacing: 0.5,
}

export default function BrandPartnerPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    brand_name: '', contact_name: '', role: '', email: '',
    phone: '', website: '', country: '', message: '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: insertError } = await supabase.from('mxb_brand_partner_leads').insert({
      brand_name: form.brand_name,
      contact_name: form.contact_name,
      role: form.role,
      email: form.email,
      phone: form.phone,
      website: form.website,
      country: form.country,
      message: form.message,
    })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    await supabase.from('mxb_admin_notifications').insert({
      type: 'brand_partner_lead',
      title: `Nueva solicitud Brand Partner: ${form.brand_name}`,
      priority: 'high',
    })
    // Fire and forget — don't block success state on email
    fetch('/api/notify-brand-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: form.brand_name,
        name: form.contact_name,
        email: form.email,
        role: form.role,
        message: form.message,
      }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <main style={{ background: BLACK, minHeight: '100vh', fontFamily: "'Inter', Arial, sans-serif", color: '#fff' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=Inter:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 68,
        background: BLACK, borderBottom: `1px solid ${LINE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
      }}>
        <Link href="/portal" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: "'Fraunces', serif", color: GOLD, fontWeight: 700, fontSize: 22 }}>MXB</span>
          <span style={{ color: '#fff', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginLeft: 6, opacity: 0.7 }}>· The Portal</span>
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/portal/register" style={{
            background: GOLD, color: BLACK, padding: '9px 20px', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>Unirse al Portal →</Link>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 40px' }}>
        <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>BRAND & PARTNERSHIPS</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, marginBottom: 20, lineHeight: 1.1 }}>
          Únete como<br />Brand Partner
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 60, maxWidth: 560 }}>
          No es autoregistro. Ser Brand Partner es una alianza exclusiva, filtrada y aprobada manualmente por el equipo de Movies × Brands. Rellena el formulario y nos pondremos en contacto contigo.
        </p>

        {submitted ? (
          <div style={{
            background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16,
            padding: '60px 48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: GOLD, marginBottom: 16 }}>Solicitud recibida</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7 }}>
              Nuestro equipo la revisará y se pondrá en contacto contigo en los próximos días.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>NOMBRE DE MARCA *</label>
                <input required style={inputStyle} value={form.brand_name} onChange={e => update('brand_name', e.target.value)} placeholder="Marca S.L." />
              </div>
              <div>
                <label style={labelStyle}>NOMBRE DE CONTACTO *</label>
                <input required style={inputStyle} value={form.contact_name} onChange={e => update('contact_name', e.target.value)} placeholder="Ana García" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>CARGO / PUESTO</label>
                <input style={inputStyle} value={form.role} onChange={e => update('role', e.target.value)} placeholder="CEO, Directora de Marketing…" />
              </div>
              <div>
                <label style={labelStyle}>EMAIL *</label>
                <input required type="email" style={inputStyle} value={form.email} onChange={e => update('email', e.target.value)} placeholder="contacto@marca.com" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>TELÉFONO</label>
                <input type="tel" style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+34 600 000 000" />
              </div>
              <div>
                <label style={labelStyle}>PAÍS</label>
                <input style={inputStyle} value={form.country} onChange={e => update('country', e.target.value)} placeholder="España" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>SITIO WEB</label>
              <input type="url" style={inputStyle} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://tumarca.com" />
            </div>
            <div>
              <label style={labelStyle}>MENSAJE / ¿QUÉ BUSCAS EN EL ECOSISTEMA?</label>
              <textarea
                required rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                value={form.message} onChange={e => update('message', e.target.value)}
                placeholder="Cuéntanos sobre tu marca, tus objetivos y cómo te gustaría colaborar con el ecosistema Movies × Brands…"
              />
            </div>
            {error && (
              <div style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.4)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              background: GOLD, color: BLACK, padding: '16px', borderRadius: 10, border: 'none',
              fontSize: 16, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%',
            }}>{loading ? 'Enviando...' : 'Solicitar información como Brand Partner →'}</button>
          </form>
        )}
      </div>
    </main>
  )
}
