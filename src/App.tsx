import { useState, useEffect } from "react";
import { Sparkles, Rss, ShieldCheck, Heart, User, LogOut, ArrowUpRight, HelpCircle, Layers, Home } from "lucide-react";
import { api, setAuthToken, clearAuthToken } from "./lib/api";
import { Post, Profile } from "./types";
import { Directory } from "./components/Directory";
import { Landing } from "./components/Landing";
import { Feed } from "./components/Feed";
import { CreatorDashboard } from "./components/CreatorDashboard";
import { Profile as ProfilePage } from "./components/Profile";
import { Auth } from "./components/Auth";
import { Loader, SkeletonFeed } from "./components/ui/Loader";
import { motion, AnimatePresence } from "motion/react";
import { SUPPORTED_CURRENCIES, getSelectedCurrency, setSelectedCurrency } from "./lib/currency";

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"home" | "storefront" | "feed" | "dashboard" | "profile">("home");
  
  // Feed data state (general or fallback feed)
  const [posts, setPosts] = useState<(Post & { is_accessible: boolean })[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Storefront multi-tenant states
  const [selectedCreatorUsername, setSelectedCreatorUsername] = useState<string>("");
  const [storefrontCreator, setStorefrontCreator] = useState<Profile | null>(null);
  const [storefrontPosts, setStorefrontPosts] = useState<(Post & { is_accessible: boolean })[]>([]);
  const [storefrontIsSubscribed, setStorefrontIsSubscribed] = useState(false);
  const [loadingStorefront, setLoadingStorefront] = useState(false);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Global Currency Selection state
  const [selectedCurrency, setSelectedCurrencyState] = useState(getSelectedCurrency());

  useEffect(() => {
    const handleCurrencyChange = () => {
      setSelectedCurrencyState(getSelectedCurrency());
    };
    window.addEventListener("velvet_currency_changed", handleCurrencyChange);
    return () => {
      window.removeEventListener("velvet_currency_changed", handleCurrencyChange);
    };
  }, []);

  // 1. Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      // Check if there is an existing token in localStorage.
      // If none, we populate with the demo fan session to make the landing and feed interactive immediately!
      const existingToken = localStorage.getItem("velvet_session_token");
      if (!existingToken) {
        localStorage.setItem("velvet_session_token", "mock-session-fan-token");
      }

      try {
        const res = await api.getCurrentUser();
        setCurrentUser(res.user);
      } catch (err) {
        console.warn("Session check failed, clearing", err);
        clearAuthToken();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // 2. Load general global feeds fallback
  const fetchFeedData = async () => {
    if (loading) return;
    setLoadingFeed(true);
    try {
      const data = await api.getPosts();
      setPosts(data.posts);
      setIsSubscribed(data.isSubscribed);
      setCreatorProfile(data.creatorProfile);
    } catch (err) {
      console.error("Failed to load global feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, [currentUser, loading]);

  // 3. Dynamic Storefront data loader based on username queries
  const fetchStorefrontData = async (username: string) => {
    setLoadingStorefront(true);
    try {
      const data = await api.getCreatorStorefront(username);
      setStorefrontCreator(data.creator);
      setStorefrontPosts(data.posts);
      setStorefrontIsSubscribed(data.isSubscribed);
    } catch (err) {
      console.error("Failed to fetch storefront:", err);
    } finally {
      setLoadingStorefront(false);
    }
  };

  const handleSelectCreator = (username: string) => {
    setSelectedCreatorUsername(username);
    fetchStorefrontData(username);
    setCurrentView("storefront");
  };

  // 4. Authenticate Success Callbacks
  const handleAuthSuccess = (user: Profile, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    setShowAuthModal(false);
    
    // Redirect role specifically to corresponding initial screens
    if (user.role === "creator") {
      setCurrentView("dashboard");
    } else {
      setCurrentView("feed");
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentView("home");
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.deletePost(id);
      fetchFeedData();
      if (storefrontCreator) {
        fetchStorefrontData(storefrontCreator.username);
      }
    } catch (err) {
      alert("Post deletion error: " + err);
    }
  };

  // 5. PRESET ACCOUNT ROLE SWITCHER
  const switchDemoRole = async (targetRole: "fan" | "creator") => {
    setLoading(true);
    try {
      if (targetRole === "creator") {
        // Predefined Elena Rose profile direct bypass
        const res = await api.register({
          username: "elenarose",
          email: "elena@velvet.vip",
          password: "creator-milan-pass-2026",
          role: "creator"
        }).catch(async () => {
          return api.login({
            email: "elena@velvet.vip",
            password: "creator-milan-pass-2026"
          });
        });

        setAuthToken(res.token);
        setCurrentUser(res.user);
        setCurrentView("dashboard");
      } else {
        // Predefined standard fan bypass
        const res = await api.register({
          username: "exclusive_fan",
          email: "fan@velvet.vip",
          password: "fan-support-pass-222",
          role: "fan"
        }).catch(async () => {
          return api.login({
            email: "fan@velvet.vip",
            password: "fan-support-pass-222"
          });
        });

        setAuthToken(res.token);
        setCurrentUser(res.user);
        setCurrentView("feed");
      }
    } catch (err) {
      console.error("Demo Switch Error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader size="lg" />
        <p className="text-xs text-zinc-500 font-mono tracking-wide animate-pulse uppercase">
          Initializing Velvet Sandbox Secure Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* GLOW ATMOSPHERE */}
      <div className="absolute top-0 inset-x-0 h-96 bg-radial-gradient pointer-events-none z-0 bg-transparent" />

      {/* STICKY NAVBAR PANEL */}
      <header className="sticky top-0 z-40 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900 px-4 py-4 shrink-0 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentView("home")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-pink-900/10 transition group-hover:scale-105">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 italic">VELVET</span>
              <p className="text-[9px] text-zinc-500 font-mono tracking-wider font-semibold">VIP CREATOR SPACES</p>
            </div>
          </div>

          {/* Desktop Central Route Selectors */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/40 p-1 border border-zinc-900 rounded-xl font-medium text-xs">
            <button
              onClick={() => setCurrentView("home")}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
                currentView === "home"
                  ? "bg-zinc-850 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-zinc-400" />
              <span>Platform Portal</span>
            </button>
            
            {storefrontCreator && (
              <button
                onClick={() => setCurrentView("storefront")}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
                  currentView === "storefront"
                    ? "bg-zinc-850 text-zinc-100 font-semibold"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>@{storefrontCreator.username}'s Storefront</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView("feed")}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
                currentView === "feed"
                  ? "bg-zinc-855 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <Rss className="w-3.5 h-3.5" />
              <span>Global Feed</span>
            </button>
            <button
              onClick={() => {
                if (!currentUser || currentUser.role !== "creator") {
                  setShowRoleInfo(true);
                } else {
                  setCurrentView("dashboard");
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
                currentView === "dashboard"
                  ? "bg-zinc-855 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
              <span>Creator Studio</span>
            </button>
          </nav>

          {/* Right session action triggers */}
          <div className="flex items-center gap-3">
            
            {/* GLOBAL CURRENCY ELECTOR */}
            <div className="relative flex items-center bg-zinc-900/40 border border-zinc-900 rounded-xl px-2.5 py-1 text-xs text-zinc-300">
              <span className="text-[9px] text-zinc-500 font-mono tracking-wider font-semibold mr-1.5 uppercase">Pay In:</span>
              <select
                value={selectedCurrency.code}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  setSelectedCurrencyState(SUPPORTED_CURRENCIES.find(c => c.code === e.target.value) || SUPPORTED_CURRENCIES[0]);
                }}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-pink-500 hover:text-pink-400 transition outline-none border-none"
              >
                {SUPPORTED_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code} className="bg-zinc-950 text-zinc-300 font-sans">
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* QUICK ROLE CONTROLLER SWITCHER */}
            <div className="bg-zinc-900/40 p-1 border border-zinc-900 rounded-xl flex items-center gap-1 text-[10px] font-mono">
              <span className="text-zinc-500 px-1.5 hidden sm:inline">Sandbox Mock:</span>
              <button
                onClick={() => switchDemoRole("fan")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currentUser?.role === "fan" 
                    ? "bg-pink-500/15 border border-pink-500/25 text-pink-400 font-bold" 
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                Fan
              </button>
              <button
                onClick={() => switchDemoRole("creator")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currentUser?.role === "creator"
                    ? "bg-purple-500/15 border border-purple-500/25 text-purple-400 font-bold" 
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                Creator
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView("profile")}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-900/40 hover:bg-zinc-850 border border-zinc-900 rounded-xl text-xs font-semibold font-mono transition text-zinc-200 ${
                    currentView === "profile" ? "border-pink-500 text-pink-400" : ""
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-pink-500" />
                  <span className="hidden sm:inline">@{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition duration-200 shadow-md border border-pink-500/10"
              >
                VIP Login
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation link bar */}
        <div className="flex md:hidden justify-center gap-2 mt-4 pt-4 border-t border-zinc-900 text-xs font-medium text-zinc-400">
          <button
            onClick={() => setCurrentView("home")}
            className={`px-3 py-1.5 rounded-lg ${currentView === "home" ? "bg-zinc-900 text-zinc-100 font-semibold" : ""}`}
          >
            Explore
          </button>
          {storefrontCreator && (
            <button
              onClick={() => setCurrentView("storefront")}
              className={`px-3 py-1.5 rounded-lg ${currentView === "storefront" ? "bg-zinc-900 text-zinc-100 font-semibold" : ""}`}
            >
              Store
            </button>
          )}
          <button
            onClick={() => setCurrentView("feed")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${currentView === "feed" ? "bg-zinc-900 text-zinc-100 font-semibold" : ""}`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => {
              if (!currentUser || currentUser.role !== "creator") {
                setShowRoleInfo(true);
              } else {
                setCurrentView("dashboard");
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${currentView === "dashboard" ? "bg-zinc-900 text-zinc-100 font-semibold" : ""}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
            <span>Studio</span>
          </button>
        </div>
      </header>

      {/* CORE FRAMEWORK SUB-PAGES ROUTER */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {loadingFeed || loadingStorefront ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24"
            >
              <SkeletonFeed />
            </motion.div>
          ) : (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {currentView === "home" && (
                <Directory
                  currUser={currentUser}
                  onSelectCreator={handleSelectCreator}
                  onAuthTrigger={() => setShowAuthModal(true)}
                />
              )}

              {currentView === "storefront" && storefrontCreator && (
                <Landing
                  creator={storefrontCreator}
                  currUser={currentUser}
                  onSubscribeSuccess={() => fetchStorefrontData(storefrontCreator.username)}
                  onAuthTrigger={() => setShowAuthModal(true)}
                />
              )}

              {currentView === "feed" && creatorProfile && (
                <Feed
                  posts={posts}
                  isSubscribed={isSubscribed}
                  currentUser={currentUser}
                  onRefresh={fetchFeedData}
                  onDeletePost={handleDeletePost}
                  onAuthTrigger={() => setShowAuthModal(true)}
                  creatorProfile={creatorProfile}
                />
              )}

              {currentView === "dashboard" && currentUser && (
                <CreatorDashboard
                  creatorProfile={currentUser}
                  onPostCreated={fetchFeedData}
                  onProfileUpdated={(updated) => setCurrentUser(updated)}
                />
              )}

              {currentView === "profile" && currentUser && (
                <ProfilePage
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* UNPRIVILEGED DEMO WARNING / GUIDE OVERLAYS */}
      <AnimatePresence>
        {showRoleInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoleInfo(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0.95 }}
              className="bg-zinc-950 border border-pink-500/20 max-w-sm w-full rounded-2xl p-6 relative z-10 shadow-[0_0_50px_rgba(236,72,153,0.1)] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 mx-auto mb-4 animate-pulse">
                <HelpCircle className="w-5.5 h-5.5" />
              </div>
              
              <h3 className="text-base font-bold text-white font-display tracking-wide">Creator Credentials Mandate</h3>
              <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">
                To inspect the **Creator Dashboard** (where you upload reels, manage listings, and configure is_locked PPV values), select the **Creator** preset switcher in the navbar. This simulates a real Role-Based Access control check.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowRoleInfo(false);
                    switchDemoRole("creator");
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white rounded-xl py-3 text-xs font-semibold transition tracking-wide flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(236,72,153,0.3)] border border-pink-400/20"
                >
                  <span>Switch to Creator Preset Now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowRoleInfo(false)}
                  className="w-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 rounded-xl py-2.5 text-xs font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE REGISTER/LOGIN PORTALS */}
      <AnimatePresence>
        {showAuthModal && (
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
