import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug

  // Fetch profile by slug
  let profile: Record<string, unknown> | null = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('mxb_power_list_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()
    profile = data
  } catch {}

  if (!profile) {
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>Perfil no encontrado</title>
      <meta http-equiv="refresh" content="2;url=/portal"></head>
      <body style="background:#0b0b0b;color:#e8d5c4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
      <div style="text-align:center"><p>Perfil no encontrado. Redirigiendo...</p></div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 }
    )
  }

  const name = String(profile.full_name || '')
  const title = String(profile.job_title || '')
  const category = String(profile.category || '')
  const shortBio = String(profile.short_bio || '')
  const fullBio = String(profile.full_bio || '')
  const photo = String(profile.photo || '')
  const country = String(profile.country || '')
  const territory = String(profile.territory || '')
  const expertise = Array.isArray(profile.expertise) ? (profile.expertise as string[]) : []
  const selectionReason = String(profile.selection_reason || '')
  const powerListName = String(profile.power_list_name || 'Power List')
  const year = profile.year ? String(profile.year) : '2025'

  const expertiseTags = expertise.map(e =>
    `<span style="background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:4px 10px;font-size:11px;color:#9a8a7a;">${esc(e)}</span>`
  ).join(' ')

  function esc(s: string) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  const canonicalUrl = `https://moviesxbrands.com/portal/${slug}`

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(name)} · ${esc(powerListName)} · Movies × Brands</title>
  <meta name="description" content="${esc(shortBio || title)}">
  <meta property="og:title" content="${esc(name)} · Movies × Brands">
  <meta property="og:description" content="${esc(shortBio || title)}">
  ${photo ? `<meta property="og:image" content="${esc(photo)}">` : ''}
  <meta property="og:url" content="${canonicalUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${canonicalUrl}">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0b0b0b;color:#e8d5c4;font-family:Inter,Arial,sans-serif;min-height:100vh}
    a{color:inherit;text-decoration:none}

    /* NAV */
    .nav{display:flex;align-items:center;justify-content:space-between;padding:18px 40px;border-bottom:1px solid #1e1e1e;position:sticky;top:0;background:#0b0b0b;z-index:100}
    .nav-logo{color:#D4AF37;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase}
    .nav-back{color:#9a8a7a;font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;transition:color .2s}
    .nav-back:hover{color:#D4AF37}

    /* HERO */
    .hero{max-width:900px;margin:0 auto;padding:60px 40px 40px;display:grid;grid-template-columns:280px 1fr;gap:48px;align-items:start}
    .hero-photo{width:280px;height:340px;object-fit:cover;border-radius:12px;display:block;background:#111}
    .hero-photo-placeholder{width:280px;height:340px;border-radius:12px;background:#111;border:1px solid #222;display:flex;align-items:center;justify-content:center;color:#333;font-size:60px}
    .hero-badge{color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
    .hero-name{font-size:42px;font-weight:700;line-height:1.1;margin-bottom:10px;color:#fff}
    .hero-title{color:#9a8a7a;font-size:16px;margin-bottom:6px}
    .hero-location{color:#666;font-size:13px;margin-bottom:24px}
    .hero-short-bio{color:#c4b5a8;font-size:15px;line-height:1.7;margin-bottom:24px}
    .hero-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}

    /* BODY */
    .body{max-width:900px;margin:0 auto;padding:0 40px 80px}
    .section{margin-bottom:40px}
    .section-label{color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
    .section-text{color:#b8a99a;font-size:15px;line-height:1.8}

    /* POWER LIST BADGE */
    .pl-badge{display:inline-flex;align-items:center;gap:8px;background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:12px 18px;margin-bottom:40px}
    .pl-badge-star{color:#D4AF37;font-size:18px}
    .pl-badge-text{font-size:12px;color:#9a8a7a}
    .pl-badge-name{font-weight:700;color:#e8d5c4}

    /* CTA */
    .cta-strip{background:#111;border:1px solid #222;border-radius:12px;padding:32px;text-align:center;margin:40px 0}
    .cta-strip p{color:#9a8a7a;font-size:14px;margin-bottom:16px}
    .cta-btn{display:inline-block;background:#D4AF37;color:#0b0b0b;font-size:13px;font-weight:800;letter-spacing:.5px;padding:12px 28px;border-radius:7px;cursor:pointer}

    @media(max-width:700px){
      .nav{padding:14px 20px}
      .hero{grid-template-columns:1fr;padding:32px 20px 24px;gap:24px}
      .hero-photo,.hero-photo-placeholder{width:100%;height:220px}
      .hero-name{font-size:28px}
      .body{padding:0 20px 60px}
    }
  </style>
</head>
<body>

<nav class="nav">
  <a class="nav-logo" href="/portal">Movies × Brands</a>
  <a class="nav-back" href="javascript:history.back()">← Volver atrás</a>
</nav>

<section class="hero">
  ${photo
    ? `<img class="hero-photo" src="${esc(photo)}" alt="${esc(name)}" loading="eager">`
    : `<div class="hero-photo-placeholder">👤</div>`
  }
  <div>
    <div class="hero-badge">${esc(category)}</div>
    <h1 class="hero-name">${esc(name)}</h1>
    <div class="hero-title">${esc(title)}</div>
    ${(country || territory) ? `<div class="hero-location">${esc([territory, country].filter(Boolean).join(', '))}</div>` : ''}
    ${shortBio ? `<p class="hero-short-bio">${esc(shortBio)}</p>` : ''}
    ${expertiseTags ? `<div class="hero-tags">${expertiseTags}</div>` : ''}

    <div class="pl-badge">
      <span class="pl-badge-star">★</span>
      <div class="pl-badge-text">Incluido en el <span class="pl-badge-name">${esc(powerListName)} ${year}</span></div>
    </div>
  </div>
</section>

<div class="body">
  ${fullBio ? `
  <div class="section">
    <div class="section-label">Sobre ${esc(name.split(' ')[0])}</div>
    <p class="section-text">${esc(fullBio).replace(/\n/g, '<br>')}</p>
  </div>` : ''}

  ${selectionReason ? `
  <div class="section">
    <div class="section-label">Por qué está en el Power List</div>
    <p class="section-text">${esc(selectionReason).replace(/\n/g, '<br>')}</p>
  </div>` : ''}

  <div class="cta-strip">
    <p>¿Quieres conectar con los líderes que están transformando la industria?</p>
    <a class="cta-btn" href="/portal">Acceder al Portal →</a>
  </div>
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
  })
}
