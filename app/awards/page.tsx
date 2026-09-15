import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AwardsClient from './AwardsClient'

export default async function AwardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.app_metadata?.mxb_role
  if (user && role && role !== 'awards') {
    if (role === 'admin') redirect('/admin')
    else if (role === 'producer') redirect('/producers')
    else if (role === 'distributor') redirect('/distributors')
    else redirect('/dashboard')
  }

  let member = null
  let messages: { id: string; body: string; created_at: string }[] = []
  let announcements: { id: string; title: string; message: string; created_at: string }[] = []
  let resources: { id: string; section: string; body: string | null; youtube_link: string | null; sort_order: number }[] = []
  let requirements: { id: string; title: string | null; body: string; sort_order: number }[] = []
  const awardsConfig: Record<string, string> = {}

  if (user && role === 'awards') {
    const { data: memberData } = await supabase
      .from('mxb_awards_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    member = memberData ?? null

    const [annRes, resRes, reqRes, cfgRes] = await Promise.all([
      supabase.from('mxb_awards_announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('mxb_awards_resources').select('*').order('sort_order'),
      supabase.from('mxb_awards_requirements').select('*').order('sort_order'),
      supabase.from('mxb_config').select('key,value').like('key', 'awards_%'),
    ])

    announcements = annRes.data ?? []
    resources = resRes.data ?? []
    requirements = reqRes.data ?? []
    for (const row of (cfgRes.data ?? [])) awardsConfig[row.key] = row.value

    if (member) {
      const { data: msgData } = await supabase
        .from('mxb_awards_messages')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
      messages = msgData ?? []
    }
  }

  return (
    <AwardsClient
      member={member}
      messages={messages}
      announcements={announcements}
      resources={resources}
      requirements={requirements}
      awardsConfig={awardsConfig}
    />
  )
}
