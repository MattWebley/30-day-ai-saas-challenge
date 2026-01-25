import { Layout } from "@/components/layout/Layout";
import { ReferralSection } from "@/components/ReferralSection";
import { Card } from "@/components/ui/card";

export default function Referrals() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Refer Friends</h1>
          <p className="text-slate-600 mt-2">
            Share the challenge with friends and unlock exclusive rewards.
          </p>
        </div>

        <ReferralSection />

        <Card className="p-6 border-2 border-slate-200">
          <h2 className="font-bold text-lg text-slate-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-slate-900">Share your unique link</p>
                <p className="text-slate-700">Copy your referral link and share it on social media, in messages, or anywhere.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-slate-900">Friends sign up</p>
                <p className="text-slate-700">When someone uses your link and joins the challenge, you get credit.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-slate-900">Unlock rewards</p>
                <p className="text-slate-700">The more friends you refer, the more rewards you unlock - bonus prompts, exclusive content, and even a coaching call with Matt.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
