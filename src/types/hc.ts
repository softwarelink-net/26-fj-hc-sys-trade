export type UserRole = 'ADMIN' | 'BUSINESS' | 'OPERATOR' | 'DECIDER'

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '超管',
  BUSINESS: '业务主管',
  OPERATOR: '基层经办',
  DECIDER: '竞买人',
}

export interface HcUser {
  id: number
  username: string
  role: UserRole
  company_name: string | null
  full_name: string | null
  created_at?: string
}

export type AssetStatus = 'LISTING' | 'BIDDING' | 'CLOSED' | 'CANCELLED'

export interface HcAsset {
  id: number
  project_number: string
  title: string
  seller_name: string
  listing_price: number
  listing_date: string
  end_date: string
  status: AssetStatus
  description: string | null
  risk_factors: string | null
  location: string | null
}

export interface HcBidder {
  id: number
  asset_id: number
  user_id: number
  company_name: string
  credit_code: string | null
  contact_person: string
  contact_phone: string
  margin_paid: number
  margin_payment_proof: string | null
  qualification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  registered_at: string
  username?: string
}

export interface HcBidRecord {
  id: number
  asset_id: number
  bidder_id: number
  bid_amount: number
  bid_time: string
  status: 'VALID' | 'INVALID' | 'WINNING'
  company_name?: string
}

export interface HcNotice {
  id: number
  title: string
  content: string
  is_pinned: number
  published_at: string
}

export interface HcMessage {
  id: number
  user_id: number
  title: string
  body: string
  is_read: number
  created_at: string
}

export interface HcConfig {
  key: string
  value: string
  description: string
}

export interface DashboardStats {
  listingPrice: number
  highestBid: number
  bidderCount: number
  bidCount: number
  approvedCount: number
  pendingCount: number
  marginAmount: number
  minIncrement: number
  biddingEndTime: string
  assetStatus: string
  projectNumber: string
  assetTitle: string
  bidHistory: { time: string; amount: number }[]
  notices: HcNotice[]
  unreadMessages: number
}
