'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Message, Reward, RedemptionRequest, Announcement } from '@/lib/types'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'
const DANGER = '#c0392b'

type AdminTab = 'partners' | 'pipeline' | 'announcements' | 'messages' | 'rewards' | 'redemptions'

type Project = {
  id: string
  producer_id: string | null
  title: string
  genre: string | null
  country: string | null
  synopsis: string | null
  funding_total: number | null
  funding_remaining: number | null
  funding_pct: number | null
  festival: string | null
  dossier_url: string | null
  status: string
  published_at: string | null
  created_at: string
}

interface Props {
  partners: Partner[]
  projects: Project[]
  announcements: Announcement[]
  messages: (Message & { mxb_partners?: { full_name: string; company: string | null } | null })[]
  rewards: Reward[]
  redemptions: (RedemptionRequest & { mxb_partners?: { full_name: string } | null; mxb_rewards?: { name: string } | null })[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#101010',
  border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff',
  fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.3em',
  textTransform: 'uppercase', color: CH, marginBottom: 7,
}
const miniBtnStyle = (red?: boolean): React.CSSProperties => ({
  background: 'transparent', border: `1px solid ${red ? DANGER : G}`,
  color: red ? '#e07060' : G, borderRadius: 5, padding: '5px 10px',
  cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 9,
  letterSpacing: '.18em', textTransform: 'uppercase', marginRight: 4,
})

export default function AdminClient({ partners: initPartners, projects: initProjects, announcements: initAnn, messages, rewards: initRewards, redemptions: initRedemptions }: Props) {
  const [tab, setTab] = useState<AdminTab>('partners')
  const [partners, setPartners] = useState(initPartners)
  const [projects, setProjects] = useState(initProjects)
  const [announcements, setAnnouncements] = useState(initAnn)
  const [redemptions, setRedemptions] = useState(initRedemptions)
  const [rewards] = useState(initRewards)
  const router = useRouter()
  const supabase = createClient()

  // --- Partner form ---
  const [npName, setNpName] = useState('')
  const [npEmail, setNpEmail] = useState('')
  const [npCompany, setNpCompany] = useState('')
  const [npPosition, setNpPosition] = useState('')
  const [npPhone, setNpPhone] = useState('')
  const [npCountry, setNpCountry] = useState('')
  const [npPoints, setNpPoints] = useState('0')
  const [npSL, setNpSL] = useState(false)
  const [npCreating, setNpCreating] = useState(false)
  const [npMsg, setNpMsg] = useState('')

  // --- Edit points ---
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPoints, setEditPoints] = useState('')
  const [editNote, setEditNote] = useState('')

  // --- Pipeline form ---
  const [pfTitle, setPfTitle] = useState('')
  const [pfGenre, setPfGenre] = useState('')
  const [pfCountry, setPfCountry] = useState('')
  const [pfSynopsis, setPfSynopsis] = useState('')
  const [pfFundingTotal, setPfFundingTotal] = useState('')
  const [pfFundingRemaining, setPfFundingRemaining] = useState('')
  const [pfFestival, setPfFestival] = useState('')
  const [pfStatus, setPfStatus] = useState('open')
  const [pfDossier, setPfDossier] = useState('')
  const [pfFundingPct, setPfFundingPct] = useState('0')
  const [pfAdding, setPfAdding] = useState(false)

