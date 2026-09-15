'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G = '#C9A227'
const GOLD_DEEP = '#8a6d1f'
const INK = '#171512'
const INK_SOFT = 'rgba(23,21,18,.55)'
const BG = '#F8F6F1'
const WHITE = '#fff'

const EDITIONS = [
  { id: 'ai-technology', number: '01', title: 'AI & Technology', desc: 'Inteligencia artificial, tecnología, innovación y transformación.' },
  { id: 'beauty-aesthetics-longevity', number: '02', title: 'Beauty, Aesthetics & Longevity', desc: 'Medicina estética, beauty, wellness, longevidad.' },
  { id: 'brands-marketing-growth', number: '03', title: 'Brands, Marketing & Growth', desc: 'Marketing, marcas, crecimiento e innovación empresarial.' },
  { id: 'entertainment-media-culture', number: '04', title: 'Entertainment, Media & Culture', desc: 'Entretenimiento, medios de comunicación y cultura.' },
  { id: 'human-impact-leadership', number: '05', title: 'Human Impact & Leadership', desc: 'Liderazgo con impacto social, sostenibilidad y propósito.' },
  { id: 'influencers-creators', number: '06', title: 'Influencers & Creators', desc: 'Creadores de contenido e influencers con impacto real.' },
  { id: 'celebrities-cultural-icons', number: '07', title: 'Celebrities & Cultural Icons', desc: 'Celebrities e iconos culturales de referencia internacional.' },
  { id: 'business-entrepreneurship', number: '08', title: 'Business & Entrepreneurship', desc: 'Emprendimiento, inversión y negocios internacionales.' },
]

export type PLEntry = {
  id: string
  full_name: string
  slug: string
  category: string | null
  edition_category: string | null
  power_list_name: string | null
  year: number | null
  rank: number | null
  role: string | null
  country: string | null
  short_bio: string | null
  full_bio: string | null
  selection_reason: string | null
  expertise: string[] | null
  youtube_url: string | null
  youtube_title: string | null
  linkedin_url: string | null
  instagram_url: string | null
  photo_url: string | null
  is_verified: boolean
  is_featured: boolean
  is_public: boolean
}

interface Props {
  entries: PLEntry[]
  partnerId: string | null
  existingRequest: { status: string } | null
}

