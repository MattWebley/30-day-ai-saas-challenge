import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Edit3,
  UserPlus,
  DollarSign,
  Check,
  X,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Coach {
  id: number;
  userId: string;
  displayName: string;
  email: string;
  calComLink: string | null;
  ratePerSession: number;
  rateCurrency: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalClients: number;
    completedSessions: number;
    pendingSessions: number;
    totalEarned: number;
    availableBalance: number;
    paidOut: number;
    pendingPayouts: number;
  };
}

interface UnassignedPurchase {
  id: number;
  userId: string | null;
  email: string;
  coachType: string;
  packageType: string;
  sessionsTotal: number;
  amountPaid: number;
  currency: string;
  purchasedAt: string;
  user: { id: string; firstName: string | null; lastName: string | null; email: string | null } | null;
}

interface Payout {
  id: number;
  coachId: number;
  amount: number;
  currency: string;
  status: string;
  requestedAt: string;
  paidAt: string | null;
  invoiceNumber: string | null;
  coach: { id: number; displayName: string; email: string } | null;
}

interface CoachSession {
  id: number;
  coachingPurchaseId: number;
  coachId: number;
  clientEmail: string;
  sessionNumber: number;
  status: string;
  completedAt: string | null;
  coachNotes: string | null;
  createdAt: string;
  coach: { id: number; displayName: string } | null;
  clientUser: { firstName: string | null; lastName: string | null; email: string | null } | null;
}

