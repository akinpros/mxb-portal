import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const isAdmin = user.app_metadata?.mxb_role === 'admin'

  const { data: partner } = await supabase
    .from('mxb_partners')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const [
    { data: messages },
    { data: rewards },
    { data: redemptions },
    { data: announcements },
    { data: pipeline },
    { data: referrals },
    { data: contentRows },
    { data: prospects },
    { data: meetingRow },
    { data: plEntries },
    { data: plRequest },
  ] = await Promise.all([
    supabase.from('mxb_messages').select('*').eq('partner_id', partner?.id ?? '').order('created_at', { ascending: false }).limit(20),
    supabase.from('mxb_rewards').select('*').eq('is_active', true).order('cost_points'),
    supabase.from('mxb_redemption_requests').select('*, mxb_rewards(name, cost_points)').eq('partner_id', partner?.id ?? '').order('created_at', { ascending: false }).limit(20),
    supabase.from('mxb_announcements').select('*').order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(20),
    supabase.from('mxb_pipeline_films').select('*').order('published_at', { ascending: false }).limit(12),
    supabase.from('mxb_referrals').select('*').eq('strategic_leader_id', partner?.id ?? '').order('created_at', { ascending: false }),
    supabase.from('mxb_content').select('key,value,type'),
    supabase.from('mxb_prospects').select('*').eq('partner_id', partner?.id ?? '').order('ref', { ascending: false }),
    supabase.from('mxb_config').select('key,value').eq('key', 'prospects_meeting_text').single(),
    supabase.from('mxb_power_list_entries').select('*').eq('is_public', true).order('rank').order('full_name'),
    supabase.from('mxb_power_list_requests').select('status').eq('partner_id', partner?.id ?? '').limit(1).maybeSingle(),
  ])

  const content: Record<string, string> = {}
  for (const row of (contentRows ?? [])) content[row.key] = row.value

  return (
    <DashboardClient
      user={user}
      isAdmin={isAdmin}
      partner={partner}
      messages={messages ?? []}
      rewards={rewards ?? []}
      redemptions={redemptions ?? []}
      announcements={announcements ?? []}
      pipeline={pipeline ?? []}
      referrals={referrals ?? []}
      content={content}
      prospects={prospects ?? []}
      meetingText={meetingRow?.value ?? ''}
      powerListEntries={plEntries ?? []}
      partnerPLRequest={plRequest ?? null}
    />
  )
}
