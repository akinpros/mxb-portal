'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Message, Reward, RedemptionRequest, PipelineFilm, Announcement } from '@/lib/types'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'

type Tab = 'overview' | 'rewards' | 'messages' | 'pipeline' | 'benefits' | 'announcements'

interface Props {
  user: { id: string; email?: string }
  isAdmin: boolean
  partner: Partner | null
  messages: Message[]
  rewards: Reward[]
  redemptions: RedemptionRequest[]
  announcements: Announcement[]
  pipeline: PipelineFilm[]
}

export default function DashboardClient({ user, isAdmin, partner, messages, rewards, redemptions, announcements, pipeline }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [msgBody, setMsgBody] = useState('')
  const [msgSubject, setMsgSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annCategory, setAnnCategory] = useState('general')
  const [annPinned, setAnnPinned] = useState(false)
  const [annPosting, setAnnPosting] = useState(false)
  const [annPosted, setAnnPosted] = useState(false)
  const [localAnnouncements, setLocalAnnouncements] = useState<Announcement[]>(announcements)
  const router = useRouter()
  const supabase = createClient()

  const unread = messages.filter(m => m.sender === 'admin' && !m.read_by_partner).length

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!partner || !msgBody.trim()) return
    setSending(true)
    await supabase.from('mxb_messages').insert({
      partner_id: partner.id,
      sender: 'partner',
      subject: msgSubject || null,
      body: msgBody,
    })
    setMsgBody('')
    setMsgSubject('')
    setMsgSent(true)
    setSending(false)
    setTimeout(() => setMsgSent(false), 3000)
    router.refresh()
  }

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!annTitle.trim() || !annBody.trim()) return
    setAnnPosting(true)
    const { data } = await supabase.from('mxb_announcements').insert({
      title: annTitle,
      body: annBody,
      category: annCategory,
      pinned: annPinned,
    }).select().single()
    if (data) {
      setLocalAnnouncements(prev => [data as Announcement, ...prev].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }))
    }
    setAnnTitle('')
    setAnnBody('')
    setAnnCategory('general')
    setAnnPinned(false)
    setAnnPosted(true)
    setAnnPosting(false)
    setTimeout(() => setAnnPosted(false), 3000)
  }

  async function requestRedemption(rewardId: string) {
    if (!partner) return
    await supabase.from('mxb_redemption_requests').insert({
      partner_id: partner.id,
      reward_id: rewardId,
    })
    router.refresh()
  }

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em',
    textTransform: 'uppercase', color: active ? G : CH,
    padding: '8px 4px', borderBottom: active ? `2px solid ${G}` : '2px solid transparent',
    transition: 'color .2s',
  })

  const panelStyle: React.CSSProperties = {
    background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24,
  }

  const statStyle: React.CSSProperties = {
    background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22,
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', color: '#fff' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,11,.97)', borderBottom: `1px solid ${LINE}`,
        padding: '14px 22px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', backdropFilter: 'blur(8px)', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 14, letterSpacing: '.28em', color: G, fontWeight: 300 }}>MOVIES × BRANDS</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['overview', 'rewards', 'messages', 'pipeline', 'benefits', 'announcements'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={navBtnStyle(tab === t)}>
              {t === 'overview' ? 'Inicio' : t === 'rewards' ? 'Recompensas' : t === 'messages' ? `Mensajes${unread ? ` (${unread})` : ''}` : t === 'pipeline' ? 'Oportunidades' : 'Beneficios'}
            </button>
          ))}
          <button onClick={logout} style={{ ...navBtnStyle(false), color: '#c0392b' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '38px 22px 80px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Hero */}
            <div style={{
              borderRadius: 12, overflow: 'hidden', marginBottom: 32,
              background: `url('https://framerusercontent.com/images/dTyFXV94Ege8BjljhJdJjQEeK4.jpeg?width=1600') center/cover`,
            }}>
              <div style={{ background: 'linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.42))', padding: '54px 42px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 10 }}>Bienvenido de nuevo</div>
                <h2 style={{ fontWeight: 300, fontSize: 36, color: G, marginBottom: 8 }}>{partner?.full_name ?? user.email}</h2>
                <p style={{ color: CH, fontSize: 14, letterSpacing: '.15em' }}>{partner?.company ?? ''}</p>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {partner?.is_brand_partner && <span style={{ border: `1px solid ${G}`, color: G, fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 30 }}>Official Brand Partner</span>}
                  {partner?.is_strategic_leader && <span style={{ border: `1px solid ${CH}`, color: CH, fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 30 }}>Strategic Leader</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 30 }}>
              <div style={statStyle}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>⭐</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Puntos disponibles</div>
                <div style={{ fontSize: 26, fontWeight: 300, color: G }}>{partner?.points ?? 0}</div>
              </div>
              <div style={statStyle}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>💬</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Mensajes sin leer</div>
                <div style={{ fontSize: 26, fontWeight: 300, color: G }}>{unread}</div>
              </div>
              <div style={statStyle}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🎬</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Proyectos disponibles</div>
                <div style={{ fontSize: 26, fontWeight: 300, color: G }}>{pipeline.length}</div>
              </div>
              <div style={statStyle}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🏆</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Recompensas activas</div>
                <div style={{ fontSize: 26, fontWeight: 300, color: G }}>{rewards.length}</div>
              </div>
            </div>

            {/* Recent messages */}
            {messages.length > 0 && (
              <div style={{ ...panelStyle, marginBottom: 22 }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Últimas comunicaciones</div>
                {messages.slice(0, 3).map(m => (
                  <div key={m.id} style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: m.sender === 'admin' ? G : CH, fontWeight: 600 }}>
                        {m.sender === 'admin' ? 'Movies × Brands' : 'Tú'}{m.subject ? ` — ${m.subject}` : ''}
                      </span>
                      <span style={{ fontSize: 11, opacity: .4 }}>{new Date(m.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <p style={{ fontSize: 13, opacity: .7, lineHeight: 1.6, margin: 0 }}>{m.body.slice(0, 140)}{m.body.length > 140 ? '...' : ''}</p>
                  </div>
                ))}
                <button onClick={() => setTab('messages')} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                  Ver todos los mensajes →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── REWARDS ── */}
        {tab === 'rewards' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Recompensas</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Canjea tus puntos por experiencias y beneficios exclusivos</p>

            <div style={{ ...panelStyle, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', opacity: .5, marginBottom: 4 }}>Tus puntos</div>
                <div style={{ fontSize: 36, fontWeight: 300, color: G }}>{partner?.points ?? 0}</div>
              </div>
              <div style={{ opacity: .3, fontSize: 24 }}>≈</div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', opacity: .5, marginBottom: 4 }}>Valor estimado</div>
                <div style={{ fontSize: 36, fontWeight: 300, color: CH }}>€{((partner?.points ?? 0) * 1000).toLocaleString('es-ES')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 40 }}>
              {rewards.map(r => {
                const canRedeem = (partner?.points ?? 0) >= r.cost_points
                const alreadyRequested = redemptions.some(rd => rd.reward_id === r.id && rd.status === 'pending')
                return (
                  <div key={r.id} style={{ ...panelStyle, border: `1px solid ${canRedeem ? G : LINE}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 10 }}>⭐ {r.cost_points} puntos</div>
                    <h4 style={{ fontWeight: 300, fontSize: 18, color: '#fff', marginBottom: 8 }}>{r.name}</h4>
                    {r.description && <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{r.description}</p>}
                    {r.contribution_range && <div style={{ fontSize: 11, color: CH, opacity: .6, marginBottom: 12 }}>Aportación: {r.contribution_range}</div>}
                    <button
                      onClick={() => !alreadyRequested && canRedeem && requestRedemption(r.id)}
                      disabled={!canRedeem || alreadyRequested}
                      style={{
                        width: '100%', padding: '12px', border: 'none', borderRadius: 6, cursor: canRedeem && !alreadyRequested ? 'pointer' : 'not-allowed',
                        background: alreadyRequested ? '#333' : canRedeem ? G : '#222',
                        color: alreadyRequested ? '#888' : canRedeem ? '#0b0b0b' : '#555',
                        fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'Georgia,serif',
                      }}
                    >
                      {alreadyRequested ? 'Solicitud enviada' : canRedeem ? 'Solicitar' : 'Puntos insuficientes'}
                    </button>
                  </div>
                )
              })}
              {rewards.length === 0 && (
                <div style={{ ...panelStyle, gridColumn: '1/-1', textAlign: 'center', padding: 48, opacity: .4 }}>
                  El catálogo de recompensas estará disponible próximamente
                </div>
              )}
            </div>

            {redemptions.length > 0 && (
              <div style={panelStyle}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Mis solicitudes</div>
                {(redemptions as (RedemptionRequest & { mxb_rewards?: { name: string; cost_points: number } })[]).map((rd) => (
                  <div key={rd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${LINE}` }}>
                    <span style={{ fontSize: 13 }}>{rd.mxb_rewards?.name}</span>
                    <span style={{
                      fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20,
                      background: rd.status === 'approved' ? 'rgba(39,174,96,.15)' : rd.status === 'rejected' ? 'rgba(192,57,43,.15)' : 'rgba(212,175,55,.15)',
                      color: rd.status === 'approved' ? '#27ae60' : rd.status === 'rejected' ? '#c0392b' : G,
                    }}>{rd.status === 'approved' ? 'Aprobado' : rd.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Comunicación Privada</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Canal directo con el equipo de Movies × Brands</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              {/* Thread */}
              <div style={panelStyle}>
                <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Conversación</div>
                <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {messages.length === 0 && <div style={{ opacity: .4, fontSize: 13, textAlign: 'center', padding: 32 }}>No hay mensajes todavía</div>}
                  {[...messages].reverse().map(m => (
                    <div key={m.id} style={{
                      background: m.sender === 'admin' ? 'rgba(212,175,55,.08)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${m.sender === 'admin' ? 'rgba(212,175,55,.2)' : LINE}`,
                      borderRadius: 8, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: m.sender === 'admin' ? G : CH, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                          {m.sender === 'admin' ? 'Movies × Brands' : 'Tú'}
                        </span>
                        <span style={{ fontSize: 10, opacity: .4 }}>{new Date(m.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {m.subject && <div style={{ fontSize: 12, color: G, marginBottom: 4, opacity: .8 }}>{m.subject}</div>}
                      <p style={{ fontSize: 13, opacity: .8, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compose */}
              <div style={panelStyle}>
                <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Nuevo mensaje</div>
                <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, marginBottom: 7 }}>Asunto (opcional)</label>
                    <input
                      value={msgSubject} onChange={e => setMsgSubject(e.target.value)}
                      style={{ width: '100%', padding: '11px 13px', background: '#101010', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, marginBottom: 7 }}>Mensaje</label>
                    <textarea
                      value={msgBody} onChange={e => setMsgBody(e.target.value)} required rows={6}
                      style={{ width: '100%', padding: '11px 13px', background: '#101010', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                  {msgSent && <div style={{ color: '#27ae60', fontSize: 13 }}>✓ Mensaje enviado correctamente</div>}
                  <button
                    type="submit" disabled={sending || !msgBody.trim()}
                    style={{
                      padding: '13px', background: sending ? '#555' : G, color: '#0b0b0b',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'Georgia,serif',
                    }}
                  >
                    {sending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── PIPELINE ── */}
        {tab === 'pipeline' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Oportunidades</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Proyectos cinematográficos disponibles para Brand Partners</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {pipeline.map(f => (
                <div key={f.id} style={{ ...panelStyle, border: `1px solid ${LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: CH, opacity: .7 }}>{f.genre ?? 'Proyecto'}</span>
                    {f.festival && <span style={{ fontSize: 10, color: G, letterSpacing: '.15em' }}>{f.festival}</span>}
                  </div>
                  <h4 style={{ fontWeight: 300, fontSize: 20, color: '#fff', marginBottom: 10 }}>{f.title}</h4>
                  {f.country && <div style={{ fontSize: 11, opacity: .5, marginBottom: 6, letterSpacing: '.1em' }}>{f.country}</div>}
                  {f.synopsis && <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.65, marginBottom: 14 }}>{f.synopsis.slice(0, 160)}{f.synopsis.length > 160 ? '…' : ''}</p>}
                  {f.funding_total != null && (
                    <div style={{ fontSize: 12, color: CH, marginBottom: 6 }}>Presupuesto: €{f.funding_total.toLocaleString('es-ES')}</div>
                  )}
                  {f.funding_remaining != null && (
                    <div style={{ fontSize: 12, color: G, marginBottom: 10 }}>Financiación disponible: €{f.funding_remaining.toLocaleString('es-ES')}</div>
                  )}
                  {(f.funding_pct != null && f.funding_pct > 0) && (
                    <div>
                      <div style={{ fontSize: 11, opacity: .5, marginBottom: 4 }}>{f.funding_pct}% financiado</div>
                      <div style={{ width: '100%', height: 5, background: '#2c2c2c', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${f.funding_pct}%`, background: G, borderRadius: 20 }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {pipeline.length === 0 && (
                <div style={{ ...panelStyle, gridColumn: '1/-1', textAlign: 'center', padding: 64, opacity: .4 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                  <div>Próximamente habrá proyectos disponibles</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BENEFITS ── */}
        {tab === 'benefits' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Tus Beneficios</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Todo lo que incluye tu membresía como Official Brand Partner</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
              {[
                { icon: '🎪', title: 'Cannes 2027', desc: 'Invitación activa a la Gala privada en Cannes 2027. Acceso prioritario a todos los hitos del calendario.' },
                { icon: '🌍', title: 'Experiencias Internacionales', desc: 'Acceso gratuito al Berlinale Digital Show. Consideración prioritaria para Cannes, Berlinale, Miami y Barcelona.' },
                { icon: '📰', title: 'Privilegios Editoriales', desc: 'Oportunidad de aparecer en The La Croisette Magazine. Acceso a oportunidades mediáticas internacionales.' },
                { icon: '🎤', title: 'Future of Voices', desc: 'Acceso prioritario a la plataforma. Oportunidad de grabar un Vídeo de Legado.' },
                { icon: '🤝', title: 'Networking Exclusivo', desc: 'Acceso prioritario a experiencias privadas de networking con marcas, inversores y cineastas internacionales.' },
                { icon: '💼', title: 'Oportunidades de Negocio', desc: 'Acceso prioritario a colaboraciones, presentación de proyectos y alianzas estratégicas dentro del ecosistema.' },
                { icon: '⭐', title: 'Condiciones Preferentes', desc: 'Condiciones especiales para Arquitectura Estratégica de Marca, IA, Growth Marketing y Branding.' },
                { icon: '⚡', title: 'Acceso Prioritario', desc: 'Canal de comunicación prioritario, acceso anticipado a nuevas funcionalidades y convocatorias.' },
              ].map(b => (
                <div key={b.title} style={panelStyle}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{b.icon}</div>
                  <h4 style={{ fontWeight: 300, fontSize: 17, color: G, marginBottom: 8 }}>{b.title}</h4>
                  <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Noticias y Actualizaciones</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Novedades importantes sobre la evolución del proyecto</p>

            {isAdmin && (
              <div style={{ ...panelStyle, marginBottom: 32, borderColor: G }}>
                <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 20, letterSpacing: '.15em', textTransform: 'uppercase' }}>Publicar Anuncio</h4>
                <form onSubmit={postAnnouncement}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 7 }}>Título</label>
                    <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} required
                      style={{ width: '100%', padding: '10px 12px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 7 }}>Contenido</label>
                    <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} required rows={5}
                      style={{ width: '100%', padding: '10px 12px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box', resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 7 }}>Categoría</label>
                      <select value={annCategory} onChange={e => setAnnCategory(e.target.value)}
                        style={{ padding: '10px 12px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: 'Georgia,serif' }}>
                        <option value="general">General</option>
                        <option value="milestone">Hito</option>
                        <option value="event">Evento</option>
                        <option value="update">Actualización</option>
                        <option value="opportunity">Oportunidad</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
                      <input type="checkbox" id="pinned" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: G }} />
                      <label htmlFor="pinned" style={{ fontSize: 13, color: CH, cursor: 'pointer' }}>Fijar arriba</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button type="submit" disabled={annPosting}
                      style={{ padding: '10px 28px', background: annPosting ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: annPosting ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
                      {annPosting ? 'Publicando...' : 'Publicar →'}
                    </button>
                    {annPosted && <span style={{ color: '#6fcf97', fontSize: 13 }}>✓ Publicado</span>}
                  </div>
                </form>
              </div>
            )}

            {localAnnouncements.length === 0 ? (
              <div style={{ ...panelStyle, textAlign: 'center', opacity: .5, padding: 48 }}>
                <p style={{ fontSize: 15 }}>No hay anuncios todavía.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {localAnnouncements.map(a => (
                  <div key={a.id} style={{ ...panelStyle, borderLeft: `3px solid ${a.pinned ? G : LINE}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {a.pinned && <span style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: G, border: `1px solid ${G}`, padding: '3px 8px', borderRadius: 20 }}>Fijado</span>}
                        <span style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: CH, border: `1px solid ${LINE}`, padding: '3px 8px', borderRadius: 20 }}>{a.category}</span>
                      </div>
                      <span style={{ fontSize: 12, opacity: .4 }}>{new Date(a.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 style={{ fontWeight: 300, fontSize: 20, color: G, marginBottom: 10 }}>{a.title}</h3>
                    <p style={{ fontSize: 14, opacity: .75, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
