import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Terminal,
  CheckCircle2,
  MousePointer,
  Chrome,
  Users,
  Sparkles,
  ListChecks,
  Rocket,
  Globe,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day17AutonomousTestingProps {
  appName: string;
  onComplete: (data: { testingComplete: boolean; published: boolean; customDomain: string }) => void;
}

const TEST_AREAS = [
  { id: "signup", label: "Sign up / Login flow", description: "Can new users create an account and log in?" },
  { id: "main-feature", label: "Main feature", description: "Does the core thing your app does actually work?" },
  { id: "normal-use", label: "Normal use", description: "If a user does everything right, does it work?" },
  { id: "navigation", label: "Basic navigation", description: "Can you get to the main pages without getting lost?" },
  { id: "mobile", label: "Mobile check", description: "Does it work on your phone?" },
];

const PUBLISH_STEPS = [
  { id: "deploy-click", label: "Click Deploy button", description: "Top right of Replit - click the Deploy button" },
  { id: "choose-type", label: "Choose deployment option", description: "Pick the option that fits your app - Replit will guide you" },
  { id: "billing", label: "Set up billing", description: "Follow the prompts to add payment if needed" },
  { id: "live", label: "App is live!", description: "You now have a public URL like yourapp.replit.app" },
];

const DOMAIN_STEPS = [
  { id: "replit-domain", label: "Add domain in Replit", description: "Deployment settings → Custom domains → Add your domain" },
  { id: "copy-records", label: "Copy the DNS records", description: "Replit will show you the records to add (usually CNAME or A records)" },
  { id: "registrar-dns", label: "Add records at your registrar", description: "Go to your domain registrar's DNS settings and add the records" },
  { id: "verify", label: "Verify connection", description: "Wait a few minutes, then Replit will confirm it's connected" },
];

