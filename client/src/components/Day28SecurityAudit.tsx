import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Copy,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Lock,
  Key,
  Database,
  Globe,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day28SecurityAuditProps {
  dayId: number;
  onComplete: () => void;
}

const SECURITY_CATEGORIES = [
  {
    id: "auth",
    label: "Authentication",
    icon: Lock,
    items: [
      { id: "a1", text: "Passwords are hashed (bcrypt/argon2)", risk: "critical" },
      { id: "a2", text: "Session tokens are secure (httpOnly, secure)", risk: "critical" },
      { id: "a3", text: "Password reset links expire", risk: "high" },
      { id: "a4", text: "Failed login attempts are rate-limited", risk: "high" },
      { id: "a5", text: "Logout actually invalidates session", risk: "medium" },
    ],
  },
  {
    id: "secrets",
    label: "Secrets & Keys",
    icon: Key,
    items: [
      { id: "s1", text: "API keys are in environment variables, not code", risk: "critical" },
      { id: "s2", text: ".env file is in .gitignore", risk: "critical" },
      { id: "s3", text: "No secrets in client-side code", risk: "critical" },
      { id: "s4", text: "Database credentials are not hardcoded", risk: "critical" },
      { id: "s5", text: "JWT secrets are random, not 'secret123'", risk: "high" },
    ],
  },
  {
    id: "data",
    label: "Data Protection",
    icon: Database,
    items: [
      { id: "d1", text: "Users can only access their own data", risk: "critical" },
      { id: "d2", text: "Admin routes check admin status", risk: "critical" },
      { id: "d3", text: "SQL/NoSQL injection prevented (parameterized queries)", risk: "critical" },
      { id: "d4", text: "User input is validated before processing", risk: "high" },
      { id: "d5", text: "Sensitive data is encrypted at rest", risk: "medium" },
    ],
  },
  {
    id: "web",
    label: "Web Security",
    icon: Globe,
    items: [
      { id: "w1", text: "HTTPS is enforced (no HTTP)", risk: "critical" },
      { id: "w2", text: "XSS prevented (output is escaped)", risk: "high" },
      { id: "w3", text: "CSRF tokens on forms", risk: "high" },
      { id: "w4", text: "CORS is configured (not *)", risk: "medium" },
      { id: "w5", text: "Content Security Policy headers set", risk: "low" },
    ],
  },
  {
    id: "code",
    label: "Code Security",
    icon: Code,
    items: [
      { id: "c1", text: "Dependencies are up to date (npm audit)", risk: "high" },
      { id: "c2", text: "No eval() or dangerous functions", risk: "high" },
      { id: "c3", text: "Error messages don't leak internal info", risk: "medium" },
      { id: "c4", text: "Debug mode is off in production", risk: "medium" },
      { id: "c5", text: "Logging doesn't capture sensitive data", risk: "medium" },
    ],
  },
];

