import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Check, Shield, Zap, Info } from "lucide-react";
import { ds } from "@/lib/design-system";

interface Day11AddSuperpowersProps {
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

export function Day11AddSuperpowers({ userIdea, appName, onComplete }: Day11AddSuperpowersProps) {
  // Auth state
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);

  // API state
  const [needsAPIs, setNeedsAPIs] = useState<boolean | null>(null);
  const [apiConnected, setApiConnected] = useState("");
  const [connectionResult, setConnectionResult] = useState("");
  const [apiSectionComplete, setApiSectionComplete] = useState(false);

  // Completion logic
  const authDone = hasAuth !== null;
  const apiDone = apiSectionComplete;
  const canComplete = authDone && apiDone;

  const handleApiComplete = () => {
    setApiSectionComplete(true);
  };

  return (
    <div className={ds.section}>
      {/* Header */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className={ds.titleXl}>Add Superpowers</h3>
        </div>
        <p className={ds.text}>Two quick tasks: user authentication + external APIs (if needed).</p>
      </div>

      {/* ============================================ */}
      {/* PART 1: USER AUTHENTICATION */}
      {/* ============================================ */}
      <div className={ds.section}>
        <div className="flex items-center gap-3">
          <div className={authDone ? ds.stepCircleComplete : ds.stepCircle}>
            {authDone ? <Check className="w-5 h-5" /> : '1'}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            <h4 className={ds.titleLg}>User Authentication</h4>
          </div>
          {authDone && <span className={`text-sm font-medium ${ds.successText}`}>Done!</span>}
        </div>

        <div className="space-y-4 pl-11">
          {/* Check if you have auth */}
          <div className={ds.infoBox}>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className={ds.label}>Ask Replit Agent:</p>
                <p className={`${ds.text} mt-1 italic`}>"Does my app have user authentication? Can users log in and see only their own data?"</p>
              </div>
            </div>
          </div>

          {/* External auth options note */}
          <div className={ds.infoBoxHighlight}>
            <p className={ds.text}>
              <strong className="text-slate-900">Replit Auth is the fastest option</strong> - it just works, it's secure, and takes minutes. But if you need something specific, you can also integrate <span className="text-slate-900">Firebase Auth</span>, <span className="text-slate-900">Auth0</span>, <span className="text-slate-900">Clerk</span>, or <span className="text-slate-900">Supabase Auth</span>.
            </p>
          </div>

          {/* Yes/No selection */}
          <div className={ds.cardWithPadding}>
            <p className={`${ds.title} mb-3`}>Does your app have auth?</p>
            <div className="space-y-2">
              <div
                onClick={() => setHasAuth(true)}
                className={hasAuth === true ? ds.optionSelected : ds.optionDefault}
              >
                <div className="flex items-center gap-3">
                  <div className={hasAuth === true ? ds.checkSelected : ds.checkDefault}>
                    {hasAuth === true && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">Yes, auth already exists</p>
                    <p className={ds.textMuted}>Users can log in and see their own data</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setHasAuth(false)}
                className={hasAuth === false ? ds.optionSelected : ds.optionDefault}
              >
                <div className="flex items-center gap-3">
                  <div className={hasAuth === false ? ds.checkSelected : ds.checkDefault}>
                    {hasAuth === false && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">No, I need to add it</p>
                    <p className={ds.textMuted}>Everyone sees everyone's data right now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add auth instructions */}
          {hasAuth === false && (
            <div className={ds.cardWithPadding}>
              <p className={`${ds.title} mb-2`}>Ask Replit to Add Auth</p>
              <p className={`${ds.textMuted} mb-3`}>Tell Replit Agent:</p>
              <div className={ds.infoBoxHighlight}>
                <p className="text-slate-700 italic text-sm">
                  "Add user authentication to my app. I need:
                </p>
                <ul className="text-slate-700 italic text-sm mt-2 ml-4 space-y-1">
                  <li>• A login/signup button in the header</li>
                  <li>• Show the user's name when logged in</li>
                  <li>• A logout button</li>
                  <li>• Each user should only see their own data"</li>
                </ul>
              </div>
              <p className={`${ds.textMuted} mt-3`}>
                Replit handles OAuth, sessions, tokens - you just describe what you want.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className={ds.divider}></div>

      {/* ============================================ */}
      {/* PART 2: EXTERNAL APIs */}
      {/* ============================================ */}
      <div className={ds.section}>
        <div className="flex items-center gap-3">
          <div className={apiDone ? ds.stepCircleComplete : ds.stepCircle}>
            {apiDone ? <Check className="w-5 h-5" /> : '2'}
          </div>
          <h4 className={ds.titleLg}>External APIs</h4>
          {apiDone && <span className={`text-sm font-medium ${ds.successText}`}>Done!</span>}
        </div>

        {!apiSectionComplete ? (
          <div className="space-y-4 pl-11">
            {/* Ask Replit First */}
            <div className={ds.infoBox}>
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className={ds.label}>Ask Replit First</p>
                  <p className={`${ds.text} mt-1`}>
                    Before adding any external API, check if Replit can do it natively:
                  </p>
                  <p className={`${ds.text} mt-2 italic`}>"Can you add file upload functionality?"</p>
                </div>
              </div>
            </div>

            {/* API Examples */}
            <div className={ds.cardWithPadding}>
              <p className={`${ds.title} mb-3`}>Valid Reasons for External APIs</p>
              <div className="space-y-2 mb-4">
                {API_EXAMPLES.map((api) => (
                  <div key={api.name} className={ds.infoBoxHighlight}>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{api.name}</p>
                        <p className={ds.textMuted}>{api.examples}</p>
                      </div>
                      <p className={`${ds.textMuted} italic self-center`}>{api.when}</p>
                    </div>
                  </div>
                ))}
              </div>

              {userIdea && (
                <p className={`${ds.textMuted} mb-4`}>Your app: {userIdea}</p>
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
            </div>

            {/* If they need an API, show the fields */}
            {needsAPIs === true && (
              <div className={ds.cardWithPadding}>
                <p className={`${ds.title} mb-2`}>Which API?</p>
                <Textarea
                  placeholder="I'm adding [API name] because..."
                  value={apiConnected}
                  onChange={(e) => setApiConnected(e.target.value)}
                  className="min-h-[80px] mb-4"
                />
                <p className={`${ds.title} mb-2`}>Did it work?</p>
                <Textarea
                  placeholder="I tested it by... and it worked/didn't work because..."
                  value={connectionResult}
                  onChange={(e) => setConnectionResult(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* If they chose No */}
            {needsAPIs === false && (
              <div className={ds.infoBox}>
                <p className={ds.successText}>
                  <strong>Smart choice!</strong> Keep it simple. You can always add APIs later.
                </p>
              </div>
            )}

            {/* Complete Part 2 button */}
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
            <div className={ds.infoBox}>
              <p className={ds.successText}>
                {needsAPIs
                  ? `Connected: ${apiConnected.slice(0, 50)}${apiConnected.length > 50 ? '...' : ''}`
                  : "Decided to skip external APIs - keeping it simple!"
                }
              </p>
            </div>
          </div>
        )}
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
