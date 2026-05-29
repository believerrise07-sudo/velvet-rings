import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { Loader } from "../ui/Loader";
import { motion, AnimatePresence } from "motion/react";
import { getSelectedCurrency, getPriceInSelectedCurrency, formatPrice } from "../../lib/currency";

interface SubscriptionButtonProps {
  creatorId: string;
  onSuccess: () => void;
  className?: string;
  price?: number;
}

export function SubscriptionButton({ creatorId, onSuccess, className = "", price = 199 }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
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

  const startCheckout = async () => {
    setLoading(true);
    const currCurrency = getSelectedCurrency();
    const currPrice = getPriceInSelectedCurrency(price, currCurrency);

    try {
      // 1. Create order securely on Backend
      const order = await api.createRazorpayOrder({
        type: "subscription",
        amount: currPrice,
        currency: currCurrency.code,
        creator_id: creatorId,
      } as any);

      setOrderDetails(order);

      // Try reading Razorpay SDK
      const razorpayLoaded = await loadRazorpayScript();
      
      if (razorpayLoaded && (window as any).Razorpay && order.key_id !== "rzp_test_VelvetLive2026") {
        // Run Real Razorpay checkout flow
        const options = {
          key: order.key_id,
          amount: Math.round(order.amount * 100), // convert to smallest unit if needed
          currency: order.currency,
          name: "Velvet VIP Network",
          description: `Monthly Access Subscription to ${creatorId}`,
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
          order_id: order.order_id,
          handler: async function (response: any) {
            setLoading(true);
            try {
              // Verify signature securely on Backend
              await api.verifyRazorpayPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                type: "subscription",
                amount: currPrice,
                currency: currCurrency.code,
                creator_id: creatorId,
              } as any);
              onSuccess();
            } catch (err: any) {
              alert("Signature verification failing: " + err.message);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: "Exclusive VIP Fan",
            email: "fan@velvet.vip",
          },
          theme: {
            color: "#ec4899", // theme pink color
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // No SDK or in local sandbox test mode - reveal beautiful interactive simulator modal!
        setShowSimModal(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Order creation failed", err);
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const authorizeSimulatePayment = async () => {
    if (!orderDetails) return;
    setLoading(true);
    setShowSimModal(false);
    const currCurrency = getSelectedCurrency();
    const currPrice = getPriceInSelectedCurrency(price, currCurrency);

    try {
      // Send simulation details to backend to activate subscription inside system
      await api.verifyRazorpayPayment({
        razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(2, 10)}`,
        razorpay_order_id: orderDetails.order_id,
        razorpay_signature: "simulated_secure_signature_hash_2026",
        type: "subscription",
        amount: currPrice,
        currency: currCurrency.code,
        creator_id: creatorId,
      } as any);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startCheckout}
        disabled={loading}
        className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium py-3 px-6 rounded-2xl transition duration-300 shadow-[0_4px_25px_rgba(236,72,153,0.3)] hover:shadow-[0_4px_30px_rgba(236,72,153,0.45)] flex items-center justify-center gap-2 border border-pink-400/20 disabled:opacity-50 text-sm font-display tracking-wide ${className}`}
      >
        {loading ? (
          <Loader size="sm" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-pink-200" />
            <span>Unlock Monthly VIP Feed • {formatPrice(price, currency)}/mo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </motion.button>

      {/* RAZORPAY SANDBOX SIMULATION MODAL */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-zinc-950 border border-pink-500/20 max-w-md w-full rounded-2xl p-6 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.15)]"
            >
              {/* Top Neon Band */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-500/15 p-2.5 rounded-xl border border-pink-500/30">
                  <ShieldCheck className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display tracking-wide">Razorpay Checkout Sandbox</h3>
                  <p className="text-xs text-zinc-400">Secure Integration Gateway Simulator</p>
                </div>
              </div>

              <div className="border border-zinc-900 bg-zinc-900/45 rounded-xl p-4 mb-5 space-y-2 text-sm font-mono text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Merchant:</span>
                  <span className="text-white font-medium">Velvet VIP Platform</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="text-zinc-400 font-medium truncate max-w-[180px]">{orderDetails?.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="text-emerald-400 font-semibold font-sans">{formatPrice(price, currency)} {currency.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Billing:</span>
                  <span className="text-zinc-300">Monthly auto-recurring</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                We are currently running in the **AI Studio Sandbox**. Both native Razorpay scripts and simulated payments route securely through Express token validations to ensure full feature integrity.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSimModal(false)}
                  className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 rounded-xl py-3 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={authorizeSimulatePayment}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white rounded-xl py-3 text-sm font-medium transition shadow-[0_0_15px_rgba(236,72,153,0.3)] border border-pink-400/20"
                >
                  Authorize Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