export function Day28SecurityAudit({ dayId, onComplete }: Day28SecurityAuditProps) {
  const [step, setStep] = useState<"audit" | "prompt">("audit");
  const [passedItems, setPassedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [unsureItems, setUnsureItems] = useState<Set<string>>(new Set());
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const toggleItem = (itemId: string, status: "pass" | "fail" | "unsure") => {
    const newPassed = new Set(passedItems);
    const newFailed = new Set(failedItems);
    const newUnsure = new Set(unsureItems);

    // Clear all states first
    newPassed.delete(itemId);
    newFailed.delete(itemId);
    newUnsure.delete(itemId);

    // Set new state
    if (status === "pass") newPassed.add(itemId);
    else if (status === "fail") newFailed.add(itemId);
    else newUnsure.add(itemId);

    setPassedItems(newPassed);
    setFailedItems(newFailed);
    setUnsureItems(newUnsure);
  };

  const totalItems = SECURITY_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalReviewed = passedItems.size + failedItems.size + unsureItems.size;

  const criticalFailed = SECURITY_CATEGORIES.flatMap(cat =>
    cat.items.filter(item =>
      item.risk === "critical" && (failedItems.has(item.id) || unsureItems.has(item.id))
    )
  );

  const getSecurityScore = () => {
    if (totalReviewed === 0) return 0;
    const passed = passedItems.size;
    return Math.round((passed / totalItems) * 100);
  };

  const getScoreColor = () => {
    const score = getSecurityScore();
    if (score >= 90) return "green";
    if (score >= 70) return "yellow";
    return "red";
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const generateFixPrompt = () => {
    const issues = SECURITY_CATEGORIES.flatMap(cat =>
      cat.items
        .filter(item => failedItems.has(item.id) || unsureItems.has(item.id))
        .map(item => ({
          category: cat.label,
          text: item.text,
          risk: item.risk,
          status: failedItems.has(item.id) ? "FAILED" : "UNSURE",
        }))
    );

    const prompt = `Fix these security issues in my app:

${issues.map((issue, i) => `${i + 1}. [${issue.risk.toUpperCase()}] ${issue.category}: ${issue.text} (${issue.status})`).join("\n")}

SECURITY FIXES TO APPLY:

1. AUTHENTICATION
   - Use bcrypt with salt rounds >= 10 for password hashing
   - Set cookies with: httpOnly: true, secure: true, sameSite: 'lax'
   - Password reset tokens: expire after 1 hour, single use
   - Rate limit: max 5 failed logins per 15 minutes per IP
   - On logout: destroy session in database, clear cookies

2. SECRETS
   - Move ALL secrets to .env file
   - Add to .gitignore: .env, .env.local, *.pem, *.key
   - Use process.env.SECRET_NAME, never hardcode
   - JWT secret: at least 32 random characters
   - Different secrets for dev/staging/production

3. DATA PROTECTION
   - All database queries: check userId matches session user
   - Admin routes: if (!req.user?.isAdmin) return 403
   - Use parameterized queries or ORM (Drizzle is safe)
   - Validate with Zod before processing any input
   - For encryption: use sodium or crypto-js

4. WEB SECURITY
   - Force HTTPS in production (Replit handles this)
   - Use a library like DOMPurify for user content
   - Add CSRF tokens to all forms that modify data
   - CORS config: specify allowed origins, not "*"
   - Add these headers:
     \`\`\`
     Content-Security-Policy: default-src 'self'
     X-Content-Type-Options: nosniff
     X-Frame-Options: DENY
     \`\`\`

5. CODE SECURITY
   - Run: npm audit fix
   - Search codebase for: eval(, new Function(, innerHTML
   - Generic error messages: "Something went wrong. Please try again."
   - Remove console.log in production
   - Never log: passwords, tokens, credit cards, SSNs

6. QUICK SECURITY WINS
   - Add these packages:
     npm install helmet express-rate-limit
   - Add to Express:
     \`\`\`
     app.use(helmet());
     app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
     \`\`\`

Run npm audit after fixes to verify no known vulnerabilities.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Security Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const allReviewed = totalReviewed === totalItems;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Security That PROTECTS</h3>
            <p className="text-slate-600 mt-1">
              One breach = game over. Get this right before you launch.
            </p>
          </div>
        </div>
      </Card>

      {step === "audit" && (
        <>
          {/* Score */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Security Score</span>
              <span className={`font-bold ${
                getScoreColor() === "green" ? "text-green-600" :
                getScoreColor() === "yellow" ? "text-yellow-600" :
                "text-red-600"
              }`}>{getSecurityScore()}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  getScoreColor() === "green" ? "bg-green-500" :
                  getScoreColor() === "yellow" ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${getSecurityScore()}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-green-600 font-medium">✓ {passedItems.size} passed</span>
              <span className="text-red-600 font-medium">✗ {failedItems.size} failed</span>
              <span className="text-yellow-600 font-medium">? {unsureItems.size} unsure</span>
            </div>
          </Card>

          {/* Critical Warning */}
          {criticalFailed.length > 0 && (
            <Card className="p-4 border-2 border-red-300 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold text-red-800">
                    {criticalFailed.length} CRITICAL issue{criticalFailed.length > 1 ? "s" : ""} found
                  </div>
                  <div className="text-sm text-red-700">
                    These MUST be fixed before launch. They're how apps get hacked.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Audit Categories */}
          {SECURITY_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="p-6 border-2 border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <h4 className="font-bold text-slate-900">{category.label}</h4>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isPassed = passedItems.has(item.id);
                    const isFailed = failedItems.has(item.id);
                    const isUnsure = unsureItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                          isPassed ? "border-green-300 bg-green-50" :
                          isFailed ? "border-red-300 bg-red-50" :
                          isUnsure ? "border-yellow-300 bg-yellow-50" :
                          "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getRiskBadgeColor(item.risk)}`}>
                            {item.risk.toUpperCase()}
                          </span>
                          <span className={
                            isPassed ? "text-green-700" :
                            isFailed ? "text-red-700" :
                            isUnsure ? "text-yellow-700" :
                            "text-slate-700"
                          }>
                            {item.text}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleItem(item.id, "pass")}
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              isPassed ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-green-100"
                            }`}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => toggleItem(item.id, "unsure")}
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              isUnsure ? "bg-yellow-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-yellow-100"
                            }`}
                          >
                            ?
                          </button>
                          <button
                            onClick={() => toggleItem(item.id, "fail")}
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              isFailed ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-red-100"
                            }`}
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {allReviewed && (
            <Button
              className="w-full"
              size="lg"
              onClick={generateFixPrompt}
            >
              {failedItems.size + unsureItems.size > 0 ? "Generate Fix Prompt" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </>
      )}

      {step === "prompt" && (
        <>
          {failedItems.size + unsureItems.size > 0 ? (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Your Security Fix Prompt</h4>
                  <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
                </div>
                <Button onClick={handleCopyPrompt} className="gap-2 bg-red-500 hover:bg-red-600">
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </Button>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-800 text-lg">Security Audit Passed!</div>
                  <div className="text-green-700">Your app is ready for launch from a security perspective.</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Security is never "done"</p>
                <p className="text-sm text-slate-500">But you're ready to launch safely</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 28
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Security Essentials</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>CRITICAL = Fix now.</strong> These are how apps get hacked.</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>When unsure, mark "?".</strong> The fix prompt will address it.</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Run npm audit regularly.</strong> New vulnerabilities appear daily.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
