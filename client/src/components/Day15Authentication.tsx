import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  User,
  Key,
  Mail,
  Sparkles
} from "lucide-react";

interface Day15AuthenticationProps {
  appName: string;
  onComplete: (data: { authMethod: string; loginTestResult: string; userDataWorks: string }) => void;
}

const AUTH_OPTIONS = [
  {
    id: "replit",
    icon: Sparkles,
    name: "Replit Auth",
    desc: "One-click setup, works instantly",
    recommended: true,
  },
  {
    id: "email",
    icon: Mail,
    name: "Email + Password",
    desc: "Classic approach, full control",
    recommended: false,
  },
  {
    id: "social",
    icon: User,
    name: "Social Login",
    desc: "Google, GitHub login buttons",
    recommended: false,
  },
  {
    id: "magic",
    icon: Key,
    name: "Magic Link",
    desc: "Passwordless via email",
    recommended: false,
  },
];

export function Day15Authentication({ appName, onComplete }: Day15AuthenticationProps) {
  const [step, setStep] = useState<"choose" | "implement" | "test">("choose");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loginTestResult, setLoginTestResult] = useState("");
  const [userDataWorks, setUserDataWorks] = useState("");

  const canProceedToImplement = selectedMethod !== "";
  const canProceedToTest = true;
  const canComplete = loginTestResult.length >= 20 && userDataWorks.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Add User Authentication</h3>
            <p className="text-slate-600 mt-1">Let users create accounts and keep their data private.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Choose Auth Method */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Choose Your Auth Method</h4>
            <p className="text-sm text-slate-600 mb-4">
              Pick ONE way for users to log in. You can always add more methods later.
            </p>

            <div className="space-y-3">
              {AUTH_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedMethod === option.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedMethod(option.id)}
                >
                  <input
                    type="radio"
                    checked={selectedMethod === option.id}
                    onChange={() => setSelectedMethod(option.id)}
                    className="w-4 h-4"
                  />
                  <option.icon className={`w-5 h-5 ${selectedMethod === option.id ? "text-primary" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{option.name}</span>
                      {option.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{option.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {selectedMethod === "replit" && (
            <Card className="p-4 border-2 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Replit Auth is the fastest option</p>
                  <p className="mt-1">
                    Built into Replit, secure by default, and users can log in with their Replit account.
                    Perfect for launching quickly.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {canProceedToImplement && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("implement")}
            >
              Implement {AUTH_OPTIONS.find(o => o.id === selectedMethod)?.name} <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Implement Auth */}
      {step === "implement" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Choice: {AUTH_OPTIONS.find(o => o.id === selectedMethod)?.name}</h4>
            <p className="text-slate-700">Time to add login to your app!</p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Implementation Steps</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Add a Login/Signup button</p>
                  <p className="text-sm text-slate-600">Usually in the header, visible on every page</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Show user info when logged in</p>
                  <p className="text-sm text-slate-600">Display name/avatar, add a Logout button</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Protect pages that need login</p>
                  <p className="text-sm text-slate-600">Dashboard, user data, saved items, etc.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Save user data to their account</p>
                  <p className="text-sm text-slate-600">Each user sees only their own data</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Tell Claude Code</h4>
            <p className="text-sm text-slate-600 mb-4">Describe what you need:</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 font-mono">
              "Add {AUTH_OPTIONS.find(o => o.id === selectedMethod)?.name} to my app:<br /><br />
              1. Add Login button in header<br />
              2. Show user name when logged in<br />
              3. Add Logout button<br />
              4. Protect the dashboard - only logged-in users<br />
              5. Save [your main data] to user's account<br />
              6. Users should only see their own data"
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            <CheckCircle2 className="w-5 h-5" />
            I Added Auth - Test It
          </Button>
        </>
      )}

      {/* Step 3: Test and Document */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Your App Has User Accounts!</h4>
            </div>
            <p className="text-slate-700">
              This is a major milestone. Users can now have their own private data in your app.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Test the Login Flow</h4>
            <p className="text-sm text-slate-600 mb-4">
              Test the complete login → use app → logout flow. What happened?
            </p>
            <Textarea
              placeholder="I tested login by:
1. Clicked Login button → [what happened]
2. Logged in as [method] → [what happened]
3. Used the main feature → [could I see my data?]
4. Logged out → [what happened]"
              value={loginTestResult}
              onChange={(e) => setLoginTestResult(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Does User Data Work?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Can users save data and see only their own stuff?
            </p>
            <Textarea
              placeholder="Yes/No - When I save something as user A, user B can/cannot see it because..."
              value={userDataWorks}
              onChange={(e) => setUserDataWorks(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                authMethod: AUTH_OPTIONS.find(o => o.id === selectedMethod)?.name || selectedMethod,
                loginTestResult,
                userDataWorks
              })}
            >
              Save Auth Setup & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
