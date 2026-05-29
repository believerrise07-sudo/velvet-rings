import React, { useState, useEffect } from "react";
import { Search, Sparkles, MapPin, Star, ArrowRight, UserCheck, Shield } from "lucide-react";
import { Profile } from "../types";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { formatPrice, getSelectedCurrency } from "../lib/currency";

interface DirectoryProps {
  currUser: Profile | null;
  onSelectCreator: (username: string) => void;
  onAuthTrigger: () => void;
}

export function Directory({ currUser, onSelectCreator, onAuthTrigger }: DirectoryProps) {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(getSelectedCurrency());

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCreators();
        setCreators(res.creators);
      } catch (err) {
        console.error("Failed to load platform directory:", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleCur = () => setCurrency(getSelectedCurrency());
    window.addEventListener("velvet_currency_changed", handleCur);
    return () => window.removeEventListener("velvet_currency_changed", handleCur);
  }, []);

  const filteredCreators = creators.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.storefront_title && c.storefront_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fallback visual tags to enrich directory styling
  const getCreatorTags = (username: string) => {
    switch (username) {
      case "elena_rose":
        return ["Fashion", "High Art", "Milan Runway"];
      case "sasha_noir":
        return ["Dark Cinematic", "Visual Poetry", "3D Design"];
      case "marcus_vance":
        return ["Street Film", "Cyberpunk", "Automotive"];
      case "maya_lin":
        return ["Teahouse Blueprint", "Kyoto Architecture", "Interior"];
      default:
        return ["Digital Pioneer", "Creative Media"];
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-pink-500 selection:text-white">
      {/* Visual Header Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
        
        {/* Hero Branding Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono px-3.5 py-1.5 rounded-full uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Discover Velvet Creator Storefronts</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]"
          >
            Direct Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500">Premium Vaults</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Browse independent digital pioneers unlocking raw portfolios, design blueprints, and unedited streams safely with Razorpay and custom currency control.
          </motion.p>
        </div>

        {/* Dynamic Interactive Directory Search Area */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-md opacity-25 group-focus-within:opacity-40 transition" />
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-700 transition">
              <Search className="w-5 h-5 text-zinc-500 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search creative builders, designer layouts, usernames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 ring-0 focus:ring-0 text-white placeholder-zinc-500 focus:outline-none py-4 px-3 text-sm font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-mono text-zinc-500 hover:text-white mr-4 transition"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-zinc-900/40 border border-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-16 border border-zinc-900 bg-zinc-900/20 rounded-2xl max-w-lg mx-auto">
            <p className="text-zinc-500 font-mono text-xs">NO CREATORS FOUND MATCHING SEARCH FILTERS</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-mono font-bold text-pink-500 hover:underline"
            >
              Reset Search Query
            </button>
          </div>
        ) : (
          /* Cards Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCreators.map((creator, i) => {
              const tags = getCreatorTags(creator.username);
              const price = creator.subscription_price || 199;
              return (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-zinc-900/30 border border-zinc-850 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

                  <div>
                    {/* Compact Branded Cover Band */}
                    <div className="relative h-32 w-full overflow-hidden bg-zinc-950">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-zinc-900/90 z-10" />
                      <img
                        src={creator.storefront_cover_url || "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&q=80&w=400"}
                        alt={creator.username}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    {/* Info block with overlapping Avatar */}
                    <div className="px-6 pb-4 relative z-20 -mt-10">
                      <div className="flex items-end gap-3 mb-3">
                        <img
                          src={creator.avatar_url}
                          alt={creator.username}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-full border-2 border-zinc-900 object-cover shrink-0 shadow-lg"
                        />
                        <div className="mb-0.5">
                          <h3 className="text-lg font-bold text-white font-display leading-tight group-hover:text-pink-400 transition">
                            {creator.storefront_title || `${creator.username}'s Storefront`}
                          </h3>
                          <p className="text-xs text-pink-500 font-mono">@{creator.username}</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-2 min-h-[48px]">
                        {creator.bio}
                      </p>

                      {/* Visual Category Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {tags.map((tag) => (
                          <span 
                            key={tag}
                            className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono px-2.5 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Foot Actions Section */}
                  <div className="border-t border-zinc-850 px-6 py-4 bg-zinc-900/50 flex items-center justify-between">
                    <div className="font-mono text-zinc-500 text-[11px]">
                      Access Fee:{" "}
                      <span className="text-white font-semibold block text-sm font-sans mt-0.5">
                        {formatPrice(price, currency)}/mo
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectCreator(creator.username)}
                      className="bg-zinc-800 hover:bg-pink-600 hover:text-white text-zinc-300 font-bold text-xs py-2 px-4 rounded-xl transition flex items-center gap-1.5 border border-zinc-700/50 group-hover:border-pink-500/20 shadow-md"
                    >
                      <span>Get Access Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Platform Call Highlights */}
        <div className="mt-28 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-zinc-900 pt-16">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20 text-pink-400">
              <Star className="w-4 h-4 fill-pink-500" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide font-display">Multi-Tenant Storefronts</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Each digital architect or creator gets an independent storefront with dedicated cover images, custom prices, and subscription vault access.</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide font-display">Pristine Isolation</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Creators are protected with rigorous database access rules. Premium posts remain blurred until fans subscribe via secure Razorpay orders.</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide font-display">Global Currency Scale</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Set your rates in INR or any global standard. Fans checkout seamlessly across adaptive currencies dynamically calibrated live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
