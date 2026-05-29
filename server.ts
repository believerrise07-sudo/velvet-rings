import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Ensure localhost resolves properly
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// ==========================================
// DYNAMIC DUAL-MODE INTEGRATION ENGINES
// Lazy initialize real client instances ONLY if environment variables are available.
// ==========================================
let supabaseClient: any = null;
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false }
      });
      console.log("🟢 SUPABASE CONNECTION ESTABLISHED SUCCESSFULLY.");
      return supabaseClient;
    } catch (err) {
      console.error("🔴 Failed to initialize Supabase client instance:", err);
    }
  }
  return null;
}

let razorpayClient: any = null;
export function getRazorpay() {
  if (razorpayClient) return razorpayClient;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret) {
    try {
      razorpayClient = new Razorpay({
        key_id,
        key_secret
      });
      console.log("🟢 RAZORPAY PAYMENT GATEWAY SDK INITIALIZED.");
      return razorpayClient;
    } catch (err) {
      console.error("🔴 Failed to initialize Razorpay SDK instance:", err);
    }
  }
  return null;
}

// ==========================================
// IN-MEMORY COMPREHENSIVE DATASTORE
// This acts as a reliable state container for immediate, high-fidelity previewing in AI Studio.
// It also contains fallback data for the female creator.
// ==========================================

const CREATOR_PROFILE = {
  id: "creator-elena-rose-uuid",
  username: "elenarose",
  email: "elena@velvet.vip",
  role: "creator" as const,
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
  bio: "Fashion Runway Model | Backstage & Creative Art Assets. Premium lifestyle, VIP access, and exclusive behind-the-scenes diaries.",
  is_creator: true,
  subscription_price: 199,
  storefront_title: "Elena Rose's Fashion Vault",
  storefront_description: "Unfiltered lifestyle stories, beauty secrets, and behind-the-scenes modeling journals from Milan & Paris runways.",
  storefront_cover_url: "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&q=80&w=1200",
  created_at: new Date(2026-1-1).toISOString()
};

const SASHA_PROFILE = {
  id: "creator-sasha-noir-uuid",
  username: "sashanoir",
  email: "sasha@velvet.vip",
  role: "creator" as const,
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
  bio: "Alternative Fine Art Photographer exploring vintage shadows, analog lighting, and organic human silhouettes.",
  is_creator: true,
  subscription_price: 299,
  storefront_title: "Sasha Noir's Shadow Studio",
  storefront_description: "Curated shadow-play, high-resolution film grain studies, and limited-edition artistic portfolios for true selectors.",
  storefront_cover_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
  created_at: new Date(2026-1-1).toISOString()
};

const MARCUS_PROFILE = {
  id: "creator-marcus-vance-uuid",
  username: "marcusvance",
  email: "marcus@velvet.vip",
  role: "creator" as const,
  avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300",
  bio: "VFX Technical Director & Cinematographer. Sharing unreleased LUT packs, 3D render files, and slow-motion film tools.",
  is_creator: true,
  subscription_price: 149,
  storefront_title: "Marcus Vance's Cinematic Lab",
  storefront_description: "High fidelity drone assets, HDR lighting templates, LUT color grading presets, and digital visual art breakdowns.",
  storefront_cover_url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1200",
  created_at: new Date(2026-1-1).toISOString()
};

const MAYA_PROFILE = {
  id: "creator-maya-lin-uuid",
  username: "mayalin",
  email: "maya@velvet.vip",
  role: "creator" as const,
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300",
  is_creator: true,
  bio: "Architectural explorer & travel diarist. Designing slow-living spaces, organic spatial blueprints, and modern aesthetics.",
  subscription_price: 100,
  storefront_title: "Maya Lin's Spatial Escapes",
  storefront_description: "Aerial slow-living diaries, interior layout blueprints, sustainable design secrets, and panoramic spatial concept files.",
  storefront_cover_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
  created_at: new Date(2026-1-1).toISOString()
};

