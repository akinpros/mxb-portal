'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap');
:root{--gold:#C9A227;--champagne:#E8D5C4;--black:#0B0B0B;--line:#2c2c2c;--gold-deep:#A9841B;}
*{box-sizing:border-box;}
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
.gw-card{width:100%;max-width:460px;background:#FFFFFF;color:#171512;border:none;border-radius:16px;padding:36px 34px;box-shadow:0 40px 90px rgba(0,0,0,.45);}
.gw-card h3{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:22px;color:#171512;text-align:center;margin-bottom:8px;}
.gw-card .subtitle{font-size:12px;text-align:center;color:rgba(23,21,18,.62);font-family:'Inter',sans-serif;margin-bottom:24px;line-height:1.6;}
.gw-field{margin-bottom:15px;}
.gw-field label{display:block;font-size:11.5px;font-weight:600;color:#171512;margin-bottom:7px;font-family:'Inter',sans-serif;}
.gw-field input,.gw-field select,.gw-field textarea{width:100%;padding:11px 14px;background:#FBFAF7;border:1px solid rgba(11,11,11,.10);border-radius:6px;color:#171512;font-size:14.5px;font-family:'Inter',sans-serif;}
.gw-field input:focus,.gw-field select:focus,.gw-field textarea:focus{outline:none;border-color:var(--gold);background:#fff;}
.gw-pw-wrap{position:relative;}
.gw-pw-wrap input{padding-right:42px;}
.gw-pw-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;opacity:.5;color:#171512;}
.gw-btn{width:100%;padding:13px;margin-top:6px;background:#0B0B0B;color:#F7F3EC;border:none;border-radius:6px;cursor:pointer;
  font-size:13px;letter-spacing:.03em;font-weight:600;font-family:'Inter',sans-serif;transition:background .2s;}
.gw-btn:hover{background:#000;}
.gw-btn:disabled{opacity:.35;cursor:not-allowed;}
.gw-link{display:block;width:100%;text-align:center;margin-top:14px;background:none;border:none;color:var(--gold-deep);
  cursor:pointer;font-size:11.5px;font-weight:600;letter-spacing:.03em;font-family:'Inter',sans-serif;}
.gw-link:hover{text-decoration:underline;}
.gw-msg{margin-top:12px;font-size:13px;line-height:1.6;text-align:center;}
.gw-msg.ok{color:var(--gold-deep);}
.gw-msg.err{color:#C0392B;}
.gw-footer{margin-top:22px;padding-top:16px;border-top:1px solid rgba(11,11,11,.10);text-align:center;font-size:10.5px;color:rgba(23,21,18,.55);font-family:'Inter',sans-serif;line-height:1.8;}
`

type View = 'login' | 'forgot' | 'register'

export default function PortalLoginPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    const userEmail = data.user?.email ?? ''
    let institution = null
    try {
      const [, { data: inst }] = await Promise.all([
        supabase.from('mxb_selection_members').select('id').eq('email', userEmail).single(),
        supabase.from('mxb_institutions').select('id').eq('email', userEmail).single(),
      ])
      institution = inst
    } catch { /* tables may not exist yet */ }

    window.location.href = institution ? '/portal/institution' : '/portal'
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setForgotMsg('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/portal/login`,
    })
    setForgotMsg(err ? err.message : '¡Enlace enviado! Revisa tu email.')
    setLoading(false)
  }

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

      {view === 'login' && (
        <div className="gw-card">
          <h3>Acceso privado</h3>
          <p className="subtitle">Entra en tu perfil para gestionar tu participación en la Competición.</p>
          <form onSubmit={handleLogin}>
            <div className="gw-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div className="gw-field">
              <label>Contraseña</label>
              <div className="gw-pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="gw-pw-toggle" onClick={() => setShowPw(v => !v)}>👁</button>
              </div>
            </div>
            {error && <div className="gw-msg err">{error}</div>}
            <button type="submit" className="gw-btn" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          </form>
          <button className="gw-link" onClick={() => setView('forgot')}>¿Olvidaste tu contraseña?</button>
          <button className="gw-link" onClick={() => { window.location.href = '/portal/register' }}>Crear cuenta →</button>
          <div className="gw-footer">Acceso exclusivo, por invitación tras el pago de participación.<br />Este enlace no está enlazado desde ningún sitio público.</div>
        </div>
      )}

      {view === 'forgot' && (
        <div className="gw-card">
          <h3>Recuperar contraseña</h3>
          <p className="subtitle">Introduce el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.</p>
          <form onSubmit={handleForgot}>
            <div className="gw-field">
              <label>Email</label>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            {forgotMsg && <div className={`gw-msg ${forgotMsg.startsWith('¡') ? 'ok' : 'err'}`}>{forgotMsg}</div>}
            <button type="submit" className="gw-btn" disabled={loading}>{loading ? 'Enviando…' : 'Enviar enlace'}</button>
          </form>
          <button className="gw-link" onClick={() => setView('login')}>← Volver al acceso</button>
        </div>
      )}
    </div>
  )
}
