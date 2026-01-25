import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Share2, Copy, Check, X as XIcon } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  triggerType: string;
  triggerValue: number | null;
}

interface UserBadge {
  id: number;
  badgeId: number;
  earnedAt: string;
}

// Convert badge name to URL slug
function badgeToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default function Badges() {
  const [shareModalBadge, setShareModalBadge] = useState<Badge | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch all available badges
  const { data: allBadges, isLoading: loadingBadges } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  // Fetch user's earned badges
  const { data: userBadges, isLoading: loadingUserBadges } = useQuery<UserBadge[]>({
    queryKey: ["/api/badges/user"],
  });

  const isLoading = loadingBadges || loadingUserBadges;

  // Create a set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badgeId) || []);

  // Sort badges: phase badges first (by triggerValue), then streak badges
  const sortedBadges = [...(allBadges || [])].sort((a, b) => {
    if (a.triggerType === 'day_completed' && b.triggerType === 'streak') return -1;
    if (a.triggerType === 'streak' && b.triggerType === 'day_completed') return 1;
    return (a.triggerValue || 0) - (b.triggerValue || 0);
  });

  const getShareUrl = (badge: Badge) => {
    const slug = badgeToSlug(badge.name);
    return `${window.location.origin}/api/share/badge/${slug}`;
  };

  const copyToClipboard = (badge: Badge) => {
    navigator.clipboard.writeText(getShareUrl(badge));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = (badge: Badge) => {
    const text = `I just earned the "${badge.name}" badge in the 21 Day AI SaaS Challenge! ${badge.description}`;
    const url = getShareUrl(badge);
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = (badge: Badge) => {
    const url = getShareUrl(badge);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = (badge: Badge) => {
    const url = getShareUrl(badge);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const BadgeCard = ({ badge, i, bgColor }: { badge: Badge; i: number; bgColor: string }) => {
    const isEarned = earnedBadgeIds.has(badge.id);

    return (
      <motion.div
        key={badge.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        className="h-full"
      >
        <Card className={cn(
          "p-8 h-full flex flex-col items-center text-center transition-none hover:shadow-lg relative group",
          isEarned
            ? "bg-white border-slate-200"
            : "bg-slate-50 border-slate-100 opacity-60 grayscale"
        )}>
          {/* Share button for earned badges */}
          {isEarned && (
            <button
              onClick={() => setShareModalBadge(badge)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
              title="Share this badge"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
            </button>
          )}

          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl shrink-0",
            isEarned ? bgColor : "bg-slate-200"
          )}>
            {badge.icon}
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
            <p className="text-sm text-muted-foreground flex-1">{badge.description}</p>
            {badge.triggerType === 'day_completed' && (
              <p className="text-xs text-slate-400 mt-2">
                {badge.triggerValue === 0 ? "Start Here" : `Day ${badge.triggerValue}`}
              </p>
            )}
            {badge.triggerType === 'streak' && (
              <p className="text-xs text-slate-400 mt-2">
                {badge.triggerValue} day streak
              </p>
            )}
          </div>

          <div className={cn(
            "text-xs font-medium uppercase tracking-widest mt-4",
            isEarned ? "text-green-600" : "text-slate-400"
          )}>
            {isEarned ? "Earned" : "Locked"}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Badges</h1>
          <p className="text-muted-foreground mt-2">
            Collect all {allBadges?.length || 9} badges to complete the challenge.
          </p>
        </div>

        {/* Phase Completion Badges */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Phase Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBadges
              .filter(badge => badge.triggerType === 'day_completed')
              .map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} i={i} bgColor="bg-blue-50 shadow-inner" />
              ))}
          </div>
        </div>

        {/* Streak Badges */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Streak Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBadges
              .filter(badge => badge.triggerType === 'streak')
              .map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} i={i} bgColor="bg-amber-50 shadow-inner" />
              ))}
          </div>
        </div>

        {/* Special Badges */}
        {sortedBadges.filter(badge => badge.triggerType !== 'day_completed' && badge.triggerType !== 'streak').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Special Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBadges
                .filter(badge => badge.triggerType !== 'day_completed' && badge.triggerType !== 'streak')
                .map((badge, i) => (
                  <BadgeCard key={badge.id} badge={badge} i={i} bgColor="bg-purple-50 shadow-inner" />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShareModalBadge(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Share Your Badge</h3>
              <button
                onClick={() => setShareModalBadge(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Badge Preview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                {shareModalBadge.icon}
              </div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Badge Earned</p>
              <h4 className="text-white text-xl font-bold mb-1">{shareModalBadge.name}</h4>
              <p className="text-slate-400 text-sm">{shareModalBadge.description}</p>
              <p className="text-slate-500 text-xs mt-3">21 Day AI SaaS Challenge by Matt Webley</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <Button
                onClick={() => copyToClipboard(shareModalBadge)}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                {copied ? "Link Copied!" : "Copy Link"}
              </Button>

              <Button
                onClick={() => shareToX(shareModalBadge)}
                className="w-full justify-start gap-3 h-12 bg-black hover:bg-slate-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </Button>

              <Button
                onClick={() => shareToLinkedIn(shareModalBadge)}
                className="w-full justify-start gap-3 h-12 bg-[#0A66C2] hover:bg-[#004182]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </Button>

              <Button
                onClick={() => shareToFacebook(shareModalBadge)}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