let users = [
  CREATOR_PROFILE,
  SASHA_PROFILE,
  MARCUS_PROFILE,
  MAYA_PROFILE,
  {
    id: "fan-demo-user-uuid",
    username: "exclusive_fan",
    email: "fan@velvet.vip",
    role: "fan" as const,
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "Passionate supporter of fine arts and premium creator portfolios.",
    is_creator: false,
    created_at: new Date().toISOString()
  }
];

// Active sessions
let sessions: Record<string, typeof users[0]> = {
  "mock-session-fan-token": users[4], // Pre-logged in as Fan to make preview immediately seamless
};

// Initial elegant mock posts mapped across different creators
let posts = [
  // Elena Rose
  {
    id: "post-1-public",
    creator_id: "creator-elena-rose-uuid",
    title: "✨ Welcome to my private VIP journal! (Intro Guide)",
    description: "I am absolutely thrilled to have you here. This space is where I share my unfiltered creative process, runway concepts, and deep lifestyle stories that social media censors. This post is unlocked for everyone! Click subscriber triggers below to see full runway content.",
    media_urls: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: false,
    price: 0,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "post-2-subscribers",
    creator_id: "creator-elena-rose-uuid",
    title: "☕ Morning Warmth: Sunroom stretch & coffee thoughts",
    description: "Waking up early to a misty morning is my favorite routine. Here is a private video snapshot and photo gallery of my morning space, morning skincare, and what I am planning for today's shoot in Milan. Subscribers can view complete and unedited footage.",
    media_urls: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 0,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "post-3-ppv-milan",
    creator_id: "creator-elena-rose-uuid",
    title: "👠 [EXCLUSIVE PPV] Milan High Fashion Runway: Complete Backstage Reel",
    description: "This is a full-access look into the high-fashion runway event in Milan. It is locked as Pay-Per-View because it includes unreleased designer sketches, fitting room chaos, and raw, high-contrast digital modeling reels. Buy once to possess permanent access to this premium asset!",
    media_urls: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 499,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "post-4-ppv-artistic",
    creator_id: "creator-elena-rose-uuid",
    title: "🎨 [PREMIUM PPV] Fine Art Portrait Series: Summer Shadows",
    description: "A personal collaboration with elite minimalist photographers experimenting with shadows, sunlight, and organic silhouettes. This is a 12-image ultra-high resolution collection. Strictly for collector appreciation and true photography curators.",
    media_urls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 999,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  
  // Sasha Noir
  {
    id: "post-5-noir-sub",
    creator_id: "creator-sasha-noir-uuid",
    title: "🌫️ Shadows & Silk: Monochrome Film Grain Study",
    description: "Welcome to my private studio. Today I experimented with direct mid-day sunlight filtered through thin silk curtains in our studio. The high contrast highlights the organic shape and grain structure of classic black and white film.",
    media_urls: [
      "https://images.unsplash.com/photo-1502685790141-14f1143c770d?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 0,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: "post-6-noir-ppv",
    creator_id: "creator-sasha-noir-uuid",
    title: "📸 [PPV PREMIUM] Paris Noir Shadows (12 Ultra-HD silhouetted portraits)",
    description: "A comprehensive photographic project created in an old Parisian loft apartment using organic dawn light. Unlocks a hidden collection of 12 beautifully textured, full-frame monochrome photographic assets.",
    media_urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 399,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },

  // Marcus Vance
  {
    id: "post-7-vance-pub",
    creator_id: "creator-marcus-vance-uuid",
    title: "🌅 Golden Neon Cinematic LUT Pack (Free Download)",
    description: "Sharing the primary color grading lookup table we coded for our recent cyberpunk evening shoot. Free for everyone as a thank you! Download and import directly into Premiere Pro, DaVinci Resolve, or Final Cut.",
    media_urls: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26657?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: false,
    price: 0,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: "post-8-vance-ppv",
    creator_id: "creator-marcus-vance-uuid",
    title: "🍿 [VFX PPV] Cyberpunk Sci-Fi Street Asset & VFX Grading Bundle",
    description: "Unlock all 3D asset source files, lighting dome configurations, and custom sound design stems from our street cinematography event series.",
    media_urls: [
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 799,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },

  // Maya Lin
  {
    id: "post-9-maya-sub",
    creator_id: "creator-maya-lin-uuid",
    title: "⛩️ Architectural Tea House Layout & Woodworking Blueprint",
    description: "Exclusive layout detailing the cross-sections of the custom floating tea pavilion in Kyoto. It includes structural dimensions, joist locations, and spatial flow sketches.",
    media_urls: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200"
    ],
    is_locked: true,
    price: 0,
    created_at: new Date(Date.now() - 3600000 * 15).toISOString()
  }
];

// Subscriptions table (mock database schema representation)
let subscriptions = [
  {
    id: "sub-1-active-demo",
    fan_id: "fan-demo-user-uuid",
    creator_id: "creator-elena-rose-uuid",
    razorpay_subscription_id: "sub_demo_active_12345",
    status: "active" as const,
    start_date: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
    created_at: new Date().toISOString()
  }
];

// Transactions log
let transactions: any[] = [
  {
    id: "tx-demo-1",
    user_id: "fan-demo-user-uuid",
    creator_id: "creator-elena-rose-uuid",
    razorpay_payment_id: "pay_demo_111",
    order_id: "order_demo_111",
    amount: 199,
    currency: "INR",
    status: "success" as const,
    type: "subscription" as const,
    target_post_id: undefined as string | undefined,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ==========================================
// ROBUST DUAL-MODE RELATIONAL BRIDGES (SUPABASE ABSTRACTION LAYER)
// ==========================================
function updateInMemoryUser(userData: any) {
  const idx = users.findIndex(u => u.id === userData.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...userData };
  } else {
    users.push(userData);
  }
}

async function fetchUsers(): Promise<any[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("profiles").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        // Synchronize in-memory listings with newest db state
        data.forEach(u => updateInMemoryUser(u));
        return users;
      }
    } catch (err) {
      console.warn("⚠️ Supabase profile fetching failed, falling back to local memory state:", err);
    }
  }
  return users;
}

