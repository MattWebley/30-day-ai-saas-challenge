import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Check,
  Rocket,
  Shield,
  CreditCard,
  Globe,
  Image,
  FileText,
  AlertTriangle,
  Lock,
  Mail,
  BarChart,
  Smartphone,
  ExternalLink
} from "lucide-react";

interface Day20GoingLiveProps {
  appName: string;
  onComplete: (data: { checklist: Record<string, boolean> }) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  why: string;
  icon: React.ElementType;
  category: "essential" | "legal" | "payments" | "polish";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ESSENTIAL
  {
    id: "custom-domain",
    title: "Custom Domain",
    description: "Connect your own domain (yoursaas.com instead of .replit.app)",
    why: "Looks professional. Builds trust. You already own it from Day 4.",
    icon: Globe,
    category: "essential",
  },
  {
    id: "ssl-https",
    title: "SSL Certificate (HTTPS)",
    description: "Make sure your site shows the padlock icon",
    why: "Non-negotiable. Browsers warn users about non-HTTPS sites.",
    icon: Lock,
    category: "essential",
  },
  {
    id: "favicon",
    title: "Favicon",
    description: "The tiny icon in browser tabs",
    why: "Without it, your site looks unfinished. Takes 2 minutes to add.",
    icon: Image,
    category: "essential",
  },
  {
    id: "meta-tags",
    title: "Meta Tags (Title & Description)",
    description: "What shows when people share your link",
    why: "Controls how your site appears in Google and social shares.",
    icon: FileText,
    category: "essential",
  },
  {
    id: "mobile-works",
    title: "Mobile Works Properly",
    description: "Test on an actual phone, not just browser resize",
    why: "50%+ of traffic is mobile. Broken mobile = lost customers.",
    icon: Smartphone,
    category: "essential",
  },

  // LEGAL
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    description: "What data you collect and how you use it",
    why: "Legally required. App stores and payment processors require it.",
    icon: Shield,
    category: "legal",
  },
  {
    id: "terms-of-service",
    title: "Terms of Service",
    description: "Rules for using your app",
    why: "Protects you legally. Defines what users can/can't do.",
    icon: FileText,
    category: "legal",
  },
  {
    id: "cookie-notice",
    title: "Cookie Notice (if applicable)",
    description: "Banner about cookies if you use analytics/tracking",
    why: "Required in EU/UK. Many regions have similar laws now.",
    icon: AlertTriangle,
    category: "legal",
  },
  {
    id: "earnings-disclaimer",
    title: "Earnings Disclaimer (if applicable)",
    description: "If you make income claims, add a disclaimer",
    why: "Required if you show income potential or results.",
    icon: Shield,
    category: "legal",
  },

  // PAYMENTS
  {
    id: "stripe-connected",
    title: "Stripe Account Connected",
    description: "Payment processing ready to accept money",
    why: "Can't get paid without it. Takes ~10 minutes to set up.",
    icon: CreditCard,
    category: "payments",
  },
  {
    id: "pricing-page",
    title: "Pricing Page Works",
    description: "Users can see prices and click to buy",
    why: "Test the entire flow. Click buy, see Stripe checkout appear.",
    icon: CreditCard,
    category: "payments",
  },
  {
    id: "test-purchase",
    title: "Test Purchase Made",
    description: "Actually buy your own product with Stripe test mode",
    why: "Find issues before real customers do. Use 4242 4242 4242 4242.",
    icon: CreditCard,
    category: "payments",
  },

  // POLISH
  {
    id: "welcome-email",
    title: "Welcome Email Working",
    description: "New users receive an email when they sign up",
    why: "First impression. Confirms their account works.",
    icon: Mail,
    category: "polish",
  },
  {
    id: "error-pages",
    title: "Error Pages Don't Look Broken",
    description: "404 and error pages have your branding",
    why: "Users WILL hit errors. Don't show ugly default pages.",
    icon: AlertTriangle,
    category: "polish",
  },
  {
    id: "analytics",
    title: "Analytics Installed",
    description: "Know how many people visit and what they do",
    why: "Can't improve what you can't measure. Use Plausible or GA.",
    icon: BarChart,
    category: "polish",
  },
];

