import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plug,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  XCircle,
  Zap
} from "lucide-react";

interface Day14ConnectAPIsProps {
  userIdea: string;
  onComplete: (data: { needsAPIs: boolean; apiConnected: string; connectionResult: string }) => void;
}

const API_EXAMPLES = [
  { name: "File Storage", examples: "Cloudinary, AWS S3", when: "Users upload images/files" },
  { name: "Payments", examples: "Stripe", when: "Charging users (covered Day 17)" },
  { name: "External Data", examples: "Weather API, stock prices", when: "Need real-time data" },
  { name: "Social APIs", examples: "Twitter, LinkedIn", when: "Post on behalf of users" },
];

export function Day14ConnectAPIs({ userIdea, onComplete }: Day14ConnectAPIsProps) {
  const [step, setStep] = useState<"decide" | "connect" | "verify">("decide");
  const [needsAPIs, setNeedsAPIs] = useState<boolean | null>(null);
  const [apiConnected, setApiConnected] = useState("");
  const [connectionResult, setConnectionResult] = useState("");

  const canProceedToConnect = needsAPIs !== null;
  const canProceedToVerify = needsAPIs === false || apiConnected.length >= 10;
  const canComplete = needsAPIs === false || connectionResult.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Plug className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Connect External APIs</h3>
            <p className="text-slate-600 mt-1">Add external services if your app needs them. Many MVPs don't.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Do You Need APIs? */}
      {step === "decide" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Does Your App Need External APIs?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Many AI SaaS products only need the OpenAI API (already set up). External APIs add complexity.
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-slate-700">Common APIs (only add if essential):</p>
              {API_EXAMPLES.map((api) => (
                <div key={api.name} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{api.name}</p>
                    <p className="text-xs text-slate-500">{api.examples}</p>
                  </div>
                  <p className="text-xs text-slate-600 italic">When: {api.when}</p>
                </div>
              ))}
            </div>

            {userIdea && (
              <p className="text-xs text-slate-500 mb-4">Your app: {userIdea}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant={needsAPIs === true ? "default" : "outline"}
                className="flex-1 h-14"
                onClick={() => setNeedsAPIs(true)}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Yes, I need an API
              </Button>
              <Button
                variant={needsAPIs === false ? "default" : "outline"}
                className="flex-1 h-14"
                onClick={() => setNeedsAPIs(false)}
              >
                <XCircle className="w-5 h-5 mr-2" />
                No, OpenAI is enough
              </Button>
            </div>
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Most MVPs don't need extra APIs</p>
                <p className="mt-1">
                  If you're not sure, choose "No." You can always add APIs later when you actually need them.
                </p>
              </div>
            </div>
          </Card>

          {canProceedToConnect && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep(needsAPIs ? "connect" : "verify")}
            >
              {needsAPIs ? "Connect an API" : "Skip APIs"} <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Connect the API */}
      {step === "connect" && needsAPIs && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Which ONE API Will You Add?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Pick ONE external API to integrate today. Just one - keep it simple.
            </p>
            <Textarea
              placeholder="I'm adding [API name] because my app needs to [do what]..."
              value={apiConnected}
              onChange={(e) => setApiConnected(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Integration Workflow</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Sign up for the service</p>
                  <p className="text-sm text-slate-600">Get your API key</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Add API key to Replit Secrets</p>
                  <p className="text-sm text-slate-600">Never put keys in code</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Tell Claude Code to integrate it</p>
                  <p className="text-sm text-slate-600">"Add [API] to do [thing]. The API key is in secrets as [KEY_NAME]"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Test it!</p>
                  <p className="text-sm text-slate-600">Make sure data flows correctly</p>
                </div>
              </div>
            </div>
          </Card>

          {canProceedToVerify && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("verify")}
            >
              <CheckCircle2 className="w-5 h-5" />
              I Connected It - Verify
            </Button>
          )}
        </>
      )}

      {/* Step 3: Verify / Complete */}
      {step === "verify" && (
        <>
          {needsAPIs ? (
            <>
              <Card className="p-6 border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <h4 className="font-bold text-lg text-slate-900">API Connected!</h4>
                </div>
                <p className="text-slate-700">
                  You've extended your app's capabilities beyond just AI. Your app now integrates with external services.
                </p>
              </Card>

              <Card className="p-6 border-2 border-slate-200">
                <h4 className="font-bold text-lg mb-2 text-slate-900">Verify It Works</h4>
                <p className="text-sm text-slate-600 mb-4">
                  You tested the integration. What happened?
                </p>
                <Textarea
                  placeholder="I tested [API] by [doing what]. The result was [describe what happened]. It works/doesn't work because..."
                  value={connectionResult}
                  onChange={(e) => setConnectionResult(e.target.value)}
                  className="min-h-[120px]"
                />
              </Card>
            </>
          ) : (
            <Card className="p-6 border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-lg text-slate-900">Smart Choice!</h4>
              </div>
              <p className="text-slate-700">
                You decided to keep your MVP simple by not adding unnecessary APIs.
                This means less complexity, fewer potential issues, and faster development.
                You can always add APIs later when you actually need them.
              </p>
            </Card>
          )}

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                needsAPIs: needsAPIs || false,
                apiConnected: needsAPIs ? apiConnected : "None needed",
                connectionResult: needsAPIs ? connectionResult : "Decided to keep MVP simple without extra APIs"
              })}
            >
              Save & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