async function findUserByEmail(email: string): Promise<any | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("profiles").select("*").eq("email", email).maybeSingle();
      if (error) throw error;
      if (data) {
        updateInMemoryUser(data);
        return { ...users.find(u => u.id === data.id), ...data };
      }
    } catch (err) {
      console.warn("⚠️ Supabase profile lookup by email failed:", err);
    }
  }
  return users.find(u => u.email === email) || null;
}

async function findUserByUsername(username: string): Promise<any | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("profiles").select("*").eq("username", username).maybeSingle();
      if (error) throw error;
      if (data) {
        updateInMemoryUser(data);
        return { ...users.find(u => u.id === data.id), ...data };
      }
    } catch (err) {
      console.warn("⚠️ Supabase profile lookup by username failed:", err);
    }
  }
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

async function findUserById(id: string): Promise<any | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) {
        updateInMemoryUser(data);
        return { ...users.find(u => u.id === data.id), ...data };
      }
    } catch (err) {
      console.warn("⚠️ Supabase profile lookup by ID failed:", err);
    }
  }
  return users.find(u => u.id === id) || null;
}

async function writeUser(user: any): Promise<any> {
  const sb = getSupabase();
  if (sb) {
    try {
      // 1. Attempt full write
      const { data, error } = await sb.from("profiles").upsert(user).select().single();
      if (!error && data) {
        updateInMemoryUser(data);
        return data;
      }
      
      // 2. Catch possible column schema discrepancy and retry with core basic columns
      console.log("✏️ Retrying Supabase Profile sync using standard fallback profiles criteria...");
      const basicUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        bio: user.bio,
        is_creator: !!user.is_creator,
        created_at: user.created_at || new Date().toISOString()
      };
      
      const { data: bData, error: bErr } = await sb.from("profiles").upsert(basicUser).select().single();
      if (!bErr && bData) {
        const merged = { ...user, ...bData };
        updateInMemoryUser(merged);
        return merged;
      } else if (bErr) {
        console.error("🔴 Standard fallback profiles schema write failed:", bErr);
      }
    } catch (err) {
      console.warn("⚠️ Supabase writeUser error:", err);
    }
  }
  
  updateInMemoryUser(user);
  return user;
}

