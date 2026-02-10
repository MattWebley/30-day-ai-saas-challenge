import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Calendar, Check, Clock, Video, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface CoachingSession {
  id: number;
  sessionNumber: number;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
}

interface CoachingPurchase {
  id: number;
  coachType: string;
  packageType: string;
  sessionsTotal: number;
  purchasedAt: string;
  coach: {
    displayName: string;
    calComLink: string | null;
  } | null;
  sessions: CoachingSession[];
}

interface MyCoachingData {
  purchases: CoachingPurchase[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCalEmbedUrl(calComLink: string, purchaseId: number): string {
  // Cal.com links might be full URLs like https://cal.com/user/event or https://cal.eu/user/event
  // Add embed params and metadata
  const separator = calComLink.includes('?') ? '&' : '?';
  return `${calComLink}${separator}embed=true&layout=month_view&metadata[purchaseId]=${purchaseId}`;
}

export default function MyCoaching() {
  const [bookingPurchaseId, setBookingPurchaseId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<MyCoachingData>({
    queryKey: ['/api/my-coaching'],
    staleTime: 30_000,
  });

  const purchases = data?.purchases || [];

  if (isLoading) {
    return (
      <Layout currentDay={0}>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // No coaching purchased — show upsell link
  if (purchases.length === 0) {
    return (
      <Layout currentDay={0}>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">1:1 Coaching</h1>
          <p className="text-slate-600">
            Work directly with an expert coach who builds WITH you, live on screen.
            Get unstuck, ship faster, and launch with confidence.
          </p>
          <Link href="/coaching">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 cursor-pointer">
              View Coaching Options <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentDay={0}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Coaching</h1>
          <p className="text-slate-600 mt-1">Your coaching sessions and booking</p>
        </div>

        {purchases.map((purchase) => {
          const pendingSessions = purchase.sessions.filter(s => s.status === 'pending');
          const scheduledSessions = purchase.sessions.filter(s => s.status === 'scheduled');
          const completedSessions = purchase.sessions.filter(s => s.status === 'completed');
          const showBooking = bookingPurchaseId === purchase.id;

          return (
            <div key={purchase.id} className="space-y-4">
              {/* Coach Info */}
              <Card className="p-5 border-2 border-slate-200 space-y-4">
                {purchase.coach ? (
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {purchase.coach.displayName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Your Coach: {purchase.coach.displayName}</p>
                        <p className="text-sm text-slate-500">
                          {purchase.coachType === 'matt' ? 'Sessions with Matt' : 'Expert Coaching'} —{' '}
                          {purchase.packageType === 'pack' ? '4 Session Pack' : 'Single Session'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-900">Coach being assigned</p>
                      <p className="text-sm text-slate-600">You'll be notified when your coach is ready — usually within 24 hours.</p>
                    </div>
                  </div>
                )}

                {/* Session Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-2xl font-extrabold text-slate-900">{completedSessions.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-2xl font-extrabold text-primary">{scheduledSessions.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Upcoming</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-2xl font-extrabold text-slate-900">{pendingSessions.length}</p>
                    <p className="text-xs text-slate-500 font-medium">To Book</p>
                  </div>
                </div>

                {/* Book Session Button */}
                {pendingSessions.length > 0 && purchase.coach?.calComLink && (
                  <button
                    onClick={() => setBookingPurchaseId(showBooking ? null : purchase.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90"
                  >
                    <Calendar className="w-5 h-5" />
                    {showBooking ? 'Hide Calendar' : `Book Session ${completedSessions.length + scheduledSessions.length + 1} of ${purchase.sessionsTotal}`}
                  </button>
                )}

                {/* Direct link fallback */}
                {purchase.coach?.calComLink && (
                  <a
                    href={purchase.coach.calComLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open booking calendar in new tab
                  </a>
                )}
              </Card>

              {/* Cal.com Booking Embed */}
              {showBooking && purchase.coach?.calComLink && (
                <Card className="border-2 border-primary/30 overflow-hidden">
                  <div className="p-3 bg-primary/5 border-b border-primary/20">
                    <p className="text-sm font-medium text-slate-700">
                      Pick a time with {purchase.coach.displayName}
                    </p>
                  </div>
                  <iframe
                    src={getCalEmbedUrl(purchase.coach.calComLink, purchase.id)}
                    className="w-full border-0"
                    style={{ height: '650px' }}
                    title="Book coaching session"
                  />
                </Card>
              )}

              {/* Session List */}
              {purchase.sessions.length > 0 && (
                <Card className="border-2 border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Your Sessions</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {/* Scheduled sessions first */}
                    {scheduledSessions.map((session) => (
                      <div key={session.id} className="p-4 flex items-center justify-between bg-blue-50/50">
                        <div>
                          <p className="font-medium text-slate-900">Session #{session.sessionNumber}</p>
                          {session.scheduledAt && (
                            <p className="text-sm text-slate-600">
                              <Calendar className="w-3.5 h-3.5 inline mr-1" />
                              {formatDate(session.scheduledAt)}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Booked
                        </span>
                      </div>
                    ))}

                    {/* Completed sessions */}
                    {completedSessions.map((session) => (
                      <div key={session.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Session #{session.sessionNumber}</p>
                          {session.completedAt && (
                            <p className="text-sm text-slate-500">
                              Completed {new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      </div>
                    ))}

                    {/* Pending sessions */}
                    {pendingSessions.map((session) => (
                      <div key={session.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Session #{session.sessionNumber}</p>
                          <p className="text-sm text-slate-500">Not yet booked</p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
                          Available
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
