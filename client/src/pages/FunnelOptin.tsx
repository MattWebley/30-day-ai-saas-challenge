import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { FunnelOptinPage } from "./admin/funnels/funnelTypes";

interface CampaignData {
  campaign: { id: number; name: string; slug: string; ctaText: string | null; ctaUrl: string | null };
  optinPage: FunnelOptinPage;
  visitorToken: string;
}

export default function FunnelOptin() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetch(`/api/funnel/c/${params.slug}${window.location.search}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Campaign not found");
        return res.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !email) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/funnel/c/${params.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, visitorToken: data.visitorToken }),
      });
      if (!res.ok) throw new Error("Registration failed");
      setRegistered(true);
      // Redirect to watch page
      setTimeout(() => {
        setLocation(`/c/${params.slug}/watch`);
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p className="text-slate-500">{error || "This campaign doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const { optinPage } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero Image */}
        {optinPage.heroImageUrl && (
          <div className="mb-8 flex justify-center">
            <img
              src={optinPage.heroImageUrl}
              alt=""
              className="rounded-xl shadow-lg max-w-full max-h-[300px] object-cover"
            />
          </div>
        )}

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 text-center leading-tight mb-4">
          {optinPage.headline}
        </h1>

        {/* Subheadline */}
        {optinPage.subheadline && (
          <p className="text-lg sm:text-xl text-slate-600 text-center mb-8 max-w-lg mx-auto">
            {optinPage.subheadline}
          </p>
        )}

        {/* Registration Form */}
        {!registered ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="h-12 text-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !email}
              className="w-full h-14 text-lg font-bold"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                optinPage.ctaButtonText || "Watch Now"
              )}
            </Button>
            <p className="text-xs text-slate-400 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900">You're in! Redirecting to the presentation...</p>
          </div>
        )}
      </div>
    </div>
  );
}
