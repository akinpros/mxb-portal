import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Cache rendered HTML for 5 minutes to avoid re-reading 92MB file on every request
let _cache: { html: string; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

const MOBILE_INJECT = `<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box!important}
body{overflow-x:hidden!important}
img,video,iframe{max-width:100%!important}
@media(max-width:768px){
  body{font-size:14px!important}
  [style*="width:"]{max-width:100%!important}
  table{width:100%!important;display:block!important;overflow-x:auto!important}
  .sidebar,.nav-sidebar,[class*="sidebar"]{width:100%!important;position:relative!important}
  [class*="modal"],[class*="panel"]{width:100vw!important;max-width:100vw!important;left:0!important;right:0!important}
}
</style>`

const CONFIG_KEYS = [
  'announcement_banner',
  'welcome_message',
  'hub_title',
  'hub_subtitle',
  'hub_footer',
  'premium_title',
  'premium_desc',
  'premium_cta',
  'premium_hero_image',
  'gala_image',
  'event_title',
  'event_date',
  'event_location',
  'event_price',
  'event_cta_url',
  'thrivecart_gala_url',
  'thrivecart_redcarpet_url',
  'thrivecart_single_url',
  'featured_video_url',
  'featured_video_title',
  'gallery_images',
  'extra_sections',
  'extra_videos',
]

export async function GET() {
  // Return cached version if still fresh
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return new NextResponse(_cache.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  let html = fs.readFileSync(path.join(process.cwd(), 'html', 'portal-member.html'), 'utf-8')
  html = html.replace('<head>', '<head>' + MOBILE_INJECT)

  // Fetch live config from Supabase
  const cfg: Record<string, string> = {}
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('mxb_config').select('key,value').in('key', CONFIG_KEYS)
    data?.forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value })
  } catch { /* serve without config if DB unreachable */ }

  const inject = `<script>
window.MXB_CONFIG=${JSON.stringify(cfg)};
(function(){
  var c=window.MXB_CONFIG||{};
  function set(id,val){var el=document.getElementById(id);if(el&&val)el.textContent=val;}
  function setQ(sel,val){document.querySelectorAll(sel).forEach(function(el){if(val)el.textContent=val;});}
  function setSrc(id,url){var el=document.getElementById(id);if(el&&url)el.src=url;}

  // Announcement banner
  if(c.announcement_banner){
    var bar=document.createElement('div');
    bar.id='mxb-announcement-bar';
    bar.style.cssText='background:#D4AF37;color:#0B0B0B;text-align:center;padding:11px 40px;font-size:13px;font-weight:700;position:relative;z-index:99999;letter-spacing:.03em;';
    var msg=document.createElement('span');
    msg.textContent=c.announcement_banner;
    var close=document.createElement('span');
    close.textContent='✕';
    close.style.cssText='position:absolute;right:16px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:16px;font-weight:400;opacity:.7;';
    close.onclick=function(){bar.style.display='none';};
    bar.appendChild(msg);
    bar.appendChild(close);
    document.body.prepend(bar);
  }

  function applyConfig(){
    // Hub hero text
    setQ('.mhv-title',c.hub_title);
    setQ('.mhv-sub',c.hub_subtitle||c.welcome_message);
    setQ('.hub-footer-tagline',c.hub_footer);

    // Premium Upgrade hub card
    set('hubPremiumUpgradeTitle',c.premium_title);
    set('hubPremiumUpgradeDesc',c.premium_desc);
    set('hubPremiumUpgradeCta',c.premium_cta);
    if(c.premium_hero_image){
      setSrc('hubPremiumUpgradeImage',c.premium_hero_image);
      setSrc('premiumHeroImageV45',c.premium_hero_image);
    }
    if(c.gala_image){
      setSrc('premiumGalaImage',c.gala_image);
    }

    // ThriveCart checkout URL — override localStorage so getSettings() picks it up
    if(c.thrivecart_gala_url){
      try{
        var KEY='mxb_premium_upgrade_settings_v1';
        var existing=JSON.parse(localStorage.getItem(KEY)||'null')||{};
        existing.checkoutUrl=c.thrivecart_gala_url;
        localStorage.setItem(KEY,JSON.stringify(existing));
      }catch(e){}
      document.querySelectorAll('[data-tc-product="gala"],[href*="thrivecart.com"]').forEach(function(el){
        if(el.tagName==='A') el.href=c.thrivecart_gala_url;
      });
    }
    if(c.thrivecart_redcarpet_url){
      document.querySelectorAll('[data-tc-product="redcarpet"]').forEach(function(el){el.href=c.thrivecart_redcarpet_url;});
    }
    if(c.thrivecart_single_url){
      document.querySelectorAll('[data-tc-product="single"],[data-tc-product="gala1"]').forEach(function(el){el.href=c.thrivecart_single_url;});
    }

    // Event details
    ['event_title','event_date','event_location','event_price'].forEach(function(k){
      if(c[k]) document.querySelectorAll('[data-mxb-config="'+k+'"]').forEach(function(el){el.textContent=c[k];});
    });
    if(c.event_cta_url) document.querySelectorAll('[data-mxb-config="event_cta_url"]').forEach(function(el){el.href=c.event_cta_url;});

    // Featured video — inject a watch section into hub home if URL provided
    if(c.featured_video_url){
      var existing=document.getElementById('mxb-featured-video');
      if(!existing){
        var videoId='';
        var m=String(c.featured_video_url).match(/(?:v=|youtu\\.be\\/|embed\\/)([A-Za-z0-9_-]{6,})/);
        if(m) videoId=m[1];
        if(videoId){
          var sec=document.createElement('div');
          sec.id='mxb-featured-video';
          sec.style.cssText='max-width:700px;margin:32px auto;padding:0 24px;';
          sec.innerHTML='<div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">✦ '+(c.featured_video_title||'Featured Video')+'</div><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;"><iframe src="https://www.youtube.com/embed/'+videoId+'" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay;encrypted-media" allowfullscreen></iframe></div>';
          var hubRoot=document.getElementById('hubRootPanel');
          if(hubRoot) hubRoot.appendChild(sec);
        }
      }
    }
  }

    // Gallery images — inject a grid below hub
    if(c.gallery_images){
      try{
        var imgs=JSON.parse(c.gallery_images);
        if(imgs&&imgs.length){
          var existing=document.getElementById('mxb-gallery');
          if(!existing){
            var grid=document.createElement('div');
            grid.id='mxb-gallery';
            grid.style.cssText='max-width:700px;margin:32px auto;padding:0 24px;';
            var inner='<div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">✦ Galería</div>';
            inner+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">';
            imgs.forEach(function(item){
              inner+='<figure style="margin:0;">'
                +'<img src="'+String(item.url||'').replace(/"/g,'&quot;')+'" alt="" style="width:100%;height:130px;object-fit:cover;border-radius:7px;display:block;" onerror="this.parentNode.style.display=\'none\'">'
                +(item.caption?'<figcaption style="font-size:10px;color:#9a8a7a;margin-top:5px;padding:0 2px;">'+String(item.caption||'').replace(/</g,'&lt;')+'</figcaption>':'')
                +'</figure>';
            });
            inner+='</div>';
            grid.innerHTML=inner;
            var hubRoot=document.getElementById('hubRootPanel');
            if(hubRoot) hubRoot.appendChild(grid);
          }
        }
      }catch(e){}
    }

    // Extra content sections
    if(c.extra_sections){
      try{
        var secs=JSON.parse(c.extra_sections);
        if(secs&&secs.length){
          var exContainer=document.getElementById('mxb-extra-sections');
          if(!exContainer){
            exContainer=document.createElement('div');
            exContainer.id='mxb-extra-sections';
            exContainer.style.cssText='max-width:700px;margin:32px auto;padding:0 24px;';
            var hubRoot2=document.getElementById('hubRootPanel');
            if(hubRoot2) hubRoot2.appendChild(exContainer);
          }
          exContainer.innerHTML='';
          secs.forEach(function(sec){
            var block=document.createElement('div');
            block.style.cssText='background:#141414;border:1px solid #272727;border-radius:10px;padding:24px;margin-bottom:14px;';
            var html2='';
            if(sec.image) html2+='<img src="'+String(sec.image||'').replace(/"/g,'&quot;')+'" style="width:100%;max-height:220px;object-fit:cover;border-radius:7px;margin-bottom:16px;" onerror="this.style.display=\'none\'">';
            if(sec.title) html2+='<div style="color:#E8D5C4;font-size:16px;font-weight:600;margin-bottom:8px;">'+String(sec.title||'').replace(/</g,'&lt;')+'</div>';
            if(sec.text) html2+='<div style="color:#9a8a7a;font-size:13px;line-height:1.6;">'+String(sec.text||'').replace(/</g,'&lt;').replace(/\n/g,'<br>')+'</div>';
            if(sec.link) html2+='<a href="'+String(sec.link||'').replace(/"/g,'&quot;')+'" style="display:inline-block;margin-top:14px;background:#D4AF37;color:#0B0B0B;padding:9px 20px;border-radius:5px;font-size:12px;font-weight:700;text-decoration:none;">Ver más →</a>';
            block.innerHTML=html2;
            exContainer.appendChild(block);
          });
        }
      }catch(e){}
    }

    // Extra videos
    if(c.extra_videos){
      try{
        var vids=JSON.parse(c.extra_videos);
        if(vids&&vids.length){
          var vidContainer=document.getElementById('mxb-extra-videos');
          if(!vidContainer){
            vidContainer=document.createElement('div');
            vidContainer.id='mxb-extra-videos';
            vidContainer.style.cssText='max-width:700px;margin:32px auto;padding:0 24px;';
            var hubRoot3=document.getElementById('hubRootPanel');
            if(hubRoot3) hubRoot3.appendChild(vidContainer);
          }
          vidContainer.innerHTML='';
          vids.forEach(function(vid){
            var m=String(vid.url||'').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
            if(!m)return;
            var vId=m[1];
            var block=document.createElement('div');
            block.style.cssText='margin-bottom:24px;';
            block.innerHTML=(vid.title?'<div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">✦ '+String(vid.title||'').replace(/</g,'&lt;')+'</div>':'')
              +'<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;">'
              +'<iframe src="https://www.youtube.com/embed/'+vId+'" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay;encrypted-media" allowfullscreen></iframe>'
              +'</div>';
            vidContainer.appendChild(block);
          });
        }
      }catch(e){}
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',applyConfig);
  } else {
    applyConfig();
    setTimeout(applyConfig,300);
  }
})();
</script>`

  const cmsRuntime = '<script src="/cms/cms-runtime.js"></script>'

  // Wire all three ThriveCart checkout buttons to live URLs
  const thriveCartWire = `<script>
(function(){
  var URLS = {
    membership: 'https://sales.sprintogrowth.com/join-the-ecosystem-moviesxbrands/',
    gala1:      'https://sales.sprintogrowth.com/1-ticket-global-boost-awards-official-gala/',
    gala2:      'https://sales.sprintogrowth.com/global-boost-awards-official-gala-2-tickets/'
  };

  // Track which ticket qty the user selected (1 or 2)
  var _qty = 1;
  var _origSetQty = window.setPremiumTicketQty;
  window.setPremiumTicketQty = function(n){
    _qty = (n === 2) ? 2 : 1;
    if(typeof _origSetQty === 'function') _origSetQty(n);
  };

  // Gala purchase → correct URL based on selected qty
  window.purchaseGalaTickets = function(){
    window.location.href = (_qty === 2) ? URLS.gala2 : URLS.gala1;
  };

  // Membership payment → ThriveCart 497€ page
  window.doRegister = function(){
    window.location.href = URLS.membership;
  };
})();
</script>`

  html = html.replace('</body>', inject + thriveCartWire + cmsRuntime + '</body>')

  // Store in cache
  _cache = { html, ts: Date.now() }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
