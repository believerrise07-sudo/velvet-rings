import { motion } from "motion/react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ size = "md", className = "" }: LoaderProps) {
  const dimensions = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${dimensions[size]} border-pink-500/20 border-t-pink-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto py-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-5 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-zinc-800 rounded w-1/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/6" />
            </div>
          </div>
          <div className="h-5 bg-zinc-800 rounded w-3/4" />
          <div className="h-40 bg-zinc-800 rounded-xl w-full" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-zinc-800 rounded w-1/5" />
            <div className="h-8 bg-zinc-800 rounded w-1/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
