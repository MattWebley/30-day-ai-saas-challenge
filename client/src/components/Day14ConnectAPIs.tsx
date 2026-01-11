import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Check, Shield, Zap } from "lucide-react";

interface Day14ConnectAPIsProps {
  userIdea: string;
  appName: string;
  onComplete: (data: {
    needsAPIs: boolean;
    apiConnected: string;
    connectionResult: string;
    hasAuth: boolean;
    authStatus: string;
  }) => void;
}

const API_EXAMPLES = [
  { name: "File Storage", examples: "Cloudinary, AWS S3", when: "Users upload images/files" },
  { name: "Payments", examples: "Stripe", when: "When ready to charge users" },
  { name: "External Data", examples: "Weather API, stock prices", when: "Need real-time data" },
  { name: "Social APIs", examples: "Twitter, LinkedIn", when: "Post on behalf of users" },
  { name: "Web Scraping", examples: "Bright Data", when: "Need data with no official API" },
];

export function Day14ConnectAPIs({ userIdea, appName, onComplete }: Day14ConnectAPIsProps) {
  // API state
  const [needsAPIs, setNeedsAPIs] = useState<boolean | null>(null);
  const [apiConnected, setApiConnected] = useState("");
  const [connectionResult, setConnectionResult] = useState("");
  const [apiSectionComplete, setApiSectionComplete] = useState(false);

  // Auth state
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);

  // Completion logic
  const apiDone = apiSectionComplete;
  const authDone = hasAuth !== null;
  const canComplete = apiDone && authDone;

  const handleApiComplete = () => {
    setApiSectionComplete(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-extrabold text-slate-900">Add Superpowers</h3>
        </div>
        <p className="text-slate-600">Two quick tasks: external APIs (if needed) + user authentication.</p>
      </Card>

      {/* ============================================ */}
      {/* PART 1: EXTERNAL APIs */}
      {/* ============================================ */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${apiDone ? 'bg-green-500' : 'bg-primary'}`}>
            {apiDone ? <Check className="w-5 h-5" /> : '1'}
          </div>
          <h4 className="font-bold text-lg text-slate-900">External APIs</h4>
          {apiDone && <span className="text-sm text-green-600 font-medium">Done!</span>}
        </div>

        {!apiSectionComplete ? (
          <div className="space-y-4 pl-11">
            {/* Ask Replit First */}
            <Card className="p-5 border-2 border-amber-200 bg-amber-50">
              <h5 className="font-bold text-amber-900 mb-2">Ask Replit First</h5>
              <p className="text-sm text-amber-800 mb-2">
                Before adding any external API, check if Replit can do it natively:
              </p>
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-sm text-amber-900 italic">"Can you add file upload functionality?"</p>
              </div>
            </Card>

            {/* API Examples */}
            <Card className="p-5 border-2 border-slate-200">
              <h5 className="font-bold text-slate-900 mb-3">Valid Reasons for External APIs</h5>
              <div className="space-y-2 mb-4">
                {API_EXAMPLES.map((api) => (
                  <div key={api.name} className="flex gap-3 p-2 bg-slate-50 rounded-lg">
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
                  className="flex-1"
                  onClick={() => setNeedsAPIs(true)}
                >
                  Yes, I need an API
                </Button>
                <Button
                  variant={needsAPIs === false ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNeedsAPIs(false)}
                >
                  No, Replit handles it
                </Button>
              </div>
            </Card>

            {/* If they need an API, show the fields */}
            {needsAPIs === true && (
              <Card className="p-5 border-2 border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2">Which API?</h5>
                <Textarea
                  placeholder="I'm adding [API name] because..."
                  value={apiConnected}
                  onChange={(e) => setApiConnected(e.target.value)}
                  className="min-h-[80px] mb-3"
                />
                <h5 className="font-bold text-slate-900 mb-2">Did it work?</h5>
                <Textarea
                  placeholder="I tested it by... and it worked/didn't work because..."
                  value={connectionResult}
                  onChange={(e) => setConnectionResult(e.target.value)}
                  className="min-h-[80px]"
                />
              </Card>
            )}

            {/* If they chose No */}
            {needsAPIs === false && (
              <Card className="p-4 border-2 border-green-200 bg-green-50">
                <p className="text-green-800 font-medium">Smart choice! Keep it simple.</p>
              </Card>
            )}

            {/* Complete Part 1 button */}
            {needsAPIs !== null && (needsAPIs === false || (apiConnected.length > 5 && connectionResult.length > 5)) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleApiComplete}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark APIs Complete
              </Button>
            )}
          </div>
        ) : (
          <div className="pl-11">
            <Card className="p-4 border-2 border-green-200 bg-green-50">
              <p className="text-green-800">
                {needsAPIs
                  ? `Connected: ${apiConnected.slice(0, 50)}${apiConnected.length > 50 ? '...' : ''}`
                  : "Decided to skip external APIs - keeping it simple!"
                }
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* PART 2: USER AUTHENTICATION */}
      {/* ============================================ */}
      <div className="relative pt-4">
        <div className="absolute top-0 left-0 right-0 border-t-2 border-slate-200"></div>

        <div className="flex items-center gap-3 mb-4 pt-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${authDone ? 'bg-green-500' : 'bg-primary'}`}>
            {authDone ? <Check className="w-5 h-5" /> : '2'}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <h4 className="font-bold text-lg text-slate-900">User Authentication</h4>
          </div>
          {authDone && <span className="text-sm text-green-600 font-medium">Done!</span>}
        </div>

        <div className="space-y-4 pl-11">
          <Card className="p-5 border-2 border-amber-200 bg-amber-50">
            <h5 className="font-bold text-amber-900 mb-2">Check If You Already Have Auth</h5>
            <p className="text-sm text-amber-800 mb-2">
              Ask Replit Agent:
            </p>
            <div className="bg-white/60 p-3 rounded-lg">
              <p className="text-sm text-amber-900 italic">"Does my app have user authentication? Can users log in and see only their own data?"</p>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Replit Auth is the fastest option</strong> - it just works, it's secure, and takes minutes. But if you need something specific, you can also integrate external providers like <span className="text-slate-900">Firebase Auth</span>, <span className="text-slate-900">Auth0</span>, <span className="text-slate-900">Clerk</span>, or <span className="text-slate-900">Supabase Auth</span>. For most MVPs, Replit Auth is plenty.
            </p>
          </Card>

          <Card className="p-5 border-2 border-slate-200">
            <h5 className="font-bold text-slate-900 mb-3">Does Your App Have Auth?</h5>

            <div className="space-y-3">
              <div
                onClick={() => setHasAuth(true)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  hasAuth === true
                    ? "border-green-400 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  hasAuth === true ? "bg-green-500" : "bg-slate-200"
                }`}>
                  {hasAuth === true && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">Yes, auth already exists</p>
                  <p className="text-sm text-slate-600">Users can log in and see their own data</p>
                </div>
              </div>

              <div
                onClick={() => setHasAuth(false)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  hasAuth === false
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  hasAuth === false ? "bg-amber-500" : "bg-slate-200"
                }`}>
                  {hasAuth === false && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">No, I need to add it</p>
                  <p className="text-sm text-slate-600">Everyone sees everyone's data right now</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Add auth instructions (only show if they don't have it) */}
          {hasAuth === false && (
            <Card className="p-5 border-2 border-slate-200">
              <h5 className="font-bold text-slate-900 mb-2">Ask Replit to Add Auth</h5>
              <p className="text-sm text-slate-600 mb-3">
                Tell Replit Agent:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 italic">
                  "Add user authentication to my app. I need:
                </p>
                <ul className="text-sm text-slate-700 italic mt-2 ml-4 space-y-1">
                  <li>• A login/signup button in the header</li>
                  <li>• Show the user's name when logged in</li>
                  <li>• A logout button</li>
                  <li>• Each user should only see their own data"</li>
                </ul>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Replit handles OAuth, sessions, tokens - you just describe what you want.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* COMPLETE DAY 11 */}
      {/* ============================================ */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={() => onComplete({
            needsAPIs: needsAPIs || false,
            apiConnected: needsAPIs ? apiConnected : "None needed",
            connectionResult: needsAPIs ? connectionResult : "Decided to keep MVP simple without extra APIs",
            hasAuth: hasAuth ?? true,
            authStatus: hasAuth ? "Already had auth" : "Added auth with Replit"
          })}
        >
          Complete Day 11 <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
