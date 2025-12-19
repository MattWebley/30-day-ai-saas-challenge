import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Lock,
  Copy,
  CheckCircle2,
  ArrowRight,
  Mail,
  KeyRound,
  Sparkles,
  Shield,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day19AuthSetupProps {
  dayId: number;
  onComplete: () => void;
}

const AUTH_METHODS = [
  {
    id: "email",
    label: "Email + Password",
    icon: Mail,
    description: "Classic signup - works for everyone",
    recommended: true,
  },
  {
    id: "google",
    label: "Google Sign-In",
    icon: User,
    description: "One-click signup with Google account",
    recommended: false,
  },
  {
    id: "magic",
    label: "Magic Link",
    icon: Sparkles,
    description: "No password needed - login via email link",
    recommended: false,
  },
];

const AUTH_OPTIONS = [
  { id: "rememberMe", label: "Remember Me option", default: true },
  { id: "sessionExpiry", label: "Sessions expire after inactivity", default: true },
  { id: "passwordRules", label: "Minimum 8 character passwords", default: true },
  { id: "emailVerification", label: "Email verification before access", default: false },
];

export function Day19AuthSetup({ dayId, onComplete }: Day19AuthSetupProps) {
  const [step, setStep] = useState<"methods" | "options" | "prompt" | "test">("methods");
  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(new Set(["email"]));
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set(AUTH_OPTIONS.filter(o => o.default).map(o => o.id))
  );
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    signupWorks: false,
    loginWorks: false,
    resetWorks: false,
    logoutWorks: false,
    protectedRoutes: false,
  });
  const { toast } = useToast();

  const toggleMethod = (methodId: string) => {
    const newSelected = new Set(selectedMethods);
    if (newSelected.has(methodId)) {
      if (newSelected.size > 1) {
        newSelected.delete(methodId);
      }
    } else {
      newSelected.add(methodId);
    }
    setSelectedMethods(newSelected);
  };

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const generateBuildPrompt = () => {
    const methods = Array.from(selectedMethods).map(id => AUTH_METHODS.find(m => m.id === id)!);
    const options = Array.from(selectedOptions);

    const prompt = `Set up user authentication for my app:

AUTH METHODS:
${methods.map(m => `- ${m.label}: ${m.description}`).join("\n")}

1. SIGNUP PAGE (/signup)
${selectedMethods.has("email") ? `   - Email and password fields
   - ${options.includes("passwordRules") ? "Password must be 8+ characters" : "Any password length"}
   - Confirm password field
   - "Sign Up" button
   - "Already have an account? Log in" link` : ""}
${selectedMethods.has("google") ? `   - "Continue with Google" button (OAuth)` : ""}
${selectedMethods.has("magic") ? `   - Email field only
   - "Send Magic Link" button` : ""}

2. LOGIN PAGE (/login)
${selectedMethods.has("email") ? `   - Email and password fields
   ${options.includes("rememberMe") ? '- "Remember me" checkbox' : ""}
   - "Forgot password?" link
   - "Log In" button` : ""}
${selectedMethods.has("google") ? `   - "Continue with Google" button` : ""}
${selectedMethods.has("magic") ? `   - Email field
   - "Send Login Link" button` : ""}
   - "Don't have an account? Sign up" link

3. PASSWORD RESET
   - /forgot-password: Enter email, send reset link
   - /reset-password: Enter new password (link expires in 1 hour)
   - Confirmation message after reset

4. PROTECTED ROUTES
   - All /dashboard/* routes require login
   - Redirect to /login if not authenticated
   - After login, redirect to originally requested page
   - Store return URL in session

5. USER SESSION
   ${options.includes("sessionExpiry") ? "- Sessions expire after 7 days of inactivity" : "- Sessions don't expire automatically"}
   - Secure session cookies (httpOnly, sameSite)
   - Session stored in database

6. LOGOUT
   - Clear session completely
   - Redirect to homepage
   - "Log Out" button in header/sidebar

7. HEADER UI
   - Show "Log In" / "Sign Up" buttons when logged out
   - Show user name/avatar and "Log Out" when logged in

${options.includes("emailVerification") ? `
8. EMAIL VERIFICATION
   - Send verification email on signup
   - User can't access app until verified
   - Resend verification option` : ""}

SECURITY:
- Hash all passwords with bcrypt
- Never store plain text passwords
- Rate limit login attempts (5 per minute)
- Secure password reset tokens (one-time use)

Make the auth flow smooth and fast. Users should be able to sign up in under 30 seconds.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Auth Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const toggleTest = (key: keyof typeof testChecklist) => {
    setTestChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allTestsPass = Object.values(testChecklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Lock It DOWN</h3>
            <p className="text-slate-600 mt-1">
              User accounts, security, and keeping the bad guys out.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Methods", "Options", "Build", "Test"].map((label, idx) => {
          const steps = ["methods", "options", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-amber-100 text-amber-700" :
                isCurrent ? "bg-amber-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Methods */}
      {step === "methods" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">How should users sign in?</h4>
          <p className="text-sm text-slate-500 mb-4">Select at least one method</p>

          <div className="grid gap-3">
            {AUTH_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethods.has(method.id);
              return (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? "text-amber-600" : "text-slate-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{method.label}</span>
                        {method.recommended && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Recommended</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{method.description}</div>
                    </div>
                    <Checkbox checked={isSelected} />
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={() => setStep("options")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Options */}
      {step === "options" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Security Options</h4>
          <p className="text-sm text-slate-500 mb-4">Configure how authentication works</p>

          <div className="space-y-3">
            {AUTH_OPTIONS.map((option) => {
              const isSelected = selectedOptions.has(option.id);
              return (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected ? "border-amber-300 bg-amber-50" : "border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <Checkbox checked={isSelected} />
                  <span className={`font-medium ${isSelected ? "text-amber-900" : "text-slate-700"}`}>
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("methods")}>Back</Button>
            <Button className="flex-1" size="lg" onClick={generateBuildPrompt}>
              Generate Build Prompt <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Auth Setup Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-amber-500 hover:bg-amber-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => setStep("test")}
            >
              I've Built It - Let's Test <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </>
      )}

      {/* Step 4: Test */}
      {step === "test" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Test Your Auth Flow</h4>
          <p className="text-sm text-slate-500 mb-4">Go through each flow as a real user would</p>

          <div className="space-y-3">
            {[
              { key: "signupWorks", label: "Signup works", desc: "Create a new account with a test email" },
              { key: "loginWorks", label: "Login works", desc: "Log out, then log back in" },
              { key: "resetWorks", label: "Password reset works", desc: "Request reset, check email, set new password" },
              { key: "logoutWorks", label: "Logout works", desc: "Click logout, confirm you're logged out" },
              { key: "protectedRoutes", label: "Protected routes work", desc: "Try accessing /dashboard logged out - should redirect" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  testChecklist[item.key as keyof typeof testChecklist]
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 hover:border-green-300"
                }`}
                onClick={() => toggleTest(item.key as keyof typeof testChecklist)}
              >
                <Checkbox checked={testChecklist[item.key as keyof typeof testChecklist]} />
                <div>
                  <div className="font-semibold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {allTestsPass && (
            <Card className="p-4 border-2 border-green-300 bg-green-50 mt-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Your app is SECURE!</div>
                  <div className="text-sm text-green-700">Users have accounts. Data is protected. You know who's who.</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>Back</Button>
            <Button className="flex-1" size="lg" disabled={!allTestsPass} onClick={onComplete}>
              Complete Day 19
            </Button>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Security Basics</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Never store plain passwords.</strong> Always hash with bcrypt.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Keep it simple.</strong> Add Google/Magic Link later if needed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Test the reset flow.</strong> Users WILL forget passwords.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
