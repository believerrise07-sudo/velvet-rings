import { Profile, Post, Subscription, Transaction } from "../types";

const API_BASE = "/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("velvet_session_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("velvet_session_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("velvet_session_token");
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "An unexpected API error occurred");
  }
  return data as T;
}

export const api = {
  // Auth
  async getCurrentUser() {
    return fetcher<{ user: Profile }>("/auth/me");
  },

  async login(credentials: Record<string, string>) {
    return fetcher<{ user: Profile; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async register(data: Record<string, string>) {
    return fetcher<{ user: Profile; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout() {
    try {
      await fetcher("/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout request failed, clearing local token anyway", e);
    }
    clearAuthToken();
  },

  // Feed/Post Management
  async getPosts() {
    return fetcher<{ posts: (Post & { is_accessible: boolean })[]; isSubscribed: boolean; creatorProfile: Profile }>("/posts");
  },

  async createPost(postData: Partial<Post>) {
    return fetcher<{ post: Post }>("/posts/create", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  async deletePost(id: string) {
    return fetcher<{ success: boolean }>("/posts/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  },

  // Checkout Gateways
  async createRazorpayOrder(checkoutData: { type: "subscription" | "ppv"; amount: number; target_post_id?: string; currency?: string }) {
    return fetcher<{ order_id: string; amount: number; currency: string; key_id: string; subscription_id?: string }>("/razorpay/order", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    });
  },

  async verifyRazorpayPayment(payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    type: "subscription" | "ppv";
    amount: number;
    target_post_id?: string;
    currency?: string;
  }) {
    return fetcher<{ success: boolean; transaction: Transaction; message: string }>("/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Statistics & History
  async getProfileTransactions() {
    return fetcher<{ transactions: Transaction[]; subscriptions: Subscription[] }>("/profile/transactions");
  },

  async getCreatorAnalytics() {
    return fetcher<{
      activeFansCount: number;
      grossRevenue: number;
      subscriptionRevenue: number;
      ppvRevenue: number;
      postsCount: number;
      posts: Post[];
      subscribers: (Subscription & { fan: { username: string; email: string; avatar_url: string } })[];
      transactions: (Transaction & { fan_username: string })[];
    }>("/creator/analytics");
  },

  async getCreators() {
    return fetcher<{ creators: Profile[] }>("/creators");
  },

  async getCreatorStorefront(username: string) {
    return fetcher<{ creator: Profile; posts: (Post & { is_accessible: boolean })[]; isSubscribed: boolean }>(`/creators/${username}`);
  },

  async updateCreatorSettings(settings: Partial<Profile>) {
    return fetcher<{ success: boolean; user: Profile }>("/creator/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },
};
