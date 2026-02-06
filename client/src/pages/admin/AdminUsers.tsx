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
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { AdminUser, LiveUser, ActivityLogResponse } from "./adminTypes";

export default function AdminUsers() {
  const queryClient = useQueryClient();

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "paid" | "unpaid" | "active" | "inactive" | "stuck" | "completed"
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
    paid: adminUsers.filter((u) => u.challengePurchased).length,
    unpaid: adminUsers.filter((u) => !u.challengePurchased).length,
    active: adminUsers.filter(
      (u) => u.stats.lastActivityDate && new Date(u.stats.lastActivityDate) > sevenDaysAgo
    ).length,
    inactive: adminUsers.filter(
      (u) => !u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo
    ).length,
    stuck: adminUsers.filter(
      (u) =>
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
          if (!user.challengePurchased) return false;
          break;
        case "unpaid":
          if (user.challengePurchased) return false;
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
                      <p className="text-slate-500 text-xs">Signed up</p>
                      <p className="text-slate-700">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {user.challengePurchased ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CreditCard className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">No purchase</span>
                        )}
                      </div>
                      <p className="text-slate-500">
                        Day {user.stats.lastCompletedDay}/21 · {user.stats.totalXp} XP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedUser?.id === user.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">User ID</p>
                        <p className="font-mono text-xs break-all">{user.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Stripe ID</p>
                        <p className="font-mono text-xs break-all">
                          {user.stripeCustomerId || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Currency</p>
                        <p>{user.purchaseCurrency?.toUpperCase() || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Active</p>
                        <p>
                          {user.stats.lastActivityDate
                            ? formatDistanceToNow(new Date(user.stats.lastActivityDate), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateUser.mutate({
                            id: user.id,
                            challengePurchased: !user.challengePurchased,
                          });
                        }}
                      >
                        {user.challengePurchased ? "Revoke Access" : "Grant Access"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateUser.mutate({
                            id: user.id,
                            isAdmin: !user.isAdmin,
                          });
                        }}
                      >
                        {user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </Button>
                      {!user.isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.isBanned) {
                              unbanUserMutation.mutate(user.id);
                            } else {
                              setBanConfirmation({
                                isOpen: true,
                                userId: user.id,
                                userEmail: user.email || user.id,
                                banReason: "",
                                confirmText: "",
                                step: 1,
                              });
                            }
                          }}
                          className={user.isBanned ? "text-primary" : ""}
                        >
                          {user.isBanned ? "Unban" : "Ban User"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm("Reset all progress for this user? This cannot be undone.")
                          ) {
                            resetUserProgress.mutate(user.id);
                          }
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation({
                            isOpen: true,
                            userId: user.id,
                            userEmail: user.email || user.id,
                            confirmText: "",
                            step: 1,
                          });
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
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
