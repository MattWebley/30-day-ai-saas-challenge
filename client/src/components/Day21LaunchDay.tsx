import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  PartyPopper,
  Share2,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day21LaunchDayProps {
  appName: string;
  onComplete: () => void;
}

const PRE_LAUNCH_CHECKS = [
  { id: "works", text: "Core feature works end-to-end", critical: true },
  { id: "auth", text: "Login/logout works correctly", critical: true },
  { id: "mobile", text: "Works on mobile (tested)", critical: true },
  { id: "errors", text: "Error handling - no crashes", critical: true },
  { id: "data", text: "User data saves and loads", critical: true },
  { id: "speed", text: "Loads in under 3 seconds", critical: false },
  { id: "favicon", text: "Favicon and title set", critical: false },
  { id: "polish", text: "Looks professional enough", critical: false },
];

const LAUNCH_PLACES = [
  { id: "friends", text: "Friends & Family (easy first users)" },
  { id: "twitter", text: "Twitter/X (tech-friendly)" },
  { id: "linkedin", text: "LinkedIn (professional)" },
  { id: "reddit", text: "Reddit (relevant subreddits)" },
  { id: "ph", text: "Product Hunt (when ready)" },
  { id: "communities", text: "Niche communities" },
];

const MONTHLY_COSTS = [
  { id: "domain", name: "Domain", cost: "$1/month", note: "~$12/year" },
  { id: "hosting", name: "Replit", cost: "$0-25/month", note: "Free tier available" },
  { id: "database", name: "Database", cost: "$0-5/month", note: "Neon free tier" },
  { id: "ai", name: "OpenAI API", cost: "$5-20/month", note: "Pay per use" },
  { id: "email", name: "Resend", cost: "$0/month", note: "3k emails free" },
];

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [prelaunchDone, setPrelaunchDone] = useState<Set<string>>(new Set());
  const [launchPlaces, setLaunchPlaces] = useState<Set<string>>(new Set());
  const [hasLaunched, setHasLaunched] = useState(false);
  const { toast } = useToast();

  const togglePrelaunch = (id: string) => {
    const newDone = new Set(prelaunchDone);
    if (newDone.has(id)) newDone.delete(id);
    else newDone.add(id);
    setPrelaunchDone(newDone);
  };

  const toggleLaunchPlace = (id: string) => {
    const newPlaces = new Set(launchPlaces);
    if (newPlaces.has(id)) newPlaces.delete(id);
    else newPlaces.add(id);
    setLaunchPlaces(newPlaces);
  };

  const criticalChecks = PRE_LAUNCH_CHECKS.filter(c => c.critical);
  const criticalDone = criticalChecks.filter(c => prelaunchDone.has(c.id)).length;
  const allCriticalDone = criticalDone === criticalChecks.length;

  const handleLaunch = () => {
    setHasLaunched(true);
    toast({
      title: "CONGRATULATIONS!",
      description: "You did it! Your SaaS is LIVE!",
    });
  };

  const canComplete = hasLaunched && launchPlaces.size >= 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Launch Day</h3>
            <p className="text-slate-600 mt-1">This is it. Time to share your creation with the world.</p>
          </div>
        </div>
      </Card>

      {/* Pre-Launch Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Pre-Launch Checklist</h4>
        <p className="text-sm text-slate-600 mb-4">Make sure the critical items are done before going live:</p>

        <div className="space-y-2">
          {PRE_LAUNCH_CHECKS.map((check) => (
            <div
              key={check.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-100 ${
                check.critical ? "bg-orange-50" : "bg-slate-50"
              }`}
              onClick={() => togglePrelaunch(check.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={prelaunchDone.has(check.id)}
                  onCheckedChange={() => togglePrelaunch(check.id)}
                />
                <span className="text-sm text-slate-700">{check.text}</span>
              </div>
              {check.critical && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Critical</span>
              )}
            </div>
          ))}
        </div>

        {!allCriticalDone && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Complete all critical items before launching. {criticalDone}/{criticalChecks.length} done.
            </p>
          </div>
        )}
      </Card>

      {/* Monthly Costs */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h4 className="font-bold text-lg text-slate-900">Expected Monthly Costs</h4>
        </div>
        <div className="space-y-2">
          {MONTHLY_COSTS.map((cost) => (
            <div key={cost.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
              <span className="text-sm text-slate-700">{cost.name}</span>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">{cost.cost}</span>
                <span className="text-xs text-slate-500 ml-2">{cost.note}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="font-medium text-slate-900">Estimated Total</span>
          <span className="font-bold text-green-600">$6-50/month</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Start with free tiers. Only upgrade when you have paying users.
        </p>
      </Card>

      {/* Launch Button */}
      {allCriticalDone && !hasLaunched && (
        <Card className="p-6 border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="text-center">
            <h4 className="font-bold text-xl mb-2 text-slate-900">Ready to Launch?</h4>
            <p className="text-slate-600 mb-6">
              Your pre-launch checklist is complete. It's time to go live!
            </p>
            <Button
              size="lg"
              className="h-16 px-12 text-xl font-bold gap-3 bg-orange-500 hover:bg-orange-600"
              onClick={handleLaunch}
            >
              <Rocket className="w-6 h-6" />
              LAUNCH {appName || "MY APP"}
            </Button>
          </div>
        </Card>
      )}

      {/* Post-Launch: Share */}
      {hasLaunched && (
        <>
          <Card className="p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-4">
              <PartyPopper className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-bold text-xl text-green-800">YOU DID IT!</h4>
                <p className="text-green-700">Your SaaS is now LIVE. Celebrate this moment!</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-lg text-slate-900">Share It!</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Where will you announce your launch? Pick at least 2:
            </p>
            <div className="space-y-2">
              {LAUNCH_PLACES.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
                  onClick={() => toggleLaunchPlace(place.id)}
                >
                  <Checkbox
                    checked={launchPlaces.has(place.id)}
                    onCheckedChange={() => toggleLaunchPlace(place.id)}
                  />
                  <span className="text-sm text-slate-700">{place.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-lg text-blue-900">What's Next?</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Week 1:</strong> Get 10 people to try it. Ask for feedback.</li>
              <li>• <strong>Week 2:</strong> Fix the top 3 issues users mention.</li>
              <li>• <strong>Week 3:</strong> Add the #1 requested feature.</li>
              <li>• <strong>Month 2:</strong> Start thinking about pricing.</li>
            </ul>
            <p className="text-sm text-blue-700 mt-4 font-medium">
              Remember: Shipping beats perfect. You can always improve it!
            </p>
          </Card>

          {/* Coaching CTA */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <h4 className="font-bold text-lg mb-2 text-purple-900">Ready to Build a Business?</h4>
            <p className="text-sm text-purple-700 mb-4">
              You've built your SaaS. Now learn how to get paying customers, price it right,
              and turn it into a real business.
            </p>
            <Button variant="outline" className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
              <ExternalLink className="w-4 h-4" />
              Book a Strategy Call
            </Button>
          </Card>
        </>
      )}

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
          onClick={onComplete}
        >
          <CheckCircle2 className="w-5 h-5" />
          Complete the Challenge!
        </Button>
      )}
    </div>
  );
}
