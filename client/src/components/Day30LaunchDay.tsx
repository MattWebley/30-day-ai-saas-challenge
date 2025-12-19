import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Rocket,
  CheckCircle2,
  PartyPopper,
  Trophy,
  Sparkles,
  Twitter,
  Linkedin,
  ExternalLink,
  Copy,
  Heart,
  Star,
  Zap,
  ArrowRight,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day30LaunchDayProps {
  dayId: number;
  onComplete: () => void;
}

const JOURNEY_MILESTONES = [
  { week: 1, title: "Foundation", items: ["Found your problem", "Validated the idea", "Defined your user", "Mapped the solution"] },
  { week: 2, title: "Build", items: ["Built the MVP", "Added core features", "Connected database", "Polished the UI"] },
  { week: 3, title: "Superpowers", items: ["Integrated AI", "Set up payments", "Added authentication", "Built admin tools"] },
  { week: 4, title: "Launch", items: ["Optimized speed", "Fixed security", "Built landing page", "LAUNCHED!"] },
];

const LAUNCH_PLACES = [
  { id: "twitter", label: "Twitter/X", icon: Twitter, template: "I just launched my first SaaS! [APP_NAME] helps [TARGET] to [BENEFIT]. Built in 30 days using AI. Check it out: [URL]" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, template: "Excited to announce I just launched [APP_NAME]! After 30 days of building, it's finally live. [APP_NAME] helps [TARGET] to [BENEFIT]. Would love your feedback: [URL]" },
  { id: "reddit", label: "Reddit", icon: ExternalLink, subreddits: ["r/SideProject", "r/startups", "r/indiehackers", "r/SaaS"] },
  { id: "ph", label: "Product Hunt", icon: Star, note: "Launch on a Tuesday or Wednesday for best results" },
  { id: "ih", label: "Indie Hackers", icon: Zap, note: "Post in the 'Launch' section" },
];

