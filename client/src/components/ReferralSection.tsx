import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Phone, CheckSquare, Video, Sparkles } from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  rewards: {
    launchChecklist: boolean;
    marketingPrompts: boolean;
    critiqueVideo: boolean;
    coachingCall: boolean;
  };
  nextReward: {
    at: number;
    name: string;
  } | null;
}

export function ReferralSection() {
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referral"],
  });

  const copyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get the OG-enabled share URL (has proper image preview)
  const getShareUrl = () => {
    if (!referralData) return '';
    return `${window.location.origin}/api/share/referral?ref=${referralData.referralCode}`;
  };

  const shareToX = () => {
    if (!referralData) return;
    const text = `I'm taking the 21 Day AI SaaS Challenge - building my own AI-powered SaaS from scratch! Join me:`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!referralData) return;
    const subject = "Join me in the 21 Day AI SaaS Challenge";
    const body = `Hey!\n\nI'm building my own AI-powered SaaS in just 21 days with the 21 Day AI SaaS Challenge. No coding required - it's all AI-powered.\n\nYou should join me! Use my link:\n${referralData.referralLink}\n\nLet's build something awesome together!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    if (!referralData) return;
    const text = `I'm building my own AI-powered SaaS in 21 days! No coding required. Join me: ${referralData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-2 border-slate-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!referralData) return null;

  const rewards = [
    {
      count: 1,
      name: "Launch Checklist",
      icon: CheckSquare,
      unlocked: referralData.rewards.launchChecklist,
      description: "47-point checklist covering everything from DNS setup to payment testing - never miss a critical launch step"
    },
    {
      count: 3,
      name: "Marketing Prompt Pack",
      icon: Sparkles,
      unlocked: referralData.rewards.marketingPrompts,
      description: "25+ battle-tested prompts for landing pages, email sequences, ad copy, and social posts that convert"
    },
    {
      count: 5,
      name: "Custom Critique Video",
      icon: Video,
      unlocked: referralData.rewards.critiqueVideo,
      description: "Matt personally reviews your app, sales page, and positioning - 10-15 min video with specific improvements",
      value: "$595"
    },
    {
      count: 10,
      name: "1-Hour Coaching Call",
      icon: Phone,
      unlocked: referralData.rewards.coachingCall,
      description: "Private 1:1 call with Matt to work through your biggest challenges - strategy, tech, marketing, whatever you need",
      value: "$2,495"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{referralData.referralCount}</p>
              <p className="text-slate-600">Friends referred</p>
            </div>
          </div>
          {referralData.nextReward && (
            <div className="text-right">
              <p className="text-sm text-slate-500">Next reward at</p>
              <p className="font-bold text-slate-900">{referralData.nextReward.at} referrals</p>
            </div>
          )}
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Your referral link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 border-2 border-slate-200 text-sm font-mono text-slate-600 truncate">
              {referralData.referralLink}
            </div>
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              onClick={copyLink}
              className={copied ? "bg-green-600 hover:bg-green-600" : ""}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-200">
          <button
            onClick={shareToX}
            className="w-10 h-10 rounded-full bg-black hover:bg-slate-800 flex items-center justify-center transition-colors"
            title="Share on X"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            onClick={shareToLinkedIn}
            className="w-10 h-10 rounded-full bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center transition-colors"
            title="Share on LinkedIn"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button
            onClick={shareToFacebook}
            className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#1466d2] flex items-center justify-center transition-colors"
            title="Share on Facebook"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button
            onClick={shareViaWhatsApp}
            className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1fb855] flex items-center justify-center transition-colors"
            title="Share on WhatsApp"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
          <button
            onClick={shareViaEmail}
            className="w-10 h-10 rounded-full bg-slate-600 hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Share via Email"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </button>
        </div>
      </Card>

      {/* Rewards Progress */}
      <Card className="p-6 border-2 border-slate-200">
        <p className="font-bold text-slate-900 mb-4">Rewards</p>
        <div className="space-y-3">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            return (
              <div
                key={reward.count}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reward.unlocked
                    ? "bg-white border-green-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    reward.unlocked ? "bg-green-100" : "bg-slate-100"
                  }`}>
                    <Icon className={`w-5 h-5 ${reward.unlocked ? "text-green-600" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`font-bold ${reward.unlocked ? "text-green-700" : "text-slate-900"}`}>
                        {reward.name}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        reward.unlocked
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {reward.count} {reward.count === 1 ? 'referral' : 'referrals'}
                      </span>
                    </div>
                    <p className={`text-sm ${reward.unlocked ? "text-green-600" : "text-slate-600"}`}>
                      {reward.description}
                    </p>
                    {reward.value && (
                      <p className={`text-xs font-bold mt-1 ${reward.unlocked ? "text-green-700" : "text-slate-500"}`}>
                        Worth {reward.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
