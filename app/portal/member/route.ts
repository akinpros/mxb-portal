import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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
  'featured_video_url',
  'featured_video_title',
]

export async function GET() {
  let html = fs.readFileSync(path.join(process.cwd(), 'html', 'portal-member.html'), 'utf-8')

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

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',applyConfig);
  } else {
    applyConfig();
    setTimeout(applyConfig,300);
  }
})();
</script>`

  html = html.replace('</body>', inject + '</body>')

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
