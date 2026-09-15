'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Message, Reward, RedemptionRequest, PipelineFilm, Announcement } from '@/lib/types'
import ProspectosTab, { type Prospect } from './ProspectosTab'
import PowerListView, { type PLEntry } from './PowerListView'

const G = '#C9A227'
const CH = '#E8D5C4'
const PANEL = '#161616'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LINE = '#2c2c2c'
const IVORY = '#F7F3EC'
const IVORY_CARD = '#FFFFFF'
const INK = '#171512'
const INK_SOFT = 'rgba(23,21,18,.62)'
const LINE_LIGHT = 'rgba(11,11,11,.10)'
const GOLD_DEEP = '#A9841B'

type Tab = 'dashboard' | 'benefits' | 'awards' | 'ecosystem' | 'pipeline' | 'credits' | 'cert' | 'messages' | 'prospectos' | 'powerlist' | 'community' | 'premium' | 'academy' | 'fov' | 'authority'

type Referral = {
  id: string
  referred_name: string
  referred_email: string | null
  referred_company: string | null
  referral_type: string | null
  points_awarded: number | null
  status: string
  created_at: string
}

interface Props {
  user: { id: string; email?: string }
  isAdmin: boolean
  partner: (Partner & { specialty?: string | null; editions?: { cannes?: boolean; berlinale?: boolean } | null }) | null
  messages: Message[]
  rewards: Reward[]
  redemptions: (RedemptionRequest & { mxb_rewards?: { name: string; cost_points: number } | null })[]
  announcements: Announcement[]
  pipeline: PipelineFilm[]
  referrals: Referral[]
  content: Record<string, string>
  prospects: Prospect[]
  meetingText: string
  powerListEntries: PLEntry[]
  partnerPLRequest: { status: string } | null
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#FBFAF7',
  border: `1px solid ${LINE_LIGHT}`, borderRadius: 6, color: INK,
  fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.28em',
  textTransform: 'uppercase', color: INK_SOFT, marginBottom: 7,
}

