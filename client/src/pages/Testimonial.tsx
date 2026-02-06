import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ds } from "@/lib/design-system";
import { apiRequest, getServerErrorMessage } from "@/lib/queryClient";
import {
  MessageSquare,
  Video,
  Heart,
  CheckCircle2,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Testimonial() {
  const [, setLocation] = useLocation();
  const [testimonial, setTestimonial] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitTestimonial = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/testimonial", {
        testimonial,
        videoUrl: videoUrl || null,
        appName: appName || null,
        appUrl: appUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Testimonial sent! Thank you so much 💚", {
        duration: 4000,
      });
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Something went wrong. Please try again."));
    },
  });

  const canSubmit = testimonial.length >= 20 || videoUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Share Your Experience</h1>
          <p className="text-slate-600 mt-1">Your feedback means everything to me</p>
        </div>

        {submitted ? (
          <Card className={ds.cardWithPadding}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Thank You So Much!</h2>
              <p className={ds.body + " mb-6"}>
                Your testimonial means the world to me. It helps others see what's possible and keeps me motivated to keep improving this challenge.
              </p>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="gap-2"
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Why testimonials matter */}
            <Card className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className={ds.heading}>A Quick Favour</h2>
              </div>
              <div className="space-y-4">
                <p className={ds.body}>
                  You've been through the challenge. You know what it's like. And your honest feedback - good or bad - helps me make it better for the next person.
                </p>
                <p className={ds.body}>
                  If you've got 2 minutes, I'd genuinely love to hear about your experience.
                </p>
              </div>
            </Card>

            {/* Written testimonial */}
            <Card className={`${ds.cardWithPadding} mt-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className={ds.heading}>Your Experience</h3>
              </div>

              <div className={ds.infoBoxHighlight + " mb-4"}>
                <p className={ds.label + " mb-2"}>Some prompts to get you started</p>
                <ul className={ds.body + " space-y-2"}>
                  <li>• What was your experience level before starting?</li>
                  <li>• What surprised you most about the challenge?</li>
                  <li>• How did you find my training style?</li>
                  <li>• What would you tell someone thinking about doing this?</li>
                  <li>• What could I improve?</li>
                </ul>
              </div>

              <Textarea
                placeholder="Be honest - I want to hear the good and the bad..."
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                className="min-h-[150px]"
              />
              <p className={ds.muted + " mt-1"}>{testimonial.length} characters</p>
            </Card>

            {/* Video option */}
            <Card className={`${ds.cardWithPadding} mt-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className={ds.heading}>Video Testimonial</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Optional</span>
                </div>
              </div>
              <p className={ds.body + " mb-4"}>
                If you're comfortable on camera, a quick video means so much more. Just 60 seconds about your experience - nothing scripted, just you being you.
              </p>

              <Input
                placeholder="Paste your Loom or YouTube link here"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className={ds.muted + " mt-1"}>
                Use <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">Loom</a> for quick recording (it's free)
              </p>
            </Card>

            {/* App details - optional */}
            <Card className={`${ds.cardWithPadding} mt-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className={ds.heading}>Your App</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Optional</span>
                </div>
              </div>
              <p className={ds.muted + " mb-4"}>
                If your app is live or close to it, I'd love to see what you built. No pressure if it's not ready yet.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={ds.label + " mb-1 block"}>App Name</label>
                  <Input
                    placeholder="What did you build?"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>

                <div>
                  <label className={ds.label + " mb-1 block"}>App URL</label>
                  <Input
                    placeholder="https://..."
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 mt-6"
              onClick={() => submitTestimonial.mutate()}
              disabled={!canSubmit || submitTestimonial.isPending}
            >
              {submitTestimonial.isPending ? "Sending..." : "Send My Feedback"}
              <Heart className="w-5 h-5" />
            </Button>

            {!canSubmit && (
              <p className="text-center text-slate-500 text-sm mt-2">
                Write at least 20 characters or add a video link
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
