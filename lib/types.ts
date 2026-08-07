export type Partner = {
  id: string
  user_id: string | null
  full_name: string
  email: string
  company: string | null
  position: string | null
  phone: string | null
  country: string | null
  photo_url: string | null
  is_brand_partner: boolean
  is_strategic_leader: boolean
  points: number
  status: 'active' | 'inactive' | 'suspended'
  contract_end: string | null
  agreement_accepted: boolean
  notes: string | null
  created_at: string
}

export type Message = {
  id: string
  partner_id: string
  sender: 'admin' | 'partner'
  subject: string | null
  body: string
  read_by_admin: boolean
  read_by_partner: boolean
  created_at: string
}

export type Reward = {
  id: string
  name: string
  description: string | null
  cost_points: number
  slots: number | null
  contribution_range: string | null
  is_active: boolean
}

export type RedemptionRequest = {
  id: string
  partner_id: string
  reward_id: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  reward?: Reward
}

export type PipelineFilm = {
  id: string
  title: string
  genre: string | null
  country: string | null
  synopsis: string | null
  funding_remaining: number | null
  festival: string | null
  status: string
  published_at: string | null
}
