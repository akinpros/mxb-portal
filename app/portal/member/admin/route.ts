import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const CONFIG_KEYS = [
  'announcement_banner', 'welcome_message', 'hub_title', 'hub_subtitle', 'hub_footer',
  'premium_title', 'premium_desc', 'premium_cta', 'premium_hero_image', 'gala_image',
  'event_title', 'event_date', 'event_location', 'event_price', 'event_cta_url',
  'thrivecart_gala_url', 'thrivecart_redcarpet_url', 'featured_video_url', 'featured_video_title',
]

const EDITABLES = [
  { key: 'hub_title',        label: '🏠 Título del Hub',         type: 'text',     selectors: ['.mhv-title'] },
  { key: 'hub_subtitle',     label: '🏠 Subtítulo del Hub',      type: 'textarea', selectors: ['.mhv-sub'] },
  { key: 'hub_footer',       label: '🏠 Tagline del Footer',     type: 'text',     selectors: ['.hub-footer-tagline'] },
  { key: 'announcement_banner', label: '📣 Announcement Banner', type: 'text',     selectors: ['#mxb-announcement-bar'] },
  { key: 'premium_title',    label: '⭐ Título Premium',         type: 'text',     selectors: ['#hubPremiumUpgradeTitle'] },
  { key: 'premium_desc',     label: '⭐ Descripción Premium',    type: 'textarea', selectors: ['#hubPremiumUpgradeDesc'] },
  { key: 'premium_cta',      label: '⭐ Botón Premium',          type: 'text',     selectors: ['#hubPremiumUpgradeCta'] },
  { key: 'premium_hero_image', label: '🖼️ Imagen Hero Premium', type: 'image',    selectors: ['#hubPremiumUpgradeImage', '#premiumHeroImageV45'] },
  { key: 'gala_image',       label: '🖼️ Imagen Gala',           type: 'image',    selectors: ['#premiumGalaImage'] },
]

const SETTINGS = [
  { key: 'thrivecart_gala_url',      label: '🛒 ThriveCart — URL Gala Access', type: 'url' },
  { key: 'thrivecart_redcarpet_url', label: '🛒 ThriveCart — URL Red Carpet',  type: 'url' },
  { key: 'featured_video_url',       label: '🎬 Vídeo destacado (YouTube URL)', type: 'url' },
  { key: 'featured_video_title',     label: '🎬 Título del vídeo',             type: 'text' },
  { key: 'welcome_message',          label: '💬 Mensaje de bienvenida',        type: 'textarea' },
  { key: 'event_title',              label: '🎭 Nombre del evento',            type: 'text' },
  { key: 'event_date',               label: '📅 Fecha del evento',             type: 'text' },
  { key: 'event_location',           label: '📍 Lugar del evento',             type: 'text' },
  { key: 'event_price',              label: '💰 Precio del evento',            type: 'text' },
  { key: 'event_cta_url',            label: '🔗 Enlace CTA del evento',        type: 'url' },
]

