import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.mxb_role !== 'admin') redirect('/dashboard')

  const [
    { data: partners },
    { data: projects },
    { data: announcements },
    { data: messages },
    { data: rewards },
    { data: redemptions },
    { data: producers },
    { data: distributors },
    { data: configRows },
  ] = await Promise.all([
    supabase.from('mxb_partners').select('*').order('created_at', { ascending: false }),
    supabase.from('mxb_projects').select('*').order('created_at', { ascending: false }),
    supabase.from('mxb_announcements').select('*').order('pinned', { ascending: false }).order('published_at', { ascending: false }),
    supabase.from('mxb_messages').select('*, mxb_partners(full_name, company)').order('created_at', { ascending: false }).limit(50),
    supabase.from('mxb_rewards').select('*').order('cost_points'),
    supabase.from('mxb_redemption_requests').select('*, mxb_partners(full_name), mxb_rewards(name)').order('created_at', { ascending: false }),
    supabase.from('mxb_producers').select('*').order('created_at', { ascending: false }),
    supabase.from('mxb_distributors').select('*').order('created_at', { ascending: false }),
    supabase.from('mxb_config').select('key,value'),
  ])

  const config: Record<string, string> = {}
  for (const row of (configRows ?? [])) config[row.key] = row.value

  return (
    <AdminClient
      partners={partners ?? []}
      projects={projects ?? []}
      announcements={announcements ?? []}
      messages={messages ?? []}
      rewards={rewards ?? []}
      redemptions={redemptions ?? []}
      producers={producers ?? []}
      distributors={distributors ?? []}
      config={config}
    />
  )
}
