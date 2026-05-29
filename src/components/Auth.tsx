import React, { useState } from "react";
import { User, Mail, Lock, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { api } from "../lib/api";
import { Profile } from "../types";
import { Loader } from "./ui/Loader";
import { motion } from "motion/react";

interface AuthProps {
  onAuthSuccess: (user: Profile, token: string) => void;
  onClose: () => void;
}

export function Auth({ onAuthSuccess, onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"fan" | "creator">("fan");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        onAuthSuccess(res.user, res.token);
      } else {
        const res = await api.register({
          username,
          email,
          password,
          role,
        });
        onAuthSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please verify your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Dim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-x-0 inset-y-0 bg-black/85 backdrop-blur-md cursor-pointer"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-zinc-950 border border-zinc-850 w-full max-w-md rounded-2xl p-6 sm:p-8 relative z-10 overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.1)]"
      >
        {/* Glow Element */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <span className="text-xs bg-pink-500/10 border border-pink-500/30 text-pink-400 px-3 py-1 rounded-full font-mono font-medium tracking-wider uppercase">
            Velvet VIP Doorway
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-3 tracking-wide">
            {isLogin ? "Welcome Back" : "Initiate VIP Credentials"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isLogin ? "Sign in to access subscriber streams and PPVs" : "Create a portal account to subscribe or publish"}
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300 mb-5 font-mono"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 font-display">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. runway_appreciator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-pink-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 font-display">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-pink-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 font-display">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-pink-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 font-display">Choose Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("fan")}
                  className={`border py-3 rounded-xl text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${
                    role === "fan"
                      ? "border-pink-500 bg-pink-500/10 text-pink-300"
                      : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <span className="font-semibold text-sm">Become a Fan</span>
                  <span className="opacity-70 text-[10px]">Unlock & Premium PPVs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`border py-3 rounded-xl text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${
                    role === "creator"
                      ? "border-pink-500 bg-pink-500/10 text-pink-300"
                      : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <span className="font-semibold text-sm">Creator Account</span>
                  <span className="opacity-70 text-[10px]">Post private media</span>
                </button>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium py-3 rounded-xl text-sm transition shadow-lg mt-6 flex items-center justify-center gap-2 border border-pink-400/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader size="sm" />
            ) : (
              <>
                <span>{isLogin ? "Sign In Securely" : "Complete Registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          {isLogin ? (
            <p>
              New support profile?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-pink-400 hover:text-pink-300 font-medium ml-1 transition"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-pink-400 hover:text-pink-300 font-medium ml-1 transition"
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
