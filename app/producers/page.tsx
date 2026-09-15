import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProducersClient from './ProducersClient'

export default async function ProducersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.mxb_role !== 'producer') redirect('/dashboard')

  const { data: producer } = await supabase
    .from('mxb_producers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const [
    { data: pipeline },
    { data: announcements },
    { data: messages },
  ] = await Promise.all([
    supabase.from('mxb_pipeline_films').select('*').order('published_at', { ascending: false }),
    supabase.from('mxb_announcements').select('*').order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(10),
    supabase.from('mxb_producer_messages').select('*').eq('producer_id', producer?.id ?? '').order('created_at', { ascending: false }).limit(30),
  ])

  return (
    <ProducersClient
      user={user}
      producer={producer}
      pipeline={pipeline ?? []}
      announcements={announcements ?? []}
      messages={messages ?? []}
    />
  )
}