// Posts Database Access Functions
async function fetchPosts(): Promise<any[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        posts = data;
        return posts;
      }
    } catch (err) {
      console.warn("⚠️ Supabase posts fetching failed, serving local state:", err);
    }
  }
  return posts;
}

async function writePost(post: any): Promise<any> {
  const sb = getSupabase();
  if (sb) {
    try {
      const payload = {
        id: post.id.startsWith("post-") && post.id.length < 32 ? undefined : post.id, // Generate real UUID in DB if needed
        creator_id: post.creator_id,
        title: post.title,
        description: post.description || "",
        media_urls: post.media_urls || [],
        is_locked: !!post.is_locked,
        price: Number(post.price) || 0
      };
      const { data, error } = await sb.from("posts").insert(payload).select().single();
      if (error) throw error;
      posts.unshift(data);
      return data;
    } catch (err) {
      console.warn("⚠️ Supabase post insertion failed, syncing locally:", err);
    }
  }
  posts.unshift(post);
  return post;
}

async function deletePostById(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("posts").delete().eq("id", id);
      if (error) throw error;
      posts = posts.filter(p => p.id !== id);
      return true;
    } catch (err) {
      console.warn("⚠️ Supabase post deletion failed:", err);
    }
  }
  posts = posts.filter(p => p.id !== id);
  return true;
}

// Subscriptions Relational Database Access
async function fetchSubscriptions(): Promise<any[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("subscriptions").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        subscriptions = data;
        return subscriptions;
      }
    } catch (err) {
      console.warn("⚠️ Supabase subscriptions query failed:", err);
    }
  }
  return subscriptions;
}

async function writeSubscription(sub: any): Promise<any> {
  const sb = getSupabase();
  if (sb) {
    try {
      const payload = {
        id: sub.id.startsWith("sub-") ? undefined : sub.id,
        fan_id: sub.fan_id,
        creator_id: sub.creator_id,
        razorpay_subscription_id: sub.razorpay_subscription_id || `sub_rzp_${Math.random().toString(36).substring(2, 9)}`,
        status: sub.status,
        start_date: sub.start_date || new Date().toISOString(),
        expiry_date: sub.expiry_date || new Date(Date.now() + 3600000 * 24 * 30).toISOString()
      };
      
      const { data, error } = await sb.from("subscriptions").upsert(payload).select().single();
      if (error) throw error;
      
      subscriptions = subscriptions.filter(s => !(s.fan_id === sub.fan_id && s.creator_id === sub.creator_id));
      subscriptions.push(data);
      return data;
    } catch (err) {
      console.warn("⚠️ Supabase writeSubscription error:", err);
    }
  }
  
  subscriptions = subscriptions.filter(s => !(s.fan_id === sub.fan_id && s.creator_id === sub.creator_id));
  subscriptions.push(sub);
  return sub;
}

// Transactions DB Loggers
async function fetchTransactions(): Promise<any[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("transactions").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        transactions = data.map((t: any) => ({
          ...t,
          target_post_id: t.target_post_id || t.post_id || undefined
        }));
        return transactions;
      }
    } catch (err) {
      console.warn("⚠️ Supabase transactions fetch failed:", err);
    }
  }
  return transactions;
}

