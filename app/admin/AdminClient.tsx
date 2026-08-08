'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Message, Reward, RedemptionRequest, Announcement, Producer, Distributor } from '@/lib/types'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'
const DANGER = '#c0392b'

type AdminTab = 'partners' | 'pipeline' | 'announcements' | 'messages' | 'rewards' | 'redemptions' | 'producers' | 'distributors' | 'value' | 'config'

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
  producers: Producer[]
  distributors: Distributor[]
  config: Record<string, string>
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

function genPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminClient({
  partners: initPartners, projects: initProjects, announcements: initAnn,
  messages, rewards: initRewards, redemptions: initRedemptions,
  producers: initProducers, distributors: initDistributors, config: initConfig,
}: Props) {
  const [tab, setTab] = useState<AdminTab>('partners')
  const [partners, setPartners] = useState(initPartners)
  const [projects, setProjects] = useState(initProjects)
  const [announcements, setAnnouncements] = useState(initAnn)
  const [redemptions, setRedemptions] = useState(initRedemptions)
  const [rewards, setRewards] = useState(initRewards)
  const [producers, setProducers] = useState(initProducers)
  const [distributors, setDistributors] = useState(initDistributors)
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

  // --- Producers form ---
  const [prName, setPrName] = useState('')
  const [prCompany, setPrCompany] = useState('')
  const [prPhone, setPrPhone] = useState('')
  const [prEmail, setPrEmail] = useState('')
  const [prPass, setPrPass] = useState('')
  const [prCreating, setPrCreating] = useState(false)
  const [prMsg, setPrMsg] = useState('')

  // --- Distributors form ---
  const [drName, setDrName] = useState('')
  const [drCompany, setDrCompany] = useState('')
  const [drPhone, setDrPhone] = useState('')
  const [drEmail, setDrEmail] = useState('')
  const [drPass, setDrPass] = useState('')
  const [drCreating, setDrCreating] = useState(false)
  const [drMsg, setDrMsg] = useState('')

  // --- Value analysis: add reward form ---
  const [rvName, setRvName] = useState('')
  const [rvPoints, setRvPoints] = useState('')
  const [rvSlots, setRvSlots] = useState('')
  const [rvCost, setRvCost] = useState('')
  const [rvRange, setRvRange] = useState('')
  const [rvDesc, setRvDesc] = useState('')
  const [rvAdding, setRvAdding] = useState(false)
  const [rvMsg, setRvMsg] = useState('')

  // --- Config state ---
  const [cfgAiBoost, setCfgAiBoost] = useState(initConfig['ai_boost_enabled'] === 'true')
  const [cfgDevEmail, setCfgDevEmail] = useState(initConfig['dev_email'] ?? '')
  const [cfgDevPass, setCfgDevPass] = useState('')
  const [cfgPoints, setCfgPoints] = useState({
    standard: initConfig['points_standard'] ?? '5',
    influencer_500k: initConfig['points_influencer_500k'] ?? '5',
    influencer_1m: initConfig['points_influencer_1m'] ?? '10',
    alliance: initConfig['points_alliance'] ?? '5',
    silver: initConfig['points_sponsor_silver'] ?? '30',
    gold: initConfig['points_sponsor_gold'] ?? '60',
    platinum: initConfig['points_sponsor_platinum'] ?? '100',
    cannes: initConfig['points_sponsor_cannes'] ?? '180',
    global: initConfig['points_sponsor_global'] ?? '200',
  })
  const [cfgSaving, setCfgSaving] = useState(false)
  const [cfgMsg, setCfgMsg] = useState('')

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
    setNpCreating(true); setNpMsg('')
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
      synopsis: pfSynopsis || null,
      funding_total: pfFundingTotal ? parseFloat(pfFundingTotal) : null,
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

  async function createProducer(e: React.FormEvent) {
    e.preventDefault()
    if (!prEmail || !prName) return
    setPrCreating(true); setPrMsg('')
    const { data, error } = await supabase.from('mxb_producers').insert({
      contact_name: prName, company_name: prCompany || null,
      phone: prPhone || null, email: prEmail,
    }).select().single()
    if (error) { setPrMsg('Error: ' + error.message) }
    else {
      setProducers(prev => [data as Producer, ...prev])
      setPrName(''); setPrCompany(''); setPrPhone(''); setPrEmail(''); setPrPass('')
      setPrMsg('✓ Productora creada. Comparte las credenciales con el productor.')
    }
    setPrCreating(false)
    setTimeout(() => setPrMsg(''), 6000)
  }

  async function deleteProducer(id: string) {
    if (!confirm('¿Eliminar esta productora?')) return
    await supabase.from('mxb_producers').delete().eq('id', id)
    setProducers(prev => prev.filter(p => p.id !== id))
  }

  async function createDistributor(e: React.FormEvent) {
    e.preventDefault()
    if (!drEmail || !drName) return
    setDrCreating(true); setDrMsg('')
    const { data, error } = await supabase.from('mxb_distributors').insert({
      contact_name: drName, company_name: drCompany || null,
      phone: drPhone || null, email: drEmail,
    }).select().single()
    if (error) { setDrMsg('Error: ' + error.message) }
    else {
      setDistributors(prev => [data as Distributor, ...prev])
      setDrName(''); setDrCompany(''); setDrPhone(''); setDrEmail(''); setDrPass('')
      setDrMsg('✓ Distribuidora creada. Comparte las credenciales con el contacto.')
    }
    setDrCreating(false)
    setTimeout(() => setDrMsg(''), 6000)
  }

  async function deleteDistributor(id: string) {
    if (!confirm('¿Eliminar esta distribuidora?')) return
    await supabase.from('mxb_distributors').delete().eq('id', id)
    setDistributors(prev => prev.filter(d => d.id !== id))
  }

  async function addReward(e: React.FormEvent) {
    e.preventDefault()
    if (!rvName || !rvPoints) return
    setRvAdding(true); setRvMsg('')
    const { data, error } = await supabase.from('mxb_rewards').insert({
      name: rvName, description: rvDesc || null,
      cost_points: parseInt(rvPoints),
      slots: rvSlots ? parseInt(rvSlots) : null,
      real_cost_eur: rvCost ? parseFloat(rvCost) : null,
      contribution_range: rvRange || null,
      is_active: true,
    }).select().single()
    if (error) { setRvMsg('Error: ' + error.message) }
    else {
      setRewards(prev => [...prev, data as Reward].sort((a, b) => a.cost_points - b.cost_points))
      setRvName(''); setRvPoints(''); setRvSlots(''); setRvCost(''); setRvRange(''); setRvDesc('')
      setRvMsg('✓ Recompensa añadida')
    }
    setRvAdding(false)
    setTimeout(() => setRvMsg(''), 4000)
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault()
    setCfgSaving(true); setCfgMsg('')
    const entries = [
      { key: 'ai_boost_enabled', value: cfgAiBoost ? 'true' : 'false' },
      { key: 'dev_email', value: cfgDevEmail },
      { key: 'points_standard', value: cfgPoints.standard },
      { key: 'points_influencer_500k', value: cfgPoints.influencer_500k },
      { key: 'points_influencer_1m', value: cfgPoints.influencer_1m },
      { key: 'points_alliance', value: cfgPoints.alliance },
      { key: 'points_sponsor_silver', value: cfgPoints.silver },
      { key: 'points_sponsor_gold', value: cfgPoints.gold },
      { key: 'points_sponsor_platinum', value: cfgPoints.platinum },
      { key: 'points_sponsor_cannes', value: cfgPoints.cannes },
      { key: 'points_sponsor_global', value: cfgPoints.global },
    ]
    const { error } = await supabase.from('mxb_config').upsert(entries, { onConflict: 'key' })
    if (error) setCfgMsg('Error: ' + error.message)
    else setCfgMsg('✓ Configuración guardada')
    setCfgSaving(false)
    setTimeout(() => setCfgMsg(''), 4000)
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

  const primaryBtn = (loading: boolean): React.CSSProperties => ({
    padding: '10px 28px', background: loading ? '#555' : G, color: '#0b0b0b',
    border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase',
    fontFamily: 'Georgia,serif', fontWeight: 600,
  })

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', color: '#fff' }}>
      {/* Admin bar */}
      <div style={{ background: '#1a1408', borderBottom: `1px solid ${G}`, padding: '10px 22px', textAlign: 'center', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G }}>
        ⚙ Modo Administración — Sonia Boost · The Wonder World Group
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,11,.97)', borderBottom: `1px solid ${LINE}`, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 15, letterSpacing: '.28em', color: G, fontWeight: 300 }}>MXB · ADMIN</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {navBtn('partners', 'Partners & Puntos')}
          {navBtn('pipeline', 'Pipeline')}
          {navBtn('producers', 'Productores')}
          {navBtn('distributors', 'Distribuidoras')}
          {navBtn('announcements', 'Anuncios')}
          {navBtn('messages', 'Mensajes')}
          {navBtn('rewards', 'Recompensas')}
          {navBtn('redemptions', `Solicitudes${unreadRedemptions > 0 ? ` (${unreadRedemptions})` : ''}`)}
          {navBtn('value', 'Análisis de Valor')}
          {navBtn('config', 'Configuración')}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#e07060', padding: '8px 4px' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '38px 22px 80px' }}>

        {/* ===== PARTNERS ===== */}
        {tab === 'partners' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Brand Partners</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Alta, gestión, puntos y referidos de la edición 2027</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
              {stat('🤝', 'Partners activos', activePartners)}
              {stat('⏳', 'Pendientes', pendingPartners)}
              {stat('⭐', 'Puntos emitidos', totalPoints)}
              {stat('🎟️', 'Canjes pendientes', unreadRedemptions)}
            </div>

            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 4 }}>📊 Exposición en puntos</h4>
              <p style={{ fontSize: 13, opacity: .55, marginBottom: 16 }}>Cada punto es una promesa pendiente — visibilidad, alfombra roja, un ticket.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {stat('⭐', 'Puntos sin canjear', totalPoints)}
                {stat('💰', 'Valor aprox.', `${(totalPoints * 1000).toLocaleString('es-ES')} €`)}
                {stat('🏆', 'Top partner', topPartner?.full_name ?? '—')}
              </div>
            </div>

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
                  <button type="submit" disabled={npCreating} style={primaryBtn(npCreating)}>
                    {npCreating ? 'Creando…' : 'Crear partner →'}
                  </button>
                  {npMsg && <span style={{ fontSize: 13, color: npMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{npMsg}</span>}
                </div>
              </form>
            </div>

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
                <button type="submit" disabled={pfAdding} style={primaryBtn(pfAdding)}>
                  {pfAdding ? 'Añadiendo…' : 'Añadir al pipeline →'}
                </button>
              </form>
            </div>

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

        {/* ===== PRODUCTORES ===== */}
        {tab === 'producers' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Productores</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Gestión de productoras y sus proyectos en la plataforma</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
              {stat('🎬', 'Productoras activas', producers.length)}
              {stat('🎥', 'Proyectos publicados', projects.filter(p => p.published_at).length)}
              {stat('🤝', 'Con distribuidora', '—')}
              {stat('🔍', 'Buscando distribuidora', '—')}
            </div>

            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 4 }}>Añadir productora</h4>
              <p style={{ fontSize: 13, opacity: .55, marginBottom: 18 }}>Acceso solo por invitación. Crea la cuenta y comparte las credenciales.</p>
              <form onSubmit={createProducer}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Nombre del productor</label>
                    <input value={prName} onChange={e => setPrName(e.target.value)} required placeholder="Nombre y apellido" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Productora</label>
                    <input value={prCompany} onChange={e => setPrCompany(e.target.value)} placeholder="Nombre de la productora" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input type="tel" value={prPhone} onChange={e => setPrPhone(e.target.value)} placeholder="+34 600 000 000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={prEmail} onChange={e => setPrEmail(e.target.value)} required placeholder="productor@productora.com" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Contraseña de acceso</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={prPass} onChange={e => setPrPass(e.target.value)} placeholder="Contraseña segura" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={() => setPrPass(genPassword())} style={{ ...miniBtnStyle(), whiteSpace: 'nowrap', padding: '10px 16px' }}>🎲 Generar</button>
                  </div>
                  {prPass && <div style={{ fontSize: 11, color: CH, marginTop: 6, opacity: .7 }}>Copia esta contraseña antes de guardar — no se almacenará aquí</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="submit" disabled={prCreating} style={primaryBtn(prCreating)}>
                    {prCreating ? 'Creando…' : 'Crear productora →'}
                  </button>
                  {prMsg && <span style={{ fontSize: 13, color: prMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{prMsg}</span>}
                </div>
              </form>
            </div>

            <div style={panel}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Todas las productoras ({producers.length})</h4>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Productora', 'Email', 'Teléfono', 'País', 'Acciones'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {producers.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{p.contact_name}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13, opacity: .7 }}>{p.company_name ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{p.email}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{p.phone ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{p.country ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                          <button onClick={() => deleteProducer(p.id)} style={miniBtnStyle(true)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {producers.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', opacity: .4 }}>No hay productoras registradas todavía</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== DISTRIBUIDORAS ===== */}
        {tab === 'distributors' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Distribuidoras</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Gestión de distribuidoras y agencias internacionales</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
              {stat('🌍', 'Distribuidoras activas', distributors.length)}
              {stat('📋', 'Solicitudes totales', '—')}
              {stat('📬', 'Sin responder', '—')}
              {stat('🎞️', 'Proyectos con interés', '—')}
            </div>

            <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 4 }}>Añadir distribuidora</h4>
              <p style={{ fontSize: 13, opacity: .55, marginBottom: 18 }}>Acceso solo por invitación. Crea la cuenta y comparte las credenciales.</p>
              <form onSubmit={createDistributor}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Nombre de contacto</label>
                    <input value={drName} onChange={e => setDrName(e.target.value)} required placeholder="Nombre y apellido" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Distribuidora / Agencia</label>
                    <input value={drCompany} onChange={e => setDrCompany(e.target.value)} placeholder="Nombre de la empresa" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input type="tel" value={drPhone} onChange={e => setDrPhone(e.target.value)} placeholder="+44 20 0000 0000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={drEmail} onChange={e => setDrEmail(e.target.value)} required placeholder="contacto@distribuidora.com" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Contraseña de acceso</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={drPass} onChange={e => setDrPass(e.target.value)} placeholder="Contraseña segura" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={() => setDrPass(genPassword())} style={{ ...miniBtnStyle(), whiteSpace: 'nowrap', padding: '10px 16px' }}>🎲 Generar</button>
                  </div>
                  {drPass && <div style={{ fontSize: 11, color: CH, marginTop: 6, opacity: .7 }}>Copia esta contraseña antes de guardar — no se almacenará aquí</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="submit" disabled={drCreating} style={primaryBtn(drCreating)}>
                    {drCreating ? 'Creando…' : 'Crear distribuidora →'}
                  </button>
                  {drMsg && <span style={{ fontSize: 13, color: drMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{drMsg}</span>}
                </div>
              </form>
            </div>

            <div style={panel}>
              <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 18 }}>Distribuidoras y sus solicitudes ({distributors.length})</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Contacto', 'Empresa', 'Email', 'Teléfono', 'País', 'Acciones'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {distributors.map(d => (
                      <tr key={d.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{d.contact_name}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13, opacity: .7 }}>{d.company_name ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{d.email}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{d.phone ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .6 }}>{d.country ?? '—'}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                          <button onClick={() => deleteDistributor(d.id)} style={miniBtnStyle(true)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {distributors.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', opacity: .4 }}>No hay distribuidoras registradas todavía</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                <button type="submit" disabled={annPosting} style={primaryBtn(annPosting)}>
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

        {/* ===== ANÁLISIS DE VALOR ===== */}
        {tab === 'value' && (() => {
          const rewardsWithCost = rewards.filter(r => r.real_cost_eur !== null && r.real_cost_eur !== undefined)
          const rewardsWithSlots = rewards.filter(r => r.slots !== null)
          const totalExposure = rewards.reduce((s, r) => {
            if (r.real_cost_eur && r.slots) return s + r.real_cost_eur * r.slots
            return s
          }, 0)
          const avgCostPerPoint = rewardsWithCost.length > 0
            ? rewardsWithCost.reduce((s, r) => s + (r.real_cost_eur! / r.cost_points), 0) / rewardsWithCost.length
            : 0

          return (
            <div>
              <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Análisis de Valor</h2>
              <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Mapa económico de tu catálogo de recompensas</p>

              <div style={{ ...panel, borderColor: G, marginBottom: 28, background: 'rgba(212,175,55,.05)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>💡</div>
                <h4 style={{ fontWeight: 300, fontSize: 20, color: G, marginBottom: 8 }}>1 punto = 1.000 € de valor económico traído</h4>
                <p style={{ fontSize: 14, opacity: .7, lineHeight: 1.8, margin: 0 }}>
                  Cada punto que emites representa el compromiso de un partner de aportar 1.000 € en valor — sea en sponsorship, difusión o relaciones. Este panel te ayuda a ver cuánto te puede costar honrar esos puntos con las recompensas del catálogo.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
                {stat('💸', 'Coste si se agotan cupos', totalExposure > 0 ? `${totalExposure.toLocaleString('es-ES')} €` : '—')}
                {stat('📊', 'Coste medio por punto', avgCostPerPoint > 0 ? `${avgCostPerPoint.toFixed(2)} €` : '—')}
                {stat('✅', 'Recompensas con coste definido', rewardsWithCost.length)}
                {stat('🎫', 'Recompensas con cupo limitado', rewardsWithSlots.length)}
              </div>

              {/* Add reward form */}
              <div style={{ ...panel, borderColor: G, marginBottom: 28 }}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 18 }}>+ Añadir recompensa nueva</h4>
                <form onSubmit={addReward}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Nombre de la recompensa</label>
                      <input value={rvName} onChange={e => setRvName(e.target.value)} required placeholder="Alfombra roja Cannes…" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Puntos necesarios</label>
                      <input type="number" value={rvPoints} onChange={e => setRvPoints(e.target.value)} required placeholder="100" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Cupos disponibles</label>
                      <input type="number" value={rvSlots} onChange={e => setRvSlots(e.target.value)} placeholder="5" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tu coste real (€/unidad)</label>
                      <input type="number" step="0.01" value={rvCost} onChange={e => setRvCost(e.target.value)} placeholder="250" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Rango de aportación</label>
                      <input value={rvRange} onChange={e => setRvRange(e.target.value)} placeholder="Gold – Platinum" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Descripción</label>
                      <input value={rvDesc} onChange={e => setRvDesc(e.target.value)} placeholder="Descripción breve para el partner" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button type="submit" disabled={rvAdding} style={primaryBtn(rvAdding)}>
                      {rvAdding ? 'Añadiendo…' : 'Añadir recompensa →'}
                    </button>
                    {rvMsg && <span style={{ fontSize: 13, color: rvMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{rvMsg}</span>}
                  </div>
                </form>
              </div>

              {/* Rewards analysis table */}
              <div style={panel}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 18 }}>Catálogo completo con análisis económico</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Recompensa', 'Puntos', 'Cupos', 'Tu coste real / ud (€)', 'Rango de aportación', 'Exposición máx. (€)', '€ / punto', 'Acciones'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map(r => {
                        const exposure = r.real_cost_eur && r.slots ? r.real_cost_eur * r.slots : null
                        const eurPerPoint = r.real_cost_eur ? r.real_cost_eur / r.cost_points : null
                        return (
                          <tr key={r.id}>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>
                              <div>{r.name}</div>
                              {r.description && <div style={{ fontSize: 11, opacity: .5, marginTop: 2 }}>{r.description}</div>}
                            </td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 14, color: G }}>{r.cost_points}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>{r.slots ?? '∞'}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>{r.real_cost_eur != null ? `${r.real_cost_eur} €` : '—'}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .7 }}>{r.contribution_range ?? '—'}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13, color: exposure ? CH : undefined }}>{exposure != null ? `${exposure.toLocaleString('es-ES')} €` : '—'}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>{eurPerPoint != null ? `${eurPerPoint.toFixed(2)} €` : '—'}</td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${LINE}` }}>
                              <button onClick={async () => {
                                await supabase.from('mxb_rewards').update({ is_active: !r.is_active }).eq('id', r.id)
                                setRewards(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !x.is_active } : x))
                              }} style={miniBtnStyle(!r.is_active)}>
                                {r.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {rewards.length === 0 && (
                        <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', opacity: .4 }}>No hay recompensas todavía</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ===== CONFIGURACIÓN ===== */}
        {tab === 'config' && (
          <div>
            <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Configuración</h2>
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Ajustes globales de la plataforma MXB</p>

            <form onSubmit={saveConfig}>
              {/* AI Boost Selection */}
              <div style={{ ...panel, borderColor: G, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 16 }}>🤖 AI Boost Selection</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: 46, height: 26, flexShrink: 0 }}>
                    <input type="checkbox" checked={cfgAiBoost} onChange={e => setCfgAiBoost(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                    <div onClick={() => setCfgAiBoost(v => !v)} style={{ position: 'absolute', inset: 0, background: cfgAiBoost ? G : '#333', borderRadius: 13, cursor: 'pointer', transition: 'background .25s' }}>
                      <div style={{ position: 'absolute', top: 3, left: cfgAiBoost ? 23 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left .25s' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: cfgAiBoost ? G : '#aaa' }}>Directorio AI Boost Selection {cfgAiBoost ? 'activo' : 'inactivo'}</div>
                    <div style={{ fontSize: 12, opacity: .5, marginTop: 3 }}>Activa el portal de selección impulsado por IA para Brand Partners</div>
                  </div>
                </label>
              </div>

              {/* Developer access */}
              <div style={{ ...panel, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 16 }}>👩‍💻 Acceso Developer</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Email del developer</label>
                    <input type="email" value={cfgDevEmail} onChange={e => setCfgDevEmail(e.target.value)} placeholder="dev@moviesxbrands.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Contraseña temporal</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={cfgDevPass} onChange={e => setCfgDevPass(e.target.value)} placeholder="Genera una nueva contraseña" style={{ ...inputStyle, flex: 1 }} />
                      <button type="button" onClick={() => setCfgDevPass(genPassword())} style={{ ...miniBtnStyle(), whiteSpace: 'nowrap', padding: '10px 16px' }}>🎲 Generar</button>
                    </div>
                  </div>
                </div>
                {cfgDevPass && (
                  <div style={{ background: 'rgba(212,175,55,.08)', border: `1px solid ${G}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                    <span style={{ opacity: .6 }}>Contraseña generada: </span>
                    <span style={{ color: G, fontFamily: 'monospace', fontSize: 15 }}>{cfgDevPass}</span>
                    <span style={{ opacity: .5, fontSize: 11, marginLeft: 10 }}>— cópiala ahora</span>
                  </div>
                )}
                <button type="button" style={{ ...miniBtnStyle(true), padding: '8px 16px', fontSize: 10 }}>
                  🚫 Revocar acceso Developer
                </button>
              </div>

              {/* Points per referral */}
              <div style={{ ...panel, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 6 }}>⭐ Puntos por tipo de referido</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 20 }}>Define cuántos puntos recibe un partner al traer cada tipo de contacto o sponsor.</p>

                <h5 style={{ fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, opacity: .7, marginBottom: 14 }}>Contactos</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                  {[
                    ['Contacto estándar', 'standard'],
                    ['Influencer 500K', 'influencer_500k'],
                    ['Influencer 1M+', 'influencer_1m'],
                    ['Alianza estratégica', 'alliance'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="number" min="0" value={cfgPoints[key as keyof typeof cfgPoints]} onChange={e => setCfgPoints(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}
                </div>

                <h5 style={{ fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: CH, opacity: .7, marginBottom: 14 }}>Sponsors</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
                  {[
                    ['Silver', 'silver'],
                    ['Gold', 'gold'],
                    ['Platinum', 'platinum'],
                    ['Cannes + Berlinale', 'cannes'],
                    ['Global Ecosystem Partner', 'global'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="number" min="0" value={cfgPoints[key as keyof typeof cfgPoints]} onChange={e => setCfgPoints(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button type="submit" disabled={cfgSaving} style={primaryBtn(cfgSaving)}>
                  {cfgSaving ? 'Guardando…' : 'Guardar configuración →'}
                </button>
                {cfgMsg && <span style={{ fontSize: 13, color: cfgMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{cfgMsg}</span>}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
