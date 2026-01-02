import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  Target,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Map,
  Hammer,
  Sparkles,
  MessageSquare,
  Users
} from "lucide-react";

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
      icon: Clock,
      title: "Show Up Daily",
      description: "Some days are quick, some take longer. What matters is you show up and do the work."
    },
    {
      icon: Flame,
      title: "Never Break the Chain",
      description: "Show up every single day. Your streak is your commitment to yourself."
    },
    {
      icon: Target,
      title: "Done > Perfect",
      description: "A shipped product beats a perfect idea. Progress over perfection, always."
    },
    {
      icon: AlertTriangle,
      title: "No Skipping",
      description: "Every day builds on the last. Skip one, and you'll feel lost. Trust the process."
    }
  ];

  const milestones = [
    { day: 4, label: "Idea", icon: Lightbulb, description: "Find & validate your winning idea" },
    { day: 7, label: "Plan", icon: Map, description: "Complete your PRD & roadmap" },
    { day: 14, label: "Build", icon: Hammer, description: "Core features working" },
    { day: 18, label: "Polish", icon: Sparkles, description: "Auth, email & admin ready" },
    { day: 21, label: "Launch", icon: Rocket, description: "Ship it to the world!" }
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Welcome to the 21 Day AI SaaS Challenge
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          In the next 21 days, you'll go from idea to launch-ready product.
          One task a day. No fluff. Just action and accountability.
        </p>
      </div>

      {/* What You'll Achieve */}
      <Card className="p-6 border-2 border-slate-100 bg-white">
        <h2 className="font-bold text-lg text-slate-900 mb-4">Your Journey</h2>
        <div className="grid grid-cols-5 gap-2">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <div key={milestone.label} className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="absolute top-1/2 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-slate-200 -translate-y-1/2" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-700 mt-2">{milestone.label}</p>
                <p className="text-[10px] text-slate-500">Day {milestone.day}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Success Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900">The Rules for Success</h2>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            commitments.size === successRules.length
              ? "bg-primary/10 text-primary"
              : "bg-amber-100 text-amber-700"
          }`}>
            {commitments.size === successRules.length ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                All accepted
              </span>
            ) : (
              `👆 Tap each to accept (${commitments.size}/4)`
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {successRules.map((rule, index) => {
            const Icon = rule.icon;
            const isCommitted = commitments.has(index);

            return (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  isCommitted
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                onClick={() => toggleCommitment(index)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCommitted ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isCommitted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isCommitted ? "text-primary" : "text-slate-900"}`}>
                      {rule.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Your Why - Vision Board */}
      <div className="space-y-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900">What's Your Why?</h2>
          <p className="text-sm text-slate-600">
            Select all that apply. This is what you're really doing this for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whyOptions.map((option, index) => {
            const isSelected = selectedWhys.has(index);

            return (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                onClick={() => toggleWhy(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-slate-900"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{option.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Why */}
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
          <span className="text-2xl">✨</span>
          <Input
            placeholder="Something else? Tell us..."
            value={customWhy}
            onChange={handleCustomWhyChange}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>

        {(selectedWhys.size > 0 || customWhy.trim()) && (
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Your why is set
          </p>
        )}
      </div>

      {/* Income Goal */}
      <div className="space-y-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900">Your 12-Month Income Goal</h2>
          <p className="text-sm text-slate-600">
            What monthly income would be life-changing for you a year from now?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {incomeOptions.map((option) => {
            const isSelected = selectedIncome === option.value;

            return (
              <div
                key={option.value}
                className={`p-3 rounded-lg cursor-pointer border-2 text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                onClick={() => selectIncome(option.value)}
              >
                <p className={`font-bold text-lg ${isSelected ? "text-primary" : "text-slate-900"}`}>
                  {option.label}
                </p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Income */}
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
          <span className="text-2xl">💵</span>
          <Input
            placeholder="Different amount? Type it here..."
            value={customIncome}
            onChange={handleCustomIncomeChange}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>

        {(selectedIncome !== null || customIncome.trim()) && (
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Income goal set
          </p>
        )}
      </div>

      {/* Accountability Message */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">Your Promise to Yourself</h2>
            <p className="text-sm text-slate-600">
              Write a commitment you can come back to when things get tough.
            </p>
          </div>
        </div>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <Textarea
            placeholder="I promise myself that I will finish this challenge because..."
            value={accountabilityMessage}
            onChange={handleMessageChange}
            className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              This is your commitment. Make it count.
            </p>
            <p className={`text-xs font-medium ${
              accountabilityMessage.trim().length >= minMessageLength
                ? "text-primary"
                : "text-slate-400"
            }`}>
              {accountabilityMessage.trim().length >= minMessageLength ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready
                </span>
              ) : (
                `At least ${minMessageLength - accountabilityMessage.trim().length} more characters`
              )}
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
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Share my commitment with the community
                </span>
              </div>
              <p className="text-xs text-slate-400 ml-6 mt-0.5">
                Your promise will be visible to others taking the challenge
              </p>
            </div>
          </div>
        </Card>
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
        <Card className="p-8 border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-white">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">You're officially in!</h2>
              <p className="text-slate-600 mt-2">Your commitment has been locked. Now, what's next?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                onClick={handleStartNow}
                variant="default"
                className="h-auto p-6 rounded-xl flex flex-col items-start text-left gap-0"
              >
                <Rocket className="w-8 h-8 mb-3" />
                <p className="font-bold text-lg">I'm fired up - let's go!</p>
                <p className="text-sm text-white/80 mt-1 font-normal">Start Day 1 right now</p>
              </Button>

              <Button
                onClick={handleStartTomorrow}
                variant="outline"
                className="h-auto p-6 rounded-xl flex flex-col items-start text-left gap-0 border-2"
              >
                <Clock className="w-8 h-8 mb-3 text-slate-400" />
                <p className="font-bold text-lg">I'll start fresh tomorrow</p>
                <p className="text-sm text-slate-500 mt-1 font-normal">Begin Day 1 with full energy</p>
              </Button>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Either way, you've made the commitment. We'll be here when you're ready.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
