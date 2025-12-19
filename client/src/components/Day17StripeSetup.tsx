import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  Copy,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  DollarSign,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day17StripeSetupProps {
  dayId: number;
  onComplete: () => void;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  interval: "month" | "year";
  features: string;
  isPopular: boolean;
}

export function Day17StripeSetup({ dayId, onComplete }: Day17StripeSetupProps) {
  const [step, setStep] = useState<"tiers" | "prompt" | "test">("tiers");
  const [tiers, setTiers] = useState<PricingTier[]>([
    { id: "1", name: "Starter", price: "29", interval: "month", features: "Core features, 100 uses/month, Email support", isPopular: false },
    { id: "2", name: "Pro", price: "79", interval: "month", features: "Everything in Starter, Unlimited uses, Priority support, API access", isPopular: true },
  ]);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    stripeAccount: false,
    keysStored: false,
    testCheckout: false,
    webhookWorks: false,
  });
  const { toast } = useToast();

  const addTier = () => {
    setTiers([...tiers, {
      id: Date.now().toString(),
      name: "",
      price: "",
      interval: "month",
      features: "",
      isPopular: false,
    }]);
  };

  const removeTier = (id: string) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter(t => t.id !== id));
    }
  };

  const updateTier = (id: string, field: keyof PricingTier, value: any) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const setPopular = (id: string) => {
    setTiers(tiers.map(t => ({ ...t, isPopular: t.id === id })));
  };

  const generateBuildPrompt = () => {
    const prompt = `Add Stripe payment integration to my app:

PRICING TIERS:
${tiers.map((tier, i) => `
${i + 1}. ${tier.name}${tier.isPopular ? " (MOST POPULAR)" : ""}
   - Price: $${tier.price}/${tier.interval}
   - Features: ${tier.features}`).join("\n")}

IMPLEMENTATION:

1. PRICING PAGE
   - Create a beautiful pricing page at /pricing
   - Show all tiers side by side
   - Highlight the "most popular" tier
   - Clear feature comparison
   - "Get Started" button for each tier

2. CHECKOUT FLOW
   - When user clicks a tier, create Stripe Checkout session
   - Redirect to Stripe's hosted checkout
   - On success, redirect to /dashboard with success message
   - On cancel, redirect back to /pricing

3. SUBSCRIPTION MANAGEMENT
   - Show current plan in user settings
   - "Manage Subscription" button → Stripe Customer Portal
   - Handle plan upgrades/downgrades

4. WEBHOOKS (important!)
   - Handle checkout.session.completed
   - Handle customer.subscription.updated
   - Handle customer.subscription.deleted
   - Update user's subscription status in database

5. ACCESS CONTROL
   - Check subscription status before premium features
   - Show upgrade prompt for free users
   - Grace period for failed payments

Use Stripe keys from secrets:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY

Test with card: 4242 4242 4242 4242`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Stripe Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const toggleTest = (key: keyof typeof testChecklist) => {
    setTestChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allTestsPass = Object.values(testChecklist).every(Boolean);
  const validTiers = tiers.filter(t => t.name && t.price);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Get PAID</h3>
            <p className="text-slate-600 mt-1">
              Time to make MONEY. Set up Stripe and start charging.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Define Tiers", "Build", "Test"].map((label, idx) => {
          const steps = ["tiers", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-green-100 text-green-700" :
                isCurrent ? "bg-green-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 2 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Define Tiers */}
      {step === "tiers" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Define Your Pricing Tiers</h4>
                <p className="text-sm text-slate-500">Most SaaS apps have 2-3 tiers</p>
              </div>
              <Button variant="outline" onClick={addTier} className="gap-2">
                <Plus className="w-4 h-4" /> Add Tier
              </Button>
            </div>

            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <div key={tier.id} className={`p-4 rounded-lg border-2 ${tier.isPopular ? "border-green-500 bg-green-50" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Tier {index + 1}</span>
                      {tier.isPopular && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">POPULAR</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPopular(tier.id)}
                        className={tier.isPopular ? "text-green-600" : "text-slate-400"}
                      >
                        {tier.isPopular ? "★ Popular" : "☆ Set Popular"}
                      </Button>
                      {tiers.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeTier(tier.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                        placeholder="e.g., Pro"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Price ($)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(tier.id, "price", e.target.value)}
                          placeholder="29"
                        />
                        <select
                          value={tier.interval}
                          onChange={(e) => updateTier(tier.id, "interval", e.target.value)}
                          className="h-10 rounded-md border border-slate-200 px-2"
                        >
                          <option value="month">/mo</option>
                          <option value="year">/yr</option>
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-sm font-medium text-slate-700">Features (comma-separated)</label>
                      <Input
                        value={tier.features}
                        onChange={(e) => updateTier(tier.id, "features", e.target.value)}
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pricing Tips */}
          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <h5 className="font-bold text-blue-900 mb-2">💡 Pricing Psychology Tips</h5>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• <strong>The Anchor:</strong> Your highest tier makes the middle one look reasonable</li>
              <li>• <strong>Popular Badge:</strong> Most people choose what others choose</li>
              <li>• <strong>Odd Numbers:</strong> $29 feels cheaper than $30</li>
              <li>• <strong>Start Lower:</strong> You can always raise prices later</li>
            </ul>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={validTiers.length === 0}
            onClick={generateBuildPrompt}
          >
            Generate Build Prompt <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      )}

      {/* Step 2: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Stripe Integration Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-green-500 hover:bg-green-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <h5 className="font-bold text-amber-900 mb-2">Before you build:</h5>
            <ol className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Create Stripe account at <a href="https://stripe.com" target="_blank" className="underline">stripe.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Get API keys from Dashboard → Developers → API Keys</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Store in Replit Secrets: STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY</span>
              </li>
            </ol>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={() => setStep("test")}
          >
            I've Built It - Let's Test <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      )}

      {/* Step 3: Test */}
      {step === "test" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Test Your Payment Flow</h4>
          <p className="text-sm text-slate-500 mb-4">Use test card: 4242 4242 4242 4242</p>

          <div className="space-y-3">
            {[
              { key: "stripeAccount", label: "Stripe account created", desc: "You have a Stripe account with API keys" },
              { key: "keysStored", label: "Keys stored in Replit Secrets", desc: "STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY are set" },
              { key: "testCheckout", label: "Test checkout works", desc: "Click a pricing tier → Checkout loads → Payment succeeds" },
              { key: "webhookWorks", label: "Subscription updates", desc: "After payment, user's plan is updated in your app" },
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
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Your app can make MONEY now!</div>
                  <div className="text-sm text-green-700">Switch to live keys when you're ready to launch.</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>
              Back to Prompt
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!allTestsPass}
              onClick={onComplete}
            >
              Complete Day 17
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