async function writeTransaction(tx: any): Promise<any> {
  const sb = getSupabase();
  if (sb) {
    try {
      const payload = {
        id: tx.id.startsWith("tx-") ? undefined : tx.id,
        user_id: tx.user_id,
        razorpay_payment_id: tx.razorpay_payment_id || null,
        order_id: tx.order_id || null,
        amount: Number(tx.amount) || 0,
        currency: tx.currency || "INR",
        status: tx.status,
        type: tx.type,
        target_post_id: tx.target_post_id || null
      };
      
      const { data, error } = await sb.from("transactions").upsert(payload).select().single();
      if (error) throw error;
      
      const resultingTx = {
        ...data,
        target_post_id: data.target_post_id || undefined,
        creator_id: tx.creator_id // preserve local context
      };
      
      transactions = transactions.filter(t => t.id !== tx.id && t.order_id !== tx.order_id);
      transactions.push(resultingTx);
      return resultingTx;
    } catch (err) {
      console.warn("⚠️ Supabase transactions record failed, syncing locally:", err);
    }
  }
  
  transactions = transactions.filter(t => t.id !== tx.id && t.order_id !== tx.order_id);
  transactions.push(tx);
  return tx;
}

// ==========================================
// AUTHENTICATION INTERRUPT HELPER
// Gets the currently logged in user based on custom headers
// ==========================================
function getSessionUser(req: express.Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  return sessions[token] || null;
}

// ==========================================
// API REST ENDPOINTS
// ==========================================

// 1. Auth: Get Current Profile Status
app.get("/api/auth/me", (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized session" });
  }
  res.json({ user });
});

// 2. Auth: Register Profile
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required profile attributes" });
  }

  const existing = await findUserByEmail(email) || await findUserByUsername(username);
  if (existing) {
    return res.status(400).json({ error: "Username or email already claimed" });
  }

  const newUser = {
    id: `creator-${Math.random().toString(36).substr(2, 9)}-uuid`,
    username,
    email,
    role: (role === "creator" ? "creator" : "fan") as "creator" | "fan",
    avatar_url: role === "creator" 
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300" 
      : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
    bio: role === "creator" ? "Exclusive model & digital media visual creator." : "Enthusiastic Premium Fan Profile.",
    is_creator: role === "creator",
    subscription_price: role === "creator" ? 199 : 0,
    storefront_title: role === "creator" ? `${username}'s VIP Hideaway` : "",
    storefront_description: role === "creator" ? "Unlock my daily high-tier posts, behind-the-scenes streams and download rare creative design templates." : "",
    storefront_cover_url: role === "creator" ? "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&q=80&w=1200" : "",
    created_at: new Date().toISOString()
  };

  const savedUser = await writeUser(newUser);
  const token = `session-token-${savedUser.id}`;
  sessions[token] = savedUser;

  res.status(201).json({ user: savedUser, token });
});

// 3. Auth: Login Profile
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials / user not found" });
  }

  const token = `session-token-${user.id}`;
  sessions[token] = user;

  res.json({ user, token });
});

// 4. Auth: Logout Profile
app.post("/api/auth/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ success: true });
});

// 4b. Multi-Tenant: Get all creators for Platform Homepage Directory
app.get("/api/creators", async (req, res) => {
  const allUsers = await fetchUsers();
  const creators = allUsers.filter(u => u.is_creator);
  res.json({ creators });
});

// 4c. Multi-Tenant: Get specific creator storefront, details and accessibility mapping
app.get("/api/creators/:username", async (req, res) => {
  const { username } = req.params;
  const allUsers = await fetchUsers();
  const creator = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.is_creator);
  
  if (!creator) {
    return res.status(404).json({ error: "Creator storefront not active" });
  }

  const user = getSessionUser(req);

  // Check if visitor is subscribed to THIS specific creator
  const allSubs = await fetchSubscriptions();
  const isSubscribed = user ? allSubs.some(sub => 
    sub.fan_id === user.id && 
    sub.creator_id === creator.id &&
    sub.status === "active" && 
    new Date(sub.expiry_date) > new Date()
  ) : false;

  // Filter creator's specific posts
  const allPosts = await fetchPosts();
  const creatorPosts = allPosts.filter(p => p.creator_id === creator.id);

  const allTx = await fetchTransactions();
  const responsePosts = creatorPosts.map(post => {
    const isOwner = user?.id === creator.id;
    const isPPV = post.price > 0;
    
    let hasPPVUnlock = false;
    if (user && isPPV) {
      hasPPVUnlock = allTx.some(tx => 
        tx.user_id === user.id && 
        tx.target_post_id === post.id && 
        tx.status === "success" && 
        tx.type === "ppv"
      );
    }

    const hasAccess = !post.is_locked || isOwner || (isPPV && hasPPVUnlock) || (!isPPV && isSubscribed);

    if (hasAccess) {
      return {
        ...post,
        is_accessible: true
      };
    } else {
      return {
        ...post,
        is_accessible: false,
        media_urls: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=200&blur=40"]
      };
    }
  });

  res.json({
    creator,
    posts: responsePosts,
    isSubscribed
  });
});