export default function DashboardClient({ user, isAdmin, partner: initPartner, messages, rewards, redemptions, announcements, pipeline, referrals, content, prospects, meetingText, powerListEntries, partnerPLRequest }: Props) {
  const parseC = (key: string, fallback: unknown) => { try { return content[key] ? JSON.parse(content[key]) : fallback } catch { return fallback } }
  const C = {
    heroTagline: content['hero_tagline'] ?? 'Hay marcas destinadas a dejar huella',
    heroSubtitle: content['hero_subtitle'] ?? 'Edición 2027 · Cannes & Berlinale',
    heroRoleBrand: content['hero_role_brand'] ?? 'Official Brand Partner · The Wonder World Group',
    heroRoleLeader: content['hero_role_leader'] ?? 'Strategic Leader · The Wonder World Group',
    heroRoleAi: content['hero_role_ai'] ?? 'AI Boost Selection · The Wonder World Group',
    benefitsQuote: content['benefits_quote'] ?? '',
    cannesPhotos: parseC('cannes_photos', ['https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-31-at-6.08.06-PM.jpeg','https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-30-at-6.17.45-PM-5.jpeg','https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-31-at-15.12.32.jpeg','https://soniaboost.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-31-at-6.05.49-PM.jpeg']) as string[],
    benefitCards: parseC('benefit_cards', []) as {icon:string;title:string;desc:string}[],
    awardsTimeline: parseC('awards_timeline', []) as {date:string;title:string;desc:string}[],
    awardsPalmares: parseC('awards_palmares', []) as {who:string;what:string}[],
    awardsLegacy: parseC('awards_legacy', []) as {who:string;what:string}[],
    ecosystemCards: parseC('ecosystem_cards', []) as {img:string;date:string;title:string;desc:string;href:string}[],
  }
  const [tab, setTab] = useState<Tab>('dashboard')
  const partner = initPartner
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [avatarSrc, setAvatarSrc] = useState(partner?.photo_url ?? '')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [specialty, setSpecialty] = useState(partner?.specialty ?? '')
  const [editions, setEditions] = useState({ cannes: partner?.editions?.cannes ?? false, berlinale: partner?.editions?.berlinale ?? false })
  const [newPass, setNewPass] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [savingSpecialty, setSavingSpecialty] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [specialtyMsg, setSpecialtyMsg] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [passMsg, setPassMsg] = useState('')

  const [msgBody, setMsgBody] = useState('')
  const [msgSubject, setMsgSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)

  // Community tab
  const [commTab, setCommTab] = useState<'parati'|'insights'|'opps'|'members'>('parati')
  const [insightBody, setInsightBody] = useState('')
  const [insightSending, setInsightSending] = useState(false)
  const [insightSent, setInsightSent] = useState(false)
  const [insightError, setInsightError] = useState('')
  const [commInsights, setCommInsights] = useState<{id:string;body:string;created_at:string;mxb_partners?:{full_name:string}|null}[]>([])
  const [commOpps, setCommOpps] = useState<{id:string;title:string;description:string|null;type:string|null;cta_link:string|null}[]>([])
  const [commMembers, setCommMembers] = useState<{id:string;full_name:string;company:string|null;country:string|null;specialty:string|null}[]>([])
  const [membersSearch, setMembersSearch] = useState('')

  // Premium experiences tab
  const [premiumExp, setPremiumExp] = useState<{id:string;name:string;description:string|null;price_one:number|null;price_companion:number|null;available:boolean;checkout_url:string|null}[]>([])

  // Academy tab
  const [academyItems, setAcademyItems] = useState<{id:string;title:string;subtitle:string|null;body:string|null;youtube_url:string|null;image_url:string|null;is_featured_guest:boolean;contribution_type:string|null}[]>([])

  // FOV tab
  const [fovQuestion, setFovQuestion] = useState<{id:string;question:string;intro:string|null}|null>(null)
  const [fovYoutube, setFovYoutube] = useState('')
  const [fovWritten, setFovWritten] = useState('')
  const [fovSubmitting, setFovSubmitting] = useState(false)
  const [fovSubmitted, setFovSubmitted] = useState(false)
  const [fovError, setFovError] = useState('')
  const [fovVoices, setFovVoices] = useState<{id:string;title:string;body:string|null;youtube_url:string|null;contribution_type:string|null}[]>([])

  // Authority tab
  const [officialContent, setOfficialContent] = useState<{id:string;title:string;excerpt:string|null;url:string|null;image_url:string|null}[]>([])

  const [guestCount, setGuestCount] = useState('1')
  const [guestNames, setGuestNames] = useState('')
  const [guestSent, setGuestSent] = useState(false)

  const [interestSent, setInterestSent] = useState<Set<string>>(new Set())

  const router = useRouter()
  const supabase = createClient()
  const certRef = useRef<HTMLDivElement>(null)

  // unread count kept for future use
  const _unread = localMessages.filter(m => m.sender === 'admin' && !m.read_by_partner).length; void _unread
  const points = partner?.points ?? 0
  const isAIBoostOnly = !partner?.is_brand_partner && !partner?.is_strategic_leader

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!partner || !msgBody.trim()) return
    setSending(true)
    const { data } = await supabase.from('mxb_messages').insert({
      partner_id: partner.id, sender: 'partner',
      subject: msgSubject || null, body: msgBody,
    }).select().single()
    if (data) setLocalMessages(prev => [data as Message, ...prev])
    setMsgBody(''); setMsgSubject('')
    setMsgSent(true); setSending(false)
    setTimeout(() => setMsgSent(false), 3000)
  }

  async function requestRedemption(rewardId: string) {
    if (!partner) return
    await supabase.from('mxb_redemption_requests').insert({ partner_id: partner.id, reward_id: rewardId })
    router.refresh()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function saveSpecialty() {
    if (!partner || !specialty.trim()) return
    setSavingSpecialty(true)
    await supabase.from('mxb_partners').update({ specialty }).eq('id', partner.id)
    setSpecialtyMsg('✓ Guardado')
    setSavingSpecialty(false)
    setTimeout(() => setSpecialtyMsg(''), 3000)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function saveEdition(key: 'cannes' | 'berlinale', val: boolean) {
    if (!partner) return
    const next = { ...editions, [key]: val }
    setEditions(next)
    await supabase.from('mxb_partners').update({ editions: next }).eq('id', partner.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function changePassword() {
    if (!newPass || newPass.length < 6) { setPassMsg('Mínimo 6 caracteres'); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) setPassMsg('Error: ' + error.message)
    else { setPassMsg('✓ Contraseña actualizada'); setNewPass('') }
    setTimeout(() => setPassMsg(''), 4000)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) setAvatarSrc(ev.target.result as string) }
    reader.readAsDataURL(file)
  }

  async function sendGuestRequest() {
    if (!partner) return
    const text = `🎟️ Me gustaría traer ${guestCount} invitado${guestCount === '1' ? '' : 's'} adicional${guestCount === '1' ? '' : 'es'} a Cannes 2027${guestNames ? ' (' + guestNames + ')' : ''}. Quedo a la espera de la disponibilidad y el coste adicional.`
    const { data } = await supabase.from('mxb_messages').insert({ partner_id: partner.id, sender: 'partner', body: text }).select().single()
    if (data) setLocalMessages(prev => [data as Message, ...prev])
    setGuestSent(true)
    setGuestNames(''); setGuestCount('1')
  }

  async function expressInterest(filmTitle: string, filmId: string) {
    if (!partner) return
    const text = `📽 He expresado interés en participar en la financiación / coproducción de "${filmTitle}". Me gustaría recibir más información y coordinar los siguientes pasos.`
    await supabase.from('mxb_messages').insert({ partner_id: partner.id, sender: 'partner', body: text })
    setInterestSent(prev => new Set(prev).add(filmId))
  }

  function printCert() {
    if (!certRef.current) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write('<html><head><title>Certificado MXB</title><style>body{margin:0;background:#0b0b0b;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#fff;}@media print{body{background:#0b0b0b;}}</style></head><body>' + certRef.current.innerHTML + '</body></html>')
    w.document.close()
    w.print()
  }

  // Data fetching for new tabs
  useEffect(() => {
    supabase.from('mxb_insights').select('id,body,created_at,mxb_partners(full_name)').eq('status','published').order('created_at',{ascending:false}).limit(20)
      .then(({data}) => { if (data) setCommInsights(data as unknown as typeof commInsights) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_opportunities').select('id,title,description,type,cta_link').eq('is_active',true).order('created_at',{ascending:false})
      .then(({data}) => { if (data) setCommOpps(data as typeof commOpps) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_partners').select('id,full_name,company,country,specialty').order('full_name',{ascending:true}).limit(100)
      .then(({data}) => { if (data) setCommMembers(data as typeof commMembers) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_premium_experiences').select('id,name,description,price_one,price_companion,available,checkout_url').order('created_at',{ascending:false})
      .then(({data}) => { if (data) setPremiumExp(data as typeof premiumExp) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_academy_items').select('id,title,subtitle,body,youtube_url,image_url,is_featured_guest,contribution_type').eq('is_published',true).order('created_at',{ascending:false})
      .then(({data}) => { if (data) setAcademyItems(data as typeof academyItems) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_the_question').select('id,question,intro').eq('is_active',true).limit(1).single()
      .then(({data}) => { if (data) setFovQuestion(data as typeof fovQuestion) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_academy_items').select('id,title,body,youtube_url,contribution_type').in('contribution_type',['video','written']).eq('is_published',true).order('created_at',{ascending:false})
      .then(({data}) => { if (data) setFovVoices(data as typeof fovVoices) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    supabase.from('mxb_official_content').select('id,title,excerpt,url,image_url').eq('is_active',true).order('created_at',{ascending:false})
      .then(({data}) => { if (data) setOfficialContent(data as typeof officialContent) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function postInsight() {
    if (!partner || !insightBody.trim()) return
    setInsightSending(true); setInsightError('')
    try {
      const { error } = await supabase.from('mxb_insights').insert({ partner_id: partner.id, body: insightBody, image_url: null, status: 'pending' })
      if (error) throw error
      setInsightSent(true); setInsightBody('')
      setTimeout(() => setInsightSent(false), 4000)
    } catch (e: unknown) { setInsightError((e as Error).message ?? 'Error al publicar') }
    setInsightSending(false)
  }

  async function submitFov() {
    if (!partner || (!fovYoutube.trim() && !fovWritten.trim())) return
    setFovSubmitting(true); setFovError('')
    try {
      const { error } = await supabase.from('mxb_fov_submissions').insert({ partner_id: partner.id, youtube_url: fovYoutube.trim() || null, written_message: fovWritten.trim() || null, status: 'pending' })
      if (error) throw error
      setFovSubmitted(true); setFovYoutube(''); setFovWritten('')
    } catch (e: unknown) { setFovError((e as Error).message ?? 'Error al enviar') }
    setFovSubmitting(false)
  }

  const sideLink = (t: Tab, label: string) => (
    <button key={t+label} onClick={() => setTab(t)} style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px',
      borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
      fontSize: 12.5, marginBottom: 2,
      background: tab === t ? '#D4AF37' : 'transparent',
      color: tab === t ? '#0B0B0B' : 'rgba(255,255,255,.7)',
      fontWeight: tab === t ? 600 : 400,
    }}>{label}</button>
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stat = (icon: string, label: string, value: string | number, onClick?: () => void) => (
    <div onClick={onClick} style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 22, cursor: onClick ? 'pointer' : undefined }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: .55, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 300, color: G }}>{value}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B', fontFamily: "'Inter', Arial, sans-serif", color: '#fff' }}>
      {/* ── TOP HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, height: 68, background: 'rgba(11,11,11,.97)', borderBottom: '1px solid #2c2c2c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, letterSpacing: '.18em', color: '#D4AF37' }}>MXB</span>
          <span style={{ color: '#2c2c2c', fontSize: 18 }}>·</span>
          <span style={{ fontFamily: "'Inter', Arial, sans-serif", fontSize: 12, letterSpacing: '.12em', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase' }}>The Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAdmin && <a href="/admin" style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#D4AF37', textDecoration: 'none' }}>Admin ↗</a>}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{partner?.full_name ?? user.email}</div>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#c0392b', fontFamily: 'inherit' }}>Salir</button>
        </div>
      </header>

      {/* ── APP SHELL ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 246, flexShrink: 0, background: '#0B0B0B', minHeight: 'calc(100vh - 68px)', borderRight: '1px solid #2c2c2c', padding: '26px 18px 20px', position: 'sticky', top: 68, display: 'flex', flexDirection: 'column', alignSelf: 'flex-start' }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontFamily: "'Inter',sans-serif", fontWeight: 600, padding: '0 10px', marginBottom: 8 }}>Mi Panel</div>
            {sideLink('dashboard', 'Inicio')}
            {sideLink('cert', 'Mi perfil')}
            {sideLink('credits', 'Mi suscripción')}
            {sideLink('community', 'Comunidad')}
            {sideLink('authority', 'Contenido oficial')}
            {sideLink('community', 'Mis oportunidades')}
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontFamily: "'Inter',sans-serif", fontWeight: 600, padding: '0 10px', marginBottom: 8 }}>Explora</div>
            {sideLink('awards', 'Member Hub')}
            {sideLink('benefits', 'Global Boost Awards')}
            {sideLink('fov', 'Future of Voices')}
            {sideLink('powerlist', '☆  Power List')}
            {sideLink('premium', 'Experiencias Premium')}

          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontFamily: "'Inter',sans-serif", fontWeight: 600, padding: '0 10px', marginBottom: 8 }}>Ayuda</div>
            {sideLink('messages', 'Centro de ayuda')}
            {sideLink('messages', 'Soporte')}
          </div>
          {!isAIBoostOnly && (
            <div style={{ background: '#141210', border: '1px solid #2c2c2c', borderRadius: 10, padding: 16, marginTop: 'auto', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 12.5, color: '#D4AF37', marginBottom: 6 }}>★ Invita y gana créditos</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, marginBottom: 12 }}>+5 créditos por cada persona que se una con tu enlace.</p>
              <button onClick={() => setTab('prospectos')} style={{ background: '#D4AF37', color: '#0B0B0B', border: 'none', borderRadius: 6, padding: '9px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Invitar ahora →</button>
            </div>
          )}
          <div style={{ borderTop: '1px solid #2c2c2c', paddingTop: 16 }}>
            <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 12, letterSpacing: '.06em', color: '#fff', marginBottom: 6 }}>MOVIES × BRANDS</div>
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginBottom: 12 }}>El punto donde el cine, la inteligencia artificial y el propósito se encuentran.</p>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', lineHeight: 1.6 }}>© 2026 Movies × Brands · Todos los derechos reservados.</div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, minWidth: 0, background: IVORY, minHeight: 'calc(100vh - 68px)' }}>
          <div style={{ padding: '34px 36px 60px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ========== DASHBOARD (HOME) ========== */}
        {tab === 'dashboard' && (
          <div>
            {/* Announcements ticker */}
            {announcements.length > 0 && (
              <div style={{ background: '#0B0B0B', borderRadius: 8, padding: '10px 16px', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: G, fontWeight: 600, flexShrink: 0 }}>OFICIAL</span>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <span style={{ fontSize: 13, color: G, fontFamily: "'Fraunces', Georgia, serif" }}>{announcements[0].title}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ecosystem section — 4 cards */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 22, color: INK, marginBottom: 4 }}>El ecosistema Movies × Brands</h2>
              <p style={{ fontSize: 12.5, color: INK_SOFT, marginBottom: 18 }}>Todo lo que incluye tu membresía en un vistazo</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                  { icon: '🎬', title: 'Movies × Brands', desc: 'Plataforma de colaboración entre marcas y cine internacional.', flag: 'Core' },
                  { icon: '📰', title: 'La Croisette Magazine', desc: 'Publicación oficial del ecosistema. Tu marca presente.', flag: 'Incluido' },
                  { icon: '🎤', title: 'Future of Voices', desc: 'Tu historia, tu voz. Producción de vídeo incluida.', flag: 'Incluido' },
                  { icon: '🏆', title: 'Global Boost Awards', desc: 'La competición de marcas más ambiciosa del cine.', flag: 'Invitado' },
                ].map(c => (
                  <div key={c.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(23,21,18,.04)', position: 'relative' }}>
                    <div style={{ aspectRatio: '1/1', background: '#141210', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, maxHeight: 90 }}>
                      {c.icon}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 13, fontWeight: 500, color: INK, marginBottom: 6 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                    <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.55)', color: G, fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{c.flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero row: greeting + awards banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 22, marginBottom: 26, alignItems: 'stretch' }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 8 }}>
                  Bienvenida, {partner?.full_name?.split(' ')[0] ?? 'Partner'}
                </h1>
                <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6, marginBottom: 16 }}>
                  {partner?.is_brand_partner ? C.heroRoleBrand : partner?.is_strategic_leader ? C.heroRoleLeader : C.heroRoleAi}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: '#EEF6EC', border: '1px solid #7BAE79', color: '#3f6b3d', fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20 }}>Activo</span>
                  <span style={{ background: 'rgba(201,162,39,.12)', border: `1px solid ${G}`, color: G, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20 }}>
                    {partner?.is_brand_partner ? 'Brand Partner' : partner?.is_strategic_leader ? 'Strategic Leader' : 'AI Boost'}
                  </span>
                </div>
              </div>
              <div onClick={() => setTab('awards')} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 150, display: 'flex', alignItems: 'flex-end', background: 'linear-gradient(135deg,#1a1a1a,#0b0b0b)', cursor: 'pointer' }}>
                <img src="https://framerusercontent.com/images/dTyFXV94Ege8BjljhJdJjQEeK4.jpeg?width=1600" alt="Cannes 2027" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.82))' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '20px 24px' }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: G, fontWeight: 600, marginBottom: 6 }}>Cannes 2027</div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 21, color: '#fff', lineHeight: 1.25, marginBottom: 12 }}>Global Boost Awards · Tu invitación está activa</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: G, color: '#0B0B0B', fontSize: 11.5, fontWeight: 600, padding: '9px 16px', borderRadius: 6 }}>Ver oportunidades →</span>
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
              {[
                { label: 'Membresía', value: partner?.is_brand_partner ? 'Brand Partner' : partner?.is_strategic_leader ? 'Strategic Leader' : 'AI Boost', pill: 'Activa', icon: '🏛' },
                { label: 'Créditos', value: String(points), pill: 'Disponibles', icon: '⭐' },
                { label: 'Mensajes', value: String(localMessages.length || 0), pill: 'Recibidos', icon: '✉' },
                { label: 'Edición', value: C.heroSubtitle.split(' · ')[0] ?? 'Cannes 2027', pill: 'Próxima', icon: '🎬' },
              ].map(k => (
                <div key={k.label} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK_SOFT, marginBottom: 10 }}>
                    <span>{k.icon}</span>{k.label}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 3 }}>{k.value}</div>
                  <span style={{ display: 'inline-block', background: '#EEF6EC', border: '1px solid #7BAE79', color: '#3f6b3d', fontSize: 10, fontWeight: 600, letterSpacing: '.04em', padding: '2px 9px', borderRadius: 20, textTransform: 'uppercase' }}>{k.pill}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 12, padding: '20px 22px 18px', marginBottom: 26, boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <h5 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 15, color: INK, marginBottom: 14 }}>Acciones rápidas</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                {[
                  { icon: '🏆', label: 'Awards', t: 'awards' as Tab },
                  { icon: '📜', label: 'Certificado', t: 'cert' as Tab },
                  { icon: '⭐', label: 'Créditos', t: 'credits' as Tab },
                  { icon: '🎤', label: 'Future of Voices', t: 'fov' as Tab },
                  { icon: '👥', label: 'Comunidad', t: 'community' as Tab },
                  { icon: '✉', label: 'Mensajes', t: 'messages' as Tab },
                ].map(a => (
                  <button key={a.t} onClick={() => setTab(a.t)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', background: IVORY, border: `1px solid ${LINE_LIGHT}`, borderRadius: 10, padding: '14px 6px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", color: INK, fontSize: 11, lineHeight: 1.4 }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits icon row */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', marginBottom: 26, boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: INK, marginBottom: 4 }}>Tus Beneficios</h3>
                  <p style={{ fontSize: 12, color: INK_SOFT }}>Todo lo que incluye tu membresía</p>
                </div>
                <button onClick={() => setTab('benefits')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD_DEEP, fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>Ver todos →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
                {[
                  { icon: '🏆', text: 'Global Boost Awards · Invitación activa' },
                  { icon: '📰', text: 'La Croisette Magazine · Reportaje incluido' },
                  { icon: '🎤', text: 'Future of Voices · Vídeo incluido' },
                  { icon: '📜', text: 'Certificado oficial de participación' },
                  { icon: '⭐', text: 'Programa de créditos y referidos' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: IVORY, border: `1px solid ${LINE_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{b.icon}</div>
                    <p style={{ fontSize: 11.5, color: INK, lineHeight: 1.5 }}>{b.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite + Activity row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
              <div style={{ background: '#0B0B0B', color: '#fff', borderRadius: 14, padding: '24px 26px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 22, right: 26, textAlign: 'right' }}>
                  <div style={{ fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>Créditos</div>
                  <div style={{ fontSize: 20, color: G, fontFamily: "'Fraunces', Georgia, serif" }}>{points}</div>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: '#fff', marginBottom: 6 }}>Invita y gana</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 16, maxWidth: 280 }}>+5 créditos por cada persona que se una con tu enlace al ecosistema.</p>
                <button onClick={() => setTab('prospectos')} style={{ background: G, color: '#0B0B0B', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Invitar →</button>
              </div>
              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 15, color: INK }}>Actividad reciente</h3>
                  <button onClick={() => setTab('messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD_DEEP, fontSize: 11, fontWeight: 600 }}>Ver todo</button>
                </div>
                {localMessages.slice(0, 4).map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${LINE_LIGHT}`, fontSize: 11.5, color: INK }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: G, flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject ?? m.body?.slice(0, 40)}</span>
                    <span style={{ marginLeft: 'auto', color: INK_SOFT, fontSize: 10.5, flexShrink: 0 }}>{new Date(m.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                ))}
                {localMessages.length === 0 && <p style={{ fontSize: 12, color: INK_SOFT }}>Sin actividad reciente.</p>}
              </div>
            </div>

            {/* Cannes proof photos */}
            <div style={{ background: '#0B0B0B', borderRadius: 14, padding: '26px 28px', marginTop: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 10 }}>Respaldado por una primera edición real</div>
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 22, color: G, marginBottom: 6 }}>Cannes 2026: de la visión a la alfombra roja</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 18 }}>16 de mayo de 2026 · Hôtel Barrière Le Gray d&apos;Albion. 80 asistentes por invitación: marcas, productores, creativos y prensa internacional en una gala privada.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {C.cannesPhotos.map((src, i) => (
                  <img key={i} src={src} alt="Cannes 2026" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== BENEFICIOS ========== */}
        {tab === 'benefits' && (
          <div>
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>Tus Beneficios</h1>
              <p style={{ fontSize: 13.5, color: INK_SOFT, maxWidth: 600, lineHeight: 1.6 }}>Todo lo que incluye tu membresía como Official Brand Partner</p>
            </div>

            {C.benefitsQuote && (
              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 26, borderLeft: `3px solid ${G}` }}>
                <p style={{ fontSize: 15, lineHeight: 1.8, fontStyle: 'italic', color: INK_SOFT }}>{C.benefitsQuote}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 26 }}>
              {C.benefitCards.map(b => (
                <div key={b.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{b.icon}</div>
                  <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: INK, marginBottom: 8 }}>{b.title}</h4>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>🌐 El Ecosistema The Wonder World Group</div>
              <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.8, marginBottom: 10 }}>Como Official Brand Partner, tu organización obtiene acceso preferente —sujeto a disponibilidad y a la naturaleza de cada iniciativa— a las oportunidades desarrolladas dentro de The Wonder World Group, incluyendo:</p>
              <ul style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.9, paddingLeft: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {['Movies x Brands', 'The La Croisette Magazine', 'Future of Voices', 'Sprint to Growth', 'Futuras plataformas internacionales e iniciativas estratégicas del Grupo'].map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>🔮 Beneficios Futuros del Ecosistema</div>
              <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.8 }}>Los Official Brand Partners seguirán recibiendo acceso prioritario a nuevos beneficios, iniciativas, experiencias y oportunidades estratégicas incorporadas al ecosistema durante todo su periodo de colaboración.</p>
            </div>
          </div>
        )}

        {/* ========== GLOBAL BOOST AWARDS ========== */}
        {tab === 'awards' && (
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32, background: `url('https://framerusercontent.com/images/dTyFXV94Ege8BjljhJdJjQEeK4.jpeg?width=1600') center/cover` }}>
              <div style={{ background: 'linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.42))', padding: '54px 42px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: CH, marginBottom: 10 }}>La competición del ecosistema</div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 36, color: '#fff', marginBottom: 8 }}>Global Boost Awards</h2>
                <p style={{ color: CH, fontSize: 14, letterSpacing: '.15em' }}>Cannes 2027 · Tu invitación como Brand Partner está activa</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 28 }}>
              <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 18 }}>Calendario · Edición 2027</div>
                <div style={{ position: 'relative', paddingLeft: 30, borderLeft: `1px solid ${G}`, margin: '26px 0' }}>
                  {C.awardsTimeline.map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: 26 }}>
                      <div style={{ position: 'absolute', left: -35, top: 6, width: 9, height: 9, borderRadius: '50%', background: G }} />
                      <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 4 }}>{item.date}</div>
                      <h5 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: INK, marginBottom: 4 }}>{item.title}</h5>
                      <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: INK_SOFT }}>Las fechas exactas se comunican por email a los partners con antelación prioritaria.</p>
              </div>

              <div>
                <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 14 }}>Palmarés · Cannes 2026</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {C.awardsPalmares.map((item, idx) => (
                      <div key={idx} style={{ border: `1px solid ${G}`, borderRadius: 10, padding: '16px 18px', background: 'rgba(201,162,39,.04)' }}>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, fontWeight: 500, marginBottom: 3 }}>{item.who}</div>
                        <div style={{ fontSize: 12, color: INK_SOFT }}>{item.what}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 14 }}>Reconocimientos Boost Legacy 2026</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {C.awardsLegacy.map((item, idx) => (
                      <div key={idx} style={{ border: `1px solid ${G}`, borderRadius: 10, padding: '16px 18px', background: 'rgba(201,162,39,.04)' }}>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, fontWeight: 500, marginBottom: 3 }}>{item.who}</div>
                        <div style={{ fontSize: 12, color: INK_SOFT }}>{item.what}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>Tu posición como Brand Partner</div>
              <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 20, color: INK, marginBottom: 8 }}>Invitación activa a la edición 2027</h4>
              <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.7 }}>Tu marca forma parte del círculo de la competición: acceso a la gala de Cannes, presencia en los anuncios oficiales y prioridad en las activaciones de la edición. Recibirás por email cada hito del calendario antes de su anuncio público.</p>
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>🎟️ ¿Quieres traer a alguien más contigo?</div>
              <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, marginBottom: 16 }}>Tu invitación te cubre a ti. Si quieres traer invitados adicionales a Cannes 2027, indícanos cuántos y te confirmaremos la disponibilidad y el coste adicional por Comunicación Privada.</p>
              {guestSent ? (
                <div style={{ color: '#6fcf97', fontSize: 14 }}>✓ Solicitud enviada — te confirmaremos la disponibilidad y el coste por Comunicación Privada.</div>
              ) : (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 140px' }}>
                    <label style={lbl}>Nº de invitados</label>
                    <input type="number" min="1" max="10" value={guestCount} onChange={e => setGuestCount(e.target.value)} style={inp} />
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label style={lbl}>Nombres (opcional)</label>
                    <input value={guestNames} onChange={e => setGuestNames(e.target.value)} placeholder="Ej: Juan Pérez, María López…" style={inp} />
                  </div>
                  <button onClick={sendGuestRequest} style={{ padding: '12px 24px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>Solicitar</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ECOSISTEMA ========== */}
        {tab === 'ecosystem' && (
          <div>
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>El ecosistema en movimiento</h2>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>Actualidad real de Movies × Brands · La Croisette · Future of Voices</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              {C.ecosystemCards.map((c) => (
                <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, overflow: 'hidden', background: IVORY_CARD, boxShadow: '0 2px 12px rgba(23,21,18,.04)', transition: 'border-color .25s' }}>
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#f0ede8', position: 'relative' }}>
                    <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 7 }}>{c.date}</div>
                    <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: INK, lineHeight: 1.45, marginBottom: 8 }}>{c.title}</h4>
                    <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                    <span style={{ display: 'inline-block', marginTop: 12, fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: GOLD_DEEP }}>Ver →</span>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>Tu beneficio · La Croisette</div>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 20, color: INK, marginBottom: 8 }}>Reportaje editorial de tu marca</h4>
                <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.7 }}>Historia, visión y conexión con el cine. Nuestro equipo editorial coordinará contigo la entrevista y la sesión de contenidos.</p>
              </div>
              <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>Tu beneficio · Future of Voices</div>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 20, color: INK, marginBottom: 8 }}>Tu vídeo-mensaje en la plataforma</h4>
                <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.7, marginBottom: 14 }}>Un espacio propio junto a voces del cine y el liderazgo en <a href="https://futureofvoices.org" target="_blank" rel="noopener noreferrer" style={{ color: GOLD_DEEP }}>futureofvoices.org</a>. Coordinamos contigo la grabación del material.</p>
                <div style={{ borderTop: `1px solid ${LINE_LIGHT}`, paddingTop: 14 }}>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.8, marginBottom: 10 }}>¿Quieres dejar tu mensaje para el legado? Grábalo en horizontal, máximo 60 segundos.</p>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.8 }}>Envía tu vídeo a <a href="mailto:hello@moviesxbrands.com" style={{ color: G }}>hello@moviesxbrands.com</a> o cuéntanoslo por <button onClick={() => setTab('messages')} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Comunicación Privada</button>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== OPORTUNIDADES ========== */}
        {tab === 'pipeline' && (
          <div>
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>Pipeline privado</h2>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6, marginBottom: 6 }}>Proyectos en búsqueda de brand partners · Acceso exclusivo antes del anuncio público</p>
              <p style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.6 }}>Al expresar interés, avisamos directamente a nuestro equipo por mensaje privado — no es una reserva automática. Te contactaremos para coordinar los siguientes pasos.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {pipeline.map(f => {
                const pct = f.funding_pct ?? (f.funding_total && f.funding_remaining ? Math.round(((f.funding_total - f.funding_remaining) / f.funding_total) * 100) : null)
                const sent = interestSent.has(f.id)
                return (
                  <div key={f.id} style={{ background: IVORY_CARD, border: `1px solid ${f.status === 'open' ? G : LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', opacity: f.status === 'closed' ? .75 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 22, color: INK, marginBottom: 4 }}>{f.title}</h4>
                        <div style={{ fontSize: 13, color: INK_SOFT }}>{f.genre ?? ''}</div>
                      </div>
                      <span style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', background: f.status === 'open' ? G : '#e8e8e8', color: f.status === 'open' ? '#0b0b0b' : '#999', borderRadius: 20, padding: '7px 15px', whiteSpace: 'nowrap' }}>{f.status === 'open' ? 'Disponible' : f.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
                      {[['Financiación pendiente', f.funding_remaining ? `${f.funding_remaining.toLocaleString('es-ES')} €` : '—', true], ['Estado', f.status, false], ['Festival objetivo', f.festival ?? '—', false], ['País', f.country ?? '—', false]].map(([k, v, gold]) => (
                        <div key={k as string}>
                          <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 4 }}>{k}</div>
                          <div style={{ fontSize: 14, color: gold ? G : INK }}>{v as string}</div>
                        </div>
                      ))}
                    </div>
                    {pct !== null && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 4 }}>{pct}% financiado</div>
                        <div style={{ width: '100%', height: 6, background: LINE_LIGHT, borderRadius: 20, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: G, borderRadius: 20 }} />
                        </div>
                      </div>
                    )}
                    {f.synopsis && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, marginBottom: 14 }}>{f.synopsis}</p>}
                    {f.status === 'open' && (
                      <button onClick={() => !sent && expressInterest(f.title, f.id)} disabled={sent} style={{ padding: '11px 22px', background: sent ? 'transparent' : G, color: sent ? G : '#0b0b0b', border: sent ? `1px solid ${G}` : 'none', borderRadius: 6, cursor: sent ? 'default' : 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase' }}>
                        {sent ? '✓ Interés registrado — te contactaremos' : 'Expresar interés'}
                      </button>
                    )}
                  </div>
                )
              })}
              {pipeline.length === 0 && (
                <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '64px 32px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', textAlign: 'center', color: INK_SOFT }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                  <div>Próximamente habrá proyectos disponibles</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== CRÉDITOS ========== */}
        {tab === 'credits' && (
          <div>
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>Programa de Créditos</h2>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>Presenta contactos al ecosistema. Cuando se convierten en contactos activos, ganas créditos canjeables por beneficios reales.</p>
            </div>

            {/* Balance hero — keep dark for contrast */}
            <div style={{ borderRadius: 14, padding: 34, background: '#0B0B0B', border: `1px solid ${G}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 26 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 8 }}>Tu saldo</div>
                <div style={{ fontSize: 52, fontWeight: 300, color: G, lineHeight: 1 }}>{points} <span style={{ fontSize: 20 }}>créditos</span></div>
                {rewards.length > 0 && points < rewards[0].cost_points && (
                  <div style={{ marginTop: 10, fontSize: 13, color: CH, opacity: .85 }}>Tu próximo horizonte: <span style={{ color: G }}>{rewards[0].name}</span> — a {rewards[0].cost_points - points} ⭐ de distancia.</div>
                )}
              </div>
              <div style={{ maxWidth: 380 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>Así se gana y en qué se convierte — el detalle completo, abajo.</p>
              </div>
            </div>

            {/* How it works */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 26 }}>
              {[
                { icon: '🎁', title: 'Bono de bienvenida', body: 'Al unirte al ecosistema recibes 50 créditos gratuitos, sin hacer nada más.' },
                { icon: '📋', title: 'Cómo se activan', body: '1 · Presentas un contacto.\n2 · Nuestro equipo lo valida y activa.\n3 · Los créditos aparecen en tu panel, según tu contrato de Brand Partner.' },
                { icon: '🌟', title: 'Influencers', body: 'Si aportas un influencer real para el ecosistema, aprobado para una colaboración win-win: 500K seguidores = 50 ⭐ · 1M+ seguidores = 100 ⭐.' },
                { icon: '🤝', title: 'Alianzas Estratégicas', body: 'Si incorporas un influencer, celebrity o institución sin transacción económica — valor de prestigio — obtienes 50 ⭐ por incorporación.' },
              ].map(h => (
                <div key={h.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>{h.icon} {h.title}</div>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, whiteSpace: 'pre-line', margin: 0 }}>{h.body}</p>
                </div>
              ))}
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 26 }}>
              <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>📊 Tus créditos se acumulan</div>
              <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, margin: 0 }}>No importa si vienen de un único contacto o de varios sumados — cada activación suma a tu saldo total, y ese saldo es lo que determina qué recompensas puedes canjear.</p>
            </div>

            {/* Referrals + Rewards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 16 }}>Tus referidos</div>
                {referrals.length === 0 ? (
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6 }}>Todavía no has presentado ningún contacto. Escríbenos a <a href="mailto:hello@moviesxbrands.com" style={{ color: G }}>hello@moviesxbrands.com</a> para presentar tu primer referido.</p>
                ) : (
                  referrals.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${LINE_LIGHT}`, gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 15, color: INK }}>{r.referred_name}{r.referral_type ? <span style={{ color: G, fontSize: 12, opacity: .75, marginLeft: 6 }}>· {r.referral_type}</span> : ''}</div>
                        {r.referred_company && <div style={{ fontSize: 12, color: INK_SOFT }}>{r.referred_company}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', borderRadius: 20, padding: '5px 12px', background: r.status === 'active' ? 'rgba(201,162,39,.12)' : '#f0ede8', color: r.status === 'active' ? G : INK_SOFT, border: `1px solid ${r.status === 'active' ? G : LINE_LIGHT}` }}>{r.status === 'active' ? 'Activo' : 'En validación'}</span>
                        {r.points_awarded ? <span style={{ color: G, fontSize: 13 }}>+{r.points_awarded} ⭐</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>Canjea tus créditos</div>
                <p style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.6, marginBottom: 16 }}>Todas las recompensas están sujetas a disponibilidad final. Si el cupo solicitado no está disponible, te ofreceremos una alternativa de valor equivalente.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {rewards.map(r => {
                    const canRedeem = points >= r.cost_points
                    const alreadyRequested = redemptions.some(rd => rd.reward_id === r.id && rd.status === 'pending')
                    return (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '18px 0', borderBottom: `1px solid ${LINE_LIGHT}`, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, color: INK, marginBottom: 6 }}>{r.name}</div>
                          {r.description && <div style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.65 }}>{r.description}</div>}
                          {r.contribution_range && <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>Rango: {r.contribution_range}</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, color: G, marginBottom: 8 }}>⭐ {r.cost_points}</div>
                          <button onClick={() => !alreadyRequested && canRedeem && requestRedemption(r.id)} disabled={!canRedeem || alreadyRequested} style={{ padding: '8px 16px', background: alreadyRequested ? 'transparent' : canRedeem ? G : '#f0ede8', color: alreadyRequested ? G : canRedeem ? '#0b0b0b' : INK_SOFT, border: alreadyRequested ? `1px solid ${G}` : `1px solid ${LINE_LIGHT}`, borderRadius: 6, cursor: canRedeem && !alreadyRequested ? 'pointer' : 'not-allowed', fontFamily: 'Georgia,serif', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' }}>
                            {alreadyRequested ? '✓ Solicitud enviada' : canRedeem ? 'Solicitar canje' : 'Créditos insuficientes'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {rewards.length === 0 && <p style={{ fontSize: 13, color: INK_SOFT }}>El catálogo de recompensas estará disponible próximamente.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== MI PERFIL (moreView) ========== */}
        {tab === 'cert' && (
          <div>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 18 }}>Inicio &nbsp;›&nbsp; Mi perfil</div>

            {/* Head */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>Mi perfil</h1>
                <p style={{ fontSize: 13.5, color: INK_SOFT }}>Gestiona la información pública y corporativa de tu marca.</p>
              </div>
              <button onClick={() => setTab('messages')} style={{ background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>✎ Editar perfil</button>
            </div>

            {/* Cover photo placeholder */}
            <div style={{ borderRadius: 12, background: '#141210', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative', overflow: 'hidden', border: `1px solid ${LINE_LIGHT}` }}>
              {avatarSrc ? <img src={avatarSrc} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, letterSpacing: '.1em' }}>Foto de portada</span>}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.35)', opacity: 0, transition: 'opacity .2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                <label style={{ color: '#fff', fontSize: 13, cursor: 'pointer' }}>↑ Subir / cambiar portada<input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} /></label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 11, color: INK_SOFT, marginBottom: 28 }}>
              <span>Portada recomendada: <strong>1920 × 640 px</strong></span>
              <span>Después de subirla, arrastra la imagen arriba o abajo para centrarla.</span>
            </div>

            {/* Identity card */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', marginBottom: 24, boxShadow: '0 2px 12px rgba(23,21,18,.04)', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'start' }}>
              <div style={{ background: '#141210', borderRadius: 10, aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', textAlign: 'center' }}>
                {avatarSrc ? <img src={avatarSrc} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '1080 × 1350'}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 18, color: INK, marginBottom: 10 }}>Tu identidad en The Portal</h3>
                <div style={{ fontSize: 16, color: G, fontWeight: 600, marginBottom: 6 }}>{partner?.full_name ?? 'Configura tu @usuario'}</div>
                <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 16 }}>Tu enlace público aparecerá aquí cuando confirmes tu usuario.</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {[{ label: '↗ Compartir perfil', primary: true }, { label: 'LinkedIn', primary: false }, { label: 'Facebook', primary: false }, { label: 'Instagram', primary: false }, { label: 'Copiar enlace', primary: false }].map(b => (
                    <button key={b.label} onClick={() => setTab('messages')} style={{ padding: '8px 16px', background: b.primary ? G : 'transparent', color: b.primary ? '#0b0b0b' : G, border: `1px solid ${G}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'Inter',sans-serif", fontWeight: b.primary ? 600 : 400 }}>{b.label}</button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>Tu @usuario identifica tu perfil en todo el ecosistema. Una vez confirmado por ti, no podrá cambiarse desde tu cuenta.</div>
              </div>
            </div>

            {/* Photo upload + preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 28 }}>
              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, marginBottom: 8 }}>Fotografía pública</h4>
                <p style={{ fontSize: 12, color: INK_SOFT, marginBottom: 14 }}>Tamaño recomendado: <strong>1080 × 1350 px</strong> · relación 4:5. Puedes reencuadrarla después.</p>
                <label style={{ display: 'inline-block', padding: '10px 20px', background: '#141210', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'Inter',sans-serif" }}>
                  Subir fotografía
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} />
                </label>
              </div>

              <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, marginBottom: 8 }}>Vista previa de tu perfil público</h4>
                <div style={{ borderRadius: 8, background: '#141210', height: 80, marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e1c19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, fontSize: 20 }}>{partner?.full_name?.charAt(0) ?? '?'}</div>
                  <div>
                    <div style={{ fontSize: 14, color: INK, fontWeight: 600 }}>{partner?.full_name ?? 'Tu perfil público'}</div>
                    <div style={{ fontSize: 12, color: INK_SOFT }}>@usuario</div>
                    <div style={{ fontSize: 11, color: INK_SOFT }}>Así verá la comunidad tu identidad pública.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social post asset card */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, color: INK, marginBottom: 6 }}>Tu post para compartir</h3>
                  <p style={{ fontSize: 12, color: INK_SOFT }}>Vista previa 1080 × 1350. Se genera con tu fotografía, @usuario y rol real dentro del ecosistema.</p>
                </div>
                <span style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', background: G, color: '#0b0b0b', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>GLOBAL BOOST AWARDS · CANNES 2027 — BERLINALE 2027</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 8 }}>Vista previa 1080 × 1350 (Vertical)</div>
                  <div style={{ background: '#0b0b0b', borderRadius: 8, aspectRatio: '4/5', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
                    {avatarSrc && <img src={avatarSrc} alt="Social" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .7 }} />}
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: G, fontSize: 12, letterSpacing: '.1em' }}>{partner?.full_name ?? '@usuario'}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 8 }}>Vista previa 1920 × 1080 (Horizontal)</div>
                  <div style={{ background: '#0b0b0b', borderRadius: 8, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>Diseño de tu post horizontal</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    {[
                      { label: 'in LinkedIn', bg: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://portal.moviesxbrands.com')}` },
                      { label: '𝕏 Twitter', bg: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Orgullosa de ser Official Brand Partner de MOVIES × BRANDS · The Wonder World Group @moviesxbrands`)}` },
                      { label: 'f Facebook', bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://moviesxbrands.com')}` },
                    ].map(b => (
                      <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: b.bg, color: '#fff', borderRadius: 6, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>{b.label}</a>
                    ))}
                    <button onClick={() => navigator.clipboard.writeText(`🏆 Soy Official Brand Partner de MOVIES × BRANDS · The Wonder World Group\n#MoviesXBrands #Cannes2027\nhttps://moviesxbrands.com`)} style={{ padding: '8px 14px', background: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, letterSpacing: '.18em', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>📸 Instagram</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate section */}
            {(() => {
              const certEditions: string[] = []
              if (editions.cannes) certEditions.push('Cannes 2027')
              if (editions.berlinale) certEditions.push('Berlinale Digital Showcase 2027')
              if (certEditions.length === 0) certEditions.push('Cannes 2027')
              return (
                <div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: INK, marginBottom: 6 }}>Tu Certificado Oficial</h3>
                  <p style={{ fontSize: 13, color: INK_SOFT, marginBottom: 20 }}>Generado automáticamente con los datos de tu perfil</p>
                  {certEditions.map((edition, idx) => (
                    <div key={edition} style={{ marginBottom: 32 }}>
                      {certEditions.length > 1 && <h4 style={{ fontWeight: 300, fontSize: 16, color: CH, marginBottom: 12 }}>🎖 {edition}</h4>}
                      <div ref={idx === 0 ? certRef : undefined} style={{ background: 'linear-gradient(135deg,#0d0d0d,#1a1208)', border: `2px solid ${G}`, borderRadius: 12, padding: '50px 60px', textAlign: 'center', maxWidth: 760, margin: '0 auto 16px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, border: `1px solid rgba(212,175,55,.2)`, borderRadius: 8, pointerEvents: 'none' }} />
                        <div style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', color: CH, opacity: .6, marginBottom: 14 }}>The Wonder World Group · Certifica que</div>
                        <div style={{ fontSize: 28, fontWeight: 300, color: G, marginBottom: 6 }}>{partner?.company ?? partner?.full_name ?? '—'}</div>
                        <div style={{ fontSize: 14, opacity: .7, marginBottom: 22, letterSpacing: '.1em' }}>representada por {partner?.full_name ?? '—'}</div>
                        <div style={{ fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', opacity: .5, marginBottom: 8 }}>es Official Brand Partner de</div>
                        <div style={{ fontSize: 40, fontWeight: 300, color: G, letterSpacing: '.2em', marginBottom: 6 }}>MOVIES × BRANDS</div>
                        <div style={{ fontSize: 13, opacity: .6, marginBottom: 24 }}>{edition}</div>
                        {specialty && <div style={{ fontSize: 13, fontStyle: 'italic', color: CH, opacity: .8, marginBottom: 24, borderTop: `1px solid rgba(212,175,55,.2)`, paddingTop: 18 }}>&quot;{specialty}&quot;</div>}
                        <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', opacity: .4 }}>Cannes · Berlinale · 2027</div>
                        <div style={{ position: 'absolute', bottom: 24, right: 36, fontSize: 10, opacity: .3, letterSpacing: '.2em' }}>moviesxbrands.com</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <button onClick={printCert} style={{ padding: '11px 24px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600 }}>⬇ Descargar / Imprimir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {/* ========== POWER LIST ========== */}
        {tab === 'powerlist' && (
          <PowerListView
            entries={powerListEntries}
            partnerId={partner?.id ?? null}
            existingRequest={partnerPLRequest}
          />
        )}

        {/* ========== COMMUNITY (communityView) ========== */}
        {tab === 'community' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 4 }}>🤝 Community</h1>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>Autoridad, contenido y oportunidades — la comunidad curada de Movies × Brands para marcas, speakers, coaches y founders.</p>
              <div style={{ width: 48, height: 2, background: G, marginTop: 14 }} />
            </div>

            {/* Search */}
            <div style={{ marginBottom: 22 }}>
              <input
                value={membersSearch}
                onChange={e => setMembersSearch(e.target.value)}
                placeholder="🔍 Buscar miembros, insights, oportunidades…"
                style={{ ...inp, maxWidth: 520 }}
              />
            </div>

            {/* Sub-tab nav */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${LINE_LIGHT}`, paddingBottom: 0 }}>
              {([
                { key: 'parati', label: '🏠 Para Ti' },
                { key: 'insights', label: '📄 Insights' },
                { key: 'opps', label: '⭐ Oportunidades' },
                { key: 'members', label: '👥 Miembros' },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setCommTab(key)} style={{ background: 'none', border: 'none', borderBottom: commTab === key ? `2px solid ${G}` : '2px solid transparent', color: commTab === key ? G : INK_SOFT, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 12, padding: '10px 18px', marginBottom: -1, fontWeight: commTab === key ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Para Ti */}
            {commTab === 'parati' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                <div>
                  {/* Hero */}
                  <div style={{ borderRadius: 12, background: `linear-gradient(135deg, rgba(201,162,39,.08), rgba(247,243,236,.6))`, border: `1px solid rgba(201,162,39,.2)`, padding: '40px 32px', marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 10 }}>Contenido Destacado</div>
                    <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 24, color: INK, marginBottom: 8 }}>Tu espacio de marca en el festival más poderoso del mundo</h3>
                    <p style={{ fontSize: 13, color: INK_SOFT }}>Cannes 2027 · The Wonder World Group · Official Brand Partners Edition</p>
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, marginBottom: 14 }}>Últimos insights</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                    {commInsights.slice(0,4).map(ins => (
                      <div key={ins.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(23,21,18,.04)' }}>
                        <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 6 }}>{ins.mxb_partners?.full_name ?? 'Brand Partner'}</div>
                        <p style={{ fontSize: 13, color: INK, lineHeight: 1.6 }}>{ins.body.slice(0,120)}{ins.body.length > 120 ? '…' : ''}</p>
                      </div>
                    ))}
                    {commInsights.length === 0 && <p style={{ color: INK_SOFT, fontSize: 13, gridColumn: '1/-1' }}>Todavía no hay insights publicados.</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                    <button onClick={() => setCommTab('insights')} style={{ background: 'none', border: 'none', color: GOLD_DEEP, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Ver todos los insights →</button>
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, marginBottom: 14 }}>Oportunidades recomendadas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {commOpps.slice(0,3).map(op => (
                      <div key={op.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 10, padding: '14px 18px', boxShadow: '0 2px 8px rgba(23,21,18,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, color: INK, fontWeight: 500 }}>{op.title}</div>
                          {op.type && <div style={{ fontSize: 11, color: INK_SOFT }}>{op.type}</div>}
                        </div>
                        {op.cta_link && <a href={op.cta_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: G, textDecoration: 'none', letterSpacing: '.15em', textTransform: 'uppercase', flexShrink: 0 }}>Ver →</a>}
                      </div>
                    ))}
                    {commOpps.length === 0 && <p style={{ color: INK_SOFT, fontSize: 13 }}>No hay oportunidades activas en este momento.</p>}
                    <button onClick={() => setCommTab('opps')} style={{ background: 'none', border: 'none', color: GOLD_DEEP, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", textAlign: 'right', padding: '4px 0' }}>Ver todas →</button>
                  </div>
                </div>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(23,21,18,.04)' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: G, marginBottom: 14, fontWeight: 600 }}>⭐ Destacado por MxB</div>
                    {announcements[0] ? (
                      <div>
                        <div style={{ fontSize: 14, color: INK, fontWeight: 500, marginBottom: 6 }}>{announcements[0].title}</div>
                        {announcements[0].body && <p style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.6 }}>{announcements[0].body}</p>}
                      </div>
                    ) : <p style={{ color: INK_SOFT, fontSize: 12 }}>Sin novedades destacadas.</p>}
                  </div>
                  <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(23,21,18,.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: INK_SOFT, fontWeight: 600 }}>📅 Próximos plazos</div>
                      <button onClick={() => setCommTab('opps')} style={{ background: 'none', border: 'none', color: GOLD_DEEP, fontSize: 11, cursor: 'pointer' }}>Ver todos →</button>
                    </div>
                    {commOpps.slice(0,3).map(op => (
                      <div key={op.id} style={{ fontSize: 13, color: INK, borderBottom: `1px solid ${LINE_LIGHT}`, paddingBottom: 10, marginBottom: 10 }}>{op.title}</div>
                    ))}
                    {commOpps.length === 0 && <p style={{ color: INK_SOFT, fontSize: 12 }}>Sin plazos próximos.</p>}
                  </div>
                  <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(23,21,18,.04)' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 12, fontWeight: 600 }}>Mi actividad</div>
                    {commInsights.filter(i => i.mxb_partners?.full_name === partner?.full_name).slice(0,3).map(ins => (
                      <div key={ins.id} style={{ fontSize: 12, color: INK_SOFT, borderBottom: `1px solid ${LINE_LIGHT}`, paddingBottom: 8, marginBottom: 8 }}>
                        {new Date(ins.created_at).toLocaleDateString('es-ES')} · Insight publicado
                      </div>
                    ))}
                    <button onClick={() => setCommTab('insights')} style={{ background: 'none', border: 'none', color: GOLD_DEEP, fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: "'Inter',sans-serif" }}>Ver toda mi actividad →</button>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {commTab === 'insights' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => {}} style={{ padding: '8px 18px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>+ Nuevo Insight</button>
                </div>
                <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 24 }}>
                  <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 14 }}>Comparte tu perspectiva</div>
                  <textarea value={insightBody} onChange={e => setInsightBody(e.target.value)} rows={5} placeholder="Escribe tu insight, reflexión o experiencia para la comunidad MXB…" style={{ ...inp, resize: 'vertical', marginBottom: 12 }} />
                  {insightError && <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 8 }}>{insightError}</div>}
                  {insightSent && <div style={{ color: '#6fcf97', fontSize: 13, marginBottom: 8 }}>✓ Tu insight ha sido enviado para revisión</div>}
                  <button onClick={postInsight} disabled={insightSending || !insightBody.trim()} style={{ padding: '10px 20px', background: insightSending ? '#aaa' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                    {insightSending ? 'Enviando…' : 'Publicar insight'}
                  </button>
                  <p style={{ fontSize: 11, color: INK_SOFT, marginTop: 8 }}>Tu aportación será revisada antes de publicarse en el feed de la comunidad.</p>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, color: INK, marginBottom: 16 }}>Insights de la comunidad</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                  {commInsights.map(ins => (
                    <div key={ins.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(23,21,18,.04)' }}>
                      <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 8 }}>
                        {ins.mxb_partners?.full_name ?? 'Brand Partner'} · {new Date(ins.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })}
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: INK }}>{ins.body}</p>
                    </div>
                  ))}
                  {commInsights.length === 0 && <p style={{ color: INK_SOFT, fontSize: 13 }}>Todavía no hay insights publicados. ¡Sé el primero en compartir!</p>}
                </div>
              </div>
            )}

            {/* Oportunidades */}
            {commTab === 'opps' && (
              <div>
                {/* Hero */}
                <div style={{ background: '#141210', borderRadius: 14, padding: '40px 32px', marginBottom: 28, textAlign: 'center' }}>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 26, color: '#fff', marginBottom: 10 }}>
                    <span style={{ color: G }}>OPORTUNIDADES</span> QUE TE LLEVAN MÁS LEJOS
                  </h1>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', maxWidth: 600, margin: '0 auto' }}>Presenta tu talento, gana visibilidad y forma parte de experiencias que abren puertas en la industria.</p>
                </div>

                {/* 4 cards from DB + static */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 28 }}>
                  {[
                    { num: '1', title: 'Global Boost Awards', desc: 'Preséntate a los premios internacionales que se celebran durante el Festival de cine de Cannes, Berlinale, y otras ciudades internacionales.', bullets: ['🎬 Gala en Cannes', '🏆 Berlinale Digital Showcase', '🌐 Otras ciudades internacionales'], action: () => setTab('awards'), btnLabel: 'IR A GLOBAL BOOST AWARDS' },
                    { num: '2', title: 'Future of Voices', desc: 'Sé una de las voces líderes de legado, deja un mensaje a tu yo de 10 años y a futuras generaciones.', bullets: ['💬 Comparte tu mensaje', '♡ Inspira al mundo', '♧ Deja tu huella'], action: () => setTab('fov'), btnLabel: 'SER UNA VOZ' },
                    { num: '3', title: 'Obtén Visibilidad y Autoridad en The La Croisette', desc: 'Publica tu historia, proyectos e insights en la revista oficial del ecosistema. Posiciónate ante productores, marcas y medios.', bullets: ['☆ Editorial de alto impacto', '🌐 Distribución internacional', '♕ Autoridad y posicionamiento'], action: () => setTab('authority'), btnLabel: 'PUBLICAR MI HISTORIA' },
                    { num: '4', title: 'Berlinale Digital Show', desc: 'Participa y obtén un premio internacional sin salir de tu país. Tu proyecto puede ser visto por la industria global.', bullets: ['▱ Competencia online', '🏅 Premio internacional', '◉ Visibilidad global'], action: () => setTab('awards'), btnLabel: 'PARTICIPAR AHORA' },
                  ].map(opp => (
                    <div key={opp.num} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                      <div style={{ height: 120, background: '#141210', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'rgba(255,255,255,.1)', fontFamily: "'Fraunces', Georgia, serif" }}>{opp.num}</div>
                      <div style={{ padding: '20px 22px' }}>
                        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, marginBottom: 8 }}>{opp.title}</h3>
                        <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, marginBottom: 12 }}>{opp.desc}</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {opp.bullets.map(b => <li key={b} style={{ fontSize: 12, color: INK_SOFT }}>{b}</li>)}
                        </ul>
                        <button onClick={opp.action} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#141210', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>{opp.btnLabel} →</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Also show DB opps */}
                {commOpps.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                    {commOpps.map(op => (
                      <div key={op.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: INK, fontWeight: 500 }}>{op.title}</div>
                          {op.type && <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: `rgba(201,162,39,.12)`, color: G, padding: '3px 9px', borderRadius: 20 }}>{op.type}</span>}
                        </div>
                        {op.description && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, marginBottom: 16 }}>{op.description}</p>}
                        {op.cta_link && <a href={op.cta_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '9px 18px', background: G, color: '#0b0b0b', borderRadius: 6, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', textDecoration: 'none' }}>Solicitar información</a>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ background: '#141210', borderRadius: 14, padding: '28px 30px', marginTop: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 24, color: G, flexShrink: 0 }}>★</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong style={{ color: '#fff', fontSize: 14 }}>TU PRÓXIMO PASO PUEDE <em style={{ color: G }}>CAMBIARLO TODO</em></strong>
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>No se trata solo de participar. Se trata de ser visto, reconocido y recordado.</p>
                  </div>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: '12px 22px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', flexShrink: 0 }}>EXPLORA TODAS LAS OPORTUNIDADES →</button>
                </div>
              </div>
            )}

            {/* Miembros */}
            {commTab === 'members' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <input
                    value={membersSearch}
                    onChange={e => setMembersSearch(e.target.value)}
                    placeholder="Buscar por nombre, empresa o país…"
                    style={{ ...inp, maxWidth: 420 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                  {commMembers
                    .filter(m => {
                      if (!membersSearch.trim()) return true
                      const q = membersSearch.toLowerCase()
                      return m.full_name.toLowerCase().includes(q) || (m.company ?? '').toLowerCase().includes(q) || (m.country ?? '').toLowerCase().includes(q)
                    })
                    .map(m => (
                      <div key={m.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `rgba(201,162,39,.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12, color: G }}>{m.full_name.charAt(0).toUpperCase()}</div>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: INK, marginBottom: 4 }}>{m.full_name}</div>
                        {m.company && <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 3 }}>{m.company}</div>}
                        {m.country && <div style={{ fontSize: 11, color: INK_SOFT }}>{m.country}</div>}
                        {m.specialty && <div style={{ fontSize: 11, color: G, marginTop: 8 }}>{m.specialty}</div>}
                      </div>
                    ))
                  }
                  {commMembers.filter(m => {
                    if (!membersSearch.trim()) return true
                    const q = membersSearch.toLowerCase()
                    return m.full_name.toLowerCase().includes(q) || (m.company ?? '').toLowerCase().includes(q) || (m.country ?? '').toLowerCase().includes(q)
                  }).length === 0 && <p style={{ color: INK_SOFT, fontSize: 13 }}>No se encontraron miembros.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== PREMIUM EXPERIENCES (premiumExperiencesView) ========== */}
        {tab === 'premium' && (
          <div>
            {/* Dark hero */}
            <div style={{ background: '#0b0b0b', borderRadius: 14, padding: '40px 36px', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: G, letterSpacing: '.22em', marginBottom: 6 }}>MOVIES <span style={{ color: '#fff' }}>×</span> BRANDS</div>
              <div style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>CONNECTING TALENT, BRANDS &amp; STORIES</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 34, color: '#fff', marginBottom: 8 }}>Experiencias <span style={{ color: G }}>Premium</span></h1>
              <div style={{ width: 48, height: 2, background: G, margin: '14px auto 16px' }} />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', maxWidth: 540 }}>Acceso a momentos únicos. Conexiones que transforman tu marca y tu legado.</p>
            </div>

            {/* 4 benefit pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '♕', title: 'ACCESO EXCLUSIVO', desc: 'Experiencias seleccionadas para marcas y miembros del ecosistema.' },
                { icon: '☆', title: 'CONEXIONES DE ÉLITE', desc: 'Conecta con líderes, talentos y visionarios de la industria global.' },
                { icon: '◇', title: 'VISIBILIDAD GLOBAL', desc: 'Posiciona tu marca en los principales eventos y medios de la industria.' },
                { icon: '♢', title: 'IMPACTO Y LEGADO', desc: 'Creamos experiencias que generan impacto y construyen un legado duradero.' },
              ].map(b => (
                <div key={b.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '22px 20px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ fontSize: 28, color: G, marginBottom: 10 }}>{b.icon}</div>
                  <h3 style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: INK, fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Gallery cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 28 }}>
              {[
                { num: '01', title: 'GALA OFICIAL', desc: 'Donde la IA, las marcas y la industria del cine se encuentran.' },
                { num: '02', title: 'RED CARPET', desc: 'Acceso sujeto a disponibilidad.' },
                { num: '03', title: 'HOSPITALITY & CELEBRITIES PARTY', desc: 'Servicios exclusivos y cobertura estratégica en los eventos más importantes.' },
              ].map(c => (
                <div key={c.num} style={{ background: '#141210', borderRadius: 14, overflow: 'hidden', position: 'relative', minHeight: 220, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.75))' }} />
                  <div style={{ position: 'relative', zIndex: 2, padding: '24px 22px' }}>
                    <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 14, color: '#fff', letterSpacing: '.08em', marginBottom: 6 }}>{c.num}. {c.title}</h2>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background: '#141210', borderRadius: 14, padding: '28px 30px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 22, color: G, flexShrink: 0 }}>☆</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 18, color: '#fff', marginBottom: 6 }}>
                  VIVE EXPERIENCIAS QUE POSICIONAN TU MARCA <span style={{ color: G }}>EN EL RADAR DE HOLLYWOOD.</span>
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Forma parte de los momentos que marcan la diferencia.</p>
              </div>
              <button onClick={() => setTab('messages')} style={{ padding: '12px 22px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600, flexShrink: 0 }}>SOLICITA INFORMACIÓN →</button>
            </div>

            {/* Functional experience cards from DB */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
              {(premiumExp.length > 0 ? premiumExp : [
                { id: '1', name: 'Gala Oficial · Cannes 2027', description: 'Acceso a la gala exclusiva de Movies × Brands durante el Festival de Cannes. Ceremonia privada con productores, directores y marcas internacionales.', price_one: 0, price_companion: 1200, available: true, checkout_url: null },
                { id: '2', name: 'Berlinale Digital Showcase 2027', description: 'Presencia de tu marca en el showcase digital oficial durante la Berlinale. Producción de contenido incluida.', price_one: 0, price_companion: 800, available: true, checkout_url: null },
                { id: '3', name: 'Sesión Fotográfica Red Carpet', description: 'Sesión fotográfica profesional en alfombra roja para los representantes de tu marca durante Cannes 2027.', price_one: 450, price_companion: null, available: true, checkout_url: null },
                { id: '4', name: 'Hospitality & Celebrities Party', description: 'Acceso VIP al evento exclusivo con celebrities, directores y personalidades del ecosistema Movies × Brands.', price_one: 1800, price_companion: null, available: true, checkout_url: null },
              ]).map(exp => (
                <div key={exp.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <div style={{ height: 140, background: '#141210', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
                  <div style={{ padding: '20px 22px' }}>
                    <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 17, color: INK, marginBottom: 8 }}>{exp.name}</h3>
                    <p style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.6, marginBottom: 14 }}>{exp.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        {exp.price_one === 0
                          ? <span style={{ background: '#EEF6EC', border: '1px solid #7BAE79', color: '#3f6b3d', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>Incluido en membresía</span>
                          : <span style={{ background: 'rgba(201,162,39,.12)', border: `1px solid ${G}`, color: G, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Desde €{exp.price_one}</span>
                        }
                        {exp.price_companion && <span style={{ marginLeft: 8, fontSize: 11, color: INK_SOFT }}>+ Acompañante €{exp.price_companion}</span>}
                      </div>
                      <button onClick={() => exp.checkout_url ? window.open(exp.checkout_url, '_blank') : setTab('messages')} style={{ background: G, color: '#0B0B0B', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                        {exp.price_one === 0 ? 'Ver detalles →' : 'Solicitar info →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ACADEMY (academyView) ========== */}
        {tab === 'academy' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 8 }}>📖 Academy</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>Sprint To Growth Business School</h1>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>Formación para líderes que transforman la industria del cine y el marketing.</p>
              <div style={{ width: 48, height: 2, background: G, marginTop: 16 }} />
            </div>

            {/* Highlight box */}
            <div style={{ background: IVORY_CARD, border: `1px solid rgba(201,162,39,.25)`, borderRadius: 14, padding: '24px 26px', marginBottom: 32, boxShadow: '0 2px 12px rgba(23,21,18,.04)', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>🎓</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: INK, fontWeight: 600, marginBottom: 6 }}>3 formaciones 100% gratuitas durante este año — incluido el Máster Intensivo</p>
                <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6, marginBottom: 16 }}>Todas incluyen certificado universitario y doble titulación universitaria por universidades de Estados Unidos.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { n: '1', text: <span>Regístrate gratis en <a href="https://sprintogrowth.com/" target="_blank" rel="noopener noreferrer" style={{ color: G }}>sprintogrowth.com</a></span> },
                    { n: '2', text: 'Elige 3 formaciones' },
                    { n: '3', text: 'Solicita tu código de acceso en el canal de mensajería privada y conviértete en un líder de la IA aplicada a negocios' },
                  ].map(s => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: G, color: '#0b0b0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                      <span style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.5 }}>{s.text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => alert('Próximamente: listado completo de universidades y certificados asociados a la Academy.')} style={{ padding: '10px 20px', background: '#141210', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>Ver universidades y certificados →</button>
              </div>
            </div>

            {/* Academic structure */}
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: INK, marginBottom: 16 }}>Nuestra estructura académica</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 32 }}>
              {[
                { icon: '🌐', title: 'Oficinas', desc: 'Presencia global que impulsa proyectos e impacto local.' },
                { icon: '🎓', title: 'School', desc: 'Formación de alto nivel con certificación universitaria.' },
                { icon: '🤝', title: 'Connect', desc: 'Red exclusiva de líderes, mentores y oportunidades.' },
              ].map(c => (
                <div key={c.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                  <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: INK, marginBottom: 8 }}>{c.title}</h4>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Catalog picker from DB */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: INK }}>Más de 18 formaciones a elegir</h3>
              <span style={{ fontSize: 11, color: G, fontWeight: 600 }}>0 / 3 seleccionadas</span>
            </div>
            {academyItems.filter(i => !i.is_featured_guest).length === 0 && (
              <p style={{ color: INK_SOFT, fontSize: 13, marginBottom: 16 }}>El catálogo de formaciones se publicará próximamente.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, marginBottom: 28 }}>
              {academyItems.filter(i => !i.is_featured_guest).map(item => (
                <div key={item.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  {item.image_url && (
                    <div style={{ height: 140, borderRadius: '6px 6px 0 0', backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', margin: '-22px -24px 14px' }} />
                  )}
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: INK, fontWeight: 500, marginBottom: 6 }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 8 }}>{item.subtitle}</div>}
                  {item.body && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6, marginBottom: 12 }}>{item.body.slice(0,160)}{item.body.length > 160 ? '…' : ''}</p>}
                  {item.youtube_url && (
                    <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, letterSpacing: '.15em', textTransform: 'uppercase', textDecoration: 'none' }}>▶ Ver formación</a>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setTab('messages')} style={{ display: 'block', width: '100%', padding: '14px', background: '#141210', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', marginBottom: 10 }}>Solicitar mis formaciones (hasta 3)</button>
            <p style={{ fontSize: 11, color: INK_SOFT, textAlign: 'center', marginBottom: 36 }}>Al solicitar, aceptas los <a href="#" onClick={e => e.preventDefault()} style={{ color: G }}>Términos y Condiciones</a> de la Academy.</p>

            {/* Mentor del mes */}
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: INK, marginBottom: 16, marginTop: 8 }}>Mentor del mes</h3>
            {(() => {
              const featured = academyItems.find(i => i.is_featured_guest)
              if (!featured) return <p style={{ color: INK_SOFT, fontSize: 13 }}>El mentor del mes se publicará próximamente.</p>
              return (
                <div style={{ background: IVORY_CARD, border: `1px solid rgba(201,162,39,.25)`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: G, marginBottom: 10 }}>Featured Guest</div>
                    <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 22, color: INK, marginBottom: 6 }}>{featured.title}</h3>
                    {featured.subtitle && <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 12 }}>{featured.subtitle}</div>}
                    {featured.body && <p style={{ fontSize: 13, lineHeight: 1.7, color: INK_SOFT }}>{featured.body}</p>}
                  </div>
                  <div>
                    {featured.youtube_url ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 8, overflow: 'hidden' }}>
                        <iframe src={featured.youtube_url.replace('watch?v=','embed/')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <div style={{ borderRadius: 8, background: '#141210', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Contenido próximamente</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ========== FUTURE OF VOICES (fovView) ========== */}
        {tab === 'fov' && (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 34, color: INK, marginBottom: 6 }}>Future of Voices ✦</h1>
              <div style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: 20, color: G, marginBottom: 14 }}>Dear Future</div>
              <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
                Las voces que el mundo escucha, hablándole directamente a la próxima generación.<br />
                Un vídeo o una palabra escrita. Una pregunta. Un legado que inspira.
              </p>
            </div>

            {/* Published voices */}
            {fovVoices.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, marginBottom: 36 }}>
                {fovVoices.map(v => (
                  <div key={v.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: `rgba(201,162,39,.10)`, color: G, padding: '2px 8px', borderRadius: 20 }}>{v.contribution_type === 'video' ? '▶ Video' : '✍ Escrito'}</span>
                    </div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: INK, marginBottom: 8 }}>{v.title}</div>
                    {v.body && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6, marginBottom: 8 }}>{v.body.slice(0,200)}{v.body.length > 200 ? '…' : ''}</p>}
                    {v.youtube_url && <a href={v.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, letterSpacing: '.15em', textTransform: 'uppercase', textDecoration: 'none' }}>▶ Ver video</a>}
                  </div>
                ))}
              </div>
            )}

            {/* Question box */}
            <div style={{ background: IVORY_CARD, border: `1px solid rgba(201,162,39,.3)`, borderRadius: 14, padding: '28px 30px', marginBottom: 28, boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 14 }}>La pregunta de esta temporada</div>
              <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.8, marginBottom: 12 }}>
                Cada generación necesita que alguien le diga: <span style={{ color: G, fontStyle: 'italic' }}>&ldquo;tú también puedes hacerlo&rdquo;</span>. Reunimos a actores, actrices, influencers y visionarios que han llegado lejos, para que puedan dar un vídeo de hasta 60 segundos o una palabra escrita de verdad a quienes están empezando a soñar.
              </p>
              <div style={{ width: '100%', height: 1, background: `rgba(201,162,39,.3)`, margin: '16px 0' }} />
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: INK, lineHeight: 1.6, fontStyle: 'italic' }}>
                {fovQuestion ? `"${fovQuestion.question}"` : '"¿Qué le dirías a tu yo de 10 años para atreverse a soñar más grande?"'}
              </p>
            </div>

            {/* Join form */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '28px 30px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>🎤</span>
                <div>
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: INK, fontWeight: 400, marginBottom: 4 }}>Join the Project — Be a Voice</h2>
                  <p style={{ fontSize: 13, color: INK_SOFT }}>Completa tus datos. Tu solicitud será revisada por nuestro equipo antes de publicarse.</p>
                </div>
              </div>
              <div style={{ width: 48, height: 2, background: G, marginBottom: 24 }} />

              {fovSubmitted ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>✦</div>
                  <p style={{ color: G, fontSize: 16, fontFamily: "'Fraunces', Georgia, serif" }}>Tu solicitud está pendiente de revisión.</p>
                  <p style={{ color: INK_SOFT, fontSize: 13, marginTop: 8 }}>Los mensajes se publican por orden y disponibilidad. Tu solicitud puede publicarse de inmediato o en una fase posterior.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={lbl}>Nombre completo *</label>
                    <input style={inp} placeholder="Tu nombre completo" />
                  </div>
                  <div>
                    <label style={lbl}>Categoría *</label>
                    <select style={{ ...inp, appearance: 'none' as const }}>
                      <option value="">Selecciona…</option>
                      <option value="actor">Actor</option>
                      <option value="actress">Actress</option>
                      <option value="influencer">Influencer</option>
                      <option value="visionary">Visionary</option>
                      <option value="film_industry">Film Industry</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Email *</label>
                    <input type="email" style={inp} placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label style={lbl}>Red social principal</label>
                    <input style={inp} placeholder="@usuario o enlace a tu perfil" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Biografía corta</label>
                    <textarea rows={3} maxLength={300} style={{ ...inp, resize: 'vertical' }} placeholder="Cuéntanos brevemente quién eres y qué te inspira." />
                  </div>

                  {/* Message type */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Tipo de mensaje *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { label: '🎥 Video Message', val: 'video' },
                        { label: '✍️ Written Message', val: 'written' },
                      ].map(t => (
                        <button key={t.val} type="button"
                          onClick={() => { setFovWritten(t.val === 'written' ? fovWritten : ''); setFovYoutube(t.val === 'video' ? fovYoutube : '') }}
                          style={{ padding: '14px', border: `2px solid ${(t.val === 'video' && fovYoutube !== '') || (t.val === 'written' && fovWritten !== '') ? G : LINE_LIGHT}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, color: INK }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Enlace de tu vídeo (YouTube)</label>
                    <input value={fovYoutube} onChange={e => setFovYoutube(e.target.value)} style={inp} placeholder="https://youtube.com/watch?v=…" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Tu mensaje escrito</label>
                    <textarea value={fovWritten} onChange={e => setFovWritten(e.target.value)} rows={5} style={{ ...inp, resize: 'vertical' }} placeholder="Comparte tu mensaje de legado…" />
                  </div>

                  {fovError && <div style={{ gridColumn: '1/-1', color: '#e74c3c', fontSize: 13 }}>{fovError}</div>}

                  <div style={{ gridColumn: '1/-1' }}>
                    <button onClick={submitFov} disabled={fovSubmitting || (!fovYoutube.trim() && !fovWritten.trim())} style={{ display: 'block', width: '100%', padding: '14px', background: fovSubmitting ? '#aaa' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', marginBottom: 10 }}>
                      {fovSubmitting ? 'Enviando…' : 'Enviar mi solicitud'}
                    </button>
                    <p style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>Los mensajes se publican por orden y disponibilidad de espacio dentro de Future of Voices. Tu solicitud queda pendiente de revisión — puede publicarse de inmediato o en una fase posterior.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== AUTHORITY / LA CROISETTE (authorityView) ========== */}
        {tab === 'authority' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 8 }}>The Wonder World Group</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>📰 Media &amp; Authority</h1>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>The La Croisette Magazine — la revista editorial del ecosistema Movies × Brands.</p>
            </div>

            {/* 3 authority panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
              {[
                { title: 'Autoridad', desc: 'Aparecer en una publicación editorial reconocida del ecosistema del cine y las marcas te posiciona como una voz con criterio dentro de tu sector — no como un anuncio más.' },
                { title: 'Visibilidad', desc: 'Tu marca llega a la comunidad internacional de Movies × Brands: talento, instituciones, festivales y otras marcas del ecosistema.' },
                { title: 'Branding', desc: 'Un artículo redactado por nuestro equipo editorial, con tu narrativa y tu visión — asociado de forma permanente a la revista de nuestro ecosistema.' },
              ].map(c => (
                <div key={c.title} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, fontWeight: 500, marginBottom: 10 }}>{c.title}</h4>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Cómo funciona */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 32 }}>
              <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, color: INK, marginBottom: 12 }}>Cómo funciona</h4>
              <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.8, marginBottom: 18 }}>La lectura de The La Croisette Magazine es gratuita y abierta para cualquiera, dentro y fuera del Portal. Como Member, además, puedes solicitar que nuestro equipo periodístico redacte un artículo sobre tu marca y active tu mención en la Power List durante 12 meses — incluido en tu membresía.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="https://thelacroisette.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#141210', color: '#fff', borderRadius: 6, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>Leer la revista →</a>
                <button onClick={() => setTab('powerlist')} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${G}`, color: GOLD_DEEP, borderRadius: 6, cursor: 'pointer', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>Solicitar mi mención →</button>
              </div>
            </div>

            {/* Power List status */}
            <div style={{ background: IVORY_CARD, border: `1px solid rgba(201,162,39,.3)`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 14 }}>Estado de tu mención en el Power List</div>
              {partnerPLRequest?.status === 'pending' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f0c040' }} />
                  <span style={{ fontSize: 14, color: INK }}>En revisión — tu solicitud está siendo evaluada por el equipo MXB.</span>
                </div>
              )}
              {partnerPLRequest?.status === 'approved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6fcf97' }} />
                  <span style={{ fontSize: 14, color: '#6fcf97' }}>Activo — tu mención está publicada en el Power List.</span>
                </div>
              )}
              {!partnerPLRequest && (
                <div>
                  <p style={{ fontSize: 14, color: INK_SOFT, marginBottom: 16, lineHeight: 1.6 }}>Aún no has solicitado tu mención en el Power List. Accede a la sección Power List para completar tu perfil editorial.</p>
                  <button onClick={() => setTab('powerlist')} style={{ padding: '11px 22px', background: 'transparent', border: `1px solid ${G}`, color: GOLD_DEEP, borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                    Solicitar mención en Power List →
                  </button>
                </div>
              )}
            </div>

            {/* Official Content */}
            <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 20 }}>Contenido editorial publicado</div>
            {officialContent.length === 0 && <p style={{ color: INK_SOFT, fontSize: 13 }}>El contenido editorial se publicará próximamente.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
              {officialContent.map(oc => (
                <div key={oc.id} style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
                  {oc.image_url && (
                    <div style={{ height: 150, borderRadius: '6px 6px 0 0', backgroundImage: `url(${oc.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', margin: '-24px -26px 16px' }} />
                  )}
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: INK, fontWeight: 500, marginBottom: 8 }}>{oc.title}</div>
                  {oc.excerpt && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, marginBottom: 14 }}>{oc.excerpt}</p>}
                  {oc.url && (
                    <a href={oc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, letterSpacing: '.15em', textTransform: 'uppercase', textDecoration: 'none' }}>Leer artículo →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== PROSPECTOS ========== */}
        {tab === 'prospectos' && (
          <ProspectosTab
            partner={partner ? { id: partner.id, full_name: partner.full_name, company: partner.company } : null}
            initProspects={prospects}
            meetingText={meetingText}
          />
        )}

        {/* ========== MENSAJES (messagesView) ========== */}
        {tab === 'messages' && (
          <div>
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 28, color: INK, marginBottom: 6 }}>✉️ Mensajes del equipo</h1>
              <p style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>Comunicados privados de Movies × Brands para ti.</p>
            </div>

            <div style={{ background: IVORY_CARD, border: `1px solid ${LINE_LIGHT}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)', marginBottom: 22 }}>
              {localMessages.length === 0 && <p style={{ color: INK_SOFT, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No tienes mensajes del equipo aún. Te escribiremos aquí con novedades importantes.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {localMessages.filter(m => m.sender === 'admin').map(m => (
                  <div key={m.id} style={{ borderBottom: `1px solid ${LINE_LIGHT}`, paddingBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: G }}>Movies × Brands</div>
                      <div style={{ fontSize: 11, color: INK_SOFT }}>{new Date(m.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    {m.subject && <div style={{ fontSize: 15, color: INK, fontWeight: 600, marginBottom: 6 }}>{m.subject}</div>}
                    <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.6 }}>{m.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose / contact */}
            <div style={{ background: IVORY_CARD, border: `1px solid ${G}`, borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(23,21,18,.04)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 16 }}>Enviar un mensaje al equipo</div>
              <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl}>Asunto (opcional)</label>
                  <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="Asunto de tu mensaje…" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Mensaje</label>
                  <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} required rows={5} placeholder="Escribe tu mensaje…" style={{ ...inp, resize: 'vertical' }} />
                </div>
                {msgSent && <div style={{ color: '#6fcf97', fontSize: 13 }}>✓ Mensaje enviado correctamente</div>}
                <button type="submit" disabled={sending || !msgBody.trim()} style={{ padding: '13px', background: sending ? '#aaa' : G, color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </div>
        )}


          </div>
        </main>
      </div>
    </div>
  )
}
