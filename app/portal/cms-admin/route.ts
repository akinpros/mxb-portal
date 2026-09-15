import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const PIN = '1234567'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const auth = url.searchParams.get('auth')
  const cmsEngineJs = fs.readFileSync(path.join(process.cwd(), 'public', 'cms', 'cms-engine.js'), 'utf-8')

  const pinScreen = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CMS Admin · Movies × Brands</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0b0b0b;color:#e8d5c4;font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{background:#111;border:1px solid #272727;border-radius:12px;padding:40px;text-align:center;width:320px}
.logo{color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}
h1{font-size:18px;font-weight:600;margin-bottom:24px}
input{width:100%;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#e8d5c4;font-size:20px;letter-spacing:6px;padding:14px;text-align:center;margin-bottom:16px;outline:none}
input:focus{border-color:#D4AF37}
button{width:100%;background:#D4AF37;color:#0b0b0b;border:none;border-radius:8px;font-size:14px;font-weight:700;padding:14px;cursor:pointer}
.err{color:#e55;font-size:13px;margin-top:12px;display:none}
</style>
</head>
<body>
<div class="box">
  <div class="logo">Movies × Brands</div>
  <h1>CMS — Panel de Administración</h1>
  <input id="pin" type="password" placeholder="PIN" maxlength="10" autofocus>
  <button onclick="go()">Entrar</button>
  <div class="err" id="err">PIN incorrecto</div>
</div>
<script>
function go(){
  const v=document.getElementById('pin').value;
  if(v==='${PIN}'){location.href='/portal/cms-admin?auth=${PIN}';}
  else{document.getElementById('err').style.display='block';}
}
document.getElementById('pin').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
</script>
</body>
</html>`

  if (auth !== PIN) {
    return new NextResponse(pinScreen, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
  }

  const adminHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Administración · Movies × Brands</title>
  <link rel="stylesheet" href="/cms/cms-admin.css">
  <style>.cms-toolbar button.primary{padding:13px 8px;box-shadow:0 0 0 3px rgba(201,162,39,.14);animation:cmsPulse 1.8s ease-in-out infinite}.cms-topbar{border-bottom:2px solid #c9a227}.cms-topbar strong{color:#c9a227}.cms-topbar span{color:#ccc}.cms-inspector-body video,.cms-inspector-body iframe{display:block;width:100%;height:190px;object-fit:contain;background:#080808;border:1px solid #333;border-radius:8px;margin-bottom:12px}.cms-media-drop{border:2px dashed #7a672b;border-radius:10px;background:#1c190f;padding:16px;margin:12px 0 16px;text-align:center;color:#ddd;line-height:1.5}.cms-media-drop.dragging{border-color:#c9a227;background:#29220d}.cms-media-drop strong{display:block;color:#c9a227;margin-bottom:4px}.cms-replace-native{display:block!important;border:2px solid #c9a227!important;border-radius:9px!important;background:#c9a227!important;color:#080808!important;padding:13px!important;margin:12px 0!important;text-align:center!important;font-size:14px!important;font-weight:800!important;cursor:pointer}.cms-replace-native span{display:block;font-size:11px;font-weight:600;margin:4px 0 8px}.cms-replace-native input{background:#fff!important;color:#111!important;border:1px solid #7b651d!important;margin:0!important;cursor:pointer}@keyframes cmsPulse{50%{box-shadow:0 0 0 7px rgba(201,162,39,.05)}}</style>
</head>
<body>
  <aside class="cms-sidebar">
    <header class="cms-brand"><span>ADMINISTRACIÓN</span><strong>MOVIES × BRANDS</strong><small>Editor visual del portal</small></header>
    <div class="cms-toolbar">
      <button id="cmsNavigate">Navegar por el portal</button>
      <button id="cmsSelect" class="primary">Editar elementos</button>
      <button id="cmsUndo">Deshacer</button><button id="cmsRedo">Rehacer</button>
    </div>
    <label class="cms-search"><span>Buscar sección o contenido</span><input id="cmsSearch" type="search" placeholder="Ej. Cannes, Academy, imagen…"></label>
    <nav id="cmsTree" class="cms-tree" aria-label="Contenido del portal"></nav>
    <footer><button id="cmsImport">Importar copia</button><button id="cmsExport">Exportar copia</button><button id="cmsReset" class="danger">Restaurar original</button></footer>
  </aside>
  <main class="cms-stage">
    <div class="cms-topbar">
      <div><strong id="cmsStatus">MODO EDICIÓN: haz clic directamente en el portal</strong><span id="cmsSelectionPath">Puedes seleccionar cualquier texto, imagen, vídeo, botón o bloque</span></div>
      <div class="cms-actions"><button id="cmsDiscard" class="danger">Volver atrás</button><button id="cmsPreview">Previsualizar cambios</button><button id="cmsDraft">Guardar cambios</button><button id="cmsPublish" class="publish">Publicar cambios</button></div>
    </div>
    <iframe id="portalFrame" src="/portal/cms-preview" title="Vista previa del portal"></iframe>
  </main>
  <aside id="cmsInspector" class="cms-inspector" aria-label="Inspector">
    <header><div><small>ELEMENTO SELECCIONADO</small><h2 id="cmsElementName">Ninguno</h2></div><button id="cmsCloseInspector" aria-label="Cerrar">×</button></header>
    <div id="cmsInspectorBody" class="cms-inspector-body"><p class="empty">Haz clic sobre un elemento del portal para editarlo.</p></div>
  </aside>
  <input id="cmsImportFile" type="file" accept="application/json" hidden>
  <input id="cmsQuickMediaFile" type="file" aria-label="Seleccionar archivo para reemplazar" style="position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0">
  <script>${cmsEngineJs}</script>
  <script>
  (function(){
    var f = document.getElementById('portalFrame');
    var mounted = false;
    function bypassAuth(){
      try {
        var iw = f.contentWindow;
        if(typeof iw.enterProfile === 'function') iw.enterProfile();
      } catch(e) {}
    }
    function mountAfterLoad(){
      if(mounted) return;
      mounted = true;
      // 1. Call enterProfile so the portal is fully in dashboard state
      bypassAuth();
      // 2. Mount CMS after a short delay so state.doc captures the settled document
      setTimeout(function(){
        bypassAuth();
        MXBCMS.mountAdmin(f);
      }, 800);
    }
    f.addEventListener('load', mountAfterLoad);
    // Fallback: if iframe already loaded before this script runs
    if(f.contentDocument && f.contentDocument.readyState === 'complete'){
      mountAfterLoad();
    }
  })();
  </script>
</body>
</html>`

  return new NextResponse(adminHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