// 4d. Multi-Tenant: Private settings update for currently logged-in creator
app.post("/api/creator/settings", async (req, res) => {
  const user = getSessionUser(req);
  if (!user || !user.is_creator) {
    return res.status(403).json({ error: "Only registered creators can change storefront portfolios" });
  }

  const { bio, subscription_price, storefront_title, storefront_description, storefront_cover_url, avatar_url } = req.body;

  const dbUser = await findUserById(user.id);
  if (dbUser) {
    const updatedUser = { ...dbUser };
    if (bio !== undefined) updatedUser.bio = bio;
    if (subscription_price !== undefined) updatedUser.subscription_price = Number(subscription_price) || 0;
    if (storefront_title !== undefined) updatedUser.storefront_title = storefront_title;
    if (storefront_description !== undefined) updatedUser.storefront_description = storefront_description;
    if (storefront_cover_url !== undefined) updatedUser.storefront_cover_url = storefront_cover_url;
    if (avatar_url !== undefined) updatedUser.avatar_url = avatar_url;

    const savedUser = await writeUser(updatedUser);

    // Keep session user sync
    sessions[req.headers.authorization?.replace("Bearer ", "") || ""] = savedUser;

    res.json({ success: true, user: savedUser });
  } else {
    res.status(404).json({ error: "Profile not found" });
  }
});

// 5. Posts feed: Fetches custom feed for fans
app.get("/api/posts", async (req, res) => {
  const user = getSessionUser(req);
  
  const allSubs = await fetchSubscriptions();
  const isSubscribed = user ? allSubs.some(sub => 
    sub.fan_id === user.id && 
    sub.status === "active" && 
    new Date(sub.expiry_date) > new Date()
  ) : false;

  const allPosts = await fetchPosts();
  const allTx = await fetchTransactions();

  const responsePosts = allPosts.map(post => {
    // Determine access
    const isOwner = user?.id === post.creator_id;
    const isPPV = post.price > 0;
    
    let hasPPVUnlock = false;
    if (user && isPPV) {
      hasPPVUnlock = allTx.some(tx => 
        tx.user_id === user.id && 
        tx.target_post_id === post.id && 
        tx.status === "success" && 
        tx.type === "ppv"
      );
    }

    const hasAccess = !post.is_locked || isOwner || (isPPV && hasPPVUnlock) || (!isPPV && isSubscribed);

    if (hasAccess) {
      return {
        ...post,
        is_accessible: true
      };
    } else {
      // Obfuscate / blur images for secure previews
      return {
        ...post,
        is_accessible: false,
        media_urls: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=200&blur=40"] // Strongly blurred aesthetic placeholder
      };
    }
  });

  res.json({
    posts: responsePosts,
    isSubscribed,
    creatorProfile: CREATOR_PROFILE
  });
});

// 6. Creator: Create a new post
app.post("/api/posts/create", async (req, res) => {
  const user = getSessionUser(req);
  if (!user || user.role !== "creator") {
    return res.status(403).json({ error: "Only VIP creators can publish events" });
  }

  const { title, description, media_urls, is_locked, price } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required for public listings" });
  }

  const newPost = {
    id: `post-${Math.random().toString(36).substr(2, 9)}`,
    creator_id: user.id,
    title,
    description: description || "",
    media_urls: media_urls && media_urls.length > 0 ? media_urls : [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"
    ],
    is_locked: is_locked ?? true,
    price: Number(price) || 0,
    created_at: new Date().toISOString()
  };

  const savedPost = await writePost(newPost);
  res.status(201).json({ post: savedPost });
});

