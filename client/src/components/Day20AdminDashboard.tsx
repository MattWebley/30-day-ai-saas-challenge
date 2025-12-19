import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Copy,
  CheckCircle2,
  ArrowRight,
  Users,
  DollarSign,
  Activity,
  Settings,
  Search,
  Download,
  UserCog,
  Megaphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day20AdminDashboardProps {
  dayId: number;
  onComplete: () => void;
}

const ADMIN_METRICS = [
  { id: "totalUsers", label: "Total Users", icon: Users, description: "Count of all registered users" },
  { id: "newUsers", label: "New Users (This Week)", icon: Users, description: "Signups in the last 7 days" },
  { id: "activeUsers", label: "Active Users (Today)", icon: Activity, description: "Users who logged in today" },
  { id: "revenue", label: "Revenue (This Month)", icon: DollarSign, description: "Total payments this month" },
  { id: "mrr", label: "MRR", icon: DollarSign, description: "Monthly Recurring Revenue" },
];

const ADMIN_FEATURES = [
  { id: "userList", label: "User List", description: "See all users with search/filter", required: true },
  { id: "userDetails", label: "User Details", description: "Click to see individual user info" },
  { id: "userActions", label: "User Actions", description: "Delete, disable, or modify accounts" },
  { id: "impersonate", label: "Impersonate User", description: "See the app as a specific user" },
  { id: "dataView", label: "Data View", description: "See all content created by users" },
  { id: "exportCsv", label: "Export to CSV", description: "Download user/data lists" },
  { id: "announcements", label: "Send Announcements", description: "Email all users at once" },
];

