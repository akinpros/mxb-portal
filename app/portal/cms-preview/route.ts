import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  let html = fs.readFileSync(path.join(process.cwd(), 'html', 'portal-member.html'), 'utf-8')

  // Patch the let currentMember declaration to auto-populate in preview mode
  const fakeMember = JSON.stringify({
    id: 'cms-admin-preview',
    email: 'admin@moviesxbrands.com',
    contactName: 'Admin CMS',
    displayName: 'Admin CMS',
    approved: true,
    categories: ['brand'],
    editions: { cannes: true, berlinale: true },
    photo: '',
    bioShort: 'CMS Admin',
    profileStatus: 'approved',
    brand: 'Movies x Brands',
    website: 'https://moviesxbrands.com',
  })

  // Replace the let declaration so currentMember is pre-set in the same script scope
  html = html.replace(
    'let currentMember = null;',
    `let currentMember = ${fakeMember};`
  )

  const runtimeScript = '<script src="/cms/cms-runtime.js"></script>'

  // Force auth bypass via CSS !important — overrides any JS style.display assignments
  // Also call enterProfile() to populate member-specific content
  const bypassCss = `<style id="cms-preview-bypass">
#loginScreen, #paymentScreen { display: none !important; }
#pendingArea { display: none !important; }
#profileArea { display: block !important; }
</style>`

  const autoEnter = `<script>
(function(){
  function go(){
    if(typeof enterProfile === 'function'){
      try { enterProfile(); } catch(e) {}
    }
  }
  go();
  setTimeout(go, 500);
  window.addEventListener('load', function(){ go(); setTimeout(go, 600); });
})();
</script>`

  html = html.replace('</head>', bypassCss + '</head>')
  html = html.replace('</body>', autoEnter + runtimeScript + '</body>')

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      // Allow framing from same origin (the admin panel)
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}
