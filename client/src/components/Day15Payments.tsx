import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Copy,
  Terminal,
  Key,
  Lock,
  CreditCard,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day15PaymentsProps {
  appName: string;
  onComplete: (data: { paymentsSetup: boolean }) => void;
}

export function Day15Payments({ appName, onComplete }: Day15PaymentsProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "signup" | "keys" | "secrets" | "build" | "test" | "done"
  >("intro");

  const [signupDone, setSignupDone] = useState(false);
  const [keysDone, setKeysDone] = useState(false);
  const [secretsDone, setSecretsDone] = useState(false);
  const [builtCheckout, setBuiltCheckout] = useState(false);
  const [paymentWorked, setPaymentWorked] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const claudePrompt = `Add Stripe payments to my app.

I want a simple checkout flow where users can pay for [describe what they're paying for - subscription, one-time purchase, etc.].

Use test mode for now. My Stripe keys are in Replit Secrets as:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY

Create a checkout button that takes users to Stripe's hosted checkout page. After payment, redirect them back to my app.`;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Intro */}
      {step === "intro" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Add Payments to Your App</h3>
                <p className={ds.muted}>The moment your app can make money</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                This is a BIG milestone. Once you add payments, you have a real business - not just a project.
              </p>

              <p className={ds.body}>
                We'll use Stripe - it's what everyone uses. Free to set up, and you only pay when customers pay you (about 2.9% + 30p per transaction).
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Test mode</strong> - We'll use Stripe's test mode so no real money is involved. You can test the full checkout flow with fake card numbers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("signup")} className="gap-2">
              Let's Add Payments <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 1: Sign up for Stripe */}
      {step === "signup" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 1: Create a Stripe Account</h3>
                <p className={ds.muted}>Free to create, no card required</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">dashboard.stripe.com/register</a></li>
                  <li>Create your account with email</li>
                  <li>You don't need to verify your business yet - test mode works immediately</li>
                </ol>
              </div>

              <a
                href="https://dashboard.stripe.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#635BFF] text-white rounded-lg hover:bg-[#5851EA] font-medium"
              >
                Create Stripe Account <ExternalLink className="w-4 h-4" />
              </a>

              <div
                className={signupDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSignupDone(!signupDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={signupDone} onCheckedChange={() => setSignupDone(!signupDone)} />
                  <span className={ds.body + " font-medium"}>I've created my Stripe account</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("keys")} disabled={!signupDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Get API Keys */}
      {step === "keys" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 2: Get Your Test API Keys</h3>
                <p className={ds.muted}>You need two keys - publishable and secret</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <p className="font-bold text-amber-800 mb-2">IMPORTANT: Use Test Mode</p>
                <p className={ds.body + " text-amber-800"}>
                  Make sure the toggle in the top-right says "Test mode" (it should be orange). Never use live keys during development.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">dashboard.stripe.com/test/apikeys</a></li>
                  <li>You'll see two keys</li>
                  <li><strong>Publishable key</strong> starts with <code className="bg-slate-200 px-1 rounded">pk_test_</code></li>
                  <li><strong>Secret key</strong> starts with <code className="bg-slate-200 px-1 rounded">sk_test_</code></li>
                  <li>Click "Reveal test key" to see the secret key</li>
                  <li>Copy both somewhere safe (notepad is fine)</li>
                </ol>
              </div>

              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
              >
                Get API Keys <ExternalLink className="w-4 h-4" />
              </a>

              <div
                className={keysDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setKeysDone(!keysDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={keysDone} onCheckedChange={() => setKeysDone(!keysDone)} />
                  <span className={ds.body + " font-medium"}>I've copied both API keys</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("signup")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("secrets")} disabled={!keysDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Add to Replit Secrets */}
      {step === "secrets" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 3: Add Keys to Replit Secrets</h3>
                <p className={ds.muted}>Keep your keys safe and hidden</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-800 mb-2">THE EASY WAY</p>
                <p className={ds.body + " text-green-800 mb-3"}>
                  Tell Replit Agent...
                </p>
                <div className="relative">
                  <pre className="bg-white p-3 rounded-lg text-sm font-mono border border-green-200 whitespace-pre-wrap text-slate-800">
{`Add these secrets:
STRIPE_SECRET_KEY = [paste your sk_test_ key]
STRIPE_PUBLISHABLE_KEY = [paste your pk_test_ key]`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("Add these secrets:\nSTRIPE_SECRET_KEY = \nSTRIPE_PUBLISHABLE_KEY = ", "Prompt")}
                    className="absolute top-2 right-2 gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>Manual way...</p>
                <ol className={ds.muted + " space-y-1 list-decimal list-inside text-sm"}>
                  <li>Click Tools in the left sidebar</li>
                  <li>Click Secrets</li>
                  <li>Add two secrets with the exact names above</li>
                </ol>
              </div>

              <div
                className={secretsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSecretsDone(!secretsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={secretsDone} onCheckedChange={() => setSecretsDone(!secretsDone)} />
                  <span className={ds.body + " font-medium"}>I've added both Stripe keys to Secrets</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("keys")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("build")} disabled={!secretsDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Build checkout */}
      {step === "build" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 4: Build Your Checkout</h3>
                <p className={ds.muted}>Tell Claude Code what you want to charge for</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Copy this prompt and customize the part in brackets to match what you're selling.
              </p>

              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{claudePrompt}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(claudePrompt, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Examples of what to charge for</p>
                <ul className={ds.muted + " mt-2 space-y-1 list-disc list-inside"}>
                  <li>Monthly subscription ($9/month for premium features)</li>
                  <li>One-time purchase ($29 for lifetime access)</li>
                  <li>Credits/tokens ($10 for 100 AI credits)</li>
                </ul>
              </div>

              <div
                className={builtCheckout ? ds.optionSelected : ds.optionDefault}
                onClick={() => setBuiltCheckout(!builtCheckout)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={builtCheckout} onCheckedChange={() => setBuiltCheckout(!builtCheckout)} />
                  <span className={ds.body + " font-medium"}>I've built my checkout flow</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("secrets")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("test")} disabled={!builtCheckout} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Test it */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 5: Test Your Checkout</h3>
                <p className={ds.muted}>Make a test payment with Stripe's fake card</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#635BFF]/10 border-2 border-[#635BFF]/30 rounded-lg p-4">
                <p className="font-bold text-[#635BFF] mb-2">Stripe Test Card</p>
                <div className="flex items-center gap-3">
                  <code className="bg-white px-3 py-2 rounded-lg text-lg font-mono border border-[#635BFF]/20">
                    4242 4242 4242 4242
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("4242424242424242", "Test card number")}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className={ds.muted + " mt-2"}>
                  Use any future date for expiry (like 12/34) and any 3 digits for CVC.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>Test it now</p>
                <ol className={ds.body + " space-y-1 list-decimal list-inside"}>
                  <li>Click your checkout/payment button</li>
                  <li>Enter the test card number above</li>
                  <li>Complete the payment</li>
                  <li>Check your <a href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe dashboard</a> - you should see the payment!</li>
                </ol>
              </div>

              <div
                className={paymentWorked ? ds.optionSelected : ds.optionDefault}
                onClick={() => setPaymentWorked(!paymentWorked)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={paymentWorked} onCheckedChange={() => setPaymentWorked(!paymentWorked)} />
                  <span className={ds.body + " font-medium"}>I made a test payment and saw it in Stripe!</span>
                </div>
              </div>

              {!paymentWorked && (
                <div className={ds.infoBoxHighlight}>
                  <p className={ds.label}>Not working?</p>
                  <ul className={ds.muted + " mt-2 space-y-2 list-disc list-inside"}>
                    <li>Check the Replit console for errors</li>
                    <li>
                      <span className="font-medium text-slate-700">Ask Claude Code</span> "The Stripe checkout isn't working. Can you check if it's set up correctly and show me any errors?"
                    </li>
                    <li>Make sure you used <code className="bg-slate-200 px-1 rounded">pk_test_</code> and <code className="bg-slate-200 px-1 rounded">sk_test_</code> keys (not live keys)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("build")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} disabled={!paymentWorked} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your App Can Take Payments!</h3>
                <p className={ds.muted}>This is a huge milestone</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-800 mb-2">You just built a business</p>
                <p className={ds.body + " text-green-800"}>
                  Your app can now accept real payments. When you're ready to go live, just switch your Stripe keys from test to live mode.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Before going live, remember to</p>
                <ul className={ds.muted + " mt-2 space-y-1 list-disc list-inside"}>
                  <li>Complete Stripe's verification (they'll ask for business details)</li>
                  <li>Replace test keys with live keys in Replit Secrets</li>
                  <li>Test one real payment with a small amount</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => onComplete({ paymentsSetup: true })}
              className="gap-2"
            >
              Complete Day <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
