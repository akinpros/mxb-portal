import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: partner } = await supabase
    .from('mxb_partners')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: messages } = await supabase
    .from('mxb_messages')
    .select('*')
    .eq('partner_id', partner?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: rewards } = await supabase
    .from('mxb_rewards')
    .select('*')
    .eq('is_active', true)
    .order('cost_points')

  const { data: redemptions } = await supabase
    .from('mxb_redemption_requests')
    .select('*, mxb_rewards(name, cost_points)')
    .eq('partner_id', partner?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: pipeline } = await supabase
    .from('mxb_pipeline_films')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(12)

  return (
    <DashboardClient
      user={user}
      partner={partner}
      messages={messages ?? []}
      rewards={rewards ?? []}
      redemptions={redemptions ?? []}
      pipeline={pipeline ?? []}
    />
  )
}
