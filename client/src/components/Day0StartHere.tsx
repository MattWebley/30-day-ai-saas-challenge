import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, Copy, ExternalLink, Award } from "lucide-react";
import { ds } from "@/lib/design-system";
import { VideoSlides } from "@/components/VideoSlides";
import { toast } from "sonner";

interface Day0StartHereProps {
  onComplete: (data?: any) => void;
}

export function Day0StartHere({ onComplete }: Day0StartHereProps) {
  const [commitments, setCommitments] = useState<Set<number>>(new Set());
  const [selectedWhys, setSelectedWhys] = useState<Set<number>>(new Set());
  const [customWhy, setCustomWhy] = useState("");
  const [selectedIncome, setSelectedIncome] = useState<number | null>(null);
  const [customIncome, setCustomIncome] = useState("");
  const [accountabilityMessage, setAccountabilityMessage] = useState("");
  const [shareToDiscussion, setShareToDiscussion] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [showChoice, setShowChoice] = useState(false);

  // Build in Public state
  const [buildInPublicExpanded, setBuildInPublicExpanded] = useState(false);
  const [publicPostLink, setPublicPostLink] = useState("");
  const [publicPostClaimed, setPublicPostClaimed] = useState(false);

  const minMessageLength = 20;

  const whyOptions = [
    { emoji: "💰", label: "Financial freedom", description: "Escape the 9-5 and control my income" },
    { emoji: "🚀", label: "Launch something real", description: "Finally ship a product, not just talk about it" },
    { emoji: "🧠", label: "Learn by doing", description: "Build real skills through action" },
    { emoji: "🏠", label: "Work from anywhere", description: "Location independence and flexibility" },
    { emoji: "👨‍👩‍👧‍👦", label: "Provide for my family", description: "Create security and opportunities for loved ones" },
    { emoji: "🎯", label: "Prove it to myself", description: "Show myself I can actually do this" },
    { emoji: "💼", label: "Build my portfolio", description: "Have something real to show" },
    { emoji: "🔥", label: "Escape my current job", description: "Create an exit strategy" },
  ];

  const incomeOptions = [
    { value: 1000, label: "$1,000/mo", description: "Side income" },
    { value: 2500, label: "$2,500/mo", description: "Significant boost" },
    { value: 5000, label: "$5,000/mo", description: "Replace a salary" },
    { value: 10000, label: "$10,000/mo", description: "Full freedom" },
    { value: 25000, label: "$25,000/mo", description: "Scale up" },
    { value: 50000, label: "$50,000+/mo", description: "Go big" },
  ];

  const successRules = [
    {
      title: "Show Up Daily",
      description: "Some days are quick, some take longer. What matters is you show up and do the work."
    },
    {
      title: "Never Break the Chain",
      description: "Show up every single day. Your streak is your commitment to yourself."
    },
    {
      title: "Done > Perfect",
      description: "A shipped product beats a perfect idea. Progress over perfection, always."
    },
    {
      title: "No Skipping",
      description: "Every day builds on the last. Skip one, and you'll feel lost. Trust the process."
    }
  ];

  const milestones = [
    { day: 0, label: "Start" },
    { day: 1, label: "Idea" },
    { day: 6, label: "Prepare" },
    { day: 10, label: "Build" },
    { day: 19, label: "Launch" },
    { day: 21, label: "Done!" }
  ];

  const checkIfReady = (commitmentsSet: Set<number>, whysSet: Set<number>, customWhyText: string, income: number | null, customIncomeText: string, message: string) => {
    const allCommitted = commitmentsSet.size === successRules.length;
    const hasWhy = whysSet.size > 0 || customWhyText.trim().length > 0;
    const hasIncome = income !== null || customIncomeText.trim().length > 0;
    const hasMessage = message.trim().length >= minMessageLength;
    setIsReady(allCommitted && hasWhy && hasIncome && hasMessage);
  };

  const toggleCommitment = (index: number) => {
    const newCommitments = new Set(commitments);
    if (newCommitments.has(index)) {
      newCommitments.delete(index);
    } else {
      newCommitments.add(index);
    }
    setCommitments(newCommitments);
    checkIfReady(newCommitments, selectedWhys, customWhy, selectedIncome, customIncome, accountabilityMessage);
  };

  const toggleWhy = (index: number) => {
    const newWhys = new Set(selectedWhys);
    if (newWhys.has(index)) {
      newWhys.delete(index);
    } else {
      newWhys.add(index);
    }
    setSelectedWhys(newWhys);
    checkIfReady(commitments, newWhys, customWhy, selectedIncome, customIncome, accountabilityMessage);
  };

  const handleCustomWhyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomWhy(value);
    checkIfReady(commitments, selectedWhys, value, selectedIncome, customIncome, accountabilityMessage);
  };

  const selectIncome = (value: number) => {
    const newValue = selectedIncome === value ? null : value;
    setSelectedIncome(newValue);
    setCustomIncome("");
    checkIfReady(commitments, selectedWhys, customWhy, newValue, "", accountabilityMessage);
  };

  const handleCustomIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomIncome(value);
    setSelectedIncome(null);
    checkIfReady(commitments, selectedWhys, customWhy, null, value, accountabilityMessage);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;
    setAccountabilityMessage(message);
    checkIfReady(commitments, selectedWhys, customWhy, selectedIncome, customIncome, message);
  };

  const handleShowChoice = () => {
    setShowChoice(true);
  };

  const getCompletionData = () => {
    const selectedWhyLabels = Array.from(selectedWhys).map(i => whyOptions[i].label);
    const incomeGoal = selectedIncome || (customIncome.trim() ? customIncome.trim() : null);
    return {
      commitmentsMade: true,
      whyReasons: selectedWhyLabels,
      customWhy: customWhy.trim() || null,
      incomeGoal,
      accountabilityMessage: accountabilityMessage.trim(),
      shareToDiscussion,
      buildInPublic: publicPostClaimed ? publicPostLink.trim() : null,
      timestamp: new Date().toISOString()
    };
  };

  const generatePublicMessage = () => {
    const whyText = selectedWhys.size > 0
      ? Array.from(selectedWhys).map(i => whyOptions[i].label.toLowerCase()).slice(0, 2).join(" and ")
      : null;
    return `I just committed to building a SaaS product from scratch in 21 days.

No excuses. No "someday." Just focused action every single day.

${whyText ? `Why? Because I want ${whyText}.` : "Why? Because it's time to stop talking and start building."}

Day 1 starts now. Follow along if you want to see how this goes.

#BuildInPublic #SaaS #21DayChallenge`;
  };

  const copyPublicMessage = () => {
    navigator.clipboard.writeText(generatePublicMessage());
    toast.success("Copied to clipboard!");
  };

  const handleClaimBadge = () => {
    if (publicPostLink.trim().length > 10) {
      setPublicPostClaimed(true);
      toast.success("Public Builder badge unlocked!");
    }
  };

  const handleStartNow = () => {
    onComplete({
      ...getCompletionData(),
      startDay1Now: true
    });
  };

  const handleStartTomorrow = () => {
    onComplete({
      ...getCompletionData(),
      startDay1Now: false
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <VideoSlides day={0} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Welcome to the 21 Day AI SaaS Challenge
        </h1>
        <p className={`text-lg ${ds.body} max-w-2xl mx-auto`}>
          In the next 21 days, you'll go from idea to launch-ready product.
          One task a day. No fluff. Just action and accountability.
        </p>
      </div>

      {/* What You'll Achieve */}
      <div className={ds.cardWithPadding}>
        <h2 className={`${ds.heading} mb-4`}>Your Journey</h2>
        <div className="grid grid-cols-6 gap-2">
          {milestones.map((milestone, index) => (
            <div key={milestone.label} className="text-center">
              <div className="relative">
                <div className="w-3 h-3 mx-auto rounded-full bg-slate-300" />
                {index < milestones.length - 1 && (
                  <div className="absolute top-1/2 left-[calc(50%+6px)] w-[calc(100%-12px)] h-0.5 bg-slate-200 -translate-y-1/2" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700 mt-2">{milestone.label}</p>
              <p className="text-[10px] text-slate-400">Day {milestone.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why An App */}
      <div className={ds.cardWithPadding}>
        <h2 className={`${ds.heading} mb-2`}>Why An App, Not Videos?</h2>
        <p className={ds.body}>
          The AI space moves fast. Tools change. Best practices evolve. What works today might be outdated next month. By building this as an interactive app instead of pre-recorded videos, I can update the challenge in real-time whenever something major changes. You'll always have the most current strategies and tools - not advice from 6 months ago.
        </p>
      </div>

      {/* Success Rules */}
      <div className={ds.section}>
        <div>
          <div className="flex items-center justify-between">
            <h2 className={ds.heading}>The Rules for Success</h2>
            <span className={`${ds.muted} px-3 py-1 rounded-full bg-slate-50`}>
              {commitments.size === successRules.length
                ? "All accepted"
                : `${commitments.size}/4 accepted`
              }
            </span>
          </div>
          <p className={ds.muted}>
            These 4 rules separate finishers from quitters. Tap each one to commit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {successRules.map((rule, index) => {
            const isCommitted = commitments.has(index);

            return (
              <div
                key={index}
                className={isCommitted ? ds.optionSelected : ds.optionDefault}
                onClick={() => toggleCommitment(index)}
              >
                <div className="flex items-start gap-3">
                  <div className={isCommitted ? ds.checkSelected : ds.checkDefault}>
                    {isCommitted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h3 className={ds.label}>
                      {rule.title}
                    </h3>
                    <p className={`${ds.muted} mt-1`}>
                      {rule.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Why - Vision Board */}
      <div className={ds.section}>
        <div>
          <h2 className={ds.heading}>What's Your Why?</h2>
          <p className={ds.muted}>
            Select all that apply. This is what you're really doing this for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whyOptions.map((option, index) => {
            const isSelected = selectedWhys.has(index);

            return (
              <div
                key={index}
                className={isSelected ? ds.optionSelected : ds.optionDefault}
                onClick={() => toggleWhy(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={ds.label}>
                      {option.label}
                    </p>
                    <p className={`${ds.muted} truncate`}>{option.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Why */}
        <div className={`${ds.infoBoxHighlight} flex items-center gap-3 border-dashed`}>
          <span className="text-2xl">✨</span>
          <Input
            placeholder="Something else? Tell us..."
            value={customWhy}
            onChange={handleCustomWhyChange}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>

        {(selectedWhys.size > 0 || customWhy.trim()) && (
          <p className={`${ds.muted} font-medium`}>
            Your why is set
          </p>
        )}
      </div>

      {/* Income Goal */}
      <div className={ds.section}>
        <div>
          <h2 className={ds.heading}>Your 12-Month Income Goal</h2>
          <p className={ds.muted}>
            What monthly income would be life-changing for you a year from now?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {incomeOptions.map((option) => {
            const isSelected = selectedIncome === option.value;

            return (
              <div
                key={option.value}
                className={`${isSelected ? ds.optionSelected : ds.optionDefault} text-center`}
                onClick={() => selectIncome(option.value)}
              >
                <p className={ds.heading}>
                  {option.label}
                </p>
                <p className={ds.muted}>{option.description}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Income */}
        <div className={`${ds.infoBoxHighlight} flex items-center gap-3 border-dashed`}>
          <span className="text-2xl">💵</span>
          <Input
            placeholder="Different amount? Type it here..."
            value={customIncome}
            onChange={handleCustomIncomeChange}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>

        {(selectedIncome !== null || customIncome.trim()) && (
          <p className={`${ds.muted} font-medium`}>
            Income goal set
          </p>
        )}
      </div>

      {/* Accountability Message */}
      <div className={ds.section}>
        <div>
          <h2 className={ds.heading}>Your Promise to Yourself</h2>
          <p className={ds.muted}>
            Write a commitment you can come back to when things get tough.
          </p>
        </div>

        <div className={ds.cardWithPadding}>
          <Textarea
            placeholder="I promise myself that I will finish this challenge because..."
            value={accountabilityMessage}
            onChange={handleMessageChange}
            className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <p className={ds.muted}>
              This is your commitment. Make it count.
            </p>
            <p className={`text-xs font-medium ${
              accountabilityMessage.trim().length >= minMessageLength
                ? "text-slate-700"
                : "text-slate-400"
            }`}>
              {accountabilityMessage.trim().length >= minMessageLength
                ? "Ready"
                : `At least ${minMessageLength - accountabilityMessage.trim().length} more characters`
              }
            </p>
          </div>

          {/* Share to Discussion */}
          <div
            className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 cursor-pointer"
            onClick={() => setShareToDiscussion(!shareToDiscussion)}
          >
            <Checkbox
              checked={shareToDiscussion}
              onCheckedChange={(checked) => setShareToDiscussion(checked === true)}
            />
            <div className="flex-1">
              <span className={ds.muted}>
                Share my commitment with the community
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Your promise will be visible to others taking the challenge
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Build in Public - Optional */}
      <div className={ds.section}>
        <div
          className={`${ds.cardWithPadding} cursor-pointer transition-all ${
            buildInPublicExpanded ? 'border-primary' : 'hover:border-slate-300'
          }`}
          onClick={() => !buildInPublicExpanded && setBuildInPublicExpanded(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className={ds.heading}>Build in Public</h3>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Optional</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-2xl">
              📣
            </div>
            <div className="flex-1">
              <p className={ds.body}>
                Share your commitment publicly and unlock the Public Builder badge.
              </p>
              <p className={`${ds.muted} mt-1 text-sm`}>
                People who publicly commit are 65% more likely to follow through.
              </p>
            </div>
          </div>

          {buildInPublicExpanded && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4" onClick={(e) => e.stopPropagation()}>
              {/* The Psychology */}
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Why this works:</strong> When you tell people what you're doing, your brain treats it as a promise.
                  Breaking a promise to yourself is easy. Breaking one you made publicly? That stings.
                  Use that to your advantage.
                </p>
              </div>

              {/* Pre-written message */}
              <div>
                <p className={`${ds.label} mb-2`}>Your message (feel free to edit)...</p>
                <div className="relative">
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-line">
                    {generatePublicMessage()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 gap-1"
                    onClick={copyPublicMessage}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                </div>
              </div>

              {/* Where to share */}
              <div>
                <p className={`${ds.label} mb-2`}>Share it on...</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://twitter.com/intent/tweet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-slate-800"
                  >
                    𝕏 Twitter/X <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.linkedin.com/feed/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
                  >
                    Facebook <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Claim badge */}
              {!publicPostClaimed ? (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <p className={ds.label}>Paste your post link...</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://twitter.com/you/status/..."
                      value={publicPostLink}
                      onChange={(e) => setPublicPostLink(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleClaimBadge}
                      disabled={publicPostLink.trim().length < 10}
                    >
                      Claim Badge
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    We won't post anything on your behalf. This is just to verify and award your badge.
                  </p>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-lg p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl shadow-inner">
                    📣
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Public Builder</p>
                    <p className="text-sm text-slate-500 mt-1">Badge unlocked</p>
                  </div>
                </div>
              )}

              {/* Skip option */}
              {!publicPostClaimed && (
                <button
                  onClick={() => setBuildInPublicExpanded(false)}
                  className="text-sm text-slate-400 hover:text-slate-600 underline"
                >
                  Skip for now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      {!showChoice && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleShowChoice}
            disabled={!isReady}
            className={`px-8 py-6 text-lg font-bold ${
              isReady
                ? "bg-primary hover:bg-primary/90"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {isReady ? (
              <>
                I'm Ready - Let's Begin
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                {commitments.size < successRules.length ? (
                  <>
                    Commit to All 4 Rules
                    <span className="ml-2 text-sm font-normal">
                      ({commitments.size}/4)
                    </span>
                  </>
                ) : selectedWhys.size === 0 && !customWhy.trim() ? (
                  "Select Your Why to Continue"
                ) : selectedIncome === null && !customIncome.trim() ? (
                  "Set Your Income Goal to Continue"
                ) : (
                  "Write Your Promise to Continue"
                )}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Choice Screen */}
      {showChoice && (
        <div className={`${ds.cardWithPadding} p-8`}>
          <div className="text-center space-y-6">
            <div>
              <h2 className={ds.heading}>You're officially in!</h2>
              <p className={`${ds.body} mt-2`}>Your commitment has been locked. Now, what's next?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                onClick={handleStartNow}
                variant="default"
                className="h-auto p-6 rounded-xl flex flex-col items-center text-center gap-0"
              >
                <p className="font-bold text-lg">I'm fired up - let's go!</p>
                <p className="text-sm text-white/80 mt-1 font-normal">Start Day 1 right now</p>
              </Button>

              <Button
                onClick={handleStartTomorrow}
                variant="outline"
                className="h-auto p-6 rounded-xl flex flex-col items-center text-center gap-0 border-2"
              >
                <p className="font-bold text-lg">I'll start fresh tomorrow</p>
                <p className={`${ds.muted} mt-1 font-normal`}>Begin Day 1 with full energy</p>
              </Button>
            </div>

            <p className={ds.muted}>
              Either way, you've made the commitment. We'll be here when you're ready.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