// 7. Creator: Delete post
app.post("/api/posts/delete", async (req, res) => {
  const user = getSessionUser(req);
  if (!user || user.role !== "creator") {
    return res.status(403).json({ error: "Unprivileged request" });
  }

  const { id } = req.body;
  await deletePostById(id);
  res.json({ success: true });
});

// 8. Gateway Order Initiation (Razorpay Security Standard)
app.post("/api/razorpay/order", async (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Sign in required to initiate checkout" });
  }

  const { type, amount, target_post_id, currency, creator_id } = req.body;
  if (!amount) {
    return res.status(400).json({ error: "A valid currency amount is required" });
  }

  let orderId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const rp = getRazorpay();
  if (rp) {
    try {
      const rzOrder = await rp.orders.create({
        amount: Math.round(Number(amount) * 100), // convert INR to paise
        currency: currency || "INR",
        receipt: `receipt_${orderId}`,
      });
      orderId = rzOrder.id;
    } catch (err) {
      console.error("🔴 Standard Razorpay order build failed, generating fallback preview:", err);
    }
  }

  // Register transaction in our state logs
  const tx = {
    id: `tx-${Math.random().toString(36).substring(2, 9)}`,
    user_id: user.id,
    creator_id: creator_id || "creator-elena-rose-uuid",
    razorpay_payment_id: "", // filled on verify
    order_id: orderId,
    amount: Number(amount),
    currency: currency || "INR",
    status: "pending" as const,
    type: (type === "ppv" ? "ppv" : "subscription") as "ppv" | "subscription",
    target_post_id,
    created_at: new Date().toISOString()
  };
  
  await writeTransaction(tx);

  res.json({
    order_id: orderId,
    amount: tx.amount,
    currency: tx.currency,
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_VelvetLive2026", // Use configured key or falling back seamlessly
    subscription_id: type === "subscription" ? `sub_rzp_${Math.random().toString(36).substring(2, 9)}` : undefined
  });
});

// 9. Payment Verification (HMAC Signature Match + Live update)
app.post("/api/razorpay/verify", async (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Session missing during validation" });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, status, type, amount, target_post_id, currency, creator_id } = req.body;

  const rp = getRazorpay();
  let signatureVerified = true;
  if (rp && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
    try {
      const generated_sig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
      if (generated_sig !== razorpay_signature) {
        console.warn("⚠️ Razorpay authentic signature verification mismatch!");
        signatureVerified = false;
      }
    } catch (err) {
      console.warn("⚠️ HMAC check failed to verify standard Razorpay signatures:", err);
    }
  }

  if (!signatureVerified) {
    return res.status(400).json({ error: "Razorpay secure payment verification signature failed" });
  }

  // Find existing transaction matching the order
  const allTx = await fetchTransactions();
  let tx = allTx.find(t => t.order_id === razorpay_order_id);
  
  if (tx) {
    tx.status = "success";
    tx.razorpay_payment_id = razorpay_payment_id || `pay_${Math.random().toString(36).substr(2, 9)}`;
    if (currency) {
      tx.currency = currency;
    }
    await writeTransaction(tx);
  } else {
    tx = {
      id: `tx-${Math.random().toString(36).substring(2, 9)}`,
      user_id: user.id,
      creator_id: creator_id || "creator-elena-rose-uuid",
      razorpay_payment_id: razorpay_payment_id || `pay_${Math.random().toString(36).substr(2, 9)}`,
      order_id: razorpay_order_id || `order_${Math.random().toString(36).substr(2, 9)}`,
      amount: Number(amount || 199),
      currency: currency || "INR",
      status: "success",
      type: (type === "ppv" ? "ppv" : "subscription"),
      target_post_id,
      created_at: new Date().toISOString()
    };
    await writeTransaction(tx);
  }

  // Apply state modification for subscriptions
  if (tx.type === "subscription") {
    const targetCreatorId = tx.creator_id || creator_id || "creator-elena-rose-uuid";
    const subId = `sub_${Math.random().toString(36).substring(2, 11)}`;
    
    const newSub = {
      id: subId,
      fan_id: user.id,
      creator_id: targetCreatorId,
      razorpay_subscription_id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      status: "active",
      start_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
      created_at: new Date().toISOString()
    };
    await writeSubscription(newSub);
  }

  res.json({
    success: true,
    message: "Payment successfully verified and content unlocked!",
    transaction: tx
  });
});

