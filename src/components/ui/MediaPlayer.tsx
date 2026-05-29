import React, { useState, useEffect } from "react";
import { Lock, Eye, Play, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { getSelectedCurrency, formatPrice } from "../../lib/currency";

interface MediaPlayerProps {
  mediaUrls: string[];
  isLocked: boolean;
  isAccessible: boolean;
  onUnlockClick?: () => void;
  price?: number;
}

export function MediaPlayer({ mediaUrls, isLocked, isAccessible, onUnlockClick, price = 0 }: MediaPlayerProps) {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const mediaUrl = mediaUrls[currentMediaIdx] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200";
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

  // Check if content is truly locked out
  const showLockOverlay = isLocked && !isAccessible;

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
      {/* Blurred lock overlay vs real high resolution image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={mediaUrl}
          alt="Premium Content Backdrop"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover select-none transition-all duration-700 ${
            showLockOverlay ? "blur-2xl scale-110 opacity-30 brightness-50" : "group-hover:scale-102"
          }`}
        />
        {showLockOverlay && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" />
        )}
      </div>

      {/* Access Gatekeeper UI */}
      {showLockOverlay ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900/60 border border-zinc-800 p-4 sm:p-6 rounded-2xl max-w-sm flex flex-col items-center backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mb-4 animate-pulse">
              <Lock className="w-5 h-5" />
            </div>

            <h4 className="text-base font-semibold text-white tracking-wide font-display">
              {price > 0 ? "Premium Pay-Per-View Asset" : "Exclusive Subscriber Content"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 mb-5 leading-relaxed">
              {price > 0 
                ? "This exclusive post is premium PPV. Unlock permanent access now." 
                : "Subscribe to Elena's monthly feed to unlock this stream and 100+ others."
              }
            </p>

            {onUnlockClick && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlockClick();
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-lg shadow-pink-900/10 flex items-center justify-center gap-2 border border-pink-500/10"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {price > 0 
                    ? `Unlock for ${formatPrice(price, currency)}` 
                    : "Become a VIP Subscriber"
                  }
                </span>
              </motion.button>
            )}
          </motion.div>
        </div>
      ) : (
        /* Unlocked Overlay Details */
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div>
            <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5 w-max">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>UNLOCKED ACCESS</span>
            </span>
          </div>
          {mediaUrls.length > 1 && (
            <div className="flex gap-1">
              {mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIdx(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition ${currentMediaIdx === idx ? "bg-pink-500" : "bg-zinc-600"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
