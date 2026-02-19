import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Server, Shield, CreditCard, Mail, Scale, Search, Smartphone, Users, Megaphone } from "lucide-react";

const STORAGE_KEY = "launch-checklist-v1";

interface ChecklistCategory {
  name: string;
  icon: React.ElementType;
  items: string[];
}

const CHECKLIST: ChecklistCategory[] = [
  {
    name: "Domain & DNS",
    icon: Globe,
    items: [
      "Purchase your domain name",
      "Configure DNS records (A record or CNAME to your host)",
      "Set up SSL certificate (HTTPS)",
      "Configure www to non-www redirect (or vice versa)",
      "Set up custom email address (e.g. hello@yourapp.com)",
    ],
  },
  {
    name: "Hosting & Infrastructure",
    icon: Server,
    items: [
      "Deploy your app to production hosting",
      "Set all environment variables in production",
      "Configure automatic database backups",
      "Set up error monitoring (e.g. Sentry, LogRocket)",
      "Test that your app recovers after a server restart",
    ],
  },
  {
    name: "Authentication & Security",
    icon: Shield,
    items: [
      "Test the full sign-up flow end to end",
      "Test login and logout",
      "Test password reset (or magic link) flow",
      "Verify sessions expire correctly",
      "Check security headers are set (CORS, CSP, X-Frame-Options)",
    ],
  },
  {
    name: "Payments & Billing",
    icon: CreditCard,
    items: [
      "Switch Stripe to live mode (not test mode)",
      "Create your production products and prices in Stripe",
      "Test a real checkout with a real card",
      "Verify Stripe webhooks fire and your app handles them",
      "Test subscription cancellation and visual confirmation",
      "Confirm receipt or invoice email is sent after purchase",
    ],
  },
  {
    name: "Email & Communications",
    icon: Mail,
    items: [
      "Set up your transactional email provider",
      "Test that the welcome email sends and looks correct",
      "Test password reset or verification emails",
      "Verify emails are not going to spam (check SPF and DKIM records)",
    ],
  },
  {
    name: "Legal & Compliance",
    icon: Scale,
    items: [
      "Add a Terms of Service page",
      "Add a Privacy Policy page",
      "Add cookie consent banner if required in your region",
      "Publish your refund or cancellation policy",
    ],
  },
  {
    name: "SEO & Analytics",
    icon: Search,
    items: [
      "Set page titles and meta descriptions on all key pages",
      "Add Open Graph image for social sharing previews",
      "Submit your sitemap to Google Search Console",
      "Set up web analytics (Google Analytics, Plausible, etc.)",
      "Test social share previews on X, LinkedIn, and Facebook",
    ],
  },
  {
    name: "Performance & Mobile",
    icon: Smartphone,
    items: [
      "Test your app on a real mobile device",
      "Check page load speed (aim for under 3 seconds)",
      "Test with a slow network connection (3G throttle in DevTools)",
      "Verify responsive layout works on all key pages",
    ],
  },
  {
    name: "User Experience",
    icon: Users,
    items: [
      "Walk through the full user journey: sign up to getting value",
      "Check every link works (no 404 errors)",
      "Test all form validation and error messages",
      "Review empty states (what a brand new user sees)",
    ],
  },
  {
    name: "Launch Marketing",
    icon: Megaphone,
    items: [
      "Write your launch announcement post",
      "Set up your social media profiles (X, LinkedIn, etc.)",
      "Draft an email to your list or network",
      "Create a launch day timeline with specific actions",
      "Decide your launch price or early-bird offer",
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST.reduce((sum, cat) => sum + cat.items.length, 0);

interface LaunchChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LaunchChecklist({ open, onOpenChange }: LaunchChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-slate-900">
            Launch Checklist
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {TOTAL_ITEMS} things to check before you go live. Tick them off as you go.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700">
            <span className="font-medium">{checkedCount} of {TOTAL_ITEMS} complete</span>
            <span className="font-medium">{Math.round((checkedCount / TOTAL_ITEMS) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / TOTAL_ITEMS) * 100}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6 mt-2">
          {CHECKLIST.map((category) => {
            const Icon = category.icon;
            const catChecked = category.items.filter(
              (_, i) => checked[`${category.name}-${i}`]
            ).length;

            return (
              <div key={category.name}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                  <span className="text-slate-600 ml-auto">
                    {catChecked}/{category.items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, i) => {
                    const key = `${category.name}-${i}`;
                    const isChecked = !!checked[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isChecked
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggle(key)}
                          className="mt-0.5"
                        />
                        <span
                          className={`text-slate-700 ${
                            isChecked ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
