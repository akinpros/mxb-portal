'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const G = '#C9A227'
const IVORY = '#F7F3EC'
const INK = '#171512'
const INK_SOFT = 'rgba(23,21,18,.62)'
const LINE_LIGHT = 'rgba(11,11,11,.10)'
const PANEL = '#161616'
const LINE = '#2c2c2c'

type InstTab = 'home' | 'buscador' | 'fov' | 'lacroisette' | 'anuncios'

type Institution = {
  id: string
  email: string
  org_name: string | null
  category: string | null
  access_status: string | null
  profile_status: string | null
  country: string | null
  website: string | null
}

type MemberResult = {
  id: string
  contact_name: string | null
  display_name: string | null
  categories: string[] | null
  country: string | null
}

type InstitutionAnnouncement = {
  id: string
  title: string
  message: string
  submitted_by: string | null
  submitted_by_email: string | null
  created_at: string
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#FBFAF7',
  border: `1px solid ${LINE_LIGHT}`, borderRadius: 6, color: INK,
  fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.28em',
  textTransform: 'uppercase', color: INK_SOFT, marginBottom: 7,
}

export default function InstitutionPortalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<InstTab>('home')
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  // Buscador
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<MemberResult[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // Anuncios
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annSubmitting, setAnnSubmitting] = useState(false)
  const [annSuccess, setAnnSuccess] = useState(false)
  const [myAnnouncements, setMyAnnouncements] = useState<InstitutionAnnouncement[]>([])

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/portal/login'); return }
      const email = session.user.email ?? ''
      setUserEmail(email)

      const { data: inst } = await supabase
        .from('mxb_institutions')
        .select('*')
        .eq('email', email)
        .single()

      setInstitution(inst)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (tab === 'anuncios' && userEmail) loadMyAnnouncements()
  }, [tab, userEmail])

  async function loadMyAnnouncements() {
    const { data } = await supabase
      .from('mxb_institution_announcements')
      .select('*')
      .eq('submitted_by_email', userEmail)
      .order('created_at', { ascending: false })
    setMyAnnouncements(data ?? [])
  }

  async function searchMembers(q: string) {
    setMembersLoading(true)
    let query = supabase
      .from('mxb_selection_members')
      .select('id, contact_name, display_name, categories, country')
      .eq('approved', true)
      .eq('public_profile', true)

    if (q.trim()) {
      query = query.or(`contact_name.ilike.%${q}%,display_name.ilike.%${q}%`)
    }

    const { data } = await query.limit(30)
    setMembers(data ?? [])
    setMembersLoading(false)
  }

  useEffect(() => {
    if (tab === 'buscador') searchMembers(search)
  }, [tab])

  async function submitAnnouncement() {
    if (!annTitle.trim() || !annMessage.trim()) return
    setAnnSubmitting(true)
    const orgName = institution?.org_name ?? userEmail
    await Promise.all([
      supabase.from('mxb_institution_announcements').insert({
        title: annTitle,
        message: annMessage,
        submitted_by: orgName,
        submitted_by_email: userEmail,
        submitted_by_category: institution?.category ?? null,
      }),
      supabase.from('mxb_admin_notifications').insert({
        type: 'institution_announcement',
        title: `Nueva novedad propuesta: ${annTitle}`,
        priority: 'normal',
      }),
    ])
    setAnnTitle('')
    setAnnMessage('')
    setAnnSuccess(true)
    await loadMyAnnouncements()
    setAnnSubmitting(false)
    setTimeout(() => setAnnSuccess(false), 4000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  const orgName = institution?.org_name ?? userEmail

  const sidebarLinks: { label?: string; tab?: InstTab; section?: string }[] = [
    { section: 'Mi Organización' },
    { label: 'Inicio', tab: 'home' },
    { section: 'Directorio' },
    { label: 'Buscador', tab: 'buscador' },
    { section: 'Programas' },
    { label: 'Future of Voices', tab: 'fov' },
    { label: 'La Croisette', tab: 'lacroisette' },
    { section: 'Comunicación' },
    { label: 'Anuncios', tab: 'anuncios' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: PANEL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: G, fontFamily: 'Georgia,serif', fontSize: 18 }}>Cargando…</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 246, background: PANEL, borderRight: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 20px 20px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', color: G, textTransform: 'uppercase', marginBottom: 4 }}>MXB · The Portal</div>
          <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.4 }}>Institución</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {sidebarLinks.map((l, i) => l.section
            ? <div key={i} style={{ padding: '16px 20px 6px', fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>{l.section}</div>
            : (
              <button key={i} onClick={() => l.tab && setTab(l.tab)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 20px', background: tab === l.tab ? `rgba(201,162,39,.12)` : 'transparent', border: 'none', color: tab === l.tab ? G : 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer', borderLeft: tab === l.tab ? `2px solid ${G}` : '2px solid transparent' }}>
                {l.label}
              </button>
            )
          )}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
          <button onClick={signOut} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Salir →</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: IVORY }}>
        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: IVORY, borderBottom: `1px solid ${LINE_LIGHT}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: INK, fontWeight: 600 }}>MXB · The Portal</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 13, color: INK_SOFT }}>{orgName}</span>
            <button onClick={signOut} style={{ fontSize: 12, color: INK_SOFT, background: 'none', border: `1px solid ${LINE_LIGHT}`, borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Salir</button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: 960, width: '100%' }}>

          {/* HOME */}
          {tab === 'home' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: INK, marginBottom: 6 }}>{orgName}</h1>
                  {institution?.category && (
                    <span style={{ display: 'inline-block', background: `rgba(201,162,39,.15)`, color: G, fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20 }}>{institution.category}</span>
                  )}
                </div>
              </div>

              {/* Pending access banner */}
              {institution?.access_status !== 'approved' && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '20px 24px', marginBottom: 32 }}>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Acceso pendiente de aprobación</div>
                  <div style={{ fontSize: 13, color: '#92400e' }}>Tu acceso está pendiente de aprobación por el equipo de Movies × Brands.</div>
                </div>
              )}

              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { label: 'Categoría', value: institution?.category ?? '—' },
                  { label: 'Estado de acceso', value: institution?.access_status ?? 'pending', accent: institution?.access_status === 'approved' ? '#16a34a' : '#d97706' },
                  { label: 'Estado de perfil', value: institution?.profile_status ?? '—' },
                ].map(k => (
                  <div key={k.label} style={{ background: '#fff', border: `1px solid ${LINE_LIGHT}`, borderRadius: 10, padding: '20px 20px' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: INK_SOFT, marginBottom: 8 }}>{k.label}</div>
                    <div style={{ fontSize: 20, fontFamily: 'Georgia,serif', color: k.accent ?? INK, fontWeight: 600 }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSCADOR */}
          {tab === 'buscador' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: INK, marginBottom: 24 }}>Buscador</h1>
              <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchMembers(search)}
                  style={{ ...inp, flex: 1 }} placeholder="Buscar por nombre o empresa…" />
                <button onClick={() => searchMembers(search)}
                  style={{ background: INK, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Buscar
                </button>
              </div>

              {membersLoading
                ? <p style={{ color: INK_SOFT, fontSize: 14 }}>Buscando…</p>
                : members.length === 0
                  ? <p style={{ color: INK_SOFT, fontSize: 14 }}>No se encontraron resultados.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {members.map(m => (
                        <div key={m.id} style={{ background: '#fff', border: `1px solid ${LINE_LIGHT}`, borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, color: INK, marginBottom: 2 }}>{m.display_name || m.contact_name}</div>
                            {m.display_name && m.contact_name && <div style={{ fontSize: 13, color: INK_SOFT }}>{m.contact_name}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {(m.categories ?? []).map((c: string) => (
                              <span key={c} style={{ fontSize: 11, background: '#f3f4f6', color: INK_SOFT, padding: '3px 10px', borderRadius: 20 }}>{c}</span>
                            ))}
                          </div>
                          {m.country && <span style={{ fontSize: 12, color: INK_SOFT, whiteSpace: 'nowrap' }}>{m.country}</span>}
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          )}

          {/* ANUNCIOS */}
          {tab === 'anuncios' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: INK, marginBottom: 32 }}>Anuncios</h1>

              {/* Propose form */}
              <div style={{ background: '#fff', border: `1px solid ${LINE_LIGHT}`, borderRadius: 10, padding: '24px 28px', marginBottom: 40 }}>
                <h3 style={{ fontSize: 15, color: INK, marginBottom: 20, fontFamily: 'Georgia,serif' }}>Proponer novedad</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Título</label>
                  <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Mensaje</label>
                  <textarea value={annMessage} onChange={e => setAnnMessage(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} />
                </div>
                <button onClick={submitAnnouncement} disabled={annSubmitting}
                  style={{ background: G, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {annSubmitting ? 'Enviando…' : 'Enviar propuesta'}
                </button>
                {annSuccess && <p style={{ fontSize: 13, color: '#16a34a', marginTop: 10 }}>Propuesta enviada correctamente.</p>}
              </div>

              {/* My announcements */}
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: INK, marginBottom: 16 }}>Tus novedades propuestas</h2>
              {myAnnouncements.length === 0
                ? <p style={{ color: INK_SOFT, fontSize: 14 }}>No has propuesto ninguna novedad todavía.</p>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myAnnouncements.map(a => (
                      <div key={a.id} style={{ background: '#fff', border: `1px solid ${LINE_LIGHT}`, borderRadius: 8, padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: INK }}>{a.title}</span>
                          <span style={{ fontSize: 11, color: INK_SOFT }}>{new Date(a.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div style={{ fontSize: 13, color: INK_SOFT }}>{a.message}</div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* FOV */}
          {tab === 'fov' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: INK, marginBottom: 8 }}>Future of Voices ✦</h1>
              <p style={{ color: INK_SOFT, fontSize: 14, lineHeight: 1.7 }}>Información sobre el programa próximamente.</p>
            </div>
          )}

          {/* LA CROISETTE */}
          {tab === 'lacroisette' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: INK, marginBottom: 8 }}>La Croisette</h1>
              <p style={{ color: INK_SOFT, fontSize: 14, lineHeight: 1.7 }}>Contenido exclusivo de La Croisette próximamente.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
