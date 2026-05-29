import React, { useState, useEffect } from "react";
import { User, Wallet, Sparkles, BookOpen, Clock, Heart, CheckCircle, ShieldAlert } from "lucide-react";
import { api } from "../lib/api";
import { Profile as ProfileType, Transaction, Subscription } from "../types";
import { Loader } from "./ui/Loader";
import { motion } from "motion/react";

interface ProfileProps {
  currentUser: ProfileType;
  onLogout: () => void;
}

export function Profile({ currentUser, onLogout }: ProfileProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit fields
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || "Dedicated Premium Supporter.");
  const [updating, setUpdating] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const fetchProfileDetails = async () => {
    try {
      const data = await api.getProfileTransactions();
      setTransactions(data.transactions);
      setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setAlertMsg("");
    try {
      // In a real database we update the Supabase user profile table
      // In memory here we simply simulate save
      setTimeout(() => {
        setAlertMsg("Profile settings modernized!");
        setUpdating(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header section with logout */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-wide">
            Support Headquarters
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Manage your credentials and view ledger access rights
          </p>
        </div>

        <button
          onClick={onLogout}
          className="border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900 text-rose-400 hover:text-rose-300 rounded-xl px-4 py-2 text-xs font-semibold font-mono tracking-wide transition"
        >
          LOGOUT SESSION
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Profile Settings card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative">
            <h3 className="text-base font-bold text-white font-display tracking-wide mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-500" />
              <span>Identity Profile Settings</span>
            </h3>

            {alertMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 p-3.5 rounded-xl mb-4 flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{alertMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 py-2">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border border-pink-500/30 object-cover shadow-lg"
                />
                <div>
                  <span className="text-xs bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2 py-0.5 rounded uppercase font-mono tracking-wide font-medium">
                    {currentUser.role}
                  </span>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Staged Account</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 font-display">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 focus:border-pink-500 rounded-xl py-2.5 px-4.5 text-xs text-white placeholder-zinc-650 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 font-display">Biography</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 focus:border-pink-500 rounded-xl py-2.5 px-4.5 text-xs text-white placeholder-zinc-650 outline-none transition resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={updating}
                className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold py-2.5 rounded-xl text-xs transition"
              >
                {updating ? <Loader size="sm" /> : "Save Modernized View"}
              </motion.button>
            </form>
          </div>
        </div>

        {/* ledger rights, PPV tickets, transactions */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Active VIP Subscriptions */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 shadow-xl relative">
            <h3 className="text-base font-bold text-white font-display tracking-wide mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span>Your Subscribed Passes</span>
            </h3>

            {loading ? (
              <Loader size="sm" className="py-6" />
            ) : subscriptions.length > 0 ? (
              <div className="space-y-3.5">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-zinc-800 bg-zinc-950/45 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-display">Elena Rose VIP Pass</span>
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 rounded font-mono font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">Subscription Record: {sub.razorpay_subscription_id}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="block text-[10px] text-zinc-550 font-semibold uppercase font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>NEXT RENEWAL DATE</span>
                      </span>
                      <span className="text-xs font-bold text-zinc-300 font-mono">
                        {new Date(sub.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-xs">
                You do not possess any active subscription licenses. Join via the Feed or Landing page to unlock posts!
              </div>
            )}
          </div>

          {/* Transaction Ledgers */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 shadow-xl relative">
            <h3 className="text-base font-bold text-white font-display tracking-wide mb-5 flex items-center gap-1.5">
              <Wallet className="w-4.5 h-4.5 text-pink-500" />
              <span>Verification Transaction Ledger</span>
            </h3>

            {loading ? (
              <Loader size="sm" className="py-6" />
            ) : transactions.length > 0 ? (
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-zinc-800/65 bg-zinc-950/25 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <span className="capitalize">{tx.type} Ticket</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-mono">
                          {tx.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-550 font-mono block mt-0.5 max-w-[150px] truncate">
                        ID: {tx.razorpay_payment_id || "Unresolved"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white font-mono">
                        {tx.currency === "USD" ? "$" :
                         tx.currency === "EUR" ? "€" :
                         tx.currency === "GBP" ? "£" :
                         tx.currency === "AUD" ? "A$" :
                         tx.currency === "CAD" ? "C$" :
                         tx.currency === "JPY" ? "¥" :
                         tx.currency === "AED" ? "Dhs" :
                         tx.currency === "SGD" ? "S$" : "₹"}
                        {tx.amount}
                      </span>
                      <span className="text-[10px] text-zinc-550 block mt-0.5 font-mono">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-550 text-xs">
                No ledgers or single-purchases logged under this support profile.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