export function Day17AutonomousTesting({ appName, onComplete }: Day17AutonomousTestingProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "methods" | "test" | "publish" | "domain" | "done"
  >("intro");

  const [testedAreas, setTestedAreas] = useState<Set<string>>(new Set());
  const [publishSteps, setPublishSteps] = useState<Set<string>>(new Set());
  const [domainSteps, setDomainSteps] = useState<Set<string>>(new Set());
  const [customDomain, setCustomDomain] = useState("");

  const toggleArea = (id: string) => {
    const newSet = new Set(testedAreas);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setTestedAreas(newSet);
  };

  const togglePublishStep = (id: string) => {
    const newSet = new Set(publishSteps);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setPublishSteps(newSet);
  };

  const toggleDomainStep = (id: string) => {
    const newSet = new Set(domainSteps);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setDomainSteps(newSet);
  };

  const isPublished = publishSteps.has("live");
  const isDomainConnected = domainSteps.has("verify");

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
                <MousePointer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Test Everything</h3>
                <p className={ds.muted}>Click every button. Fill every form. Break things on purpose.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>About tomorrow</strong> - Day 18 has a pause button. You'll use it to keep building until your app is MVP-ready. Could take 1 day, 1 week, or 1 month... it takes what it takes. You get out what you put in. Show up and put in the time each and every day and you'll get there faster.
                </p>
              </div>

              <p className={ds.body}>
                Before you hit that pause button, let's make sure the <strong>important stuff</strong> works. Your core feature. Sign up. The basics. We're not hunting for every bug - just the ones that would stop someone from using your app.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("methods")} className="gap-2">
              Let's Do It <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Methods */}
      {step === "methods" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your Testing Options</h3>
                <p className={ds.muted}>Pick whichever works for you</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Option 1: Manual */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MousePointer className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className={ds.label}>Manual Testing</p>
                    <p className={ds.muted + " mt-1"}>
                      Nothing beats actually using your app. Click every button. Fill every form. Try to break it. Pretend you're a confused user who does everything wrong.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Replit */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-slate-600 font-bold text-sm">R</span>
                  </div>
                  <div>
                    <p className={ds.label}>Replit Autonomous Testing Agent</p>
                    <p className={ds.muted + " mt-1"}>
                      In Replit's AI settings, enable "Autonomous Agent" mode. It can test your app for you - clicking through everything and reporting what's broken.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Claude for Chrome */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Chrome className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className={ds.label}>Claude for Chrome Extension</p>
                    <p className={ds.muted + " mt-1"}>
                      Install the Claude browser extension. Open your app, then ask Claude to "look at this page and tell me if anything seems broken or could be improved." It can see your screen and spot issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 4: Beta Testers */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className={ds.label}>Beta Testers</p>
                    <p className={ds.muted + " mt-1"}>
                      Ask friends, family, or early supporters to try your app. Real users find bugs you'd never think of. Give them access and ask what confused them or didn't work.
                    </p>
                  </div>
                </div>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Best approach?</strong> Use multiple methods. Test it yourself first, then let AI tools and real people find what you missed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("test")} className="gap-2">
              Start Testing <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Test Checklist */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Test Checklist</h3>
                <p className={ds.muted}>Test each area. Fix any bugs you find. Check it off when done.</p>
              </div>
            </div>

            <div className="space-y-3">
              {TEST_AREAS.map((area) => (
                <div
                  key={area.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    testedAreas.has(area.id)
                      ? "border-green-500 bg-white"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => toggleArea(area.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={testedAreas.has(area.id)}
                      onCheckedChange={() => {}}
                      className="mt-0.5 pointer-events-none"
                    />
                    <div>
                      <p className={ds.label}>{area.label}</p>
                      <p className={ds.muted}>{area.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testedAreas.size >= 5 && (
              <div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
                <p className="text-green-600 font-medium">
                  All areas tested - ready to publish!
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("methods")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("publish")}
              disabled={testedAreas.size < 5}
              className="gap-2"
            >
              Publish Your App <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Publish */}
      {step === "publish" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Publish Your App</h3>
                <p className={ds.muted}>Make your app live on the internet</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Time to make your app available to real users. Replit makes this simple - just a few clicks and you'll have a public URL anyone can visit.
              </p>

              <div className="space-y-3">
                {PUBLISH_STEPS.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      publishSteps.has(item.id)
                        ? "border-green-500 bg-white"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => togglePublishStep(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        publishSteps.has(item.id) ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {publishSteps.has(item.id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className={ds.label}>{item.label}</p>
                        <p className={ds.muted}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isPublished && (
                <div className="p-4 bg-white border-2 border-green-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-600 font-medium">Your app is live!</p>
                      <p className={ds.muted}>Now let's connect your custom domain.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("test")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("domain")}
              disabled={!isPublished}
              className="gap-2"
            >
              Connect Domain <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Custom Domain */}
      {step === "domain" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Connect Your Domain</h3>
                <p className={ds.muted}>Make your app available at yourapp.com</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Your app is live, but it's on a .replit.app URL. Let's connect the domain you registered earlier so people can find you at <strong>yourbrand.com</strong>.
              </p>

              <div className="space-y-3">
                {DOMAIN_STEPS.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      domainSteps.has(item.id)
                        ? "border-green-500 bg-white"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => toggleDomainStep(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        domainSteps.has(item.id) ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {domainSteps.has(item.id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className={ds.label}>{item.label}</p>
                        <p className={ds.muted}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>If you used Namecheap</p>
                <p className={ds.body}>
                  Go to Domain List → Manage → Advanced DNS. Add the records Replit gave you. CNAME records usually point to your Replit deployment URL. Changes can take up to 48 hours but usually work within minutes.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>Need help? Ask Claude Code</p>
                <p className={ds.body}>
                  "Help me connect my domain [yourdomain.com] from [Namecheap/GoDaddy/etc] to my Replit deployment. Walk me through it step by step."
                </p>
              </div>

              {/* Test your domain */}
              <div className={ds.cardWithPadding + " border-2"}>
                <p className={ds.label + " mb-2"}>Test your domain</p>
                <p className={ds.muted + " mb-3"}>Enter your domain to test if it's working</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value.replace(/^https?:\/\//, ''))}
                    className="flex-1"
                  />
                  {customDomain && (
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                    >
                      Test <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {customDomain && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className={ds.muted + " text-sm"}>
                        <strong>Not working?</strong> DNS changes can take up to 48 hours to propagate, though it's usually much faster. Try again in a few minutes. If it still doesn't work, double-check the DNS records match what Replit gave you.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isDomainConnected && (
                <div className="p-4 bg-white border-2 border-green-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-600 font-medium">Domain connected!</p>
                      <p className={ds.muted}>Your app is now live at your custom domain.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("publish")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("done")}
              disabled={!isDomainConnected}
              className="gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className="p-6 border-2 border-green-300 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-900">You're Live at Your Own Domain!</h4>
                <p className="text-green-600">
                  Your app is on the internet at your custom URL. This is real.
                </p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>This is a big moment.</strong> You built something and put it out in the world with your own domain. Most people never get this far. Seriously - be proud of yourself.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>What happens next</p>
                <p className={ds.body}>
                  Tomorrow starts the MVP building phase. You'll keep working on your app until it's truly ready for paying customers. Take as long as you need.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("domain")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => onComplete({ testingComplete: true, published: true, customDomain: customDomain.trim() })}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              Complete Day <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
