'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap');
:root{--gold:#C9A227;--champagne:#E8D5C4;--black:#0B0B0B;--line:#2c2c2c;--gold-deep:#A9841B;}
*{box-sizing:border-box;margin:0;padding:0;}
.gw-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;padding-top:104px;
  background:linear-gradient(rgba(0,0,0,.88),rgba(0,0,0,.94)),
  url('https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-31-at-6.08.06-PM.jpeg') center/cover no-repeat;
  font-family:'Inter',Arial,sans-serif;}
.gw-topbar{position:fixed;top:0;left:0;right:0;z-index:10;height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:0 28px;background:rgba(11,11,11,.7);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.14);}
.gw-topbar .logo{display:flex;align-items:baseline;gap:8px;text-decoration:none;font-family:'Fraunces',Georgia,serif;letter-spacing:.04em;}
.gw-topbar .logo .mxb{font-size:14px;color:#F7F3EC;font-weight:500;}
.gw-topbar .logo .sep{color:var(--gold);font-size:12px;}
.gw-topbar .back{color:rgba(247,243,236,.68);text-decoration:none;font-size:12px;font-family:'Inter',sans-serif;}
.gw-topbar .back:hover{color:var(--gold);}
.gw-eyebrow{text-align:center;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:10px;}
.gw-title{text-align:center;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:32px;color:#F7F3EC;margin-bottom:32px;}
.gw-card{width:100%;max-width:520px;background:#FFFFFF;color:#171512;border:none;border-radius:16px;padding:36px 34px;box-shadow:0 40px 90px rgba(0,0,0,.45);}
.gw-card h3{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:22px;color:#171512;text-align:center;margin-bottom:8px;}
.gw-card .subtitle{font-size:12px;text-align:center;color:rgba(23,21,18,.62);font-family:'Inter',sans-serif;margin-bottom:24px;line-height:1.6;}
.gw-field{margin-bottom:15px;}
.gw-field label{display:block;font-size:11.5px;font-weight:600;color:#171512;margin-bottom:7px;font-family:'Inter',sans-serif;}
.gw-field input,.gw-field select,.gw-field textarea{width:100%;padding:11px 14px;background:#FBFAF7;border:1px solid rgba(11,11,11,.10);border-radius:6px;color:#171512;font-size:14.5px;font-family:'Inter',sans-serif;}
.gw-field input:focus,.gw-field select:focus,.gw-field textarea:focus{outline:none;border-color:var(--gold);background:#fff;}
.gw-pw-wrap{position:relative;}
.gw-pw-wrap input{padding-right:42px;}
.gw-pw-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;opacity:.5;color:#171512;}
.gw-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.gw-btn{width:100%;padding:13px;margin-top:6px;background:#0B0B0B;color:#F7F3EC;border:none;border-radius:6px;cursor:pointer;
  font-size:13px;letter-spacing:.03em;font-weight:600;font-family:'Inter',sans-serif;transition:background .2s;}
.gw-btn:hover{background:#000;}
.gw-btn:disabled{opacity:.35;cursor:not-allowed;}
.gw-link{display:block;width:100%;text-align:center;margin-top:14px;background:none;border:none;color:var(--gold-deep);
  cursor:pointer;font-size:11.5px;font-weight:600;letter-spacing:.03em;font-family:'Inter',sans-serif;text-decoration:none;}
.gw-link:hover{text-decoration:underline;}
.gw-msg{margin-top:12px;font-size:13px;line-height:1.6;text-align:center;}
.gw-msg.ok{color:var(--gold-deep);}
.gw-msg.err{color:#C0392B;}
.gw-footer{margin-top:22px;padding-top:16px;border-top:1px solid rgba(11,11,11,.10);text-align:center;font-size:10.5px;color:rgba(23,21,18,.55);font-family:'Inter',sans-serif;line-height:1.8;}
/* Checkout screen (step 2) */
.mxb-checkout-screen{min-height:100vh;background:#070707;color:#f4efe5;font-family:'Inter',Arial,sans-serif;position:relative;overflow-x:hidden;}
.mxb-checkout-screen::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 13% 8%,rgba(201,162,39,.14),transparent 31%),radial-gradient(circle at 90% 88%,rgba(118,19,20,.13),transparent 28%)}
.mxb-checkout-nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(18px,5vw,64px);border-bottom:1px solid rgba(201,162,39,.22);position:relative;z-index:2;background:rgba(7,7,7,.88);backdrop-filter:blur(14px)}
.mxb-checkout-logo{font:400 18px 'Fraunces',Georgia,serif;letter-spacing:.12em;color:#f4efe5;text-decoration:none}.mxb-checkout-logo span{color:#c9a227}
.mxb-checkout-back{border:0;background:transparent;color:rgba(255,255,255,.66);font:600 10px 'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.mxb-checkout-shell{width:min(1100px,calc(100% - 80px));margin:0 auto;padding:60px 0 80px;position:relative;z-index:1}
.mxb-checkout-head{text-align:center;max-width:660px;margin:0 auto 36px}
.mxb-checkout-kicker{font-size:9px;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:#c9a227;margin-bottom:15px}
.mxb-checkout-head h1{font:400 clamp(32px,4vw,52px)/.98 'Fraunces',Georgia,serif;letter-spacing:-.02em;margin:0 0 14px;color:#f5f0e7}
.mxb-checkout-head p{max-width:545px;margin:0 auto;color:rgba(255,255,255,.64);font-size:12px;line-height:1.7}
.mxb-checkout-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,1fr);gap:26px;align-items:stretch}
.mxb-checkout-panel{background:linear-gradient(145deg,rgba(20,20,20,.96),rgba(10,10,10,.98));border:1px solid rgba(201,162,39,.27);box-shadow:0 22px 64px rgba(0,0,0,.38);display:flex;flex-direction:column;padding:29px;}
.mxb-membership-label{font-size:8px;font-weight:700;letter-spacing:.2em;color:#c9a227;text-transform:uppercase;margin-bottom:11px}
.mxb-checkout-panel h2{font:400 24px/1.08 'Fraunces',Georgia,serif;margin:0 0 10px}
.mxb-checkout-panel > p{color:rgba(255,255,255,.58);font-size:11px;line-height:1.65;margin:0 0 20px}
.mxb-membership-price{padding:18px 0;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:16px}
.mxb-membership-price strong{font:400 37px 'Fraunces',Georgia,serif;color:#e1c56f}.mxb-membership-price span{font-size:10px;color:rgba(255,255,255,.46)}
.mxb-includes{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.025)}
.mxb-includes summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 15px;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.mxb-includes summary::-webkit-details-marker{display:none}.mxb-includes summary::after{content:"+";font:300 19px/1 'Inter',sans-serif;color:#c9a227}.mxb-includes[open] summary::after{content:"−"}
.mxb-includes-list{list-style:none;margin:0;padding:0 15px 16px;display:grid;gap:10px}
.mxb-includes-list li{display:grid;grid-template-columns:19px 1fr;gap:8px;color:rgba(255,255,255,.66);font-size:10px;line-height:1.42}
.mxb-includes-list i{width:16px;height:16px;border:1px solid rgba(201,162,39,.43);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c9a227;font-size:8px;font-style:normal}
.mxb-includes-list b{color:#fff;font-weight:600}
.mxb-checkout-trust{display:flex;gap:13px;flex-wrap:wrap;margin-top:auto;padding-top:16px;color:rgba(255,255,255,.42);font-size:8px;letter-spacing:.07em;text-transform:uppercase}
.mxb-checkout-trust span::before{content:"✓";color:#c9a227;margin-right:5px}
.mxb-payment-step{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#c9a227;margin-bottom:10px}
.mxb-payment-intro{font-size:10.5px;color:rgba(255,255,255,.53);line-height:1.55;margin-bottom:19px}
.mxb-thrivecart-frame{flex:1;min-height:280px;border:1px solid rgba(255,255,255,.12);background:#f7f3ec;color:#181613;padding:21px;display:flex;flex-direction:column;justify-content:center}
.mxb-thrivecart-placeholder{text-align:center}
.mxb-thrivecart-placeholder h3{font:500 20px 'Fraunces',Georgia,serif;color:#181613;margin:0 0 7px}
.mxb-thrivecart-placeholder p{font-size:10px;line-height:1.6;color:rgba(24,22,19,.58);max-width:288px;margin:0 auto 15px}
.mxb-thrivecart-placeholder button{width:100%;border:0;background:#0b0b0b;color:#fff;padding:12px 14px;font-size:13px;font-weight:600;cursor:pointer;border-radius:6px}
.mxb-checkout-legal{text-align:center;margin-top:13px;color:rgba(255,255,255,.35);font-size:8.5px;line-height:1.55}
.mxb-checkout-legal a{color:rgba(225,197,111,.72)}
@media(max-width:760px){.mxb-checkout-grid{grid-template-columns:1fr}.mxb-checkout-shell{width:calc(100% - 40px);padding-top:36px}}
/* Pending (step 3) */
.pending-check{font-size:38px;margin-bottom:10px;text-align:center;}
.pending-avatar-box{width:88px;height:88px;border-radius:50%;background:#F7F3EC;border:2px solid var(--gold);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:28px;overflow:hidden;}
.pending-avatar-box img{width:100%;height:100%;object-fit:cover;}
.pending-category-list{display:flex;flex-direction:column;gap:6px;margin-top:6px;}
.pending-category-list label{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;color:#171512;font-weight:400;}
`

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [referredBy, setReferredBy] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferredBy(ref)
  }, [])

  // Step 1
  const [form, setForm] = useState({ nombre: '', apellidos: '', telefono: '', email: '', password: '', confirmPassword: '' })
  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  // Step 3 (pending profile)
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [pendingMsg, setPendingMsg] = useState('')
  const [pendingSaving, setPendingSaving] = useState(false)

  function toggleCategory(val: string) {
    setCategories(prev => prev.includes(val)
      ? prev.filter(c => c !== val)
      : prev.length < 2 ? [...prev, val] : prev
    )
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    if (form.password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: `${form.nombre} ${form.apellidos}`, phone: form.telefono } },
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    const userId = data.user?.id
    await supabase.from('mxb_selection_members').insert({
      email: form.email,
      contact_name: form.nombre,
      surname: form.apellidos,
      phone: form.telefono,
      password_hash: 'supabase_auth',
      ...(referredBy ? { referred_by: referredBy } : {}),
    })
    if (userId) {
      await fetch('/api/set-member-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    }
    // Award 10 credits to the referrer
    if (referredBy) {
      const { data: referrer } = await supabase
        .from('mxb_selection_members')
        .select('credits')
        .eq('email', referredBy)
        .single()
      if (referrer) {
        const newCredits = (referrer.credits ?? 0) + 10
        await supabase
          .from('mxb_selection_members')
          .update({ credits: newCredits })
          .eq('email', referredBy)
        await supabase.from('mxb_credit_transactions').insert({
          email: referredBy,
          amount: 10,
          source: 'referral',
          idempotency_key: `referral_${form.email}_${Date.now()}`,
          credits_before: referrer.credits ?? 0,
          credits_after: newCredits,
        })
      }
    }
    setDisplayName(`${form.nombre} ${form.apellidos}`)
    setLoading(false)
    setStep(2)
  }

  async function handlePendingSubmit() {
    setPendingSaving(true)
    const { error: err } = await supabase.from('mxb_selection_members')
      .update({ display_name: displayName, bio_short: description, categories })
      .eq('email', form.email)
    if (!err) {
      setPendingMsg('Solicitud enviada — revisaremos tu perfil pronto.')
    } else {
      setPendingMsg('Error al guardar. Inténtalo de nuevo.')
    }
    setPendingSaving(false)
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPendingAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Step 2: Payment ──
  if (step === 2) {
    return (
      <div className="mxb-checkout-screen">
        <style>{CSS}</style>
        <nav className="mxb-checkout-nav">
          <a href="https://moviesxbrands.com" className="mxb-checkout-logo">MOVIES <span>×</span> BRANDS</a>
          <button className="mxb-checkout-back" onClick={() => setStep(1)}>← Volver</button>
        </nav>
        <main className="mxb-checkout-shell">
          <header className="mxb-checkout-head">
            <div className="mxb-checkout-kicker">Movies × Brands Membership</div>
            <h1>ENTRA EN EL ECOSISTEMA.</h1>
            <p>Construye autoridad, fórmate en IA y accede a conexiones, escenarios y oportunidades que pueden llevar tu talento o tu marca más lejos.</p>
          </header>
          <div className="mxb-checkout-grid">
            <section className="mxb-checkout-panel">
              <div className="mxb-membership-label">Membresía anual</div>
              <h2>Tu próxima oportunidad empieza aquí.</h2>
              <p>Un único acceso al universo Movies × Brands, diseñado para profesionales, talento, founders, creators y marcas.</p>
              <div className="mxb-membership-price"><strong>597 €</strong> <span>/ año</span></div>
              <details className="mxb-includes" open>
                <summary>¿Qué incluye?</summary>
                <ul className="mxb-includes-list">
                  <li><i>01</i><div><b>Future of Voices</b> — gana autoridad y proyecta tu voz.</div></li>
                  <li><i>02</i><div><b>The La Croisette</b> — aparece en nuestro directorio editorial.</div></li>
                  <li><i>03</i><div><b>AI Awards</b> — formación en Inteligencia Artificial.</div></li>
                  <li><i>04</i><div><b>Cannes y Berlinale</b> — acceso a nominaciones internacionales.</div></li>
                  <li><i>05</i><div><b>Networking exclusivo</b> — conexiones seleccionadas.</div></li>
                  <li><i>06</i><div><b>Experiencias premium</b> — propuestas y escenarios especiales.</div></li>
                  <li><i>07</i><div><b>Directorio profesional</b> — mentores, speakers y cineastas.</div></li>
                </ul>
              </details>
              <div className="mxb-checkout-trust"><span>Acceso anual</span><span>Pago seguro</span><span>Activación inmediata</span></div>
            </section>
            <section className="mxb-checkout-panel">
              <div className="mxb-payment-step">Paso final</div>
              <h2>Completa tu membresía</h2>
              <p className="mxb-payment-intro">Finaliza el pago de forma segura. Después completarás tu perfil.</p>
              <div className="mxb-thrivecart-frame">
                {/* Replace with actual ThriveCart embed script */}
                <div className="mxb-thrivecart-placeholder">
                  <h3>Checkout seguro</h3>
                  <p>Zona preparada para integrar el formulario de ThriveCart conectado con Stripe.</p>
                  <button type="button" onClick={() => setStep(3)}>Continuar con el pago</button>
                </div>
              </div>
              <p className="mxb-checkout-legal">Al continuar, aceptas los <a href="#">Términos y Condiciones</a> y la Política de Privacidad.</p>
            </section>
          </div>
        </main>
      </div>
    )
  }

  // ── Step 3: Pending profile ──
  if (step === 3) {
    return (
      <div className="gw-screen">
        <style>{CSS}</style>
        <div className="gw-topbar">
          <a href="https://moviesxbrands.com" className="logo">
            <span className="mxb">MOVIES</span><span className="sep">×</span><span className="mxb">BRANDS</span>
          </a>
          <a href="https://moviesxbrands.com" className="back">← Volver</a>
        </div>
        <div className="gw-eyebrow">The Portal</div>
        <div className="gw-title">Join The Portal</div>
        <div className="gw-card" style={{ maxWidth: 560 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="pending-check">✓</div>
            <h3>¡Pago confirmado!</h3>
            <p className="subtitle">Completa tu perfil para que podamos revisarlo. En cuanto lo aprobemos, tendrás acceso completo.</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div className="pending-avatar-box">
              {pendingAvatar ? <img src={pendingAvatar} alt="foto" /> : '🏛'}
            </div>
            <label className="gw-link" style={{ cursor: 'pointer', display: 'inline-block' }}>⬆ Subir foto
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="gw-field">
            <label>¿Cómo te gusta que te llamen?</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nombre público" />
          </div>

          <div className="gw-field">
            <label>¿Cómo quieres aparecer dentro de The Portal? (máx. 2)</label>
            <div className="pending-category-list">
              {[
                ['actor','Actor / Actress'],['influencer','Influencer / Creator'],['speaker','Speaker'],
                ['coach','Coach / Mentor'],['business','Business Leader / Founder'],['model','Model'],
                ['filmmaker','Filmmaker / Creative'],['ai_expert','AI Expert'],['brand','Brand / Company'],['other','Other'],
              ].map(([val, label]) => (
                <label key={val}>
                  <input type="checkbox" checked={categories.includes(val)} onChange={() => toggleCategory(val)} style={{ width: 'auto' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="gw-field">
            <label>¿A qué te dedicas? (descripción corta)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Una presentación breve…" />
          </div>

          {pendingMsg ? (
            <div className={`gw-msg ${pendingMsg.startsWith('Error') ? 'err' : 'ok'}`}>{pendingMsg}</div>
          ) : null}

          <button className="gw-btn" onClick={handlePendingSubmit} disabled={pendingSaving} style={{ marginTop: 20 }}>
            {pendingSaving ? 'Enviando…' : 'Enviar para revisión'}
          </button>
          <div className="gw-footer">Si tienes alguna duda, escríbenos a hello@moviesxbrands.com.</div>
          <button className="gw-link" onClick={() => router.push('/portal/login')}>Ir al inicio de sesión →</button>
        </div>
      </div>
    )
  }

  // ── Step 1: Registration form ──
  return (
    <div className="gw-screen">
      <style>{CSS}</style>
      <div className="gw-topbar">
        <a href="https://moviesxbrands.com" className="logo">
          <span className="mxb">MOVIES</span><span className="sep">×</span><span className="mxb">BRANDS</span>
        </a>
        <button className="back" style={{ background:'none', border:'none', cursor:'pointer' }} onClick={() => router.push('/portal/login')}>← Volver</button>
      </div>
      <div className="gw-eyebrow">The Portal</div>
      <div className="gw-title">Join The Portal</div>

      <div className="gw-card">
        <h3>Crear mi cuenta</h3>
        <p className="subtitle">Join The Portal — 597€/año. El siguiente paso es el pago; después, completas tu perfil.</p>
        <form onSubmit={handleStep1}>
          <div className="gw-grid-2">
            <div className="gw-field">
              <label>Nombre</label>
              <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Nombre" required />
            </div>
            <div className="gw-field">
              <label>Apellidos</label>
              <input type="text" value={form.apellidos} onChange={e => update('apellidos', e.target.value)} placeholder="Apellidos" required />
            </div>
          </div>
          <div className="gw-field">
            <label>Teléfono móvil</label>
            <input type="tel" value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+34 600 000 000" />
          </div>
          <div className="gw-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div className="gw-field">
            <label>Contraseña</label>
            <div className="gw-pw-wrap">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required />
              <button type="button" className="gw-pw-toggle" onClick={() => setShowPw(v => !v)}>👁</button>
            </div>
          </div>
          <div className="gw-field">
            <label>Confirmar contraseña</label>
            <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
          </div>
          {error && <div className="gw-msg err">{error}</div>}
          <button type="submit" className="gw-btn" disabled={loading}>{loading ? 'Creando cuenta…' : 'Continuar al pago — 597€/año'}</button>
        </form>
        <button className="gw-link" onClick={() => router.push('/portal/login')}>← Ya tengo cuenta</button>
        <div className="gw-footer">Acceso exclusivo, por invitación tras el pago de participación.</div>
      </div>
    </div>
  )
}
