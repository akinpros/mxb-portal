'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG_CARD = '#161616'
const LINE = '#2c2c2c'
const MUTED = '#6b6560'

const ESTADO_LABEL: Record<string, string> = {
  en_proceso: 'En proceso', validado: 'Validado',
  no_validado: 'No validado', cerrado: 'Cerrado',
}
const ESTADO_COLOR: Record<string, { bg: string; color: string }> = {
  en_proceso: { bg: 'rgba(212,175,55,.12)', color: G },
  validado: { bg: 'rgba(111,207,151,.12)', color: '#6fcf97' },
  no_validado: { bg: 'rgba(224,112,96,.12)', color: '#e07060' },
  cerrado: { bg: 'rgba(212,175,55,.28)', color: CH },
}
const TIER_LABEL: Record<string, string> = {
  '30000': '30.000€ — Silver', '60000': '60.000€ — Gold',
  '100000': '100.000€ — Platinum', '200000': '200.000€ — Cannes + Berlinale 2027',
}
const SECTORS = ['Bienestar y Longevidad','Belleza','Moda','Lujo','Real Estate','Educación','Automoción','Tecnología','Gastronomía']

export type Prospect = {
  id: string; ref: number; empresa: string; sector: string; web: string | null
  telefono: string | null; email: string | null; instagram: string | null; linkedin: string | null
  added_by: string | null; tipo: string; tier: string | null; decisor: string | null
  urgencia: number; motivo: string | null; estado: string; motivo_no_validado: string | null
  comentario: string | null; notas_internas: string | null; created_at: string; partner_id: string
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#0e0e0e',
  border: `1px solid ${LINE}`, borderRadius: 5, color: '#fff',
  fontSize: 14, fontFamily: 'Georgia,serif', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.28em',
  textTransform: 'uppercase', color: MUTED, marginBottom: 6,
}

interface Props {
  partner: { id: string; full_name: string; company: string | null } | null
  initProspects: Prospect[]
  meetingText: string
  isAdmin?: boolean
}

