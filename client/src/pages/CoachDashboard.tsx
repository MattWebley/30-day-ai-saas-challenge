import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  DollarSign,
  Check,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Settings,
} from "lucide-react";

interface CoachProfile {
  id: number;
  displayName: string;
  email: string;
  calComLink: string | null;
  ratePerSession: number;
  rateCurrency: string;
  companyName: string | null;
  companyAddress: string | null;
  taxId: string | null;
  bankDetails: string | null;
  stats: {
    completedSessions: number;
    pendingSessions: number;
    totalEarned: number;
    availableBalance: number;
    paidOut: number;
    pendingPayouts: number;
  };
}

interface ClientSession {
  id: number;
  sessionNumber: number;
  status: string;
  completedAt: string | null;
  coachNotes: string | null;
  createdAt: string;
}

interface Client {
  purchaseId: number;
  email: string;
  packageType: string;
  sessionsTotal: number;
  sessionsCompleted: number;
  sessionsRemaining: number;
  purchasedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    currentDay: number;
    daysCompleted: number;
  } | null;
  sessions: ClientSession[];
}

interface CoachSession {
  id: number;
  coachingPurchaseId: number;
  clientEmail: string;
  sessionNumber: number;
  status: string;
  completedAt: string | null;
  coachNotes: string | null;
  createdAt: string;
  clientUser: { firstName: string | null; lastName: string | null; email: string | null } | null;
}

interface Earnings {
  currency: string;
  ratePerSession: number;
  totalEarned: number;
  availableBalance: number;
  requested: number;
  paidOut: number;
  completedSessions: (CoachSession & { earnings: number })[];
  payouts: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    requestedAt: string;
    paidAt: string | null;
    invoiceNumber: string | null;
  }[];
}

type Tab = 'clients' | 'sessions' | 'earnings' | 'settings';