function ytEmbed(url: string | null) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export default function PowerListView({ entries, partnerId, existingRequest }: Props) {
  const supabase = createClient()
  const [screen, setScreen] = useState<'home' | 'edition' | 'profile' | 'request'>('home')
  const [activeEdition, setActiveEdition] = useState<typeof EDITIONS[0] | null>(null)
  const [activeProfile, setActiveProfile] = useState<PLEntry | null>(null)
  const [search, setSearch] = useState('')
  const [reqMsg, setReqMsg] = useState('')
  const [reqStatus, setReqStatus] = useState(existingRequest?.status ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [reqResult, setReqResult] = useState('')

  const publicEntries = entries.filter(e => e.is_public)

  function openEdition(ed: typeof EDITIONS[0]) {
    setActiveEdition(ed)
    setSearch('')
    setScreen('edition')
  }

  function openProfile(p: PLEntry) {
    setActiveProfile(p)
    setScreen('profile')
  }

  function goHome() { setScreen('home'); setActiveEdition(null); setActiveProfile(null) }
  function goEdition() { setScreen('edition'); setActiveProfile(null) }

  const editionEntries = activeEdition
    ? publicEntries.filter(e => e.edition_category === activeEdition.id)
    : []

  const filteredEntries = editionEntries.filter(e =>
    !search || JSON.stringify(e).toLowerCase().includes(search.toLowerCase())
  )

  async function submitRequest() {
    const words = reqMsg.trim().split(/\s+/).filter(Boolean).length
    if (!reqMsg.trim()) { alert('Escribe tu mensaje'); return }
    if (words > 600) { alert('Máximo 600 palabras'); return }
    if (!partnerId) { alert('Debes iniciar sesión'); return }
    setSubmitting(true)
    const { error } = await supabase.from('mxb_power_list_requests').insert({ partner_id: partnerId, message: reqMsg.trim() })
    if (error) { setReqResult('Error: ' + error.message); setSubmitting(false); return }
    setReqStatus('pending')
    setReqResult('✓ Solicitud enviada. El equipo la revisará antes de publicar tu mención.')
    setSubmitting(false)
    setScreen('home')
  }

  const wordCount = reqMsg.trim().split(/\s+/).filter(Boolean).length

  const s: Record<string, React.CSSProperties> = {
    wrap: { background: BG, color: INK, padding: '30px 34px 56px', minHeight: 'calc(100vh - 68px)', fontFamily: "'Inter', Arial, sans-serif" },
    kicker: { fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 700, marginBottom: 6 },
    h1: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 400, margin: '6px 0 4px', color: INK },
    lead: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, marginBottom: 6, color: INK },
    intro: { fontSize: 12.5, color: INK_SOFT, lineHeight: 1.7, maxWidth: 700, marginBottom: 24 },
    edCard: { background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, padding: '20px 22px', display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 16, alignItems: 'center', cursor: 'pointer', marginBottom: 10, transition: '.2s' },
    edNo: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: G },
    edTitle: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, marginBottom: 4, color: INK },
    edDesc: { fontSize: 11, color: INK_SOFT, lineHeight: 1.55 },
    edCta: { fontSize: 10.5, color: GOLD_DEEP, fontWeight: 700, whiteSpace: 'nowrap' },
    card: { background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' },
    photo: { position: 'relative', aspectRatio: '4/3', background: '#EEEAE2', overflow: 'hidden' },
    badge: { position: 'absolute', left: 10, top: 10, background: 'rgba(11,11,11,.86)', color: '#D8B85A', borderRadius: 4, padding: '4px 7px', fontSize: 8, letterSpacing: '.08em', fontWeight: 700 },
    rank: { position: 'absolute', right: 10, top: 10, width: 34, height: 34, borderRadius: '50%', background: G, color: '#0B0B0B', display: 'grid', placeItems: 'center', fontFamily: 'Georgia,serif', fontWeight: 500, fontSize: 14 },
    cardBody: { padding: 14 },
    cardName: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, marginBottom: 3, color: INK },
    cardRole: { fontSize: 10, color: GOLD_DEEP, fontWeight: 700, marginBottom: 6 },
    cardBio: { fontSize: 11, color: INK_SOFT, lineHeight: 1.55 },
    backBtn: { background: 'none', border: 'none', color: GOLD_DEEP, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 },
    sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, margin: '24px 0 13px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 },
    filtersRow: { display: 'grid', gridTemplateColumns: '1.5fr .7fr', gap: 10, marginBottom: 14 },
    input: { width: '100%', background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: INK, boxSizing: 'border-box' },
    reqPanel: { background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, padding: 24, maxWidth: 640 },
    reqTitle: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 400, color: INK, marginBottom: 8 },
    reqHint: { fontSize: 12.5, color: INK_SOFT, lineHeight: 1.7, marginBottom: 18 },
    reqTextarea: { width: '100%', padding: '12px 14px', border: '1px solid rgba(11,11,11,.12)', borderRadius: 8, fontSize: 13, color: INK, minHeight: 160, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Georgia,serif' },
    reqBtn: { background: '#0B0B0B', color: '#fff', border: '1px solid #0B0B0B', borderRadius: 6, padding: '10px 18px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 12 },
  }

  // Home screen
  if (screen === 'home') return (
    <div style={s.wrap}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={s.kicker}>INDUSTRY & INFLUENCE EDITIONS</div>
            <h1 style={s.h1}>Power List</h1>
            <p style={s.lead}>Las voces que están definiendo la industria</p>
            <p style={s.intro}>Selección editorial trimestral de The La Croisette × Movies & Brands — perfiles de referencia en cada sector.</p>
          </div>
          <button onClick={() => setScreen('request')} style={{ background: '#0B0B0B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Solicitar mi mención →
          </button>
        </div>

        {reqResult && <div style={{ background: 'rgba(212,175,55,.1)', border: `1px solid ${G}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: GOLD_DEEP }}>{reqResult}</div>}

        <div style={s.sectionHead}>
          <div>
            <div style={s.kicker}>BROWSE EDITIONS</div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 22, marginTop: 4 }}>Explore the Editions</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
          {EDITIONS.map(ed => {
            const count = publicEntries.filter(e => e.edition_category === ed.id).length
            return (
              <div key={ed.id} style={s.edCard} onClick={() => openEdition(ed)}>
                <div style={s.edNo}>{ed.number}</div>
                <div>
                  <h3 style={s.edTitle}>{ed.title}</h3>
                  <p style={s.edDesc}>{ed.desc}</p>
                </div>
                <div style={s.edCta}>{count} perfiles →</div>
              </div>
            )
          })}
        </div>

        {/* Featured profiles */}
        {publicEntries.filter(e => e.is_featured).length > 0 && (
          <>
            <div style={s.sectionHead}>
              <div>
                <div style={s.kicker}>EDITORIAL PICKS</div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 22, marginTop: 4 }}>Perfiles destacados</h2>
              </div>
            </div>
            <div style={s.grid}>
              {publicEntries.filter(e => e.is_featured).slice(0, 6).map(p => <ProfileCard key={p.id} p={p} onClick={() => openProfile(p)} s={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Edition screen
  if (screen === 'edition' && activeEdition) return (
    <div style={s.wrap}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button style={s.backBtn} onClick={goHome}>← Todas las Editions</button>
        <div style={{ marginBottom: 24 }}>
          <div style={s.kicker}>EDITION {activeEdition.number}</div>
          <h1 style={s.h1}>{activeEdition.title}</h1>
          <p style={s.intro}>{activeEdition.desc}</p>
        </div>
        <div style={s.filtersRow}>
          <input style={s.input} placeholder="Buscar por nombre o especialidad..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 14 }}>{filteredEntries.length} perfiles seleccionados</div>
        {filteredEntries.length === 0 && <p style={{ color: INK_SOFT, textAlign: 'center', padding: '40px 0' }}>Sin perfiles publicados en esta edición todavía.</p>}
        <div style={s.grid}>
          {filteredEntries.map(p => <ProfileCard key={p.id} p={p} onClick={() => openProfile(p)} s={s} />)}
        </div>
      </div>
    </div>
  )

  // Profile screen
  if (screen === 'profile' && activeProfile) {
    const p = activeProfile
    const embed = ytEmbed(p.youtube_url)
    return (
      <div style={s.wrap}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button style={s.backBtn} onClick={activeEdition ? goEdition : goHome}>
            ← {activeEdition ? activeEdition.title : 'Power List'}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, alignItems: 'flex-start' }}>
            {/* Left */}
            <div>
              {p.photo_url && <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
              <div style={{ fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 700, marginBottom: 4 }}>THE LA CROISETTE · POWER LIST</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 400, color: INK, marginBottom: 6 }}>{p.full_name}</h1>
              {p.role && <div style={{ fontSize: 12, color: GOLD_DEEP, fontWeight: 700, marginBottom: 4 }}>{p.role}</div>}
              {p.country && <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 12 }}>{p.country}</div>}
              {p.expertise && p.expertise.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {p.expertise.map(x => <span key={x} style={{ background: '#F5F0E8', border: '1px solid #DDD5C0', borderRadius: 99, padding: '3px 9px', fontSize: 10, color: GOLD_DEEP }}>{x}</span>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noopener" style={{ background: '#0B0B0B', color: '#fff', borderRadius: 6, padding: '8px 12px', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>LinkedIn</a>}
                {p.instagram_url && <a href={p.instagram_url} target="_blank" rel="noopener" style={{ background: '#0B0B0B', color: '#fff', borderRadius: 6, padding: '8px 12px', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>Instagram</a>}
              </div>
            </div>
            {/* Right */}
            <div>
              {p.selection_reason && (
                <section style={{ background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, marginBottom: 8, color: INK }}>Why selected</h3>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.7 }}>{p.selection_reason}</p>
                </section>
              )}
              {p.full_bio && (
                <section style={{ background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, marginBottom: 8, color: INK }}>Profile</h3>
                  <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.7 }}>{p.full_bio}</p>
                </section>
              )}
              {embed && (
                <section style={{ background: WHITE, border: '1px solid rgba(11,11,11,.10)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, marginBottom: 8, color: INK }}>{p.youtube_title || 'Video destacado'}</h3>
                  <div style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#111' }}>
                    <iframe src={embed} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                  </div>
                </section>
              )}
              {p.edition_category && (
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 8 }}>
                  Edición: <strong>{EDITIONS.find(e => e.id === p.edition_category)?.title ?? p.edition_category}</strong>
                  {p.power_list_name && <> · {p.power_list_name}</>}
                  {p.year && <> · {p.year}</>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Request screen
  if (screen === 'request') return (
    <div style={s.wrap}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button style={s.backBtn} onClick={goHome}>← Power List</button>
        <div style={s.reqPanel}>
          <h2 style={s.reqTitle}>Solicita tu mención — 12 meses gratis</h2>
          {reqStatus === 'pending' ? (
            <div>
              <p style={s.reqHint}>Tu solicitud está <strong>en revisión</strong>. Nuestro equipo la revisará antes de publicar tu artículo y activar tu mención en la Power List durante 12 meses.</p>
              <button style={s.backBtn} onClick={goHome}>← Volver</button>
            </div>
          ) : reqStatus === 'approved' ? (
            <div>
              <p style={{ ...s.reqHint, color: '#27ae60' }}>✓ Tu mención está activa en la Power List. Tu artículo ya está publicado.</p>
              <button style={s.backBtn} onClick={goHome}>← Volver</button>
            </div>
          ) : (
            <>
              <p style={s.reqHint}>Cuéntanos sobre tu marca en un mensaje privado (máximo 600 palabras). Nuestros periodistas redactarán un artículo y tu mención en la Power List quedará activa 12 meses. Tu solicitud queda pendiente de aprobación.</p>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: GOLD_DEEP, marginBottom: 8 }}>Tu mensaje (máx. 600 palabras)</label>
              <textarea style={s.reqTextarea} value={reqMsg} onChange={e => setReqMsg(e.target.value)} placeholder="Cuéntanos sobre tu marca, tu misión y lo que quieres destacar…" />
              <div style={{ fontSize: 11, color: wordCount > 600 ? '#c0392b' : INK_SOFT, textAlign: 'right', marginTop: 4 }}>{wordCount} / 600 palabras</div>
              <button style={{ ...s.reqBtn, opacity: submitting ? .5 : 1 }} disabled={submitting} onClick={submitRequest}>
                {submitting ? 'Enviando...' : 'Enviar solicitud →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return null
}

function ProfileCard({ p, onClick, s }: { p: PLEntry; onClick: () => void; s: Record<string, React.CSSProperties> }) {
  return (
    <div style={s.card} onClick={onClick}>
      <div style={s.photo}>
        {p.photo_url ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#EEEAE2' }} />}
        {p.category && <span style={s.badge}>{p.category}</span>}
        {p.rank && <span style={s.rank}>{p.rank}</span>}
      </div>
      <div style={s.cardBody}>
        <div style={s.cardName}>{p.full_name}</div>
        {p.role && <div style={s.cardRole}>{p.role}</div>}
        {p.short_bio && <p style={s.cardBio}>{p.short_bio.slice(0, 100)}{p.short_bio.length > 100 ? '…' : ''}</p>}
      </div>
    </div>
  )
}
