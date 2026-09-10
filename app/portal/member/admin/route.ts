import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const CONFIG_KEYS = [
  'announcement_banner', 'welcome_message', 'hub_title', 'hub_subtitle', 'hub_footer',
  'premium_title', 'premium_desc', 'premium_cta', 'premium_hero_image', 'gala_image',
  'event_title', 'event_date', 'event_location', 'event_price', 'event_cta_url',
  'thrivecart_gala_url', 'thrivecart_redcarpet_url', 'featured_video_url', 'featured_video_title',
]

export async function GET() {
  const cfg: Record<string, string> = {}
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('mxb_config').select('key,value').in('key', CONFIG_KEYS)
    data?.forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value ?? '' })
  } catch {}

  function v(key: string) {
    return (cfg[key] || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function vt(key: string) {
    return (cfg[key] || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const html = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MXB Content Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg:        #0B0B0B;
  --surface:   #141414;
  --surface2:  #1c1c1c;
  --border:    #272727;
  --border2:   #333;
  --gold:      #D4AF37;
  --gold-dim:  #9a7e27;
  --text:      #E8D5C4;
  --text-mid:  #9a8a7a;
  --text-dim:  #555;
  --red:       #c0392b;
  --green:     #2ecc71;
  --sidebar-w: 240px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
  display: flex;
}

/* ── Sidebar ── */
#sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 10;
}
.brand {
  padding: 28px 22px 22px;
  border-bottom: 1px solid var(--border);
}
.brand-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.brand-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: .5px;
}
nav { flex: 1; overflow-y: auto; padding: 14px 0; }
.nav-section-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 14px 22px 6px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 22px;
  color: var(--text-mid);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: color .15s, background .15s, border-color .15s;
  text-decoration: none;
  user-select: none;
}
.nav-item:hover { color: var(--text); background: var(--surface2); }
.nav-item.active { color: var(--gold); border-left-color: var(--gold); background: rgba(212,175,55,.06); font-weight: 500; }
.nav-icon { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }
.sidebar-footer {
  padding: 16px 22px;
  border-top: 1px solid var(--border);
}
.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  background: rgba(212,175,55,.1);
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  color: var(--gold);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  letter-spacing: .3px;
  transition: background .15s;
}
.preview-btn:hover { background: rgba(212,175,55,.18); }

/* ── Main ── */
#main {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
  padding: 40px 48px 80px;
  max-width: 860px;
}
.page-section { display: none; }
.page-section.active { display: block; }

.section-header { margin-bottom: 28px; }
.section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 26px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  text-wrap: balance;
}
.section-desc {
  font-size: 12px;
  color: var(--text-mid);
  font-weight: 300;
}

/* ── Cards ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 24px 26px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.field { margin-bottom: 18px; }
.field:last-child { margin-bottom: 0; }
.field label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-mid);
  margin-bottom: 7px;
  letter-spacing: .2px;
}
.field input, .field textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 10px 13px;
  outline: none;
  resize: vertical;
  transition: border-color .15s;
}
.field input:focus, .field textarea:focus { border-color: var(--gold); }
.field input::placeholder, .field textarea::placeholder { color: var(--text-dim); }
.field-hint {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 5px;
}

/* image preview */
.img-preview {
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 10px;
  display: none;
  border: 1px solid var(--border);
}

/* Save button row */
.save-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
}
.btn-save {
  background: var(--gold);
  color: #0B0B0B;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  letter-spacing: .3px;
  transition: opacity .15s;
}
.btn-save:hover { opacity: .88; }
.btn-save:disabled { opacity: .4; cursor: default; }
.save-status {
  font-size: 11px;
  font-weight: 500;
  min-height: 16px;
  transition: color .2s;
}
.save-status.ok  { color: var(--green); }
.save-status.err { color: var(--red); }
.save-status.saving { color: var(--text-dim); }

/* ── PIN overlay ── */
#pin-overlay {
  position: fixed; inset: 0;
  background: var(--bg);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pin-box {
  text-align: center;
  padding: 48px 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  width: 340px;
}
.pin-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}
.pin-sub {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 28px;
}
.pin-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--gold-dim);
  border-radius: 8px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  padding: 14px 16px;
  text-align: center;
  outline: none;
  letter-spacing: 6px;
  margin-bottom: 14px;
}
.pin-input:focus { border-color: var(--gold); }
.pin-btn {
  width: 100%;
  background: var(--gold);
  color: #0B0B0B;
  border: none;
  border-radius: 8px;
  padding: 13px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  letter-spacing: .5px;
}
.pin-err {
  color: var(--red);
  font-size: 12px;
  margin-top: 10px;
  min-height: 16px;
}

