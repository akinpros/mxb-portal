import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const SW_INJECT = `<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}</script>`

const MOBILE_INJECT = `<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
/* Mobile responsiveness overrides */
*{box-sizing:border-box!important}
body{overflow-x:hidden!important}
img,video,iframe{max-width:100%!important}
#mxbFrame{width:100%!important;height:100vh!important;border:none!important;display:block!important}
@media(max-width:768px){
  body{font-size:14px!important}
  [style*="width:"]{max-width:100%!important}
  [style*="position:fixed"]{max-width:100vw!important}
  table{width:100%!important;display:block!important;overflow-x:auto!important}
}
</style>`

const PROFILE_URL_INJECT = `<script>
(function(){
  // After the iframe content loads, override mxbOpenProfile to navigate to real profile URL
  var frame = document.getElementById('mxbFrame');
  function hookFrame(){
    try {
      var iw = frame.contentWindow;
      var orig = iw.mxbOpenProfile;
      iw.mxbOpenProfile = function(slug){
        // Navigate to the dedicated profile page
        window.location.href = '/portal/' + slug;
      };
    } catch(e) {}
  }
  if(frame){
    frame.addEventListener('load', function(){ setTimeout(hookFrame, 200); });
    // Also try immediately in case already loaded
    setTimeout(hookFrame, 1000);
    setTimeout(hookFrame, 3000);
  }
})();
</script>`

export async function GET() {
  let html = fs.readFileSync(path.join(process.cwd(), 'html', 'portal-home.html'), 'utf-8')
  html = html.replace('<head>', '<head>' + MOBILE_INJECT)
  html = html.replace('</body>', PROFILE_URL_INJECT + SW_INJECT + '</body>')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
