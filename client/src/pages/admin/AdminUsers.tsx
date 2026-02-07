import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  UserPlus,
  Search,
  CreditCard,
  RefreshCw,
  UserX,
  Activity,
  DollarSign,
  Filter,
  Radio,
  Ban,
  Shield,
  Check,
  X,
  Trash2,
  Award,
  ExternalLink,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { AdminUser, LiveUser, ActivityLogResponse } from "./adminTypes";
import { formatCurrency } from "./adminTypes";

function UserDetailPanel({
  user,
  updateUser,
  unbanUserMutation,
  setBanConfirmation,
  resetUserProgress,
  setDeleteConfirmation,
  allUsers,
}: {
  user: AdminUser;
  updateUser: any;
  unbanUserMutation: any;
  setBanConfirmation: any;
  resetUserProgress: any;
  setDeleteConfirmation: any;
  allUsers: AdminUser[];
}) {
  const queryClient = useQueryClient();
  const [linkSearch, setLinkSearch] = useState("");
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);

  const linkPendingMutation = useMutation({
    mutationFn: async ({ pendingId, userId }: { pendingId: number; userId: string }) => {
      const res = await apiRequest("POST", "/api/admin/link-pending", { pendingId, userId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success(data.message || "Purchase linked successfully");
      setLinkSearch("");
      setShowLinkDropdown(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to link purchase");
    },
  });

  const { data: details, isLoading } = useQuery<any>({
    queryKey: [`/api/admin/users/${user.id}`],
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-200 text-center text-slate-500 py-6">
        Loading user details...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-200 text-center text-slate-500 py-6">
        Failed to load user details
      </div>
    );
  }

  // Pending users - limited info
  if (user.isPending || details.isPending) {
    return (
      <div
        className="mt-4 border-t border-slate-200 pt-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-medium text-amber-600 mb-1">Payment Status</p>
            <p className="font-bold text-amber-800">Paid - No account created</p>
            {details.amountPaid != null && (
              <p className="text-sm text-amber-700 mt-1">
                {formatCurrency(details.amountPaid, details.currency || 'gbp')}
              </p>
            )}
            {details.productType && (
              <p className="text-xs text-amber-600 mt-1">Product: {details.productType}</p>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Magic Links Sent</p>
            <p className="text-lg font-bold text-slate-900">{details.magicLinks?.length || 0}</p>
            {details.magicLinks?.some((ml: any) => ml.clicked) ? (
              <p className="text-xs text-green-600 font-medium">At least one clicked</p>
            ) : (
              <p className="text-xs text-amber-600">None clicked yet</p>
            )}
          </div>
        </div>

        {details.magicLinks && details.magicLinks.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Magic Link History</p>
            <div className="space-y-1">
              {details.magicLinks.map((ml: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-white border border-slate-200 rounded px-3 py-2"
                >
                  <span className="text-slate-600">
                    Sent {formatDistanceToNow(new Date(ml.sentAt), { addSuffix: true })}
                  </span>
                  <span className={ml.clicked ? "text-green-600 font-medium" : "text-slate-400"}>
                    {ml.clicked
                      ? `Clicked${ml.clickedAt ? ` ${formatDistanceToNow(new Date(ml.clickedAt), { addSuffix: true })}` : ""}`
                      : "Not clicked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to Account */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Link className="w-4 h-4" />
            Link to Existing Account
          </p>
          <p className="text-xs text-blue-600 mb-3">
            Search for the user's real account and link this purchase to it.
          </p>
          <div className="relative">
            <Input
              placeholder="Search by name or email..."
              value={linkSearch}
              onChange={(e) => {
                setLinkSearch(e.target.value);
                setShowLinkDropdown(e.target.value.length > 0);
              }}
              onFocus={() => linkSearch.length > 0 && setShowLinkDropdown(true)}
              className="text-sm bg-white"
            />
            {showLinkDropdown && linkSearch.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {allUsers
                  .filter((u) => !u.isPending)
                  .filter((u) => {
                    const q = linkSearch.toLowerCase();
                    return (
                      u.email?.toLowerCase().includes(q) ||
                      u.firstName?.toLowerCase().includes(q) ||
                      u.lastName?.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 8)
                  .map((u) => (
                    <button
                      key={u.id}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-sm border-b border-slate-100 last:border-0"
                      onClick={() => {
                        const pendingId = parseInt(user.id.replace("pending_", ""));
                        if (confirm(`Link this purchase to ${u.firstName || ''} ${u.lastName || ''} (${u.email})? This will grant them access.`)) {
                          linkPendingMutation.mutate({ pendingId, userId: u.id });
                        }
                      }}
                    >
                      <div>
                        <span className="font-medium text-slate-900">
                          {u.firstName || u.lastName
                            ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                            : "No name"}
                        </span>
                        <span className="text-slate-500 ml-2">{u.email}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Day {u.stats.lastCompletedDay}
                      </span>
                    </button>
                  ))}
                {allUsers
                  .filter((u) => !u.isPending)
                  .filter((u) => {
                    const q = linkSearch.toLowerCase();
                    return (
                      u.email?.toLowerCase().includes(q) ||
                      u.firstName?.toLowerCase().includes(q) ||
                      u.lastName?.toLowerCase().includes(q)
                    );
                  }).length === 0 && (
                  <p className="px-3 py-2 text-sm text-slate-500">No matching users found</p>
                )}
              </div>
            )}
          </div>
          {linkPendingMutation.isPending && (
            <p className="text-xs text-blue-600 mt-2">Linking purchase...</p>
          )}
        </div>

        {details.stripeCustomerId && (
          <p className="text-xs text-slate-400">
            Stripe: <span className="font-mono">{details.stripeCustomerId}</span>
          </p>
        )}
      </div>
    );
  }

  // Full user details for registered users
  return (
    <div
      className="mt-4 border-t border-slate-200 pt-4 space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {!user.challengePurchased ? (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => updateUser.mutate({ id: user.id, challengePurchased: true })}
          >
            <Check className="w-3 h-3 mr-1" /> Grant Access
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => updateUser.mutate({ id: user.id, challengePurchased: false })}
          >
            <X className="w-3 h-3 mr-1" /> Revoke Access
          </Button>
        )}

        {!user.isAdmin ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateUser.mutate({ id: user.id, isAdmin: true })}
          >
            <Shield className="w-3 h-3 mr-1" /> Make Admin
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateUser.mutate({ id: user.id, isAdmin: false })}
          >
            <Shield className="w-3 h-3 mr-1" /> Remove Admin
          </Button>
        )}

        {!user.allDaysUnlocked ? (
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={() => updateUser.mutate({ id: user.id, allDaysUnlocked: true })}
          >
            <Check className="w-3 h-3 mr-1" /> Unlock All Days
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => updateUser.mutate({ id: user.id, allDaysUnlocked: false })}
          >
            <X className="w-3 h-3 mr-1" /> Revoke All Days
          </Button>
        )}

        {user.isBanned ? (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => unbanUserMutation.mutate(user.id)}
          >
            Unban
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() =>
              setBanConfirmation({
                isOpen: true,
                userId: user.id,
                userEmail: user.email || "",
                banReason: "",
                confirmText: "",
                step: 1,
              })
            }
          >
            <Ban className="w-3 h-3 mr-1" /> Ban
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={() => resetUserProgress.mutate(user.id)}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Reset Progress
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() =>
            setDeleteConfirmation({
              isOpen: true,
              userId: user.id,
              userEmail: user.email || "",
              confirmText: "",
              step: 1,
            })
          }
        >
          <Trash2 className="w-3 h-3 mr-1" /> Delete
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500">Progress</p>
          <p className="text-lg font-bold text-slate-900">
            Day {user.stats.lastCompletedDay}/21
          </p>
          <p className="text-xs text-slate-500">{user.stats.totalXp} XP</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500">Streak</p>
          <p className="text-lg font-bold text-slate-900">{user.stats.currentStreak} days</p>
          <p className="text-xs text-slate-500">
            {user.stats.lastActivityDate
              ? `Last active ${formatDistanceToNow(new Date(user.stats.lastActivityDate), { addSuffix: true })}`
              : "Never active"}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500">Chat Messages</p>
          <p className="text-lg font-bold text-slate-900">{details.chatMessageCount || 0}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500">AI Usage</p>
          <p className="text-lg font-bold text-slate-900">
            {details.aiUsage?.totalRequests || 0} calls
          </p>
          <p className="text-xs text-slate-500">
            {((details.aiUsage?.totalTokens || 0) / 1000).toFixed(1)}k tokens
          </p>
        </div>
      </div>

      {/* Account & Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-sm font-medium text-slate-700 mb-2">Account Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">ID:</span>
              <span className="text-slate-700 font-mono text-xs">{user.id.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-700">{user.email || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Referral Code:</span>
              <span className="text-slate-700">{user.referralCode || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Signed Up:</span>
              <span className="text-slate-700">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Login:</span>
              <span className="text-slate-700">
                {user.lastLoginAt
                  ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Login Count:</span>
              <span className="text-slate-700">{user.loginCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-sm font-medium text-slate-700 mb-2">Payment Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Challenge:</span>
              <span
                className={
                  user.challengePurchased ? "text-green-600 font-medium" : "text-slate-400"
                }
              >
                {user.challengePurchased ? "Purchased" : "Not purchased"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Coaching:</span>
              <span
                className={
                  user.coachingPurchased ? "text-green-600 font-medium" : "text-slate-400"
                }
              >
                {user.coachingPurchased ? "Purchased" : "Not purchased"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency:</span>
              <span className="text-slate-700">
                {user.purchaseCurrency?.toUpperCase() || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stripe ID:</span>
              <span className="text-slate-700 font-mono text-xs">
                {user.stripeCustomerId || "None"}
              </span>
            </div>
            {details.allDaysUnlocked && (
              <div className="flex justify-between">
                <span className="text-slate-500">All Days Unlocked:</span>
                <span className="text-green-600 font-medium">Yes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Completion Timeline */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Day Completion Timeline</p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 22 }, (_, i) => {
            const dayProgress = details.progress?.find((p: any) => p.day === i);
            const isCompleted = dayProgress?.completed;
            return (
              <div
                key={i}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium border ${
                  isCompleted
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
                title={
                  isCompleted && dayProgress?.completedAt
                    ? `Day ${i}: ${new Date(dayProgress.completedAt).toLocaleDateString("en-GB")}`
                    : `Day ${i}: Not completed`
                }
              >
                {i}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      {details.comments && details.comments.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Comments ({details.comments.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {details.comments.slice(0, 10).map((c: any) => (
              <div
                key={c.id}
                className="text-sm bg-white border border-slate-200 rounded px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Day {c.day}</span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {details.questions && details.questions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Questions ({details.questions.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {details.questions.slice(0, 10).map((q: any) => (
              <div
                key={q.id}
                className="text-sm bg-white border border-slate-200 rounded px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Day {q.day}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        q.status === "answered"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {q.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 line-clamp-2">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {details.badgesEarned && details.badgesEarned.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Badges Earned ({details.badgesEarned.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {details.badgesEarned.map((b: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700"
              >
                <Award className="w-3 h-3" /> {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Purchases */}
      {details.coachingPurchases && details.coachingPurchases.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Coaching Purchases</p>
          <div className="space-y-2">
            {details.coachingPurchases.map((cp: any, i: number) => (
              <div
                key={i}
                className="text-sm bg-white border border-slate-200 rounded px-3 py-2 flex justify-between"
              >
                <span className="text-slate-700">
                  {cp.coachType === "matt" ? "Sessions with Matt" : "Expert Coaching"} -{" "}
                  {cp.packageType === "single" ? "1 session" : "4 sessions"}
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(cp.amountPaid, cp.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Showcase Entries */}
      {details.showcaseEntries && details.showcaseEntries.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Showcase Entries</p>
          {details.showcaseEntries.map((s: any, i: number) => (
            <div
              key={i}
              className="text-sm bg-white border border-slate-200 rounded px-3 py-2"
            >
              <p className="font-medium text-slate-900">{s.appName}</p>
              <p className="text-slate-500 line-clamp-1">{s.description}</p>
              {s.liveUrl && (
                <a
                  href={s.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> {s.liveUrl}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Testimonial */}
      {details.testimonial && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Testimonial</p>
          <div className="text-sm bg-white border border-slate-200 rounded px-3 py-2">
            {details.testimonial.testimonial && (
              <p className="text-slate-600 italic">"{details.testimonial.testimonial}"</p>
            )}
            {details.testimonial.videoUrl && (
              <a
                href={details.testimonial.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline inline-flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Video testimonial
              </a>
            )}
          </div>
        </div>
      )}

      {/* Magic Links */}
      {details.magicLinks && details.magicLinks.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Magic Link History</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {details.magicLinks.map((ml: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm bg-white border border-slate-200 rounded px-3 py-2"
              >
                <span className="text-slate-600">
                  Sent {formatDistanceToNow(new Date(ml.sentAt), { addSuffix: true })}
                </span>
                <span className={ml.clicked ? "text-green-600 font-medium" : "text-slate-400"}>
                  {ml.clicked ? "Clicked" : "Not clicked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      {user.adminNotes && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Admin Notes</p>
          <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded p-2">
            {user.adminNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const queryClient = useQueryClient();

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "paid" | "unpaid" | "pending" | "active" | "inactive" | "stuck" | "completed"
  >("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [newUserHasPurchased, setNewUserHasPurchased] = useState(false);

  // Live users
  const [showLiveUsers, setShowLiveUsers] = useState(false);

  // Activity log
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogCategory, setActivityLogCategory] = useState<string>("");

  // Confirmation modals
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    userId: "",
    userEmail: "",
    confirmText: "",
    step: 1,
  });

  const [banConfirmation, setBanConfirmation] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    banReason: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    userId: "",
    userEmail: "",
    banReason: "",
    confirmText: "",
    step: 1,
  });

  // Data queries
  const { data: adminUsers = [], refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 30_000,
  });

  const { data: liveUsersData, refetch: refetchLiveUsers } = useQuery<{
    count: number;
    users: LiveUser[];
  }>({
    queryKey: ["/api/admin/live-users"],
    enabled: showLiveUsers,
    refetchInterval: showLiveUsers ? 10000 : false,
  });

  const { data: activityLogData, isLoading: activityLogLoading } = useQuery<ActivityLogResponse>({
    queryKey: [
      activityLogCategory
        ? `/api/admin/activity-logs?category=${activityLogCategory}`
        : "/api/admin/activity-logs",
    ],
  });

  // User segments
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const userSegments = {
    all: adminUsers.length,
    paid: adminUsers.filter((u) => u.challengePurchased && !u.isPending).length,
    unpaid: adminUsers.filter((u) => !u.challengePurchased && !u.isPending).length,
    pending: adminUsers.filter((u) => u.isPending).length,
    active: adminUsers.filter(
      (u) => !u.isPending && u.stats.lastActivityDate && new Date(u.stats.lastActivityDate) > sevenDaysAgo
    ).length,
    inactive: adminUsers.filter(
      (u) => !u.isPending && (!u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo)
    ).length,
    stuck: adminUsers.filter(
      (u) =>
        !u.isPending &&
        u.stats.lastCompletedDay > 0 &&
        u.stats.lastCompletedDay < 21 &&
        (!u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo)
    ).length,
    completed: adminUsers.filter((u) => u.stats.lastCompletedDay >= 21).length,
  };

  // Filtered users
  const filteredUsers = adminUsers.filter((user) => {
    if (userFilter !== "all") {
      const isActive =
        user.stats.lastActivityDate && new Date(user.stats.lastActivityDate) > sevenDaysAgo;
      const isStuck =
        user.stats.lastCompletedDay > 0 && user.stats.lastCompletedDay < 21 && !isActive;

      switch (userFilter) {
        case "paid":
          if (!user.challengePurchased || user.isPending) return false;
          break;
        case "unpaid":
          if (user.challengePurchased || user.isPending) return false;
          break;
        case "pending":
          if (!user.isPending) return false;
          break;
        case "active":
          if (!isActive) return false;
          break;
        case "inactive":
          if (isActive) return false;
          break;
        case "stuck":
          if (!isStuck) return false;
          break;
        case "completed":
          if (user.stats.lastCompletedDay < 21) return false;
          break;
      }
    }

    if (!userSearchQuery) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  // Bulk selection helpers
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllFiltered = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const exportUsersCSV = () => {
    const usersToExport =
      selectedUsers.size > 0
        ? filteredUsers.filter((u) => selectedUsers.has(u.id))
        : filteredUsers;

    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Paid",
      "Day",
      "XP",
      "Signed Up",
      "Last Active",
      "Last Login",
      "Login Count",
    ];
    const rows = usersToExport.map((u) => [
      u.email || "",
      u.firstName || "",
      u.lastName || "",
      u.challengePurchased ? "Yes" : "No",
      u.stats.lastCompletedDay.toString(),
      u.stats.totalXp.toString(),
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
      u.stats.lastActivityDate ? new Date(u.stats.lastActivityDate).toLocaleDateString() : "",
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "",
      (u.loginCount || 0).toString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${userFilter}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${usersToExport.length} users to CSV`);
  };

  // Mutations
  const createUser = useMutation({
    mutationFn: async (data: {
      email: string;
      firstName?: string;
      lastName?: string;
      isAdmin?: boolean;
      challengePurchased?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddingUser(false);
      setNewUserEmail("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserIsAdmin(false);
      setNewUserHasPurchased(false);
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const resetUserProgress = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/reset-progress`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("User progress reset successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset user progress");
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to ban user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User banned successfully");
      refetchUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}/unban`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to unban user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User unbanned successfully");
      refetchUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const createFromPending = useMutation({
    mutationFn: async (pendingId: number) => {
      const res = await apiRequest("POST", "/api/admin/create-from-pending", { pendingId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
      toast.success(data.message || "Account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  return (
    <div className="space-y-8">
      {/* User List */}
      <Card className="border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-slate-900">All Users</h2>
              <span className="px-2 py-0.5 bg-white text-slate-600 text-sm font-medium rounded-full border border-slate-200">
                {filteredUsers.length} shown
              </span>
            </div>
            <Button onClick={() => setIsAddingUser(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by email, name, or ID..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Filter Tabs */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Filter by:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Users", desc: "Everyone" },
                { key: "paid", label: "Paid", desc: "Purchased challenge" },
                { key: "pending", label: "Pending", desc: "Paid but no account yet" },
                { key: "unpaid", label: "Unpaid", desc: "No purchase yet" },
                { key: "active", label: "Active", desc: "Active in 7 days" },
                { key: "inactive", label: "Inactive", desc: "No activity 7+ days" },
                { key: "stuck", label: "Stuck", desc: "Started but stalled" },
                { key: "completed", label: "Completed", desc: "Finished all 21 days" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setUserFilter(filter.key as typeof userFilter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    userFilter === filter.key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  title={filter.desc}
                >
                  {filter.label}
                  <span
                    className={`ml-2 ${
                      userFilter === filter.key ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {userSegments[filter.key as keyof typeof userSegments]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-white">
          <button onClick={selectAllFiltered} className="text-sm text-primary hover:underline">
            {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
              ? "Deselect all"
              : `Select all ${filteredUsers.length}`}
          </button>
          {selectedUsers.size > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">{selectedUsers.size} selected</span>
              <span className="text-slate-300">|</span>
              <button onClick={exportUsersCSV} className="text-sm text-primary hover:underline">
                Export CSV
              </button>
              <button
                onClick={() => {
                  const selectedUsersList = filteredUsers.filter((u) => selectedUsers.has(u.id));
                  selectedUsersList.forEach((u) => {
                    updateUser.mutate({ id: u.id, challengePurchased: true });
                  });
                  toast.success(`Granted access to ${selectedUsers.size} users`);
                  setSelectedUsers(new Set());
                }}
                className="text-sm text-primary hover:underline"
              >
                Grant Access
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="text-sm text-slate-400 hover:underline ml-auto"
              >
                Clear
              </button>
            </>
          )}
          {selectedUsers.size === 0 && (
            <button
              onClick={exportUsersCSV}
              className="text-sm text-slate-500 hover:text-primary ml-auto"
            >
              Export all to CSV
            </button>
          )}
        </div>

        {/* Add User Form */}
        {isAddingUser && (
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Add New User</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  value={newUserFirstName}
                  onChange={(e) => setNewUserFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUserIsAdmin}
                    onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Admin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUserHasPurchased}
                    onChange={(e) => setNewUserHasPurchased(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Has Purchased</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  if (!newUserEmail) {
                    toast.error("Email is required");
                    return;
                  }
                  createUser.mutate({
                    email: newUserEmail,
                    firstName: newUserFirstName || undefined,
                    lastName: newUserLastName || undefined,
                    isAdmin: newUserIsAdmin,
                    challengePurchased: newUserHasPurchased,
                  });
                }}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {userSearchQuery ? "No users found matching your search" : "No users yet"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedUsers.has(user.id)
                    ? "bg-primary/5"
                    : selectedUser?.id === user.id
                    ? "bg-slate-50"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(user.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : "No name"}
                        </p>
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right hidden md:block">
                      <p className="text-slate-500 text-xs">Last login</p>
                      <p className="text-slate-700">
                        {user.lastLoginAt
                          ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                          : "Never"}
                      </p>
                      {user.loginCount > 0 && (
                        <p className="text-slate-400 text-xs">{user.loginCount} logins</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.allDaysUnlocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            All Days
                          </span>
                        )}
                        {user.isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                            <CreditCard className="w-3 h-3" />
                            Paid - No account
                          </span>
                        ) : user.challengePurchased ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CreditCard className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">No purchase</span>
                        )}
                      </div>
                      {user.isPending ? (
                        <div className="flex items-center justify-end gap-2 mt-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const pendingId = parseInt(user.id.replace("pending_", ""));
                              if (confirm(`Create an account for ${user.email}? They'll use "Forgot Password" to set a password.`)) {
                                createFromPending.mutate(pendingId);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 shadow-sm transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Create Account
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(selectedUser?.id === user.id ? null : user);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 shadow-sm transition-colors"
                          >
                            <Link className="w-3.5 h-3.5" />
                            Link
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs mt-1">
                          Day {user.completedDays > 0 ? user.stats.lastCompletedDay : 0}/21 · {user.stats.totalXp} XP
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {!user.isPending && (
                  <>
                    <div className="border-t border-slate-100 mx-4 mt-2" />
                    <div className="px-4 pb-3 pt-2">
                      {(() => {
                        const phases = [
                          { label: 'Plan', days: [0,1,2,3,4,5], color: 'bg-blue-500' },
                          { label: 'Prepare', days: [6,7,8,9], color: 'bg-cyan-500' },
                          { label: 'Build', days: [10,11,12,13,14,15,16,17,18], color: 'bg-violet-500' },
                          { label: 'Launch', days: [19,20,21], color: 'bg-green-500' },
                        ];
                        const lastDay = user.completedDays > 0 ? user.stats.lastCompletedDay : -1;
                        return (
                          <div className="flex gap-2">
                            {phases.map((phase) => (
                              <div key={phase.label} className="min-w-0" style={{ flex: phase.days.length }}>
                                <p className="text-[10px] text-slate-400 mb-1 truncate">{phase.label}</p>
                                <div className="flex gap-px">
                                  {phase.days.map((day) => (
                                    <div
                                      key={day}
                                      className={`flex-1 h-2 rounded-sm ${day <= lastDay ? phase.color : 'bg-slate-200'}`}
                                      title={`Day ${day}${day <= lastDay ? ' ✓' : ''}`}
                                    />
                                  ))}
                                </div>
                                <div className="flex justify-between mt-0.5">
                                  <span className="text-[9px] text-slate-300">{phase.days[0]}</span>
                                  {phase.days.length > 2 && (
                                    <span className="text-[9px] text-slate-300">{phase.days[phase.days.length - 1]}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}

                {/* Expanded Details */}
                {selectedUser?.id === user.id && (
                  <UserDetailPanel user={user} updateUser={updateUser} unbanUserMutation={unbanUserMutation} setBanConfirmation={setBanConfirmation} resetUserProgress={resetUserProgress} setDeleteConfirmation={setDeleteConfirmation} allUsers={adminUsers} />
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Live Users */}
      <div className="space-y-4">
        <button
          onClick={() => setShowLiveUsers(!showLiveUsers)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div className="relative">
            <Radio className="w-6 h-6 text-primary" />
            {liveUsersData && liveUsersData.count > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">Live Users</h2>
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              liveUsersData && liveUsersData.count > 0
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {liveUsersData?.count || 0} online
          </span>
        </button>

        {showLiveUsers && (
          <Card className="p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Users active in the last 3 minutes · Updates every 10 seconds
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLiveUsers()}
                className="gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            </div>

            {!liveUsersData || liveUsersData.count === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No users currently online</p>
                <p className="text-sm text-slate-400 mt-1">
                  Users will appear here when they're active on the site
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveUsersData.users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-500">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.email || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded">
                        {user.currentPage}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Activity Log */}
      <div className="space-y-4">
        <button
          onClick={() => setShowActivityLog(!showActivityLog)}
          className="flex items-center gap-3 w-full text-left"
        >
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
          {activityLogData?.stats && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {activityLogData.stats.todayLogs} today
            </span>
          )}
        </button>

        {showActivityLog && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex gap-2 flex-wrap">
                {["", "user", "payment", "content", "system"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityLogCategory(cat)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                      activityLogCategory === cat
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat || "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            {activityLogData?.stats && (
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Total Activities</p>
                  <p className="text-xl font-bold text-slate-900">
                    {activityLogData.stats.totalLogs}
                  </p>
                </Card>
                <Card className="p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Today</p>
                  <p className="text-xl font-bold text-slate-900">
                    {activityLogData.stats.todayLogs}
                  </p>
                </Card>
                <Card className="p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">By Category</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {Object.entries(activityLogData.stats.categoryCounts).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {cat}: {count}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Activity Log List */}
            <Card className="border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {activityLogLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading activity log...</div>
                ) : !activityLogData?.logs.length ? (
                  <div className="p-8 text-center text-slate-500">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  activityLogData.logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            log.category === "payment" ? "bg-green-100" :
                            log.category === "user" ? "bg-blue-100" :
                            log.category === "content" ? "bg-purple-100" :
                            "bg-slate-100"
                          }`}>
                            {log.category === "payment" ? (
                              <DollarSign className="w-4 h-4 text-green-600" />
                            ) : log.category === "user" ? (
                              <Users className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Activity className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {log.action
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-slate-500">
                              {log.user ? (
                                <>
                                  by{" "}
                                  <span className="font-medium">
                                    {log.user.firstName || log.user.email || "Admin"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">System</span>
                              )}
                              {log.targetUser && (
                                <>
                                  {" "}
                                  →{" "}
                                  <span className="font-medium">
                                    {log.targetUser.firstName || log.targetUser.email}
                                  </span>
                                </>
                              )}
                            </p>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="mt-1 text-xs text-slate-400 bg-slate-50 rounded px-2 py-1 inline-block">
                                {JSON.stringify(log.details).slice(0, 100)}
                                {JSON.stringify(log.details).length > 100 && "..."}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            log.category === "payment" ? "bg-green-100 text-green-700" :
                            log.category === "user" ? "bg-blue-100 text-blue-700" :
                            log.category === "content" ? "bg-purple-100 text-purple-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {log.category}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {log.createdAt
                              ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white overflow-hidden">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Delete User</h2>
              <p className="text-slate-600 mt-2">
                You are about to permanently delete{" "}
                <strong>{deleteConfirmation.userEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This action cannot be undone. All user data will be lost.
              </p>
            </div>

            {deleteConfirmation.step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Click the button below to proceed to final confirmation.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setDeleteConfirmation((prev) => ({ ...prev, isOpen: false }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      setDeleteConfirmation((prev) => ({ ...prev, step: 2 }))
                    }
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Type{" "}
                    <span className="font-mono bg-red-100 text-red-700 px-1 rounded">DELETE</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={deleteConfirmation.confirmText}
                    onChange={(e) =>
                      setDeleteConfirmation((prev) => ({
                        ...prev,
                        confirmText: e.target.value,
                      }))
                    }
                    placeholder="Type DELETE here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setDeleteConfirmation((prev) => ({
                        ...prev,
                        isOpen: false,
                        step: 1,
                        confirmText: "",
                      }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={
                      deleteConfirmation.confirmText !== "DELETE" || deleteUser.isPending
                    }
                    onClick={() => {
                      deleteUser.mutate(deleteConfirmation.userId);
                      setDeleteConfirmation((prev) => ({
                        ...prev,
                        isOpen: false,
                        step: 1,
                        confirmText: "",
                      }));
                    }}
                  >
                    {deleteUser.isPending ? "Deleting..." : "Delete User"}
                  </Button>
                </div>
              </div>
            )}
            </div>
          </Card>
        </div>
      )}

      {/* Ban User Confirmation Modal */}
      {banConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white overflow-hidden">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ban User</h2>
              <p className="text-slate-600 mt-2">
                You are about to ban <strong>{banConfirmation.userEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This user will no longer be able to access their account.
              </p>
            </div>

            {banConfirmation.step === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Ban reason (optional)
                  </Label>
                  <Input
                    value={banConfirmation.banReason}
                    onChange={(e) =>
                      setBanConfirmation((prev) => ({ ...prev, banReason: e.target.value }))
                    }
                    placeholder="Enter reason for banning"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setBanConfirmation((prev) => ({ ...prev, isOpen: false }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      setBanConfirmation((prev) => ({ ...prev, step: 2 }))
                    }
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Type{" "}
                    <span className="font-mono bg-red-100 text-red-700 px-1 rounded">BAN</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={banConfirmation.confirmText}
                    onChange={(e) =>
                      setBanConfirmation((prev) => ({
                        ...prev,
                        confirmText: e.target.value,
                      }))
                    }
                    placeholder="Type BAN here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setBanConfirmation((prev) => ({
                        ...prev,
                        isOpen: false,
                        step: 1,
                        confirmText: "",
                        banReason: "",
                      }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={
                      banConfirmation.confirmText !== "BAN" || banUserMutation.isPending
                    }
                    onClick={() => {
                      banUserMutation.mutate({
                        id: banConfirmation.userId,
                        reason: banConfirmation.banReason || "No reason provided",
                      });
                      setBanConfirmation((prev) => ({
                        ...prev,
                        isOpen: false,
                        step: 1,
                        confirmText: "",
                        banReason: "",
                      }));
                    }}
                  >
                    {banUserMutation.isPending ? "Banning..." : "Ban User"}
                  </Button>
                </div>
              </div>
            )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