export function Day30LaunchDay({ dayId, onComplete }: Day30LaunchDayProps) {
  const [step, setStep] = useState<"celebrate" | "launch" | "share" | "next">("celebrate");
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [benefit, setBenefit] = useState("");
  const [sharedPlaces, setSharedPlaces] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleShared = (placeId: string) => {
    const newShared = new Set(sharedPlaces);
    if (newShared.has(placeId)) {
      newShared.delete(placeId);
    } else {
      newShared.add(placeId);
    }
    setSharedPlaces(newShared);
  };

  const generatePost = (template: string) => {
    return template
      .replace("[APP_NAME]", productName || "my app")
      .replace("[TARGET]", targetAudience || "people")
      .replace("[BENEFIT]", benefit || "solve their problem")
      .replace("[URL]", productUrl || "link in bio");
  };

  const copyPost = (template: string) => {
    navigator.clipboard.writeText(generatePost(template));
    toast({
      title: "Post copied!",
      description: "Paste it and hit send!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-8 border-4 border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <PartyPopper className="w-12 h-12 text-amber-500" />
          <Rocket className="w-12 h-12 text-orange-500" />
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">
          DAY 30: LAUNCH DAY
        </h2>
        <p className="text-xl text-slate-600">
          You did it. Time to ship.
        </p>
      </Card>

      {/* Step 1: Celebrate */}
      {step === "celebrate" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Look how far you've come
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {JOURNEY_MILESTONES.map((milestone) => (
                <div key={milestone.week} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{milestone.week}</span>
                    </div>
                    <div className="font-bold text-slate-900">{milestone.title}</div>
                  </div>
                  <ul className="space-y-1">
                    {milestone.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-green-300 bg-green-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-green-800">30 days. Zero excuses.</div>
                <div className="text-green-700 mt-1">
                  You went from "I have an idea" to "I have a live product."
                  Most people never even start. You finished.
                </div>
              </div>
            </div>
          </Card>

          <Button className="w-full" size="lg" onClick={() => setStep("launch")}>
            Time to Launch <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </>
      )}

      {/* Step 2: Launch Details */}
      {step === "launch" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Your launch details</h4>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Product name</label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="What's your product called?"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Product URL</label>
                <Input
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://your-app.replit.app"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Who is it for?</label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., busy founders, fitness enthusiasts..."
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Main benefit (short)</label>
                <Input
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="e.g., save 10 hours/week, lose weight faster..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-amber-900 mb-3">Before you share</h4>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Do one final test signup → core feature → it works</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>If using Stripe, switch to LIVE mode (not test)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Make sure your landing page URL is the one you're sharing</span>
              </li>
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("celebrate")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!productName || !productUrl}
              onClick={() => setStep("share")}
            >
              Generate Launch Posts <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Share */}
      {step === "share" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-2">Share it with the world</h4>
            <p className="text-sm text-slate-500 mb-4">
              Check off each place as you share. The more places, the more people see it.
            </p>

            <div className="space-y-4">
              {LAUNCH_PLACES.map((place) => {
                const Icon = place.icon;
                const isShared = sharedPlaces.has(place.id);

                return (
                  <div
                    key={place.id}
                    className={`p-4 rounded-lg border-2 ${
                      isShared ? "border-green-300 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${isShared ? "text-green-600" : "text-slate-600"}`} />
                        <span className="font-bold text-slate-900">{place.label}</span>
                        {isShared && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                      <button
                        onClick={() => toggleShared(place.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isShared ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isShared ? "Shared!" : "Mark as shared"}
                      </button>
                    </div>

                    {place.template && (
                      <div className="mt-2">
                        <div className="bg-slate-50 p-3 rounded border text-sm text-slate-700 mb-2">
                          {generatePost(place.template)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPost(place.template!)}
                          className="gap-2"
                        >
                          <Copy className="w-3 h-3" /> Copy post
                        </Button>
                      </div>
                    )}

                    {place.subreddits && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {place.subreddits.map((sub) => (
                          <a
                            key={sub}
                            href={`https://reddit.com/${sub}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {sub}
                          </a>
                        ))}
                      </div>
                    )}

                    {place.note && (
                      <div className="text-sm text-slate-500 mt-2">
                        💡 {place.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("launch")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={() => setStep("next")}
            >
              What's Next <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: What's Next */}
      {step === "next" && (
        <>
          {/* Celebration */}
          <Card className="p-8 border-4 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 text-center">
            <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-4" />
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              You Are Now a Founder
            </div>
            <div className="text-lg text-slate-600 mb-4">
              With a live, paying product on the internet.
            </div>
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-slate-500">
              This is just the beginning.
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4 text-center">Your Launch Stats</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-3xl font-extrabold text-amber-600">30</div>
                <div className="text-sm text-slate-600">Days</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-3xl font-extrabold text-green-600">1</div>
                <div className="text-sm text-slate-600">Live Product</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-3xl font-extrabold text-blue-600">{sharedPlaces.size}</div>
                <div className="text-sm text-slate-600">Launch Posts</div>
              </div>
            </div>
          </Card>

          {/* What's Next */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">What happens now?</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Get your first user</div>
                  <div className="text-sm text-slate-500">
                    Share in communities. Reach out to people who fit your target audience.
                    The first 10 users are the hardest.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Talk to users</div>
                  <div className="text-sm text-slate-500">
                    Every complaint is a feature idea. Every compliment shows what's working.
                    Listen more than you talk.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Iterate fast</div>
                  <div className="text-sm text-slate-500">
                    Ship improvements weekly. Fix bugs immediately.
                    Your speed is your advantage over big companies.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Matt's CTA */}
          <Card className="p-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Want to go further?
                </h4>
                <p className="text-slate-600 mb-4">
                  The 30-day challenge got you to launch. But getting to $10K MRR?
                  That's a different game. If you want personalized guidance from Matt on
                  growing your SaaS, check out the mentorship program.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Mail className="w-4 h-4" />
                    Learn About Mentorship
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Twitter className="w-4 h-4" />
                    Follow Matt on X
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Final */}
          <Card className="p-6 border-2 border-green-500 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-green-800 text-lg">Congratulations, founder.</p>
                <p className="text-green-700">Now go get your first paying customer.</p>
              </div>
              <Button size="lg" onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                <Trophy className="w-5 h-5 mr-2" />
                Complete the Challenge
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
