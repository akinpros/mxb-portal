import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Store CMS data in mxb_config using prefixed keys
function storeKey(type: string) {
  return `cms_store_${type}`
}

async function getChanges(supabase: ReturnType<typeof createAdminClient>, type: string) {
  const { data } = await supabase
    .from('mxb_config')
    .select('value')
    .eq('key', storeKey(type))
    .single()
  try { return data?.value ? JSON.parse(data.value) : [] } catch { return [] }
}

// GET /api/cms?type=published|draft|preview
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'published'
  try {
    const supabase = createAdminClient()
    const changes = await getChanges(supabase, type)
    return NextResponse.json(changes)
  } catch {
    return NextResponse.json([])
  }
}

// POST /api/cms  body: { type: string, changes: [] }
export async function POST(request: NextRequest) {
  try {
    const { type, changes } = await request.json()
    if (!type || !Array.isArray(changes)) return NextResponse.json({ error: 'bad request' }, { status: 400 })
    const supabase = createAdminClient()
    await supabase
      .from('mxb_config')
      .upsert(
        { key: storeKey(type), value: JSON.stringify(changes) },
        { onConflict: 'key' }
      )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE /api/cms?type=draft|preview
export async function DELETE(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'draft'
  try {
    const supabase = createAdminClient()
    await supabase.from('mxb_config').delete().eq('key', storeKey(type))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
