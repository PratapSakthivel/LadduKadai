export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  confirmedReferrals: number;
  pendingReferrals: number;
  pendingRewards: Reward[];
}

export interface Reward {
  id: number;
  customerName: string;
  grams: number;
  reason: string;
  status: 'PENDING' | 'APPLIED';
  appliedToOrderId?: number;
  createdAt?: string;
}

export interface ReferralResponse {
  id: number;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  status: 'PENDING' | 'CONFIRMED';
  createdAt?: string;
}