function formatMoney(cents: number, currency: string = 'gbp') {
  const symbol = currency === 'gbp' ? '£' : '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export default function AdminCoaches() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<'coaches' | 'unassigned' | 'payouts' | 'sessions'>('coaches');

  // Form state
  const [newCoach, setNewCoach] = useState({ email: '', firstName: '', password: '', calComLink: '', ratePerSession: '', rateCurrency: 'gbp' });
  const [editData, setEditData] = useState<Partial<Coach>>({});

  // Queries
  const { data: coaches = [], isLoading } = useQuery<Coach[]>({
    queryKey: ['/api/admin/coaches'],
    staleTime: 30_000,
  });

  const { data: unassigned = [] } = useQuery<UnassignedPurchase[]>({
    queryKey: ['/api/admin/unassigned-coaching'],
    staleTime: 30_000,
  });

  const { data: payouts = [] } = useQuery<Payout[]>({
    queryKey: ['/api/admin/coach-payouts'],
    staleTime: 30_000,
  });

  const { data: allSessions = [] } = useQuery<CoachSession[]>({
    queryKey: ['/api/admin/coach-sessions'],
    staleTime: 30_000,
  });

  // Mutations
  const createCoach = useMutation({
    mutationFn: async (data: typeof newCoach) => {
      const res = await apiRequest('POST', '/api/admin/coaches', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      toast.success('Coach created successfully');
      setShowAddForm(false);
      setNewCoach({ email: '', firstName: '', password: '', calComLink: '', ratePerSession: '', rateCurrency: 'gbp' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create coach'),
  });

  const updateCoach = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PATCH', `/api/admin/coaches/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      toast.success('Coach updated');
      setEditingCoach(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update coach'),
  });

  const assignCoach = useMutation({
    mutationFn: async ({ purchaseId, coachId }: { purchaseId: number; coachId: number }) => {
      const res = await apiRequest('POST', `/api/admin/coaching-purchases/${purchaseId}/assign`, { coachId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/unassigned-coaching'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coach-sessions'] });
      toast.success(data.message || 'Client assigned');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to assign coach'),
  });

  const markPaid = useMutation({
    mutationFn: async (payoutId: number) => {
      const res = await apiRequest('PATCH', `/api/admin/coach-payouts/${payoutId}`, { status: 'paid' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coach-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      toast.success('Payout marked as paid');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update payout'),
  });

  const activeCoaches = coaches.filter(c => c.isActive);
  const pendingPayouts = payouts.filter(p => p.status === 'requested');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Coaches</p>
          <p className="text-3xl font-extrabold text-slate-900">{activeCoaches.length}</p>
        </Card>
        <Card className="p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unassigned Clients</p>
          <p className="text-3xl font-extrabold text-slate-900">{unassigned.length}</p>
        </Card>
        <Card className="p-4 border border-slate-200 border-l-4 border-l-green-500 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Payouts</p>
          <p className="text-3xl font-extrabold text-slate-900">{pendingPayouts.length}</p>
        </Card>
        <Card className="p-4 border border-slate-200 border-l-4 border-l-purple-500 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</p>
          <p className="text-3xl font-extrabold text-slate-900">{allSessions.length}</p>
          <p className="text-xs text-slate-500">{allSessions.filter(s => s.status === 'completed').length} completed</p>
        </Card>
      </div>

      {/* Coaches Section */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'coaches' ? 'coaches' : 'coaches')}
          className="w-full p-5 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Coaches</h3>
              <p className="text-sm text-slate-500">{coaches.length} total, {activeCoaches.length} active</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAddForm(!showAddForm); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Coach
          </button>
        </button>

        {/* Add Coach Form */}
        {showAddForm && (
          <div className="px-5 pb-5 border-t border-slate-200 pt-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900">New Coach</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">First Name *</label>
                  <input
                    type="text"
                    value={newCoach.firstName}
                    onChange={(e) => setNewCoach({ ...newCoach, firstName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email *</label>
                  <input
                    type="email"
                    value={newCoach.email}
                    onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Password *</label>
                  <input
                    type="text"
                    value={newCoach.password}
                    onChange={(e) => setNewCoach({ ...newCoach, password: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Cal.com Booking Link</label>
                  <input
                    type="url"
                    value={newCoach.calComLink}
                    onChange={(e) => setNewCoach({ ...newCoach, calComLink: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="https://cal.com/jane/coaching"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Rate Per Session (pence/cents) *</label>
                  <input
                    type="number"
                    value={newCoach.ratePerSession}
                    onChange={(e) => setNewCoach({ ...newCoach, ratePerSession: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="5000 = £50.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Currency</label>
                  <select
                    value={newCoach.rateCurrency}
                    onChange={(e) => setNewCoach({ ...newCoach, rateCurrency: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="gbp">GBP (£)</option>
                    <option value="usd">USD ($)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => createCoach.mutate(newCoach)}
                  disabled={createCoach.isPending || !newCoach.email || !newCoach.firstName || !newCoach.password || !newCoach.ratePerSession}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {createCoach.isPending ? 'Creating...' : 'Create Coach'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coach List */}
        <div className="px-5 pb-5 space-y-3">
          {coaches.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">No coaches yet. Add your first coach above.</p>
          ) : (
            coaches.map((coach) => (
              <div key={coach.id} className={`rounded-lg border p-4 ${coach.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
                {editingCoach === coach.id ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Display Name</label>
                        <input
                          type="text"
                          value={editData.displayName || ''}
                          onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Cal.com Link</label>
                        <input
                          type="url"
                          value={editData.calComLink || ''}
                          onChange={(e) => setEditData({ ...editData, calComLink: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Rate Per Session (pence/cents)</label>
                        <input
                          type="number"
                          value={editData.ratePerSession || ''}
                          onChange={(e) => setEditData({ ...editData, ratePerSession: parseInt(e.target.value) })}
                          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Currency</label>
                        <select
                          value={editData.rateCurrency || 'gbp'}
                          onChange={(e) => setEditData({ ...editData, rateCurrency: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        >
                          <option value="gbp">GBP (£)</option>
                          <option value="usd">USD ($)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateCoach.mutate({ id: coach.id, data: editData })}
                        className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCoach(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{coach.displayName}</h4>
                        {coach.isActive ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{coach.email}</p>
                      {coach.calComLink && (
                        <p className="text-sm text-slate-500">
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          <a href={coach.calComLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{coach.calComLink}</a>
                        </p>
                      )}
                      <p className="text-sm text-slate-500">
                        Rate: <span className="font-semibold text-slate-700">{formatMoney(coach.ratePerSession, coach.rateCurrency)}</span>/session
                      </p>
                      <div className="flex gap-4 pt-1">
                        <span className="text-xs text-slate-500">{coach.stats.totalClients} clients</span>
                        <span className="text-xs text-slate-500">{coach.stats.completedSessions} sessions done</span>
                        <span className="text-xs text-slate-500">{coach.stats.pendingSessions} pending</span>
                        <span className="text-xs font-medium text-green-600">Balance: {formatMoney(coach.stats.availableBalance, coach.rateCurrency)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCoach(coach.id);
                          setEditData({ displayName: coach.displayName, calComLink: coach.calComLink || '', ratePerSession: coach.ratePerSession, rateCurrency: coach.rateCurrency });
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateCoach.mutate({ id: coach.id, data: { isActive: !coach.isActive } })}
                        className={`p-2 rounded-lg ${coach.isActive ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={coach.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coach.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Unassigned Clients */}
      <Card className={`border border-slate-200 shadow-sm overflow-hidden ${unassigned.length > 0 ? 'border-l-4 border-l-amber-500' : ''}`}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {unassigned.length > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            <div>
              <h3 className="text-lg font-bold text-slate-900">Unassigned Clients</h3>
              <p className="text-sm text-slate-500">{unassigned.length} coaching purchase{unassigned.length !== 1 ? 's' : ''} waiting for assignment</p>
            </div>
          </div>
        </div>

        {unassigned.length > 0 && (
          <div className="px-5 pb-5 space-y-3">
            {unassigned.map((purchase) => {
              const clientName = purchase.user
                ? [purchase.user.firstName, purchase.user.lastName].filter(Boolean).join(' ') || purchase.email
                : purchase.email;

              return (
                <div key={purchase.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">{clientName}</p>
                    <p className="text-sm text-slate-500">
                      {purchase.packageType === 'pack' ? '4 Sessions' : '1 Session'} • {purchase.coachType} •{' '}
                      {formatMoney(purchase.amountPaid, purchase.currency)} •{' '}
                      {new Date(purchase.purchasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignCoach.mutate({ purchaseId: purchase.id, coachId: parseInt(e.target.value) });
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign to...</option>
                      {activeCoaches.map((coach) => (
                        <option key={coach.id} value={coach.id}>{coach.displayName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Payout Requests */}
      <Card className={`border border-slate-200 shadow-sm overflow-hidden ${pendingPayouts.length > 0 ? 'border-l-4 border-l-green-500' : ''}`}>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payout Requests</h3>
              <p className="text-sm text-slate-500">{pendingPayouts.length} pending, {payouts.filter(p => p.status === 'paid').length} paid</p>
            </div>
          </div>
        </div>

        {payouts.length > 0 && (
          <div className="px-5 pb-5 space-y-3">
            {payouts.map((payout) => (
              <div key={payout.id} className={`flex items-center justify-between p-3 rounded-lg border ${payout.status === 'requested' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-medium text-slate-900">{payout.coach?.displayName || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">
                    {payout.invoiceNumber} • {formatMoney(payout.amount, payout.currency)} •{' '}
                    {new Date(payout.requestedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {payout.status === 'requested' ? (
                    <button
                      onClick={() => markPaid.mutate(payout.id)}
                      disabled={markPaid.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Paid {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All Sessions */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900">All Sessions</h3>
          <p className="text-sm text-slate-500">{allSessions.length} total sessions across all coaches</p>
        </div>
        {allSessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Coach</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Session #</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSessions.map((session) => {
                  const clientName = session.clientUser
                    ? [session.clientUser.firstName, session.clientUser.lastName].filter(Boolean).join(' ') || session.clientEmail
                    : session.clientEmail;
                  return (
                    <tr key={session.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm text-slate-700">{clientName}</td>
                      <td className="px-5 py-3 text-sm text-slate-700">{session.coach?.displayName || '-'}</td>
                      <td className="px-5 py-3 text-sm text-slate-700">#{session.sessionNumber}</td>
                      <td className="px-5 py-3">
                        {session.status === 'completed' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Completed</span>
                        ) : session.status === 'cancelled' ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Cancelled</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : new Date(session.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