export async function GET() {
  const editablesJson = JSON.stringify(EDITABLES)
  const settingsJson  = JSON.stringify(SETTINGS)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MXB Editor — Portal</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;background:#0B0B0B;overflow:hidden;}
#mxb-toolbar{position:fixed;top:0;left:0;right:0;height:50px;background:#0B0B0B;border-bottom:2px solid #D4AF37;z-index:9999;display:flex;align-items:center;padding:0 16px;gap:10px;}
#portal-frame{position:fixed;top:50px;left:0;right:0;bottom:0;width:100%;height:calc(100vh - 50px);border:none;background:#000;}
#mxb-popover{position:fixed;background:#111;border:1px solid #D4AF37;border-radius:8px;padding:18px;z-index:99999;width:340px;box-shadow:0 12px 40px rgba(0,0,0,.95);}
#mxb-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99998;display:flex;align-items:center;justify-content:center;}
#mxb-modal{background:#0d0d0d;border:1px solid #D4AF37;border-radius:10px;padding:24px;width:500px;max-width:96vw;max-height:88vh;overflow-y:auto;}
.mxb-inp{width:100%;background:#111;border:1px solid #252525;border-radius:4px;color:#fff;padding:8px 10px;font-size:12px;font-family:inherit;resize:vertical;}
.mxb-inp:focus{outline:1px solid #D4AF37;border-color:#D4AF37;}
.mxb-label{display:block;color:#E8D5C4;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;}
.mxb-btn-gold{background:#D4AF37;color:#0B0B0B;border:none;border-radius:4px;padding:9px 18px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.5px;}
.mxb-btn-ghost{background:#1a1a1a;color:#888;border:1px solid #2a2a2a;border-radius:4px;padding:9px 14px;font-size:11px;cursor:pointer;}
</style>
</head>
<body>

<!-- ── Toolbar ── -->
<div id="mxb-toolbar">
  <span style="color:#D4AF37;font-weight:700;font-size:13px;letter-spacing:1.5px;flex-shrink:0;">✦ MXB EDITOR</span>
  <span id="mxb-hint" style="color:#555;font-size:11px;"></span>
  <div style="margin-left:auto;display:flex;gap:8px;flex-shrink:0;">
    <button id="mxb-edit-btn" onclick="toggleEdit()" style="background:#D4AF37;color:#0B0B0B;border:none;border-radius:4px;padding:7px 16px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.5px;">✏️ EDITAR PÁGINA</button>
    <button onclick="openSettings()" style="background:#111;color:#E8D5C4;border:1px solid #2a2a2a;border-radius:4px;padding:7px 13px;font-size:11px;cursor:pointer;">⚙️ URLs &amp; Eventos</button>
    <a href="/admin" style="background:#111;color:#666;border:1px solid #2a2a2a;border-radius:4px;padding:7px 13px;font-size:11px;text-decoration:none;display:inline-flex;align-items:center;">← Admin</a>
  </div>
</div>

<!-- ── Portal iframe ── -->
<iframe id="portal-frame" src="/portal/member" sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads" allow="fullscreen"></iframe>

<!-- ── PIN screen ── -->
<div id="mxb-pin-screen" style="position:fixed;inset:0;background:#0B0B0B;z-index:99999;display:flex;align-items:center;justify-content:center;">
  <div style="text-align:center;padding:40px;">
    <div style="color:#D4AF37;font-size:22px;font-weight:700;letter-spacing:3px;margin-bottom:6px;">✦ MXB EDITOR</div>
    <div style="color:#666;font-size:13px;margin-bottom:24px;">Introduce tu contraseña de administrador</div>
    <input id="mxb-pin" type="password" placeholder="Contraseña"
      style="width:220px;background:#1a1a1a;border:1px solid #D4AF37;border-radius:6px;color:#fff;padding:12px 16px;font-size:16px;text-align:center;outline:none;display:block;margin:0 auto 12px;">
    <button onclick="checkPin()" class="mxb-btn-gold" style="width:220px;padding:12px;font-size:13px;">ENTRAR</button>
    <div id="mxb-pin-err" style="color:#e74c3c;font-size:12px;margin-top:10px;"></div>
  </div>
</div>

<script>
var SB_URL='${SB_URL}';
var SB_KEY='${SB_KEY}';
var PIN='1234567';
var EDITABLES=${editablesJson};
var SETTINGS=${settingsJson};
var editMode=false;
var cfg={};
var popover=null;

// ── PIN ──
var authed=false;
try{authed=sessionStorage.getItem('mxb_ed_auth')==='1';}catch(e){}
if(authed){
  document.getElementById('mxb-pin-screen').style.display='none';
  loadCfg();
}
function checkPin(){
  var v=document.getElementById('mxb-pin').value;
  if(v===PIN){
    try{sessionStorage.setItem('mxb_ed_auth','1');}catch(e){}
    document.getElementById('mxb-pin-screen').style.display='none';
    loadCfg();
  }else{
    document.getElementById('mxb-pin-err').textContent='Contraseña incorrecta';
  }
}
document.getElementById('mxb-pin').addEventListener('keydown',function(e){if(e.key==='Enter')checkPin();});

// ── Load config from Supabase ──
function loadCfg(){
  var keys=${JSON.stringify(CONFIG_KEYS)};
  fetch(SB_URL+'/rest/v1/mxb_config?key=in.('+keys.join(',')+')',{
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
  }).then(function(r){return r.json();}).then(function(rows){
    if(Array.isArray(rows))rows.forEach(function(r){cfg[r.key]=r.value||'';});
  }).catch(function(){});
}

// ── Edit mode toggle ──
function toggleEdit(){
  editMode=!editMode;
  var btn=document.getElementById('mxb-edit-btn');
  var hint=document.getElementById('mxb-hint');
  if(editMode){
    btn.style.background='#6b4f0e';btn.style.color='#fff';
    btn.textContent='✕ Salir edición';
    hint.textContent='Pasa el ratón por los elementos y haz clic para editar';
    hint.style.color='#D4AF37';
    activateFrame();
  }else{
    btn.style.background='#D4AF37';btn.style.color='#0B0B0B';
    btn.textContent='✏️ EDITAR PÁGINA';
    hint.textContent='';
    deactivateFrame();
    closePopover();
  }
}

// ── Inject editing into iframe DOM (same-origin) ──
function getFrameDoc(){
  var f=document.getElementById('portal-frame');
  try{return f.contentDocument||f.contentWindow.document;}catch(e){return null;}
}

function activateFrame(){
  var doc=getFrameDoc();
  if(!doc){setTimeout(activateFrame,500);return;}

  // Inject style
  if(!doc.getElementById('mxb-ed-style')){
    var s=doc.createElement('style');
    s.id='mxb-ed-style';
    s.textContent='.mxb-editable{outline:2px dashed #D4AF37!important;outline-offset:3px!important;cursor:pointer!important;position:relative!important;transition:outline-color .2s;}.mxb-editable::after{content:attr(data-mxb-label);position:absolute;top:0;left:0;background:#D4AF37;color:#0B0B0B;font-size:9px;font-weight:700;padding:2px 6px;letter-spacing:.5px;font-family:Arial,sans-serif;pointer-events:none;white-space:nowrap;z-index:9990;display:none;}.mxb-editable:hover::after{display:block;}';
    doc.head.appendChild(s);
  }

  // Tag elements
  setTimeout(function(){
    EDITABLES.forEach(function(def){
      def.selectors.forEach(function(sel){
        doc.querySelectorAll(sel).forEach(function(el){
          el.classList.add('mxb-editable');
          el.setAttribute('data-mxb-key',def.key);
          el.setAttribute('data-mxb-type',def.type);
          el.setAttribute('data-mxb-label','✏️ '+def.label);
          el.addEventListener('click',onFrameClick,true);
        });
      });
    });
  },800);
}

function deactivateFrame(){
  var doc=getFrameDoc();
  if(!doc)return;
  doc.querySelectorAll('.mxb-editable').forEach(function(el){
    el.classList.remove('mxb-editable');
    el.removeEventListener('click',onFrameClick,true);
  });
}

function onFrameClick(e){
  if(!editMode)return;
  e.preventDefault();e.stopPropagation();
  var el=e.currentTarget;
  openPopover(el.getBoundingClientRect(),el.getAttribute('data-mxb-key'),el.getAttribute('data-mxb-type'),el.getAttribute('data-mxb-label').replace('✏️ ',''));
}

// ── Popover ──
function openPopover(rect,key,type,label){
  closePopover();
  var currentVal=cfg[key]||'';
  var p=document.createElement('div');
  p.id='mxb-popover';

  var inp='';
  if(type==='textarea'){
    inp='<textarea id="mxb-pop-inp" class="mxb-inp" rows="4" style="margin-top:0;">'+esc(currentVal)+'</textarea>';
  }else if(type==='image'){
    inp='<input id="mxb-pop-inp" class="mxb-inp" type="url" placeholder="https://..." value="'+esc(currentVal)+'">'
      +(currentVal?'<img src="'+esc(currentVal)+'" style="width:100%;margin-top:8px;border-radius:4px;max-height:90px;object-fit:cover;" onerror="this.style.display=\'none\'">':'')
      +'<p style="color:#555;font-size:10px;margin-top:5px;">URL pública de la imagen</p>';
  }else{
    inp='<input id="mxb-pop-inp" class="mxb-inp" type="text" value="'+esc(currentVal)+'">';
  }

  p.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
    +'<span style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">'+esc(label)+'</span>'
    +'<button onclick="closePopover()" style="background:none;border:none;color:#666;font-size:20px;cursor:pointer;padding:0;line-height:1;">×</button>'
    +'</div>'
    +inp
    +'<div style="display:flex;gap:8px;margin-top:12px;">'
      +'<button onclick="saveField(\''+key+'\')" class="mxb-btn-gold" style="flex:1;">💾 GUARDAR</button>'
      +'<button onclick="closePopover()" class="mxb-btn-ghost">Cancelar</button>'
    +'</div>'
    +'<span id="mxb-pop-msg" style="display:block;font-size:11px;margin-top:8px;min-height:14px;"></span>';

  // position relative to iframe (offset by 50px toolbar)
  var frameTop=50;
  var top=frameTop+rect.bottom+8;
  if(top+300>window.innerHeight)top=Math.max(58,frameTop+rect.top-300);
  var left=Math.max(8,Math.min(rect.left,window.innerWidth-360));
  p.style.top=top+'px';
  p.style.left=left+'px';
  document.body.appendChild(p);
  popover=p;
  var i=document.getElementById('mxb-pop-inp');
  if(i){i.focus();if(i.select)i.select();}
}

function closePopover(){if(popover){popover.remove();popover=null;}}

function saveField(key){
  var inp=document.getElementById('mxb-pop-inp');
  if(!inp)return;
  var val=inp.value.trim();
  var msg=document.getElementById('mxb-pop-msg');
  if(msg){msg.textContent='Guardando...';msg.style.color='#888';}
  cfg[key]=val;
  fetch(SB_URL+'/rest/v1/mxb_config',{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'resolution=merge-duplicates'},
    body:JSON.stringify({key:key,value:val,updated_at:new Date().toISOString()})
  }).then(function(r){
    if(r.ok){
      if(msg){msg.textContent='✓ Guardado';msg.style.color='#4caf50';}
      applyLive(key,val);
      setTimeout(closePopover,900);
    }else{
      if(msg){msg.textContent='❌ Error al guardar';msg.style.color='#e74c3c';}
    }
  }).catch(function(){
    if(msg){msg.textContent='❌ Sin conexión';msg.style.color='#e74c3c';}
  });
}

function applyLive(key,val){
  var doc=getFrameDoc();
  if(!doc)return;
  function setQ(sel){doc.querySelectorAll(sel).forEach(function(el){el.textContent=val;});}
  function setId(id){var el=doc.getElementById(id);if(el)el.textContent=val;}
  function setSrc(id){var el=doc.getElementById(id);if(el)el.src=val;}
  switch(key){
    case 'hub_title': setQ('.mhv-title'); break;
    case 'hub_subtitle': setQ('.mhv-sub'); break;
    case 'hub_footer': setQ('.hub-footer-tagline'); break;
    case 'announcement_banner':
      var bar=doc.getElementById('mxb-announcement-bar');
      if(bar){var sp=bar.querySelector('span');if(sp)sp.textContent=val;}
      break;
    case 'premium_title': setId('hubPremiumUpgradeTitle'); break;
    case 'premium_desc':  setId('hubPremiumUpgradeDesc'); break;
    case 'premium_cta':   setId('hubPremiumUpgradeCta'); break;
    case 'premium_hero_image': setSrc('hubPremiumUpgradeImage'); setSrc('premiumHeroImageV45'); break;
    case 'gala_image': setSrc('premiumGalaImage'); break;
  }
}

// ── Settings modal ──
function openSettings(){
  closePopover();
  if(document.getElementById('mxb-modal-bg'))return;
  var rows=SETTINGS.map(function(f){
    var v=cfg[f.key]||'';
    var inp=f.type==='textarea'
      ?'<textarea id="mxbs-'+f.key+'" class="mxb-inp" rows="2">'+esc(v)+'</textarea>'
      :'<input id="mxbs-'+f.key+'" class="mxb-inp" type="text" value="'+esc(v)+'">';
    return '<div style="margin-bottom:14px;"><label class="mxb-label">'+esc(f.label)+'</label>'+inp+'</div>';
  }).join('');

  var bg=document.createElement('div');
  bg.id='mxb-modal-bg';
  bg.innerHTML='<div id="mxb-modal">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">'
      +'<span style="color:#D4AF37;font-size:14px;font-weight:700;">⚙️ URLs &amp; Eventos</span>'
      +'<button onclick="document.getElementById(\'mxb-modal-bg\').remove()" style="background:none;border:none;color:#666;font-size:22px;cursor:pointer;line-height:1;">×</button>'
    +'</div>'
    +rows
    +'<div style="display:flex;gap:10px;margin-top:4px;">'
      +'<button onclick="saveSettings()" class="mxb-btn-gold" style="flex:1;">💾 GUARDAR TODO</button>'
      +'<button onclick="document.getElementById(\'mxb-modal-bg\').remove()" class="mxb-btn-ghost">Cancelar</button>'
    +'</div>'
    +'<span id="mxbs-msg" style="display:block;font-size:11px;margin-top:10px;min-height:14px;text-align:center;"></span>'
  +'</div>';
  document.body.appendChild(bg);
}

function saveSettings(){
  var keys=SETTINGS.map(function(f){return f.key;});
  var msg=document.getElementById('mxbs-msg');
  if(msg){msg.textContent='Guardando...';msg.style.color='#888';}
  Promise.all(keys.map(function(k){
    var el=document.getElementById('mxbs-'+k);
    var val=el?el.value.trim():'';
    cfg[k]=val;
    return fetch(SB_URL+'/rest/v1/mxb_config',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({key:k,value:val,updated_at:new Date().toISOString()})
    });
  })).then(function(){
    if(msg){msg.textContent='✓ Todo guardado correctamente';msg.style.color='#4caf50';}
    setTimeout(function(){var m=document.getElementById('mxb-modal-bg');if(m)m.remove();},1200);
  }).catch(function(){
    if(msg){msg.textContent='❌ Error al guardar';msg.style.color='#e74c3c';}
  });
}

// Close popover on outside click
document.addEventListener('click',function(e){
  if(popover&&!popover.contains(e.target))closePopover();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closePopover();}});

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
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
