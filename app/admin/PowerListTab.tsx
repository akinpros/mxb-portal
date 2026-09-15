'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G = '#D4AF37'
const LINE = '#2c2c2c'
const PANEL = '#161616'
const CH = '#E8D5C4'
const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: 'Georgia,serif', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: CH, marginBottom: 6 }
const btn: React.CSSProperties = { background: 'transparent', border: `1px solid ${G}`, color: G, borderRadius: 5, padding: '7px 13px', cursor: 'pointer', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', marginRight: 6 }
const btnDanger: React.CSSProperties = { ...btn, borderColor: '#c0392b', color: '#c0392b' }

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
  is_member: boolean
  is_featured: boolean
  is_public: boolean
  created_at: string
}

export type PLRequest = {
  id: string
  partner_id: string | null
  message: string
  status: string
  admin_notes: string | null
  created_at: string
  mxb_partners?: { full_name: string; company: string | null } | null
}

const EDITIONS = [
  { id: 'ai-technology', label: 'AI & Technology' },
  { id: 'beauty-aesthetics-longevity', label: 'Beauty, Aesthetics & Longevity' },
  { id: 'brands-marketing-growth', label: 'Brands, Marketing & Growth' },
  { id: 'entertainment-media-culture', label: 'Entertainment, Media & Culture' },
  { id: 'human-impact-leadership', label: 'Human Impact & Leadership' },
  { id: 'influencers-creators', label: 'Influencers & Creators' },
  { id: 'celebrities-cultural-icons', label: 'Celebrities & Cultural Icons' },
  { id: 'business-entrepreneurship', label: 'Business & Entrepreneurship' },
]

const CATEGORIES = ['AI Visionaries', 'Mentors & Speakers', 'Creators & Influencers', 'Celebrities & Cultural Icons']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface Props {
  entries: PLEntry[]
  requests: PLRequest[]
}

