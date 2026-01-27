import { useState } from "react";
import { Check, Send, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CritiqueSuccess() {
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [specificQuestions, setSpecificQuestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

          <Link href="/dashboard">
            <Button className="w-full">
              Back to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
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
              disabled={isSubmitting || !salesPageUrl.trim()}
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
