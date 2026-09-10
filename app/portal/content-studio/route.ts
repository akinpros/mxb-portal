import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MXB Content Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0B0B0B;--surface:#141414;--surface2:#1c1c1c;
  --border:#272727;--border2:#333;
  --gold:#D4AF37;--gold-dim:#9a7e27;
  --text:#E8D5C4;--text-mid:#9a8a7a;--text-dim:#555;
  --red:#c0392b;--green:#2ecc71;--sidebar-w:240px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:13px;line-height:1.5;display:flex;}
#sidebar{width:var(--sidebar-w);min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:10;overflow-y:auto;}
.brand{padding:26px 22px 20px;border-bottom:1px solid var(--border);flex-shrink:0;}
.brand-eyebrow{font-size:9px;font-weight:600;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:4px;}
.brand-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:var(--text);}
nav{flex:1;padding:12px 0;}
.nav-group{font-size:9px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:var(--text-dim);padding:14px 22px 5px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 22px;color:var(--text-mid);font-size:12px;cursor:pointer;border-left:2px solid transparent;transition:all .15s;text-decoration:none;user-select:none;}
.nav-item:hover{color:var(--text);background:var(--surface2);}
.nav-item.active{color:var(--gold);border-left-color:var(--gold);background:rgba(212,175,55,.06);font-weight:500;}
.nav-icon{font-size:14px;flex-shrink:0;width:18px;text-align:center;}
.sidebar-footer{padding:14px 22px;border-top:1px solid var(--border);flex-shrink:0;}
.preview-btn{display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:rgba(212,175,55,.1);border:1px solid var(--gold-dim);border-radius:6px;color:var(--gold);font-size:11px;font-weight:500;cursor:pointer;text-decoration:none;font-family:inherit;letter-spacing:.3px;transition:background .15s;}
.preview-btn:hover{background:rgba(212,175,55,.18);}
#main{margin-left:var(--sidebar-w);flex:1;min-height:100vh;padding:38px 44px 80px;max-width:880px;}
.page-section{display:none;}
.page-section.active{display:block;}
.section-header{margin-bottom:26px;}
.section-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:600;color:var(--text);margin-bottom:4px;text-wrap:balance;}
.section-desc{font-size:12px;color:var(--text-mid);font-weight:300;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:22px 24px;margin-bottom:14px;}
.card-title{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:18px;display:flex;align-items:center;gap:8px;}
.field{margin-bottom:16px;}
.field:last-child{margin-bottom:0;}
label{display:block;font-size:11px;font-weight:500;color:var(--text-mid);margin-bottom:6px;letter-spacing:.2px;}
input[type=text],input[type=url],textarea{width:100%;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;padding:9px 12px;outline:none;resize:vertical;transition:border-color .15s;}
input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:var(--gold);}
input::placeholder,textarea::placeholder{color:var(--text-dim);}
.field-hint{font-size:10px;color:var(--text-dim);margin-top:4px;}
.img-preview{width:100%;max-height:110px;object-fit:cover;border-radius:6px;margin-top:8px;display:none;border:1px solid var(--border);}
.divider{border:none;border-top:1px solid var(--border);margin:18px 0;}
.save-row{display:flex;align-items:center;gap:14px;margin-top:20px;}
.btn-save{background:var(--gold);color:#0B0B0B;border:none;border-radius:6px;padding:10px 22px;font-size:12px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:.3px;transition:opacity .15s;}
.btn-save:hover{opacity:.88;}
.btn-save:disabled{opacity:.4;cursor:default;}
.save-status{font-size:11px;font-weight:500;min-height:16px;transition:color .2s;}
.save-status.ok{color:var(--green);}
.save-status.err{color:var(--red);}
.save-status.saving{color:var(--text-dim);}

/* Dynamic list items */
.list-item{display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:12px;}
.list-item-fields{flex:1;display:flex;flex-direction:column;gap:8px;}
.list-item-fields input{width:100%;}
.btn-remove{background:none;border:1px solid #333;border-radius:5px;color:#666;font-size:16px;cursor:pointer;padding:4px 10px;flex-shrink:0;line-height:1;transition:color .15s,border-color .15s;}
.btn-remove:hover{color:var(--red);border-color:var(--red);}
.btn-add{display:inline-flex;align-items:center;gap:6px;background:var(--surface2);border:1px dashed var(--border2);border-radius:6px;color:var(--text-mid);font-size:12px;padding:8px 14px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;margin-top:4px;}
.btn-add:hover{border-color:var(--gold);color:var(--gold);}
.item-img-preview{width:100%;max-height:80px;object-fit:cover;border-radius:4px;margin-top:6px;display:none;border:1px solid var(--border);}

/* PIN */
#pin-overlay{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;align-items:center;justify-content:center;}
.pin-box{text-align:center;padding:44px 36px;background:var(--surface);border:1px solid var(--border);border-radius:14px;width:320px;}
.pin-logo{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;color:var(--text);margin-bottom:3px;}
.pin-sub{font-size:10px;color:var(--text-dim);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:26px;}
.pin-input{width:100%;background:var(--bg);border:1px solid var(--gold-dim);border-radius:8px;color:var(--text);font-family:'Inter',sans-serif;font-size:20px;padding:12px 16px;text-align:center;outline:none;letter-spacing:6px;margin-bottom:12px;}
.pin-input:focus{border-color:var(--gold);}
.pin-btn{width:100%;background:var(--gold);color:#0B0B0B;border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;}
.pin-err{color:var(--red);font-size:12px;margin-top:8px;min-height:16px;}
</style>
</head>
<body>

<div id="pin-overlay">
  <div class="pin-box">
    <div class="pin-logo">Movies × Brands</div>
    <div class="pin-sub">Content Studio</div>
    <input id="pin-inp" class="pin-input" type="password" placeholder="••••••••" autocomplete="off">
    <button class="pin-btn" onclick="checkPin()">Entrar</button>
    <div id="pin-err" class="pin-err"></div>
  </div>
</div>

<div id="sidebar">
  <div class="brand">
    <div class="brand-eyebrow">Content Studio</div>
    <div class="brand-name">Movies × Brands</div>
  </div>
  <nav>
    <div class="nav-group">Portal del miembro</div>
    <a class="nav-item active" data-sec="banner" onclick="show('banner')"><span class="nav-icon">📣</span>Announcement Bar</a>
    <a class="nav-item" data-sec="hub" onclick="show('hub')"><span class="nav-icon">🏠</span>Member Hub</a>
    <a class="nav-item" data-sec="premium" onclick="show('premium')"><span class="nav-icon">⭐</span>Premium Card</a>
    <a class="nav-item" data-sec="gallery" onclick="show('gallery')"><span class="nav-icon">🖼️</span>Galería de Imágenes</a>
    <a class="nav-item" data-sec="sections" onclick="show('sections')"><span class="nav-icon">📋</span>Secciones Extra</a>
    <div class="nav-group">Evento &amp; Contenido</div>
    <a class="nav-item" data-sec="event" onclick="show('event')"><span class="nav-icon">🎭</span>Detalles del Evento</a>
    <a class="nav-item" data-sec="video" onclick="show('video')"><span class="nav-icon">🎬</span>Vídeos</a>
    <div class="nav-group">Comercio</div>
    <a class="nav-item" data-sec="thrivecart" onclick="show('thrivecart')"><span class="nav-icon">🛒</span>ThriveCart Links</a>
  </nav>
  <div class="sidebar-footer">
    <a class="preview-btn" href="/portal/member" target="_blank" rel="noopener"><span>↗</span>Ver el portal</a>
  </div>
</div>

<div id="main">

  <!-- BANNER -->
  <div id="sec-banner" class="page-section active">
    <div class="section-header">
      <div class="section-title">Announcement Bar</div>
      <div class="section-desc">La barra dorada en la parte superior del portal.</div>
    </div>
    <div class="card">
      <div class="card-title">📣 Mensaje del Banner</div>
      <div class="field">
        <label>Texto del anuncio</label>
        <input type="text" id="f-announcement_banner" placeholder="Ej: ✦ Cannes 2027 — Reserva tu plaza ahora →">
        <div class="field-hint">Se muestra en la barra dorada superior. Puedes incluir emojis.</div>
      </div>
      <div class="field">
        <label>Mensaje de bienvenida (pop-up)</label>
        <textarea id="f-welcome_message" rows="3" placeholder="Mensaje inicial cuando el miembro entra por primera vez..."></textarea>
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['announcement_banner','welcome_message'],'banner')">Guardar cambios</button>
      <span class="save-status" id="status-banner"></span>
    </div>
  </div>

  <!-- HUB -->
  <div id="sec-hub" class="page-section">
    <div class="section-header">
      <div class="section-title">Member Hub</div>
      <div class="section-desc">Textos principales de la sección central del portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🏠 Textos</div>
      <div class="field"><label>Título principal</label><input type="text" id="f-hub_title" placeholder="Ej: Tu ecosistema creativo"></div>
      <div class="field"><label>Subtítulo</label><textarea id="f-hub_subtitle" rows="3" placeholder="Descripción breve..."></textarea></div>
      <div class="field"><label>Tagline del footer</label><input type="text" id="f-hub_footer" placeholder="Ej: Donde el cine y las marcas se encuentran."></div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['hub_title','hub_subtitle','hub_footer'],'hub')">Guardar cambios</button>
      <span class="save-status" id="status-hub"></span>
    </div>
  </div>

  <!-- PREMIUM -->
  <div id="sec-premium" class="page-section">
    <div class="section-header">
      <div class="section-title">Premium Card</div>
      <div class="section-desc">La tarjeta de upgrade y la imagen de la Gala.</div>
    </div>
    <div class="card">
      <div class="card-title">⭐ Upgrade Card</div>
      <div class="field"><label>Título</label><input type="text" id="f-premium_title" placeholder="Ej: Accede a la experiencia completa"></div>
      <div class="field"><label>Descripción</label><textarea id="f-premium_desc" rows="3" placeholder="Beneficios..."></textarea></div>
      <div class="field"><label>Texto del botón CTA</label><input type="text" id="f-premium_cta" placeholder="Ej: Únete ahora →"></div>
    </div>
    <div class="card">
      <div class="card-title">🖼️ Imágenes</div>
      <div class="field">
        <label>Imagen Hero Premium (URL)</label>
        <input type="url" id="f-premium_hero_image" placeholder="https://..." oninput="previewImg(this,'prev-hero')">
        <img id="prev-hero" class="img-preview">
        <div class="field-hint">URL pública de la imagen</div>
      </div>
      <hr class="divider">
      <div class="field">
        <label>Imagen Gala (URL)</label>
        <input type="url" id="f-gala_image" placeholder="https://..." oninput="previewImg(this,'prev-gala')">
        <img id="prev-gala" class="img-preview">
      </div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['premium_title','premium_desc','premium_cta','premium_hero_image','gala_image'],'premium')">Guardar cambios</button>
      <span class="save-status" id="status-premium"></span>
    </div>
  </div>

  <!-- GALLERY -->
  <div id="sec-gallery" class="page-section">
    <div class="section-header">
      <div class="section-title">Galería de Imágenes</div>
      <div class="section-desc">Añade tantas imágenes como quieras. Se muestran como una cuadrícula en el portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🖼️ Imágenes de la galería</div>
      <div id="gallery-list"></div>
      <button class="btn-add" onclick="addGalleryItem()">+ Añadir imagen</button>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveGallery()">Guardar galería</button>
      <span class="save-status" id="status-gallery"></span>
    </div>
  </div>

  <!-- EXTRA SECTIONS -->
  <div id="sec-sections" class="page-section">
    <div class="section-header">
      <div class="section-title">Secciones Extra</div>
      <div class="section-desc">Bloques de contenido adicionales que aparecen en el portal. Añade los que necesites.</div>
    </div>
    <div class="card">
      <div class="card-title">📋 Bloques de contenido</div>
      <div id="sections-list"></div>
      <button class="btn-add" onclick="addSectionItem()">+ Añadir sección</button>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSections()">Guardar secciones</button>
      <span class="save-status" id="status-sections"></span>
    </div>
  </div>

  <!-- EVENT -->
  <div id="sec-event" class="page-section">
    <div class="section-header">
      <div class="section-title">Detalles del Evento</div>
      <div class="section-desc">La información del próximo evento en el portal.</div>
    </div>
    <div class="card">
      <div class="card-title">🎭 Información</div>
      <div class="field"><label>Nombre del evento</label><input type="text" id="f-event_title" placeholder="Ej: Official Gala Movies × Brands · Cannes 2027"></div>
      <div class="field"><label>Fecha</label><input type="text" id="f-event_date" placeholder="Ej: 16–17 Mayo 2027"></div>
      <div class="field"><label>Lugar</label><input type="text" id="f-event_location" placeholder="Ej: Palais des Festivals, Cannes"></div>
      <div class="field"><label>Precio desde</label><input type="text" id="f-event_price" placeholder="Ej: Desde €490"></div>
      <div class="field"><label>URL del botón CTA</label><input type="url" id="f-event_cta_url" placeholder="https://..."></div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['event_title','event_date','event_location','event_price','event_cta_url'],'event')">Guardar cambios</button>
      <span class="save-status" id="status-event"></span>
    </div>
  </div>

  <!-- VIDEO -->
  <div id="sec-video" class="page-section">
    <div class="section-header">
      <div class="section-title">Vídeos</div>
      <div class="section-desc">El vídeo destacado principal, más vídeos adicionales que quieras añadir.</div>
    </div>
    <div class="card">
      <div class="card-title">🎬 Vídeo Principal</div>
      <div class="field"><label>URL de YouTube</label><input type="url" id="f-featured_video_url" placeholder="https://youtube.com/watch?v=..."><div class="field-hint">URL completa de YouTube.</div></div>
      <div class="field"><label>Título del vídeo</label><input type="text" id="f-featured_video_title" placeholder="Ej: Bienvenida a la temporada 2027"></div>
    </div>
    <div class="card">
      <div class="card-title">🎬 Vídeos adicionales</div>
      <div id="videos-list"></div>
      <button class="btn-add" onclick="addVideoItem()">+ Añadir vídeo</button>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveVideos()">Guardar vídeos</button>
      <span class="save-status" id="status-video"></span>
    </div>
  </div>

  <!-- THRIVECART -->
  <div id="sec-thrivecart" class="page-section">
    <div class="section-header">
      <div class="section-title">ThriveCart Links</div>
      <div class="section-desc">URLs de pago para los productos de la Gala y Red Carpet.</div>
    </div>
    <div class="card">
      <div class="card-title">🛒 URLs de Pago</div>
      <div class="field"><label>URL Gala Access (1 y 2 entradas)</label><input type="url" id="f-thrivecart_gala_url" placeholder="https://soniaboost.thrivecart.com/..."><div class="field-hint">Usada en el botón de compra de entradas para la Gala.</div></div>
      <div class="field"><label>URL Red Carpet Experience</label><input type="url" id="f-thrivecart_redcarpet_url" placeholder="https://soniaboost.thrivecart.com/..."></div>
    </div>
    <div class="save-row">
      <button class="btn-save" onclick="saveSection(['thrivecart_gala_url','thrivecart_redcarpet_url'],'thrivecart')">Guardar cambios</button>
      <span class="save-status" id="status-thrivecart"></span>
    </div>
  </div>

