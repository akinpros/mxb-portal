(function(){
  'use strict';
  const mediaCache=new Map();
  const state={frame:null,doc:null,mode:'viewer',selected:null,changes:[],draft:[],history:[],future:[],selecting:true,observer:null};
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const safeParse=(v,f=[])=>{try{return JSON.parse(v)||f}catch(e){return f}};
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=()=>`cms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

  // --- API helpers (replace localStorage) ---
  async function apiGet(type){try{const r=await fetch('/api/cms?type='+type);return r.ok?await r.json():[];}catch(e){return[];}}
  async function apiPost(type,changes){try{await fetch('/api/cms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,changes})});}catch(e){}}
  async function apiDelete(type){try{await fetch('/api/cms?type='+type,{method:'DELETE'});}catch(e){}}

  function nodeLabel(el){
    if(!el)return 'Elemento';
    if(el.tagName==='IMG')return `Seleccionar imagen · doble clic para reemplazar`;
    if(el.tagName==='VIDEO'||el.tagName==='IFRAME')return 'Seleccionar vídeo · doble clic para reemplazar';
    const txt=(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,58);
    return txt||`${el.tagName.toLowerCase()}${el.id?' · '+el.id:''}`;
  }
  function cssPath(el){
    if(!el||el===state.doc.body)return 'body';
    if(el.id)return '#'+CSS.escape(el.id);
    const parts=[];let n=el;
    while(n&&n!==state.doc.body&&parts.length<25){
      if(n.id){parts.unshift('#'+CSS.escape(n.id));return parts.join(' > ')}
      let p=n.tagName.toLowerCase();
      if(n.classList.length)p+='.'+[...n.classList].filter(x=>!x.startsWith('mxb-cms-')).slice(0,2).map(CSS.escape).join('.');
      const parent=n.parentElement;
      if(parent){const same=[...parent.children].filter(x=>x.tagName===n.tagName);if(same.length>1)p+=`:nth-of-type(${same.indexOf(n)+1})`;}
      parts.unshift(p);n=parent;
    }
    return 'body > '+parts.join(' > ');
  }
  function findTarget(change){try{return state.doc.querySelector(change.selector)}catch(e){return null}}
  function applyChange(change){
    const el=findTarget(change);if(!el)return false;
    if(!change._resolved&&typeof change.value==='string'&&change.value.startsWith('idb:')&&['replaceImage','replaceBackground','replaceVideo'].includes(change.op)){
      resolveMedia(change.value,value=>applyChange({...change,value,_resolved:true}));return true;
    }
    if(change.op==='text')el.innerHTML=change.value;
    if(change.op==='attr'){if(change.value===null||change.value==='')el.removeAttribute(change.name);else el.setAttribute(change.name,change.value)}
    if(change.op==='replaceImage'){
      el.removeAttribute('srcset');el.removeAttribute('sizes');el.setAttribute('src',change.value);
      const picture=el.closest('picture');if(picture)picture.querySelectorAll('source').forEach(source=>{source.removeAttribute('srcset');source.removeAttribute('sizes')});
    }
    if(change.op==='replaceVideo'){
      if(el.tagName==='VIDEO'){
        el.querySelectorAll('source').forEach(source=>source.remove());el.src=change.value;el.controls=true;el.load?.();
      }else{
        const video=state.doc.createElement('video');video.src=change.value;video.controls=true;video.playsInline=true;video.className=el.className;video.style.cssText=el.style.cssText;
        [...el.attributes].forEach(a=>{if(!['src','class','style'].includes(a.name))video.setAttribute(a.name,a.value)});el.replaceWith(video);
      }
    }
    if(change.op==='replaceBackground')el.style.backgroundImage=`url("${String(change.value||'').replace(/"/g,'\\"')}")`;
    if(change.op==='style')el.style[change.name]=change.value||'';
    if(change.op==='hide')el.style.display=change.value?'none':'';
    if(change.op==='delete')el.remove();
    if(change.op==='duplicate'&&change.html&&!state.doc.querySelector(`[data-cms-clone="${change.id}"]`)){const wrap=state.doc.createElement('template');wrap.innerHTML=change.html;const clone=wrap.content.firstElementChild;if(clone){clone.dataset.cmsClone=change.id;el.insertAdjacentElement('afterend',clone)}}
    if(change.op==='move'&&el.dataset.cmsMove!==change.id){const sib=change.direction==='up'?el.previousElementSibling:el.nextElementSibling;if(sib){if(change.direction==='up')sib.before(el);else sib.after(el);el.dataset.cmsMove=change.id}}
    return true;
  }
  function applyAll(changes){changes.forEach(applyChange)}
  function loaded(frame,mode){
    state.frame=frame;state.mode=mode;
    let initializedDocument=null;
    const initialize=async ()=>{
      if(!frame.contentDocument||frame.contentDocument===initializedDocument)return;
      initializedDocument=frame.contentDocument;
      state.doc=frame.contentDocument;
      if(mode==='admin'){
        state.changes=await apiGet('published');
        const draft=await apiGet('draft');
        state.draft=draft&&draft.length?draft:[...state.changes];
        applyAll(state.draft.length?state.draft:state.changes);
        setupAdminDocument();
      }else{
        const preview=location.search.includes('preview=1');
        const changes=await apiGet(preview?'preview':'published');
        applyAll(changes);
        watchAndReapply();
      }
    };
    frame.addEventListener('load',initialize);
    if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')initialize();
  }
  function watchAndReapply(){
    if(state.observer)state.observer.disconnect();
    let timer;state.observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(async()=>{
      const preview=location.search.includes('preview=1');
      applyAll(await apiGet(preview?'preview':'published'));
    },100)});
    state.observer.observe(state.doc.body,{childList:true,subtree:true});
  }
  function adminCss(){
    const st=state.doc.createElement('style');st.id='mxb-cms-admin-runtime';st.textContent=`
      .mxb-cms-hover{outline:2px dashed #c9a227!important;outline-offset:2px!important;cursor:pointer!important}
      .mxb-cms-selected{outline:3px solid #c9a227!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(201,162,39,.22)!important}
      .mxb-cms-drop-target{outline:4px dashed #c9a227!important;outline-offset:4px!important;filter:brightness(1.08)}
      body.mxb-cms-editing iframe{pointer-events:none!important}
      .mxb-cms-badge{position:fixed;z-index:2147483647;background:#0b0b0b;color:#e8d5c4;border:1px solid #c9a227;border-radius:5px;padding:6px 9px;font:11px Inter,Arial,sans-serif;pointer-events:none;display:none;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;
    state.doc.head.appendChild(st);const b=state.doc.createElement('div');b.className='mxb-cms-badge';state.doc.body.appendChild(b);return b;
  }
  function setupAdminDocument(){
    const badge=adminCss();
    state.doc.addEventListener('mouseover',e=>{if(!state.selecting)return;const el=selectable(e.target);if(!el)return;el.classList.add('mxb-cms-hover');badge.textContent=nodeLabel(el);badge.style.display='block'} ,true);
    state.doc.addEventListener('mousemove',e=>{badge.style.left=Math.min(e.clientX+14,state.frame.clientWidth-300)+'px';badge.style.top=(e.clientY+14)+'px'},true);
    state.doc.addEventListener('mouseout',e=>{e.target.classList?.remove('mxb-cms-hover');badge.style.display='none'},true);
    state.doc.addEventListener('click',e=>{
      if(!state.selecting)return;
      const el=selectable(e.target);if(!el)return;
      if(isPortalNavigation(e.target)){setTimeout(()=>{buildTree();setStatus('Página abierta · selecciona el contenido que quieras editar')},80);return}
      e.preventDefault();e.stopPropagation();selectElement(el)
    },true);
    state.doc.addEventListener('dblclick',e=>{
      if(!state.selecting)return;
      const el=selectable(e.target);if(!el)return;e.preventDefault();e.stopPropagation();quickEdit(el);
    },true);
    state.doc.addEventListener('dragover',e=>{
      if(!state.selecting||!e.dataTransfer?.types?.includes('Files'))return;const el=mediaTarget(e.target);if(!el)return;e.preventDefault();e.dataTransfer.dropEffect='copy';
      state.doc.querySelectorAll('.mxb-cms-drop-target').forEach(x=>x.classList.remove('mxb-cms-drop-target'));el.classList.add('mxb-cms-drop-target');
    },true);
    state.doc.addEventListener('dragleave',e=>{e.target?.classList?.remove('mxb-cms-drop-target')},true);
    state.doc.addEventListener('drop',e=>{
      if(!state.selecting)return;const el=mediaTarget(e.target),file=e.dataTransfer?.files?.[0];if(!el||!file)return;e.preventDefault();e.stopPropagation();
      state.doc.querySelectorAll('.mxb-cms-drop-target').forEach(x=>x.classList.remove('mxb-cms-drop-target'));selectElement(el);replaceWithFile(el,file);
    },true);
    watchAndReapply();buildTree();bindAdmin();setStatus();
  }
  function selectable(el){
    if(!el||el.closest('#mxb-cms-admin-runtime,.mxb-cms-badge'))return null;
    if(el.nodeType!==1)return el.parentElement;
    const direct=mediaTarget(el);if(direct)return direct;
    if(el.matches('img,video,iframe,h1,h2,h3,h4,h5,h6,p,li,a,button,label,input,textarea,section,article,.card,[class*="card"],[class*="hero"],[class*="banner"]'))return el;
    return el.closest('p,h1,h2,h3,h4,h5,h6,li,a,button,section,article,div')||el;
  }
  function isPortalNavigation(el){
    const control=el?.closest?.('.sidebar-link,[data-view],nav a,nav button');if(!control)return false;
    const action=(control.getAttribute('onclick')||'')+' '+(control.dataset.view||'');
    return control.classList.contains('sidebar-link')||/showView|open[A-Za-z]+View|powerList|memberHub|subscription|academy|community/i.test(action);
  }
  function mediaTarget(el){
    if(!el||el.nodeType!==1)return null;if(el.matches('img,video,iframe'))return el;
    let n=el;for(let i=0;n&&i<4;i++,n=n.parentElement){
      if(backgroundUrl(n)&&(!(n.textContent||'').trim()||n===el))return n;
      if(/photo|image|media|video|avatar|portrait|cover|thumb|visual|player/i.test(n.className||'')){
        const media=n.querySelectorAll('img,video,iframe');if(media.length===1)return media[0];
      }
    }return null;
  }
  function selectElement(el){
    state.doc.querySelectorAll('.mxb-cms-selected').forEach(x=>x.classList.remove('mxb-cms-selected'));
    state.selected=el;el.classList.remove('mxb-cms-hover');el.classList.add('mxb-cms-selected');el.scrollIntoView({behavior:'smooth',block:'center'});
    q('#cmsInspector').classList.add('open');q('#cmsElementName').textContent=nodeLabel(el);q('#cmsSelectionPath').textContent=cssPath(el);renderInspector(el);
  }
  function backgroundUrl(el){const bg=state.frame.contentWindow.getComputedStyle(el).backgroundImage||'';const m=bg.match(/^url\(["']?(.*?)["']?\)$/);return m?m[1]:''}
  function typeOf(el){if(el.tagName==='IMG')return'image';if(el.tagName==='VIDEO'||el.tagName==='IFRAME'||(el.tagName==='SOURCE'))return'video';if(backgroundUrl(el))return'background';if(/^(H[1-6]|P|SPAN|A|BUTTON|LI|LABEL)$/.test(el.tagName))return'text';if(!el.querySelector('img,video,iframe')&&el.childElementCount===0&&(el.textContent||'').trim())return'text';return'block'}
  function renderInspector(el){
    const type=typeOf(el),path=cssPath(el);let html='';
    if(type==='image')html=`<p class="hint"><strong>IMAGEN SELECCIONADA</strong><br>Reemplázala desde tu ordenador.</p><img id="insImagePreview" src="${esc(el.currentSrc||el.src)}" alt="Vista previa">${mediaDropHtml('imagen')}<label>Texto alternativo<input id="insAlt" value="${esc(el.alt)}"></label><label>Reemplazar imagen por URL<input id="insSrc" value="${esc(el.getAttribute('src')||'')}"></label><label>Ajuste<select id="insFit"><option value="cover">Cubrir bloque</option><option value="contain">Mostrar completa</option><option value="fill">Estirar</option></select></label>`;
    else if(type==='background')html=`<p class="hint"><strong>IMAGEN DE FONDO SELECCIONADA</strong></p><img id="insImagePreview" src="${esc(backgroundUrl(el))}" alt="Vista previa">${mediaDropHtml('imagen')}<label>Reemplazar imagen de fondo por URL<input id="insSrc" value="${esc(backgroundUrl(el))}"></label>`;
    else if(type==='video')html=`<p class="hint"><strong>VÍDEO SELECCIONADO</strong><br>Reemplázalo desde tu ordenador.</p>${el.tagName==='IFRAME'?`<iframe id="insVideoPreview" src="${esc(el.getAttribute('src')||'')}" title="Vista previa del vídeo"></iframe>`:`<video id="insVideoPreview" src="${esc(el.currentSrc||el.getAttribute('src')||'')}" controls></video>`}${mediaDropHtml('vídeo')}<label>Reemplazar vídeo por URL<input id="insSrc" value="${esc(el.getAttribute('src')||'')}"></label><p class="hint">Para archivos grandes conectar la biblioteca multimedia de producción.</p>`;
    else if(type==='text')html=`<p class="hint"><strong>TEXTO SELECCIONADO</strong><br>Doble clic sobre el texto para editarlo directamente en el portal.</p><label>Contenido<textarea id="insText">${esc(el.innerHTML)}</textarea></label><label>Enlace<input id="insHref" value="${esc(el.getAttribute('href')||'')}" placeholder="https://…"></label><div class="row"><label>Color<input id="insColor" type="color" value="${toHex(getComputedStyle(el).color)}"></label><label>Alineación<select id="insAlign"><option>left</option><option>center</option><option>right</option></select></label></div>`;
    else html=`<p class="hint">Este bloque puede duplicarse, ocultarse, reorganizarse o eliminarse completo. Sus elementos interiores también pueden editarse individualmente.</p><label>Nombre interno<input id="insInternal" value="${esc(el.dataset.cmsName||nodeLabel(el))}"></label>`;
    html+=`<hr><div class="row"><button id="insUp">Subir</button><button id="insDown">Bajar</button></div><button id="insDuplicate">Duplicar bloque</button><button id="insHide">${el.style.display==='none'?'Mostrar':'Ocultar'} elemento</button><button id="insDelete" class="danger">Eliminar elemento</button>`;
    q('#cmsInspectorBody').innerHTML=html;
    if(q('#insText'))q('#insText').oninput=e=>record({op:'text',selector:path,value:e.target.value});
    if(q('#insHref'))q('#insHref').onchange=e=>record({op:'attr',selector:path,name:'href',value:e.target.value});
    if(q('#insAlt'))q('#insAlt').onchange=e=>record({op:'attr',selector:path,name:'alt',value:e.target.value});
    if(q('#insSrc'))q('#insSrc').onchange=e=>{record(type==='image'?{op:'replaceImage',selector:path,value:e.target.value}:type==='background'?{op:'replaceBackground',selector:path,value:e.target.value}:{op:'attr',selector:path,name:'src',value:e.target.value});if((type==='image'||type==='background')&&q('#insImagePreview'))q('#insImagePreview').src=e.target.value;if(type==='video'&&q('#insVideoPreview'))q('#insVideoPreview').src=e.target.value};
    if(q('#insMediaNative'))q('#insMediaNative').onchange=e=>replaceWithFile(el,e.target.files[0]);
    if(q('#insMediaDrop')){const dz=q('#insMediaDrop');dz.ondragover=e=>{e.preventDefault();dz.classList.add('dragging')};dz.ondragleave=()=>dz.classList.remove('dragging');dz.ondrop=e=>{e.preventDefault();dz.classList.remove('dragging');replaceWithFile(el,e.dataTransfer.files[0])}}
    if(q('#insFit')){q('#insFit').value=el.style.objectFit||'cover';q('#insFit').onchange=e=>record({op:'style',selector:path,name:'objectFit',value:e.target.value})}
    if(q('#insColor'))q('#insColor').oninput=e=>record({op:'style',selector:path,name:'color',value:e.target.value});
    if(q('#insAlign')){q('#insAlign').value=getComputedStyle(el).textAlign;q('#insAlign').onchange=e=>record({op:'style',selector:path,name:'textAlign',value:e.target.value})}
    q('#insDuplicate').onclick=()=>record({op:'duplicate',selector:path,id:uid(),html:el.outerHTML.replace(/ mxb-cms-selected/g,'')});
    q('#insHide').onclick=()=>record({op:'hide',selector:path,value:el.style.display!=='none'});
    q('#insDelete').onclick=()=>{if(confirm('¿Eliminar este elemento del portal? Podrás deshacerlo antes de publicar.'))record({op:'delete',selector:path})};
    q('#insUp').onclick=()=>record({op:'move',selector:path,direction:'up',id:uid()});q('#insDown').onclick=()=>record({op:'move',selector:path,direction:'down',id:uid()});
  }
  function mediaDropHtml(kind){const feminine=kind==='imagen',accept=feminine?'image/*':'video/*';return `<label class="cms-replace-native">REEMPLAZAR<span>Selecciona una nueva ${kind} desde tu ordenador</span><input id="insMediaNative" type="file" accept="${accept}"></label><div id="insMediaDrop" class="cms-media-drop"><strong>O arrastra aquí tu ${kind}</strong>La ${kind} actual será sustituida</div>`}
  function openMediaPicker(el){
    const type=typeOf(el),input=q('#cmsQuickMediaFile');input.value='';input.accept=type==='video'?'video/*':'image/*';input.onchange=e=>replaceWithFile(el,e.target.files[0]);
    try{if(typeof input.showPicker==='function')input.showPicker();else input.click()}catch(e){input.click()}
  }
  function replaceWithFile(el,file){
    if(!file)return;const type=typeOf(el),isVideo=type==='video';
    const ext=(file.name.split('.').pop()||'').toLowerCase(),videoExt=['mp4','webm','mov','m4v','ogv'],imageExt=['jpg','jpeg','png','webp','gif','avif','svg','heic','heif'];
    if(isVideo&&!file.type.startsWith('video/')&&!videoExt.includes(ext))return alert('Selecciona un archivo de vídeo válido.');
    if(!isVideo&&!file.type.startsWith('image/')&&!imageExt.includes(ext))return alert('Selecciona un archivo de imagen válido.');
    setStatus(`Procesando ${isVideo?'vídeo':'imagen'}…`);
    const path=cssPath(el);uploadSmall(file,(data,previewUrl)=>{
      record(type==='image'?{op:'replaceImage',selector:path,value:data}:type==='background'?{op:'replaceBackground',selector:path,value:data}:{op:'replaceVideo',selector:path,value:data});
      const preview=q(isVideo?'#insVideoPreview':'#insImagePreview');if(preview)preview.src=previewUrl||data;
      setStatus(`${isVideo?'Vídeo':'Imagen'} reemplazad${isVideo?'o':'a'} · guarda, previsualiza o publica`);
    });
  }
  function quickEdit(el){
    selectElement(el);const type=typeOf(el),path=cssPath(el);
    if(type==='image'||type==='background'||type==='video'){openMediaPicker(el);return;}
    if(type==='text'){
      const original=el.innerHTML;el.contentEditable='true';el.focus();
      const range=state.doc.createRange();range.selectNodeContents(el);const selection=state.frame.contentWindow.getSelection();selection.removeAllRanges();selection.addRange(range);
      const finish=()=>{el.contentEditable='false';el.removeEventListener('blur',finish);if(el.innerHTML!==original)record({op:'text',selector:path,value:el.innerHTML})};
      el.addEventListener('blur',finish);el.addEventListener('keydown',ev=>{if(ev.key==='Escape'){el.innerHTML=original;el.blur()}if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter')el.blur()},{once:false});
      setStatus('EDITANDO TEXTO · escribe directamente y haz clic fuera para guardar el cambio');
    }
  }
  function record(change){
    state.history.push(JSON.stringify(state.draft));state.future=[];
    const ix=state.draft.findIndex(x=>x.selector===change.selector&&x.op===change.op&&x.name===change.name);
    if(['text','attr','style','hide','replaceImage','replaceBackground','replaceVideo'].includes(change.op)&&ix>=0)state.draft[ix]=change;else state.draft.push(change);
    applyChange(change);apiPost('draft',state.draft);setStatus();buildTree();
  }
  function restoreDraft(serial){apiPost('draft',JSON.parse(serial)).then(()=>state.frame.contentWindow.location.reload())}
  function undo(){if(!state.history.length)return;state.future.push(JSON.stringify(state.draft));restoreDraft(state.history.pop())}
  function redo(){if(!state.future.length)return;state.history.push(JSON.stringify(state.draft));restoreDraft(state.future.pop())}
  function toHex(c){const m=String(c).match(/\d+/g);return m&&m.length>=3?'#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join(''):'#ffffff'}
  function mediaDb(done){const req=indexedDB.open('mxb_cms_media_v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>done(req.result);req.onerror=()=>alert('No se pudo abrir el almacenamiento multimedia del navegador.')}
  function resolveMedia(ref,done){if(!String(ref).startsWith('idb:'))return done(ref);if(mediaCache.has(ref))return done(mediaCache.get(ref));mediaDb(db=>{const req=db.transaction('files').objectStore('files').get(ref.slice(4));req.onsuccess=()=>{if(req.result){const url=URL.createObjectURL(req.result);mediaCache.set(ref,url);done(url)}}})}
  function uploadSmall(file,done){
    if(!file)return;if(file.size>100*1024*1024)return alert('Selecciona un archivo de hasta 100 MB.');
    if(file.size<=1500*1024){const r=new FileReader();r.onload=()=>done(r.result,r.result);r.onerror=()=>alert('No se pudo leer el archivo seleccionado.');r.readAsDataURL(file);return}
    const key=`media-${Date.now()}-${Math.random().toString(36).slice(2)}`;mediaDb(db=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,key);tx.oncomplete=()=>done(`idb:${key}`,URL.createObjectURL(file));tx.onerror=()=>alert('No se pudo guardar el archivo. Prueba con uno de menor tamaño.')});
  }
  async function preview(){
    await apiPost('preview',state.draft.length?state.draft:state.changes);
    window.open('/portal/cms-preview?preview=1','_blank');
  }
  async function publish(){
    await apiPost('published',state.draft);
    await apiDelete('draft');
    await apiDelete('preview');
    state.changes=[...state.draft];state.history=[];state.future=[];
    setStatus('CAMBIOS PUBLICADOS · ya son visibles en el portal para todos los usuarios');
  }
  async function discard(){
    if(!confirm('¿Volver a la última versión publicada y descartar los cambios sin publicar?'))return;
    await apiDelete('draft');await apiDelete('preview');
    state.draft=[...state.changes];state.history=[];state.future=[];
    state.frame.contentWindow.location.reload();setStatus('Cambios sin publicar descartados');
  }
  function setStatus(msg){const n=state.draft.length;q('#cmsStatus').textContent=msg||(n?`${n} cambio${n===1?'':'s'} pendiente${n===1?'':'s'}`:'Sin cambios pendientes')}
  function setMode(editing,msg){
    state.selecting=editing;
    state.doc?.body.classList.toggle('mxb-cms-editing',editing);
    const edit=q('#cmsSelect'),navigate=q('#cmsNavigate');
    if(edit)edit.classList.toggle('primary',editing);if(navigate)navigate.classList.toggle('primary',!editing);
    if(edit)edit.textContent=editing?'✓ EDITAR ELEMENTOS':'Editar elementos';
    if(navigate)navigate.textContent=editing?'Navegar por el portal':'✓ NAVEGACIÓN ACTIVA';
    if(!editing){
      q('#cmsInspector')?.classList.remove('open');
      if(state.doc)state.doc.querySelectorAll('.mxb-cms-selected,.mxb-cms-hover').forEach(el=>el.classList.remove('mxb-cms-selected','mxb-cms-hover'));
      state.selected=null;
    }
    q('#cmsStatus').textContent=msg||(editing?'MODO EDICIÓN · haz clic sobre texto, imagen, vídeo o bloque':'MODO NAVEGACIÓN · navega por el portal y cuando quieras editar pulsa "Editar elementos"');
    q('#cmsSelectionPath').textContent=editing?'Después podrás reemplazar, duplicar, eliminar o editar':'Cuando llegues a la página deseada, pulsa "Editar elementos"';
  }
  function exportData(){const blob=new Blob([JSON.stringify({product:'Movies × Brands CMS',version:1,exportedAt:new Date().toISOString(),changes:state.draft.length?state.draft:state.changes},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`moviesxbrands-cms-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
  function importData(file){if(!file)return;const r=new FileReader();r.onload=async()=>{const d=safeParse(r.result,{});if(!Array.isArray(d.changes))return alert('La copia no es válida.');await apiPost('draft',d.changes);state.frame.contentWindow.location.reload()};r.readAsText(file)}
  function buildTree(){
    if(!state.doc)return;const root=q('#cmsTree'),search=(q('#cmsSearch')?.value||'').toLowerCase();
    const candidates=qa('main[id],section[id],[id$="View"],[class*="hero"],[class*="banner"]',state.doc).filter((x,i,a)=>a.indexOf(x)===i).slice(0,180);
    const groups={Páginas:[],Secciones:[],Banners:[]};
    candidates.forEach(el=>{const label=nodeLabel(el);if(search&&!label.toLowerCase().includes(search)&&!(el.id||'').toLowerCase().includes(search))return;const g=/View$/.test(el.id)?'Páginas':/hero|banner/i.test(el.className)?'Banners':'Secciones';groups[g].push({el,label})});
    root.innerHTML=Object.entries(groups).map(([g,items])=>items.length?`<button class="group">${g} · ${items.length}</button>${items.slice(0,60).map((x,i)=>`<button class="item" data-g="${g}" data-i="${i}">${esc(g==='Páginas'?pageLabel(x.el):x.label)}</button>`).join('')}`:'').join('');
    Object.entries(groups).forEach(([g,items])=>items.slice(0,60).forEach((x,i)=>{const b=root.querySelector(`[data-g="${g}"][data-i="${i}"]`);if(b)b.onclick=()=>g==='Páginas'?openPage(x.el):selectElement(x.el)}));
  }
  function pageLabel(el){
    const names={homeView:'Inicio',hubView:'Member Hub',messagesView:'Mensajes',academyView:'AI Academy',fovView:'Future of Voices',brandPartnersView:'Brand & Partnerships',premiumExperiencesView:'Experiencias Premium',termsView:'Términos',supportView:'Ayuda y soporte',communityView:'Comunidad',globalTalentAccessView:'Global Talent Access',globalTalentProfileView:'Perfil de talento',powerListView:'Power List',powerListProfileView:'Perfil Power List',contenidoOficialView:'Contenido oficial',subscriptionView:'Mi suscripción',moreView:'Más opciones'};
    return names[el.id]||el.querySelector('h1,h2')?.textContent?.trim().slice(0,55)||el.id||'Página';
  }
  function openPage(el){
    const d=state.doc;['loginScreen','paymentScreen','pendingArea'].forEach(id=>{const n=d.getElementById(id);if(n)n.style.display='none'});const profile=d.getElementById('profileArea');if(profile)profile.style.display='block';
    const id=el.id||'',base=id.replace(/View$/,'');
    try{
      if(id==='powerListView'&&typeof state.frame.contentWindow.openPowerListView==='function')state.frame.contentWindow.openPowerListView();
      else if(id==='globalTalentAccessView'&&typeof state.frame.contentWindow.openGlobalTalentAccessView==='function')state.frame.contentWindow.openGlobalTalentAccessView();
      else if(id==='hubView'&&typeof state.frame.contentWindow.showHubPanel==='function')state.frame.contentWindow.showHubPanel('hubRootPanel');
      else if(typeof state.frame.contentWindow.showView==='function'&&d.getElementById(base+'View'))state.frame.contentWindow.showView(base);
      else{
        d.querySelectorAll('.home-view,.sub-view,#moreView').forEach(v=>v.style.display='none');const top=el.matches('.home-view,.sub-view,#moreView')?el:el.closest('.home-view,.sub-view,#moreView');if(top)top.style.display='block';el.style.display='block';
      }
    }catch(e){el.style.display='block'}
    q('#cmsInspector').classList.remove('open');state.frame.contentWindow.scrollTo(0,0);setMode(true,`${pageLabel(el)} · página completa abierta para editar`);setTimeout(buildTree,100);
  }
  function bindAdmin(){
    q('#cmsSelect').onclick=()=>setMode(true);
    q('#cmsNavigate').onclick=()=>setMode(false);
    q('#cmsUndo').onclick=undo;q('#cmsRedo').onclick=redo;
    q('#cmsPublish').onclick=publish;q('#cmsDiscard').onclick=discard;
    q('#cmsDraft').onclick=async()=>{await apiPost('draft',state.draft);setStatus('Cambios guardados · todavía no publicados')};
    q('#cmsPreview').onclick=preview;
    q('#cmsExport').onclick=exportData;
    q('#cmsImport').onclick=()=>q('#cmsImportFile').click();q('#cmsImportFile').onchange=e=>importData(e.target.files[0]);
    q('#cmsReset').onclick=async()=>{if(confirm('¿Restaurar todo el portal original? Se eliminarán los cambios publicados y el borrador.')){await apiPost('published',[]);await apiDelete('draft');state.frame.contentWindow.location.reload()}};
    q('#cmsSearch').oninput=buildTree;q('#cmsCloseInspector').onclick=()=>q('#cmsInspector').classList.remove('open');setMode(false);
  }
  window.MXBCMS={mountViewer:frame=>loaded(frame,'viewer'),mountAdmin:frame=>loaded(frame,'admin')};
})();
