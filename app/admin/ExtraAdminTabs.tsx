/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// â”€â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BG = '#0B0B0B'
const PANEL = '#161616'
const G = '#D4AF37'
const CH = '#E8D5C4'
const LINE = '#2c2c2c'
const TEXT = '#ffffff'
const MUTED = '#888'

const s = {
  panel: {
    background: PANEL,
    border: `1px solid ${LINE}`,
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  } as React.CSSProperties,
  h2: {
    color: G,
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: 1,
  } as React.CSSProperties,
  h3: {
    color: CH,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  label: {
    display: 'block',
    color: MUTED,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: '#111',
    border: `1px solid ${LINE}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: TEXT,
    fontSize: 13,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  select: {
    width: '100%',
    background: '#111',
    border: `1px solid ${LINE}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: TEXT,
    fontSize: 13,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    background: '#111',
    border: `1px solid ${LINE}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: TEXT,
    fontSize: 13,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
    minHeight: 80,
    resize: 'vertical' as const,
  } as React.CSSProperties,
  btn: {
    background: G,
    color: '#000',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 13,
  } as React.CSSProperties,
  btnSm: {
    background: 'transparent',
    color: G,
    border: `1px solid ${G}`,
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12,
    marginRight: 6,
  } as React.CSSProperties,
  btnDanger: {
    background: 'transparent',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12,
    marginRight: 6,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  } as React.CSSProperties,
  th: {
    color: MUTED,
    fontWeight: 600,
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: `1px solid ${LINE}`,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  td: {
    color: TEXT,
    padding: '10px 12px',
    borderBottom: `1px solid ${LINE}`,
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,
  statCard: {
    background: '#111',
    border: `1px solid ${LINE}`,
    borderRadius: 8,
    padding: '16px 20px',
    minWidth: 120,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  statNum: {
    color: G,
    fontSize: 28,
    fontWeight: 700,
  } as React.CSSProperties,
  statLabel: {
    color: MUTED,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  msg: {
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 12,
  } as React.CSSProperties,
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  } as React.CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as React.CSSProperties,
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    approved: { bg: '#1a3a1a', color: '#4caf50', label: 'Approved' },
    pending_access: { bg: '#2a1a00', color: G, label: 'Pending Access' },
    pending_profile: { bg: '#1a1a2a', color: '#6699ff', label: 'Pending Profile' },
    rejected: { bg: '#2a0a0a', color: '#e74c3c', label: 'Rejected' },
    active: { bg: '#1a3a1a', color: '#4caf50', label: 'Active' },
    inactive: { bg: '#2a2a2a', color: MUTED, label: 'Inactive' },
    published: { bg: '#1a3a1a', color: '#4caf50', label: 'Published' },
    draft: { bg: '#2a2a2a', color: MUTED, label: 'Draft' },
    pending: { bg: '#2a1a00', color: G, label: 'Pending' },
  }
  const c = map[status] ?? { bg: '#2a2a2a', color: MUTED, label: status }
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
      {c.label}
    </span>
  )
}

function SuccessMsg({ msg }: { msg: string }) {
  return <div style={{ ...s.msg, background: '#1a3a1a', color: '#4caf50' }}>{msg}</div>
}
function ErrorMsg({ msg }: { msg: string }) {
  return <div style={{ ...s.msg, background: '#2a0a0a', color: '#e74c3c' }}>{msg}</div>
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Institution = {
  id: string
  name: string
  type: string
  country: string
  website: string
  contact_name: string
  contact_email: string
  contact_phone: string
  description: string
  logo_url: string
  status: 'pending_access' | 'pending_profile' | 'approved' | 'rejected'
  created_at: string
}

type Partner = {
  id: string
  full_name: string
  company: string
}

type TheQuestion = {
  id: string
  question: string
  intro: string
  topic: string
  is_active: boolean
  created_at: string
}

type QuestionAnswer = {
  id: string
  question_id: string
  partner_id: string
  answer: string
  created_at: string
  partner?: { full_name: string; company: string }
}

type OfficialContent = {
  id: string
  title: string
  body: string
  image_url: string
  cta_link: string
  is_active: boolean
  created_at: string
}

type Opportunity = {
  id: string
  title: string
  description: string
  type: string
  image_url: string
  cta_link: string
  is_active: boolean
  sort_order: number
  created_at: string
}

type PremiumExperience = {
  id: string
  name: string
  description: string
  available: boolean
  seats_available: number
  price_one: number
  price_companion: number
  checkout_url: string
  price_red_carpet: number
  price_vip: number
  image_url: string
  sort_order: number
  created_at: string
}

type AcademyItem = {
  id: string
  name: string
  role: string
  photo_url: string
  contribution_type: 'video' | 'written'
  youtube_url: string
  written_text: string
  is_featured_guest: boolean
  is_published: boolean
  sort_order: number
  created_at: string
}

type PDFDoc = {
  id: string
  slug: string
  title: string
  summary: string
  pdf_url: string
  is_active: boolean
  sort_order: number
  created_at: string
}

type PowerListRequest = {
  id: string
  partner_id: string
  message: string
  status: string
  admin_notes: string
  created_at: string
  partner?: { full_name: string; company: string }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 1. InstitutionsTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function InstitutionsTab() {
  const supabase = createClient()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'Festival', country: '', contact_name: '',
    contact_email: '', website: '', description: '',
  })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('mxb_institutions').select('*').order('created_at', { ascending: false })
    setInstitutions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: Institution['status']) => {
    const { error } = await supabase.from('mxb_institutions').update({ status }).eq('id', id)
    if (error) setMsg({ type: 'err', text: error.message })
    else { setMsg({ type: 'ok', text: 'Status updated' }); load() }
  }

  const addInstitution = async () => {
    if (!form.name) return
    const { error } = await supabase.from('mxb_institutions').insert({
      ...form, status: 'pending_access',
    })
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Institution added' })
      setForm({ name: '', type: 'Festival', country: '', contact_name: '', contact_email: '', website: '', description: '' })
      load()
    }
  }

  const stats = {
    total: institutions.length,
    pending_access: institutions.filter(i => i.status === 'pending_access').length,
    pending_profile: institutions.filter(i => i.status === 'pending_profile').length,
    approved: institutions.filter(i => i.status === 'approved').length,
  }

  return (
    <div style={{ color: TEXT }}>
      <div style={s.statsRow}>
        {[['Total', stats.total], ['Pending Access', stats.pending_access], ['Pending Profile', stats.pending_profile], ['Approved', stats.approved]].map(([label, num]) => (
          <div key={label} style={s.statCard}>
            <div style={s.statNum}>{num}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>Institutions</div>
        {loading ? (
          <div style={{ color: MUTED }}>Loading...</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Name', 'Type', 'Country', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => (
                <tr key={inst.id}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{inst.name}</div>
                    {inst.website && <div style={{ color: MUTED, fontSize: 11 }}>{inst.website}</div>}
                  </td>
                  <td style={s.td}>{inst.type}</td>
                  <td style={s.td}>{inst.country}</td>
                  <td style={s.td}>
                    <div>{inst.contact_name}</div>
                    <div style={{ color: MUTED, fontSize: 11 }}>{inst.contact_email}</div>
                  </td>
                  <td style={s.td}>{statusBadge(inst.status)}</td>
                  <td style={s.td}>
                    {inst.status !== 'approved' && (
                      <button style={s.btnSm} onClick={() => updateStatus(inst.id, 'approved')}>Approve</button>
                    )}
                    {inst.status !== 'rejected' && (
                      <button style={s.btnDanger} onClick={() => updateStatus(inst.id, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Add Institution</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Name *</label>
            <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Type</label>
            <select style={s.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Festival', 'ComisiÃ³n de Cine', 'PR Agency', 'Talent Agency', 'Influencer Agency'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={s.label}>Country</label>
            <input style={s.input} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Contact Name</label>
            <input style={s.input} value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Contact Email</label>
            <input style={s.input} value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Website</label>
            <input style={s.input} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
        </div>
        <label style={s.label}>Description</label>
        <textarea style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <button style={s.btn} onClick={addInstitution}>Add Institution</button>
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2. CommunicationsTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function CommunicationsTab() {
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [recipientMode, setRecipientMode] = useState<'all' | 'cannes' | 'berlinale' | 'manual'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('mxb_partners').select('id, full_name, company').order('full_name').then(({ data }) => {
      setPartners(data ?? [])
    })
  }, [])

  const getTargetPartners = () => {
    if (recipientMode === 'all') return partners.map(p => p.id)
    if (recipientMode === 'manual') return selectedIds
    // cannes / berlinale â€” filter by company keyword as heuristic
    return partners
      .filter(p => p.company?.toLowerCase().includes(recipientMode))
      .map(p => p.id)
  }

  const send = async () => {
    const ids = getTargetPartners()
    if (!ids.length || !subject || !body) { setErr('Select recipients and fill subject/body'); return }
    setSending(true)
    setErr(null)
    const rows = ids.map(partner_id => ({ partner_id, subject, body, sender: 'admin', read: false }))
    const { error } = await supabase.from('mxb_messages').insert(rows)
    if (error) { setErr(error.message); setSending(false); return }
    setSentCount(ids.length)
    setSubject('')
    setBody('')
    setSending(false)
  }

  const toggleId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div style={{ color: TEXT }}>
      {sentCount !== null && <SuccessMsg msg={`Message sent to ${sentCount} partner(s).`} />}
      {err && <ErrorMsg msg={err} />}

      <div style={s.panel}>
        <div style={s.h2}>Select Recipients</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' as const }}>
          {(['all', 'cannes', 'berlinale', 'manual'] as const).map(mode => (
            <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: recipientMode === mode ? G : TEXT }}>
              <input type="radio" checked={recipientMode === mode} onChange={() => setRecipientMode(mode)} />
              <span style={{ textTransform: 'capitalize', fontSize: 14 }}>{mode === 'all' ? 'All Partners' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </label>
          ))}
        </div>

        {recipientMode === 'manual' && (
          <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid ${LINE}`, borderRadius: 6, padding: 12 }}>
            {partners.map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleId(p.id)} />
                <span style={{ fontSize: 13 }}>{p.full_name}</span>
                {p.company && <span style={{ color: MUTED, fontSize: 12 }}>â€” {p.company}</span>}
              </label>
            ))}
          </div>
        )}

        <div style={{ color: MUTED, fontSize: 12, marginTop: 8 }}>
          {getTargetPartners().length} recipient(s) selected
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Write Message</div>
        <label style={s.label}>Subject</label>
        <input style={s.input} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" />
        <label style={s.label}>Body</label>
        <textarea style={{ ...s.textarea, minHeight: 140 }} value={body} onChange={e => setBody(e.target.value)} placeholder="Message body..." />
        <button style={s.btn} onClick={send} disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3. LaPreguntaTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function LaPreguntaTab() {
  const supabase = createClient()
  const [questions, setQuestions] = useState<TheQuestion[]>([])
  const [answers, setAnswers] = useState<QuestionAnswer[]>([])
  const [form, setForm] = useState({ question: '', intro: '', topic: 'IA & Futuro' })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const [qRes, aRes] = await Promise.all([
      supabase.from('mxb_the_question').select('*').order('created_at', { ascending: false }),
      supabase.from('mxb_question_answers').select('*, partner:mxb_partners(full_name, company)').order('created_at', { ascending: false }),
    ])
    setQuestions(qRes.data ?? [])
    setAnswers(aRes.data ?? [])
  }

  useEffect(() => { load() }, [])

  const activeQ = questions.find(q => q.is_active)

  const toggleActive = async (q: TheQuestion) => {
    if (q.is_active) {
      await supabase.from('mxb_the_question').update({ is_active: false }).eq('id', q.id)
    } else {
      await supabase.from('mxb_the_question').update({ is_active: false }).neq('id', q.id)
      await supabase.from('mxb_the_question').update({ is_active: true }).eq('id', q.id)
    }
    load()
  }

  const createQuestion = async () => {
    if (!form.question) return
    const { error } = await supabase.from('mxb_the_question').insert({ ...form, is_active: false })
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Question created' })
      setForm({ question: '', intro: '', topic: 'IA & Futuro' })
      load()
    }
  }

  const deleteQuestion = async (id: string) => {
    await supabase.from('mxb_the_question').delete().eq('id', id)
    load()
  }

  const activeAnswers = activeQ ? answers.filter(a => a.question_id === activeQ.id) : []

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>Active Question</div>
        {activeQ ? (
          <div>
            <div style={{ fontSize: 16, color: CH, marginBottom: 8, fontStyle: 'italic' }}>&ldquo;{activeQ.question}&rdquo;</div>
            <div style={{ color: MUTED, fontSize: 12, marginBottom: 12 }}>Topic: {activeQ.topic}</div>
            <button style={s.btnDanger} onClick={() => toggleActive(activeQ)}>Deactivate</button>
          </div>
        ) : (
          <div style={{ color: MUTED }}>No active question. Activate one from the list below.</div>
        )}
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Create Question</div>
        <label style={s.label}>Question *</label>
        <input style={s.input} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Â¿..." />
        <label style={s.label}>Intro (optional)</label>
        <textarea style={s.textarea} value={form.intro} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))} />
        <label style={s.label}>Topic</label>
        <select style={s.select} value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
          {['IA & Futuro', 'Marcas & Negocio', 'Cine & Storytelling', 'Sin tema'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button style={s.btn} onClick={createQuestion}>Create Question</button>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>All Questions</div>
        {questions.map(q => (
          <div key={q.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '12px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ color: q.is_active ? G : TEXT, fontSize: 14 }}>{q.question}</div>
              <div style={{ color: MUTED, fontSize: 11 }}>{q.topic} Â· {new Date(q.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={s.btnSm} onClick={() => toggleActive(q)}>
                {q.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button style={s.btnDanger} onClick={() => deleteQuestion(q.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {activeQ && (
        <div style={s.panel}>
          <div style={s.h2}>Answers ({activeAnswers.length})</div>
          {activeAnswers.length === 0 ? (
            <div style={{ color: MUTED }}>No answers yet.</div>
          ) : (
            activeAnswers.map(a => (
              <div key={a.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '12px 0' }}>
                <div style={{ color: G, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {a.partner?.full_name ?? 'Unknown'} {a.partner?.company ? `â€” ${a.partner.company}` : ''}
                </div>
                <div style={{ color: CH, fontSize: 14 }}>{a.answer}</div>
                <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 4. OfficialContentTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function OfficialContentTab() {
  const supabase = createClient()
  const [items, setItems] = useState<OfficialContent[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', body: '', image_url: '', cta_link: '' })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const { data } = await supabase.from('mxb_official_content').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title) return
    let error
    if (editId) {
      ({ error } = await supabase.from('mxb_official_content').update(form).eq('id', editId))
    } else {
      ({ error } = await supabase.from('mxb_official_content').insert({ ...form, is_active: false }))
    }
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: editId ? 'Updated' : 'Published' })
      setForm({ title: '', body: '', image_url: '', cta_link: '' })
      setEditId(null)
      load()
    }
  }

  const toggleActive = async (item: OfficialContent) => {
    await supabase.from('mxb_official_content').update({ is_active: !item.is_active }).eq('id', item.id)
    load()
  }

  const deleteItem = async (id: string) => {
    await supabase.from('mxb_official_content').delete().eq('id', id)
    load()
  }

  const startEdit = (item: OfficialContent) => {
    setEditId(item.id)
    setForm({ title: item.title, body: item.body, image_url: item.image_url, cta_link: item.cta_link })
  }

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>{editId ? 'Edit Content' : 'Publish Content'}</div>
        <label style={s.label}>Title *</label>
        <input style={s.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <label style={s.label}>Body</label>
        <textarea style={{ ...s.textarea, minHeight: 100 }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Image URL</label>
            <input style={s.input} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>CTA Link (optional)</label>
            <input style={s.input} value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={save}>{editId ? 'Save Changes' : 'Publish'}</button>
          {editId && (
            <button style={s.btnSm} onClick={() => { setEditId(null); setForm({ title: '', body: '', image_url: '', cta_link: '' }) }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Content Items</div>
        {items.map(item => (
          <div key={item.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: CH, marginBottom: 4 }}>{item.title}</div>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 6 }}>{item.body?.slice(0, 80)}{item.body?.length > 80 ? '...' : ''}</div>
              {statusBadge(item.is_active ? 'active' : 'inactive')}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={s.btnSm} onClick={() => startEdit(item)}>Edit</button>
              <button style={s.btnSm} onClick={() => toggleActive(item)}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button style={s.btnDanger} onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 5. OpportunitiesTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function OpportunitiesTab() {
  const supabase = createClient()
  const [items, setItems] = useState<Opportunity[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', type: 'Partnership',
    image_url: '', cta_link: '', sort_order: 0,
  })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const { data } = await supabase.from('mxb_opportunities').select('*').order('sort_order')
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title) return
    let error
    if (editId) {
      ({ error } = await supabase.from('mxb_opportunities').update(form).eq('id', editId))
    } else {
      ({ error } = await supabase.from('mxb_opportunities').insert({ ...form, is_active: true }))
    }
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Saved' })
      setForm({ title: '', description: '', type: 'Partnership', image_url: '', cta_link: '', sort_order: 0 })
      setEditId(null)
      load()
    }
  }

  const toggleActive = async (item: Opportunity) => {
    await supabase.from('mxb_opportunities').update({ is_active: !item.is_active }).eq('id', item.id)
    load()
  }

  const deleteItem = async (id: string) => {
    await supabase.from('mxb_opportunities').delete().eq('id', id)
    load()
  }

  const startEdit = (item: Opportunity) => {
    setEditId(item.id)
    setForm({ title: item.title, description: item.description, type: item.type, image_url: item.image_url, cta_link: item.cta_link, sort_order: item.sort_order })
  }

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>{editId ? 'Edit Opportunity' : 'Add Opportunity'}</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Title *</label>
            <input style={s.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Type</label>
            <select style={s.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Partnership', 'Media', 'Event', 'Funding', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={s.label}>Image URL</label>
            <input style={s.input} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>CTA Link</label>
            <input style={s.input} value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Sort Order</label>
            <input style={s.input} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
        <label style={s.label}>Description</label>
        <textarea style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={save}>{editId ? 'Save Changes' : 'Add Opportunity'}</button>
          {editId && (
            <button style={s.btnSm} onClick={() => { setEditId(null); setForm({ title: '', description: '', type: 'Partnership', image_url: '', cta_link: '', sort_order: 0 }) }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Opportunities (sorted by order)</div>
        {items.map(item => (
          <div key={item.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: MUTED, fontSize: 12, minWidth: 24 }}>#{item.sort_order}</span>
                <span style={{ fontWeight: 600, color: CH }}>{item.title}</span>
                <span style={{ color: MUTED, fontSize: 12 }}>{item.type}</span>
                {statusBadge(item.is_active ? 'active' : 'inactive')}
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>{item.description?.slice(0, 80)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={s.btnSm} onClick={() => startEdit(item)}>Edit</button>
              <button style={s.btnSm} onClick={() => toggleActive(item)}>
                {item.is_active ? 'Hide' : 'Show'}
              </button>
              <button style={s.btnDanger} onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 6. PremiumExperiencesTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function PremiumExperiencesTab() {
  const supabase = createClient()
  const [items, setItems] = useState<PremiumExperience[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const blankForm = {
    name: '', description: '', available: true, seats_available: 0,
    price_one: 0, price_companion: 0, checkout_url: '',
    price_red_carpet: 0, price_vip: 0, image_url: '', sort_order: 0,
  }
  const [form, setForm] = useState(blankForm)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const { data } = await supabase.from('mxb_premium_experiences').select('*').order('sort_order')
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name) return
    let error
    if (editId) {
      ({ error } = await supabase.from('mxb_premium_experiences').update(form).eq('id', editId))
    } else {
      ({ error } = await supabase.from('mxb_premium_experiences').insert(form))
    }
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Saved' })
      setForm(blankForm)
      setEditId(null)
      load()
    }
  }

  const startEdit = (item: PremiumExperience) => {
    setEditId(item.id)
    setForm({
      name: item.name, description: item.description, available: item.available,
      seats_available: item.seats_available, price_one: item.price_one,
      price_companion: item.price_companion, checkout_url: item.checkout_url,
      price_red_carpet: item.price_red_carpet, price_vip: item.price_vip,
      image_url: item.image_url, sort_order: item.sort_order,
    })
  }

  const numInput = (field: keyof typeof blankForm, label: string) => (
    <div>
      <label style={s.label}>{label}</label>
      <input style={s.input} type="number" value={String(form[field])} onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))} />
    </div>
  )

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>{editId ? 'Edit Experience' : 'Add Experience'}</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Name *</label>
            <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Image URL</label>
            <input style={s.input} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Checkout URL</label>
            <input style={s.input} value={form.checkout_url} onChange={e => setForm(f => ({ ...f, checkout_url: e.target.value }))} />
          </div>
          {numInput('seats_available', 'Seats Available')}
          {numInput('price_one', 'Price (Solo) â‚¬')}
          {numInput('price_companion', 'Price (+ Companion) â‚¬')}
          {numInput('price_red_carpet', 'Price Red Carpet â‚¬')}
          {numInput('price_vip', 'Price VIP â‚¬')}
          {numInput('sort_order', 'Sort Order')}
        </div>
        <label style={s.label}>Description</label>
        <textarea style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div style={s.toggle}>
          <input type="checkbox" id="exp-avail" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
          <label htmlFor="exp-avail" style={{ color: TEXT, fontSize: 14, cursor: 'pointer' }}>Available</label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={save}>{editId ? 'Save Changes' : 'Add Experience'}</button>
          {editId && <button style={s.btnSm} onClick={() => { setEditId(null); setForm(blankForm) }}>Cancel</button>}
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Experiences</div>
        {items.map(item => (
          <div key={item.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: CH }}>{item.name}</span>
                {statusBadge(item.available ? 'active' : 'inactive')}
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>
                Solo: â‚¬{item.price_one} Â· +Companion: â‚¬{item.price_companion} Â· VIP: â‚¬{item.price_vip}
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>Seats: {item.seats_available}</div>
            </div>
            <button style={s.btnSm} onClick={() => startEdit(item)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 7. AcademyTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function AcademyTab() {
  const supabase = createClient()
  const [items, setItems] = useState<AcademyItem[]>([])
  const blankForm = {
    name: '', role: '', photo_url: '', contribution_type: 'video' as 'video' | 'written',
    youtube_url: '', written_text: '', sort_order: 0,
  }
  const [form, setForm] = useState(blankForm)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const { data } = await supabase.from('mxb_academy_items').select('*').order('sort_order')
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const featuredGuest = items.find(i => i.is_featured_guest)

  const inviteGuest = async () => {
    if (!form.name) return
    // Unset previous featured guest
    await supabase.from('mxb_academy_items').update({ is_featured_guest: false }).eq('is_featured_guest', true)
    const { error } = await supabase.from('mxb_academy_items').insert({
      ...form, is_featured_guest: true, is_published: false,
    })
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Featured guest set' })
      setForm(blankForm)
      load()
    }
  }

  const addItem = async () => {
    if (!form.name) return
    const { error } = await supabase.from('mxb_academy_items').insert({
      ...form, is_featured_guest: false, is_published: false,
    })
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Item added' })
      setForm(blankForm)
      load()
    }
  }

  const togglePublished = async (item: AcademyItem) => {
    await supabase.from('mxb_academy_items').update({ is_published: !item.is_published }).eq('id', item.id)
    load()
  }

  const deleteItem = async (id: string) => {
    await supabase.from('mxb_academy_items').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>Featured Guest</div>
        {featuredGuest ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {featuredGuest.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredGuest.photo_url} alt={featuredGuest.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${G}` }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: G, fontSize: 16 }}>{featuredGuest.name}</div>
              <div style={{ color: MUTED, fontSize: 13 }}>{featuredGuest.role}</div>
              <div style={{ color: MUTED, fontSize: 12 }}>{featuredGuest.contribution_type}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: MUTED }}>No featured guest set.</div>
        )}
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Invite / Add Academy Member</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Name *</label>
            <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Role</label>
            <input style={s.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Photo URL</label>
            <input style={s.input} value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Sort Order</label>
            <input style={s.input} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Contribution Type</label>
          <div style={{ display: 'flex', gap: 20 }}>
            {(['video', 'written'] as const).map(ct => (
              <label key={ct} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: form.contribution_type === ct ? G : TEXT }}>
                <input type="radio" checked={form.contribution_type === ct} onChange={() => setForm(f => ({ ...f, contribution_type: ct }))} />
                <span style={{ textTransform: 'capitalize' }}>{ct}</span>
              </label>
            ))}
          </div>
        </div>
        {form.contribution_type === 'video' ? (
          <>
            <label style={s.label}>YouTube URL</label>
            <input style={s.input} value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} />
          </>
        ) : (
          <>
            <label style={s.label}>Written Text</label>
            <textarea style={s.textarea} value={form.written_text} onChange={e => setForm(f => ({ ...f, written_text: e.target.value }))} />
          </>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={inviteGuest}>Set as Featured Guest</button>
          <button style={{ ...s.btnSm, padding: '8px 18px' }} onClick={addItem}>Add to Catalog</button>
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Catalog ({items.length})</div>
        {items.map(item => (
          <div key={item.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, color: item.is_featured_guest ? G : CH }}>{item.name}</span>
                  {item.is_featured_guest && <span style={{ background: '#2a1a00', color: G, fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>FEATURED</span>}
                  {statusBadge(item.is_published ? 'published' : 'draft')}
                </div>
                <div style={{ color: MUTED, fontSize: 12 }}>{item.role} Â· {item.contribution_type}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={s.btnSm} onClick={() => togglePublished(item)}>
                {item.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button style={s.btnDanger} onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 8. PDFDocsTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function PDFDocsTab() {
  const supabase = createClient()
  const [docs, setDocs] = useState<PDFDoc[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const blankForm = { slug: '', title: '', summary: '', pdf_url: '', sort_order: 0 }
  const [form, setForm] = useState(blankForm)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    const { data } = await supabase.from('mxb_pdf_docs').select('*').order('sort_order')
    setDocs(data ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title || !form.slug) return
    let error
    if (editId) {
      ({ error } = await supabase.from('mxb_pdf_docs').update(form).eq('id', editId))
    } else {
      ({ error } = await supabase.from('mxb_pdf_docs').insert({ ...form, is_active: false }))
    }
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Saved' })
      setForm(blankForm)
      setEditId(null)
      load()
    }
  }

  const toggleActive = async (doc: PDFDoc) => {
    await supabase.from('mxb_pdf_docs').update({ is_active: !doc.is_active }).eq('id', doc.id)
    load()
  }

  const deleteDoc = async (id: string) => {
    await supabase.from('mxb_pdf_docs').delete().eq('id', id)
    load()
  }

  const startEdit = (doc: PDFDoc) => {
    setEditId(doc.id)
    setForm({ slug: doc.slug, title: doc.title, summary: doc.summary, pdf_url: doc.pdf_url, sort_order: doc.sort_order })
  }

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>{editId ? 'Edit Document' : 'Add Document'}</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Slug * (no spaces)</label>
            <input style={s.input} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))} placeholder="e.g. media-kit-2025" />
          </div>
          <div>
            <label style={s.label}>Title *</label>
            <input style={s.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>PDF URL</label>
            <input style={s.input} value={form.pdf_url} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))} />
          </div>
          <div>
            <label style={s.label}>Sort Order</label>
            <input style={s.input} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
        <label style={s.label}>Summary</label>
        <textarea style={s.textarea} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={save}>{editId ? 'Save Changes' : 'Add Document'}</button>
          {editId && <button style={s.btnSm} onClick={() => { setEditId(null); setForm(blankForm) }}>Cancel</button>}
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Documents</div>
        {docs.map(doc => (
          <div key={doc.id} style={{ borderBottom: `1px solid ${LINE}`, padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: CH }}>{doc.title}</span>
                <span style={{ color: MUTED, fontSize: 11 }}>/{doc.slug}</span>
                {statusBadge(doc.is_active ? 'active' : 'inactive')}
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>{doc.summary?.slice(0, 80)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={s.btnSm} onClick={() => startEdit(doc)}>Edit</button>
              <button style={s.btnSm} onClick={() => toggleActive(doc)}>
                {doc.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button style={s.btnDanger} onClick={() => deleteDoc(doc.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 9. FOVAdminTab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function FOVAdminTab() {
  const supabase = createClient()
  const [requests, setRequests] = useState<PowerListRequest[]>([])
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    supabase
      .from('mxb_power_list_requests')
      .select('*, partner:mxb_partners(full_name, company)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRequests(data ?? []))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('mxb_power_list_requests').update({ status }).eq('id', id)
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Updated' })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  return (
    <div style={{ color: TEXT }}>
      <div style={{ ...s.panel, borderLeft: `3px solid ${G}` }}>
        <div style={s.h2}>Future of Voices â€” Admin externo</div>
        <p style={{ color: CH, fontSize: 14, marginBottom: 16 }}>
          Las solicitudes FOV se gestionan en el panel de administraciÃ³n de futureofvoices.org
        </p>
        <a
          href="https://futureofvoices.org/admin"
          target="_blank"
          rel="noreferrer"
          style={{ color: G, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: `1px solid ${G}`, borderRadius: 6, padding: '8px 16px', display: 'inline-block' }}
        >
          Abrir panel FOV â†’
        </a>
        <div style={{ marginTop: 20, display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>
          {[
            ['Plataforma', 'futureofvoices.org'],
            ['TecnologÃ­a', 'HTML + Supabase + Vercel'],
            ['GestiÃ³n', 'Panel admin independiente'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: MUTED, fontSize: 11, textTransform: 'uppercase' as const }}>{k}</div>
              <div style={{ color: TEXT, fontSize: 13 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>Power List Requests</div>
        {requests.length === 0 ? (
          <div style={{ color: MUTED }}>No requests.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Partner', 'Message', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={s.td}>
                    <div>{r.partner?.full_name ?? r.partner_id}</div>
                    {r.partner?.company && <div style={{ color: MUTED, fontSize: 11 }}>{r.partner.company}</div>}
                  </td>
                  <td style={{ ...s.td, maxWidth: 200 }}>
                    <div style={{ color: MUTED, fontSize: 12 }}>{r.message?.slice(0, 80)}</div>
                  </td>
                  <td style={s.td}>{statusBadge(r.status)}</td>
                  <td style={s.td}><span style={{ color: MUTED, fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString()}</span></td>
                  <td style={s.td}>
                    {r.status !== 'approved' && (
                      <button style={s.btnSm} onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                    )}
                    {r.status !== 'rejected' && (
                      <button style={s.btnDanger} onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── CommunityTab ────────────────────────────────────────────────────────────

export function CommunityTab() {
  const supabase = createClient()
  const [partnerCount, setPartnerCount] = useState<number | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({
    community_members_visible: 'false',
    community_insights_visible: 'false',
    community_opportunities_visible: 'false',
  })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const keys = ['community_members_visible', 'community_insights_visible', 'community_opportunities_visible']
      const [configRes, countRes] = await Promise.all([
        supabase.from('mxb_config').select('key, value').in('key', keys),
        supabase.from('mxb_partners').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ])
      const map: Record<string, string> = {}
      configRes.data?.forEach((r: { key: string; value: string }) => { map[r.key] = r.value })
      setConfig(map)
      setPartnerCount(countRes.count ?? 0)
    }
    load()
  }, [supabase])

  const toggle = async (key: string) => {
    const newVal = config[key] === 'true' ? 'false' : 'true'
    const { error } = await supabase.from('mxb_config').upsert({ key, value: newVal }, { onConflict: 'key' })
    if (error) setMsg({ type: 'err', text: error.message })
    else { setConfig(prev => ({ ...prev, [key]: newVal })); setMsg({ type: 'ok', text: 'Guardado' }) }
  }

  const keys = [
    { key: 'community_members_visible', label: 'Miembros visibles en comunidad' },
    { key: 'community_insights_visible', label: 'Insights visibles en comunidad' },
    { key: 'community_opportunities_visible', label: 'Oportunidades visibles en comunidad' },
  ]

  return (
    <div style={{ color: TEXT }}>
      {msg && (msg.type === 'ok' ? <SuccessMsg msg={msg.text} /> : <ErrorMsg msg={msg.text} />)}

      <div style={s.panel}>
        <div style={s.h2}>Community Visibility</div>
        {keys.map(({ key, label }) => {
          const on = config[key] === 'true'
          return (
            <div key={key} style={{ ...s.toggle, borderBottom: `1px solid ${LINE}`, paddingBottom: 14, marginBottom: 14 }}>
              <button onClick={() => toggle(key)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                background: on ? G : '#333', cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                }} />
              </button>
              <div>
                <div style={{ color: TEXT, fontSize: 14 }}>{label}</div>
                <div style={{ color: MUTED, fontSize: 11 }}>{on ? 'Visible' : 'Oculto'} · key: {key}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={s.panel}>
        <div style={s.h2}>Community Overview</div>
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>{partnerCount ?? '—'}</div>
            <div style={s.statLabel}>Total Partners</div>
          </div>
          <div style={{ ...s.statCard, flex: 1, textAlign: 'left' as const }}>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>
              <div>Community section aggregates partners registered in <span style={{ color: CH }}>mxb_partners</span>.</div>
              <div style={{ marginTop: 4 }}>Visibility toggles above control what sections appear in the partner-facing portal community page.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SelMembersTab ────────────────────────────────────────────────────────────

type SelMember = {
  id: string
  contact_name: string
  surname: string | null
  email: string
  phone: string | null
  categories: string[] | null
  country: string | null
  website: string | null
  bio_short: string | null
  bio_long: string | null
  photo_url: string | null
  paid: boolean
  approved: boolean | null
  public_profile: boolean | null
  profile_status: string | null
  synopsis: string | null
  logline: string | null
  editions: Record<string, boolean> | null
  trailer_link: string | null
  referred_by: string | null
  credits: number | null
  created_at: string
}

export function SelMembersTab() {
  const supabase = createClient()
  const [members, setMembers] = useState<SelMember[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'unpaid'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('mxb_selection_members').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMembers((data as SelMember[]) ?? []); setLoading(false) })
  }, [supabase])

  const filtered = members.filter(m => {
    if (filter === 'pending') return !m.approved
    if (filter === 'approved') return m.approved
    if (filter === 'paid') return m.paid
    if (filter === 'unpaid') return !m.paid
    return true
  })

  async function approveMember(id: string, name: string) {
    await supabase.from('mxb_selection_members').update({ approved: true, profile_status: 'approved' }).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, approved: true, profile_status: 'approved' } : m))
    setMsg(`✓ ${name} aprobado`)
    setTimeout(() => setMsg(null), 3000)
  }

  async function rejectMember(id: string) {
    await supabase.from('mxb_selection_members').update({ approved: false, profile_status: 'rejected' }).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, approved: false, profile_status: 'rejected' } : m))
  }

  async function deleteMember(id: string) {
    if (!confirm('¿Eliminar este perfil?')) return
    await supabase.from('mxb_selection_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  function exportCSV() {
    const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'País', 'Estado', 'Pagado', 'Aprobado', 'Fecha']
    const rows = members.map(m => [
      m.contact_name, m.surname ?? '', m.email, m.phone ?? '', m.country ?? '',
      m.profile_status ?? '', m.paid ? 'Sí' : 'No', m.approved ? 'Sí' : 'No',
      new Date(m.created_at).toLocaleDateString('es-ES'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sel_members.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const total = members.length
  const pending = members.filter(m => !m.approved).length
  const approved = members.filter(m => m.approved).length
  const paid = members.filter(m => m.paid).length

  const filterBtn = (f: typeof filter, label: string) => (
    <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', background: filter === f ? G : 'transparent', color: filter === f ? '#000' : CH, border: `1px solid ${filter === f ? G : LINE}`, borderRadius: 5, cursor: 'pointer', fontSize: 11, letterSpacing: '.1em', marginRight: 6 }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 300, fontSize: 32, color: G, margin: 0 }}>Members (CompeticiÃ³n)</h2>
          <p style={{ opacity: .55, fontSize: 14, marginTop: 6 }}>Perfiles registrados en mxb_selection_members</p>
        </div>
        <button onClick={exportCSV} style={{ ...s.btn, fontSize: 11, letterSpacing: '.1em' }}>ðŸ“¥ Exportar CSV</button>
      </div>

      {msg && <div style={{ background: '#1a3a1a', color: '#6fcf97', padding: '10px 16px', borderRadius: 6, marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[['ðŸ“', 'Total perfiles', total], ['â³', 'Pendientes aprobaciÃ³n', pending], ['âœ“', 'Aprobados', approved], ['ðŸ’°', 'Pagos completados', paid]].map(([icon, label, val]) => (
          <div key={String(label)} style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 300, color: G }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        {filterBtn('all', 'Todos')}
        {filterBtn('pending', 'Pendientes')}
        {filterBtn('approved', 'Aprobados')}
        {filterBtn('paid', 'Pagados')}
        {filterBtn('unpaid', 'No pagados')}
      </div>

      {loading ? (
        <p style={{ opacity: .5 }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ opacity: .5 }}>No hay perfiles con este filtro.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Nombre', 'Email', 'TelÃ©fono', 'CategorÃ­as', 'Estado', 'Pagado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <>
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                    <td style={s.td}>{m.contact_name} {m.surname ?? ''}</td>
                    <td style={{ ...s.td, fontSize: 12, opacity: .8 }}>{m.email}</td>
                    <td style={{ ...s.td, fontSize: 12, opacity: .7 }}>{m.phone ?? 'â€”'}</td>
                    <td style={{ ...s.td, fontSize: 11 }}>{(m.categories ?? []).join(', ') || 'â€”'}</td>
                    <td style={s.td}>{statusBadge(m.profile_status ?? 'pending')}</td>
                    <td style={s.td}><span style={{ color: m.paid ? '#4caf50' : MUTED }}>{m.paid ? 'SÃ­' : 'No'}</span></td>
                    <td style={{ ...s.td, fontSize: 11, opacity: .6 }}>{new Date(m.created_at).toLocaleDateString('es-ES')}</td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      {!m.approved && <button onClick={() => approveMember(m.id, m.contact_name)} style={s.btnSm}>Aprobar</button>}
                      <button onClick={() => rejectMember(m.id)} style={s.btnSm}>Rechazar</button>
                      <button onClick={() => deleteMember(m.id)} style={s.btnDanger}>âœ•</button>
                    </td>
                  </tr>
                  {expanded === m.id && (
                    <tr key={m.id + '_exp'}>
                      <td colSpan={8} style={{ background: '#111', padding: '14px 20px', borderBottom: `1px solid ${LINE}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>Bio corta</div>
                            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{m.bio_short ?? 'â€”'}</div>
                            <div style={{ color: MUTED, fontSize: 11, marginTop: 12, marginBottom: 4 }}>Ediciones</div>
                            <div style={{ fontSize: 13 }}>{m.editions ? Object.entries(m.editions).filter(([,v]) => v).map(([k]) => k).join(', ') || 'â€”' : 'â€”'}</div>
                          </div>
                          <div>
                            <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>Sinopsis</div>
                            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{m.synopsis ?? 'â€”'}</div>
                            {m.trailer_link && <div style={{ marginTop: 10 }}><a href={m.trailer_link} target="_blank" rel="noopener noreferrer" style={{ color: G, fontSize: 12 }}>â–¶ Ver trÃ¡iler</a></div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ BrandLeadsTab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type BrandLead = {
  id: string
  brand_name: string
  contact_name: string | null
  contact_role: string | null
  email: string | null
  phone: string | null
  country: string | null
  message: string | null
  website: string | null
  application_score: number | null
  status: string
  unread: boolean
  created_at: string
}

function getPriority(score: number | null): 'critical' | 'high' | 'normal' {
  if (!score) return 'normal'
  if (score >= 80) return 'critical'
  if (score >= 50) return 'high'
  return 'normal'
}

function priorityPill(priority: 'critical' | 'high' | 'normal') {
  const map = {
    critical: { bg: '#2a0a0a', color: '#e74c3c', label: 'CrÃ­tica' },
    high: { bg: '#2a1a00', color: '#C98920', label: 'Alta' },
    normal: { bg: '#1a1a2a', color: MUTED, label: 'Normal' },
  }
  const c = map[priority]
  return <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '.1em' }}>{c.label}</span>
}

export function BrandLeadsTab() {
  const supabase = createClient()
  const [leads, setLeads] = useState<BrandLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewing' | 'qualified' | 'closed'>('all')

  useEffect(() => {
    supabase.from('mxb_brand_partner_leads').select('*').order('unread', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { setLeads((data as BrandLead[]) ?? []); setLoading(false) })
  }, [supabase])

  const filtered = leads.filter(l => {
    if (filter === 'new') return l.status === 'new'
    if (filter === 'reviewing') return l.status === 'reviewing'
    if (filter === 'qualified') return l.status === 'qualified'
    if (filter === 'closed') return l.status === 'closed'
    return true
  })

  async function updateStatus(id: string, status: string) {
    await supabase.from('mxb_brand_partner_leads').update({ status, unread: false }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, unread: false } : l))
  }

  async function deleteLead(id: string) {
    if (!confirm('Â¿Eliminar este lead?')) return
    await supabase.from('mxb_brand_partner_leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const total = leads.length
  const newLeads = leads.filter(l => l.status === 'new').length
  const reviewing = leads.filter(l => l.status === 'reviewing').length
  const critical = leads.filter(l => getPriority(l.application_score) === 'critical').length

  const filterBtn = (f: typeof filter, label: string) => (
    <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', background: filter === f ? G : 'transparent', color: filter === f ? '#000' : CH, border: `1px solid ${filter === f ? G : LINE}`, borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 6 }}>{label}</button>
  )

  return (
    <div>
      <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Brand Partner Leads</h2>
      <p style={{ opacity: .55, fontSize: 14, marginBottom: 24 }}>Solicitudes recibidas desde el formulario de contacto de Brand Partners.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[['ðŸ“‹', 'Total leads', total], ['ðŸ†•', 'Nuevos', newLeads], ['ðŸ”', 'En revisiÃ³n', reviewing], ['ðŸš¨', 'Prioridad crÃ­tica', critical]].map(([icon, label, val]) => (
          <div key={String(label)} style={{ background: PANEL, border: `1px solid ${G}`, borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 300, color: G }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        {filterBtn('all', 'Todas')}
        {filterBtn('new', 'Nuevas')}
        {filterBtn('reviewing', 'En revisiÃ³n')}
        {filterBtn('qualified', 'Cualificadas')}
        {filterBtn('closed', 'Cerradas')}
      </div>

      {loading ? (
        <p style={{ opacity: .5 }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ opacity: .5 }}>No hay leads con este filtro.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(lead => {
            const priority = getPriority(lead.application_score)
            const score = lead.application_score ?? 0
            return (
              <div key={lead.id} style={{ background: PANEL, border: `1px solid ${lead.unread ? G : LINE}`, borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      {priorityPill(priority)}
                      {statusBadge(lead.status)}
                      {lead.unread && <span style={{ background: '#1a2a1a', color: '#4caf50', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>Nuevo</span>}
                    </div>
                    <div style={{ fontSize: 18, color: G, fontWeight: 300 }}>{lead.brand_name}</div>
                    {lead.contact_name && <div style={{ fontSize: 13, opacity: .8, marginTop: 2 }}>{lead.contact_name}{lead.contact_role ? ` Â· ${lead.contact_role}` : ''}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, opacity: .6 }}>{new Date(lead.created_at).toLocaleDateString('es-ES')}</div>
                    {lead.country && <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>{lead.country}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
                  {lead.email && <div><span style={{ opacity: .5 }}>Email: </span><span>{lead.email}</span></div>}
                  {lead.phone && <div><span style={{ opacity: .5 }}>Tel: </span><span>{lead.phone}</span></div>}
                  {lead.website && <div><span style={{ opacity: .5 }}>Web: </span><a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: G }}>{lead.website}</a></div>}
                </div>

                {lead.message && <div style={{ fontSize: 13, lineHeight: 1.6, opacity: .8, marginBottom: 12, padding: '10px 14px', background: '#111', borderRadius: 6 }}>{lead.message}</div>}

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, opacity: .6 }}>Score de aplicaciÃ³n: {score}/100</span>
                  </div>
                  <div style={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: priority === 'critical' ? '#e74c3c' : priority === 'high' ? '#C98920' : G, borderRadius: 3, transition: 'width .4s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {lead.status !== 'reviewing' && <button onClick={() => updateStatus(lead.id, 'reviewing')} style={s.btnSm}>En revisiÃ³n</button>}
                  {lead.status !== 'qualified' && <button onClick={() => updateStatus(lead.id, 'qualified')} style={s.btnSm}>Cualificada</button>}
                  {lead.status !== 'closed' && <button onClick={() => updateStatus(lead.id, 'closed')} style={s.btnSm}>Cerrar</button>}
                  <button onClick={() => deleteLead(lead.id)} style={s.btnDanger}>Eliminar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ NotificationsTab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type AdminNotif = {
  id: string
  type: string
  title: string
  text: string | null
  priority: string | null
  unread: boolean
  created_at: string
}

function notifIcon(type: string): string {
  if (type === 'new_member_purchase') return 'ðŸ’°'
  if (type === 'brand_partner_lead') return 'ðŸ¤'
  if (type === 'institution_announcement') return 'ðŸ“¢'
  if (type === 'community_insight') return 'ðŸ“„'
  if (type === 'member_approved') return 'âœ“'
  return 'ðŸ””'
}

function notifBg(priority: string | null): string {
  if (priority === 'critical') return 'rgba(192,57,43,.15)'
  if (priority === 'high') return 'rgba(201,137,32,.12)'
  return PANEL
}

export function NotificationsTab({ onMarkAllRead }: { onMarkAllRead?: () => void }) {
  const supabase = createClient()
  const [notifs, setNotifs] = useState<AdminNotif[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'high'>('all')

  useEffect(() => {
    supabase.from('mxb_admin_notifications').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setNotifs((data as AdminNotif[]) ?? []); setLoading(false) })
  }, [supabase])

  async function markAllRead() {
    await supabase.from('mxb_admin_notifications').update({ unread: false }).eq('unread', true)
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
    onMarkAllRead?.()
  }

  async function markRead(id: string) {
    await supabase.from('mxb_admin_notifications').update({ unread: false }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  async function deleteNotif(id: string) {
    await supabase.from('mxb_admin_notifications').delete().eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return n.unread
    if (filter === 'critical') return n.priority === 'critical'
    if (filter === 'high') return n.priority === 'high'
    return true
  })

  const filterBtn = (f: typeof filter, label: string) => (
    <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', background: filter === f ? G : 'transparent', color: filter === f ? '#000' : CH, border: `1px solid ${filter === f ? G : LINE}`, borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 6 }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 300, fontSize: 32, color: G, margin: 0 }}>ðŸ”” Centro de notificaciones</h2>
        <button onClick={markAllRead} style={s.btn}>Marcar todo como leÃ­do</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        {filterBtn('all', 'Todas')}
        {filterBtn('unread', 'Sin leer')}
        {filterBtn('critical', 'CrÃ­ticas')}
        {filterBtn('high', 'Altas')}
      </div>

      {loading ? (
        <p style={{ opacity: .5 }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ opacity: .5 }}>No hay notificaciones.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => (
            <div key={n.id} style={{ background: notifBg(n.priority), border: `1px solid ${n.unread ? G : LINE}`, borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{notifIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {n.priority && n.priority !== 'normal' && priorityPill(n.priority as 'critical' | 'high')}
                  <span style={{ fontSize: 14, fontWeight: n.unread ? 600 : 400 }}>{n.title}</span>
                </div>
                {n.text && <div style={{ fontSize: 13, opacity: .7, lineHeight: 1.5 }}>{n.text}</div>}
                <div style={{ fontSize: 11, opacity: .4, marginTop: 4 }}>{new Date(n.created_at).toLocaleString('es-ES')}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {n.unread && <button onClick={() => markRead(n.id)} style={s.btnSm}>LeÃ­do</button>}
                <button onClick={() => deleteNotif(n.id)} style={s.btnDanger}>âœ•</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ VisibilityTab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type VisibilityRow = {
  id: string
  section: string
  members: boolean
  brand_partners: boolean
  instituciones: boolean
  producers: boolean
}

const SECTIONS: { key: string; label: string }[] = [
  { key: 'fov', label: 'Future of Voices' },
  { key: 'lacroisette', label: 'La Croisette Magazine' },
  { key: 'awards', label: 'Global Boost Awards' },
  { key: 'academia', label: 'AI Academy' },
  { key: 'proyectos', label: 'Proyectos' },
  { key: 'anuncios', label: 'Anuncios' },
]

const COLS: { key: keyof Omit<VisibilityRow, 'id' | 'section'>; label: string }[] = [
  { key: 'members', label: 'Members' },
  { key: 'brand_partners', label: 'Brand Partners' },
  { key: 'instituciones', label: 'Instituciones' },
  { key: 'producers', label: 'Productores' },
]

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? G : '#333', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </button>
  )
}

export function VisibilityTab() {
  const supabase = createClient()
  const [rows, setRows] = useState<VisibilityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('mxb_visibility_matrix').select('*')
      .then(({ data }) => { setRows((data as VisibilityRow[]) ?? []); setLoading(false) })
  }, [supabase])

  async function toggle(section: string, col: keyof Omit<VisibilityRow, 'id' | 'section'>, value: boolean) {
    setSaving(section + col)
    const row = rows.find(r => r.section === section)
    if (row) {
      await supabase.from('mxb_visibility_matrix').update({ [col]: value }).eq('id', row.id)
      setRows(prev => prev.map(r => r.section === section ? { ...r, [col]: value } : r))
    } else {
      const newRow: Record<string, unknown> = { section, members: false, brand_partners: false, instituciones: false, producers: false, [col]: value }
      const { data } = await supabase.from('mxb_visibility_matrix').insert(newRow).select().single()
      if (data) setRows(prev => [...prev, data as VisibilityRow])
    }
    setSaving(null)
  }

  function getVal(section: string, col: keyof Omit<VisibilityRow, 'id' | 'section'>): boolean {
    return rows.find(r => r.section === section)?.[col] ?? false
  }

  return (
    <div>
      <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Visibilidad del Portal</h2>
      <p style={{ opacity: .55, fontSize: 14, marginBottom: 24 }}>Controla quÃ© secciones ve cada tipo de perfil.</p>

      {loading ? (
        <p style={{ opacity: .5 }}>Cargando...</p>
      ) : (
        <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G}` }}>
                <th style={{ ...s.th, width: 200 }}>SecciÃ³n</th>
                {COLS.map(c => <th key={c.key} style={{ ...s.th, textAlign: 'center' as const }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(sec => (
                <tr key={sec.key} style={{ borderBottom: `1px solid ${LINE}` }}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{sec.label}</td>
                  {COLS.map(col => (
                    <td key={col.key} style={{ ...s.td, textAlign: 'center' as const }}>
                      <div style={{ display: 'flex', justifyContent: 'center', opacity: saving === sec.key + col.key ? .5 : 1 }}>
                        <ToggleSwitch on={getVal(sec.key, col.key)} onChange={(v) => toggle(sec.key, col.key, v)} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
// SecurityLogTab
// ══════════════════════════════════════════════════════════════════════════════

type SecurityLogEntry = {
  id: string
  user_email: string | null
  user_role: string | null
  action: string
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

const CRITICAL_ACTIONS = ['delete_partner', 'delete_user', 'export_data', 'role_change', 'config_change', 'bulk_delete']
const LOGIN_ACTIONS = ['login', 'login_failed', 'logout', 'mfa_verify', 'password_verify']

function actionColor(action: string): string {
  if (LOGIN_ACTIONS.some(a => action.includes(a))) return action.includes('failed') ? '#e74c3c' : '#4caf50'
  if (CRITICAL_ACTIONS.some(a => action.includes(a))) return '#D4AF37'
  return '#888'
}

// ─── Admin Roles Tab ─────────────────────────────────────────────────────────
interface AdminRole {
  id: string
  email: string
  role: string
  created_by: string | null
  created_at: string
  last_login: string | null
  mfa_required: boolean
  is_active: boolean
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: '★ Super Admin',
  financial_admin: '€ Financial Admin',
  editor: '✏ Editor',
  moderator: '◉ Moderator',
  support: '? Support',
  developer: '⌨ Developer',
}

export function AdminRolesTab() {
  const supabase = createClient()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('editor')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('mxb_admin_roles').select('*').order('created_at', { ascending: false })
    setRoles(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addRole = async () => {
    if (!newEmail.includes('@')) { setMsg('Email inválido'); return }
    setSaving(true)
    await fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'admin_created', details: { email: newEmail, role: newRole } }),
    })
    const { error } = await supabase.from('mxb_admin_roles').upsert({ email: newEmail, role: newRole, created_by: 'admin' })
    if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    setMsg('✓ Admin añadido')
    setNewEmail('')
    load()
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('mxb_admin_roles').update({ is_active: !current }).eq('id', id)
    load()
  }

  const removeRole = async (id: string, email: string) => {
    if (!confirm(`¿Eliminar admin ${email}?`)) return
    await supabase.from('mxb_admin_roles').delete().eq('id', id)
    await fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'admin_deleted', details: { email } }),
    })
    load()
  }

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
        <h2 style={{ color: G, fontSize: 18, marginBottom: 16 }}>Admins & Roles</h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
          Gestiona quién tiene acceso al panel de administración y con qué permisos. MFA obligatorio para todos los roles.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            style={{ flex: 1, minWidth: 200, background: '#111', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', padding: '9px 12px', fontSize: 13 }}
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            style={{ background: '#111', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', padding: '9px 12px', fontSize: 13 }}
          >
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={addRole} disabled={saving} style={{ background: G, color: '#0B0B0B', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? '...' : '+ Añadir admin'}
          </button>
        </div>
        {msg && <p style={{ color: msg.startsWith('✓') ? G : '#e07060', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
        {loading ? <p style={{ color: MUTED }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${LINE}` }}>
                {['Email', 'Rol', 'MFA', 'Activo', 'Último login', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: MUTED, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${LINE}`, opacity: r.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 10px', color: '#fff' }}>{r.email}</td>
                  <td style={{ padding: '10px 10px', color: G }}>{ROLE_LABELS[r.role] || r.role}</td>
                  <td style={{ padding: '10px 10px', color: r.mfa_required ? '#7bc47f' : '#e07060' }}>{r.mfa_required ? '✓' : '✗'}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <button onClick={() => toggleActive(r.id, r.is_active)} style={{ background: r.is_active ? 'rgba(90,140,90,.2)' : 'rgba(200,60,60,.2)', border: 'none', borderRadius: 4, padding: '3px 8px', color: r.is_active ? '#7bc47f' : '#e07060', cursor: 'pointer', fontSize: 11 }}>
                      {r.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 10px', color: MUTED, fontSize: 11 }}>{r.last_login ? new Date(r.last_login).toLocaleDateString('es') : '—'}</td>
                  <td style={{ padding: '10px 10px' }}>
                    {r.role !== 'super_admin' && (
                      <button onClick={() => removeRole(r.id, r.email)} style={{ background: 'transparent', border: '1px solid #c0392b', color: '#e07060', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Credits Tab ──────────────────────────────────────────────────────────────
interface CreditTx {
  id: string
  email: string
  amount: number
  source: string
  idempotency_key: string
  credits_before: number
  credits_after: number
  created_at: string
}

export function CreditsTab() {
  const supabase = createClient()
  const [txs, setTxs] = useState<CreditTx[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('mxb_credit_transactions').select('*').order('created_at', { ascending: false }).limit(100)
    setTxs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCredits = async () => {
    const n = parseInt(amount)
    if (!email || isNaN(n)) { setMsg('Email y cantidad son obligatorios'); return }
    setSaving(true)

    const { data: member } = await supabase.from('mxb_selection_members').select('credits').eq('email', email).single()
    const current = member?.credits || 0
    const newC = current + n

    await supabase.from('mxb_selection_members').update({ credits: newC }).eq('email', email)
    const key = `manual_${Date.now()}_${email}`
    await supabase.from('mxb_credit_transactions').insert({ email, amount: n, source: reason || 'manual_admin', idempotency_key: key, credits_before: current, credits_after: newC })
    await fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'credits_modified', details: { email, amount: n, reason } }),
    })

    setMsg(`✓ ${n > 0 ? '+' : ''}${n} créditos → ${newC} total`)
    setEmail(''); setAmount(''); setReason('')
    load()
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
        <h2 style={{ color: G, fontSize: 18, marginBottom: 16 }}>⭐ Créditos</h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
          Añade o resta créditos manualmente. Members: 30 créditos por referido que completa registro+pago. Brand Partners: 500–20.000 según alianza.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email del member" style={{ flex: 2, minWidth: 200, background: '#111', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', padding: '9px 12px', fontSize: 13 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Cantidad (+ o -)" style={{ width: 120, background: '#111', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', padding: '9px 12px', fontSize: 13 }} />
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo (opcional)" style={{ flex: 1, minWidth: 140, background: '#111', border: `1px solid ${LINE}`, borderRadius: 6, color: '#fff', padding: '9px 12px', fontSize: 13 }} />
          <button onClick={addCredits} disabled={saving} style={{ background: G, color: '#0B0B0B', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? '...' : 'Aplicar'}
          </button>
        </div>
        {msg && <p style={{ color: msg.startsWith('✓') ? G : '#e07060', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
      </div>
      <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: 24 }}>
        <h3 style={{ color: CH, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Historial de transacciones</h3>
        {loading ? <p style={{ color: MUTED }}>Cargando...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${LINE}` }}>
                  {['Fecha', 'Email', 'Cantidad', 'Antes', 'Después', 'Fuente'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '7px 10px', color: MUTED, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid #1a1a1a` }}>
                    <td style={{ padding: '8px 10px', color: MUTED }}>{new Date(t.created_at).toLocaleDateString('es')}</td>
                    <td style={{ padding: '8px 10px', color: '#fff' }}>{t.email}</td>
                    <td style={{ padding: '8px 10px', color: t.amount >= 0 ? '#7bc47f' : '#e07060', fontWeight: 700 }}>{t.amount >= 0 ? '+' : ''}{t.amount}</td>
                    <td style={{ padding: '8px 10px', color: MUTED }}>{t.credits_before}</td>
                    <td style={{ padding: '8px 10px', color: G }}>{t.credits_after}</td>
                    <td style={{ padding: '8px 10px', color: MUTED, fontSize: 11 }}>{t.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export function SecurityLogTab() {
  const supabase = createClient()
  const [logs, setLogs] = useState<SecurityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'logins' | 'critical' | 'exports'>('all')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('mxb_security_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = logs.filter(l => {
    if (filter === 'all') return true
    if (filter === 'logins') return LOGIN_ACTIONS.some(a => l.action.includes(a))
    if (filter === 'critical') return CRITICAL_ACTIONS.some(a => l.action.includes(a))
    if (filter === 'exports') return l.action.includes('export')
    return true
  })

  const exportCSV = () => {
    const rows = [
      ['Time', 'User', 'Role', 'Action', 'IP', 'Details'],
      ...filtered.map(l => [
        new Date(l.created_at).toISOString(),
        l.user_email ?? '',
        l.user_role ?? '',
        l.action,
        l.ip_address ?? '',
        JSON.stringify(l.details ?? {}),
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'mxb_security_log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const SL_LINE = '#2c2c2c'
  const SL_G = '#D4AF37'
  const SL_MUTED = '#888'
  const SL_TEXT = '#ffffff'
  const SL_PANEL = '#161616'

  return (
    <div style={{ color: SL_TEXT }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'logins', 'critical', 'exports'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? SL_G : 'transparent',
                color: filter === f ? '#000' : SL_G,
                border: `1px solid ${SL_G}`,
                borderRadius: 4,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: filter === f ? 700 : 400,
                textTransform: 'capitalize' as const,
              }}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          style={{
            background: 'transparent',
            color: SL_G,
            border: `1px solid ${SL_G}`,
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ background: SL_PANEL, border: `1px solid ${SL_LINE}`, borderRadius: 8, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: SL_MUTED }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: SL_MUTED }}>No entries.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
              <thead>
                <tr>
                  {['Time', 'User', 'Action', 'IP', 'Details'].map(h => (
                    <th key={h} style={{
                      color: SL_MUTED, fontWeight: 600, textAlign: 'left' as const,
                      padding: '10px 12px', borderBottom: `1px solid ${SL_LINE}`,
                      fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const color = actionColor(l.action)
                  const isCritical = CRITICAL_ACTIONS.some(a => l.action.includes(a))
                  const isFailed = l.action.includes('failed')
                  return (
                    <tr
                      key={l.id}
                      style={{ background: isFailed ? 'rgba(231,76,60,0.06)' : isCritical ? 'rgba(212,175,55,0.06)' : 'transparent' }}
                    >
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${SL_LINE}`, color: SL_MUTED, whiteSpace: 'nowrap' as const }}>
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${SL_LINE}` }}>
                        <div style={{ color: SL_TEXT }}>{l.user_email ?? '—'}</div>
                        {l.user_role && <div style={{ color: SL_MUTED, fontSize: 10 }}>{l.user_role}</div>}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${SL_LINE}` }}>
                        <span style={{ color, fontWeight: 600 }}>{l.action}</span>
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${SL_LINE}`, color: SL_MUTED, fontSize: 11 }}>
                        {l.ip_address ?? '—'}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${SL_LINE}`, color: SL_MUTED, fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {Object.keys(l.details ?? {}).length ? JSON.stringify(l.details) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Portal Settings Tab (Content Editor) ──────────────────────────────────────
const CONFIG_KEYS = [
  'announcement_banner',
  'welcome_message',
  'event_title',
  'event_date',
  'event_location',
  'event_price',
  'event_cta_url',
  'thrivecart_gala_url',
  'thrivecart_redcarpet_url',
]

export function PortalSettingsTab() {
  const supabase = createClient()
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('mxb_config').select('key,value').in('key', CONFIG_KEYS)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        data?.forEach(r => { map[r.key] = r.value })
        setFields(map)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key: string, val: string) => setFields(prev => ({ ...prev, [key]: val }))

  const save = async (key: string) => {
    setSaving(key)
    const { error } = await supabase.from('mxb_config')
      .upsert({ key, value: fields[key] ?? '', updated_at: new Date().toISOString() })
    setMsg(prev => ({ ...prev, [key]: error ? '❌ Error' : '✓ Guardado' }))
    setSaving(null)
    setTimeout(() => setMsg(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
  }

  const Field = ({ label, k, placeholder, rows = 2, help }: { label: string; k: string; placeholder?: string; rows?: number; help?: string }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: CH, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      {help && <p style={{ color: MUTED, fontSize: 12, marginBottom: 8 }}>{help}</p>}
      {rows === 1
        ? <input value={fields[k] ?? ''} onChange={e => set(k, e.target.value)} placeholder={placeholder}
            style={{ width: '100%', background: '#111', border: '1px solid #2c2c2c', borderRadius: 6, color: '#fff', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' as const }} />
        : <textarea value={fields[k] ?? ''} onChange={e => set(k, e.target.value)} rows={rows} placeholder={placeholder}
            style={{ width: '100%', background: '#111', border: '1px solid #2c2c2c', borderRadius: 6, color: '#fff', padding: '10px 12px', fontSize: 14, lineHeight: 1.6, resize: 'vertical' as const }} />
      }
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button onClick={() => save(k)} disabled={saving === k}
          style={{ background: G, color: '#0B0B0B', border: 'none', borderRadius: 5, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}>
          {saving === k ? 'Guardando...' : 'Guardar'}
        </button>
        {msg[k] && <span style={{ color: G, fontSize: 12 }}>{msg[k]}</span>}
      </div>
    </div>
  )

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
      <h2 style={{ color: G, fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h2>
      <div style={{ height: 1, background: LINE, margin: '14px 0 20px' }} />
      {children}
    </div>
  )

  if (loading) return <p style={{ color: MUTED }}>Cargando configuración...</p>

  return (
    <div style={{ color: '#fff', maxWidth: 760 }}>

      <Section title="Announcement Banner" icon="📣">
        <Field
          label="Banner text"
          k="announcement_banner"
          rows={2}
          placeholder="Ej: 🎬 Gala de Cannes — reserva tu plaza antes del 15 Oct"
          help="Aparece como barra dorada en la parte superior del portal. Deja vacío para ocultarlo."
        />
      </Section>

      <Section title="Member Hub" icon="🏠">
        <Field
          label="Mensaje de bienvenida"
          k="welcome_message"
          rows={4}
          placeholder="Bienvenida para los members en la home del portal..."
          help="Texto que aparece en la sección de bienvenida del Member Hub."
        />
      </Section>

      <Section title="Próximo Evento" icon="🎭">
        <Field label="Nombre del evento" k="event_title" rows={1} placeholder="Gala Oficial Cannes 2027" />
        <Field label="Fecha" k="event_date" rows={1} placeholder="15 Mayo 2027" />
        <Field label="Ubicación" k="event_location" rows={1} placeholder="Cannes, Francia" />
        <Field label="Precio / Desde" k="event_price" rows={1} placeholder="Desde €2,500" />
        <Field label="URL del botón (CTA)" k="event_cta_url" rows={1} placeholder="https://..." help="Enlace al que lleva el botón de compra / reserva del evento." />
      </Section>

      <Section title="ThriveCart — Links de Pago" icon="🛒">
        <Field
          label="Official Gala Access (€2,500 / €3,900)"
          k="thrivecart_gala_url"
          rows={1}
          placeholder="https://thrivecart.com/..."
          help='Pega aquí la URL de checkout de ThriveCart. Los botones "Reservar plaza" del portal se actualizan automáticamente.'
        />
        <Field
          label="Red Carpet Experience (€10,000)"
          k="thrivecart_redcarpet_url"
          rows={1}
          placeholder="https://thrivecart.com/..."
        />
      </Section>

    </div>
  )
}
