import { useState } from "react";
import { Lock, Unlock, Calendar, Trash2, ArrowUpRight, Sparkles } from "lucide-react";
import { Post, Profile } from "../types";
import { MediaPlayer } from "./ui/MediaPlayer";
import { PPVUnlockButton } from "./payment/PPVUnlockButton";
import { SubscriptionButton } from "./payment/SubscriptionButton";
import { motion, AnimatePresence } from "motion/react";

interface FeedProps {
  posts: (Post & { is_accessible: boolean })[];
  isSubscribed: boolean;
  currentUser: Profile | null;
  onRefresh: () => void;
  onDeletePost: (id: string) => Promise<void>;
  onAuthTrigger: () => void;
  creatorProfile: Profile;
}

export function Feed({
  posts,
  isSubscribed,
  currentUser,
  onRefresh,
  onDeletePost,
  onAuthTrigger,
  creatorProfile,
}: FeedProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event/post forever?")) return;
    setDeletingId(id);
    try {
      await onDeletePost(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const isCreator = currentUser?.role === "creator";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Feed Filter Stats Header Banner */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white font-display tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <span>VIP Post Feed</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            {posts.length} premium broadcasts staged
          </p>
        </div>

        {!isCreator && !isSubscribed && (
          <div className="hidden sm:block">
            <SubscriptionButton creatorId={creatorProfile.id} onSuccess={onRefresh} className="py-2.5 px-4 text-xs font-semibold" price={creatorProfile.subscription_price || 199} />
          </div>
        )}
      </div>

      <div className="space-y-8">
        <AnimatePresence>
          {posts.map((post) => {
            const isPPV = post.price > 0;
            const canManage = isCreator && currentUser?.id === post.creator_id;

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:border-zinc-700 transition duration-300"
              >
                {/* Creator Meta Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={creatorProfile.avatar_url}
                      alt="Profile Avatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white leading-none">
                          {creatorProfile.storefront_title || creatorProfile.username}
                        </span>
                        <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-md font-mono font-medium">
                          Creator
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">@{creatorProfile.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    {canManage && (
                      <button
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id)}
                        className="text-zinc-650 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg border border-transparent hover:border-rose-500/10 transition"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Secure Active Image Stage */}
                <div className="p-1 sm:p-2 bg-zinc-950/60">
                  <MediaPlayer
                    mediaUrls={post.media_urls}
                    isLocked={post.is_locked}
                    isAccessible={post.is_accessible}
                    price={post.price}
                    onUnlockClick={() => {
                      if (!currentUser) {
                        onAuthTrigger();
                      }
                    }}
                  />
                </div>

                {/* Post Info Body */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-white font-display tracking-wide leading-snug">
                      {post.title}
                    </h3>

                    {post.is_locked && (
                      <span className="shrink-0 flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 rounded-full font-mono text-[10px] uppercase font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}

                    {!post.is_locked && (
                      <span className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 rounded-full font-mono text-[10px] uppercase font-semibold">
                        <Unlock className="w-3 h-3" />
                        <span>Public</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed break-words font-sans">
                    {post.description}
                  </p>

                  {/* Context Sensitive Unlock Gateways */}
                  {!post.is_accessible && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">How to unlock this content?</h4>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {isPPV
                            ? "This premium PPV operates outside the monthly subscription package."
                            : "Subscribed VIP members receive unlimited feed views."
                          }
                        </p>
                      </div>

                      <div className="shrink-0">
                        {!currentUser ? (
                          <button
                            onClick={onAuthTrigger}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 shadow-lg shadow-pink-900/10 border border-pink-500/10"
                          >
                            <span>Sign In to Unlock</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isPPV ? (
                          <PPVUnlockButton postId={post.id} price={post.price} onSuccess={onRefresh} />
                        ) : (
                          <SubscriptionButton creatorId={post.creator_id || creatorProfile.id} onSuccess={onRefresh} className="py-2 px-4 text-xs font-semibold rounded-xl" price={creatorProfile.subscription_price || 199} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="text-center py-16 border border-zinc-800 bg-zinc-900/10 rounded-2xl p-8">
            <Lock className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-300 font-display">No staged logs published</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Please change logins to Creator mode to seed standard media journals dynamically!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
