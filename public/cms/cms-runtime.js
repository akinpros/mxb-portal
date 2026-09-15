(function(){
  'use strict';
  const mediaCache=new Map();
  async function read(){
    const preview=location.search.includes('preview=1');
    try{const r=await fetch('/api/cms?type='+(preview?'preview':'published'));return r.ok?await r.json():[];}catch(e){return[];}
  }
  function target(c){try{return document.querySelector(c.selector)}catch(e){return null}}
  function apply(c){
    const el=target(c);if(!el)return;
    if(!c._resolved&&typeof c.value==='string'&&c.value.startsWith('idb:')&&['replaceImage','replaceBackground','replaceVideo'].includes(c.op)){resolveMedia(c.value,value=>apply({...c,value,_resolved:true}));return}
    if(c.op==='text')el.innerHTML=c.value;
    if(c.op==='attr'){if(c.value===null||c.value==='')el.removeAttribute(c.name);else el.setAttribute(c.name,c.value)}
    if(c.op==='replaceImage'){el.removeAttribute('srcset');el.removeAttribute('sizes');el.src=c.value;const p=el.closest('picture');if(p)p.querySelectorAll('source').forEach(s=>{s.removeAttribute('srcset');s.removeAttribute('sizes')})}
    if(c.op==='replaceVideo'){if(el.tagName==='VIDEO'){el.querySelectorAll('source').forEach(s=>s.remove());el.src=c.value;el.controls=true;el.load?.()}else{const v=document.createElement('video');v.src=c.value;v.controls=true;v.playsInline=true;v.className=el.className;v.style.cssText=el.style.cssText;[...el.attributes].forEach(a=>{if(!['src','class','style'].includes(a.name))v.setAttribute(a.name,a.value)});el.replaceWith(v)}}
    if(c.op==='replaceBackground')el.style.backgroundImage=`url("${String(c.value||'').replace(/"/g,'\\"')}")`;
    if(c.op==='style')el.style[c.name]=c.value||'';
    if(c.op==='hide')el.style.display=c.value?'none':'';
    if(c.op==='delete')el.remove();
    if(c.op==='duplicate'&&c.html&&!document.querySelector(`[data-cms-clone="${c.id}"]`)){const t=document.createElement('template');t.innerHTML=c.html;const clone=t.content.firstElementChild;if(clone){clone.dataset.cmsClone=c.id;el.after(clone)}}
    if(c.op==='move'&&el.dataset.cmsMove!==c.id){const s=c.direction==='up'?el.previousElementSibling:el.nextElementSibling;if(s){c.direction==='up'?s.before(el):s.after(el);el.dataset.cmsMove=c.id}}
  }
  function resolveMedia(ref,done){if(mediaCache.has(ref))return done(mediaCache.get(ref));const req=indexedDB.open('mxb_cms_media_v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>{const get=req.result.transaction('files').objectStore('files').get(ref.slice(4));get.onsuccess=()=>{if(get.result){const url=URL.createObjectURL(get.result);mediaCache.set(ref,url);done(url)}}}}
  async function applyAll(){(await read()).forEach(apply);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyAll);else applyAll();
  let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(applyAll,120)}).observe(document.documentElement,{childList:true,subtree:true});
})();
