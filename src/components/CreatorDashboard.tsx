import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Lock, 
  Globe, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserCheck
} from "lucide-react";
import { api } from "../lib/api";
import { Post, Profile } from "../types";
import { MediaUpload } from "./media-upload";
import { Loader } from "./ui/Loader";
import { motion } from "motion/react";
import { getSelectedCurrency, formatPrice } from "../lib/currency";

interface CreatorDashboardProps {
  onPostCreated: () => void;
  creatorProfile: Profile;
  onProfileUpdated?: (updated: Profile) => void;
}

export function CreatorDashboard({ onPostCreated, creatorProfile, onProfileUpdated }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "subscribers" | "earnings" | "analytics" | "settings">("overview");
  const [currency, setCurrency] = useState(getSelectedCurrency());

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency(getSelectedCurrency());
    };
    window.addEventListener("velvet_currency_changed", handleCurrencyChange);
    return () => {
      window.removeEventListener("velvet_currency_changed", handleCurrencyChange);
    };
  }, []);

  // Post Creator States
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [postPrice, setPostPrice] = useState("0");
  const [publishing, setPublishing] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");
  const [postError, setPostError] = useState("");

  // Settings customizer states
  const [settingsTitle, setSettingsTitle] = useState(creatorProfile.storefront_title || "");
  const [settingsDesc, setSettingsDesc] = useState(creatorProfile.storefront_description || "");
  const [settingsCover, setSettingsCover] = useState(creatorProfile.storefront_cover_url || "");
  const [settingsBio, setSettingsBio] = useState(creatorProfile.bio || "");
  const [settingsPrice, setSettingsPrice] = useState(String(creatorProfile.subscription_price || 199));
  const [settingsAvatar, setSettingsAvatar] = useState(creatorProfile.avatar_url || "");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // Sync state if profile changes
  useEffect(() => {
    setSettingsTitle(creatorProfile.storefront_title || "");
    setSettingsDesc(creatorProfile.storefront_description || "");
    setSettingsCover(creatorProfile.storefront_cover_url || "");
    setSettingsBio(creatorProfile.bio || "");
    setSettingsPrice(String(creatorProfile.subscription_price || 199));
    setSettingsAvatar(creatorProfile.avatar_url || "");
  }, [creatorProfile]);

  // Analytical States
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getCreatorAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle) {
      setPostError("Please provide a title for your premium listing.");
      return;
    }
    setPublishing(true);
    setPostError("");
    setPostSuccess("");

    try {
      await api.createPost({
        title: postTitle,
        description: postDesc,
        media_urls: mediaUrls,
        is_locked: isLocked,
        price: isLocked ? Number(postPrice) : 0,
      });

      setPostSuccess("Exclusive post staged successfully! It is active on your storefront.");
      setPostTitle("");
      setPostDesc("");
      setMediaUrls([]);
      setIsLocked(true);
      setPostPrice("0");
      
      onPostCreated();
      fetchAnalytics();
    } catch (err: any) {
      setPostError(err.message || "Failed to broadcast content.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.deletePost(id);
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess("");
    setSettingsError("");

    try {
      const res = await api.updateCreatorSettings({
        storefront_title: settingsTitle,
        storefront_description: settingsDesc,
        storefront_cover_url: settingsCover,
        bio: settingsBio,
        subscription_price: Number(settingsPrice) || 0,
        avatar_url: settingsAvatar
      });

      setSettingsSuccess("Your independent storefront has been updated!");
      if (onProfileUpdated) {
        onProfileUpdated(res.user);
      }
    } catch (err: any) {
      setSettingsError(err.message || "Failed to save storefront customization details.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* 1. Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-pink-500 font-bold bg-pink-500/10 border border-pink-500/25 px-2.5 py-1 rounded-md">
            VIP Creator Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1.5 tracking-wide">
            Studio Dashboard
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Logged in as @{creatorProfile.username} • Secure Multi-Tenant Terminal
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/creator/${creatorProfile.username}`, "_blank")}
            className="bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-pink-400 py-2 px-4 rounded-xl border border-zinc-800 transition"
          >
            Preview My Live Storefront
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR NAVIGATION GRID */}
        <div className="space-y-1">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "posts", label: "Posts Manager", icon: FileText },
            { id: "subscribers", label: "Subscribers", icon: Users },
            { id: "earnings", label: "Earnings Break", icon: DollarSign },
            { id: "analytics", label: "Analytics Trends", icon: BarChart3 },
            { id: "settings", label: "Store Customize", icon: Settings }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPostSuccess("");
                  setPostError("");
                  setSettingsSuccess("");
                  setSettingsError("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500/15 to-purple-600/10 text-white border border-pink-500/20 font-bold"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent"
                }`}
              >
                <IconComp className={`w-4 h-4 ${activeTab === tab.id ? "text-pink-500" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* WORK BENCH DISPLAY */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/15 border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white font-display mb-1">Welcome back, {creatorProfile.username}!</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                  Below is a centralized summary of your subscriber activity, payouts, and listings. Share your custom handle <span className="text-pink-500 font-mono">/creator/{creatorProfile.username}</span> on your socials to let fans unlock premium digital media.
                </p>
              </div>

              {loadingAnalytics ? (
                <Loader className="py-12" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-xl">
                    <DollarSign className="w-5 h-5 text-pink-500 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500">GROSS REVENUE</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {formatPrice(analytics?.grossRevenue || 0, currency)}
                    </h4>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-xl">
                    <Users className="w-5 h-5 text-purple-400 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500">ACTIVE SUBSCRIBERS</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {analytics?.activeFansCount || 0} fans
                    </h4>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-xl">
                    <FileText className="w-5 h-5 text-emerald-400 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500">TOTAL LISTINGS</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {analytics?.postsCount || 0} broadcasts
                    </h4>
                  </div>
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="bg-zinc-900/35 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 font-display uppercase tracking-wider">Quick Actions Room</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-850 hover:border-zinc-750 transition rounded-xl text-left"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">Broadcast New Post</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Stitch models and blueprint lock sets</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-850 hover:border-zinc-750 transition rounded-xl text-left"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">Customize Storefront</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Set fees and change cover arts</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POSTS MANAGER */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {/* Form segment */}
              <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-4 relative">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-pink-500" />
                  <span>Stitch Premium Post Event</span>
                </h3>

                {postSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/35 text-xs text-emerald-400 p-3.5 rounded-xl flex items-center gap-2 font-mono">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{postSuccess}</span>
                  </div>
                )}

                {postError && (
                  <div className="bg-rose-500/10 border border-rose-500/35 text-xs text-rose-300 p-3.5 rounded-xl flex items-center gap-2 font-mono">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-mono">Broadcasting Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto Tea House Frame Sketchbook Details..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-mono">Extended Technical Description (Supports Markdown info)</label>
                    <textarea
                      rows={4}
                      placeholder="Share details you want VIP members or single-ticket buyers to unlock..."
                      value={postDesc}
                      onChange={(e) => setPostDesc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition resize-none"
                    />
                  </div>

                  {/* Upload container */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-mono">Upload Exclusive Render/Attachment</label>
                    <MediaUpload
                      onUploadComplete={(urls) => setMediaUrls(urls)}
                      onClear={() => setMediaUrls([])}
                    />
                  </div>

                  <div className="border border-zinc-850 bg-zinc-950/50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">Enforce Content Lock</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Protect assets for paying loyal fans only</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLocked(!isLocked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          isLocked
                            ? "bg-pink-500/15 border border-pink-500/20 text-pink-400"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked VIP Access</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Public Free Post</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isLocked && (
                      <div className="space-y-1.5 pt-3 border-t border-zinc-850">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-zinc-400 font-mono">
                            PPV Price Ticketing (Simulated Rupees)
                          </label>
                          <span className="text-[10px] text-zinc-500 font-mono">Enter 0 to open for subscribers</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-xs text-zinc-500 font-mono">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={postPrice}
                            onChange={(e) => setPostPrice(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 pl-8 pr-4 text-sm text-white outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={publishing}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl text-sm transition font-mono tracking-wide flex items-center justify-center gap-2"
                  >
                    {publishing ? <Loader size="sm" /> : "BROADCAST POST"}
                  </button>
                </form>
              </div>

              {/* Published archive segment */}
              <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Active Storefront Posts ({analytics?.posts?.length || 0})</h3>
                
                {loadingAnalytics ? (
                  <Loader size="sm" />
                ) : !analytics?.posts || analytics.posts.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6 font-mono">No active posts broadcast.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.posts.map((post: Post) => (
                      <div key={post.id} className="bg-zinc-950/50 hover:bg-zinc-950/90 border border-zinc-850 hover:border-zinc-800 transition p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{post.title}</h4>
                            {post.is_locked ? (
                              <span className="text-[9px] bg-amber-500/15 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                                LOCK {post.price > 0 ? `₹${post.price}` : "SUBS"}
                              </span>
                            ) : (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                                PUBLIC
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-1">{post.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition shrink-0"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIBERS */}
          {activeTab === "subscribers" && (
            <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <Users className="w-4 h-4 text-pink-500" />
                <span>Active VIP Subscriber Registries</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                These accounts have authorized active subscription agreements powered by Sandbox Razorpay.
              </p>

              {loadingAnalytics ? (
                <Loader />
              ) : !analytics?.subscribers || analytics.subscribers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono">
                  <UserCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-xs">No authorized VIP subscriptions found in directory logs.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {analytics.subscribers.map((sub: any) => (
                    <div key={sub.id} className="bg-zinc-950/45 border border-zinc-850 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.fan?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${sub.fan?.username || "fan"}`}
                          alt="Subscriber Avatar"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">@{sub.fan?.username || "anonymous_supporter"}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">{sub.fan?.email || "fan@velvet.vip"}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
                          ACTIVE SUB
                        </span>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1.5">Exp: {new Date(sub.expiry_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EARNINGS BREAKDOWN */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-pink-500" />
                  <h3 className="text-base font-bold text-white leading-tight font-display uppercase tracking-wide">Revenue Breakdown</h3>
                </div>

                {loadingAnalytics ? (
                  <Loader />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="bg-zinc-950/60 border border-zinc-850 p-5 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold text-pink-500/70">SUBSCRIPTION REVENUE</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {formatPrice(analytics?.subscriptionRevenue || 0, currency)}
                      </h4>
                      <p className="text-[10px] text-zinc-500">Earned from recurrent Access passes</p>
                    </div>
                    
                    <div className="bg-zinc-950/60 border border-zinc-850 p-5 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold text-purple-400/70">PAY-PER-VIEW REVENUE</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {formatPrice(analytics?.ppvRevenue || 0, currency)}
                      </h4>
                      <p className="text-[10px] text-zinc-500">Ticket transactions on individual locks</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Ledger list */}
              <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Real-Time Ledger Logs ({analytics?.transactions?.length || 0})</h3>
                
                {loadingAnalytics ? (
                  <Loader size="sm" />
                ) : !analytics?.transactions || analytics.transactions.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6 font-mono">No payment transactions processed yet.</p>
                ) : (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {analytics.transactions.map((tx: any) => (
                      <div key={tx.id} className="bg-zinc-950/50 border border-zinc-850 hover:border-zinc-800 transition p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-sans">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">@{tx.fan_username}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-widest ${
                              tx.type === "subscription" ? "bg-pink-500/15 text-pink-400" : "bg-purple-500/15 text-purple-400"
                            }`}>
                              {tx.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono truncate">Gateway Order ID: {tx.order_id}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-emerald-400 font-bold font-mono text-sm">+{formatPrice(tx.amount, currency)}</span>
                          <span className="block text-[9px] text-zinc-500 mt-1 uppercase font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS TRENDS */}
          {activeTab === "analytics" && (
            <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-500" />
                <h3 className="text-base font-bold text-white font-display uppercase tracking-widest leading-none">Traffic & Revenue trends</h3>
              </div>

              {loadingAnalytics ? (
                <Loader />
              ) : (
                <div className="space-y-8">
                  
                  {/* CSS Visual Bar 1: Subscriber Growth Scale */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-550">Access pass conversion rate</span>
                      <span className="text-white font-bold">14.8% (Target 15%)</span>
                    </div>
                    <div className="w-full h-3.5 bg-zinc-950/80 rounded-full border border-zinc-900 overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: "93%" }} />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">93% of subscription targets met across the current 30-day sandbox sequence period.</p>
                  </div>

                  {/* CSS Visual Bar 2: Earnings target distribution */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-550">PPV ticket item pull-through rate</span>
                      <span className="text-white font-bold">4.2% (Standard avg 3%)</span>
                    </div>
                    <div className="w-full h-3.5 bg-zinc-950/80 rounded-full border border-zinc-900 overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: "72%" }} />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">High average viewer retention recorded for recently broadcast locks and blueprint attachments.</p>
                  </div>

                  {/* Swiss Minimalism 30-Day simulated revenue spikes visualization */}
                  <div className="border border-zinc-850 bg-zinc-950/45 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-zinc-300 font-display flex items-center gap-1.5 uppercase">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>30-Day Revenue Trend sequence</span>
                    </h4>
                    
                    {/* Simulated Bars */}
                    <div className="h-28 flex items-end justify-between items-stretch gap-2.5 pt-6 relative border-b border-zinc-800">
                      {[15, 30, 20, 45, 60, 40, 75, 55, 90, 80, 100, 110].map((val, key) => (
                        <div key={key} className="flex-1 flex flex-col justify-end">
                          <div 
                            className="bg-zinc-800 hover:bg-pink-500 rounded-t-md transition-colors duration-200"
                            style={{ height: `${val}%` }}
                            title={`Revenue Period ${key+1}: ${val * 10}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>DAY 01</span>
                      <span>DAY 15</span>
                      <span>DAY 30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS / STOREFRONT CUSTOMIZE */}
          {activeTab === "settings" && (
            <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <Settings className="w-4 h-4 text-pink-500" />
                <span>Custom Brand Storefront settings</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-normal">
                Customize look and pricing for your public <span className="text-pink-500 font-mono">/creator/{creatorProfile.username}</span> URL securely.
              </p>

              {settingsSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/35 text-xs text-emerald-400 p-3.5 rounded-xl flex items-center gap-2 font-mono">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsError && (
                <div className="bg-rose-500/10 border border-rose-500/35 text-xs text-rose-300 p-3.5 rounded-xl flex items-center gap-2 font-mono">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{settingsError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-mono">Custom Storefront Title</label>
                    <input
                      type="text"
                      value={settingsTitle}
                      onChange={(e) => setSettingsTitle(e.target.value)}
                      placeholder="e.g. Elena's Milan Runway Vault"
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-mono">Subscription Fee Passes (₹ / INR)</label>
                    <input
                      type="number"
                      min="1"
                      value={settingsPrice}
                      onChange={(e) => setSettingsPrice(e.target.value)}
                      placeholder="Pricing e.g. 199"
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-mono font-bold">Short Bio custom tag</label>
                  <input
                    type="text"
                    value={settingsBio}
                    onChange={(e) => setSettingsBio(e.target.value)}
                    placeholder="Short summary tagline descriptive"
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-mono">Storefront Long Description</label>
                  <textarea
                    rows={4}
                    value={settingsDesc}
                    onChange={(e) => setSettingsDesc(e.target.value)}
                    placeholder="Describe custom bundles, archives, plans, and premium values unlocked here..."
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-mono">Avatar Image URL (or raw files)</label>
                  <input
                    type="text"
                    value={settingsAvatar}
                    onChange={(e) => setSettingsAvatar(e.target.value)}
                    placeholder="Avatar link e.g. https://images.unsplash.com/..."
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-mono">Cover Banner Image URL</label>
                  <input
                    type="text"
                    value={settingsCover}
                    onChange={(e) => setSettingsCover(e.target.value)}
                    placeholder="Cover layout banner wallpaper link"
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-pink-500 rounded-xl py-3 px-4 text-sm text-white outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl text-sm transition font-mono tracking-wide"
                >
                  {savingSettings ? <Loader size="sm" /> : "SAVE STOREFRONT DETAILS"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
