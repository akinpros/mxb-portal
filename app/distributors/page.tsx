import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DistributorsClient from './DistributorsClient'

export default async function DistributorsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.mxb_role !== 'distributor') redirect('/dashboard')

  const { data: distributor } = await supabase
    .from('mxb_distributors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const [
    { data: pipeline },
    { data: announcements },
    { data: messages },
  ] = await Promise.all([
    supabase.from('mxb_pipeline_films').select('*').eq('status', 'open').order('published_at', { ascending: false }),
    supabase.from('mxb_announcements').select('*').order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(10),
    supabase.from('mxb_distributor_messages').select('*').eq('distributor_id', distributor?.id ?? '').order('created_at', { ascending: false }).limit(30),
  ])

  return (
    <DistributorsClient
      user={user}
      distributor={distributor}
      pipeline={pipeline ?? []}
      announcements={announcements ?? []}
      messages={messages ?? []}
    />
  )
}