  // --- Announcement form ---
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annCategory, setAnnCategory] = useState('general')
  const [annPinned, setAnnPinned] = useState(false)
  const [annPosting, setAnnPosting] = useState(false)

  // Stats
  const activePartners = partners.filter(p => p.status === 'active').length
  const pendingPartners = partners.filter(p => p.status !== 'active').length
  const totalPoints = partners.reduce((s, p) => s + (p.points ?? 0), 0)
  const unreadRedemptions = redemptions.filter(r => r.status === 'pending').length
  const topPartner = [...partners].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))[0]

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function createPartner(e: React.FormEvent) {
    e.preventDefault()
    if (!npEmail || !npName) return
    setNpCreating(true)
    setNpMsg('')
    const { data, error } = await supabase.from('mxb_partners').insert({
      full_name: npName, email: npEmail, company: npCompany || null,
      position: npPosition || null, phone: npPhone || null, country: npCountry || null,
      points: parseInt(npPoints) || 0, is_brand_partner: true,
      is_strategic_leader: npSL, status: 'active',
    }).select().single()
    if (error) { setNpMsg('Error: ' + error.message) }
    else {
      setPartners(prev => [data as Partner, ...prev])
      setNpName(''); setNpEmail(''); setNpCompany(''); setNpPosition('')
      setNpPhone(''); setNpCountry(''); setNpPoints('0'); setNpSL(false)
      setNpMsg('✓ Partner creado correctamente')
    }
    setNpCreating(false)
    setTimeout(() => setNpMsg(''), 4000)
  }

  async function savePoints(partnerId: string) {
    const pts = parseInt(editPoints)
    if (isNaN(pts)) return
    await supabase.from('mxb_partners').update({ points: pts, notes: editNote || null }).eq('id', partnerId)
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, points: pts, notes: editNote || null } : p))
    setEditingId(null)
  }

  async function deletePartner(id: string) {
    if (!confirm('¿Eliminar este partner?')) return
    await supabase.from('mxb_partners').delete().eq('id', id)
    setPartners(prev => prev.filter(p => p.id !== id))
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault()
    setPfAdding(true)
    const { data } = await supabase.from('mxb_projects').insert({
      title: pfTitle, genre: pfGenre || null, country: pfCountry || null,
      synopsis: pfSynopsis || null, funding_total: pfFundingTotal ? parseFloat(pfFundingTotal) : null,
      funding_remaining: pfFundingRemaining ? parseFloat(pfFundingRemaining) : null,
      funding_pct: parseInt(pfFundingPct) || 0,
      festival: pfFestival || null, status: pfStatus,
      dossier_url: pfDossier || null, published_at: new Date().toISOString(),
    }).select().single()
    if (data) {
      setProjects(prev => [data as Project, ...prev])
      setPfTitle(''); setPfGenre(''); setPfCountry(''); setPfSynopsis('')
      setPfFundingTotal(''); setPfFundingRemaining(''); setPfFestival('')
      setPfStatus('open'); setPfDossier(''); setPfFundingPct('0')
    }
    setPfAdding(false)
  }

  async function deleteProject(id: string) {
    if (!confirm('¿Eliminar esta oportunidad?')) return
    await supabase.from('mxb_projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    setAnnPosting(true)
    const { data } = await supabase.from('mxb_announcements').insert({
      title: annTitle, body: annBody, category: annCategory, pinned: annPinned,
    }).select().single()
    if (data) {
      setAnnouncements(prev => [data as Announcement, ...prev])
      setAnnTitle(''); setAnnBody(''); setAnnCategory('general'); setAnnPinned(false)
    }
    setAnnPosting(false)
  }

  async function deleteAnnouncement(id: string) {
    await supabase.from('mxb_announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function updateRedemption(id: string, status: 'approved' | 'rejected') {
    await supabase.from('mxb_redemption_requests').update({ status }).eq('id', id)
    setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const navBtn = (t: AdminTab, label: string) => (
    <button key={t} onClick={() => setTab(t)} style={{
      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif',
      fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
      color: tab === t ? G : CH, padding: '8px 4px',
      borderBottom: tab === t ? `2px solid ${G}` : '2px solid transparent',
    }}>{label}</button>
  )

  const panel: React.CSSProperties = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24 }
  const stat = (icon: string, label: string, value: string | number) => (
    <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22 }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 300, color: G }}>{value}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', color: '#fff' }}>
      {/* Admin bar */}
      <div style={{ background: '#1a1408', borderBottom: `1px solid ${G}`, padding: '10px 22px', textAlign: 'center', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G }}>
        ⚙ Modo Administración — Sonia Boost · The Wonder World Group
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,11,.97)', borderBottom: `1px solid ${LINE}`, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 15, letterSpacing: '.28em', color: G, fontWeight: 300 }}>MXB · ADMIN</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {navBtn('partners', 'Partners & Puntos')}
          {navBtn('pipeline', 'Pipeline')}
          {navBtn('announcements', 'Anuncios')}
          {navBtn('messages', 'Mensajes')}
          {navBtn('rewards', 'Recompensas')}
          {navBtn('redemptions', `Solicitudes${unreadRedemptions > 0 ? ` (${unreadRedemptions})` : ''}`)}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#e07060', padding: '8px 4px' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '38px 22px 80px' }}>

        {/* ===== PARTNERS ===== */}
        {tab === 'partners' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Brand Partners</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Alta, gestión, puntos y referidos de la edición 2027</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
              {stat('🤝', 'Partners activos', activePartners)}
              {stat('⏳', 'Pendientes', pendingPartners)}
              {stat('⭐', 'Puntos emitidos', totalPoints)}
              {stat('🎟️', 'Canjes pendientes', unreadRedemptions)}
            </div>

            {/* Points exposure */}
            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 4 }}>📊 Exposición en puntos</h4>
              <p style={{ fontSize: 13, opacity: .55, marginBottom: 16 }}>Cada punto es una promesa pendiente — visibilidad, alfombra roja, un ticket.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {stat('⭐', 'Puntos sin canjear', totalPoints)}
                {stat('💰', 'Valor aprox.', `${(totalPoints * 1000).toLocaleString('es-ES')} €`)}
                {stat('🏆', 'Top partner', topPartner?.full_name ?? '—')}
              </div>
            </div>

            {/* Add partner form */}
            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 4 }}>Añadir nuevo partner</h4>
              <p style={{ fontSize: 13, opacity: .55, marginBottom: 18 }}>Acceso solo por invitación. Tú creas la cuenta y le envías las credenciales.</p>
              <form onSubmit={createPartner}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
                  {[['Nombre completo', npName, setNpName, 'text', 'Nombre y apellido'],
                    ['Email', npEmail, setNpEmail, 'email', 'contacto@marca.com'],
                    ['Empresa / Marca', npCompany, setNpCompany, 'text', 'Nombre de la marca']].map(([lbl, val, set, type, ph]) => (
                    <div key={lbl as string}>
                      <label style={labelStyle}>{lbl as string}</label>
                      <input type={type as string} value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={ph as string} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
                  {[['Cargo', npPosition, setNpPosition, 'text', 'CMO, Directora…'],
                    ['Teléfono', npPhone, setNpPhone, 'tel', '+34 600 000 000'],
                    ['País', npCountry, setNpCountry, 'text', 'España'],
                    ['Puntos iniciales', npPoints, setNpPoints, 'number', '0']].map(([lbl, val, set, type, ph]) => (
                    <div key={lbl as string}>
                      <label style={labelStyle}>{lbl as string}</label>
                      <input type={type as string} value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={ph as string} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: CH }}>
                    <input type="checkbox" checked={npSL} onChange={e => setNpSL(e.target.checked)} style={{ accentColor: G }} />
                    Strategic Leader
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="submit" disabled={npCreating} style={{ padding: '10px 28px', background: npCreating ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: npCreating ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
                    {npCreating ? 'Creando…' : 'Crear partner →'}
                  </button>
                  {npMsg && <span style={{ fontSize: 13, color: npMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{npMsg}</span>}
                </div>
              </form>
            </div>

            {/* Partners table */}
            <div style={panel}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 18 }}>Todos los partners ({partners.length})</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Empresa', 'Email', 'Puntos', 'Estado', 'Tipo', 'Acciones'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{p.full_name}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13, opacity: .7 }}>{p.company ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{p.email}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>
                          {editingId === p.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)} style={{ ...inputStyle, width: 90, padding: '6px 10px' }} />
                              <input placeholder="Nota interna (opcional)" value={editNote} onChange={e => setEditNote(e.target.value)} style={{ ...inputStyle, fontSize: 12, padding: '5px 8px' }} />
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => savePoints(p.id)} style={miniBtnStyle()}>Guardar</button>
                                <button onClick={() => setEditingId(null)} style={miniBtnStyle(true)}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: G, fontWeight: 300, fontSize: 16 }}>{p.points ?? 0}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                          <span style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 20, padding: '5px 12px', display: 'inline-block', background: p.status === 'active' ? 'rgba(212,175,55,.15)' : '#222', color: p.status === 'active' ? G : '#999', border: `1px solid ${p.status === 'active' ? G : '#444'}` }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12 }}>
                          {p.is_strategic_leader ? <span style={{ color: CH }}>Strategic Leader</span> : <span style={{ opacity: .5 }}>Brand Partner</span>}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                          <button onClick={() => { setEditingId(p.id); setEditPoints(String(p.points ?? 0)); setEditNote(p.notes ?? '') }} style={miniBtnStyle()}>Editar puntos</button>
                          <button onClick={() => deletePartner(p.id)} style={miniBtnStyle(true)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {partners.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', opacity: .4 }}>No hay partners todavía</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PIPELINE ===== */}
        {tab === 'pipeline' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Pipeline de Oportunidades</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Proyectos visibles para los Brand Partners — sin exponer el nombre de la productora</p>

            {/* Add project form */}
            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 18 }}>Añadir oportunidad</h4>
              <form onSubmit={addProject}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Título de la película</label>
                    <input value={pfTitle} onChange={e => setPfTitle(e.target.value)} required placeholder="Título del proyecto" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Género</label>
                    <input value={pfGenre} onChange={e => setPfGenre(e.target.value)} placeholder="Drama, Thriller…" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>País</label>
                    <input value={pfCountry} onChange={e => setPfCountry(e.target.value)} placeholder="España" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Sinopsis (breve)</label>
                  <textarea value={pfSynopsis} onChange={e => setPfSynopsis(e.target.value)} rows={3} placeholder="Descripción del proyecto para los partners…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Presupuesto total (€)</label>
                    <input type="number" value={pfFundingTotal} onChange={e => setPfFundingTotal(e.target.value)} placeholder="500000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Financiación pendiente (€)</label>
                    <input type="number" value={pfFundingRemaining} onChange={e => setPfFundingRemaining(e.target.value)} placeholder="200000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>% Financiación completada</label>
                    <select value={pfFundingPct} onChange={e => setPfFundingPct(e.target.value)} style={inputStyle}>
                      {[0,10,20,30,40,50,60,70,80,90,100].map(n => (
                        <option key={n} value={n}>{n}%</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Festival</label>
                    <input value={pfFestival} onChange={e => setPfFestival(e.target.value)} placeholder="Cannes 2027" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select value={pfStatus} onChange={e => setPfStatus(e.target.value)} style={inputStyle}>
                      <option value="open">Abierto</option>
                      <option value="in_development">En desarrollo</option>
                      <option value="funded">Financiado</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>URL del dossier (opcional)</label>
                  <input value={pfDossier} onChange={e => setPfDossier(e.target.value)} placeholder="https://…" style={inputStyle} />
                </div>
                <button type="submit" disabled={pfAdding} style={{ padding: '10px 28px', background: pfAdding ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: pfAdding ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
                  {pfAdding ? 'Añadiendo…' : 'Añadir al pipeline →'}
                </button>
              </form>
            </div>

            {/* Projects list */}
            {projects.map(proj => {
              const pct = proj.funding_pct ?? (
                proj.funding_total && proj.funding_remaining
                  ? Math.round(((proj.funding_total - proj.funding_remaining) / proj.funding_total) * 100)
                  : null
              )
              return (
                <div key={proj.id} style={{ background: '#111', border: `1px solid ${LINE}`, borderRadius: 10, padding: '20px 22px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>{proj.title}</h4>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 20, padding: '5px 12px', background: proj.status === 'open' ? 'rgba(212,175,55,.15)' : '#222', color: proj.status === 'open' ? G : '#999', border: `1px solid ${proj.status === 'open' ? G : '#444'}` }}>{proj.status}</span>
                      <button onClick={() => deleteProject(proj.id)} style={miniBtnStyle(true)}>Eliminar</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, margin: '14px 0' }}>
                    {[
                      ['Género', proj.genre],
                      ['País', proj.country],
                      ['Festival', proj.festival],
                      ['Presupuesto total', proj.funding_total ? `${proj.funding_total.toLocaleString('es-ES')} €` : '—'],
                      ['Financiación pendiente', proj.funding_remaining ? `${proj.funding_remaining.toLocaleString('es-ES')} €` : '—'],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .5, marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13 }}>{(v as string) ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                  {pct !== null && (
                    <div>
                      <div style={{ fontSize: 11, opacity: .5, marginBottom: 4 }}>{pct}% financiación completada</div>
                      <div style={{ width: '100%', height: 7, background: '#222', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: G, borderRadius: 20 }} />
                      </div>
                    </div>
                  )}
                  {proj.synopsis && <p style={{ fontSize: 13, opacity: .6, marginTop: 12, lineHeight: 1.7 }}>{proj.synopsis}</p>}
                  {proj.dossier_url && <a href={proj.dossier_url} target="_blank" rel="noreferrer" style={{ color: G, fontSize: 12, marginTop: 10, display: 'inline-block' }}>Ver dossier →</a>}
                </div>
              )
            })}
            {projects.length === 0 && (
              <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 48 }}>No hay proyectos en el pipeline todavía.</div>
            )}
          </div>
        )}

        {/* ===== ANNOUNCEMENTS ===== */}
        {tab === 'announcements' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Anuncios</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Publica noticias y actualizaciones visibles para todos los partners</p>

            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 16, color: G, marginBottom: 20, letterSpacing: '.15em', textTransform: 'uppercase' }}>Nuevo anuncio</h4>
              <form onSubmit={postAnnouncement}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Título</label>
                  <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Contenido</label>
                  <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} required rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select value={annCategory} onChange={e => setAnnCategory(e.target.value)} style={inputStyle}>
                      <option value="general">General</option>
                      <option value="milestone">Hito</option>
                      <option value="event">Evento</option>
                      <option value="update">Actualización</option>
                      <option value="opportunity">Oportunidad</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: CH, marginTop: 22 }}>
                    <input type="checkbox" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} style={{ accentColor: G }} />
                    Fijar arriba
                  </label>
                </div>
                <button type="submit" disabled={annPosting} style={{ padding: '10px 28px', background: annPosting ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
                  {annPosting ? 'Publicando…' : 'Publicar →'}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {announcements.map(a => (
                <div key={a.id} style={{ ...panel, borderLeft: `3px solid ${a.pinned ? G : LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {a.pinned && <span style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: G, border: `1px solid ${G}`, padding: '3px 8px', borderRadius: 20 }}>Fijado</span>}
                      <span style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: CH, border: `1px solid ${LINE}`, padding: '3px 8px', borderRadius: 20 }}>{a.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, opacity: .4 }}>{new Date(a.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <button onClick={() => deleteAnnouncement(a.id)} style={miniBtnStyle(true)}>Eliminar</button>
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, opacity: .7, lineHeight: 1.8, margin: 0 }}>{a.body}</p>
                </div>
              ))}
              {announcements.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 48 }}>No hay anuncios todavía.</div>}
            </div>
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {tab === 'messages' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Mensajes</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Comunicaciones de los partners</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(m => (
                <div key={m.id} style={{ ...panel, borderLeft: `3px solid ${m.sender === 'partner' && !m.read_by_admin ? G : LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ color: m.sender === 'admin' ? CH : '#fff', fontSize: 14, fontWeight: m.sender === 'partner' && !m.read_by_admin ? 600 : 400 }}>
                        {m.sender === 'admin' ? '↩ Admin' : (m.mxb_partners?.full_name ?? 'Partner')}
                      </span>
                      {m.mxb_partners?.company && <span style={{ fontSize: 12, opacity: .5, marginLeft: 8 }}>{m.mxb_partners.company}</span>}
                    </div>
                    <span style={{ fontSize: 12, opacity: .4 }}>{new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {m.subject && <div style={{ fontSize: 13, color: G, marginBottom: 6 }}>{m.subject}</div>}
                  <p style={{ fontSize: 14, opacity: .8, lineHeight: 1.7, margin: 0 }}>{m.body}</p>
                </div>
              ))}
              {messages.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 48 }}>No hay mensajes todavía.</div>}
            </div>
          </div>
        )}

        {/* ===== REWARDS ===== */}
        {tab === 'rewards' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Catálogo de Recompensas</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Lo que los partners pueden canjear con sus puntos</p>
            {rewards.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '18px 20px', border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 12, background: PANEL, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 15, marginBottom: 3 }}>{r.name}</div>
                  <div style={{ fontSize: 12, opacity: .5 }}>{r.description}</div>
                  {r.contribution_range && <div style={{ fontSize: 11, opacity: .4, marginTop: 3 }}>{r.contribution_range}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, color: G }}>{r.cost_points} pts</div>
                    {r.real_cost_eur && <div style={{ fontSize: 12, opacity: .5 }}>{r.real_cost_eur} €</div>}
                  </div>
                  <span style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 20, padding: '5px 12px', background: r.is_active ? 'rgba(212,175,55,.15)' : '#222', color: r.is_active ? G : '#999', border: `1px solid ${r.is_active ? G : '#444'}` }}>
                    {r.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 48 }}>No hay recompensas todavía.</div>}
          </div>
        )}

        {/* ===== REDEMPTIONS ===== */}
        {tab === 'redemptions' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Solicitudes de Canje</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Aprueba o rechaza las solicitudes de los partners</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Partner', 'Recompensa', 'Estado', 'Fecha', 'Acción'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{r.mxb_partners?.full_name ?? '—'}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{r.mxb_rewards?.name ?? '—'}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                        <span style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 20, padding: '5px 12px', background: r.status === 'approved' ? 'rgba(111,207,151,.15)' : r.status === 'rejected' ? 'rgba(192,57,43,.15)' : 'rgba(212,175,55,.15)', color: r.status === 'approved' ? '#6fcf97' : r.status === 'rejected' ? '#e07060' : G, border: `1px solid ${r.status === 'approved' ? '#6fcf97' : r.status === 'rejected' ? '#e07060' : G}` }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{new Date(r.created_at).toLocaleDateString('es-ES')}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => updateRedemption(r.id, 'approved')} style={miniBtnStyle()}>Aprobar</button>
                            <button onClick={() => updateRedemption(r.id, 'rejected')} style={miniBtnStyle(true)}>Rechazar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {redemptions.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', opacity: .4 }}>No hay solicitudes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