/* divider */
.divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

@media (max-width: 700px) {
  #sidebar { width: 100%; min-height: auto; position: relative; flex-direction: row; flex-wrap: wrap; }
  #main { margin-left: 0; padding: 24px 18px 60px; }
}
</style>
</head>
<body>

<!-- ── PIN ── -->
<div id="pin-overlay">
  <div class="pin-box">
    <div class="pin-logo">Movies × Brands</div>
    <div class="pin-sub">Content Studio</div>
    <input id="pin-inp" class="pin-input" type="password" placeholder="••••••••" autocomplete="off">
    <button class="pin-btn" onclick="checkPin()">Entrar</button>
    <div id="pin-err" class="pin-err"></div>
  </div>
</div>

<!-- ── Sidebar ── -->
<div id="sidebar">
  <div class="brand">
    <div class="brand-eyebrow">Content Studio</div>
    <div class="brand-name">Movies × Brands</div>
  </div>
  <nav>
    <div class="nav-section-label">Portal</div>
    <a class="nav-item active" data-sec="banner" onclick="show('banner')">
      <span class="nav-icon">📣</span> Announcement Bar
    </a>
    <a class="nav-item" data-sec="hub" onclick="show('hub')">
      <span class="nav-icon">🏠</span> Member Hub
    </a>
    <a class="nav-item" data-sec="premium" onclick="show('premium')">
      <span class="nav-icon">⭐</span> Premium Card
    </a>
    <div class="nav-section-label">Evento</div>
    <a class="nav-item" data-sec="event" onclick="show('event')">
      <span class="nav-icon">🎭</span> Detalles del Evento
    </a>
    <a class="nav-item" data-sec="video" onclick="show('video')">
      <span class="nav-icon">🎬</span> Vídeo Destacado
    </a>
    <div class="nav-section-label">Comercio</div>
    <a class="nav-item" data-sec="thrivecart" onclick="show('thrivecart')">
      <span class="nav-icon">🛒</span> ThriveCart Links
    </a>
  </nav>
  <div class="sidebar-footer">
    <a class="preview-btn" href="/portal/member" target="_blank">
      <span>↗</span> Ver el portal
    </a>
  </div>
</div>

