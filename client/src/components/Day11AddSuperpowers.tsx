import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Check,
  Zap,
  CreditCard,
  Database,
  Plug,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface Day11AddSuperpowersProps {
  userIdea: string;
  onComplete: (data: {
    superpowerNeeded: string;
    superpowerAdded: string;
    noSuperpowerNeeded: boolean;
  }) => void;
}

const SUPERPOWERS = [
  {
    id: "payments",
    name: "Payments (Stripe)",
    icon: CreditCard,
    description: "Accept payments from customers",
    when: "You're charging money for your product",
  },
  {
    id: "scraping",
    name: "Web Scraping (Bright Data)",
    icon: Database,
    description: "Get data from other websites",
    when: "You need external data that isn't available via API",
  },
  {
    id: "integration",
    name: "Third-Party Integration",
    icon: Plug,
    description: "Connect to Slack, Google Sheets, etc.",
    when: "Your app needs to work with other tools",
  },
  {
    id: "none",
    name: "None Needed",
    icon: Check,
    description: "My app works without external APIs",
    when: "Replit handles everything you need",
  },
];

export function Day11AddSuperpowers({ userIdea, onComplete }: Day11AddSuperpowersProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"check" | "choose" | "setup" | "done">("check");
  const [askedReplit, setAskedReplit] = useState(false);
  const [selectedSuperpower, setSelectedSuperpower] = useState<string | null>(null);
  const [setupNotes, setSetupNotes] = useState("");

  const handleComplete = () => {
    onComplete({
      superpowerNeeded: selectedSuperpower || "none",
      superpowerAdded: setupNotes,
      noSuperpowerNeeded: selectedSuperpower === "none",
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Check with Replit First */}
      {step === "check" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900">Before Adding ANY External API</h4>
                <p className="text-amber-800 mt-1">
                  Ask Replit Agent first: "Can you help me do [thing] without an external service?"
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  You'd be surprised how much Replit can do natively - database, auth, file storage, and more.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">Did you ask Replit first?</h4>
            <p className="text-slate-700 mb-4">
              Think about what your app needs. Does it need payments? External data? Integrations with other tools?
            </p>
            <p className="text-slate-700 mb-6">
              For each thing you think you need, ask Replit "Can you do this without an external API?"
            </p>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg mb-6">
              <input
                type="checkbox"
                id="askedReplit"
                checked={askedReplit}
                onChange={(e) => setAskedReplit(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="askedReplit" className="text-slate-700 font-medium">
                Yes, I've checked what Replit can do natively
              </label>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("choose")}
            disabled={!askedReplit}
          >
            Continue <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Choose Your Superpower */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-2">What superpower does your app need?</h4>
            <p className="text-slate-600 mb-6">
              Only add what you actually need. Every external API is another thing that can break.
            </p>

            <div className="space-y-3">
              {SUPERPOWERS.map((sp) => {
                const Icon = sp.icon;
                const isSelected = selectedSuperpower === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedSuperpower(sp.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{sp.name}</p>
                        <p className="text-slate-600 text-sm">{sp.description}</p>
                        <p className="text-slate-500 text-xs mt-1">Use when: {sp.when}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep(selectedSuperpower === "none" ? "done" : "setup")}
            disabled={!selectedSuperpower}
          >
            {selectedSuperpower === "none" ? "Continue Without APIs" : "Set Up This API"} <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Setup Instructions */}
      {step === "setup" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">
                  Setting Up: {SUPERPOWERS.find(s => s.id === selectedSuperpower)?.name}
                </h4>
              </div>
            </div>

            {selectedSuperpower === "payments" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-900 mb-2">Stripe Setup Steps</p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li>Sign up at stripe.com</li>
                    <li>Get your API keys (use test mode first!)</li>
                    <li>Add to Replit Secrets: STRIPE_SECRET_KEY</li>
                    <li>Tell Claude Code: "Add Stripe checkout for [your pricing]"</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedSuperpower === "scraping" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-900 mb-2">Web Scraping Notes</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Only scrape public data</li>
                    <li>Respect rate limits</li>
                    <li>Check the site's terms of service</li>
                    <li>Bright Data is a reliable service for this</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedSuperpower === "integration" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-900 mb-2">Integration Setup</p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li>Google "[service name] API documentation"</li>
                    <li>Sign up for developer access</li>
                    <li>Get your API key</li>
                    <li>Add to Replit Secrets</li>
                    <li>Tell Claude Code what you want to integrate</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <label className="text-slate-700 font-medium">
                What did you set up? (Notes for yourself)
              </label>
              <Textarea
                placeholder="e.g., Added Stripe in test mode, checkout works for $29/month plan..."
                value={setupNotes}
                onChange={(e) => setSetupNotes(e.target.value)}
                className="min-h-[100px] bg-white"
              />
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("done")}
            disabled={setupNotes.length < 10}
          >
            I've Set It Up <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">
                  {selectedSuperpower === "none" ? "No External APIs Needed!" : "Superpower Added!"}
                </h4>
                <p className="text-green-700">
                  {selectedSuperpower === "none"
                    ? "Your app works with what Replit provides. That's actually great - simpler is better."
                    : "Your app can now do things it couldn't do before."}
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
          >
            Complete Day 11 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
