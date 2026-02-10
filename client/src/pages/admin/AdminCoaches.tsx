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
  Eye,
  Mail,
  Clock,
  FileCheck,
  Send,
  FileText,
  XCircle,
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

interface CoachInvitation {
  id: number;
  token: string;
  email: string;
  ratePerSession: number;
  rateCurrency: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

function formatMoney(cents: number, currency: string = 'gbp') {
  const symbol = currency === 'gbp' ? '£' : currency === 'aed' ? 'AED ' : '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export default function AdminCoaches() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['coaches']));
  const [previewType, setPreviewType] = useState<'email' | 'agreement' | null>(null);
  const [previewText, setPreviewText] = useState('');

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // Form state — invitation only needs email + rate
  const [newCoach, setNewCoach] = useState({ email: '', ratePerSession: '', rateCurrency: 'gbp' });
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

  const { data: invitations = [] } = useQuery<CoachInvitation[]>({
    queryKey: ['/api/admin/coach-invitations'],
    staleTime: 30_000,
  });

  // Mutations
  const createCoach = useMutation({
    mutationFn: async (data: typeof newCoach) => {
      const res = await apiRequest('POST', '/api/admin/coaches', {
        ...data,
        ratePerSession: Math.round(parseFloat(data.ratePerSession) * 100),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coach-invitations'] });
      toast.success('Invitation sent');
      setShowAddForm(false);
      setNewCoach({ email: '', ratePerSession: '', rateCurrency: 'gbp' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send invitation'),
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

  const cancelInvitation = useMutation({
    mutationFn: async (invId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/coach-invitations/${invId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coach-invitations'] });
      toast.success('Invitation cancelled');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to cancel invitation'),
  });

  const loadPreview = async (type: 'email' | 'agreement') => {
    if (type === 'email') {
      setPreviewText(`Subject: You've been invited to coach on the 21-Day AI SaaS Challenge

Hi there,

You've been invited to join the 21-Day AI SaaS Challenge as a coach.

Before you can start coaching, you'll need to:
1. Review and sign the Independent Contractor Agreement
2. Set up your coach profile

Click the link below to get started:
https://challenge.mattwebley.com/coach-setup/[unique-token]

This invitation link expires in 7 days.

If you have any questions, just reply to this email.

Matt

--
21-Day AI SaaS Challenge by Matt Webley
Webley Global - FZCO
Dubai Silicon Oasis, Dubai, United Arab Emirates`);
      setPreviewType('email');
    } else {
      try {
        const rate = newCoach.ratePerSession ? Math.round(parseFloat(newCoach.ratePerSession) * 100) : 5000;
        const currency = newCoach.rateCurrency || 'gbp';
        const email = newCoach.email || 'coach@example.com';
        const res = await fetch(`/api/admin/coach-contract-preview?email=${encodeURIComponent(email)}&rate=${rate}&currency=${currency}`);
        const data = await res.json();
        setPreviewText(data.contractText);
        setPreviewType('agreement');
      } catch {
        toast.error('Failed to load preview');
      }
    }
  };

  const activeCoaches = coaches.filter(c => c.isActive);
  const pendingPayouts = payouts.filter(p => p.status === 'requested');
  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  // Build a set of coach IDs that have signed agreements (from invitations marked accepted)
  const coachesWithAgreements = new Set(
    invitations.filter(i => i.status === 'accepted').map(i => i.email.toLowerCase())
  );

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
        <div className="p-5 flex items-center justify-between">
          <button onClick={() => toggleSection('coaches')} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Coaches</h3>
              <p className="text-sm text-slate-500">{coaches.length} total, {activeCoaches.length} active</p>
            </div>
            {openSections.has('coaches') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAddForm(!showAddForm); if (!openSections.has('coaches')) toggleSection('coaches'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90"
          >
            <Send className="w-4 h-4" /> Invite Coach
          </button>
        </div>

        {openSections.has('coaches') && (
          <>
            {/* Add Coach Form — invitation-based */}
            {showAddForm && (
              <div className="px-5 pb-5 border-t border-slate-200 pt-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900">Send Coach Invitation</h4>
                  <p className="text-slate-600 text-sm">The coach will receive an email with a link to sign the contractor agreement and set up their account.</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Email *</label>
                      <input
                        type="email"
                        value={newCoach.email}
                        onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="coach@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Rate Per Session ({newCoach.rateCurrency === 'gbp' ? '£' : newCoach.rateCurrency === 'usd' ? '$' : 'AED'}) *</label>
                      <input
                        type="number"
                        value={newCoach.ratePerSession}
                        onChange={(e) => setNewCoach({ ...newCoach, ratePerSession: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g. 50"
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
                        <option value="aed">AED</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => createCoach.mutate(newCoach)}
                      disabled={createCoach.isPending || !newCoach.email || !newCoach.ratePerSession}
                      className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {createCoach.isPending ? 'Sending...' : 'Send Invitation'}
                    </button>
                    <button
                      onClick={() => loadPreview('email')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                    >
                      <Mail className="w-3.5 h-3.5" /> Preview Email
                    </button>
                    <button
                      onClick={() => loadPreview('agreement')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                    >
                      <FileText className="w-3.5 h-3.5" /> Preview Agreement
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
                <p className="text-slate-500 py-4 text-center">No coaches yet. Invite your first coach above.</p>
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
                        <label className="text-sm font-medium text-slate-700">Rate Per Session ({editData.rateCurrency === 'usd' ? '$' : editData.rateCurrency === 'aed' ? 'AED' : '£'})</label>
                        <input
                          type="number"
                          value={editData.ratePerSession ? editData.ratePerSession / 100 : ''}
                          onChange={(e) => setEditData({ ...editData, ratePerSession: Math.round(parseFloat(e.target.value) * 100) })}
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
                          <option value="aed">AED</option>
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
                        {coachesWithAgreements.has(coach.email.toLowerCase()) && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> Agreement signed
                          </span>
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
                      <a
                        href={`/coach?coachId=${coach.id}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg"
                        title="View this coach's dashboard"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
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
          </>
        )}
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <button onClick={() => toggleSection('invitations')} className="w-full p-5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">Coach Invitations</h3>
              <p className="text-sm text-slate-500">{pendingInvitations.length} pending, {invitations.filter(i => i.status === 'accepted').length} accepted</p>
            </div>
            {openSections.has('invitations') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          {openSections.has('invitations') && (
            <div className="px-5 pb-5 space-y-2">
              {invitations.map((inv) => (
                <div key={inv.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  inv.status === 'pending' ? 'bg-amber-50 border-amber-200' :
                  inv.status === 'accepted' ? 'bg-green-50 border-green-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <p className="font-medium text-slate-900">{inv.email}</p>
                    <p className="text-sm text-slate-500">
                      {formatMoney(inv.ratePerSession, inv.rateCurrency)}/session
                      {' · '}
                      Sent {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {inv.status === 'pending' && (
                        <> · Expires {new Date(inv.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === 'pending' && (
                      <>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                        <button
                          onClick={() => cancelInvitation.mutate(inv.id)}
                          disabled={cancelInvitation.isPending}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Cancel invitation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {inv.status === 'accepted' && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Accepted
                      </span>
                    )}
                    {inv.status === 'expired' && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">Cancelled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Unassigned Clients */}
      <Card className={`border border-slate-200 shadow-sm overflow-hidden ${unassigned.length > 0 ? 'border-l-4 border-l-amber-500' : ''}`}>
        <button onClick={() => toggleSection('unassigned')} className="w-full p-5 flex items-center gap-3 text-left">
          {unassigned.length > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Unassigned Clients</h3>
            <p className="text-sm text-slate-500">{unassigned.length} coaching purchase{unassigned.length !== 1 ? 's' : ''} waiting for assignment</p>
          </div>
          {openSections.has('unassigned') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.has('unassigned') && unassigned.length > 0 && (
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
        <button onClick={() => toggleSection('payouts')} className="w-full p-5 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Payout Requests</h3>
            <p className="text-sm text-slate-500">{pendingPayouts.length} pending, {payouts.filter(p => p.status === 'paid').length} paid</p>
          </div>
          {openSections.has('payouts') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.has('payouts') && payouts.length > 0 && (
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
        <button onClick={() => toggleSection('sessions')} className="w-full p-5 flex items-center gap-3 text-left">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">All Sessions</h3>
            <p className="text-sm text-slate-500">{allSessions.length} total sessions across all coaches</p>
          </div>
          {openSections.has('sessions') ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {openSections.has('sessions') && allSessions.length > 0 && (
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

      {/* Preview Modal */}
      {previewType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewType(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {previewType === 'email' ? 'Invitation Email Preview' : 'Contractor Agreement Preview'}
              </h3>
              <button onClick={() => setPreviewType(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">{previewText}</pre>
            </div>
            <div className="p-4 border-t border-slate-200">
              <button onClick={() => setPreviewType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
