/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Message, Reward, RedemptionRequest, Announcement, Producer, Distributor } from '@/lib/types'
import ProspectosTab, { type Prospect } from '../dashboard/ProspectosTab'
import PowerListTab, { type PLEntry, type PLRequest } from './PowerListTab'
import {
  InstitutionsTab, CommunicationsTab, LaPreguntaTab, OfficialContentTab,
  OpportunitiesTab, PremiumExperiencesTab, AcademyTab, PDFDocsTab,
  FOVAdminTab, CommunityTab,
  SelMembersTab, BrandLeadsTab, NotificationsTab, VisibilityTab,
  SecurityLogTab, AdminRolesTab, CreditsTab, PortalSettingsTab,
} from './ExtraAdminTabs'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = '#161616'
const LINE = '#2c2c2c'
const DANGER = '#c0392b'

type AdminTab = 'home' | 'partners' | 'pipeline' | 'announcements' | 'messages' | 'rewards' | 'redemptions' | 'producers' | 'distributors' | 'value' | 'config' | 'content' | 'prospectos' | 'awards' | 'powerlist' | 'institutions' | 'communications' | 'question' | 'official' | 'opportunities' | 'premium' | 'academy' | 'docs' | 'fov' | 'lacroisette' | 'community' | 'sel_members' | 'brand_leads' | 'notifications' | 'visibility' | 'security_log' | 'crm' | 'action_center' | 'workflows' | 'finance' | 'tasks' | 'bulk' | 'events' | 'templates' | 'media_library' | 'reports' | 'calendar' | 'security_ops' | 'banners' | 'member_hub' | 'spaces' | 'admins' | 'admin_roles' | 'credits' | 'portal_settings'

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
  prospects: Prospect[]
  producerMessages: { id: string; sender: string; body: string; created_at: string; mxb_producers?: { contact_name: string; company_name: string | null } | null }[]
  distributorMessages: { id: string; sender: string; body: string; created_at: string; mxb_distributors?: { contact_name: string; company_name: string | null } | null }[]
  awardsMembers: { id: string; contact_name: string; surname: string | null; brand: string | null; email: string; editions: { cannes?: boolean; berlinale?: boolean } | null; approved: boolean; synopsis: string | null; trailer_link: string | null; video_url: string | null; created_at: string }[]
  awardsAnnouncements: { id: string; title: string; message: string; created_at: string }[]
  awardsResources: { id: string; section: string; body: string | null; youtube_link: string | null; sort_order: number }[]
  awardsRequirements: { id: string; title: string | null; body: string; sort_order: number }[]
  powerListEntries: PLEntry[]
  powerListRequests: PLRequest[]
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
  prospects: initProspects, producerMessages, distributorMessages,
  awardsMembers: initAwardsMembers, awardsAnnouncements: initAwardsAnn,
  awardsResources: initAwardsRes, awardsRequirements: initAwardsReq,
  powerListEntries, powerListRequests,
}: Props) {
  const [tab, setTab] = useState<AdminTab>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // --- Announcement edit ---
  const [editAnnId, setEditAnnId] = useState<string | null>(null)
  const [editAnnTitle, setEditAnnTitle] = useState('')
  const [editAnnBody, setEditAnnBody] = useState('')
  const [editAnnPinned, setEditAnnPinned] = useState(false)
  const [editAnnCategory, setEditAnnCategory] = useState('general')
  const [editAnnSaving, setEditAnnSaving] = useState(false)

  // --- Content state ---
  type CardItem = { icon?: string; title: string; desc: string; img?: string; date?: string; href?: string; who?: string; what?: string }
  const parseJSON = (s: string, fallback: unknown) => { try { return JSON.parse(s) } catch { return fallback } }
  const [ctHeroTagline, setCtHeroTagline] = useState(initConfig['hero_tagline'] ?? 'Hay marcas destinadas a dejar huella')
  const [ctHeroSubtitle, setCtHeroSubtitle] = useState(initConfig['hero_subtitle'] ?? 'Edición 2027 · Cannes & Berlinale')
  const [ctBenefitsQuote, setCtBenefitsQuote] = useState(initConfig['benefits_quote'] ?? '')
  const [ctBenefitCards, setCtBenefitCards] = useState<CardItem[]>(parseJSON(initConfig['benefit_cards'] ?? '[]', []))
  const [ctAwardsTimeline, setCtAwardsTimeline] = useState<CardItem[]>(parseJSON(initConfig['awards_timeline'] ?? '[]', []))
  const [ctAwardsPalmares, setCtAwardsPalmares] = useState<CardItem[]>(parseJSON(initConfig['awards_palmares'] ?? '[]', []))
  const [ctAwardsLegacy, setCtAwardsLegacy] = useState<CardItem[]>(parseJSON(initConfig['awards_legacy'] ?? '[]', []))
  const [ctEcosystemCards, setCtEcosystemCards] = useState<CardItem[]>(parseJSON(initConfig['ecosystem_cards'] ?? '[]', []))
  const [ctCannesPhotos, setCtCannesPhotos] = useState<string[]>(parseJSON(initConfig['cannes_photos'] ?? '[]', []))
  const [ctSaving, setCtSaving] = useState(false)
  const [ctMsg, setCtMsg] = useState('')
  const [ctSection, setCtSection] = useState<string>('hero')

  async function saveContent(key: string, value: unknown) {
    setCtSaving(true); setCtMsg('')
    const { error } = await supabase.from('mxb_content').upsert({ key, value: typeof value === 'string' ? value : JSON.stringify(value), type: typeof value === 'string' ? 'text' : 'json' }, { onConflict: 'key' })
    if (error) setCtMsg('Error: ' + error.message)
    else setCtMsg('✓ Guardado correctamente')
    setCtSaving(false)
    setTimeout(() => setCtMsg(''), 3000)
  }

  function uploadImgToCard<T extends CardItem>(list: T[], idx: number, setter: (v: T[]) => void) {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        const src = ev.target?.result as string
        setter(list.map((c, i) => i === idx ? { ...c, img: src } : c) as T[])
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  function uploadPhotoSlot(idx: number) {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        const src = ev.target?.result as string
        setCtCannesPhotos(prev => prev.map((p, i) => i === idx ? src : p))
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

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

  // --- Awards state ---
  const [awardsMembers, setAwardsMembers] = useState(initAwardsMembers)
  const [awardsAnn, setAwardsAnn] = useState(initAwardsAnn)
  const [awardsRes, setAwardsRes] = useState(initAwardsRes)
  const [awardsReq, setAwardsReq] = useState(initAwardsReq)
  const [awAnnTitle, setAwAnnTitle] = useState('')
  const [awAnnMsg, setAwAnnMsg] = useState('')
  const [awResSection, setAwResSection] = useState('')
  const [awResBody, setAwResBody] = useState('')
  const [awResYt, setAwResYt] = useState('')
  const [awReqTitle, setAwReqTitle] = useState('')
  const [awReqBody, setAwReqBody] = useState('')
  const [awPrivMsg, setAwPrivMsg] = useState('')
  const [awPrivAudience, setAwPrivAudience] = useState<'all' | 'cannes' | 'berlinale'>('all')
  const [awCannesOpens, setAwCannesOpens] = useState(initConfig['awards_cannes_opens'] ?? '')
  const [awCannesCloses, setAwCannesCloses] = useState(initConfig['awards_cannes_closes'] ?? '')
  const [awCannesNotes, setAwCannesNotes] = useState(initConfig['awards_cannes_notes'] ?? '')
  const [awBerlOpens, setAwBerlOpens] = useState(initConfig['awards_berlinale_opens'] ?? '')
  const [awBerlCloses, setAwBerlCloses] = useState(initConfig['awards_berlinale_closes'] ?? '')
  const [awBerlNotes, setAwBerlNotes] = useState(initConfig['awards_berlinale_notes'] ?? '')
  const [awMsg, setAwMsg] = useState('')

  // --- Notification bell ---
  const [notifCount, setNotifCount] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    supabase.from('mxb_admin_notifications').select('id', { count: 'exact', head: true }).eq('unread', true).then(({ count }) => setNotifCount(count ?? 0))
  }, [])

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

  function startEditAnn(a: { id: string; title: string; body: string; pinned: boolean; category: string }) {
    setEditAnnId(a.id)
    setEditAnnTitle(a.title)
    setEditAnnBody(a.body)
    setEditAnnPinned(a.pinned)
    setEditAnnCategory(a.category)
  }

  async function saveEditAnn() {
    if (!editAnnId) return
    setEditAnnSaving(true)
    const { data } = await supabase.from('mxb_announcements')
      .update({ title: editAnnTitle, body: editAnnBody, pinned: editAnnPinned, category: editAnnCategory })
      .eq('id', editAnnId).select().single()
    if (data) setAnnouncements(prev => prev.map(a => a.id === editAnnId ? { ...a, ...data } : a))
    setEditAnnId(null)
    setEditAnnSaving(false)
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

  const sideBtn = (t: AdminTab, icon: string, label: string) => (
    <button key={t} onClick={() => { setTab(t); setSidebarOpen(false) }} style={{
      width: '100%', border: 0, background: tab === t ? 'linear-gradient(90deg,#E7B04C,#D79627)' : 'transparent',
      color: tab === t ? '#111' : '#f3f3f3', textAlign: 'left', padding: '9px 11px', borderRadius: 6,
      cursor: 'pointer', fontSize: 12, display: 'flex', gap: 10, alignItems: 'center', margin: '1px 0',
      fontFamily: 'Arial,sans-serif', fontWeight: tab === t ? 700 : 400,
    }}>
      <span style={{ width: 18, textAlign: 'center', fontSize: 14 }}>{icon}</span>{label}
    </button>
  )
  const sideGroup = (label: string) => (
    <div key={label} style={{ fontSize: 10, color: '#E9B72D', textTransform: 'uppercase', letterSpacing: '.06em', margin: '18px 8px 7px', fontFamily: 'Arial,sans-serif' }}>{label}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFA', fontFamily: 'Arial,Helvetica,sans-serif', color: '#151515', paddingLeft: 240 }}>
      <style>{`
        @media(max-width:1100px){
          .mxb-admin-shell{padding-left:0!important;}
          .mxb-sidebar-v16{transform:translateX(-100%)!important;transition:.2s;}
          .mxb-sidebar-v16.open{transform:none!important;}
          .mxb-topbar-v16{left:0!important;}
        }
        @media(max-width:700px){
          .mxb-admin-content{padding:86px 12px 24px!important;}
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`mxb-sidebar-v16${sidebarOpen ? ' open' : ''}`} style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: '#050505', color: 'white', zIndex: 1200,
        padding: '22px 14px 18px', overflowY: 'auto', borderRight: '1px solid #151515',
      }}>
        <div style={{ fontFamily: "Georgia,'Times New Roman',serif", color: '#E4B13E', fontSize: 28, lineHeight: .9, letterSpacing: '.03em', padding: '0 20px 18px', borderBottom: '1px solid #35250f', marginBottom: 14 }}>
          MOVIES ×<br />BRANDS<div style={{ fontFamily: 'Arial,sans-serif', fontSize: 10, letterSpacing: '.18em', marginTop: 12, textAlign: 'center', color: '#E4B13E' }}>ADMIN</div>
        </div>

        {sideBtn('home', '⌂', 'Inicio')}
        {sideBtn('visibility', '👁', 'Visibilidad del Portal')}

        {sideGroup('Personas & Organizaciones')}
        {sideBtn('sel_members', '♙', 'Members (Competición)')}
        {sideBtn('crm', '▦', 'CRM · Base de datos')}
        {sideBtn('partners', '☆', 'Brand Partners')}
        {sideBtn('institutions', '▥', 'Instituciones & Agencias')}
        {sideBtn('producers', '▰', 'Productores')}

        {sideGroup('Proyectos & Gestión')}
        {sideBtn('pipeline', '🎬', 'Proyectos cinematográficos')}

        {sideGroup('Centro de Operaciones')}
        {sideBtn('action_center', '⚡', 'Centro de acción')}
        {sideBtn('workflows', '↻', 'Automatizaciones')}
        {sideBtn('finance', '€', 'Finanzas & Contratos')}
        {sideBtn('tasks', '✓', 'Tareas & Responsables')}
        {sideBtn('bulk', '☷', 'Acciones masivas')}
        {sideBtn('events', '◆', 'Cannes & Berlinale')}
        {sideBtn('templates', '▤', 'Plantillas')}
        {sideBtn('media_library', '▧', 'Biblioteca de materiales')}
        {sideBtn('reports', '↗', 'Informes automáticos')}
        {sideBtn('calendar', '▣', 'Calendario editorial')}
        {sideBtn('security_ops', '🔐', 'Seguridad & Restauración')}

        {sideGroup('Comunidad & Contenido')}
        {sideBtn('community', '◉', 'Community')}
        {sideBtn('communications', '✉', 'Comunicaciones')}
        {sideBtn('question', '?', 'La Pregunta')}
        {sideBtn('official', '▣', 'Contenido Oficial')}
        {sideBtn('banners', '▧', 'Banners e imágenes')}
        {sideBtn('opportunities', '★', 'Oportunidades')}
        {sideBtn('premium', '✦', 'Experiencias Premium')}
        {sideBtn('member_hub', '◈', 'Member Hub')}
        {sideBtn('fov', '◍', 'Future of Voices')}
        {sideBtn('lacroisette', '♕', 'La Croisette')}
        {sideBtn('announcements', '⚑', 'Anuncios')}

        {sideGroup('Formación')}
        {sideBtn('academy', '◇', 'AI Academy')}
        {sideBtn('spaces', '▧', 'Espacios')}

        {sideGroup('Recursos')}
        {sideBtn('docs', '▱', 'Documentos PDF')}

        {sideGroup('Sistema')}
        {sideBtn('value', '⭐', 'Créditos')}
        {sideBtn('portal_settings', '✦', 'Portal Settings')}
        {sideBtn('admins', '♢', 'Admins & Roles')}
        {sideBtn('config', '⚙', 'Configuración')}
        {sideBtn('content', '✏', 'Contenido')}

        <div style={{ border: '1px solid #3f3217', borderRadius: 7, padding: '10px 12px', marginTop: 22, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>ⓘ</span>Ayuda & Soporte
        </div>
      </aside>

      {/* TOPBAR */}
      <header style={{
        position: 'fixed', left: 240, right: 0, top: 0, height: 70,
        background: 'rgba(255,255,255,.97)', zIndex: 1100,
        borderBottom: '1px solid #E8E4DD', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ fontSize: 22, background: 'none', border: 0, cursor: 'pointer' }}>☰</button>
          <input placeholder="⌕  Buscar en Movies × Brands..." style={{ width: 365, border: '1px solid #E8E4DD', borderRadius: 7, padding: '11px 14px', fontSize: 13, background: 'white' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={() => setTab('notifications')} style={{ position: 'relative', fontSize: 18, background: 'none', border: 0, cursor: 'pointer' }}>
            🔔
            {notifCount > 0 && <span style={{ position: 'absolute', right: -9, top: -8, background: '#C98920', color: 'white', borderRadius: 12, fontSize: 9, padding: '2px 5px' }}>{notifCount > 99 ? '99+' : notifCount}</span>}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#222', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>SB</div>
            <div><div style={{ fontSize: 12, fontWeight: 700 }}>Sonia Boost</div><div style={{ color: '#555', marginTop: 2 }}>Super Admin</div></div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: DANGER, fontFamily: 'inherit' }}>Salir</button>
        </div>
      </header>

      <div className="mxb-admin-content" style={{ maxWidth: 1500, margin: '0 auto', padding: '94px 24px 36px' }}>

        {/* ===== HOME DASHBOARD ===== */}
        {tab === 'home' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Bienvenida, Sonia 👋</h2>
                <p style={{ fontSize: 13, color: '#343434' }}>Resumen general de la actividad del ecosistema Movies × Brands.</p>
              </div>
            </div>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 14, margin: '18px 0 20px' }}>
              {[
                { icon: '🤝', label: 'Partners activos', value: activePartners, trend: '' },
                { icon: '⏳', label: 'Pendientes', value: pendingPartners, trend: '' },
                { icon: '⭐', label: 'Boost Credits', value: totalPoints, trend: '' },
                { icon: '🎟️', label: 'Canjes pendientes', value: unreadRedemptions, trend: '' },
                { icon: '🎬', label: 'Productoras', value: producers.length, trend: '' },
                { icon: '📣', label: 'Anuncios activos', value: announcements.length, trend: '' },
              ].map(k => (
                <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 16, minHeight: 112 }}>
                  <div style={{ fontSize: 22, color: '#D98700' }}>{k.icon}</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', marginTop: 6, color: '#303030' }}>{k.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111', marginTop: 4 }}>{k.value}</div>
                </div>
              ))}
            </div>
            {/* Home grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 18 }}>
              <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 18 }}>
                <h3 style={{ fontFamily: "Georgia,serif", fontSize: 17, marginBottom: 12 }}>Requiere tu atención</h3>
                {unreadRedemptions > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid #EEEAE4', fontSize: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF1DA', color: '#C77A00', display: 'grid', placeItems: 'center', flexShrink: 0 }}>🎟️</div>
                    <div style={{ flex: 1 }}><strong style={{ display: 'block' }}>Solicitudes de canje</strong><div style={{ fontSize: 10, color: '#777', marginTop: 3 }}>{unreadRedemptions} sin gestionar</div></div>
                    <button onClick={() => setTab('redemptions')} style={{ border: '1px solid #E35D5D', color: '#D83D3D', borderRadius: 20, padding: '3px 7px', fontSize: 10, background: 'none', cursor: 'pointer' }}>{unreadRedemptions}</button>
                  </div>
                )}
                {pendingPartners > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid #EEEAE4', fontSize: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF1DA', color: '#C77A00', display: 'grid', placeItems: 'center', flexShrink: 0 }}>🤝</div>
                    <div style={{ flex: 1 }}><strong style={{ display: 'block' }}>Partners pendientes de revisión</strong><div style={{ fontSize: 10, color: '#777', marginTop: 3 }}>{pendingPartners} sin activar</div></div>
                    <button onClick={() => setTab('partners')} style={{ border: '1px solid #E35D5D', color: '#D83D3D', borderRadius: 20, padding: '3px 7px', fontSize: 10, background: 'none', cursor: 'pointer' }}>{pendingPartners}</button>
                  </div>
                )}
                {unreadRedemptions === 0 && pendingPartners === 0 && (
                  <p style={{ color: '#aaa', fontSize: 13 }}>Todo en orden ✓</p>
                )}
              </div>
              <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 17, margin: 0 }}>Acceso rápido</h3>
                </div>
                {[
                  { label: '★ Añadir Brand Partner', tab: 'partners' as AdminTab },
                  { label: '🎬 Añadir proyecto cinematográfico', tab: 'pipeline' as AdminTab },
                  { label: '⚑ Publicar anuncio', tab: 'announcements' as AdminTab },
                  { label: '♙ Members (Competición)', tab: 'sel_members' as AdminTab },
                  { label: '▣ Contenido Oficial', tab: 'official' as AdminTab },
                  { label: '⚙ Configuración', tab: 'config' as AdminTab },
                ].map(a => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #eee', fontSize: 12 }}>
                    <button onClick={() => setTab(a.tab)} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 12, color: '#333', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>{a.label}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== CRM ===== */}
        {tab === 'crm' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>CRM · Base de datos</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión completa de todos los contactos del ecosistema Movies × Brands.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 17, marginBottom: 12 }}>Todos los contactos</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Email', 'Rol', 'Estado', 'Fecha alta'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 9, textTransform: 'uppercase', color: '#4e4b47', padding: '11px 10px', borderBottom: '1px solid #E8E4DD', background: '#FCFCFB' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 11.5 }}>{p.full_name}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 11.5, color: '#555' }}>{p.email}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 10 }}>Brand Partner</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: 5, fontSize: 9, border: '1px solid', background: p.status === 'active' ? '#E9F6EC' : '#FFF3DC', color: p.status === 'active' ? '#237239' : '#AA6700', borderColor: p.status === 'active' ? '#B8DFC0' : '#F0D09B' }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 10, color: '#aaa' }}>—</td>
                      </tr>
                    ))}
                    {partners.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', opacity: .4, fontSize: 13 }}>No hay contactos todavía</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== ACTION CENTER ===== */}
        {tab === 'action_center' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Centro de acción</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Tareas urgentes, alertas y acciones rápidas centralizadas.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>No hay acciones urgentes pendientes en este momento.</p>
            </div>
          </div>
        )}

        {/* ===== WORKFLOWS ===== */}
        {tab === 'workflows' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Automatizaciones</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestiona las automatizaciones y flujos de trabajo del ecosistema.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Próximamente: integración con n8n y Make para automatizaciones avanzadas.</p>
            </div>
          </div>
        )}

        {/* ===== FINANCE ===== */}
        {tab === 'finance' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Finanzas & Contratos</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Registro de ingresos, contratos y facturación del ecosistema.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { icon: '💶', label: 'Ingresos totales', value: `${(partners.filter(p=>p.status==='active').length * 5000).toLocaleString('es-ES')} €` },
                { icon: '📄', label: 'Contratos activos', value: partners.filter(p=>p.status==='active').length },
                { icon: '⏳', label: 'Contratos pendientes', value: pendingPartners },
                { icon: '🔄', label: 'Renovaciones próximas', value: '—' },
              ].map(k => (
                <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 22, color: '#D98700' }}>{k.icon}</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', marginTop: 6, color: '#303030' }}>{k.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#111', marginTop: 4 }}>{k.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de facturación y contratos disponible próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== TASKS ===== */}
        {tab === 'tasks' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Tareas & Responsables</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión de tareas internas del equipo Movies × Brands.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de gestión de tareas próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== BULK ===== */}
        {tab === 'bulk' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Acciones masivas</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Realiza acciones en lote sobre múltiples registros a la vez.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de acciones masivas próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== EVENTS ===== */}
        {tab === 'events' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Cannes & Berlinale</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión de los eventos presenciales: invitaciones, asistentes y logística.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de gestión de eventos próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== TEMPLATES ===== */}
        {tab === 'templates' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Plantillas</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Plantillas de correo, contratos y comunicaciones reutilizables.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de plantillas próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== MEDIA LIBRARY ===== */}
        {tab === 'media_library' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Biblioteca de materiales</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Imágenes, vídeos y documentos del ecosistema Movies × Brands.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Biblioteca de materiales próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== REPORTS ===== */}
        {tab === 'reports' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Informes automáticos</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Generación automática de informes periódicos del ecosistema.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de informes próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== CALENDAR ===== */}
        {tab === 'calendar' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Calendario editorial</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Planificación de publicaciones y eventos del ecosistema.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Calendario editorial próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== SECURITY OPS ===== */}
        {tab === 'security_ops' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Seguridad & Restauración</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Copias de seguridad, restauración y auditoría de seguridad avanzada.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de seguridad avanzada próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== BANNERS ===== */}
        {tab === 'banners' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Banners e imágenes</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión de banners, imágenes de fondo y creatividades del portal.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de banners e imágenes próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== MEMBER HUB ===== */}
        {tab === 'member_hub' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Member Hub</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión del espacio central de los Members del ecosistema.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Member Hub próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== SPACES ===== */}
        {tab === 'spaces' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Espacios</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Visión general de todos los espacios del ecosistema.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#777' }}>Módulo de espacios próximamente.</p>
            </div>
          </div>
        )}

        {/* ===== ADMINS ===== */}
        {tab === 'admins' && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700, color: '#121212', marginBottom: 6 }}>Admins & Roles</h2>
            <p style={{ fontSize: 13, color: '#343434', marginBottom: 24 }}>Gestión de administradores y sus permisos dentro del panel.</p>
            <div style={{ background: '#fff', border: '1px solid #E8E4DD', borderRadius: 8, padding: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Usuario', 'Email', 'Rol', 'Acceso'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 9, textTransform: 'uppercase', color: '#4e4b47', padding: '11px 10px', borderBottom: '1px solid #E8E4DD', background: '#FCFCFB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 11.5 }}>Sonia Boost</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 11.5, color: '#555' }}>cannes@moviesxbrands.com</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4', fontSize: 10 }}>Super Admin</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #EEEAE4' }}>
                      <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: 5, fontSize: 9, border: '1px solid #B8DFC0', background: '#E9F6EC', color: '#237239' }}>Completo</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                  {editAnnId === a.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Título</label>
                        <input value={editAnnTitle} onChange={e => setEditAnnTitle(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Contenido</label>
                        <textarea value={editAnnBody} onChange={e => setEditAnnBody(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                          <label style={labelStyle}>Categoría</label>
                          <select value={editAnnCategory} onChange={e => setEditAnnCategory(e.target.value)} style={inputStyle}>
                            <option value="general">General</option>
                            <option value="milestone">Hito</option>
                            <option value="event">Evento</option>
                            <option value="update">Actualización</option>
                            <option value="opportunity">Oportunidad</option>
                          </select>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: CH, marginTop: 18 }}>
                          <input type="checkbox" checked={editAnnPinned} onChange={e => setEditAnnPinned(e.target.checked)} style={{ accentColor: G }} />
                          Fijar arriba
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={saveEditAnn} disabled={editAnnSaving} style={{ padding: '9px 20px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 600 }}>{editAnnSaving ? 'Guardando…' : '✓ Guardar'}</button>
                        <button onClick={() => setEditAnnId(null)} style={miniBtnStyle()}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {a.pinned && <span style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: G, border: `1px solid ${G}`, padding: '3px 8px', borderRadius: 20 }}>Fijado</span>}
                          <span style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: CH, border: `1px solid ${LINE}`, padding: '3px 8px', borderRadius: 20 }}>{a.category}</span>
                          <span style={{ fontSize: 11, opacity: .4 }}>{new Date(a.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEditAnn(a)} style={miniBtnStyle()}>✏ Editar</button>
                          <button onClick={() => { if (confirm('¿Eliminar este anuncio?')) deleteAnnouncement(a.id) }} style={miniBtnStyle(true)}>✕ Eliminar</button>
                        </div>
                      </div>
                      <h3 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 8 }}>{a.title}</h3>
                      <p style={{ fontSize: 14, opacity: .7, lineHeight: 1.8, margin: 0 }}>{a.body}</p>
                    </>
                  )}
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
            <p style={{ opacity: .55, fontSize: 15, marginBottom: 30 }}>Comunicaciones de los partners, productores y distribuidoras</p>

            <h4 style={{ fontWeight: 300, fontSize: 16, color: CH, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14 }}>Brand Partners</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
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
              {messages.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 32 }}>No hay mensajes de partners.</div>}
            </div>

            <h4 style={{ fontWeight: 300, fontSize: 16, color: CH, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14 }}>Productores</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {producerMessages.map(m => (
                <div key={m.id} style={{ ...panel, borderLeft: `3px solid ${LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14 }}>{m.mxb_producers?.contact_name ?? 'Productor'}</span>
                      {m.mxb_producers?.company_name && <span style={{ fontSize: 12, opacity: .5, marginLeft: 8 }}>{m.mxb_producers.company_name}</span>}
                    </div>
                    <span style={{ fontSize: 12, opacity: .4 }}>{new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: 14, opacity: .8, lineHeight: 1.7, margin: 0 }}>{m.body}</p>
                </div>
              ))}
              {producerMessages.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 32 }}>No hay mensajes de productores.</div>}
            </div>

            <h4 style={{ fontWeight: 300, fontSize: 16, color: CH, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14 }}>Distribuidoras</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {distributorMessages.map(m => (
                <div key={m.id} style={{ ...panel, borderLeft: `3px solid ${LINE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14 }}>{m.mxb_distributors?.contact_name ?? 'Distribuidora'}</span>
                      {m.mxb_distributors?.company_name && <span style={{ fontSize: 12, opacity: .5, marginLeft: 8 }}>{m.mxb_distributors.company_name}</span>}
                    </div>
                    <span style={{ fontSize: 12, opacity: .4 }}>{new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: 14, opacity: .8, lineHeight: 1.7, margin: 0 }}>{m.body}</p>
                </div>
              ))}
              {distributorMessages.length === 0 && <div style={{ ...panel, textAlign: 'center', opacity: .4, padding: 32 }}>No hay mensajes de distribuidoras.</div>}
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

        {/* ===== PROSPECTOS ===== */}
        {tab === 'prospectos' && (
          <ProspectosTab
            partner={null}
            initProspects={initProspects}
            meetingText={initConfig['prospects_meeting_text'] ?? ''}
            isAdmin
          />
        )}

        {/* ===== AWARDS ===== */}
        {tab === 'awards' && (() => {
          const totalAw = awardsMembers.length
          const pendingAw = awardsMembers.filter(m => !m.approved).length
          const approvedAw = awardsMembers.filter(m => m.approved).length
          const videosAw = awardsMembers.filter(m => m.video_url).length

          async function approveAwardsMember(id: string, approve: boolean) {
            await supabase.from('mxb_awards_members').update({ approved: approve }).eq('id', id)
            setAwardsMembers(prev => prev.map(m => m.id === id ? { ...m, approved: approve } : m))
          }

          async function deleteAwardsMember(id: string, name: string) {
            if (!confirm(`¿Eliminar el perfil de ${name}?`)) return
            await supabase.from('mxb_awards_members').delete().eq('id', id)
            setAwardsMembers(prev => prev.filter(m => m.id !== id))
          }

          async function publishAwardsAnn() {
            if (!awAnnTitle || !awAnnMsg) { setAwMsg('Indica título y mensaje.'); return }
            const { data, error } = await supabase.from('mxb_awards_announcements').insert({ title: awAnnTitle, message: awAnnMsg }).select().single()
            if (error) { setAwMsg('Error: ' + error.message); return }
            setAwardsAnn(prev => [data, ...prev])
            setAwAnnTitle(''); setAwAnnMsg('')
            setAwMsg('✓ Comunicado publicado')
            setTimeout(() => setAwMsg(''), 3000)
          }

          async function deleteAwardsAnn(id: string) {
            if (!confirm('¿Eliminar este comunicado?')) return
            await supabase.from('mxb_awards_announcements').delete().eq('id', id)
            setAwardsAnn(prev => prev.filter(a => a.id !== id))
          }

          async function addResource() {
            if (!awResSection) { setAwMsg('Indica el nombre de la sección.'); return }
            const { data, error } = await supabase.from('mxb_awards_resources').insert({ section: awResSection, body: awResBody || null, youtube_link: awResYt || null, sort_order: awardsRes.length }).select().single()
            if (error) { setAwMsg('Error: ' + error.message); return }
            setAwardsRes(prev => [...prev, data])
            setAwResSection(''); setAwResBody(''); setAwResYt('')
            setAwMsg('✓ Recurso añadido'); setTimeout(() => setAwMsg(''), 3000)
          }

          async function deleteResource(id: string) {
            if (!confirm('¿Eliminar este recurso?')) return
            await supabase.from('mxb_awards_resources').delete().eq('id', id)
            setAwardsRes(prev => prev.filter(r => r.id !== id))
          }

          async function addRequirement() {
            if (!awReqBody) { setAwMsg('Indica el texto del bloque.'); return }
            const { data, error } = await supabase.from('mxb_awards_requirements').insert({ title: awReqTitle || null, body: awReqBody, sort_order: awardsReq.length }).select().single()
            if (error) { setAwMsg('Error: ' + error.message); return }
            setAwardsReq(prev => [...prev, data])
            setAwReqTitle(''); setAwReqBody('')
            setAwMsg('✓ Bloque añadido'); setTimeout(() => setAwMsg(''), 3000)
          }

          async function deleteRequirement(id: string) {
            if (!confirm('¿Eliminar este bloque?')) return
            await supabase.from('mxb_awards_requirements').delete().eq('id', id)
            setAwardsReq(prev => prev.filter(r => r.id !== id))
          }

          async function saveDates(edition: 'cannes' | 'berlinale') {
            const prefix = `awards_${edition}`
            const opens = edition === 'cannes' ? awCannesOpens : awBerlOpens
            const closes = edition === 'cannes' ? awCannesCloses : awBerlCloses
            const notes = edition === 'cannes' ? awCannesNotes : awBerlNotes
            await Promise.all([
              supabase.from('mxb_config').upsert({ key: `${prefix}_opens`, value: opens }, { onConflict: 'key' }),
              supabase.from('mxb_config').upsert({ key: `${prefix}_closes`, value: closes }, { onConflict: 'key' }),
              supabase.from('mxb_config').upsert({ key: `${prefix}_notes`, value: notes }, { onConflict: 'key' }),
            ])
            setAwMsg(`✓ Fechas de ${edition === 'cannes' ? 'Cannes' : 'Berlinale'} guardadas`)
            setTimeout(() => setAwMsg(''), 3000)
          }

          async function sendPrivateMsg() {
            if (!awPrivMsg) { setAwMsg('Escribe el mensaje.'); return }
            const targets = awardsMembers.filter(m => {
              if (awPrivAudience === 'all') return true
              if (awPrivAudience === 'cannes') return !!(m.editions as { cannes?: boolean })?.cannes
              return !!(m.editions as { berlinale?: boolean })?.berlinale
            })
            await Promise.all(targets.map(m => supabase.from('mxb_awards_messages').insert({ member_id: m.id, body: awPrivMsg, audience: awPrivAudience })))
            setAwPrivMsg('')
            setAwMsg(`✓ Mensaje enviado a ${targets.length} participante(s)`)
            setTimeout(() => setAwMsg(''), 3000)
          }

          const S = inputStyle
          return (
            <div>
              <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Awards</h2>
              <p style={{ opacity: .55, fontSize: 15, marginBottom: 24 }}>Perfiles auto-registrados tras completar el pago de participación en la Competición.</p>

              {awMsg && <div style={{ background: awMsg.startsWith('✓') ? 'rgba(90,140,90,.15)' : 'rgba(192,57,43,.15)', border: `1px solid ${awMsg.startsWith('✓') ? '#5a8c5a' : DANGER}`, borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: awMsg.startsWith('✓') ? '#a8d8a8' : '#e07060' }}>{awMsg}</div>}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22, marginBottom: 26 }}>
                {[['📝', 'Perfiles totales', totalAw], ['⏳', 'Pendientes', pendingAw], ['✓', 'Aprobados', approvedAw], ['🎤', 'Vídeos recibidos', videosAw]].map(([icon, label, val]) => (
                  <div key={String(label)} style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 300, color: G }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 26, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 19, color: G, marginBottom: 4 }}>📅 Fechas de la Competición</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 16 }}>Cada participante ve las fechas de su edición elegida.</p>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: G, fontSize: 14, marginBottom: 10 }}>🇫🇷 Festival de Cannes 2027</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                    <div><label style={labelStyle}>Apertura</label><input type="date" value={awCannesOpens} onChange={e => setAwCannesOpens(e.target.value)} style={S} /></div>
                    <div><label style={labelStyle}>Cierre de entregas</label><input type="date" value={awCannesCloses} onChange={e => setAwCannesCloses(e.target.value)} style={S} /></div>
                  </div>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Nota (opcional)</label><input type="text" value={awCannesNotes} onChange={e => setAwCannesNotes(e.target.value)} style={S} /></div>
                  <button onClick={() => saveDates('cannes')} style={miniBtnStyle()}>Guardar fechas de Cannes</button>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>
                  <div style={{ color: G, fontSize: 14, marginBottom: 10 }}>🇩🇪 Berlinale Digital Show</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                    <div><label style={labelStyle}>Apertura</label><input type="date" value={awBerlOpens} onChange={e => setAwBerlOpens(e.target.value)} style={S} /></div>
                    <div><label style={labelStyle}>Cierre de entregas</label><input type="date" value={awBerlCloses} onChange={e => setAwBerlCloses(e.target.value)} style={S} /></div>
                  </div>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Nota (opcional)</label><input type="text" value={awBerlNotes} onChange={e => setAwBerlNotes(e.target.value)} style={S} /></div>
                  <button onClick={() => saveDates('berlinale')} style={miniBtnStyle()}>Guardar fechas de Berlinale</button>
                </div>
              </div>

              {/* Private Messaging */}
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 26, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 19, color: G, marginBottom: 4 }}>✉️ Mensaje privado a participantes</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 14 }}>Se entrega directamente en el perfil de cada participante.</p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .5, marginBottom: 8 }}>Destinatarios</div>
                  {(['all', 'cannes', 'berlinale'] as const).map(v => (
                    <label key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, marginRight: 18, cursor: 'pointer' }}>
                      <input type="radio" name="awAudience" checked={awPrivAudience === v} onChange={() => setAwPrivAudience(v)} style={{ width: 'auto' }} />
                      {v === 'all' ? 'Todos los de Awards' : v === 'cannes' ? 'Solo Cannes 2027' : 'Solo Berlinale'}
                    </label>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>Mensaje</label><textarea value={awPrivMsg} onChange={e => setAwPrivMsg(e.target.value)} rows={3} style={{ ...S, resize: 'vertical' }} /></div>
                <button onClick={sendPrivateMsg} style={{ ...miniBtnStyle(), padding: '10px 24px' }}>Enviar mensaje</button>
              </div>

              {/* Awards Announcements */}
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 26, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 19, color: G, marginBottom: 4 }}>📢 Comunicados de Awards</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 14 }}>Solo los ven quienes participan en la Competición.</p>
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>Título</label><input type="text" value={awAnnTitle} onChange={e => setAwAnnTitle(e.target.value)} style={S} /></div>
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>Mensaje</label><textarea value={awAnnMsg} onChange={e => setAwAnnMsg(e.target.value)} rows={3} style={{ ...S, resize: 'vertical' }} /></div>
                <button onClick={publishAwardsAnn} style={{ background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, padding: '12px 26px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase' }}>📢 Publicar comunicado</button>
                {awardsAnn.length > 0 && <div style={{ marginTop: 16 }}>
                  {awardsAnn.map(a => (
                    <div key={a.id} style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div><div style={{ fontSize: 13, color: G }}>{a.title}</div><div style={{ fontSize: 12, opacity: .65, marginTop: 3, lineHeight: 1.5 }}>{a.message}</div><div style={{ fontSize: 10, opacity: .4, marginTop: 4 }}>{new Date(a.created_at).toLocaleDateString('es-ES')}</div></div>
                      <button onClick={() => deleteAwardsAnn(a.id)} style={miniBtnStyle(true)}>✕</button>
                    </div>
                  ))}
                </div>}
              </div>

              {/* Resources */}
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 26, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 19, color: G, marginBottom: 4 }}>📚 Recursos y tutoriales</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 16 }}>Visibles para cada participante en su perfil.</p>
                {awardsRes.map(r => (
                  <div key={r.id} style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: G, marginBottom: 4 }}>{r.section}</div>
                      {r.body && <div style={{ fontSize: 12, opacity: .7, lineHeight: 1.6 }}>{r.body}</div>}
                      {r.youtube_link && <div style={{ fontSize: 11, color: CH, marginTop: 4 }}>▶ {r.youtube_link}</div>}
                    </div>
                    <button onClick={() => deleteResource(r.id)} style={miniBtnStyle(true)}>✕</button>
                  </div>
                ))}
                <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 16, marginTop: 8 }}>
                  <p style={{ fontSize: 12, opacity: .6, marginBottom: 12 }}>Añadir nuevo recurso:</p>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Nombre de la sección</label><input type="text" value={awResSection} onChange={e => setAwResSection(e.target.value)} style={S} /></div>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Texto</label><textarea value={awResBody} onChange={e => setAwResBody(e.target.value)} rows={2} style={{ ...S, resize: 'vertical' }} /></div>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Enlace YouTube (opcional)</label><input type="text" value={awResYt} onChange={e => setAwResYt(e.target.value)} style={S} /></div>
                  <button onClick={addResource} style={miniBtnStyle()}>➕ Añadir sección</button>
                </div>
              </div>

              {/* Requirements */}
              <div style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 26, marginBottom: 22 }}>
                <h4 style={{ fontWeight: 300, fontSize: 19, color: G, marginBottom: 4 }}>📋 Requisitos y condiciones adicionales</h4>
                <p style={{ fontSize: 13, opacity: .55, marginBottom: 16 }}>Bloques visibles para todos los participantes de Awards en su perfil.</p>
                {awardsReq.map(r => (
                  <div key={r.id} style={{ background: '#0c0c0c', border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div><div style={{ fontSize: 12, color: G, marginBottom: 2 }}>{r.title}</div><div style={{ fontSize: 12, opacity: .7 }}>{r.body}</div></div>
                    <button onClick={() => deleteRequirement(r.id)} style={miniBtnStyle(true)}>✕</button>
                  </div>
                ))}
                <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 16, marginTop: 8 }}>
                  <p style={{ fontSize: 12, opacity: .6, marginBottom: 12 }}>Añadir bloque nuevo:</p>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Título (opcional)</label><input type="text" value={awReqTitle} onChange={e => setAwReqTitle(e.target.value)} style={S} /></div>
                  <div style={{ marginBottom: 8 }}><label style={labelStyle}>Texto</label><textarea value={awReqBody} onChange={e => setAwReqBody(e.target.value)} rows={3} style={{ ...S, resize: 'vertical' }} /></div>
                  <button onClick={addRequirement} style={miniBtnStyle()}>➕ Añadir bloque</button>
                </div>
              </div>

              {/* Members list */}
              <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ fontWeight: 300, fontSize: 19, color: G, margin: 0 }}>Perfiles</h4>
                </div>
                {awardsMembers.length === 0 ? (
                  <p style={{ fontSize: 13, opacity: .5 }}>No hay perfiles registrados todavía.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Nombre', 'Marca', 'Email', 'Ediciones', 'Sinopsis', 'Vídeo', 'Estado', 'Acciones'].map(h => (
                            <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: CH, padding: '11px 12px', borderBottom: `1px solid ${G}`, fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {awardsMembers.map(m => (
                          <tr key={m.id}>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 14 }}>{m.contact_name} {m.surname}</td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 13, opacity: .8 }}>{m.brand ?? '—'}</td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 12, opacity: .7 }}>{m.email}</td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 12 }}>
                              {(m.editions as { cannes?: boolean })?.cannes && '🇫🇷 '}
                              {(m.editions as { berlinale?: boolean })?.berlinale && '🇩🇪'}
                            </td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 12 }}>{m.synopsis ? '✓' : '—'}</td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}`, fontSize: 12 }}>{m.video_url ? '✓' : '—'}</td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}` }}>
                              <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', borderRadius: 20, padding: '4px 10px', background: m.approved ? 'rgba(212,175,55,.15)' : '#222', color: m.approved ? G : '#999', border: `1px solid ${m.approved ? G : '#444'}` }}>
                                {m.approved ? 'Aprobado' : 'Pendiente'}
                              </span>
                            </td>
                            <td style={{ padding: 12, borderBottom: `1px solid ${LINE}` }}>
                              <button onClick={() => approveAwardsMember(m.id, !m.approved)} style={miniBtnStyle()}>
                                {m.approved ? 'Suspender' : 'Aprobar'}
                              </button>
                              <button onClick={() => deleteAwardsMember(m.id, m.contact_name)} style={miniBtnStyle(true)}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ===== CONTENIDO ===== */}
        {tab === 'content' && (() => {
          const sectionBtn = (key: string, label: string) => (
            <button key={key} onClick={() => setCtSection(key)} style={{ padding: '9px 18px', background: ctSection === key ? G : 'transparent', color: ctSection === key ? '#0b0b0b' : CH, border: `1px solid ${ctSection === key ? G : LINE}`, borderRadius: 6, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', marginRight: 8, marginBottom: 8 }}>{label}</button>
          )
          const ta = (value: string, onChange: (v: string) => void, rows = 2): React.ReactNode => (
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />
          )
          const saveBtn = (key: string, value: unknown) => (
            <button onClick={() => saveContent(key, value)} disabled={ctSaving} style={{ ...primaryBtn(ctSaving), marginTop: 12, padding: '9px 24px', fontSize: 10 }}>
              {ctSaving ? 'Guardando…' : '💾 Guardar'}
            </button>
          )

          return (
            <div>
              <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Contenido del Portal</h2>
              <p style={{ opacity: .55, fontSize: 15, marginBottom: 24 }}>Edita aquí el texto e imágenes que ven los partners. Los cambios se publican al instante.</p>

              {ctMsg && <div style={{ background: ctMsg.startsWith('✓') ? 'rgba(111,207,151,.1)' : 'rgba(224,112,96,.1)', border: `1px solid ${ctMsg.startsWith('✓') ? '#6fcf97' : '#e07060'}`, borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: ctMsg.startsWith('✓') ? '#6fcf97' : '#e07060' }}>{ctMsg}</div>}

              <div style={{ marginBottom: 28, flexWrap: 'wrap', display: 'flex' }}>
                {sectionBtn('hero', '🏠 Inicio')}
                {sectionBtn('benefits', '⭐ Beneficios')}
                {sectionBtn('awards', '🏆 Awards')}
                {sectionBtn('ecosystem', '🌐 Ecosistema')}
                {sectionBtn('cannes', '📸 Fotos Cannes')}
              </div>

              {/* HERO */}
              {ctSection === 'hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={panel}>
                    <label style={labelStyle}>Tagline del hero (cita de la marca)</label>
                    {ta(ctHeroTagline, setCtHeroTagline, 2)}
                    {saveBtn('hero_tagline', ctHeroTagline)}
                  </div>
                  <div style={panel}>
                    <label style={labelStyle}>Subtítulo del hero (edición y fechas)</label>
                    {ta(ctHeroSubtitle, setCtHeroSubtitle, 1)}
                    {saveBtn('hero_subtitle', ctHeroSubtitle)}
                  </div>
                </div>
              )}

              {/* BENEFITS */}
              {ctSection === 'benefits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={panel}>
                    <label style={labelStyle}>Cita de apertura del tab Beneficios</label>
                    {ta(ctBenefitsQuote, setCtBenefitsQuote, 4)}
                    {saveBtn('benefits_quote', ctBenefitsQuote)}
                  </div>
                  <div style={{ ...panel, borderColor: G }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Tarjetas de beneficios ({ctBenefitCards.length})</h4>
                      <button onClick={() => setCtBenefitCards(prev => [...prev, { icon: '✨', title: 'Nuevo beneficio', desc: '' }])} style={miniBtnStyle()}>+ Añadir tarjeta</button>
                    </div>
                    {ctBenefitCards.map((card, i) => (
                      <div key={i} style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr auto', gap: 10, alignItems: 'start' }}>
                          <div>
                            <label style={labelStyle}>Icono</label>
                            <input value={card.icon ?? ''} onChange={e => setCtBenefitCards(prev => prev.map((c, j) => j === i ? { ...c, icon: e.target.value } : c))} style={{ ...inputStyle, fontSize: 22, textAlign: 'center', padding: '8px 6px' }} />
                          </div>
                          <div>
                            <label style={labelStyle}>Título</label>
                            <input value={card.title} onChange={e => setCtBenefitCards(prev => prev.map((c, j) => j === i ? { ...c, title: e.target.value } : c))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Descripción</label>
                            <textarea value={card.desc} onChange={e => setCtBenefitCards(prev => prev.map((c, j) => j === i ? { ...c, desc: e.target.value } : c))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                          </div>
                          <button onClick={() => { if (confirm('¿Eliminar esta tarjeta?')) setCtBenefitCards(prev => prev.filter((_, j) => j !== i)) }} style={{ ...miniBtnStyle(true), marginTop: 22 }}>🗑</button>
                        </div>
                      </div>
                    ))}
                    {saveBtn('benefit_cards', ctBenefitCards)}
                  </div>
                </div>
              )}

              {/* AWARDS */}
              {ctSection === 'awards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ ...panel, borderColor: G }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Calendario / Timeline ({ctAwardsTimeline.length} hitos)</h4>
                      <button onClick={() => setCtAwardsTimeline(prev => [...prev, { date: '', title: '', desc: '' }])} style={miniBtnStyle()}>+ Añadir hito</button>
                    </div>
                    {ctAwardsTimeline.map((item, i) => (
                      <div key={i} style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 10 }}>
                          <div><label style={labelStyle}>Fecha</label><input value={item.date ?? ''} onChange={e => setCtAwardsTimeline(prev => prev.map((c, j) => j === i ? { ...c, date: e.target.value } : c))} style={inputStyle} /></div>
                          <div><label style={labelStyle}>Título</label><input value={item.title} onChange={e => setCtAwardsTimeline(prev => prev.map((c, j) => j === i ? { ...c, title: e.target.value } : c))} style={inputStyle} /></div>
                          <div><label style={labelStyle}>Descripción</label><textarea value={item.desc} rows={2} onChange={e => setCtAwardsTimeline(prev => prev.map((c, j) => j === i ? { ...c, desc: e.target.value } : c))} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                          <button onClick={() => { if (confirm('¿Eliminar?')) setCtAwardsTimeline(prev => prev.filter((_, j) => j !== i)) }} style={{ ...miniBtnStyle(true), marginTop: 22 }}>🗑</button>
                        </div>
                      </div>
                    ))}
                    {saveBtn('awards_timeline', ctAwardsTimeline)}
                  </div>

                  <div style={panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Palmarés 2026</h4>
                      <button onClick={() => setCtAwardsPalmares(prev => [...prev, { who: '', what: '', title: '', desc: '' }])} style={miniBtnStyle()}>+ Añadir</button>
                    </div>
                    {ctAwardsPalmares.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 10 }}>
                        <div><label style={labelStyle}>Nombre / Premio</label><input value={item.who ?? ''} onChange={e => setCtAwardsPalmares(prev => prev.map((c, j) => j === i ? { ...c, who: e.target.value } : c))} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Categoría</label><input value={item.what ?? ''} onChange={e => setCtAwardsPalmares(prev => prev.map((c, j) => j === i ? { ...c, what: e.target.value } : c))} style={inputStyle} /></div>
                        <button onClick={() => setCtAwardsPalmares(prev => prev.filter((_, j) => j !== i))} style={{ ...miniBtnStyle(true), marginTop: 22 }}>🗑</button>
                      </div>
                    ))}
                    {saveBtn('awards_palmares', ctAwardsPalmares)}
                  </div>

                  <div style={panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Reconocimientos Boost Legacy</h4>
                      <button onClick={() => setCtAwardsLegacy(prev => [...prev, { who: '', what: '', title: '', desc: '' }])} style={miniBtnStyle()}>+ Añadir</button>
                    </div>
                    {ctAwardsLegacy.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 10 }}>
                        <div><label style={labelStyle}>Nombre</label><input value={item.who ?? ''} onChange={e => setCtAwardsLegacy(prev => prev.map((c, j) => j === i ? { ...c, who: e.target.value } : c))} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Descripción</label><input value={item.what ?? ''} onChange={e => setCtAwardsLegacy(prev => prev.map((c, j) => j === i ? { ...c, what: e.target.value } : c))} style={inputStyle} /></div>
                        <button onClick={() => setCtAwardsLegacy(prev => prev.filter((_, j) => j !== i))} style={{ ...miniBtnStyle(true), marginTop: 22 }}>🗑</button>
                      </div>
                    ))}
                    {saveBtn('awards_legacy', ctAwardsLegacy)}
                  </div>
                </div>
              )}

              {/* ECOSYSTEM */}
              {ctSection === 'ecosystem' && (
                <div style={{ ...panel, borderColor: G }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h4 style={{ fontWeight: 300, fontSize: 18, color: G }}>Tarjetas del Ecosistema ({ctEcosystemCards.length})</h4>
                    <button onClick={() => setCtEcosystemCards(prev => [...prev, { img: '', date: '', title: '', desc: '', href: '' }])} style={miniBtnStyle()}>+ Añadir tarjeta</button>
                  </div>
                  {ctEcosystemCards.map((card, i) => (
                    <div key={i} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
                      <div style={{ display: 'flex', gap: 18, marginBottom: 14 }}>
                        <div style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', background: '#101010', border: `1px solid ${LINE}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }} onClick={() => uploadImgToCard(ctEcosystemCards, i, setCtEcosystemCards)}>
                            {card.img ? <img src={card.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, opacity: .3 }}>🖼</span>}
                          </div>
                          <button onClick={() => uploadImgToCard(ctEcosystemCards, i, setCtEcosystemCards)} style={{ ...miniBtnStyle(), width: '100%', textAlign: 'center', padding: '7px 4px' }}>📁 Subir foto</button>
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div><label style={labelStyle}>Fecha / etiqueta</label><input value={card.date ?? ''} onChange={e => setCtEcosystemCards(prev => prev.map((c, j) => j === i ? { ...c, date: e.target.value } : c))} style={inputStyle} /></div>
                          <div><label style={labelStyle}>Enlace (URL)</label><input value={card.href ?? ''} onChange={e => setCtEcosystemCards(prev => prev.map((c, j) => j === i ? { ...c, href: e.target.value } : c))} style={inputStyle} /></div>
                          <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Título</label><input value={card.title} onChange={e => setCtEcosystemCards(prev => prev.map((c, j) => j === i ? { ...c, title: e.target.value } : c))} style={inputStyle} /></div>
                          <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Descripción</label><textarea value={card.desc} rows={2} onChange={e => setCtEcosystemCards(prev => prev.map((c, j) => j === i ? { ...c, desc: e.target.value } : c))} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                        <button onClick={() => { if (confirm('¿Eliminar esta tarjeta?')) setCtEcosystemCards(prev => prev.filter((_, j) => j !== i)) }} style={miniBtnStyle(true)}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {saveBtn('ecosystem_cards', ctEcosystemCards)}
                </div>
              )}

              {/* CANNES PHOTOS */}
              {ctSection === 'cannes' && (
                <div style={{ ...panel, borderColor: G }}>
                  <h4 style={{ fontWeight: 300, fontSize: 18, color: G, marginBottom: 8 }}>Fotos de Cannes 2026</h4>
                  <p style={{ fontSize: 13, opacity: .55, marginBottom: 20 }}>Las 4 fotos que aparecen en la cuadrícula del Dashboard. Haz clic en cada foto para subir una nueva.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                    {(ctCannesPhotos.length === 0 ? ['', '', '', ''] : ctCannesPhotos).map((src, i) => (
                      <div key={i} style={{ cursor: 'pointer' }} onClick={() => uploadPhotoSlot(i)}>
                        <div style={{ aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: `2px dashed ${G}`, background: '#101010', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                          {src ? <img src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32, opacity: .25 }}>📷</span>}
                        </div>
                        <button style={{ ...miniBtnStyle(), width: '100%', textAlign: 'center' }}>📁 Foto {i + 1}</button>
                      </div>
                    ))}
                  </div>
                  {saveBtn('cannes_photos', ctCannesPhotos)}
                </div>
              )}
            </div>
          )
        })()}

        {/* ===== POWER LIST ===== */}
        {tab === 'powerlist' && (
          <PowerListTab entries={powerListEntries} requests={powerListRequests} />
        )}

        {/* ===== EXTRA TABS ===== */}
        {tab === 'institutions' && <InstitutionsTab />}
        {tab === 'community' && <CommunityTab />}
        {tab === 'communications' && <CommunicationsTab />}
        {tab === 'question' && <LaPreguntaTab />}
        {tab === 'official' && <OfficialContentTab />}
        {tab === 'opportunities' && <OpportunitiesTab />}
        {tab === 'premium' && <PremiumExperiencesTab />}
        {tab === 'academy' && <AcademyTab />}
        {tab === 'fov' && <FOVAdminTab />}
        {tab === 'lacroisette' && <div style={{padding:32,color:'#fff'}}>La Croisette — próximamente</div>}
        {tab === 'docs' && <PDFDocsTab />}
        {tab === 'sel_members' && <SelMembersTab />}
        {tab === 'brand_leads' && <BrandLeadsTab />}
        {tab === 'notifications' && <NotificationsTab onMarkAllRead={() => setNotifCount(0)} />}
        {tab === 'visibility' && <VisibilityTab />}
        {tab === 'security_log' && <SecurityLogTab />}
        {tab === 'admin_roles' && <AdminRolesTab />}
        {tab === 'credits' && <CreditsTab />}
        {tab === 'portal_settings' && <PortalSettingsTab />}

      </div>
    </div>
  )
}