export default function PowerListTab({ entries: initEntries, requests: initRequests }: Props) {
  const supabase = createClient()
  const [entries, setEntries] = useState(initEntries)
  const [requests, setRequests] = useState(initRequests)
  const [view, setView] = useState<'entries' | 'requests'>('entries')
  const [editing, setEditing] = useState<PLEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterEdition, setFilterEdition] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  // form fields
  const [fName, setFName] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fCategory, setFCategory] = useState('')
  const [fEdition, setFEdition] = useState('')
  const [fListName, setFListName] = useState('')
  const [fYear, setFYear] = useState('2027')
  const [fRank, setFRank] = useState('')
  const [fRole, setFRole] = useState('')
  const [fCountry, setFCountry] = useState('')
  const [fShortBio, setFShortBio] = useState('')
  const [fFullBio, setFFullBio] = useState('')
  const [fReason, setFReason] = useState('')
  const [fExpertise, setFExpertise] = useState('')
  const [fYoutube, setFYoutube] = useState('')
  const [fYoutubeTitle, setFYoutubeTitle] = useState('')
  const [fLinkedin, setFLinkedin] = useState('')
  const [fInstagram, setFInstagram] = useState('')
  const [fPhotoUrl, setFPhotoUrl] = useState('')
  const [fVerified, setFVerified] = useState(false)
  const [fMember, setFMember] = useState(false)
  const [fFeatured, setFFeatured] = useState(false)
  const [fPublic, setFPublic] = useState(false)

  function loadEntry(e: PLEntry | null) {
    setEditing(e)
    if (!e) {
      setFName(''); setFSlug(''); setFCategory(''); setFEdition(''); setFListName(''); setFYear('2027'); setFRank(''); setFRole(''); setFCountry(''); setFShortBio(''); setFFullBio(''); setFReason(''); setFExpertise(''); setFYoutube(''); setFYoutubeTitle(''); setFLinkedin(''); setFInstagram(''); setFPhotoUrl(''); setFVerified(false); setFMember(false); setFFeatured(false); setFPublic(false)
    } else {
      setFName(e.full_name); setFSlug(e.slug); setFCategory(e.category ?? ''); setFEdition(e.edition_category ?? ''); setFListName(e.power_list_name ?? ''); setFYear(String(e.year ?? 2027)); setFRank(String(e.rank ?? '')); setFRole(e.role ?? ''); setFCountry(e.country ?? ''); setFShortBio(e.short_bio ?? ''); setFFullBio(e.full_bio ?? ''); setFReason(e.selection_reason ?? ''); setFExpertise((e.expertise ?? []).join(', ')); setFYoutube(e.youtube_url ?? ''); setFYoutubeTitle(e.youtube_title ?? ''); setFLinkedin(e.linkedin_url ?? ''); setFInstagram(e.instagram_url ?? ''); setFPhotoUrl(e.photo_url ?? ''); setFVerified(e.is_verified); setFMember(e.is_member); setFFeatured(e.is_featured); setFPublic(e.is_public)
    }
  }

  async function saveEntry() {
    if (!fName.trim()) { alert('Name required'); return }
    const slug = fSlug.trim() || slugify(fName)
    setSaving(true)
    const payload = {
      full_name: fName.trim(),
      slug,
      category: fCategory || null,
      edition_category: fEdition || null,
      power_list_name: fListName || null,
      year: parseInt(fYear) || 2027,
      rank: fRank ? parseInt(fRank) : null,
      role: fRole || null,
      country: fCountry || null,
      short_bio: fShortBio || null,
      full_bio: fFullBio || null,
      selection_reason: fReason || null,
      expertise: fExpertise ? fExpertise.split(',').map(x => x.trim()).filter(Boolean) : [],
      youtube_url: fYoutube || null,
      youtube_title: fYoutubeTitle || null,
      linkedin_url: fLinkedin || null,
      instagram_url: fInstagram || null,
      photo_url: fPhotoUrl || null,
      is_verified: fVerified,
      is_member: fMember,
      is_featured: fFeatured,
      is_public: fPublic,
      updated_at: new Date().toISOString(),
    }
    let error
    if (editing) {
      ({ error } = await supabase.from('mxb_power_list_entries').update(payload).eq('id', editing.id))
    } else {
      ({ error } = await supabase.from('mxb_power_list_entries').insert(payload))
    }
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    const { data } = await supabase.from('mxb_power_list_entries').select('*').order('created_at', { ascending: false })
    setEntries(data ?? [])
    loadEntry(null)
    setSaving(false)
  }

  async function togglePublish(e: PLEntry) {
    await supabase.from('mxb_power_list_entries').update({ is_public: !e.is_public, updated_at: new Date().toISOString() }).eq('id', e.id)
    setEntries(prev => prev.map(p => p.id === e.id ? { ...p, is_public: !e.is_public } : p))
  }

  async function deleteEntry(e: PLEntry) {
    if (!confirm(`Delete "${e.full_name}"?`)) return
    await supabase.from('mxb_power_list_entries').delete().eq('id', e.id)
    setEntries(prev => prev.filter(p => p.id !== e.id))
    if (editing?.id === e.id) loadEntry(null)
  }

  async function updateRequestStatus(id: string, status: string, notes: string) {
    await supabase.from('mxb_power_list_requests').update({ status, admin_notes: notes }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_notes: notes } : r))
  }

  const filtered = entries.filter(e => {
    if (filterEdition && e.edition_category !== filterEdition) return false
    if (filterStatus === 'published' && !e.is_public) return false
    if (filterStatus === 'draft' && e.is_public) return false
    if (search && !JSON.stringify(e).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pending = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {(['entries', 'requests'] as const).map(t => (
          <button key={t} onClick={() => setView(t)} style={{ ...btn, background: view === t ? G : 'transparent', color: view === t ? '#0b0b0b' : G }}>
            {t === 'entries' ? `Perfiles (${entries.length})` : `Solicitudes (${pending} pendientes)`}
          </button>
        ))}
      </div>

      {view === 'entries' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' }}>
          {/* List */}
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1, minWidth: 140 }} />
              <select value={filterEdition} onChange={e => setFilterEdition(e.target.value)} style={{ ...inp, width: 'auto' }}>
                <option value="">Todas las ediciones</option>
                {EDITIONS.map(ed => <option key={ed.id} value={ed.id}>{ed.label}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 'auto' }}>
                <option value="">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Borrador</option>
              </select>
              <button style={btn} onClick={() => loadEntry(null)}>+ Nuevo perfil</button>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 10 }}>{filtered.length} perfiles</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${G}` }}>
                  {['Nombre', 'Edición', 'Lista', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: CH }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <td style={{ padding: '10px', color: '#eee' }}>
                      <div style={{ fontWeight: 600 }}>{e.full_name}</div>
                      <div style={{ fontSize: 10, opacity: .5 }}>{e.role || e.category}</div>
                    </td>
                    <td style={{ padding: '10px', fontSize: 11, opacity: .7 }}>{EDITIONS.find(ed => ed.id === e.edition_category)?.label ?? e.edition_category ?? '—'}</td>
                    <td style={{ padding: '10px', fontSize: 11, opacity: .7 }}>{e.power_list_name ?? '—'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', border: `1px solid ${e.is_public ? G : LINE}`, color: e.is_public ? G : 'rgba(255,255,255,.4)', borderRadius: 99, padding: '3px 8px' }}>
                        {e.is_public ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <button style={btn} onClick={() => loadEntry(e)}>Editar</button>
                      <button style={btn} onClick={() => togglePublish(e)}>{e.is_public ? 'Despublicar' : 'Publicar'}</button>
                      <button style={btnDanger} onClick={() => deleteEntry(e)}>✕</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', opacity: .4 }}>Sin perfiles</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Editor */}
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 20, position: 'sticky', top: 80 }}>
            <h4 style={{ color: G, marginBottom: 16, fontWeight: 300 }}>{editing ? 'Editar perfil' : 'Nuevo perfil'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Nombre completo *</label>
                <input style={inp} value={fName} onChange={e => { setFName(e.target.value); if (!editing) setFSlug(slugify(e.target.value)) }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Slug (URL)</label>
                <input style={inp} value={fSlug} onChange={e => setFSlug(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Categoría</label>
                <select style={inp} value={fCategory} onChange={e => setFCategory(e.target.value)}>
                  <option value="">—</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Edición</label>
                <select style={inp} value={fEdition} onChange={e => setFEdition(e.target.value)}>
                  <option value="">—</option>
                  {EDITIONS.map(ed => <option key={ed.id} value={ed.id}>{ed.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Nombre de lista</label>
                <input style={inp} value={fListName} onChange={e => setFListName(e.target.value)} placeholder="Ej: Top AI Leaders 2027" />
              </div>
              <div>
                <label style={lbl}>Año</label>
                <input style={inp} type="number" value={fYear} onChange={e => setFYear(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Ranking #</label>
                <input style={inp} type="number" value={fRank} onChange={e => setFRank(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Cargo / Rol</label>
                <input style={inp} value={fRole} onChange={e => setFRole(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>País</label>
                <input style={inp} value={fCountry} onChange={e => setFCountry(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Expertise (comas)</label>
                <input style={inp} value={fExpertise} onChange={e => setFExpertise(e.target.value)} placeholder="IA, liderazgo" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Foto URL</label>
                <input style={inp} value={fPhotoUrl} onChange={e => setFPhotoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Bio breve (perfil editorial)</label>
                <textarea style={{ ...inp, minHeight: 60 }} value={fShortBio} onChange={e => setFShortBio(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Motivo de selección</label>
                <textarea style={{ ...inp, minHeight: 60 }} value={fReason} onChange={e => setFReason(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Bio completa</label>
                <textarea style={{ ...inp, minHeight: 70 }} value={fFullBio} onChange={e => setFFullBio(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>YouTube URL</label>
                <input style={inp} value={fYoutube} onChange={e => setFYoutube(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Título del vídeo</label>
                <input style={inp} value={fYoutubeTitle} onChange={e => setFYoutubeTitle(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>LinkedIn</label>
                <input style={inp} value={fLinkedin} onChange={e => setFLinkedin(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Instagram</label>
                <input style={inp} value={fInstagram} onChange={e => setFInstagram(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 20, marginTop: 4 }}>
                {[['Verificado', fVerified, setFVerified], ['Miembro', fMember, setFMember], ['Destacado', fFeatured, setFFeatured], ['Publicado', fPublic, setFPublic]].map(([label, val, setter]) => (
                  <label key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: CH, cursor: 'pointer' }}>
                    <input type="checkbox" checked={val as boolean} onChange={e => (setter as (v: boolean) => void)(e.target.checked)} />
                    {label as string}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ ...btn, background: G, color: '#0b0b0b', opacity: saving ? .5 : 1 }} disabled={saving} onClick={saveEntry}>
                {saving ? 'Guardando...' : '✓ Guardar perfil'}
              </button>
              {editing && <button style={btnDanger} onClick={() => deleteEntry(editing)}>Eliminar</button>}
              <button style={{ ...btn, color: 'rgba(255,255,255,.4)' }} onClick={() => loadEntry(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {view === 'requests' && (
        <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 20 }}>
          <h4 style={{ color: G, marginBottom: 16, fontWeight: 300 }}>Solicitudes de miembros</h4>
          {requests.length === 0 && <p style={{ opacity: .4 }}>Sin solicitudes</p>}
          {requests.map(r => (
            <RequestCard key={r.id} r={r} onUpdate={updateRequestStatus} />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ r, onUpdate }: { r: PLRequest; onUpdate: (id: string, status: string, notes: string) => void }) {
  const [notes, setNotes] = useState(r.admin_notes ?? '')
  const [saving, setSaving] = useState(false)
  const G = '#D4AF37'
  const LINE = '#2c2c2c'
  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: 'Georgia,serif', boxSizing: 'border-box' }
  const btn: React.CSSProperties = { background: 'transparent', border: `1px solid ${G}`, color: G, borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', marginRight: 6 }

  async function act(status: string) {
    setSaving(true)
    await onUpdate(r.id, status, notes)
    setSaving(false)
  }

  const statusColor = r.status === 'approved' ? '#27ae60' : r.status === 'rejected' ? '#c0392b' : G

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600, color: '#eee', marginBottom: 3 }}>{r.mxb_partners?.full_name ?? 'Partner'}</div>
          <div style={{ fontSize: 11, opacity: .5 }}>{r.mxb_partners?.company ?? ''} · {new Date(r.created_at).toLocaleDateString()}</div>
        </div>
        <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', border: `1px solid ${statusColor}`, color: statusColor, borderRadius: 99, padding: '3px 8px' }}>{r.status}</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, opacity: .8, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{r.message}</p>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#E8D5C4', marginBottom: 6 }}>Notas internas</label>
        <textarea style={{ ...inp, minHeight: 50 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas del equipo..." />
      </div>
      <div>
        <button style={{ ...btn, background: '#27ae60', border: 'none', color: '#fff', opacity: saving ? .5 : 1 }} disabled={saving} onClick={() => act('approved')}>✓ Aprobar</button>
        <button style={{ ...btn, background: '#c0392b', border: 'none', color: '#fff', opacity: saving ? .5 : 1 }} disabled={saving} onClick={() => act('rejected')}>✕ Rechazar</button>
        <button style={{ ...btn, opacity: saving ? .5 : 1 }} disabled={saving} onClick={() => act('pending')}>Pendiente</button>
      </div>
    </div>
  )
}
