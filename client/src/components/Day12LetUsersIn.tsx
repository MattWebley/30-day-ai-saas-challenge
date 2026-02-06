import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Users,
  Lock,
  CheckCircle2,
  Copy,
  BarChart3,
  Terminal,
  Sparkles,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Target,
  Zap,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ds } from "@/lib/design-system";

interface Day12LetUsersInProps {
  savedInputs?: Record<string, any>;
  onComplete: (data: {
    hasAuth: boolean;
    authAdded: boolean;
    testPassed: boolean;
    adminDashboard: boolean;
    mainAction: string;
    secondaryActions: string;
    businessModel: string;
    selectedMetrics: string[];
    selectedInsights: string[];
    wantsCharts: boolean;
    wantsExport: boolean;
    wantsAlerts: boolean;
    adminBuilt: boolean;
  }) => void;
}

export function Day12LetUsersIn({ savedInputs, onComplete }: Day12LetUsersInProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"check" | "add" | "test" | "admin" | "admin-questions" | "admin-prompt" | "admin-learn" | "done">("check");
  const [hasAuth, setHasAuth] = useState<boolean | null>(savedInputs?.hasAuth ?? null);
  const [copied, setCopied] = useState(false);
  const [testPassed, setTestPassed] = useState(savedInputs?.testPassed ?? false);
  const [adminBuilt, setAdminBuilt] = useState(savedInputs?.adminBuilt ?? false);
  const { toast: toastHook } = useToast();

  // Admin dashboard questionnaire state
  const [mainAction, setMainAction] = useState(savedInputs?.mainAction ?? "");
  const [secondaryActions, setSecondaryActions] = useState(savedInputs?.secondaryActions ?? "");
  const [businessModel, setBusinessModel] = useState<"free" | "paid" | "freemium" | "">(savedInputs?.businessModel ?? "");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(savedInputs?.selectedMetrics ?? []);
  const [selectedInsights, setSelectedInsights] = useState<string[]>(savedInputs?.selectedInsights ?? []);
  const [wantsCharts, setWantsCharts] = useState(savedInputs?.wantsCharts ?? true);
  const [wantsExport, setWantsExport] = useState(savedInputs?.wantsExport ?? false);
  const [wantsAlerts, setWantsAlerts] = useState(savedInputs?.wantsAlerts ?? false);

  const authPrompt = `Add user authentication. I need:
- Login/signup button in the header
- Show the user's name when logged in
- Logout button
- Each user should only see their own data`;

  // Generate the comprehensive admin prompt based on selections
  const generateAdminPrompt = () => {
    const sections: string[] = [];

    // Header
    sections.push(`Create a comprehensive admin dashboard at /admin that only I can access. Make it look professional with a clean grid layout.`);

    // Core user metrics (always included)
    sections.push(`\n## USER METRICS (top of dashboard, big numbers with cards)\n- Total users (all time)\n- New users this week (with % change from last week)\n- Active users this week (anyone who logged in)\n- Daily active users today`);

    // Main action tracking
    if (mainAction) {
      sections.push(`\n## MAIN ACTION TRACKING\nThe primary thing users do is: "${mainAction}"\n- Total ${mainAction} (all time)\n- ${mainAction} this week (with % change)\n- ${mainAction} today\n- Average ${mainAction} per user\n- Show a feed of the last 50 ${mainAction} with username, timestamp, and any relevant details`);
    }

    // Secondary actions
    if (secondaryActions) {
      sections.push(`\n## SECONDARY ACTIONS\nAlso track these actions: ${secondaryActions}\n- Show totals for each\n- Show this week vs last week for each`);
    }

    // Business model specific
    if (businessModel === "paid" || businessModel === "freemium") {
      sections.push(`\n## REVENUE & PAYMENTS\n- Total revenue (all time)\n- Revenue this month\n- Revenue this week\n- Number of paying customers\n- Average revenue per user (ARPU)\n- Recent transactions (last 20)`);
    }
    if (businessModel === "freemium") {
      sections.push(`- Free vs paid user breakdown\n- Conversion rate (free to paid)\n- List of free users who are most active (potential upsells)`);
    }

    // Selected metrics
    if (selectedMetrics.includes("retention")) {
      sections.push(`\n## RETENTION & ENGAGEMENT\n- Day 1 retention (% who come back next day)\n- Week 1 retention (% who come back within 7 days)\n- User streaks (who's coming back daily?)\n- "At risk" users (were active, now gone 7+ days)`);
    }
    if (selectedMetrics.includes("funnel")) {
      sections.push(`\n## CONVERSION FUNNEL\n- Show the funnel: Signup → First action → Return visit → Power user\n- Show drop-off % at each stage\n- Identify where users are getting stuck`);
    }
    if (selectedMetrics.includes("speed")) {
      sections.push(`\n## SPEED METRICS\n- Time to first action (how fast do new users do something?)\n- Average session length\n- Pages/actions per session`);
    }
    if (selectedMetrics.includes("features")) {
      sections.push(`\n## FEATURE USAGE\n- Which features are used most?\n- Which features are never used?\n- Feature adoption rate (% of users who've tried each)`);
    }

    // Selected insights
    if (selectedInsights.includes("power-users")) {
      sections.push(`\n## POWER USERS\n- Top 10 most active users this week\n- Show their name, signup date, total actions, last active`);
    }
    if (selectedInsights.includes("geography")) {
      sections.push(`\n## GEOGRAPHY\n- Users by country (top 10)\n- Users by timezone\n- Show a simple map or bar chart`);
    }
    if (selectedInsights.includes("devices")) {
      sections.push(`\n## DEVICES & PLATFORMS\n- Mobile vs Desktop breakdown\n- Browser breakdown\n- Show as pie charts`);
    }
    if (selectedInsights.includes("errors")) {
      sections.push(`\n## ERRORS & ISSUES\n- Recent errors (last 20)\n- Most common errors\n- Failed actions count`);
    }
    if (selectedInsights.includes("search")) {
      sections.push(`\n## SEARCH & DISCOVERY\n- What are users searching for?\n- Top searches with no results (opportunity!)\n- Most viewed content/items`);
    }

    // Charts
    if (wantsCharts) {
      sections.push(`\n## CHARTS & VISUALIZATIONS\n- Line chart: Users over time (last 30 days)\n- Line chart: ${mainAction || "Actions"} over time (last 30 days)\n- Bar chart: Activity by day of week\n- Bar chart: Activity by hour of day`);
    }

    // Export
    if (wantsExport) {
      sections.push(`\n## DATA EXPORT\n- Add "Export to CSV" buttons for user list and activity data\n- Include all relevant columns`);
    }

    // Alerts
    if (wantsAlerts) {
      sections.push(`\n## ALERTS & NOTIFICATIONS\n- Show alerts at top if: no signups in 24 hours, sudden drop in activity, error spike\n- Color code: green = healthy, yellow = warning, red = problem`);
    }

    // Footer instructions
    sections.push(`\n## TECHNICAL REQUIREMENTS\n- Only accessible to admin users (check user role or email)\n- Auto-refresh data every 60 seconds\n- Mobile-responsive design\n- Use existing database tables for queries\n- Cache expensive queries where appropriate`);

    return sections.join("\n");
  };

  const adminPrompt = `Create an admin page at /admin that only I can access. Show me:
- Total users (how many have ever signed up)
- New users this week
- Active users this week (anyone who logged in)
- Total [main actions] in the app
- A list of the last 20 [main actions] with username and timestamp`;

  const copyPrompt = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastHook({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Check if auth exists */}
      {step === "check" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Check: Does your app have authentication?</h4>
              </div>
            </div>

            <p className="text-slate-700 mb-4">
              Ask Replit Agent: "Does my app have user authentication? Can users sign up, log in, and see only their own data?"
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <p className="text-slate-700 text-sm">
                <strong>Good news:</strong> Replit often adds auth automatically when you build. Check before adding it again!
              </p>
            </div>

            <p className="text-slate-700 font-medium mb-4">What did Replit say?</p>

            <div className="space-y-3">
              <button
                onClick={() => setHasAuth(true)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  hasAuth === true
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${hasAuth === true ? "text-green-600" : "text-slate-400"}`} />
                  <span className="text-slate-700 font-medium">Yes, auth is already set up</span>
                </div>
              </button>

              <button
                onClick={() => setHasAuth(false)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  hasAuth === false
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className={`w-5 h-5 ${hasAuth === false ? "text-amber-600" : "text-slate-400"}`} />
                  <span className="text-slate-700 font-medium">No, I need to add authentication</span>
                </div>
              </button>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep(hasAuth ? "test" : "add")}
            disabled={hasAuth === null}
          >
            Continue <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Add Auth (if needed) */}
      {step === "add" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Add Authentication</h4>
                <p className="text-slate-600 text-sm">Copy this prompt to Replit Agent or Claude Code</p>
              </div>
            </div>

            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                {authPrompt}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard(authPrompt)}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 text-sm">
                Replit will handle all the hard stuff - OAuth, sessions, tokens, security. You just describe what you want.
              </p>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("check")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("test")}
            >
              I've Added Auth <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Test Auth */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Test: Does each user see only their data?</h4>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-slate-700">Run this test to make sure auth is working correctly</p>

              <ol className="list-decimal list-inside space-y-3 text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg">Sign up with a test email (e.g., test1@example.com)</li>
                <li className="p-3 bg-slate-50 rounded-lg">Add some data in your app</li>
                <li className="p-3 bg-slate-50 rounded-lg">Log out</li>
                <li className="p-3 bg-slate-50 rounded-lg">Sign up with a DIFFERENT email (e.g., test2@example.com)</li>
                <li className="p-3 bg-slate-50 rounded-lg">Check: Can you see the first account's data?</li>
              </ol>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Pass:</strong> Each account only sees its own data.
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Fail</strong> - You can see the other account's data. Tell Claude Code "Each user should only see their own data, not other users' data."
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="testPassed"
                checked={testPassed}
                onChange={(e) => setTestPassed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="testPassed" className="text-slate-700 font-medium">
                Test passed - each user sees only their own data
              </label>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(hasAuth ? "check" : "add")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("admin")}
              disabled={!testPassed}
            >
              Auth is Working <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Admin Dashboard Intro */}
      {step === "admin" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Now You Have Users... Track Them!</h4>
                <p className="text-slate-600 text-sm">Let's build you a PROPER admin dashboard</p>
              </div>
            </div>

            <p className={ds.body + " mb-4"}>
              You have authentication. People can sign up. But how many? Are they coming back? Are they actually USING the thing?
            </p>

            <p className={ds.body + " mb-4"}>
              Don't guess. <strong>KNOW.</strong> We're going to build you a dashboard that would make a Silicon Valley startup jealous.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <p className="text-slate-900 font-bold mb-2">What You're About to Build</p>
              <div className="grid grid-cols-2 gap-2 text-slate-700 text-sm">
                <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> User growth tracking</div>
                <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Real-time activity feeds</div>
                <div className="flex items-center gap-2"><Target className="w-4 h-4" /> Conversion funnels</div>
                <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Engagement metrics</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className={ds.body}>
                <strong>This takes a few minutes.</strong> Answer a few questions, get a prompt that builds something incredible.
              </p>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep("test")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" className="flex-1 h-14 text-lg font-bold gap-2" onClick={() => setStep("admin-questions")}>
              Let's Build It <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4b: Admin Questions */}
      {step === "admin-questions" && (
        <>
          {/* Claude Code Guide Reminder */}
          <Link href="/claude-code">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
                  <p className="text-slate-600 text-sm">Use the prompts there to start your session.</p>
                </div>
              </div>
            </div>
          </Link>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-6">Tell Me About Your App</h4>

            {/* Question 1: Main Action */}
            <div className="mb-6">
              <label className={ds.label + " mb-2 block"}>
                What's the MAIN thing users do in your app? <span className="text-red-500">*</span>
              </label>
              <p className={ds.muted + " mb-2"}>
                Examples... "create tasks", "generate reports", "save recipes", "log workouts", "write notes"
              </p>
              <input
                type="text"
                placeholder="e.g., create invoices"
                value={mainAction}
                onChange={(e) => setMainAction(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            {/* Question 2: Secondary Actions */}
            <div className="mb-6">
              <label className={ds.label + " mb-2 block"}>
                Any other actions you want to track?
              </label>
              <p className={ds.muted + " mb-2"}>
                Optional - separate with commas
              </p>
              <input
                type="text"
                placeholder="e.g., send messages, upload files, invite team members"
                value={secondaryActions}
                onChange={(e) => setSecondaryActions(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            {/* Question 3: Business Model */}
            <div className="mb-6">
              <label className={ds.label + " mb-3 block"}>
                What's your business model?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "free", label: "Free", desc: "No payments yet" },
                  { value: "paid", label: "Paid", desc: "Users pay to use it" },
                  { value: "freemium", label: "Freemium", desc: "Free + paid tiers" },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setBusinessModel(option.value as "free" | "paid" | "freemium")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      businessModel === option.value
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900">{option.label}</p>
                    <p className={ds.muted + " text-sm"}>{option.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 4: Key Metrics */}
            <div className="mb-6">
              <label className={ds.label + " mb-2 block"}>
                What metrics matter most to you?
              </label>
              <p className={ds.muted + " mb-3"}>
                Select all that apply - we'll include user counts and activity by default
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "retention", label: "Retention & Engagement", desc: "Are users coming back? Streaks, at-risk users", icon: Activity },
                  { id: "funnel", label: "Conversion Funnel", desc: "Where do users drop off? Signup → action → return", icon: Target },
                  { id: "speed", label: "Speed Metrics", desc: "How fast do new users engage? Session length", icon: Clock },
                  { id: "features", label: "Feature Usage", desc: "Which features are popular? Which are ignored?", icon: BarChart3 },
                ].map((metric) => (
                  <div
                    key={metric.id}
                    onClick={() => {
                      setSelectedMetrics(prev =>
                        prev.includes(metric.id)
                          ? prev.filter(m => m !== metric.id)
                          : [...prev, metric.id]
                      );
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMetrics.includes(metric.id)
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <metric.icon className={`w-5 h-5 mt-0.5 ${selectedMetrics.includes(metric.id) ? "text-primary" : "text-slate-400"}`} />
                      <div>
                        <p className="font-medium text-slate-900">{metric.label}</p>
                        <p className={ds.muted + " text-sm"}>{metric.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 5: Insights */}
            <div className="mb-6">
              <label className={ds.label + " mb-2 block"}>
                Extra insights you'd like?
              </label>
              <p className={ds.muted + " mb-3"}>
                These are nice-to-haves - select any that sound useful
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: "power-users", label: "Power Users" },
                  { id: "geography", label: "User Locations" },
                  { id: "devices", label: "Device/Browser" },
                  { id: "errors", label: "Error Tracking" },
                  { id: "search", label: "Search Analytics" },
                ].map((insight) => (
                  <div
                    key={insight.id}
                    onClick={() => {
                      setSelectedInsights(prev =>
                        prev.includes(insight.id)
                          ? prev.filter(i => i !== insight.id)
                          : [...prev, insight.id]
                      );
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-colors ${
                      selectedInsights.includes(insight.id)
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className={`font-medium ${selectedInsights.includes(insight.id) ? "text-primary" : "text-slate-700"}`}>
                      {insight.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 6: Features */}
            <div className="mb-6">
              <label className={ds.label + " mb-3 block"}>
                Dashboard features
              </label>
              <div className="space-y-3">
                <div
                  onClick={() => setWantsCharts(!wantsCharts)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    wantsCharts ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={wantsCharts} onCheckedChange={() => {}} className="pointer-events-none" />
                    <div>
                      <span className="font-medium text-slate-900">Charts & Visualizations</span>
                      <span className={ds.muted + " ml-2"}>Line charts for trends, bar charts for breakdowns</span>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setWantsExport(!wantsExport)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    wantsExport ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={wantsExport} onCheckedChange={() => {}} className="pointer-events-none" />
                    <div>
                      <span className="font-medium text-slate-900">Export to CSV</span>
                      <span className={ds.muted + " ml-2"}>Download user data and activity</span>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setWantsAlerts(!wantsAlerts)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    wantsAlerts ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={wantsAlerts} onCheckedChange={() => {}} className="pointer-events-none" />
                    <div>
                      <span className="font-medium text-slate-900">Health Alerts</span>
                      <span className={ds.muted + " ml-2"}>Warnings when metrics drop suddenly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep("admin")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold"
              onClick={() => setStep("admin-prompt")}
              disabled={!mainAction.trim()}
            >
              Generate My Dashboard Prompt
            </Button>
          </div>
        </>
      )}

      {/* Step 4c: Generated Prompt */}
      {step === "admin-prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Your Custom Admin Dashboard Prompt</h4>
                <p className="text-green-600 text-sm">Copy this to Claude Code - it's comprehensive!</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generateAdminPrompt()}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyPrompt(generateAdminPrompt(), "Admin dashboard prompt")}
              >
                <Copy className="w-3 h-3" />
                Copy Prompt
              </Button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className={ds.body}>
                <strong>This is a BIG prompt.</strong> Claude Code might take a few minutes. Let it cook - the result will be worth it.
              </p>
            </div>
          </Card>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
            <input
              type="checkbox"
              id="adminBuilt"
              checked={adminBuilt}
              onChange={(e) => setAdminBuilt(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
            />
            <label htmlFor="adminBuilt" className="text-slate-700 font-medium">
              I've built my admin dashboard and it's working
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep("admin-questions")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Edit Answers
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("admin-learn")}
              disabled={!adminBuilt}
            >
              Dashboard Built <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4d: Learn to Expand */}
      {step === "admin-learn" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">The Secret: Your Dashboard Never Stops Growing</h4>
              </div>
            </div>

            <p className={ds.body + " mb-4"}>
              Here's what the pros know... your admin dashboard is a <strong>living document</strong>. Every time you wonder "I wish I could see..." - you add it.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <p className="text-slate-900 font-bold mb-3">The Pattern for Adding Anything</p>
              <p className={ds.body + " mb-3"}>
                Just tell Claude Code what you want to see. It's that simple.
              </p>
              <div className="bg-white rounded-lg p-3 font-mono text-sm text-slate-800">
                "Add a section to my admin dashboard that shows [what you want to see]"
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className={ds.label}>Examples of things you might add later...</p>

              <div className="grid gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono text-sm text-slate-800">
                    "Add a section showing which users signed up but never did anything - I want to email them"
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono text-sm text-slate-800">
                    "Add a chart showing my busiest hours so I know when to post on social"
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono text-sm text-slate-800">
                    "Show me users who were active last week but haven't logged in this week"
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono text-sm text-slate-800">
                    "Add a section showing average time between signup and first {mainAction || "action"}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-slate-900 font-bold mb-2">The Mindset Shift</p>
              <p className={ds.body}>
                Every time you catch yourself wondering about a number... that's a dashboard feature. "I wonder how many..." → add it. "I wish I knew..." → add it. Your dashboard becomes your superpower.
              </p>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep("admin-prompt")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("done")}
            >
              Got It - Let's Finish <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-900">Auth + Admin Dashboard Done!</h4>
                <p className="text-green-600">
                  Users can log in AND you can see what's happening inside your app.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What You Now Have</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Users can create accounts and log in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Each person sees only their data</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You know how many users you have</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You can see if they're coming back</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You can see if they're using the features</span>
              </div>
            </div>
          </Card>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-700 text-sm">
              <strong>Pro tip:</strong> Check your admin dashboard every day. The numbers tell you what to fix. "50 signups but only 5 came back" = onboarding problem. "Users signing up but not using the feature" = feature problem.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("admin")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                hasAuth: true,
                authAdded: hasAuth === false,
                testPassed: true,
                adminDashboard: true,
                mainAction,
                secondaryActions,
                businessModel,
                selectedMetrics,
                selectedInsights,
                wantsCharts,
                wantsExport,
                wantsAlerts,
                adminBuilt,
              })}
            >
              Complete Day <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
