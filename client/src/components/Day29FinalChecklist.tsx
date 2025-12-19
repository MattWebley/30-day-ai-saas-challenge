import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Rocket,
  PartyPopper,
  Code,
  CreditCard,
  Mail,
  Users,
  Globe,
  Shield,
  Smartphone,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day29FinalChecklistProps {
  dayId: number;
  onComplete: () => void;
}

const LAUNCH_CATEGORIES = [
  {
    id: "core",
    label: "Core Product",
    icon: Code,
    items: [
      { id: "c1", text: "Core feature works end-to-end", critical: true },
      { id: "c2", text: "User can complete the main job-to-be-done", critical: true },
      { id: "c3", text: "Data is saved and persisted correctly", critical: true },
      { id: "c4", text: "Error states are handled gracefully", critical: false },
    ],
  },
  {
    id: "auth",
    label: "Authentication",
    icon: Users,
    items: [
      { id: "a1", text: "Users can sign up", critical: true },
      { id: "a2", text: "Users can log in", critical: true },
      { id: "a3", text: "Users can reset password", critical: true },
      { id: "a4", text: "Users can log out", critical: true },
      { id: "a5", text: "Protected routes redirect to login", critical: false },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    items: [
      { id: "p1", text: "Test payment works in Stripe", critical: true },
      { id: "p2", text: "Subscription is created correctly", critical: true },
      { id: "p3", text: "User gets premium access after payment", critical: true },
      { id: "p4", text: "Cancel subscription works", critical: false },
      { id: "p5", text: "Webhook handles payment events", critical: false },
    ],
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    items: [
      { id: "e1", text: "Welcome email sends", critical: false },
      { id: "e2", text: "Password reset email sends", critical: true },
      { id: "e3", text: "Emails don't go to spam", critical: false },
      { id: "e4", text: "Unsubscribe link works", critical: false },
    ],
  },
  {
    id: "landing",
    label: "Landing Page",
    icon: Globe,
    items: [
      { id: "l1", text: "Headline is clear and compelling", critical: true },
      { id: "l2", text: "CTA button is obvious", critical: true },
      { id: "l3", text: "Page loads in under 3 seconds", critical: false },
      { id: "l4", text: "Social proof is visible", critical: false },
      { id: "l5", text: "Pricing is clear", critical: true },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    items: [
      { id: "m1", text: "App is usable on phone", critical: true },
      { id: "m2", text: "No horizontal scrolling", critical: true },
      { id: "m3", text: "Touch targets are tappable", critical: false },
      { id: "m4", text: "Text is readable without zooming", critical: false },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    items: [
      { id: "s1", text: "HTTPS is enforced", critical: true },
      { id: "s2", text: "Passwords are hashed", critical: true },
      { id: "s3", text: "API keys are not exposed", critical: true },
      { id: "s4", text: "Users can only access their own data", critical: true },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: Zap,
    items: [
      { id: "pf1", text: "App loads without errors", critical: true },
      { id: "pf2", text: "No console errors in production", critical: false },
      { id: "pf3", text: "Images are optimized", critical: false },
      { id: "pf4", text: "Loading states exist for slow operations", critical: false },
    ],
  },
];

export function Day29FinalChecklist({ dayId, onComplete }: Day29FinalChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showCertificate, setShowCertificate] = useState(false);
  const { toast } = useToast();

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const totalItems = LAUNCH_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.size;
  const criticalItems = LAUNCH_CATEGORIES.flatMap(cat => cat.items.filter(i => i.critical));
  const criticalChecked = criticalItems.filter(i => checkedItems.has(i.id)).length;
  const allCriticalPassed = criticalChecked === criticalItems.length;

  const getProgress = () => Math.round((checkedCount / totalItems) * 100);

  const getProgressColor = () => {
    const progress = getProgress();
    if (progress >= 90) return "green";
    if (progress >= 70) return "yellow";
    return "slate";
  };

  const handleCertify = () => {
    if (allCriticalPassed) {
      setShowCertificate(true);
      toast({
        title: "Launch Certified!",
        description: "You're ready to launch tomorrow!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">The FINAL Checklist</h3>
            <p className="text-slate-600 mt-1">
              Everything you need before you press "launch" tomorrow.
            </p>
          </div>
        </div>
      </Card>

      {!showCertificate ? (
        <>
          {/* Progress */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Launch Readiness</span>
              <span className={`font-bold ${
                getProgressColor() === "green" ? "text-green-600" :
                getProgressColor() === "yellow" ? "text-yellow-600" :
                "text-slate-600"
              }`}>{getProgress()}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  getProgressColor() === "green" ? "bg-green-500" :
                  getProgressColor() === "yellow" ? "bg-yellow-500" :
                  "bg-slate-400"
                }`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-green-600 font-medium">
                ✓ {checkedCount}/{totalItems} complete
              </span>
              <span className={`font-medium ${allCriticalPassed ? "text-green-600" : "text-red-600"}`}>
                {allCriticalPassed ? "✓" : "!"} {criticalChecked}/{criticalItems.length} critical items
              </span>
            </div>
          </Card>

          {/* Critical Warning */}
          {!allCriticalPassed && (
            <Card className="p-4 border-2 border-red-300 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold text-red-800">
                    {criticalItems.length - criticalChecked} critical item{criticalItems.length - criticalChecked > 1 ? "s" : ""} remaining
                  </div>
                  <div className="text-sm text-red-700">
                    Complete all critical items (marked with ⚠) to certify launch readiness.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Checklist Categories */}
          {LAUNCH_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const categoryChecked = category.items.filter(i => checkedItems.has(i.id)).length;
            const allChecked = categoryChecked === category.items.length;

            return (
              <Card key={category.id} className={`p-6 border-2 ${
                allChecked ? "border-green-300 bg-green-50/30" : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${allChecked ? "text-green-600" : "text-slate-600"}`} />
                    <h4 className="font-bold text-slate-900">{category.label}</h4>
                  </div>
                  <span className={`text-sm font-medium ${allChecked ? "text-green-600" : "text-slate-500"}`}>
                    {categoryChecked}/{category.items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isChecked = checkedItems.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isChecked
                            ? "border-green-300 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isChecked ? "border-green-500 bg-green-500" : "border-slate-300"
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          {item.critical && !isChecked && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">⚠</span>
                          )}
                          <span className={isChecked ? "text-green-700 line-through" : "text-slate-700"}>
                            {item.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {/* Certify Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!allCriticalPassed}
            onClick={handleCertify}
          >
            <Rocket className="w-5 h-5 mr-2" />
            {allCriticalPassed ? "Certify Launch Ready" : `Complete ${criticalItems.length - criticalChecked} more critical items`}
          </Button>
        </>
      ) : (
        <>
          {/* Launch Certificate */}
          <Card className="p-8 border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-center">
            <div className="mb-6">
              <PartyPopper className="w-16 h-16 mx-auto text-green-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              LAUNCH CERTIFIED
            </div>
            <div className="text-lg text-slate-600 mb-6">
              Your app has passed all critical checks
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-green-200 mb-6">
              <div className="text-sm text-slate-500 mb-2">Launch Readiness Score</div>
              <div className="text-5xl font-extrabold text-green-600">{getProgress()}%</div>
              <div className="text-sm text-slate-500 mt-2">
                {checkedCount} of {totalItems} items complete
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Core", icon: Code },
                { label: "Auth", icon: Users },
                { label: "Payments", icon: CreditCard },
                { label: "Security", icon: Shield },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>

            <div className="text-slate-700 font-medium">
              You are ready to launch tomorrow.
            </div>
          </Card>

          {/* Tomorrow's Plan */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Tomorrow's Launch Plan</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">1</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Final smoke test</div>
                  <div className="text-sm text-slate-500">Quick run-through of the happy path</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">2</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Set production environment</div>
                  <div className="text-sm text-slate-500">Stripe to live mode, final secrets check</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">3</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Share with the world</div>
                  <div className="text-sm text-slate-500">Post on Twitter, Reddit, LinkedIn, Indie Hackers</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">You did it.</p>
                <p className="text-sm text-slate-500">Tomorrow, you become a founder with a live product.</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 29
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      {!showCertificate && (
        <Card className="p-6 border-2 border-amber-200 bg-amber-50">
          <h4 className="font-bold text-amber-900 mb-3">The Night Before Launch</h4>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Perfect is the enemy of shipped.</strong> Launch with what you have.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>You can fix things later.</strong> You can't learn until it's live.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Sleep tonight.</strong> You'll need energy for launch day.</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
