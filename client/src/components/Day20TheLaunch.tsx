import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Rocket,
  Calendar,
  Target,
  Megaphone,
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface Day20TheLaunchProps {
  appName: string;
  onComplete: (data: { launchPlatform: string; launchDate: string; weeklyPlan: string[] }) => void;
}

const LAUNCH_PLATFORMS = [
  {
    id: "producthunt",
    name: "Product Hunt",
    audience: "Tech-savvy early adopters",
    effort: "High (but high reward)",
    best: "Developer tools, productivity apps, AI products",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    audience: "Your existing network + hashtag discovery",
    effort: "Medium",
    best: "If you have 500+ followers or build in public",
  },
  {
    id: "reddit",
    name: "Reddit",
    audience: "Niche communities that match your ICP",
    effort: "Medium (easy to get wrong)",
    best: "Very specific niches with active subreddits",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    audience: "Professionals, B2B buyers",
    effort: "Low-Medium",
    best: "B2B tools, professional services, career tools",
  },
  {
    id: "communities",
    name: "Niche Communities",
    audience: "Slack groups, Discord servers, forums",
    effort: "Low",
    best: "When you're already a member of relevant communities",
  },
];

const LAUNCH_TIMELINE = [
  {
    week: "Week 1",
    title: "Pre-Launch Prep",
    tasks: [
      "Finalize your landing page copy",
      "Set up analytics (know your numbers)",
      "Prepare launch announcement",
      "Reach out to 10 people for early feedback",
    ],
  },
  {
    week: "Week 2",
    title: "Soft Launch",
    tasks: [
      "Share with your inner circle",
      "Get 5-10 real users using it",
      "Collect feedback and fix critical issues",
      "Gather testimonials if possible",
    ],
  },
  {
    week: "Week 3",
    title: "Public Launch",
    tasks: [
      "Post on your chosen platform",
      "Share across all your channels",
      "Engage with every comment/reply",
      "Track signups and conversions",
    ],
  },
  {
    week: "Week 4",
    title: "Post-Launch",
    tasks: [
      "Follow up with everyone who signed up",
      "Ask churned users why they left",
      "Double down on what's working",
      "Plan your next marketing push",
    ],
  },
];

export function Day20TheLaunch({ appName, onComplete }: Day20TheLaunchProps) {
  const [step, setStep] = useState<"intro" | "platform" | "timeline" | "commit" | "complete">("intro");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [launchDate, setLaunchDate] = useState("");
  const [weeklyCommitments, setWeeklyCommitments] = useState<string[]>(["", "", "", ""]);

  const selectedPlatformData = LAUNCH_PLATFORMS.find(p => p.id === selectedPlatform);

  const updateWeeklyCommitment = (index: number, value: string) => {
    const newCommitments = [...weeklyCommitments];
    newCommitments[index] = value;
    setWeeklyCommitments(newCommitments);
  };

  const allCommitmentsFilled = weeklyCommitments.every(c => c.length >= 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Launch Plan</h3>
        <p className="text-slate-600 mt-1">
          A product nobody knows about makes $0. Let's fix that.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                Most Launches Fail Because...
              </h4>
              <p className="text-slate-700">
                They just "put it out there" and hope people find it.
                That's not a strategy. That's a wish.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">A Real Launch Means:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Target className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Picking ONE platform to focus on</p>
                  <p className="text-slate-600">Scattered effort = scattered results</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Setting a launch DATE</p>
                  <p className="text-slate-600">Not "soon" - an actual day on the calendar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Megaphone className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Having a week-by-week action plan</p>
                  <p className="text-slate-600">So you know exactly what to do each day</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("platform")}
          >
            Build My Launch Plan <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Pick Platform */}
      {step === "platform" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 font-medium text-center">
              Pick ONE platform to focus your launch energy. You can expand later.
            </p>
          </Card>

          <div className="space-y-3">
            {LAUNCH_PLATFORMS.map((platform) => (
              <Card
                key={platform.id}
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedPlatform === platform.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedPlatform === platform.id ? "border-primary bg-primary" : "border-slate-300"
                  }`}>
                    {selectedPlatform === platform.id && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{platform.name}</p>
                    <p className="text-slate-600 text-sm mb-2">{platform.audience}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Effort: {platform.effort}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Best for: {platform.best}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedPlatform && (
            <>
              <Card className="p-6 border-2 border-slate-200 bg-white">
                <h4 className="font-bold text-lg mb-3 text-slate-900">Set Your Launch Date</h4>
                <p className="text-slate-600 mb-4">
                  Pick a date 2-4 weeks from now. This gives you time to prepare properly.
                </p>
                <Input
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="text-lg"
                />
              </Card>

              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold gap-2"
                onClick={() => setStep("timeline")}
                disabled={!launchDate}
              >
                See My Timeline <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </>
      )}

      {/* Step 3: Timeline */}
      {step === "timeline" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-bold text-lg text-slate-900">
                Launch Date: {new Date(launchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <p className="text-slate-600">
                Platform: {selectedPlatformData?.name}
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your 4-Week Launch Timeline</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-6">
                {LAUNCH_TIMELINE.map((week, index) => (
                  <div key={week.week} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                      index === 2 ? "bg-primary border-primary" : "bg-white border-slate-300"
                    }`} />

                    <div className={`p-4 rounded-lg ${
                      index === 2 ? "bg-primary/5 border-2 border-primary" : "bg-slate-50"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-slate-900">{week.week}:</span>
                        <span className="text-slate-700">{week.title}</span>
                        {index === 2 && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">LAUNCH</span>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {week.tasks.map((task, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("commit")}
          >
            Make It Real: Commit to Actions <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Commit */}
      {step === "commit" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 font-medium text-center">
              Plans are worthless without action. What will YOU do each week?
            </p>
          </Card>

          <div className="space-y-4">
            {LAUNCH_TIMELINE.map((week, index) => (
              <Card key={week.week} className="p-4 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 2 ? "bg-primary text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-900">{week.week}: {week.title}</span>
                </div>
                <Input
                  placeholder={`My #1 action for ${week.week.toLowerCase()}...`}
                  value={weeklyCommitments[index]}
                  onChange={(e) => updateWeeklyCommitment(index, e.target.value)}
                />
              </Card>
            ))}
          </div>

          {allCommitmentsFilled && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("complete")}
            >
              Lock In My Launch Plan <Rocket className="w-5 h-5" />
            </Button>
          )}

          {!allCommitmentsFilled && (
            <p className="text-center text-slate-500">
              Fill in your #1 action for each week to continue
            </p>
          )}
        </>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">Your Launch Plan is Set</h4>
              <p className="text-slate-700">
                {selectedPlatformData?.name} launch on {new Date(launchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Weekly Commitments</h4>
            <div className="space-y-3">
              {weeklyCommitments.map((commitment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{LAUNCH_TIMELINE[index].week}</p>
                    <p className="text-slate-600">{commitment}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 text-center">
              <strong>Tomorrow:</strong> We'll look at the bigger picture -
              what it takes to turn {appName || "your app"} into a real business.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              launchPlatform: selectedPlatform || "",
              launchDate,
              weeklyPlan: weeklyCommitments
            })}
          >
            Continue to Day 21 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
