import { useState, useEffect, useRef } from "react";
import { Check, Send, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function CritiqueSuccess() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [preferredEmail, setPreferredEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [specificQuestions, setSpecificQuestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const accountEmail = (user as any)?.email || "";
  const emailChanged = preferredEmail !== accountEmail && accountEmail !== "";
  const emailsMatch = !emailChanged || preferredEmail === confirmEmail;
  const purchaseTracked = useRef(false);

  // Track purchase with Meta Pixel (only once)
  useEffect(() => {
    if (window.fbq && !purchaseTracked.current) {
      purchaseTracked.current = true;
      window.fbq('track', 'Purchase', {
        value: 495,
        currency: 'GBP',
        content_name: 'Sales Page Critique',
        content_type: 'product'
      });
    }
  }, []);

  // Pre-populate email from user account
  useEffect(() => {
    if (accountEmail && !preferredEmail) {
      setPreferredEmail(accountEmail);
    }
  }, [accountEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesPageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/critique/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          salesPageUrl,
          preferredEmail,
          productDescription,
          targetAudience,
          specificQuestions
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Critique submission failed:", response.status, errorData);
        alert(`Submission failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting critique request:", error);
      alert("Network error - please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 border-2 border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Got it!</h1>
            <p className="text-slate-600">
              I'll review your page and send you the video within 5 business days.
            </p>
          </div>

          <p className="text-slate-500 text-sm">
            Keep an eye on your inbox. I'll email you when it's ready.
          </p>

          <a href={isLoading ? "#" : (isAuthenticated ? "/dashboard" : "/login")} onClick={(e) => isLoading && e.preventDefault()}>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  {isAuthenticated ? "Back to Dashboard" : "Log In to Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment received!</h1>
          <p className="text-slate-600">
            Now give me what I need to tear your page apart.
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 border-2 border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sales Page URL */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">
                Your sales page URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={salesPageUrl}
                onChange={(e) => setSalesPageUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none text-slate-900"
              />
              <p className="text-sm text-slate-500">
                Make sure it's live and accessible. I can't review a page I can't see.
              </p>
            </div>

            {/* Email for video delivery */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">
                Send video to <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={preferredEmail}
                onChange={(e) => {
                  setPreferredEmail(e.target.value);
                  if (e.target.value === accountEmail) {
                    setConfirmEmail("");
                  }
                }}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none text-slate-900"
              />
              <p className="text-sm text-slate-500">
                Pre-filled with your account email. Change it if you want the video sent elsewhere.
              </p>
            </div>

            {/* Confirm email - only shows when changed from account email */}
            {emailChanged && (
              <div className="space-y-2">
                <label className="block font-bold text-slate-900">
                  Confirm email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Type the email again to confirm"
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-slate-900 ${
                    confirmEmail && !emailsMatch
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-primary"
                  }`}
                />
                {confirmEmail && !emailsMatch && (
                  <p className="text-sm text-red-500">
                    Emails don't match
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Please type this email again (no copy/paste) to confirm it's correct.
                </p>
              </div>
            )}

            {/* Product Description */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">
                What does your product do?
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="In 1-2 sentences, what problem does it solve?"
                rows={2}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none text-slate-900 resize-none"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">
                Who is this for?
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Freelance designers, small e-commerce stores, etc."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none text-slate-900"
              />
            </div>

            {/* Specific Questions */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">
                Anything specific you want me to look at?
              </label>
              <textarea
                value={specificQuestions}
                onChange={(e) => setSpecificQuestions(e.target.value)}
                placeholder="Optional - any particular sections you're unsure about?"
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none text-slate-900 resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || !salesPageUrl.trim() || !emailsMatch}
              size="lg"
              className="w-full h-14 text-lg font-bold"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  Submit for Review
                  <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* What happens next */}
        <div className="text-center space-y-2 text-slate-500 text-sm">
          <p className="font-medium text-slate-700">What happens next?</p>
          <p>I'll review your page and record a video within 5 business days.</p>
          <p>You'll get an email when it's ready.</p>
        </div>

      </div>
    </div>
  );
}
