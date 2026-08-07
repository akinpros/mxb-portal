'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'

type AdminTab = 'partners' | 'opportunities' | 'announcements' | 'messages' | 'rewards' | 'redemptions'

interface Partner {
  id: string; user_id: string | null; full_name: string; email: string; company: string | null
  position: string | null; points: number; status: string; is_brand_partner: boolean
  is_strategic_leader: boolean; contract_end: string | null; notes: string | null; created_at: string
}

interface Project {
  id: string; title: string; genre: string | null; country: string | null; synopsis: string | null
  funding_total: number | null; funding_remaining: number | null; festival: string | null
  dossier_url: string | null; status: string; published_at: string | null; created_at: string
}

interface Announcement {
  id: string; title: string; body: string; category: string; pinned: boolean; published_at: string
}

interface Message {
  id: string; partner_id: string; sender: string; subject: string | null; body: string
  read_by_admin: boolean; created_at: string; mxb_partners?: { full_name: string; company: string | null }
}

interface Reward {
  id: string; name: string; description: string | null; cost_points: number; slots: number | null
  contribution_range: string | null; real_cost_eur: number | null; is_active: boolean
}

interface Redemption {
  id: string; status: string; created_at: string; notes: string | null
  mxb_partners?: { full_name: string } | null; mxb_rewards?: { name: string } | null
}

interface Props {
  user: { id: string; email?: string }
  partners: Partner[]
  projects: Project[]
  announcements: Announcement[]
  messages: Message[]
  rewards: Reward[]
  redemptions: Redemption[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#101010',
  border: `1px solid #3a3a3a`, borderRadius: 6, color: '#fff',
  fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.3em',
  textTransform: 'uppercase', color: CH, marginBottom: 7,
}

const btnGold: React.CSSProperties = {
  padding: '10px 22px', background: G, color: '#0b0b0b', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: 11, letterSpacing: '.25em',
  textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600,
}

const btnGhost: React.CSSProperties = {
  padding: '8px 16px', background: 'none', color: CH,
  border: `1px solid ${LINE}`, borderRadius: 6, cursor: 'pointer',
  fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif',
}

export default function AdminClient({ user, partners: initPartners, projects: initProjects, announcements: initAnn, messages: initMessages, rewards: initRewards, redemptions: initRedemptions }: Props) {
  const [tab, setTab] = useState<AdminTab>('partners')
  const [partners, setPartners] = useState(initPartners)
  const [projects, setProjects] = useState(initProjects)
  const [announcements, setAnnouncements] = useState(initAnn)
  const [messages] = useState(initMessages)
  const [rewards] = useState(initRewards)
  const [redemptions, setRedemptions] = useState(initRedemptions)

  // Partner editing
  const [editingPartner, setEditingPartner] = useState<string | null>(null)
  const [editPoints, setEditPoints] = useState(0)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // New project form
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [pTitle, setPTitle] = useState('')
  const [pGenre, setPGenre] = useState('')
  const [pCountry, setPCountry] = useState('')
  const [pSynopsis, setPSynopsis] = useState('')
  const [pFundingTotal, setPFundingTotal] = useState('')
  const [pFundingRemaining, setPFundingRemaining] = useState('')
  const [pFestival, setPFestival] = useState('')
  const [pDossier, setPDossier] = useState('')
  const [pStatus, setPStatus] = useState('active')
  const [pSaving, setPSaving] = useState(false)

  // New announcement form
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annCategory, setAnnCategory] = useState('general')
  const [annPinned, setAnnPinned] = useState(false)
  const [annPosting, setAnnPosting] = useState(false)

