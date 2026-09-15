'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Distributor, PipelineFilm, Announcement } from '@/lib/types'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'

type Tab = 'home' | 'catalogue' | 'messages'

type DMsg = { id: string; sender: string; body: string; read_by_admin: boolean; created_at: string }

interface Props {
  user: { id: string; email?: string }
  distributor: Distributor | null
  pipeline: PipelineFilm[]
  announcements: Announcement[]
  messages: DMsg[]
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#101010',
  border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff',
  fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.28em',
  textTransform: 'uppercase', color: CH, marginBottom: 7,
}

export default function DistributorsClient({ user, distributor, pipeline, announcements, messages: initMessages }: Props) {
  const [tab, setTab] = useState<Tab>('home')
  const [messages, setMessages] = useState(initMessages)
  const [msgBody, setMsgBody] = useState('')
  const [sending, setSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [filterGenre, setFilterGenre] = useState('')
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  const panel: React.CSSProperties = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24 }
  const unread = messages.filter(m => m.sender === 'admin').length

  const genres = Array.from(new Set(pipeline.map(f => f.genre).filter(Boolean))).sort() as string[]
  const filtered = filterGenre ? pipeline.filter(f => f.genre === filterGenre) : pipeline

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!distributor || !msgBody.trim()) return
    setSending(true)
    const { data } = await supabase
      .from('mxb_distributor_messages')
      .insert({ distributor_id: distributor.id, sender: 'distributor', body: msgBody })
      .select().single()
    if (data) setMessages(prev => [data as DMsg, ...prev])
    setMsgBody('')
    setMsgSent(true)
    setSending(false)
    setTimeout(() => setMsgSent(false), 3000)
  }

  async function expressInterest(film: PipelineFilm) {
    if (!distributor) return
    const body = `📽 Interés en distribución: "${film.title}"${film.genre ? ` · ${film.genre}` : ''}${film.country ? ` · ${film.country}` : ''}. Me gustaría recibir el dossier completo y coordinar los siguientes pasos.`
    await supabase.from('mxb_distributor_messages').insert({ distributor_id: distributor.id, sender: 'distributor', body })
    setInterestSent(prev => new Set(prev).add(film.id))
  }

  const navBtn = (t: Tab, label: string, badge?: number) => (
    <button key={t} onClick={() => setTab(t)} style={{
      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif',
      fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
      color: tab === t ? G : CH, padding: '8px 2px',
      borderBottom: tab === t ? `2px solid ${G}` : '2px solid transparent',
      whiteSpace: 'nowrap',
    }}>{label}{badge ? ` (${badge})` : ''}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', color: '#fff' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,11,.97)', borderBottom: `1px solid ${LINE}`,
        padding: '14px 22px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', backdropFilter: 'blur(8px)', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 14, letterSpacing: '.28em', color: G, fontWeight: 300 }}>MOVIES × BRANDS</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {navBtn('home', 'Inicio')}
          {navBtn('catalogue', 'Catálogo')}
          {navBtn('messages', 'Comunicación', unread || undefined)}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#c0392b', padding: '8px 2px' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '38px 22px 80px' }}>

        {/* ===== INICIO ===== */}
        {tab === 'home' && (
          <div>
            {/* Hero */}
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32, background: 'linear-gradient(135deg,#0d0d0d,#0d1018)', border: `1px solid ${G}` }}>
              <div style={{ padding: '54px 42px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 10 }}>
                  Distribuidora · The Wonder World Group
                </div>
                <h2 style={{ fontWeight: 300, fontSize: 36, color: G, marginBottom: 8 }}>
                  Bienvenida, {distributor?.contact_name ?? user.email}
                </h2>
                {distributor?.company_name && (
                  <p style={{ color: CH, fontSize: 15, letterSpacing: '.1em', marginBottom: 16 }}>{distributor.company_name}</p>
                )}
                <div style={{ display: 'inline-block', border: `1px solid ${G}`, color: G, fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 30 }}>
                  Portal de Distribuidoras · Movies × Brands
                </div>
              </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {announcements.slice(0, 2).map(a => (
                  <div key={a.id} style={{ ...panel, borderColor: G, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 15 }}>📢</span>
                      <span style={{ color: G, fontSize: 14 }}>{a.title}</span>
                      <span style={{ fontSize: 11, opacity: .4, marginLeft: 'auto' }}>{new Date(a.published_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <p style={{ fontSize: 13, opacity: .7, lineHeight: 1.7, margin: 0 }}>{a.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 28 }}>
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Proyectos disponibles</div>
                <div style={{ fontSize: 22, fontWeight: 300, color: G }}>{pipeline.length}</div>
              </div>
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Mensajes</div>
                <div style={{ fontSize: 22, fontWeight: 300, color: G }}>{messages.length}</div>
              </div>
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🌍</div>
                <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>Estado</div>
                <div style={{ fontSize: 22, fontWeight: 300, color: G }}>Activo</div>
              </div>
            </div>

            {/* Profile */}
            <div style={{ ...panel, borderColor: G }}>
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, marginBottom: 18 }}>Tu perfil</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Nombre', distributor?.contact_name],
                  ['Email', distributor?.email ?? user.email],
                  ['Empresa', distributor?.company_name],
                  ['Teléfono', distributor?.phone],
                  ['País', distributor?.country],
                ].map(([label, value]) => value ? (
                  <div key={label as string}>
                    <div style={{ ...lbl }}>{label as string}</div>
                    <div style={{ fontSize: 14 }}>{value as string}</div>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        )}

        {/* ===== CATÁLOGO ===== */}
        {tab === 'catalogue' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Catálogo de Proyectos</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 24 }}>Proyectos disponibles para distribución en el ecosistema Movies × Brands</p>

            {genres.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => setFilterGenre('')} style={{ padding: '7px 16px', background: !filterGenre ? G : 'transparent', color: !filterGenre ? '#0b0b0b' : CH, border: `1px solid ${!filterGenre ? G : LINE}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.15em' }}>Todos</button>
                {genres.map(g => (
                  <button key={g} onClick={() => setFilterGenre(g)} style={{ padding: '7px 16px', background: filterGenre === g ? G : 'transparent', color: filterGenre === g ? '#0b0b0b' : CH, border: `1px solid ${filterGenre === g ? G : LINE}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.15em' }}>{g}</button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ ...panel, textAlign: 'center', padding: 60, opacity: .5 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                <p>No hay proyectos disponibles en este momento.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 22 }}>
                {filtered.map(f => {
                  const pct = f.funding_pct ?? (f.funding_total && f.funding_remaining ? Math.round(((f.funding_total - f.funding_remaining) / f.funding_total) * 100) : 0)
                  const sent = interestSent.has(f.id)
                  return (
                    <div key={f.id} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {f.festival && <span style={{ fontSize: 11, opacity: .6 }}>🏆 {f.festival}</span>}
                      </div>
                      <h3 style={{ fontWeight: 300, fontSize: 20, color: G, margin: 0 }}>{f.title}</h3>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {f.genre && <span style={{ fontSize: 11, opacity: .6 }}>🎭 {f.genre}</span>}
                        {f.country && <span style={{ fontSize: 11, opacity: .6 }}>🌍 {f.country}</span>}
                      </div>
                      {f.synopsis && <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.65, margin: 0 }}>{f.synopsis.slice(0, 160)}{f.synopsis.length > 160 ? '…' : ''}</p>}
                      {f.funding_total && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, opacity: .7 }}>
                            <span>Financiación cubierta</span><span>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: '#2a2a2a', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: G, borderRadius: 2 }} />
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                        {f.dossier_url && (
                          <a href={f.dossier_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, textDecoration: 'none', letterSpacing: '.12em' }}>📄 Dossier →</a>
                        )}
                        <button onClick={() => expressInterest(f)} disabled={sent} style={{ marginLeft: 'auto', padding: '8px 16px', background: sent ? 'transparent' : G, color: sent ? '#6fcf97' : '#0b0b0b', border: sent ? '1px solid #6fcf97' : 'none', borderRadius: 5, cursor: sent ? 'default' : 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase' }}>
                          {sent ? '✓ Interés enviado' : 'Expresar interés'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== MENSAJES ===== */}
        {tab === 'messages' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Comunicación</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 28 }}>Tu línea directa con el equipo de Movies × Brands</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div style={panel}>
                <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Conversación</div>
                <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.length === 0 && <div style={{ opacity: .4, fontSize: 13, textAlign: 'center', padding: 32 }}>Todavía no hay mensajes. Escríbenos cuando quieras.</div>}
                  {[...messages].reverse().map(m => {
                    const mine = m.sender === 'distributor'
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: 10, background: mine ? '#1f1f1f' : 'rgba(212,175,55,.12)', border: `1px solid ${mine ? '#333' : 'rgba(212,175,55,.3)'}` }}>
                          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .5, marginBottom: 5 }}>
                            {mine ? 'Tú' : 'Movies × Brands'} · {new Date(m.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.body}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ ...panel, borderColor: G }}>
                <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, marginBottom: 16 }}>Enviar mensaje</div>
                <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} required rows={6} placeholder="Escribe tu mensaje…" style={{ ...inp, resize: 'vertical' }} />
                  {msgSent && <div style={{ color: '#6fcf97', fontSize: 13 }}>✓ Mensaje enviado</div>}
                  <button type="submit" disabled={sending || !msgBody.trim()} style={{ padding: 13, background: sending ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                    {sending ? 'Enviando...' : 'Enviar →'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      <footer style={{ borderTop: `1px solid ${LINE}`, background: '#080808', padding: '30px 22px', textAlign: 'center', fontSize: 11, opacity: .35, fontFamily: 'Georgia,serif' }}>
        © 2026 Movies × Brands · The Wonder World Group®. Todos los derechos reservados.
      </footer>
    </div>
  )
}
