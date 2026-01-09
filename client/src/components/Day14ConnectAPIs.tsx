import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ArrowRight } from "lucide-react";

interface Day14ConnectAPIsProps {
  userIdea: string;
  onComplete: (data: { needsAPIs: boolean; apiConnected: string; connectionResult: string }) => void;
}

const API_EXAMPLES = [
  { name: "File Storage", examples: "Cloudinary, AWS S3", when: "Users upload images/files" },
  { name: "Payments", examples: "Stripe", when: "When ready to charge users" },
  { name: "External Data", examples: "Weather API, stock prices", when: "Need real-time data" },
  { name: "Social APIs", examples: "Twitter, LinkedIn", when: "Post on behalf of users" },
  { name: "Web Scraping", examples: "Bright Data", when: "Need data with no official API" },
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
        <h3 className="text-2xl font-extrabold text-slate-900">Connect External APIs</h3>
        <p className="text-slate-600 mt-1">Add external services if your app needs them. Many MVPs don't.</p>
      </Card>

      {/* Step 1: Do You Need APIs? */}
      {step === "decide" && (
        <>
          {/* Step 1a: Ask Replit First */}
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-lg mb-2 text-amber-900">Step 1: Ask Replit First</h4>
            <p className="text-sm text-amber-800 mb-3">
              Before adding any external API, check if Replit can do it natively. Just ask Replit Agent:
            </p>
            <div className="bg-white/60 p-3 rounded-lg mb-3">
              <p className="text-sm text-amber-900 italic">"Can you add file upload functionality?"</p>
            </div>
            <p className="text-sm text-amber-800">
              Replit has built-in support for file uploads, databases, secrets, and basic image handling. You might not need an external API at all.
            </p>
          </Card>

          {/* Step 1b: Valid Reasons for External APIs */}
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 2: Check If You Have a Valid Reason</h4>
            <p className="text-sm text-slate-600 mb-4">
              Only add an external API if Replit can't do it, or if an external service is significantly cheaper:
            </p>

            <div className="space-y-2 mb-4">
              {API_EXAMPLES.map((api) => (
                <div key={api.name} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{api.name}</p>
                    <p className="text-xs text-slate-500">{api.examples}</p>
                  </div>
                  <p className="text-xs text-slate-600 italic self-center">{api.when}</p>
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
                Yes, I need an external API
              </Button>
              <Button
                variant={needsAPIs === false ? "default" : "outline"}
                className="flex-1 h-14"
                onClick={() => setNeedsAPIs(false)}
              >
                No, Replit can handle it
              </Button>
            </div>
          </Card>

          {/* Web Scraping Explainer - separate card for those who need it */}
          <Card className="p-5 border-2 border-indigo-200 bg-indigo-50">
            <p className="font-bold text-sm text-indigo-900 mb-2">What's Web Scraping?</p>
            <p className="text-sm text-indigo-800 mb-2">
              Need data that doesn't have an API? Competitor prices, job listings, news articles? That's web scraping - programmatically extracting data from websites.
            </p>
            <p className="text-sm text-indigo-800">
              <strong>The catch:</strong> Websites block scrapers. Services like <strong>Bright Data</strong> handle the hard stuff (proxies, CAPTCHAs, rate limits) so you don't have to.
            </p>
          </Card>

          {/* Reassurance */}
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="font-medium text-sm text-slate-900">When in doubt, skip it</p>
            <p className="mt-1 text-sm text-slate-700">
              Most MVPs don't need extra APIs. If you're not sure, choose "No." You can always add APIs later.
            </p>
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
              I Connected It - Verify <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Verify / Complete */}
      {step === "verify" && (
        <>
          {needsAPIs ? (
            <>
              <Card className="p-6 border-2 border-slate-200 bg-white">
                <h4 className="font-bold text-lg text-slate-900 mb-2">API Connected!</h4>
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
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="font-bold text-lg text-slate-900 mb-2">Smart Choice!</h4>
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