const CATEGORY_INFO = {
  essential: { label: "Essential", color: "bg-red-100 text-red-700", description: "Must have before going live" },
  legal: { label: "Legal", color: "bg-amber-100 text-amber-700", description: "Protect yourself legally" },
  payments: { label: "Payments", color: "bg-green-100 text-green-700", description: "Get paid for your work" },
  polish: { label: "Polish", color: "bg-blue-100 text-blue-700", description: "Professional touches" },
};

export function Day20GoingLive({ appName, onComplete }: Day20GoingLiveProps) {
  const [step, setStep] = useState<"intro" | "checklist" | "complete">("intro");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const essentialItems = CHECKLIST_ITEMS.filter((item) => item.category === "essential");
  const essentialComplete = essentialItems.every((item) => checklist[item.id]);
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Going Live</h3>
        <p className="text-slate-600 mt-1">
          Everything you need to check BEFORE accepting your first payment.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-amber-100 bg-amber-50">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">Before You Take Money...</h4>
                <p className="text-slate-700">
                  There are a few things you NEED to have in place before you can legally and safely
                  accept payments. Miss these and you're asking for trouble.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">This Checklist Covers:</h4>
            <div className="space-y-3">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
                    {info.label}
                  </span>
                  <span className="text-slate-600">{info.description}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Important Note</h4>
            <p className="text-slate-700">
              This checklist tells you <strong>WHAT</strong> you need - not HOW to do each item.
              For the how, ask Claude Code or Replit Agent. They'll walk you through each step.
            </p>
            <p className="text-slate-600 mt-3 text-sm">
              Example prompt: "Help me add a privacy policy page to my app"
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("checklist")}
          >
            Start the Checklist <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Checklist */}
      {step === "checklist" && (
        <>
          {/* Progress */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">Progress</span>
              <span className="text-slate-600">{completedCount}/{CHECKLIST_ITEMS.length} complete</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          {/* Categories */}
          {(["essential", "legal", "payments", "polish"] as const).map((category) => {
            const info = CATEGORY_INFO[category];
            const items = CHECKLIST_ITEMS.filter((item) => item.category === category);
            const categoryComplete = items.filter((item) => checklist[item.id]).length;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
                      {info.label}
                    </span>
                    <span className="text-slate-500 text-sm">{info.description}</span>
                  </div>
                  <span className="text-slate-600 text-sm">{categoryComplete}/{items.length}</span>
                </div>

                {items.map((item) => {
                  const isChecked = checklist[item.id];
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.id}
                      className={`p-4 border-2 cursor-pointer transition-all ${
                        isChecked
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isChecked
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <Icon className={`w-5 h-5 mt-0.5 ${isChecked ? "text-green-600" : "text-slate-500"}`} />
                            <div>
                              <h4 className={`font-bold ${isChecked ? "text-green-700" : "text-slate-900"}`}>
                                {item.title}
                              </h4>
                              <p className="text-slate-600 text-sm mt-0.5">{item.description}</p>
                              <p className="text-slate-500 text-sm mt-1 italic">{item.why}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })}

          {/* Ready to complete? */}
          {essentialComplete ? (
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="text-center">
                <Rocket className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-slate-900 mb-2">Essentials Complete!</h4>
                <p className="text-slate-700 mb-4">
                  You've checked off all the must-haves. The rest are recommended but not required.
                </p>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => setStep("complete")}
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 border-2 border-amber-100 bg-amber-50">
              <p className="text-amber-800 text-center">
                <strong>Complete all Essential items</strong> before moving on.
                These are non-negotiable for a professional launch.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">You're Ready to Go Live!</h4>
              <p className="text-slate-700">
                {appName || "Your app"} is set up to accept real customers and real money.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What You Checked Off</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                <p className="text-slate-600">Items Complete</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-slate-900">{CHECKLIST_ITEMS.length - completedCount}</p>
                <p className="text-slate-600">Optional Items Left</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Tomorrow: The Money</h4>
            <p className="text-slate-700">
              Day 21 is about the numbers. How much can you actually make?
              How many customers do you need? And what comes after the challenge.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({ checklist })}
          >
            Complete Day 20 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