<!-- ── Main ── -->
<div id="main">

  <!-- BANNER -->
  <div id="sec-banner" class="page-section active">
    <div class="section-header">
      <div class="section-title">Announcement Bar</div>
      <div class="section-desc">La barra dorada en la parte superior del portal que ven todos los miembros.</div>
    </div>
    <div class="card">
      <div class="card-title">📣 Mensaje del Banner</div>
      <div class="field">
        <label>Texto del anuncio</label>
        <input type="text" id="f-announcement_banner" value="${v('announcement_banner')}" placeholder="Ej: ¡Cannes 2027 ya está abierto! Reserva tu lugar →">
        <div class="field-hint">Se muestra en la barra superior del portal. Puedes incluir emojis.</div>
      </div>
      <div class="field">
        <label>Mensaje de bienvenida (pop-up)</label>
        <textarea id="f-welcome_message" rows="3" placeholder="Mensaje que aparece al entrar...">${vt('welcome_message')}</textarea>
        <div class="field-hint">Mensaje inicial cuando el miembro accede al portal por primera vez.</div>
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['announcement_banner','welcome_message'], this)">Guardar cambios</button>
      <span class="save-status" id="status-banner"></span>
    </div>
  </div>

  <!-- HUB -->
  <div id="sec-hub" class="page-section">
    <div class="section-header">
      <div class="section-title">Member Hub</div>
      <div class="section-desc">Los textos principales de la sección hub del portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🏠 Textos del Hub</div>
      <div class="field">
        <label>Título principal</label>
        <input type="text" id="f-hub_title" value="${v('hub_title')}" placeholder="Ej: Tu ecosistema creativo">
      </div>
      <div class="field">
        <label>Subtítulo / descripción</label>
        <textarea id="f-hub_subtitle" rows="3" placeholder="Descripción breve del hub...">${vt('hub_subtitle')}</textarea>
      </div>
      <div class="field">
        <label>Tagline del footer</label>
        <input type="text" id="f-hub_footer" value="${v('hub_footer')}" placeholder="Ej: Donde el cine y las marcas se encuentran.">
        <div class="field-hint">Pequeño texto al pie de la sección hub.</div>
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['hub_title','hub_subtitle','hub_footer'], this)">Guardar cambios</button>
      <span class="save-status" id="status-hub"></span>
    </div>
  </div>

  <!-- PREMIUM -->
  <div id="sec-premium" class="page-section">
    <div class="section-header">
      <div class="section-title">Premium Card</div>
      <div class="section-desc">La tarjeta de upgrade a membresía premium y la imagen de la Gala.</div>
    </div>
    <div class="card">
      <div class="card-title">⭐ Upgrade Card</div>
      <div class="field">
        <label>Título</label>
        <input type="text" id="f-premium_title" value="${v('premium_title')}" placeholder="Ej: Accede a la experiencia completa">
      </div>
      <div class="field">
        <label>Descripción</label>
        <textarea id="f-premium_desc" rows="3" placeholder="Beneficios de la membresía premium...">${vt('premium_desc')}</textarea>
      </div>
      <div class="field">
        <label>Texto del botón CTA</label>
        <input type="text" id="f-premium_cta" value="${v('premium_cta')}" placeholder="Ej: Únete ahora →">
      </div>
    </div>
    <div class="card">
      <div class="card-title">🖼️ Imágenes</div>
      <div class="field">
        <label>Imagen Hero Premium (URL)</label>
        <input type="url" id="f-premium_hero_image" value="${v('premium_hero_image')}" placeholder="https://..." oninput="previewImg(this,'prev-hero')">
        <img id="prev-hero" class="img-preview" src="${v('premium_hero_image')}" onerror="this.style.display='none'" ${cfg['premium_hero_image'] ? "style='display:block'" : ''}>
        <div class="field-hint">URL pública de la imagen (Cloudinary, Supabase Storage, etc.)</div>
      </div>
      <hr class="divider">
      <div class="field">
        <label>Imagen Gala (URL)</label>
        <input type="url" id="f-gala_image" value="${v('gala_image')}" placeholder="https://..." oninput="previewImg(this,'prev-gala')">
        <img id="prev-gala" class="img-preview" src="${v('gala_image')}" onerror="this.style.display='none'" ${cfg['gala_image'] ? "style='display:block'" : ''}>
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['premium_title','premium_desc','premium_cta','premium_hero_image','gala_image'], this)">Guardar cambios</button>
      <span class="save-status" id="status-premium"></span>
    </div>
  </div>

  <!-- EVENT -->
  <div id="sec-event" class="page-section">
    <div class="section-header">
      <div class="section-title">Detalles del Evento</div>
      <div class="section-desc">La información del próximo evento que se muestra en el portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🎭 Información del Evento</div>
      <div class="field">
        <label>Nombre del evento</label>
        <input type="text" id="f-event_title" value="${v('event_title')}" placeholder="Ej: Official Gala Movies × Brands · Cannes 2027">
      </div>
      <div class="field">
        <label>Fecha</label>
        <input type="text" id="f-event_date" value="${v('event_date')}" placeholder="Ej: 16–17 Mayo 2027">
      </div>
      <div class="field">
        <label>Lugar</label>
        <input type="text" id="f-event_location" value="${v('event_location')}" placeholder="Ej: Palais des Festivals, Cannes">
      </div>
      <div class="field">
        <label>Precio desde</label>
        <input type="text" id="f-event_price" value="${v('event_price')}" placeholder="Ej: Desde €490">
      </div>
      <div class="field">
        <label>URL del botón CTA</label>
        <input type="url" id="f-event_cta_url" value="${v('event_cta_url')}" placeholder="https://...">
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['event_title','event_date','event_location','event_price','event_cta_url'], this)">Guardar cambios</button>
      <span class="save-status" id="status-event"></span>
    </div>
  </div>

  <!-- VIDEO -->
  <div id="sec-video" class="page-section">
    <div class="section-header">
      <div class="section-title">Vídeo Destacado</div>
      <div class="section-desc">El vídeo de YouTube que se muestra en la sección de contenido del portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🎬 Vídeo de YouTube</div>
      <div class="field">
        <label>URL del vídeo</label>
        <input type="url" id="f-featured_video_url" value="${v('featured_video_url')}" placeholder="https://youtube.com/watch?v=...">
        <div class="field-hint">Pega la URL completa de YouTube. El portal lo convierte automáticamente.</div>
      </div>
      <div class="field">
        <label>Título del vídeo</label>
        <input type="text" id="f-featured_video_title" value="${v('featured_video_title')}" placeholder="Ej: Bienvenida a la temporada 2027">
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['featured_video_url','featured_video_title'], this)">Guardar cambios</button>
      <span class="save-status" id="status-video"></span>
    </div>
  </div>

  <!-- THRIVECART -->
  <div id="sec-thrivecart" class="page-section">
    <div class="section-header">
      <div class="section-title">ThriveCart Links</div>
      <div class="section-desc">Las URLs de pago para los productos de la Gala y Red Carpet.</div>
    </div>
    <div class="card">
      <div class="card-title">🛒 URLs de Pago</div>
      <div class="field">
        <label>URL Gala Access (1 y 2 entradas)</label>
        <input type="url" id="f-thrivecart_gala_url" value="${v('thrivecart_gala_url')}" placeholder="https://soniaboost.thrivecart.com/...">
        <div class="field-hint">Usada en el botón de compra de entradas para la Gala.</div>
      </div>
      <div class="field">
        <label>URL Red Carpet Experience</label>
        <input type="url" id="f-thrivecart_redcarpet_url" value="${v('thrivecart_redcarpet_url')}" placeholder="https://soniaboost.thrivecart.com/...">
        <div class="field-hint">Usada en el botón de compra del paquete Red Carpet.</div>
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['thrivecart_gala_url','thrivecart_redcarpet_url'], this)">Guardar cambios</button>
      <span class="save-status" id="status-thrivecart"></span>
    </div>
  </div>

