import React, { useState, useEffect } from "react";
import { Heart, Sparkles, Image, ShieldAlert, Award, Star, MessageSquare } from "lucide-react";
import { Profile } from "../types";
import { SubscriptionButton } from "./payment/SubscriptionButton";
import { motion } from "motion/react";
import { getSelectedCurrency, formatPrice } from "../lib/currency";

interface LandingProps {
  creator: Profile;
  currUser: Profile | null;
  onSubscribeSuccess: () => void;
  onAuthTrigger: () => void;
}

export function Landing({ creator, currUser, onSubscribeSuccess, onAuthTrigger }: LandingProps) {
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

  const subPrice = creator.subscription_price || 199;

  return (
    <div className="relative min-h-screen bg-zinc-950 pb-20">
      {/* 1. Stunning Hero Banner Header */}
      <div className="relative h-[25vh] sm:h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-zinc-950 z-10" />
        <img
          src={creator.storefront_cover_url || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1500"}
          alt="Creator Cover Banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-75 scale-101"
        />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
      </div>

      {/* 2. Overlapping Creator Profile Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 -mt-16 sm:-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
          
          {/* Avatar and Info Group */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative p-1 bg-zinc-950 border border-zinc-800 rounded-full shrink-0"
            >
              <img
                src={creator.avatar_url}
                alt={creator.username}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-emerald-500 border border-zinc-950 w-4 h-4 rounded-full flex items-center justify-center shadow" />
            </motion.div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide">
                  {creator.storefront_title || `${creator.username}'s Creative Space`}
                </h1>
                <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              </div>
              <p className="text-sm text-pink-500 font-medium font-mono">@{creator.username}</p>
              
              {/* Creator Metas */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 font-mono">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="text-zinc-200 font-semibold">{creator.username === "elena_rose" ? "45.8k" : creator.username === "sasha_noir" ? "29.1k" : "12.4k"}</span>
                  <span>likes</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-zinc-200 font-semibold">{creator.username === "elena_rose" ? "142" : creator.username === "sasha_noir" ? "88" : "32"}</span>
                  <span>posts</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-zinc-200 font-semibold">{creator.username === "elena_rose" ? "18k" : creator.username === "sasha_noir" ? "9.5k" : "3.1k"}</span>
                  <span>VIPs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe Call Action in Header */}
          <div className="shrink-0 w-full sm:w-auto">
            {currUser ? (
              <SubscriptionButton creatorId={creator.id} onSuccess={onSubscribeSuccess} price={subPrice} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAuthTrigger}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-lg shadow-pink-900/10 flex items-center justify-center gap-2 text-sm font-display tracking-wide border border-pink-500/10"
              >
                <Sparkles className="w-4 h-4 text-pink-200" />
                <span>Join VIP Club • {formatPrice(subPrice, currency)}/mo</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* 3. Bio Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-zinc-300 font-display mb-2 uppercase tracking-wider">About Me</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                {creator.bio} {creator.storefront_description || "Welcome to my private premium catalog. Subscribe now to unlock high-fidelity posts, unedited project diaries, and VIP-only chat sessions!"}
              </p>
            </div>

            {/* Exclusive Perks Card Bento */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wide font-display flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-500" />
                <span>WHAT IS IN THE VIP CLUB MEMBERSHIP?</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="bg-pink-500/10 border border-pink-500/20 p-1.5 rounded-lg text-pink-400 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-pink-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">100+ Exclusive Streams</h5>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Instant unlock to active & archived model logs</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 fill-purple-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">Priority Private Chat</h5>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Send direct whispers, request private sets</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-1.5 rounded-lg text-blue-400 mt-0.5">
                    <Heart className="w-3.5 h-3.5 fill-blue-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">Supporters Custom Polls</h5>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Vote on tomorrow's outfits and shoot guides</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-lg text-emerald-400 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">Limited PPV Discounts</h5>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Unlock super premium reels at members-only pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Bento Box: conversion list */}
          <div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sticky top-6 space-y-5 shadow-lg">
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold tracking-wider bg-zinc-900/50 border border-zinc-800 text-pink-500 px-2.5 py-1 rounded-full uppercase">
                  MONTHLY ACCESS LICENSE
                </span>
                <div className="flex items-end justify-center gap-1 mt-4">
                  <span className="text-4xl font-black text-white font-display">{formatPrice(subPrice, currency)}</span>
                  <span className="text-xs text-zinc-500 font-mono mb-1">/ Month</span>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <div className="className w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span>Secure credit/debit, UPI on Razorpay</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="className w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span>Permanent PPV license values</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="className w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span>Cancel hassle-free anytime in settings</span>
                </div>
              </div>

              <div className="pt-2">
                {currUser ? (
                  <SubscriptionButton creatorId={creator.id} onSuccess={onSubscribeSuccess} className="w-full py-3" price={subPrice} />
                ) : (
                  <button
                    onClick={onAuthTrigger}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-pink-900/10 border border-pink-500/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Access Pass</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-650" />
                <span>DMCA Protected Sandbox encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Artistic Gray/Crimson Blurred Previews Banner */}
        <div className="mt-14 space-y-4">
          <h3 className="text-base font-semibold text-zinc-300 font-display uppercase tracking-wider">Locked Post Previews</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&blur=35",
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=200&blur=35",
              "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=200&blur=35",
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200&blur=35"
            ].map((src, i) => (
              <div key={i} className="relative aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition">
                <img src={src} alt="Locked Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover select-none" />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <div className="p-2.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-pink-500">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