export function Day20AdminDashboard({ dayId, onComplete }: Day20AdminDashboardProps) {
  const [step, setStep] = useState<"metrics" | "features" | "prompt" | "test">("metrics");
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(["totalUsers", "newUsers", "activeUsers"])
  );
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(["userList", "userDetails", "userActions"])
  );
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    adminOnly: false,
    metricsShow: false,
    userListWorks: false,
    actionsWork: false,
  });
  const { toast } = useToast();

  const toggleMetric = (metricId: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metricId)) {
      newSelected.delete(metricId);
    } else {
      newSelected.add(metricId);
    }
    setSelectedMetrics(newSelected);
  };

  const toggleFeature = (featureId: string) => {
    const feature = ADMIN_FEATURES.find(f => f.id === featureId);
    if (feature?.required) return;

    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const generateBuildPrompt = () => {
    const metrics = Array.from(selectedMetrics).map(id => ADMIN_METRICS.find(m => m.id === id)!);
    const features = Array.from(selectedFeatures).map(id => ADMIN_FEATURES.find(f => f.id === id)!);

    const prompt = `Build an admin dashboard at /admin (protected, admin-only):

ADMIN ACCESS:
- Only accessible if user.email === "${adminEmail}" (or add isAdmin column to users table)
- Redirect non-admins to /dashboard with "Access Denied" message
- Show "Admin" badge in header for admin users

1. OVERVIEW PAGE (/admin)
   Show these metrics at a glance:
${metrics.map(m => `   - ${m.label}: ${m.description}`).join("\n")}

   Layout: Big number cards in a row, each with label above and number below
   Optional: Mini sparkline chart under each metric

2. USER MANAGEMENT (/admin/users)
${features.some(f => f.id === "userList") ? `
   USER LIST:
   - Table with columns: Name, Email, Signup Date, Plan, Last Active
   - Search by name or email
   - Filter by plan (Free/Paid/All)
   - Sort by any column
   - Pagination (25 per page)` : ""}

${features.some(f => f.id === "userDetails") ? `
   USER DETAILS (click a user):
   - Full profile info
   - Activity history
   - Subscription status
   - All their created content` : ""}

${features.some(f => f.id === "userActions") ? `
   USER ACTIONS:
   - "Disable Account" button (soft delete)
   - "Delete Account" button (with confirmation)
   - "Change Plan" dropdown
   - "Reset Password" button (sends email)` : ""}

${features.some(f => f.id === "impersonate") ? `
3. IMPERSONATE USER
   - "View as User" button on user details
   - See exactly what they see
   - Banner showing "Viewing as [User Name]"
   - "Exit Impersonation" button` : ""}

${features.some(f => f.id === "dataView") ? `
4. DATA VIEW (/admin/data)
   - List all [MAIN CONTENT TYPE] from all users
   - Filter by user, date, status
   - Click to view details
   - Bulk actions (delete, export)` : ""}

${features.some(f => f.id === "exportCsv") ? `
5. EXPORT FEATURES
   - "Export Users to CSV" button
   - "Export Data to CSV" button
   - Include all relevant columns` : ""}

${features.some(f => f.id === "announcements") ? `
6. ANNOUNCEMENTS
   - Text area for message
   - "Send to All Users" button
   - Confirmation before sending
   - Uses email system from Day 18` : ""}

STYLING:
- Professional, clean design
- Different color scheme from user dashboard (e.g., darker)
- Clear "Admin" branding
- Fast and functional (doesn't need to be pretty)

Make it work. I'm the only one who sees this.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Admin Prompt Copied!",
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
      <Card className="p-6 border-2 border-slate-700 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Your ADMIN Dashboard</h3>
            <p className="text-slate-600 mt-1">
              The control center where YOU manage everything.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Metrics", "Features", "Build", "Test"].map((label, idx) => {
          const steps = ["metrics", "features", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-slate-200 text-slate-700" :
                isCurrent ? "bg-slate-700 text-white" :
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

      {/* Step 1: Metrics */}
      {step === "metrics" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What metrics do YOU need to see?</h4>
          <p className="text-sm text-slate-500 mb-4">Pick the numbers that matter for your business</p>

          <div className="grid gap-3">
            {ADMIN_METRICS.map((metric) => {
              const Icon = metric.icon;
              const isSelected = selectedMetrics.has(metric.id);
              return (
                <button
                  key={metric.id}
                  onClick={() => toggleMetric(metric.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected ? "border-slate-700 bg-slate-50" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-slate-700" : "text-slate-400"}`} />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{metric.label}</div>
                      <div className="text-sm text-slate-600">{metric.description}</div>
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
            disabled={selectedMetrics.size === 0}
            onClick={() => setStep("features")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Features */}
      {step === "features" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What features do you need?</h4>
          <p className="text-sm text-slate-500 mb-4">User List is required, the rest is optional</p>

          <div className="space-y-3 mb-6">
            {ADMIN_FEATURES.map((feature) => {
              const isSelected = selectedFeatures.has(feature.id);
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  disabled={feature.required}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected ? "border-slate-700 bg-slate-50" : "border-slate-200 hover:border-slate-400"
                  } ${feature.required ? "cursor-default" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} disabled={feature.required} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{feature.label}</span>
                        {feature.required && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Required</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{feature.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-2">Your Admin Email</label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="you@yourdomain.com"
            />
            <p className="text-sm text-slate-500 mt-1">Only this email can access /admin</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("metrics")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!adminEmail}
              onClick={generateBuildPrompt}
            >
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
                <h4 className="font-bold text-slate-900">Your Admin Dashboard Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-slate-700 hover:bg-slate-800">
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
          <h4 className="font-bold text-slate-900 mb-2">Test Your Admin Dashboard</h4>
          <p className="text-sm text-slate-500 mb-4">Make sure you have control</p>

          <div className="space-y-3">
            {[
              { key: "adminOnly", label: "Admin-only access works", desc: "Non-admin users can't access /admin" },
              { key: "metricsShow", label: "Metrics display correctly", desc: "Overview shows your selected metrics" },
              { key: "userListWorks", label: "User list works", desc: "Can see, search, and filter users" },
              { key: "actionsWork", label: "Actions work", desc: "Can click through to user details" },
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
                <LayoutDashboard className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">You have CONTROL!</div>
                  <div className="text-sm text-green-700">See everything, manage everyone, fix problems fast.</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>Back</Button>
            <Button className="flex-1" size="lg" disabled={!allTestsPass} onClick={onComplete}>
              Complete Day 20
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
