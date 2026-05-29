export type UserRole = 'creator' | 'fan';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionType = 'subscription' | 'ppv';

export interface Profile {
  id: string; // UUID or string id
  username: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  bio: string;
  is_creator: boolean;
  created_at: string;
  subscription_price?: number;
  storefront_title?: string;
  storefront_description?: string;
  storefront_cover_url?: string;
}

export interface Post {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  media_urls: string[]; // URLs or placeholders of images/videos
  is_locked: boolean;
  price: number; // PPV price (0 if free/subcribers-only)
  created_at: string;
}

export interface Subscription {
  id: string;
  fan_id: string;
  creator_id: string;
  razorpay_subscription_id: string;
  status: SubscriptionStatus;
  start_date: string;
  expiry_date: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  razorpay_payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  target_post_id?: string;
  created_at: string;
}

export interface UserSession {
  user: Profile | null;
  token?: string;
}