export default function ProspectosTab({ partner, initProspects, meetingText: initMeeting, isAdmin = false }: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(initProspects)
  const [meeting, setMeeting] = useState(initMeeting)
  const [search, setSearch] = useState('')
  const [filterSector, setFilterSector] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // form state
  const [fEmpresa, setFEmpresa] = useState('')
  const [fSector, setFSector] = useState('Bienestar y Longevidad')
  const [fSectorOtro, setFSectorOtro] = useState('')
  const [fWeb, setFWeb] = useState('')
  const [fTelefono, setFTelefono] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fInstagram, setFInstagram] = useState('')
  const [fLinkedin, setFLinkedin] = useState('')
  const [fTipo, setFTipo] = useState('brand_partner')
  const [fTier, setFTier] = useState('30000')
  const [fDecisor, setFDecisor] = useState('directo')
  const [fUrgencia, setFUrgencia] = useState('3')
  const [fMotivo, setFMotivo] = useState('')
  const [fEstado, setFEstado] = useState('en_proceso')
  const [fMotivoNo, setFMotivoNo] = useState('')
  const [fComentario, setFComentario] = useState('')
  const [fNotas, setFNotas] = useState('')

  const supabase = createClient()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const BRAND_PARTNER_SLOTS = 5
  const cerrados = prospects.filter(p => p.tipo === 'brand_partner' && p.estado === 'cerrado').length
  const enProceso = prospects.filter(p => p.tipo === 'brand_partner' && (p.estado === 'validado' || p.estado === 'en_proceso')).length
  const disponibles = Math.max(0, BRAND_PARTNER_SLOTS - cerrados)

  const sectors = ['Moda/Lujo', 'Bienestar/Longevidad/Belleza', 'Tecnología', 'Gastronomía', 'Automóviles', 'Otros']

  const filtered = prospects
    .filter(p => !search || p.empresa.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filterSector || p.sector === filterSector)
    .filter(p => !filterTipo || p.tipo === filterTipo)
    .filter(p => !filterEstado || p.estado === filterEstado)
    .sort((a, b) => b.ref - a.ref)

  function openNew() {
    setEditId(null)
    setFEmpresa(''); setFSector('Bienestar y Longevidad'); setFSectorOtro('')
    setFWeb(''); setFTelefono(''); setFEmail(''); setFInstagram(''); setFLinkedin('')
    setFTipo('brand_partner'); setFTier('30000'); setFDecisor('directo'); setFUrgencia('3')
    setFMotivo(''); setFEstado('en_proceso'); setFMotivoNo(''); setFComentario(''); setFNotas('')
    setOpen(true)
  }

  function openEdit(p: Prospect) {
    setEditId(p.id)
    setFEmpresa(p.empresa); setFWeb(p.web ?? ''); setFTelefono(p.telefono ?? '')
    setFEmail(p.email ?? ''); setFInstagram(p.instagram ?? ''); setFLinkedin(p.linkedin ?? '')
    setFTipo(p.tipo); setFTier(p.tier ?? '30000'); setFDecisor(p.decisor ?? 'directo')
    setFUrgencia(String(p.urgencia)); setFMotivo(p.motivo ?? '')
    setFEstado(p.estado); setFMotivoNo(p.motivo_no_validado ?? '')
    setFComentario(p.comentario ?? ''); setFNotas(p.notas_internas ?? '')
    if (sectors.includes(p.sector)) { setFSector(p.sector); setFSectorOtro('') }
    else { setFSector('__otro__'); setFSectorOtro(p.sector) }
    setOpen(true)
  }

  async function saveProspect() {
    const empresa = fEmpresa.trim()
    const sector = fSector === '__otro__' ? fSectorOtro.trim() : fSector
    if (!empresa || !sector) { showToast('Empresa y sector son obligatorios'); return }
    if (!partner) return
    setSaving(true)

    const base = {
      empresa, sector, partner_id: partner.id,
      added_by: partner.company ?? partner.full_name,
      web: fWeb || null, telefono: fTelefono || null,
      email: fEmail || null, instagram: fInstagram || null, linkedin: fLinkedin || null,
      tipo: fTipo, tier: fTipo === 'sponsor' ? fTier : null,
      decisor: fDecisor, urgencia: parseInt(fUrgencia),
      motivo: fMotivo || null,
      ...(isAdmin ? {
        estado: fEstado,
        motivo_no_validado: fMotivoNo || null,
        comentario: fComentario || null,
        notas_internas: fNotas || null,
      } : {}),
    }

    if (editId) {
      const { data } = await supabase.from('mxb_prospects').update(base).eq('id', editId).select().single()
      if (data) setProspects(prev => prev.map(p => p.id === editId ? data as Prospect : p))
    } else {
      const { data } = await supabase.from('mxb_prospects').insert(base).select().single()
      if (data) setProspects(prev => [data as Prospect, ...prev])
    }

    setSaving(false); setOpen(false)
    showToast('Guardado correctamente')
  }

  async function saveMeeting(text: string) {
    await supabase.from('mxb_config').upsert({ key: 'prospects_meeting_text', value: text }, { onConflict: 'key' })
    setMeeting(text)
    showToast('Fecha de reunión actualizada')
  }

  function exportCSV() {
    const headers = ['Ref','Empresa','Sector','Web','Teléfono','Email','Instagram','LinkedIn','Añadido por','Tipo','Importe','Decisor','Urgencia','Encaje','Estado','Motivo no validado','Comentario','Notas internas','Fecha']
    const rows = prospects.map(p => [
      p.ref, p.empresa, p.sector, p.web, p.telefono, p.email, p.instagram, p.linkedin, p.added_by,
      p.tipo === 'sponsor' ? 'Sponsor' : 'Brand Partner', p.tier ? TIER_LABEL[p.tier] : '',
      p.decisor, p.urgencia, p.motivo, ESTADO_LABEL[p.estado] ?? p.estado,
      p.motivo_no_validado, p.comentario, p.notas_internas,
      new Date(p.created_at).toLocaleDateString('es-ES'),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => {
      const s = String(v ?? ''); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `prospectos-mxb-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const panel: React.CSSProperties = { background: BG_CARD, border: `1px solid ${LINE}`, borderRadius: 10, padding: 20 }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1a1a1a', border: `1px solid ${G}`, color: CH, padding: '13px 20px', borderRadius: 6, fontSize: 13, zIndex: 200 }}>{toast}</div>
      )}

      <h2 style={{ fontWeight: 300, fontSize: 32, color: G, marginBottom: 8 }}>Seguimiento de Prospectos</h2>
      <p style={{ opacity: .55, fontSize: 15, marginBottom: 24 }}>Registra tus clientes potenciales — el equipo los valida y hace seguimiento contigo</p>

      {/* Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ ...panel, borderColor: 'rgba(212,175,55,.35)', background: 'linear-gradient(90deg,rgba(212,175,55,.08),rgba(212,175,55,.02))' }}>
          <div style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: G, marginBottom: 4 }}>Plazas Brand Partner</div>
          <div style={{ fontSize: 20, color: CH }}>{disponibles} de {BRAND_PARTNER_SLOTS} disponibles{enProceso > 0 ? ` · ${enProceso} en proceso` : ''}</div>
        </div>
        <div style={{ ...panel, borderColor: 'rgba(212,175,55,.35)', background: 'linear-gradient(90deg,rgba(212,175,55,.08),rgba(212,175,55,.02))' }}>
          <div style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: G, marginBottom: 4 }}>Próxima reunión mensual</div>
          {isAdmin ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input defaultValue={meeting} onBlur={e => saveMeeting(e.target.value)} placeholder="Ej. Primer lunes de cada mes" style={{ ...inp, flex: 1, fontSize: 13, padding: '7px 10px' }} />
            </div>
          ) : (
            <div style={{ fontSize: 16, color: CH }}>{meeting || 'Por confirmar'}</div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa…" style={{ ...inp, width: 200, fontSize: 13, padding: '8px 12px' }} />
          <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ ...inp, width: 'auto', fontSize: 13, padding: '8px 12px', cursor: 'pointer' }}>
            <option value="">Todos los sectores</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ ...inp, width: 'auto', fontSize: 13, padding: '8px 12px', cursor: 'pointer' }}>
            <option value="">Brand Partner y Sponsor</option>
            <option value="brand_partner">Solo Brand Partner</option>
            <option value="sponsor">Solo Sponsor</option>
          </select>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ ...inp, width: 'auto', fontSize: 13, padding: '8px 12px', cursor: 'pointer' }}>
            <option value="">Todos los estados</option>
            <option value="en_proceso">En proceso</option>
            <option value="validado">Validado</option>
            <option value="no_validado">No validado</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <button onClick={exportCSV} style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${LINE}`, color: MUTED, borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>↓ Exportar CSV</button>
          )}
          {!isAdmin && (
            <button onClick={openNew} style={{ padding: '10px 22px', background: G, color: '#0b0b0b', border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 600 }}>+ Añadir prospecto</button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: `1px dashed ${LINE}`, borderRadius: 10, color: MUTED }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: .5 }}>🔍</div>
          <div style={{ fontSize: 18, color: CH, marginBottom: 6 }}>Sin resultados</div>
          <div style={{ fontSize: 13 }}>Añade tu primer prospecto o ajusta los filtros</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {filtered.map(p => {
            const estado = ESTADO_COLOR[p.estado] ?? { bg: '#222', color: CH }
            return (
              <div key={p.id} style={{ ...panel, cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace', letterSpacing: '.05em' }}>REF. {String(p.ref).padStart(3, '0')}</span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 10px', borderRadius: 20, background: estado.bg, color: estado.color }}>{ESTADO_LABEL[p.estado]}</span>
                </div>
                <div style={{ fontSize: 20, color: CH, marginBottom: 2 }}>{p.empresa}</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>{p.sector}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#1e1e1e', color: CH, border: `1px solid ${LINE}` }}>{p.tipo === 'sponsor' ? `Sponsor · ${TIER_LABEL[p.tier ?? ''] ?? ''}` : 'Brand Partner'}</span>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#1e1e1e', color: CH, border: `1px solid ${LINE}` }}>Urgencia {p.urgencia}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  {p.web && <a href={p.web} target="_blank" rel="noopener noreferrer" style={{ color: G }}>Web</a>}
                  {p.telefono && <span style={{ color: MUTED }}>{p.telefono}</span>}
                  {p.instagram && <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: G }}>Instagram</a>}
                  {p.linkedin && <a href={p.linkedin.startsWith('http') ? p.linkedin : 'https://' + p.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: G }}>LinkedIn</a>}
                </div>
                {isAdmin && p.added_by && <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>Añadido por: {p.added_by}</div>}
                {p.estado === 'no_validado' && p.comentario && (
                  <div style={{ fontSize: 12, color: '#e07060', marginBottom: 10, fontStyle: 'italic' }}>Nota del equipo: {p.comentario}</div>
                )}
                <div style={{ marginTop: 4 }}>
                  <button onClick={() => openEdit(p)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${LINE}`, color: MUTED, borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>
                    {isAdmin ? 'Evaluar' : 'Ver / Editar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ background: '#141414', border: `1px solid ${LINE}`, borderRadius: 8, width: '100%', maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 26px', borderBottom: `1px solid ${LINE}` }}>
              <h3 style={{ fontWeight: 300, fontSize: 22, color: CH }}>{editId ? 'Editar prospecto' : 'Nuevo prospecto'}</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: MUTED, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 26, maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Company data */}
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 14 }}>Datos de la empresa</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Empresa *</label>
                  <input value={fEmpresa} onChange={e => setFEmpresa(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Sector *</label>
                  <select value={fSector} onChange={e => setFSector(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__otro__">Otros (especificar)</option>
                  </select>
                </div>
              </div>
              {fSector === '__otro__' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Especifica el sector</label>
                  <input value={fSectorOtro} onChange={e => setFSectorOtro(e.target.value)} style={inp} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Página web</label><input value={fWeb} onChange={e => setFWeb(e.target.value)} placeholder="https://" style={inp} /></div>
                <div><label style={lbl}>Teléfono</label><input value={fTelefono} onChange={e => setFTelefono(e.target.value)} style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Email (opcional)</label><input value={fEmail} onChange={e => setFEmail(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Instagram</label><input value={fInstagram} onChange={e => setFInstagram(e.target.value)} placeholder="@usuario" style={inp} /></div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>LinkedIn</label>
                <input value={fLinkedin} onChange={e => setFLinkedin(e.target.value)} style={inp} />
              </div>

              {/* Proposal */}
              <div style={{ height: 1, background: LINE, margin: '20px 0' }} />
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 14 }}>Tipo de propuesta</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>¿Cómo lo veis?</label>
                  <select value={fTipo} onChange={e => setFTipo(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="brand_partner">Brand Partner — 5.000€ (solo 5 plazas)</option>
                    <option value="sponsor">Sponsor</option>
                  </select>
                </div>
                {fTipo === 'sponsor' && (
                  <div>
                    <label style={lbl}>Importe orientativo</label>
                    <select value={fTier} onChange={e => setFTier(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="30000">30.000€ — Silver</option>
                      <option value="60000">60.000€ — Gold</option>
                      <option value="100000">100.000€ — Platinum</option>
                      <option value="200000">200.000€ — Cannes + Berlinale 2027</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Context */}
              <div style={{ height: 1, background: LINE, margin: '20px 0' }} />
              <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 14 }}>Contexto para la validación</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Contacto con el decisor</label>
                  <select value={fDecisor} onChange={e => setFDecisor(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="directo">Contacto directo con el decisor</option>
                    <option value="referencia">Referencia, sin contacto directo aún</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Urgencia / momentum (1 a 5)</label>
                  <select value={fUrgencia} onChange={e => setFUrgencia(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="1">1 — Sin prisa</option>
                    <option value="2">2</option>
                    <option value="3">3 — Interés moderado</option>
                    <option value="4">4</option>
                    <option value="5">5 — Listos para avanzar ya</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Motivo de encaje</label>
                <textarea value={fMotivo} onChange={e => setFMotivo(e.target.value)} rows={3} placeholder="¿Por qué encaja este prospecto con el ecosistema?" style={{ ...inp, resize: 'vertical' }} />
              </div>

              {/* Admin-only validation */}
              {isAdmin && (
                <>
                  <div style={{ height: 1, background: LINE, margin: '20px 0' }} />
                  <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, marginBottom: 14 }}>Evaluación interna (solo equipo)</div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Estado</label>
                    <select value={fEstado} onChange={e => setFEstado(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="en_proceso">En proceso</option>
                      <option value="validado">Validado</option>
                      <option value="no_validado">No validado</option>
                      <option value="cerrado">Cerrado (contrato firmado)</option>
                    </select>
                  </div>
                  {fEstado === 'no_validado' && (
                    <>
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Motivo (no validado)</label>
                        <select value={fMotivoNo} onChange={e => setFMotivoNo(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                          <option value="">— Selecciona —</option>
                          <option value="No encaja con el posicionamiento">No encaja con el posicionamiento</option>
                          <option value="Presupuesto insuficiente">Presupuesto insuficiente</option>
                          <option value="Sin contacto real con el decisor">Sin contacto real con el decisor</option>
                          <option value="Industria no alineada">Industria no alineada</option>
                          <option value="Timing no adecuado">Timing no adecuado</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Comentario visible para el partner</label>
                        <textarea value={fComentario} onChange={e => setFComentario(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
                      </div>
                    </>
                  )}
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Notas internas (solo equipo)</label>
                    <textarea value={fNotas} onChange={e => setFNotas(e.target.value)} rows={3} placeholder="Redes revisadas, primera impresión, riesgos, siguiente paso…" style={{ ...inp, resize: 'vertical' }} />
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '16px 26px', borderTop: `1px solid ${LINE}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${LINE}`, color: MUTED, borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>Cancelar</button>
              <button onClick={saveProspect} disabled={saving} style={{ padding: '10px 24px', background: saving ? '#555' : G, color: '#0b0b0b', border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 600 }}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