</div><!-- /main -->

<script>
var SB_URL='${SB_URL}';
var SB_KEY='${SB_KEY}';
var PIN='1234567';

// ── PIN ──
;(function(){
  var ok=false;
  try{ok=sessionStorage.getItem('mxb_cs_auth')==='1';}catch(e){}
  if(ok) document.getElementById('pin-overlay').style.display='none';
  else   document.getElementById('pin-inp').focus();
})();
function checkPin(){
  var v=document.getElementById('pin-inp').value;
  if(v===PIN){
    try{sessionStorage.setItem('mxb_cs_auth','1');}catch(e){}
    document.getElementById('pin-overlay').style.display='none';
  }else{
    document.getElementById('pin-err').textContent='Contraseña incorrecta.';
    document.getElementById('pin-inp').value='';
    document.getElementById('pin-inp').focus();
  }
}
document.getElementById('pin-inp').addEventListener('keydown',function(e){if(e.key==='Enter')checkPin();});

// ── Nav ──
function show(sec){
  document.querySelectorAll('.page-section').forEach(function(el){el.classList.remove('active');});
  document.querySelectorAll('.nav-item').forEach(function(el){el.classList.remove('active');});
  document.getElementById('sec-'+sec).classList.add('active');
  document.querySelector('[data-sec="'+sec+'"]').classList.add('active');
}

// ── Image preview ──
function previewImg(inp,previewId){
  var img=document.getElementById(previewId);
  if(!inp.value.trim()){img.style.display='none';return;}
  img.src=inp.value.trim();
  img.style.display='block';
  img.onerror=function(){this.style.display='none';};
}

// ── Save ──
function saveSection(keys, btn){
  var statusId='status-'+btn.closest('.page-section').id.replace('sec-','');
  var status=document.getElementById(statusId);
  btn.disabled=true;
  status.textContent='Guardando...';
  status.className='save-status saving';

  var writes=keys.map(function(k){
    var el=document.getElementById('f-'+k);
    var val=el?el.value.trim():'';
    return fetch(SB_URL+'/rest/v1/mxb_config',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':SB_KEY,
        'Authorization':'Bearer '+SB_KEY,
        'Prefer':'resolution=merge-duplicates'
      },
      body:JSON.stringify({key:k,value:val,updated_at:new Date().toISOString()})
    });
  });

  Promise.all(writes).then(function(results){
    var ok=results.every(function(r){return r.ok;});
    btn.disabled=false;
    if(ok){
      status.textContent='✓ Guardado correctamente';
      status.className='save-status ok';
    }else{
      status.textContent='✗ Error al guardar';
      status.className='save-status err';
    }
    setTimeout(function(){status.textContent='';status.className='save-status';},3500);
  }).catch(function(){
    btn.disabled=false;
    status.textContent='✗ Sin conexión';
    status.className='save-status err';
    setTimeout(function(){status.textContent='';status.className='save-status';},3500);
  });
}
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