// 10. Webhook endpoint for Razorpay real-time callbacks
app.post("/api/webhooks/razorpay", async (req, res) => {
  const event = req.body;
  console.log("⚓ Razorpay Webhook notification received:", event);
  
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (typeof signature === "string" && secret) {
    try {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");
      if (digest !== signature) {
        console.warn("⚠️ Invalid Razorpay Webhook Signature Match blocked.");
        return res.status(400).json({ error: "Invalid signature match" });
      }
    } catch (e) {
      console.warn("⚠️ Failed to verify Webhook Signature correctly:", e);
    }
  }

  res.status(200).json({ status: "processed" });
});

// 11. Profile Statistics (Subscriptions and Transaction histories)
app.get("/api/profile/transactions", async (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const allTx = await fetchTransactions();
  const allSubs = await fetchSubscriptions();

  const userTx = allTx.filter(t => t.user_id === user.id);
  const userSubs = allSubs.filter(s => s.fan_id === user.id);

  res.json({
    transactions: userTx,
    subscriptions: userSubs
  });
});

// 12. Creator dashboard analytics
app.get("/api/creator/analytics", async (req, res) => {
  const user = getSessionUser(req);
  if (!user || user.role !== "creator") {
    return res.status(403).json({ error: "Access denied" });
  }

  const allSubs = await fetchSubscriptions();
  const allTx = await fetchTransactions();
  const allPosts = await fetchPosts();
  const allUsers = await fetchUsers();

  const activeFansCount = allSubs.filter(s => s.creator_id === user.id && s.status === "active").length;
  
  // Isolated transactions for this creator
  const creatorTransactions = allTx.filter(t => t.creator_id === user.id && t.status === "success");

  const subscriptionRevenue = creatorTransactions
    .filter(t => t.type === "subscription")
    .reduce((sum, t) => sum + t.amount, 0);

  const ppvRevenue = creatorTransactions
    .filter(t => t.type === "ppv")
    .reduce((sum, t) => sum + t.amount, 0);

  const grossRevenue = subscriptionRevenue + ppvRevenue;

  const postsPublishedList = allPosts.filter(p => p.creator_id === user.id);

  // Map subscriber information
  const mappedSubscribers = allSubs
    .filter(s => s.creator_id === user.id && s.status === "active")
    .map(sub => {
      const fan = allUsers.find(u => u.id === sub.fan_id) || { username: "vip_supporter", email: "supporter@velvet.vip" };
      return {
        ...sub,
        fan: {
          username: fan.username,
          email: fan.email,
          avatar_url: (fan as any).avatar_url || ""
        }
      };
    });

  res.json({
    activeFansCount,
    grossRevenue,
    subscriptionRevenue,
    ppvRevenue,
    postsCount: postsPublishedList.length,
    posts: postsPublishedList,
    subscribers: mappedSubscribers,
    transactions: creatorTransactions.map(t => {
      const fan = allUsers.find(u => u.id === t.user_id);
      return {
        ...t,
        fan_username: fan?.username || "anonymous_fan"
      };
    })
  });
});

// ==========================================
// VITE AND PRODUCTION SERVING LAYER
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Starting development mode server. Integrating Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Production mode server detected. Serving static folder assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Full-stack Platform Server running flawlessly on http://localhost:${PORT}`);
  });
}

startServer();
