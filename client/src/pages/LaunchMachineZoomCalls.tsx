import { LaunchMachineLayout } from "@/components/layout/LaunchMachineLayout";
import { useLaunchMachineContent } from "@/hooks/useLaunchMachine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Download, ExternalLink } from "lucide-react";

export default function LaunchMachineZoomCalls() {
  const { data, isLoading } = useLaunchMachineContent();

  if (isLoading) {
    return (
      <LaunchMachineLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LaunchMachineLayout>
    );
  }

  if (!data?.hasAccess) {
    return (
      <LaunchMachineLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Required</h1>
          <p className="text-slate-600">You need AI SaaS Launch Machine access to view this page.</p>
        </div>
      </LaunchMachineLayout>
    );
  }

  const calls = data?.zoomCalls || [];
  const upcomingCalls = calls.filter((c: any) => !c.isPast);
  const pastCalls = calls.filter((c: any) => c.isPast);
  const nextCall = upcomingCalls.length > 0 ? upcomingCalls[upcomingCalls.length - 1] : null;

  return (
    <LaunchMachineLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Zoom Calls</h1>
          <p className="text-slate-600 mt-1">Live group calls and past recordings</p>
        </div>

        {/* Next Call */}
        {nextCall && (
          <Card className="p-6 border-2 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">Next Call</h2>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{nextCall.title}</h3>
            <p className="text-slate-700 mb-4">
              {new Date(nextCall.scheduledAt).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}{" "}
              at{" "}
              {new Date(nextCall.scheduledAt).toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit", timeZoneName: "short",
              })}
            </p>
            <div className="flex gap-3">
              {nextCall.joinUrl && (
                <a href={nextCall.joinUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    <ExternalLink className="w-4 h-4" /> Join Call
                  </Button>
                </a>
              )}
              <a href={`/api/slm/zoom-calls/${nextCall.id}/ics`} download>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Add to Calendar
                </Button>
              </a>
            </div>
          </Card>
        )}

        {nextCall === null && upcomingCalls.length === 0 && (
          <Card className="p-6 border-2 border-slate-200 text-center">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">No upcoming calls scheduled yet. Check back soon!</p>
          </Card>
        )}

        {/* Upcoming calls (excluding next) */}
        {upcomingCalls.length > 1 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingCalls.slice(0, -1).reverse().map((call: any) => (
                <Card key={call.id} className="p-4 border-2 border-slate-200 flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{call.title}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(call.scheduledAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}{" "}
                      at {new Date(call.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <a href={`/api/slm/zoom-calls/${call.id}/ics`} download>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="w-3 h-3" /> .ics
                    </Button>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Recordings */}
        {pastCalls.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Past Recordings</h2>
            <div className="space-y-3">
              {pastCalls.map((call: any) => (
                <Card key={call.id} className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-4">
                    <Play className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{call.title}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(call.scheduledAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                      </p>
                    </div>
                    {call.recordingUrl && (
                      <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Play className="w-3 h-3" /> Watch
                        </Button>
                      </a>
                    )}
                  </div>
                  {call.recordingUrl && call.recordingUrl.includes("loom.com") && (
                    <div className="mt-3 relative" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={call.recordingUrl.replace("/share/", "/embed/")}
                        className="absolute inset-0 w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </LaunchMachineLayout>
  );
}
