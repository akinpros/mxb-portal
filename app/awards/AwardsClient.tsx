'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'
const DANGER = '#c0392b'

type AwardsMember = {
  id: string
  user_id: string | null
  contact_name: string
  surname: string | null
  brand: string | null
  phone: string | null
  website: string | null
  email: string
  title: string | null
  company: string | null
  service: string | null
  bio_short: string | null
  bio_long: string | null
  editions: { cannes?: boolean; berlinale?: boolean } | null
  trailer_link: string | null
  synopsis: string | null
  video_url: string | null
  cover_url: string | null
  photo_url: string | null
  approved: boolean
  created_at: string
}

interface Props {
  member: AwardsMember | null
  messages: { id: string; body: string; created_at: string }[]
  announcements: { id: string; title: string; message: string; created_at: string }[]
  resources: { id: string; section: string; body: string | null; youtube_link: string | null; sort_order: number }[]
  requirements: { id: string; title: string | null; body: string; sort_order: number }[]
  awardsConfig: Record<string, string>
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: '#101010',
  border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff',
  fontSize: 14.5, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.26em',
  textTransform: 'uppercase', color: CH, marginBottom: 7,
}
const panel: React.CSSProperties = {
  background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24, marginBottom: 20,
}
const goldPanel: React.CSSProperties = { ...panel, borderColor: G }

function Panel({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return <div style={{ ...goldPanel, ...style }}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontWeight: 300, fontSize: 27, color: G, marginBottom: 6, fontFamily: 'Georgia,serif' }}>{children}</h2>
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return <p style={{ opacity: .55, fontSize: 13.5, marginBottom: 26 }}>{children}</p>
}

function MiniBtn({ onClick, children, red }: { onClick: () => void; children: React.ReactNode; red?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: `1px solid ${red ? DANGER : G}`, color: red ? '#e07060' : G,
      borderRadius: 5, padding: '10px 20px', cursor: 'pointer', fontFamily: 'Georgia,serif',
      fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase',
    }}>{children}</button>
  )
}

function GoldBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: 13, marginTop: 6, background: disabled ? '#555' : G,
      color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 11.5, letterSpacing: '.26em', textTransform: 'uppercase', fontFamily: 'Georgia,serif',
    }}>{children}</button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 15 }}><label style={labelStyle}>{label}</label>{children}</div>
}