</div>

<script>
var SB_URL='${SB_URL}';
var SB_KEY='${SB_KEY}';
var PIN='1234567';
var ALL_KEYS=['announcement_banner','welcome_message','hub_title','hub_subtitle','hub_footer',
  'premium_title','premium_desc','premium_cta','premium_hero_image','gala_image',
  'event_title','event_date','event_location','event_price','event_cta_url',
  'thrivecart_gala_url','thrivecart_redcarpet_url','featured_video_url','featured_video_title',
  'gallery_images','extra_sections','extra_videos'];

// ── PIN ──
;(function(){
  var ok=false;
  try{ok=sessionStorage.getItem('mxb_cs_auth')==='1';}catch(e){}
  if(ok){document.getElementById('pin-overlay').style.display='none';loadAll();}
  else document.getElementById('pin-inp').focus();
})();
function checkPin(){
  var v=document.getElementById('pin-inp').value;
  if(v===PIN){
    try{sessionStorage.setItem('mxb_cs_auth','1');}catch(e){}
    document.getElementById('pin-overlay').style.display='none';
    loadAll();
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

// ── Load all from Supabase ──
function loadAll(){
  fetch(SB_URL+'/rest/v1/mxb_config?key=in.('+ALL_KEYS.join(',')+')',{
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
  }).then(function(r){return r.json();}).then(function(rows){
    if(!Array.isArray(rows))return;
    rows.forEach(function(row){
      var el=document.getElementById('f-'+row.key);
      if(el&&row.value){el.value=row.value;}
      // JSON arrays
      if(row.key==='gallery_images'&&row.value){try{renderGallery(JSON.parse(row.value));}catch(e){}}
      if(row.key==='extra_sections'&&row.value){try{renderSections(JSON.parse(row.value));}catch(e){}}
      if(row.key==='extra_videos'&&row.value){try{renderVideos(JSON.parse(row.value));}catch(e){}}
    });
    // image previews
    ['premium_hero_image','gala_image'].forEach(function(k){
      var inp=document.getElementById('f-'+k);
      if(inp&&inp.value)previewImg(inp,k==='premium_hero_image'?'prev-hero':'prev-gala');
    });
  }).catch(function(){});
}

// ── Image preview ──
function previewImg(inp,id){
  var img=document.getElementById(id);
  if(!img)return;
  if(!inp.value.trim()){img.style.display='none';return;}
  img.src=inp.value.trim();
  img.style.display='block';
  img.onerror=function(){this.style.display='none';};
}

// ── Save simple fields ──
function saveSection(keys,sec){
  var status=document.getElementById('status-'+sec);
  status.textContent='Guardando...';status.className='save-status saving';
  Promise.all(keys.map(function(k){
    var el=document.getElementById('f-'+k);
    return sbSet(k,el?el.value.trim():'');
  })).then(function(results){
    var ok=results.every(Boolean);
    status.textContent=ok?'✓ Guardado':'✗ Error';
    status.className='save-status '+(ok?'ok':'err');
    setTimeout(function(){status.textContent='';status.className='save-status';},3000);
  });
}

function sbSet(key,value){
  return fetch(SB_URL+'/rest/v1/mxb_config',{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'resolution=merge-duplicates'},
    body:JSON.stringify({key:key,value:value,updated_at:new Date().toISOString()})
  }).then(function(r){return r.ok;}).catch(function(){return false;});
}

// ── Gallery ──
function renderGallery(arr){
  var list=document.getElementById('gallery-list');
  list.innerHTML='';
  (arr||[]).forEach(function(item,i){addGalleryRow(item,i);});
}
function addGalleryItem(){
  var list=document.getElementById('gallery-list');
  var i=list.children.length;
  addGalleryRow({url:'',caption:''},i);
}
function addGalleryRow(item,i){
  var list=document.getElementById('gallery-list');
  var div=document.createElement('div');
  div.className='list-item';
  var uid='gl-'+Date.now()+'-'+i;
  div.innerHTML='<div class="list-item-fields">'
    +'<input type="url" placeholder="URL de la imagen (https://...)" value="'+esc(item.url||'')+'" oninput="previewListImg(this)" data-preview>'
    +'<input type="text" placeholder="Pie de foto (opcional)" value="'+esc(item.caption||'')+'">'
    +'<img class="item-img-preview" src="'+esc(item.url||'')+'" onerror="this.style.display=\'none\'" '+(item.url?"style='display:block'":'')+' >'
    +'</div>'
    +'<button class="btn-remove" onclick="this.parentNode.remove()">×</button>';
  list.appendChild(div);
}
function previewListImg(inp){
  var img=inp.parentNode.querySelector('.item-img-preview');
  if(!img)return;
  if(!inp.value){img.style.display='none';return;}
  img.src=inp.value;img.style.display='block';
  img.onerror=function(){this.style.display='none';};
}
function getGalleryData(){
  return Array.from(document.getElementById('gallery-list').children).map(function(row){
    var inputs=row.querySelectorAll('input');
    return{url:(inputs[0]?inputs[0].value.trim():''),caption:(inputs[1]?inputs[1].value.trim():'')};
  }).filter(function(r){return r.url;});
}
function saveGallery(){
  var status=document.getElementById('status-gallery');
  status.textContent='Guardando...';status.className='save-status saving';
  sbSet('gallery_images',JSON.stringify(getGalleryData())).then(function(ok){
    status.textContent=ok?'✓ Guardada':'✗ Error';
    status.className='save-status '+(ok?'ok':'err');
    setTimeout(function(){status.textContent='';status.className='save-status';},3000);
  });
}

// ── Extra sections ──
function renderSections(arr){
  var list=document.getElementById('sections-list');
  list.innerHTML='';
  (arr||[]).forEach(function(item){addSectionRow(item);});
}
function addSectionItem(){addSectionRow({title:'',text:'',image:'',link:''});}
function addSectionRow(item){
  var list=document.getElementById('sections-list');
  var div=document.createElement('div');
  div.className='list-item';
  div.innerHTML='<div class="list-item-fields">'
    +'<input type="text" placeholder="Título de la sección" value="'+esc(item.title||'')+'">'
    +'<textarea placeholder="Texto / descripción" rows="2" style="width:100%;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-family:Inter,sans-serif;font-size:13px;padding:8px 12px;resize:vertical;">'+esc(item.text||'')+'</textarea>'
    +'<input type="url" placeholder="URL de imagen (opcional)" value="'+esc(item.image||'')+'" oninput="previewListImg(this)" data-preview>'
    +'<img class="item-img-preview" src="'+esc(item.image||'')+'" onerror="this.style.display=\'none\'" '+(item.image?"style='display:block'":'')+' >'
    +'<input type="url" placeholder="Enlace / URL del botón (opcional)" value="'+esc(item.link||'')+'">'
    +'</div>'
    +'<button class="btn-remove" onclick="this.parentNode.remove()">×</button>';
  list.appendChild(div);
}
function getSectionsData(){
  return Array.from(document.getElementById('sections-list').children).map(function(row){
    var inputs=row.querySelectorAll('input,textarea');
    return{title:(inputs[0]?inputs[0].value.trim():''),text:(inputs[1]?inputs[1].value.trim():''),image:(inputs[2]?inputs[2].value.trim():''),link:(inputs[3]?inputs[3].value.trim():'')};
  }).filter(function(r){return r.title||r.text;});
}
function saveSections(){
  var status=document.getElementById('status-sections');
  status.textContent='Guardando...';status.className='save-status saving';
  sbSet('extra_sections',JSON.stringify(getSectionsData())).then(function(ok){
    status.textContent=ok?'✓ Guardadas':'✗ Error';
    status.className='save-status '+(ok?'ok':'err');
    setTimeout(function(){status.textContent='';status.className='save-status';},3000);
  });
}

// ── Extra videos ──
function renderVideos(arr){
  var list=document.getElementById('videos-list');
  list.innerHTML='';
  (arr||[]).forEach(function(item){addVideoRow(item);});
}
function addVideoItem(){addVideoRow({url:'',title:''});}
function addVideoRow(item){
  var list=document.getElementById('videos-list');
  var div=document.createElement('div');
  div.className='list-item';
  div.innerHTML='<div class="list-item-fields">'
    +'<input type="url" placeholder="URL de YouTube" value="'+esc(item.url||'')+'">'
    +'<input type="text" placeholder="Título del vídeo" value="'+esc(item.title||'')+'">'
    +'</div>'
    +'<button class="btn-remove" onclick="this.parentNode.remove()">×</button>';
  list.appendChild(div);
}
function getVideosData(){
  return Array.from(document.getElementById('videos-list').children).map(function(row){
    var inputs=row.querySelectorAll('input');
    return{url:(inputs[0]?inputs[0].value.trim():''),title:(inputs[1]?inputs[1].value.trim():'')};
  }).filter(function(r){return r.url;});
}
function saveVideos(){
  var status=document.getElementById('status-video');
  status.textContent='Guardando...';status.className='save-status saving';
  var main=['featured_video_url','featured_video_title'].map(function(k){
    var el=document.getElementById('f-'+k);
    return sbSet(k,el?el.value.trim():'');
  });
  Promise.all(main.concat([sbSet('extra_videos',JSON.stringify(getVideosData()))])).then(function(results){
    var ok=results.every(Boolean);
    status.textContent=ok?'✓ Guardados':'✗ Error';
    status.className='save-status '+(ok?'ok':'err');
    setTimeout(function(){status.textContent='';status.className='save-status';},3000);
  });
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
