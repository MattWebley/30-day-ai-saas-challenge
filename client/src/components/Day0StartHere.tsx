import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check } from "lucide-react";
import { ds } from "@/lib/design-system";
import { VideoSlides } from "@/components/VideoSlides";

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
    { day: 4, label: "Plan" },
    { day: 10, label: "Build" },
    { day: 19, label: "Launch" }
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
      timestamp: new Date().toISOString()
    };
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