export default function AwardsClient({ member: initMember, messages, announcements, resources, requirements, awardsConfig }: Props) {
  const supabase = createClient()
  const router = useRouter()

  const initView = initMember ? (initMember.approved ? 'profile' : 'pending') : 'login'
  const [view, setView] = useState<'login' | 'register' | 'pending' | 'profile'>(initView as 'login' | 'register' | 'pending' | 'profile')
  const [member] = useState(initMember)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regSurname, setRegSurname] = useState('')
  const [regBrand, setRegBrand] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regWebsite, setRegWebsite] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regPassConfirm, setRegPassConfirm] = useState('')
  const [regErr, setRegErr] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regOk, setRegOk] = useState(false)

  // Profile state
  const [pTitle, setPTitle] = useState(initMember?.title ?? '')
  const [pCompany, setPCompany] = useState(initMember?.company ?? '')
  const [pService, setPService] = useState(initMember?.service ?? '')
  const [pBioShort, setPBioShort] = useState(initMember?.bio_short ?? '')
  const [pBioLong, setPBioLong] = useState(initMember?.bio_long ?? '')
  const [editions, setEditions] = useState<{ cannes: boolean; berlinale: boolean }>(
    { cannes: !!(initMember?.editions as { cannes?: boolean })?.cannes, berlinale: !!(initMember?.editions as { berlinale?: boolean })?.berlinale }
  )
  const [synopsis, setSynopsis] = useState(initMember?.synopsis ?? '')
  const [trailerLink, setTrailerLink] = useState(initMember?.trailer_link ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const wordCount = synopsis.trim() ? synopsis.trim().split(/\s+/).length : 0

  function showSaveMsg(msg: string) {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true); setLoginErr('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass })
    if (error) { setLoginErr('Email o contraseña incorrectos.'); setLoginLoading(false); return }
    const role = data.user?.app_metadata?.mxb_role
    if (role !== 'awards') {
      await supabase.auth.signOut()
      setLoginErr('Este acceso es exclusivo para participantes de Awards.')
      setLoginLoading(false); return
    }
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (regPass !== regPassConfirm) { setRegErr('Las contraseñas no coinciden.'); return }
    if (regPass.length < 8) { setRegErr('Mínimo 8 caracteres.'); return }
    setRegLoading(true); setRegErr('')
    const res = await fetch('/api/awards/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_name: regName, surname: regSurname, brand: regBrand, phone: regPhone, website: regWebsite, email: regEmail, password: regPass }),
    })
    const data = await res.json()
    if (!res.ok) { setRegErr(data.error ?? 'Error al registrarse.'); setRegLoading(false); return }
    await supabase.auth.signInWithPassword({ email: regEmail, password: regPass })
    setRegOk(true)
    router.refresh()
  }

  async function saveProfile() {
    if (!member) return
    setSaving(true)
    const { error } = await supabase.from('mxb_awards_members').update({
      title: pTitle, company: pCompany, service: pService, bio_short: pBioShort, bio_long: pBioLong,
    }).eq('id', member.id)
    showSaveMsg(error ? 'Error: ' + error.message : '✓ Perfil guardado')
    setSaving(false)
  }

  async function saveEditions() {
    if (!member) return
    setSaving(true)
    await supabase.from('mxb_awards_members').update({ editions }).eq('id', member.id)
    showSaveMsg('✓ Ediciones guardadas')
    setSaving(false)
  }

  async function saveSynopsis() {
    if (!member) return
    if (wordCount > 350) { showSaveMsg('Máximo 350 palabras.'); return }
    setSaving(true)
    await supabase.from('mxb_awards_members').update({ synopsis, trailer_link: trailerLink }).eq('id', member.id)
    showSaveMsg('✓ Sinopsis guardada')
    setSaving(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Format date
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const bg = `linear-gradient(rgba(0,0,0,.88),rgba(0,0,0,.94)), url('https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-31-at-6.08.06-PM.jpeg') center/cover no-repeat`

  // ─── LOGIN / REGISTER SCREEN ─────────────────────────────────────────────
  if (view === 'login' || view === 'register') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: bg, backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontWeight: 300, fontSize: 36, letterSpacing: '.32em', color: G, fontFamily: 'Georgia,serif' }}>MOVIES</div>
          <div style={{ fontWeight: 300, fontSize: 14, letterSpacing: '.5em', color: CH, fontFamily: 'Georgia,serif', marginTop: 6 }}>× BRANDS</div>
          <div style={{ fontSize: 22, letterSpacing: '.18em', color: G, fontFamily: 'Georgia,serif', marginTop: 16, textTransform: 'uppercase' }}>GLOBAL BOOST AWARDS</div>
        </div>

        <div style={{ width: '100%', maxWidth: 460, background: 'rgba(13,13,13,.96)', border: `1px solid ${G}`, borderRadius: 10, padding: '36px 34px', boxShadow: '0 30px 80px rgba(0,0,0,.75)' }}>
          {view === 'login' ? (
            <>
              <h3 style={{ fontWeight: 300, fontSize: 20, textAlign: 'center', color: G, marginBottom: 8, letterSpacing: '.1em', fontFamily: 'Georgia,serif' }}>Acceso privado</h3>
              <p style={{ fontSize: 12, textAlign: 'center', opacity: .55, marginBottom: 24, lineHeight: 1.6 }}>Entra en tu perfil para gestionar tu participación en la Competición.</p>
              <form onSubmit={handleLogin}>
                <Field label="Email"><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={inputStyle} required /></Field>
                <Field label="Contraseña"><input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={inputStyle} required /></Field>
                {loginErr && <div style={{ color: '#e07060', fontSize: 13, marginBottom: 12 }}>{loginErr}</div>}
                <GoldBtn disabled={loginLoading}>{loginLoading ? 'Entrando…' : 'Entrar'}</GoldBtn>
              </form>
              <button onClick={() => setView('register')} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', color: CH, cursor: 'pointer', fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                ¿Primera vez? Regístrate aquí
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontWeight: 300, fontSize: 20, textAlign: 'center', color: G, marginBottom: 8, letterSpacing: '.1em', fontFamily: 'Georgia,serif' }}>Crear mi perfil</h3>
              <p style={{ fontSize: 12, textAlign: 'center', opacity: .55, marginBottom: 24, lineHeight: 1.6 }}>Este registro es exclusivo para quienes ya han completado su pago de participación en la Competición.</p>
              {regOk ? (
                <div style={{ textAlign: 'center', color: G, fontSize: 14, lineHeight: 1.7 }}>✓ Registro completado. Cargando tu perfil…</div>
              ) : (
                <form onSubmit={handleRegister}>
                  <Field label="Nombre de contacto"><input type="text" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle} required /></Field>
                  <Field label="Apellidos"><input type="text" value={regSurname} onChange={e => setRegSurname(e.target.value)} style={inputStyle} /></Field>
                  <Field label="Marca"><input type="text" value={regBrand} onChange={e => setRegBrand(e.target.value)} style={inputStyle} /></Field>
                  <Field label="Teléfono móvil"><input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} style={inputStyle} placeholder="+34 600 000 000" /></Field>
                  <Field label="Página web"><input type="text" value={regWebsite} onChange={e => setRegWebsite(e.target.value)} style={inputStyle} placeholder="www.tumarca.com" /></Field>
                  <Field label="Email"><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} required /></Field>
                  <Field label="Contraseña"><input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} style={inputStyle} required /></Field>
                  <Field label="Confirmar contraseña"><input type="password" value={regPassConfirm} onChange={e => setRegPassConfirm(e.target.value)} style={inputStyle} required /></Field>
                  {regErr && <div style={{ color: '#e07060', fontSize: 13, marginBottom: 12 }}>{regErr}</div>}
                  <GoldBtn disabled={regLoading}>{regLoading ? 'Creando perfil…' : 'Crear mi perfil'}</GoldBtn>
                </form>
              )}
              <button onClick={() => setView('login')} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', color: CH, cursor: 'pointer', fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                ← Ya tengo cuenta
              </button>
            </>
          )}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid #2a2a2a`, textAlign: 'center', fontSize: 10.5, opacity: .45, lineHeight: 1.8 }}>
            Acceso exclusivo, por invitación tras el pago de participación.<br />Este enlace no está enlazado desde ningún sitio público.
          </div>
        </div>
      </div>
    )
  }

  // ─── PENDING SCREEN ───────────────────────────────────────────────────────
  if (view === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: bg, backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontWeight: 300, fontSize: 36, letterSpacing: '.32em', color: G, fontFamily: 'Georgia,serif' }}>MOVIES</div>
          <div style={{ fontWeight: 300, fontSize: 14, letterSpacing: '.5em', color: CH, fontFamily: 'Georgia,serif', marginTop: 6 }}>× BRANDS</div>
          <div style={{ fontSize: 22, letterSpacing: '.18em', color: G, fontFamily: 'Georgia,serif', marginTop: 16, textTransform: 'uppercase' }}>GLOBAL BOOST AWARDS</div>
        </div>
        <div style={{ width: '100%', maxWidth: 460, background: 'rgba(13,13,13,.96)', border: `1px solid ${G}`, borderRadius: 10, padding: '36px 34px', boxShadow: '0 30px 80px rgba(0,0,0,.75)', textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>⏳</div>
          <h3 style={{ fontWeight: 300, fontSize: 20, color: G, marginBottom: 8, letterSpacing: '.1em', fontFamily: 'Georgia,serif' }}>Tu solicitud está en revisión</h3>
          <p style={{ fontSize: 12, opacity: .55, lineHeight: 1.6, marginBottom: 0 }}>Hemos recibido tus datos correctamente. Nuestro equipo está verificando tu inscripción — te avisaremos por email en cuanto tu perfil quede aprobado y puedas acceder a tu espacio completo.</p>
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid #2a2a2a`, fontSize: 10.5, opacity: .45, lineHeight: 1.8 }}>
            Si tienes alguna duda, escríbenos a cannes@moviesxbrands.com.
          </div>
          <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', color: CH, cursor: 'pointer', fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>Salir</button>
        </div>
      </div>
    )
  }

  // ─── PROFILE (approved) ───────────────────────────────────────────────────
  const cannesOpens = awardsConfig['awards_cannes_opens']
  const cannesCloses = awardsConfig['awards_cannes_closes']
  const cannesNotes = awardsConfig['awards_cannes_notes']
  const berlinaleOpens = awardsConfig['awards_berlinale_opens']
  const berlinaleCloses = awardsConfig['awards_berlinale_closes']
  const berlinaleNotes = awardsConfig['awards_berlinale_notes']

  const memberName = [member?.contact_name, member?.surname].filter(Boolean).join(' ')

  return (
    <div style={{ background: BG, color: '#fff', fontFamily: 'Georgia,serif', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,11,.97)', borderBottom: `1px solid ${LINE}`, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: 14, letterSpacing: '.24em', color: G, fontWeight: 300 }}>MXB · AWARDS</div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>Salir</button>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 22px 80px' }}>
        <SectionTitle>Tu perfil</SectionTitle>
        <SectionSub>Bienvenido/a, {memberName || member?.brand || member?.email}</SectionSub>

        {/* STATUS BANNER */}
        <div style={{ background: 'rgba(90,140,90,.15)', border: '1px solid #5a8c5a', color: '#a8d8a8', borderRadius: 8, padding: '16px 20px', marginBottom: 26, fontSize: 13, lineHeight: 1.7 }}>
          ✓ Tu perfil está aprobado y activo. Bienvenida al ecosistema Movies × Brands.
        </div>

        {saveMsg && (
          <div style={{ background: saveMsg.startsWith('✓') ? 'rgba(90,140,90,.15)' : 'rgba(192,57,43,.15)', border: `1px solid ${saveMsg.startsWith('✓') ? '#5a8c5a' : DANGER}`, color: saveMsg.startsWith('✓') ? '#a8d8a8' : '#e07060', borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 13 }}>
            {saveMsg}
          </div>
        )}

        {/* PROFILE DATA */}
        <Panel>
          <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 6 }}>Datos de tu perfil</h4>
          <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 16, lineHeight: 1.6 }}>Esta información podrá usarse en tu certificado y en materiales del ecosistema.</p>
          <Field label="Título / Cargo"><input type="text" value={pTitle} onChange={e => setPTitle(e.target.value)} style={inputStyle} placeholder="Ej: CEO, Fundadora…" /></Field>
          <Field label="Nombre de la empresa"><input type="text" value={pCompany} onChange={e => setPCompany(e.target.value)} style={inputStyle} placeholder="Razón social, si es distinta a tu marca…" /></Field>
          <Field label="Servicio que ofrecen"><input type="text" value={pService} onChange={e => setPService(e.target.value)} style={inputStyle} placeholder="Ej: suplementos de bienestar, coaching de longevidad…" /></Field>
          <Field label="Biografía corta (1-2 frases)">
            <textarea value={pBioShort} onChange={e => setPBioShort(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Una presentación breve de tu marca…" />
          </Field>
          <Field label="Biografía larga">
            <textarea value={pBioLong} onChange={e => setPBioLong(e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Cuenta la historia de tu marca con más detalle…" />
          </Field>
          <MiniBtn onClick={saveProfile}>{saving ? 'Guardando…' : 'Guardar perfil'}</MiniBtn>
        </Panel>

        {/* BENEFITS */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 300, fontSize: 22, color: G, marginTop: 6, marginBottom: 6, fontFamily: 'Georgia,serif' }}>Tus beneficios</h2>
          <SectionSub>Lo que incluye tu participación en los Awards.</SectionSub>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 10 }}>
            {[
              { icon: '🎤', title: 'Future of Voices', desc: 'Acceso prioritario a la plataforma. Oportunidad de grabar un Vídeo de Legado.' },
              { icon: '🤝', title: 'Networking Exclusivo', desc: 'En caso de quedar finalista, o en futuros eventos del ecosistema — acceso a lista prioritaria o preferente.' },
              { icon: '🌍', title: 'Experiencias Internacionales', desc: 'Acceso gratuito al Berlinale Digital Show. Consideración prioritaria para Cannes, Berlinale, Miami y Barcelona.' },
              { icon: '📰', title: 'Privilegios Editoriales', desc: 'Aparece en nuestra Power List dentro de The La Croisette Magazine.' },
            ].map(b => (
              <div key={b.title} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{b.icon}</div>
                <h4 style={{ fontWeight: 300, fontSize: 15, color: G, marginBottom: 6 }}>{b.title}</h4>
                <p style={{ fontSize: 12, opacity: .65, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, opacity: .5, lineHeight: 1.7 }}>No incluye créditos por defecto — si traes patrocinadores o partners al ecosistema, podrás ir acumulando créditos según tu contribución.</p>
        </div>

        {/* APPLY TO COMPETITION */}
        <Panel>
          <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 6 }}>🏆 Aplicar a la Competición</h4>
          <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 16, lineHeight: 1.6 }}>Elige en qué edición quieres participar.</p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={editions.cannes} onChange={e => setEditions(prev => ({ ...prev, cannes: e.target.checked }))} style={{ width: 'auto' }} />
              🇫🇷 Cannes 2027
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={editions.berlinale} onChange={e => setEditions(prev => ({ ...prev, berlinale: e.target.checked }))} style={{ width: 'auto' }} />
              🇩🇪 Berlinale Digital Show
            </label>
          </div>
          <MiniBtn onClick={saveEditions}>Guardar selección</MiniBtn>

          <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 20, paddingTop: 18 }}>
            <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 14, lineHeight: 1.6 }}>Participar implica crear, con inteligencia artificial, un tráiler de marca sobre tu visión de empresa, junto con una breve sinopsis.</p>
            <Field label={`Sinopsis (máximo 350 palabras)`}>
              <textarea
                value={synopsis}
                onChange={e => {
                  const val = e.target.value
                  const wc = val.trim() ? val.trim().split(/\s+/).length : 0
                  if (wc <= 350) setSynopsis(val)
                }}
                rows={6} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Resume tu tráiler de marca…"
              />
              <div style={{ fontSize: 11, opacity: .5, marginTop: 5, textAlign: 'right', color: wordCount > 340 ? '#e07060' : '#fff' }}>{wordCount} / 350 palabras</div>
            </Field>
            <Field label="Enlace de tu tráiler (YouTube)">
              <input type="text" value={trailerLink} onChange={e => setTrailerLink(e.target.value)} style={inputStyle} placeholder="https://youtube.com/watch?v=…" />
            </Field>
            <MiniBtn onClick={saveSynopsis}>Guardar sinopsis y tráiler</MiniBtn>
            <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.7, marginTop: 10, fontStyle: 'italic' }}>Tu candidatura la evalúa nuestro comité privado — con representación de la industria del cine, el marketing, los negocios y la inteligencia artificial.</p>
            <div style={{ background: 'rgba(212,175,55,.08)', border: `1px solid ${G}`, borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
              <p style={{ fontSize: 11.5, color: CH, lineHeight: 1.75 }}><b>Requisito adicional:</b> además de subir tu tráiler a YouTube, tienes que enviarlo por email — con la sinopsis en PDF adjunta — a <b>cannes@moviesxbrands.com</b> (si participas en Cannes) o <b>berlinale@moviesxbrands.com</b> (si participas en Berlinale), con copia a la otra dirección si participas en ambas ediciones.</p>
            </div>
            <div style={{ background: 'rgba(192,57,43,.1)', border: `1px solid ${DANGER}`, borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
              <p style={{ fontSize: 11.5, color: '#e8a89f', lineHeight: 1.7 }}>⚠ Tu tráiler de marca nunca se publica antes de la celebración oficial de la Competición correspondiente. Hasta entonces, queda en revisión privada.</p>
            </div>
            {/* Extra requirements from admin */}
            {requirements.map(r => (
              <div key={r.id} style={{ background: 'rgba(212,175,55,.08)', border: `1px solid ${G}`, borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
                {r.title && <div style={{ fontSize: 12, color: G, marginBottom: 4, fontWeight: 'bold' }}>{r.title}</div>}
                <p style={{ fontSize: 11.5, color: CH, lineHeight: 1.75 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* DATES & COMMUNICATIONS */}
        <Panel>
          <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 6 }}>📅 Fechas y comunicados</h4>
          <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 16, lineHeight: 1.6 }}>Información oficial sobre la Competición, actualizada por el equipo de Movies × Brands.</p>
          {editions.cannes && (
            <div style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ color: G, fontSize: 13.5, marginBottom: 6 }}>🇫🇷 Festival de Cannes 2027</div>
              {(cannesOpens || cannesCloses) ? (
                <div style={{ fontSize: 12.5, opacity: .8 }}>
                  {cannesOpens && `Apertura: ${fmtDate(cannesOpens)}`}
                  {cannesOpens && cannesCloses && ' · '}
                  {cannesCloses && `Cierre de entregas: ${fmtDate(cannesCloses)}`}
                </div>
              ) : <div style={{ fontSize: 12.5, opacity: .5 }}>Fechas pendientes de confirmar.</div>}
              {cannesNotes && <div style={{ fontSize: 12, opacity: .6, marginTop: 6 }}>{cannesNotes}</div>}
            </div>
          )}
          {editions.berlinale && (
            <div style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ color: G, fontSize: 13.5, marginBottom: 6 }}>🇩🇪 Berlinale Digital Show</div>
              {(berlinaleOpens || berlinaleCloses) ? (
                <div style={{ fontSize: 12.5, opacity: .8 }}>
                  {berlinaleOpens && `Apertura: ${fmtDate(berlinaleOpens)}`}
                  {berlinaleOpens && berlinaleCloses && ' · '}
                  {berlinaleCloses && `Cierre de entregas: ${fmtDate(berlinaleCloses)}`}
                </div>
              ) : <div style={{ fontSize: 12.5, opacity: .5 }}>Fechas pendientes de confirmar.</div>}
              {berlinaleNotes && <div style={{ fontSize: 12, opacity: .6, marginTop: 6 }}>{berlinaleNotes}</div>}
            </div>
          )}
          {!editions.cannes && !editions.berlinale && (
            <p style={{ fontSize: 12.5, opacity: .5 }}>Elige tu edición en “Aplicar a la Competición” para ver sus fechas.</p>
          )}
          {/* Awards-specific announcements */}
          {announcements.length > 0 && (
            <div style={{ marginTop: 16, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
              {announcements.map(a => (
                <div key={a.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: G }}>📢 {a.title}</div>
                  <div style={{ fontSize: 12, opacity: .65, marginTop: 3, lineHeight: 1.6 }}>{a.message}</div>
                  <div style={{ fontSize: 10, opacity: .4, marginTop: 3 }}>{new Date(a.created_at).toLocaleDateString('es-ES')}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ECOSYSTEM INFO */}
        <div style={{ ...panel, borderColor: LINE }}>
          <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 8 }}>🎬 Nuestro ecosistema</h4>
          <p style={{ fontSize: 12.5, opacity: .6, lineHeight: 1.7 }}>Nuestro ecosistema conecta con figuras de la industria del cine, celebrities e influencers internacionales. Por política de confidencialidad, su presencia no es pública — pero es real, y forma parte de la experiencia que construimos juntos.</p>
        </div>

        {/* FUTURE OF VOICES VIDEO */}
        <Panel style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 6 }}>🎤 Tu vídeo para Future of Voices</h4>
          <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 16, lineHeight: 1.6 }}>Graba tu mensaje de legado — horizontal, máximo 60 segundos.</p>
          <div style={{ border: `1.5px dashed ${member?.video_url ? G : '#3a3a3a'}`, borderRadius: 8, padding: 20, textAlign: 'center', background: member?.video_url ? 'rgba(212,175,55,.05)' : 'transparent' }}>
            {member?.video_url ? (
              <p style={{ fontSize: 13, color: G }}>✓ Vídeo recibido. Pendiente de revisión.</p>
            ) : (
              <>
                <p style={{ fontSize: 13, opacity: .7, marginBottom: 12 }}>Todavía no has subido tu vídeo.</p>
                <p style={{ fontSize: 11, opacity: .5 }}>Para subir tu vídeo, envíalo directamente a cannes@moviesxbrands.com con el asunto &ldquo;Video FoV — [Tu marca]&rdquo;.</p>
              </>
            )}
          </div>
          <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.7, marginTop: 10, fontStyle: 'italic' }}>Los vídeos se publican por orden y disponibilidad de espacio dentro de Future of Voices. Tu mensaje queda pendiente de revisión.</p>
        </Panel>

        {/* RESOURCES */}
        {resources.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 300, fontSize: 22, color: G, marginTop: 6, marginBottom: 6, fontFamily: 'Georgia,serif' }}>Recursos y tutoriales</h2>
            <SectionSub>Todo lo que necesitas saber sobre cada parte del ecosistema.</SectionSub>
            {resources.map(r => (
              <div key={r.id} style={{ ...panel, borderColor: LINE }}>
                <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 8 }}>{r.section}</h4>
                {r.body && <p style={{ fontSize: 13, opacity: .7, lineHeight: 1.7, marginBottom: r.youtube_link ? 12 : 0 }}>{r.body}</p>}
                {r.youtube_link && <a href={r.youtube_link} target="_blank" rel="noopener" style={{ color: G, fontSize: 13 }}>▶ Ver vídeo</a>}
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        <Panel style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 6 }}>✉️ Mensajes del equipo</h4>
          <p style={{ fontSize: 11.5, opacity: .5, marginBottom: 16, lineHeight: 1.6 }}>Comunicados privados de Movies × Brands para ti.</p>
          {messages.length === 0 ? (
            <p style={{ fontSize: 12.5, opacity: .5 }}>No tienes mensajes todavía.</p>
          ) : messages.map(m => (
            <div key={m.id} style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, opacity: .8, lineHeight: 1.7 }}>{m.body}</p>
              <div style={{ fontSize: 10, opacity: .4, marginTop: 6 }}>{new Date(m.created_at).toLocaleDateString('es-ES')}</div>
            </div>
          ))}
        </Panel>
      </div>

      <footer style={{ borderTop: `1px solid ${LINE}`, background: '#080808', padding: '30px 22px', marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 11, opacity: .4 }}>Movies × Brands | AI Boost Experience · Una iniciativa de The Wonder World Group</p>
        <p style={{ fontSize: 9.5, opacity: .35, marginTop: 10, lineHeight: 1.7, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Al registrarte y completar tu perfil, aceptas nuestra Política de Privacidad y los Términos y Condiciones de participación en la Competición, incluyendo el uso de tus datos dentro del ecosistema Movies × Brands para los fines aquí descritos.
        </p>
        <p style={{ fontSize: 9.5, opacity: .35, marginTop: 8 }}>© 2026 Movies × Brands</p>
      </footer>
    </div>
  )
}