function formatMoney(cents: number, currency: string = 'gbp') {
  const symbol = currency === 'gbp' ? '£' : '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export default function CoachDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [completingSession, setCompletingSession] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [settingsForm, setSettingsForm] = useState({
    calComLink: '',
    companyName: '',
    companyAddress: '',
    taxId: '',
    bankDetails: '',
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Admin impersonation: read coachId from URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const impersonateCoachId = urlParams.get('coachId');
  const isAdminViewing = !!(user as any)?.isAdmin && !!impersonateCoachId;
  const qs = impersonateCoachId ? `?coachId=${impersonateCoachId}` : '';

  const { data: profile, isLoading: profileLoading } = useQuery<CoachProfile>({
    queryKey: ['/api/coach/profile', impersonateCoachId],
    queryFn: async () => {
      const res = await fetch(`/api/coach/profile${qs}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    staleTime: 30_000,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/coach/clients', impersonateCoachId],
    queryFn: async () => {
      const res = await fetch(`/api/coach/clients${qs}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    },
    staleTime: 30_000,
  });

  const { data: sessions = [] } = useQuery<CoachSession[]>({
    queryKey: ['/api/coach/sessions', impersonateCoachId],
    queryFn: async () => {
      const res = await fetch(`/api/coach/sessions${qs}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 30_000,
  });

  const { data: earnings } = useQuery<Earnings>({
    queryKey: ['/api/coach/earnings', impersonateCoachId],
    queryFn: async () => {
      const res = await fetch(`/api/coach/earnings${qs}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch earnings');
      return res.json();
    },
    staleTime: 30_000,
  });

  const completeSession = useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: number; notes: string }) => {
      const res = await apiRequest('POST', `/api/coach/sessions/${sessionId}/complete${qs}`, { notes });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach'] });
      toast.success(`Session completed! ${data.sessionsRemaining} sessions remaining for this client.`);
      setCompletingSession(null);
      setSessionNotes('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to complete session'),
  });

  const requestPayout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/coach/payouts/request${qs}`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach'] });
      toast.success(`Payout requested: ${data.invoiceNumber}`);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to request payout'),
  });

  const saveSettings = useMutation({
    mutationFn: async (data: typeof settingsForm) => {
      const res = await apiRequest('PATCH', `/api/coach/profile${qs}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/profile'] });
      toast.success('Settings saved');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save settings'),
  });

  // Load profile data into settings form
  useEffect(() => {
    if (profile && !settingsLoaded) {
      setSettingsForm({
        calComLink: profile.calComLink || '',
        companyName: profile.companyName || '',
        companyAddress: profile.companyAddress || '',
        taxId: profile.taxId || '',
        bankDetails: profile.bankDetails || '',
      });
      setSettingsLoaded(true);
    }
  }, [profile, settingsLoaded]);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (!(user as any).isCoach && !(user as any).isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">You need a coach account to access this page.</p>
          <a href="/coach-login" className="text-primary hover:underline">Go to Coach Login</a>
        </Card>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'clients', label: 'Clients', icon: Users, count: clients.length },
    { key: 'sessions', label: 'Sessions', icon: Calendar, count: sessions.filter(s => s.status === 'pending').length },
    { key: 'earnings', label: 'Earnings', icon: DollarSign },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin viewing banner */}
      {isAdminViewing && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-amber-800 font-medium">
            Viewing as: <strong>{profile?.displayName || 'Coach'}</strong> (admin preview)
          </p>
          <a href="/admin" className="text-sm text-amber-700 hover:text-amber-900 font-medium hover:underline">
            ← Back to Admin
          </a>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Coach Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {profile?.displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        {profile && (
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className="p-4 border border-slate-200 border-l-4 border-l-blue-500">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Sessions</p>
              <p className="text-3xl font-extrabold text-slate-900">{profile.stats.pendingSessions}</p>
            </Card>
            <Card className="p-4 border border-slate-200 border-l-4 border-l-green-500">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-extrabold text-slate-900">{profile.stats.completedSessions}</p>
            </Card>
            <Card className="p-4 border border-slate-200 border-l-4 border-l-emerald-500">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Balance</p>
              <p className="text-3xl font-extrabold text-slate-900">{formatMoney(profile.stats.availableBalance, profile.rateCurrency)}</p>
            </Card>
            <Card className="p-4 border border-slate-200 border-l-4 border-l-purple-500">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Earned</p>
              <p className="text-3xl font-extrabold text-slate-900">{formatMoney(profile.stats.totalEarned, profile.rateCurrency)}</p>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary bg-slate-50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {clients.length === 0 ? (
              <Card className="p-8 text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No clients assigned yet. Matt will assign clients from the admin panel.</p>
              </Card>
            ) : (
              clients.map((client) => {
                const clientName = client.user
                  ? [client.user.firstName, client.user.lastName].filter(Boolean).join(' ') || client.email
                  : client.email;
                const isExpanded = expandedClient === client.purchaseId;

                return (
                  <Card key={client.purchaseId} className="border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedClient(isExpanded ? null : client.purchaseId)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                          {clientName[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{clientName}</p>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {client.sessionsCompleted}/{client.sessionsTotal} sessions
                          </p>
                          {client.user && (
                            <p className="text-xs text-slate-500">Day {client.user.currentDay} of 21</p>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-200 pt-3 space-y-4">
                        {/* Client Progress */}
                        {client.user && (
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-2">Challenge Progress</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.round((client.user.currentDay / 21) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">
                                {Math.round((client.user.currentDay / 21) * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Day {client.user.currentDay} • {client.user.daysCompleted} days completed
                            </p>
                          </div>
                        )}

                        {/* Sessions */}
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Sessions</p>
                          <div className="space-y-2">
                            {client.sessions.map((session) => (
                              <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                session.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                              }`}>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">Session #{session.sessionNumber}</p>
                                  {session.status === 'completed' && session.completedAt && (
                                    <p className="text-xs text-slate-500">
                                      Completed {new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                  )}
                                  {session.coachNotes && (
                                    <p className="text-xs text-slate-600 mt-1 italic">"{session.coachNotes}"</p>
                                  )}
                                </div>
                                <div>
                                  {session.status === 'completed' ? (
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Done</span>
                                  ) : completingSession === session.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={sessionNotes}
                                        onChange={(e) => setSessionNotes(e.target.value)}
                                        placeholder="Notes (optional)"
                                        className="px-2 py-1 border border-slate-200 rounded text-sm w-40"
                                      />
                                      <button
                                        onClick={() => completeSession.mutate({ sessionId: session.id, notes: sessionNotes })}
                                        disabled={completeSession.isPending}
                                        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                                      >
                                        {completeSession.isPending ? '...' : 'Confirm'}
                                      </button>
                                      <button
                                        onClick={() => { setCompletingSession(null); setSessionNotes(''); }}
                                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setCompletingSession(session.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Mark Done
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card className="p-8 text-center border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No sessions yet.</p>
              </Card>
            ) : (
              <>
                {/* Pending sessions first */}
                {sessions.filter(s => s.status === 'pending').length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Pending Sessions</h3>
                    <div className="space-y-2">
                      {sessions.filter(s => s.status === 'pending').map((session) => {
                        const clientName = session.clientUser
                          ? [session.clientUser.firstName, session.clientUser.lastName].filter(Boolean).join(' ') || session.clientEmail
                          : session.clientEmail;

                        return (
                          <Card key={session.id} className="p-4 border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{clientName}</p>
                              <p className="text-sm text-slate-500">Session #{session.sessionNumber}</p>
                            </div>
                            {completingSession === session.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={sessionNotes}
                                  onChange={(e) => setSessionNotes(e.target.value)}
                                  placeholder="Notes (optional)"
                                  className="px-2 py-1 border border-slate-200 rounded text-sm w-40"
                                />
                                <button
                                  onClick={() => completeSession.mutate({ sessionId: session.id, notes: sessionNotes })}
                                  disabled={completeSession.isPending}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                  {completeSession.isPending ? '...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => { setCompletingSession(null); setSessionNotes(''); }}
                                  className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCompletingSession(session.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Done
                              </button>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed sessions */}
                {sessions.filter(s => s.status === 'completed').length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Completed Sessions</h3>
                    <div className="space-y-2">
                      {sessions.filter(s => s.status === 'completed').map((session) => {
                        const clientName = session.clientUser
                          ? [session.clientUser.firstName, session.clientUser.lastName].filter(Boolean).join(' ') || session.clientEmail
                          : session.clientEmail;

                        return (
                          <Card key={session.id} className="p-4 border border-slate-200 bg-green-50/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{clientName}</p>
                                <p className="text-sm text-slate-500">
                                  Session #{session.sessionNumber} •{' '}
                                  {session.completedAt && new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                {session.coachNotes && (
                                  <p className="text-sm text-slate-600 mt-1 italic">"{session.coachNotes}"</p>
                                )}
                              </div>
                              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Done</span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && earnings && (
          <div className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid sm:grid-cols-4 gap-4">
              <Card className="p-4 border border-slate-200 border-l-4 border-l-emerald-500">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available</p>
                <p className="text-2xl font-extrabold text-emerald-600">{formatMoney(earnings.availableBalance, earnings.currency)}</p>
              </Card>
              <Card className="p-4 border border-slate-200 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested</p>
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(earnings.requested, earnings.currency)}</p>
              </Card>
              <Card className="p-4 border border-slate-200 border-l-4 border-l-green-500">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p>
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(earnings.paidOut, earnings.currency)}</p>
              </Card>
              <Card className="p-4 border border-slate-200 border-l-4 border-l-blue-500">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Earned</p>
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(earnings.totalEarned, earnings.currency)}</p>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => requestPayout.mutate()}
                disabled={requestPayout.isPending || earnings.availableBalance <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                {requestPayout.isPending ? 'Requesting...' : `Request Payout (${formatMoney(earnings.availableBalance, earnings.currency)})`}
              </button>
            </div>

            {/* Payouts History */}
            {earnings.payouts.length > 0 && (
              <Card className="border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900">Payout History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {earnings.payouts.map((payout) => (
                    <div key={payout.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{formatMoney(payout.amount, payout.currency)}</p>
                        <p className="text-sm text-slate-500">
                          {payout.invoiceNumber} •{' '}
                          {new Date(payout.requestedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {payout.status === 'paid' ? (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Paid</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Requested</span>
                        )}
                        <a
                          href={`/api/coach/invoice/${payout.id}${qs}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg"
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Session History */}
            {earnings.completedSessions.length > 0 && (
              <Card className="border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900">Session Earnings</h3>
                  <p className="text-sm text-slate-500">{formatMoney(earnings.ratePerSession, earnings.currency)} per session</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {earnings.completedSessions.map((session) => {
                    const clientName = session.clientUser
                      ? [session.clientUser.firstName, session.clientUser.lastName].filter(Boolean).join(' ') || session.clientEmail
                      : session.clientEmail;
                    return (
                      <div key={session.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{clientName}</p>
                          <p className="text-sm text-slate-500">
                            Session #{session.sessionNumber} •{' '}
                            {session.completedAt && new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">{formatMoney(session.earnings, earnings.currency)}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Booking Link */}
            <Card className="border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900">Booking Link</h3>
              <div>
                <label className="text-slate-700 font-medium">Cal.com Link</label>
                <input
                  type="url"
                  value={settingsForm.calComLink}
                  onChange={(e) => setSettingsForm({ ...settingsForm, calComLink: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                  placeholder="https://cal.com/your-name/coaching"
                />
                <p className="text-sm text-slate-500 mt-1">Clients use this to book sessions with you.</p>
              </div>
            </Card>

            {/* Company / Invoice Details */}
            <Card className="border border-slate-200 p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">Company & Invoice Details</h3>
                <p className="text-sm text-slate-500">These details will appear on your invoices and payout records.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-medium">Company / Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.companyName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                    placeholder="Your company or trading name"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    value={settingsForm.taxId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taxId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                    placeholder="e.g. GB123456789"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-medium">Business Address</label>
                <textarea
                  value={settingsForm.companyAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, companyAddress: e.target.value })}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary resize-none"
                  placeholder="Your registered business address"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium">Bank / Payment Details</label>
                <textarea
                  value={settingsForm.bankDetails}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary resize-none"
                  placeholder="Bank name, sort code, account number — or PayPal email, Wise details, etc."
                />
                <p className="text-sm text-slate-500 mt-1">This is where we'll send your payouts. Only you and the admin can see this.</p>
              </div>
            </Card>

            <button
              onClick={() => saveSettings.mutate(settingsForm)}
              disabled={saveSettings.isPending}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
