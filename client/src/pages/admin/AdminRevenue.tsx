import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  PoundSterling,
  Receipt,
  ArrowDownRight,
  ExternalLink,
  Gift,
  Tag,
  Video,
  Plus,
  Trash2,
  Percent,
  Calendar,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import type { RevenueData, Coupon, CoachingPurchase } from "./adminTypes";
import { formatCurrency } from "./adminTypes";

export default function AdminRevenue() {
  const queryClient = useQueryClient();

  // Revenue state
  const [revenueDateRange, setRevenueDateRange] = useState<"7d" | "30d" | "90d" | "365d" | "all">("all");
  const [grantAccessEmail, setGrantAccessEmail] = useState("");

  // Coupon state
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "percent" as "percent" | "fixed",
    discountAmount: 0,
    maxUses: "",
    expiresAt: "",
  });

  // Refund confirmation modal state
  const [refundConfirmation, setRefundConfirmation] = useState<{
    isOpen: boolean;
    chargeId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    chargeId: "",
    amount: 0,
    currency: "gbp",
    customerEmail: "",
    confirmText: "",
    step: 1,
  });

  // Data queries
  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue", revenueDateRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/revenue?range=${revenueDateRange}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch revenue");
      return res.json();
    },
  });

  const { data: couponsData = [], refetch: refetchCoupons } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const { data: coachingPurchasesData = [] } = useQuery<CoachingPurchase[]>({
    queryKey: ["/api/admin/coaching-purchases"],
  });

  // Mutations
  const grantAccessMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/admin/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, productType: "challenge" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to grant access");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setGrantAccessEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to grant access");
    },
  });

  const issueRefund = useMutation({
    mutationFn: async ({ chargeId, amount }: { chargeId: string; amount?: number }) => {
      const res = await apiRequest("POST", "/api/admin/refund", { chargeId, amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue"] });
      toast.success("Refund issued successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to issue refund");
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: typeof newCoupon) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          maxUses: data.maxUses ? parseInt(data.maxUses) : null,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon created successfully");
      refetchCoupons();
      setShowCreateCoupon(false);
      setNewCoupon({
        code: "",
        description: "",
        discountType: "percent",
        discountAmount: 0,
        maxUses: "",
        expiresAt: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Coupon> & { id: number }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      refetchCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      refetchCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-8">
      {/* Revenue & Payments */}
      <div className="space-y-4">
        {/* Date Range Filter & Stripe Link */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Date range:</span>
            <div className="flex gap-1">
              {[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
                { value: "365d", label: "1 year" },
                { value: "all", label: "All time" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRevenueDateRange(option.value as typeof revenueDateRange)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    revenueDateRange === option.value
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#635BFF] text-white text-sm font-medium rounded-lg hover:bg-[#5851ea] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
            </svg>
            Open Stripe Dashboard
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Quick Grant Access Tool */}
        <Card className="p-4 border border-slate-200 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Quick Grant Access</h3>
              <p className="text-sm text-slate-600 mb-3">
                Manually grant challenge access to a customer (use when webhooks fail)
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  value={grantAccessEmail}
                  onChange={(e) => setGrantAccessEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    if (grantAccessEmail.trim()) {
                      grantAccessMutation.mutate(grantAccessEmail.trim());
                    }
                  }}
                  disabled={!grantAccessEmail.trim() || grantAccessMutation.isPending}
                  className="whitespace-nowrap"
                >
                  {grantAccessMutation.isPending ? "Granting..." : "Grant Access"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {revenueLoading ? (
          <Card className="p-8 border border-slate-200 text-center">
            <p className="text-slate-500">Loading revenue data...</p>
          </Card>
        ) : revenueData ? (
          <>
            {/* Revenue by Currency */}
            <Card className="p-4 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Revenue by Currency</h3>
              {revenueData.revenueByCurrency.length === 0 ? (
                <p className="text-slate-500 text-sm">No sales yet</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {revenueData.revenueByCurrency.map((curr) => (
                    <div key={curr.currency} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-slate-900">{curr.currency}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                          {curr.count} sale{curr.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-3xl font-extrabold text-primary">
                        {formatCurrency(curr.amount, curr.currency)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-500">Last 7 days</p>
                          <p className="font-medium text-slate-900">
                            {formatCurrency(
                              revenueData.last7DaysByCurrency.find((c) => c.currency === curr.currency)
                                ?.amount || 0,
                              curr.currency
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Last 30 days</p>
                          <p className="font-medium text-slate-900">
                            {formatCurrency(
                              revenueData.last30DaysByCurrency.find(
                                (c) => c.currency === curr.currency
                              )?.amount || 0,
                              curr.currency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Sales</p>
                    <p className="text-xl font-bold text-slate-900">
                      {revenueData.totals.transactions}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Refunds</p>
                    <p className="text-xl font-bold text-red-600">{revenueData.refunds.count}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Revenue by Product */}
            {revenueData.revenueByProduct.length > 0 && (
              <Card className="p-4 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">Revenue by Product</h3>
                <div className="space-y-2">
                  {revenueData.revenueByProduct.map((product, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.count} sales</p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(product.amount, product.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card className="border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {revenueData.recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No transactions yet</div>
                ) : (
                  revenueData.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.refunded
                              ? "bg-red-100"
                              : tx.status === "succeeded"
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {tx.refunded ? (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          ) : (
                            <Receipt className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {tx.customerName !== "Unknown" ? tx.customerName : tx.customerEmail}
                          </p>
                          <p className="text-sm text-slate-500">{tx.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {!tx.refunded && tx.status === "succeeded" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setRefundConfirmation({
                                isOpen: true,
                                chargeId: tx.id,
                                amount: tx.amount,
                                currency: tx.currency,
                                customerEmail: tx.customerEmail,
                                confirmText: "",
                                step: 1,
                              });
                            }}
                            disabled={issueRefund.isPending}
                          >
                            Refund
                          </Button>
                        )}
                        {tx.refunded && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 font-semibold rounded-full">Refunded</span>
                        )}
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.refunded ? "text-red-600 line-through" : "text-slate-900"
                            }`}
                          >
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(tx.created * 1000).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 border border-slate-200 text-center">
            <PoundSterling className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              Unable to load revenue data. Check Stripe configuration.
            </p>
          </Card>
        )}
      </div>

      {/* Coaching Purchases */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Coaching Purchases</h2>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {coachingPurchasesData.length} sales
          </span>
        </div>

        <Card className="p-4 border border-slate-200 shadow-sm">
          {coachingPurchasesData.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No coaching purchases yet</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-slate-200">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">
                    {coachingPurchasesData.filter((p) => p.coachType === "matt").length}
                  </p>
                  <p className="text-xs text-slate-500">Matt Sessions</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">
                    {coachingPurchasesData.filter((p) => p.coachType === "expert").length}
                  </p>
                  <p className="text-xs text-slate-500">Expert Sessions</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">
                    {coachingPurchasesData.reduce((sum, p) => sum + p.sessionsTotal, 0)}
                  </p>
                  <p className="text-xs text-slate-500">Total Sessions</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    £
                    {(
                      coachingPurchasesData
                        .filter((p) => p.currency === "gbp")
                        .reduce((sum, p) => sum + p.amountPaid, 0) / 100
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">GBP Revenue</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Recent Purchases</h3>
                {coachingPurchasesData.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          purchase.coachType === "matt" ? "bg-amber-500" : "bg-blue-500"
                        }`}
                      >
                        {purchase.coachType === "matt" ? "M" : "J"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{purchase.email}</p>
                        <p className="text-xs text-slate-500">
                          {purchase.coachType === "matt" ? "Matt" : "Expert (James)"} ·{" "}
                          {purchase.sessionsTotal} session{purchase.sessionsTotal > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {purchase.currency === "gbp" ? "£" : "$"}
                        {(purchase.amountPaid / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Coupons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Coupon Codes</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {couponsData.filter((c) => c.isActive).length} active
            </span>
          </div>
          <Button onClick={() => setShowCreateCoupon(!showCreateCoupon)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Coupon
          </Button>
        </div>

        {/* Create Coupon Form */}
        {showCreateCoupon && (
          <Card className="p-6 border border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Create New Coupon</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Coupon Code</Label>
                <Input
                  placeholder="e.g., LAUNCH50"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Description (internal)</Label>
                <Input
                  placeholder="e.g., Launch promotion"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Discount Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  value={newCoupon.discountType}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discountType: e.target.value as "percent" | "fixed",
                    })
                  }
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (£)</option>
                </select>
              </div>
              <div>
                <Label>
                  {newCoupon.discountType === "percent" ? "Discount (%)" : "Discount Amount (£)"}
                </Label>
                <Input
                  type="number"
                  placeholder={newCoupon.discountType === "percent" ? "10" : "5"}
                  value={newCoupon.discountAmount || ""}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discountAmount:
                        newCoupon.discountType === "percent"
                          ? parseInt(e.target.value)
                          : parseInt(e.target.value) * 100,
                    })
                  }
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Max Uses (optional)</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Expires (optional)</Label>
                <Input
                  type="date"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => createCouponMutation.mutate(newCoupon)}
                disabled={!newCoupon.code || createCouponMutation.isPending}
              >
                {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Coupons List */}
        <Card className="border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {couponsData.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No coupons created yet</p>
              </div>
            ) : (
              couponsData.map((coupon) => (
                <div key={coupon.id} className={`p-4 hover:bg-slate-50 transition-colors ${coupon.isActive ? "border-l-4 border-l-green-500" : "border-l-4 border-l-slate-300"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                        {coupon.discountType === "percent" ? (
                          <Percent
                            className={`w-5 h-5 ${coupon.isActive ? "text-primary" : "text-slate-400"}`}
                          />
                        ) : (
                          <PoundSterling
                            className={`w-5 h-5 ${coupon.isActive ? "text-primary" : "text-slate-400"}`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{coupon.code}</span>
                          {!coupon.isActive && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {coupon.discountType === "percent"
                            ? `${coupon.discountAmount}% off`
                            : `£${(coupon.discountAmount / 100).toFixed(2)} off`}
                          {coupon.description && ` · ${coupon.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium text-slate-900">
                          {coupon.currentUses || 0}
                          {coupon.maxUses ? `/${coupon.maxUses}` : ""} uses
                        </p>
                        {coupon.expiresAt && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateCouponMutation.mutate({
                              id: coupon.id,
                              isActive: !coupon.isActive,
                            })
                          }
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete coupon ${coupon.code}?`)) {
                              deleteCouponMutation.mutate(coupon.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Refund Confirmation Modal */}
      {refundConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white overflow-hidden">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Confirm Refund</h2>
              <p className="text-slate-600 mt-2">
                You are about to refund{" "}
                <strong>
                  {formatCurrency(refundConfirmation.amount, refundConfirmation.currency)}
                </strong>{" "}
                to <strong>{refundConfirmation.customerEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This action cannot be undone and will cost you money.
              </p>
            </div>

            {refundConfirmation.step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Click the button below to proceed to final confirmation.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setRefundConfirmation((prev) => ({ ...prev, isOpen: false }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      setRefundConfirmation((prev) => ({ ...prev, step: 2 }))
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
                    <span className="font-mono bg-red-100 text-red-700 px-1 rounded">REFUND</span> to
                    confirm
                  </Label>
                  <Input
                    value={refundConfirmation.confirmText}
                    onChange={(e) =>
                      setRefundConfirmation((prev) => ({
                        ...prev,
                        confirmText: e.target.value,
                      }))
                    }
                    placeholder="Type REFUND here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setRefundConfirmation((prev) => ({
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
                      refundConfirmation.confirmText !== "REFUND" || issueRefund.isPending
                    }
                    onClick={() => {
                      issueRefund.mutate({ chargeId: refundConfirmation.chargeId });
                      setRefundConfirmation((prev) => ({
                        ...prev,
                        isOpen: false,
                        step: 1,
                        confirmText: "",
                      }));
                    }}
                  >
                    {issueRefund.isPending ? "Processing..." : "Issue Refund"}
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
