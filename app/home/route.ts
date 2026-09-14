import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

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
  html = html.replace('</body>', PROFILE_URL_INJECT + '</body>')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
