import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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

export default function Badges() {
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
              .map((badge, i) => {
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
                      "p-8 h-full flex flex-col items-center text-center transition-none hover:shadow-lg",
                      isEarned
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-100 opacity-60 grayscale"
                    )}>
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl shrink-0",
                        isEarned
                          ? "bg-blue-50 shadow-inner"
                          : "bg-slate-200"
                      )}>
                        {badge.icon}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground flex-1">{badge.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {badge.triggerValue === 0 ? "Start Here" : `Day ${badge.triggerValue}`}
                        </p>
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
              })}
          </div>
        </div>

        {/* Streak Badges */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Streak Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBadges
              .filter(badge => badge.triggerType === 'streak')
              .map((badge, i) => {
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
                      "p-8 h-full flex flex-col items-center text-center transition-none hover:shadow-lg",
                      isEarned
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-100 opacity-60 grayscale"
                    )}>
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl shrink-0",
                        isEarned
                          ? "bg-amber-50 shadow-inner"
                          : "bg-slate-200"
                      )}>
                        {badge.icon}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground flex-1">{badge.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {badge.triggerValue} day streak
                        </p>
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
              })}
          </div>
        </div>

        {/* Special Badges */}
        {sortedBadges.filter(badge => badge.triggerType !== 'day_completed' && badge.triggerType !== 'streak').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Special Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBadges
                .filter(badge => badge.triggerType !== 'day_completed' && badge.triggerType !== 'streak')
                .map((badge, i) => {
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
                        "p-8 h-full flex flex-col items-center text-center transition-none hover:shadow-lg",
                        isEarned
                          ? "bg-white border-slate-200"
                          : "bg-slate-50 border-slate-100 opacity-60 grayscale"
                      )}>
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl shrink-0",
                          isEarned
                            ? "bg-purple-50 shadow-inner"
                            : "bg-slate-200"
                        )}>
                          {badge.icon}
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground flex-1">{badge.description}</p>
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
                })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