  // Reply to message
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replySending, setReplySending] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function savePartner(id: string) {
    const { data } = await supabase.from('mxb_partners')
      .update({ points: editPoints, status: editStatus, notes: editNotes })
      .eq('id', id).select().single()
    if (data) setPartners(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    setEditingPartner(null)
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault()
    setPSaving(true)
    const { data } = await supabase.from('mxb_projects').insert({
      title: pTitle, genre: pGenre || null, country: pCountry || null,
      synopsis: pSynopsis || null,
      funding_total: pFundingTotal ? Number(pFundingTotal) : null,
      funding_remaining: pFundingRemaining ? Number(pFundingRemaining) : null,
      festival: pFestival || null, dossier_url: pDossier || null, status: pStatus,
      published_at: new Date().toISOString(),
    }).select().single()
    if (data) setProjects(prev => [data as Project, ...prev])
    setPTitle(''); setPGenre(''); setPCountry(''); setPSynopsis('')
    setPFundingTotal(''); setPFundingRemaining(''); setPFestival(''); setPDossier('')
    setPStatus('active'); setShowProjectForm(false); setPSaving(false)
  }

  async function deleteProject(id: string) {
    await supabase.from('mxb_projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    setAnnPosting(true)
    const { data } = await supabase.from('mxb_announcements').insert({
      title: annTitle, body: annBody, category: annCategory, pinned: annPinned,
    }).select().single()
    if (data) setAnnouncements(prev => [data as Announcement, ...prev])
    setAnnTitle(''); setAnnBody(''); setAnnCategory('general'); setAnnPinned(false)
    setAnnPosting(false)
  }

  async function deleteAnnouncement(id: string) {
    await supabase.from('mxb_announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function sendReply(partnerId: string) {
    if (!replyBody.trim()) return
    setReplySending(true)
    await supabase.from('mxb_messages').insert({
      partner_id: partnerId, sender: 'admin', body: replyBody,
    })
    setReplyBody(''); setReplyTarget(null); setReplySending(false)
  }

  async function updateRedemption(id: string, status: string) {
    const { data } = await supabase.from('mxb_redemption_requests')
      .update({ status }).eq('id', id).select().single()
    if (data) setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const panelStyle: React.CSSProperties = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24 }
  const tabs: AdminTab[] = ['partners', 'opportunities', 'announcements', 'messages', 'rewards', 'redemptions']
  const tabLabels: Record<AdminTab, string> = {
    partners: 'Brand Partners', opportunities: 'Oportunidades', announcements: 'Anuncios',
    messages: 'Mensajes', rewards: 'Recompensas', redemptions: 'Solicitudes',
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', color: '#fff' }}>
      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${LINE}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 300, fontSize: 20, letterSpacing: '.25em', color: G }}>MOVIES × BRANDS</span>
          <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#fff', opacity: .4, border: `1px solid ${LINE}`, padding: '3px 10px', borderRadius: 20 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, opacity: .5 }}>{user.email}</span>
          <button onClick={logout} style={btnGhost}>Salir</button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{ borderBottom: `1px solid ${LINE}`, padding: '0 32px', display: 'flex', gap: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.22em',
            textTransform: 'uppercase', color: tab === t ? G : CH,
            padding: '16px 4px', borderBottom: tab === t ? `2px solid ${G}` : '2px solid transparent',
            whiteSpace: 'nowrap',
          }}>{tabLabels[t]}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── BRAND PARTNERS ── */}
        {tab === 'partners' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 28, color: G, marginBottom: 24 }}>Brand Partners ({partners.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {partners.map(p => (
                <div key={p.id} style={panelStyle}>
                  {editingPartner === p.id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>Puntos / Créditos</label>
                          <input type="number" value={editPoints} onChange={e => setEditPoints(Number(e.target.value))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Estado</label>
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                            style={{ ...inputStyle, width: 'auto' }}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="suspended">Suspendido</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Notas internas</label>
                        <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                          style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => savePartner(p.id)} style={btnGold}>Guardar</button>
                        <button onClick={() => setEditingPartner(null)} style={btnGhost}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontWeight: 300, fontSize: 18, color: G, margin: 0 }}>{p.full_name}</h3>
                          {p.is_brand_partner && <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G, border: `1px solid ${G}`, padding: '2px 8px', borderRadius: 20 }}>BP</span>}
                          {p.is_strategic_leader && <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: CH, border: `1px solid ${CH}`, padding: '2px 8px', borderRadius: 20 }}>SL</span>}
                          <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20, border: `1px solid ${LINE}`, color: p.status === 'active' ? '#6fcf97' : '#e07060' }}>{p.status}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, opacity: .6 }}>{p.email} {p.company ? `· ${p.company}` : ''}</p>
                        {p.notes && <p style={{ margin: '6px 0 0', fontSize: 12, opacity: .45, fontStyle: 'italic' }}>{p.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 26, fontWeight: 300, color: G }}>{p.points}</div>
                          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .5 }}>Puntos</div>
                        </div>
                        <button onClick={() => { setEditingPartner(p.id); setEditPoints(p.points); setEditStatus(p.status); setEditNotes(p.notes ?? '') }} style={btnGhost}>Editar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {partners.length === 0 && <p style={{ opacity: .4 }}>No hay partners registrados todavía.</p>}
            </div>
          </div>
        )}

        {/* ── OPPORTUNITIES / PIPELINE ── */}
        {tab === 'opportunities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 300, fontSize: 28, color: G, margin: 0 }}>Oportunidades de Inversión ({projects.length})</h2>
              <button onClick={() => setShowProjectForm(v => !v)} style={btnGold}>
                {showProjectForm ? 'Cancelar' : '+ Nueva Oportunidad'}
              </button>
            </div>

            {showProjectForm && (
              <div style={{ ...panelStyle, borderColor: G, marginBottom: 28 }}>
                <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 20, letterSpacing: '.15em', textTransform: 'uppercase' }}>Nueva Oportunidad</h4>
                <form onSubmit={saveProject}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Título *</label>
                      <input value={pTitle} onChange={e => setPTitle(e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Festival / Mercado</label>
                      <input value={pFestival} onChange={e => setPFestival(e.target.value)} style={inputStyle} placeholder="Cannes 2027, Berlinale..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Género</label>
                      <input value={pGenre} onChange={e => setPGenre(e.target.value)} style={inputStyle} placeholder="Drama, Documental..." />
                    </div>
                    <div>
                      <label style={labelStyle}>País</label>
                      <input value={pCountry} onChange={e => setPCountry(e.target.value)} style={inputStyle} placeholder="España, Francia..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Financiación Total (€)</label>
                      <input type="number" value={pFundingTotal} onChange={e => setPFundingTotal(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Financiación Restante (€)</label>
                      <input type="number" value={pFundingRemaining} onChange={e => setPFundingRemaining(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Sinopsis</label>
                    <textarea value={pSynopsis} onChange={e => setPSynopsis(e.target.value)} rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>URL del Dossier</label>
                      <input value={pDossier} onChange={e => setPDossier(e.target.value)} style={inputStyle} placeholder="https://..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Estado</label>
                      <select value={pStatus} onChange={e => setPStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                        <option value="active">Activo</option>
                        <option value="funded">Financiado</option>
                        <option value="closed">Cerrado</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={pSaving} style={{ ...btnGold, opacity: pSaving ? .6 : 1 }}>
                    {pSaving ? 'Guardando...' : 'Publicar Oportunidad →'}
                  </button>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
              {projects.map(p => (
                <div key={p.id} style={{ ...panelStyle, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', border: `1px solid ${LINE}`, padding: '3px 8px', borderRadius: 20, color: p.status === 'active' ? '#6fcf97' : CH }}>{p.status}</span>
                    <button onClick={() => { if (confirm('¿Eliminar esta oportunidad?')) deleteProject(p.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e07060', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                  <h3 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 8 }}>{p.title}</h3>
                  {p.genre && <p style={{ margin: '0 0 4px', fontSize: 12, opacity: .5 }}>{p.genre}{p.country ? ` · ${p.country}` : ''}</p>}
                  {p.festival && <p style={{ margin: '0 0 10px', fontSize: 12, color: CH, opacity: .7 }}>🎪 {p.festival}</p>}
                  {p.synopsis && <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.7, margin: '0 0 12px' }}>{p.synopsis.substring(0, 120)}{p.synopsis.length > 120 ? '...' : ''}</p>}
                  {p.funding_remaining != null && (
                    <div style={{ fontSize: 13, color: G }}>
                      €{p.funding_remaining.toLocaleString('es-ES')} restantes
                      {p.funding_total ? ` de €${p.funding_total.toLocaleString('es-ES')}` : ''}
                    </div>
                  )}
                  {p.dossier_url && (
                    <a href={p.dossier_url} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: 12, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: G, textDecoration: 'none' }}>
                      Ver Dossier →
                    </a>
                  )}
                </div>
              ))}
              {projects.length === 0 && <p style={{ opacity: .4 }}>No hay oportunidades todavía. Añade la primera.</p>}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {tab === 'announcements' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 28, color: G, marginBottom: 24 }}>Anuncios y Noticias</h2>
            <div style={{ ...panelStyle, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 20, letterSpacing: '.15em', textTransform: 'uppercase' }}>Publicar Anuncio</h4>
              <form onSubmit={postAnnouncement}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Título</label>
                  <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Contenido</label>
                  <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} required rows={5}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select value={annCategory} onChange={e => setAnnCategory(e.target.value)}
                      style={{ ...inputStyle, width: 'auto' }}>
                      <option value="general">General</option>
                      <option value="milestone">Hito</option>
                      <option value="event">Evento</option>
                      <option value="update">Actualización</option>
                      <option value="opportunity">Oportunidad</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 18 }}>
                    <input type="checkbox" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} style={{ accentColor: G, width: 16, height: 16 }} />
                    <span style={{ fontSize: 13, color: CH }}>Fijar arriba</span>
                  </label>
                </div>
                <button type="submit" disabled={annPosting} style={{ ...btnGold, opacity: annPosting ? .6 : 1 }}>
                  {annPosting ? 'Publicando...' : 'Publicar →'}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {announcements.map(a => (
                <div key={a.id} style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: `3px solid ${a.pinned ? G : LINE}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {a.pinned && <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G, border: `1px solid ${G}`, padding: '2px 8px', borderRadius: 20 }}>Fijado</span>}
                      <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: CH, border: `1px solid ${LINE}`, padding: '2px 8px', borderRadius: 20 }}>{a.category}</span>
                    </div>
                    <h4 style={{ fontWeight: 300, fontSize: 16, color: G, margin: '0 0 6px' }}>{a.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, opacity: .6, lineHeight: 1.6 }}>{a.body.substring(0, 100)}{a.body.length > 100 ? '...' : ''}</p>
                    <p style={{ margin: '6px 0 0', fontSize: 11, opacity: .35 }}>{new Date(a.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e07060', fontSize: 20, marginLeft: 16, lineHeight: 1 }}>×</button>
                </div>
              ))}
              {announcements.length === 0 && <p style={{ opacity: .4 }}>No hay anuncios todavía.</p>}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 28, color: G, marginBottom: 24 }}>Mensajes de Partners</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.filter(m => m.sender === 'partner').map(m => (
                <div key={m.id} style={{ ...panelStyle, borderLeft: !m.read_by_admin ? `3px solid ${G}` : `3px solid ${LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: CH }}>{m.mxb_partners?.full_name ?? 'Partner'} {m.mxb_partners?.company ? `· ${m.mxb_partners.company}` : ''}</span>
                    <span style={{ fontSize: 11, opacity: .35 }}>{new Date(m.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  {m.subject && <p style={{ margin: '0 0 6px', fontSize: 13, color: G }}>{m.subject}</p>}
                  <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.7, opacity: .8 }}>{m.body}</p>
                  {replyTarget === m.id ? (
                    <div>
                      <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={3} placeholder="Escribe tu respuesta..."
                        style={{ ...inputStyle, marginBottom: 10 }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => sendReply(m.partner_id)} disabled={replySending} style={{ ...btnGold, opacity: replySending ? .6 : 1 }}>
                          {replySending ? 'Enviando...' : 'Enviar →'}
                        </button>
                        <button onClick={() => setReplyTarget(null)} style={btnGhost}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyTarget(m.id)} style={btnGhost}>Responder</button>
                  )}
                </div>
              ))}
              {messages.filter(m => m.sender === 'partner').length === 0 && (
                <p style={{ opacity: .4 }}>No hay mensajes de partners todavía.</p>
              )}
            </div>
          </div>
        )}

        {/* ── REWARDS ── */}
        {tab === 'rewards' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 28, color: G, marginBottom: 24 }}>Catálogo de Recompensas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {rewards.map(r => (
                <div key={r.id} style={{ ...panelStyle, opacity: r.is_active ? 1 : .5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 300, color: G }}>{r.cost_points} pts</span>
                    <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', border: `1px solid ${LINE}`, padding: '3px 8px', borderRadius: 20, color: r.is_active ? '#6fcf97' : '#e07060' }}>
                      {r.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 8 }}>{r.name}</h4>
                  {r.description && <p style={{ fontSize: 13, opacity: .6, lineHeight: 1.6, margin: '0 0 8px' }}>{r.description}</p>}
                  {r.contribution_range && <p style={{ fontSize: 12, opacity: .45, margin: 0 }}>Rango: {r.contribution_range}</p>}
                  {r.real_cost_eur != null && <p style={{ fontSize: 12, opacity: .45, margin: '4px 0 0' }}>Valor real: €{r.real_cost_eur}</p>}
                </div>
              ))}
              {rewards.length === 0 && <p style={{ opacity: .4 }}>No hay recompensas configuradas.</p>}
            </div>
          </div>
        )}

        {/* ── REDEMPTION REQUESTS ── */}
        {tab === 'redemptions' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 28, color: G, marginBottom: 24 }}>Solicitudes de Canje</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {redemptions.map(r => (
                <div key={r.id} style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 15, color: G }}>{r.mxb_rewards?.name ?? 'Recompensa'}</p>
                    <p style={{ margin: 0, fontSize: 13, opacity: .6 }}>{r.mxb_partners?.full_name ?? 'Partner'} · {new Date(r.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', border: `1px solid ${LINE}`, padding: '4px 10px', borderRadius: 20, color: r.status === 'approved' ? '#6fcf97' : r.status === 'rejected' ? '#e07060' : CH }}>
                      {r.status}
                    </span>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => updateRedemption(r.id, 'approved')} style={{ ...btnGold, padding: '7px 16px' }}>Aprobar</button>
                        <button onClick={() => updateRedemption(r.id, 'rejected')} style={{ ...btnGhost, color: '#e07060', borderColor: '#e07060' }}>Rechazar</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {redemptions.length === 0 && <p style={{ opacity: .4 }}>No hay solicitudes de canje todavía.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
