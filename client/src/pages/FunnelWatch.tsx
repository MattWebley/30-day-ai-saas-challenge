import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, Loader2, ExternalLink } from "lucide-react";

interface SlideData {
  id: number;
  headline: string | null;
  body: string | null;
  imageUrl: string | null;
  startTimeMs: number;
}

interface VariantData {
  id: number;
  name: string;
  mediaType: string;
  audioUrl: string | null;
  videoUrl: string | null;
  durationMs: number | null;
}

interface TimelineEntry {
  module: { id: number; name: string; sortOrder: number };
  variant: VariantData;
  slides: SlideData[];
}

interface WatchData {
  campaign: {
    id: number; name: string; slug: string;
    ctaText: string | null; ctaUrl: string | null; ctaAppearTime: number | null;
  };
  timeline: TimelineEntry[];
  visitorId: number | null;
  variationSetId: number | null;
}

export default function FunnelWatch() {
  const params = useParams<{ slug: string }>();
  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<SlideData | null>(null);
  const [showCta, setShowCta] = useState(false);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch watch data
  useEffect(() => {
    fetch(`/api/funnel/c/${params.slug}/watch`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [params.slug]);

  // Track event helper
  const trackEvent = useCallback((eventType: string, eventData?: Record<string, unknown>) => {
    if (!data?.visitorId || !data?.campaign?.id) return;
    fetch("/api/funnel/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: data.visitorId,
        campaignId: data.campaign.id,
        variationSetId: data.variationSetId,
        eventType,
        eventData,
      }),
    }).catch(() => {});
  }, [data]);

  // Slide synchronization
  useEffect(() => {
    if (!started || !data) return;
    const audio = audioRef.current;
    if (!audio) return;

    const entry = data.timeline[currentModuleIdx];
    if (!entry) return;

    const updateSlide = () => {
      const timeMs = audio.currentTime * 1000;
      const slides = entry.slides;
      // Find the last slide whose startTimeMs <= current time
      let active = slides[0] || null;
      for (const s of slides) {
        if (s.startTimeMs <= timeMs) active = s;
        else break;
      }
      setCurrentSlide(active);
    };

    const interval = setInterval(updateSlide, 100);
    updateSlide();
    return () => clearInterval(interval);
  }, [started, data, currentModuleIdx]);

  // Track elapsed time for CTA
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setTotalElapsedMs(prev => prev + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // CTA appearance
  useEffect(() => {
    if (!data?.campaign?.ctaAppearTime) return;
    const ctaTimeMs = (data.campaign.ctaAppearTime || 0) * 1000;
    if (totalElapsedMs >= ctaTimeMs && !showCta) {
      setShowCta(true);
    }
  }, [totalElapsedMs, data, showCta]);

  // Progress tracking (every 30 seconds)
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      trackEvent('play_progress', { watchTimeMs: totalElapsedMs });
    }, 30000);
    trackingRef.current = interval;
    return () => clearInterval(interval);
  }, [started, totalElapsedMs, trackEvent]);

  const handleStart = () => {
    setStarted(true);
    trackEvent('play_start');

    // Start first module
    const entry = data?.timeline[0];
    if (!entry) return;

    if (entry.variant.mediaType === 'audio_slides' && entry.variant.audioUrl) {
      const audio = audioRef.current;
      if (audio) {
        audio.src = entry.variant.audioUrl;
        audio.play().catch(() => {}); // handled by user gesture
      }
    }

    // Set first slide
    if (entry.slides.length > 0) {
      setCurrentSlide(entry.slides[0]);
    }
  };

  const handleModuleEnd = () => {
    const nextIdx = currentModuleIdx + 1;
    if (!data || nextIdx >= data.timeline.length) return; // presentation finished

    setCurrentModuleIdx(nextIdx);
    const entry = data.timeline[nextIdx];
    if (entry.variant.mediaType === 'audio_slides' && entry.variant.audioUrl) {
      const audio = audioRef.current;
      if (audio) {
        audio.src = entry.variant.audioUrl;
        audio.play().catch(() => {});
      }
    }
    if (entry.slides.length > 0) {
      setCurrentSlide(entry.slides[0]);
    }
  };

  const handleCtaClick = () => {
    trackEvent('cta_click');
    if (data?.campaign?.ctaUrl) {
      window.open(data.campaign.ctaUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data || data.timeline.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Presentation Not Available</h1>
          <p className="text-slate-400">{error || "No content available."}</p>
        </div>
      </div>
    );
  }

  const currentEntry = data.timeline[currentModuleIdx];
  const isVideo = currentEntry?.variant.mediaType === 'video';

  // Tap-to-start overlay
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {data.campaign.name}
          </h1>
          <button
            onClick={handleStart}
            className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto hover:bg-white/20 transition-colors"
          >
            <Play className="w-12 h-12 text-white ml-1" />
          </button>
          <p className="text-slate-400">Tap to start the presentation</p>
        </div>
      </div>
    );
  }

  // Video mode — Vimeo embed
  if (isVideo && currentEntry?.variant.videoUrl) {
    const vimeoId = currentEntry.variant.videoUrl.replace(/.*\//, '').replace(/\?.*/, '');
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
        {showCta && <CTABar text={data.campaign.ctaText} onClick={handleCtaClick} />}
      </div>
    );
  }

  // Audio + Slides mode
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <audio
        ref={audioRef}
        onEnded={handleModuleEnd}
        preload="auto"
      />

      {/* Slide Display */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          {currentSlide ? (
            <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-12 min-h-[300px] flex flex-col items-center justify-center text-center">
              {currentSlide.imageUrl && (
                <img
                  src={currentSlide.imageUrl}
                  alt=""
                  className="max-w-full max-h-[250px] object-contain mb-6 rounded-lg"
                />
              )}
              {currentSlide.headline && (
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  {currentSlide.headline}
                </h2>
              )}
              {currentSlide.body && (
                <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
                  {currentSlide.body}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <p className="text-slate-400">Presentation playing...</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Module {currentModuleIdx + 1} of {data.timeline.length}</span>
            <span>·</span>
            <span>{currentEntry?.module.name}</span>
          </div>
        </div>
      </div>

      {/* CTA Bar */}
      {showCta && <CTABar text={data.campaign.ctaText} onClick={handleCtaClick} />}
    </div>
  );
}

function CTABar({ text, onClick }: { text: string | null; onClick: () => void }) {
  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-8 pb-6 px-4">
      <div className="max-w-md mx-auto">
        <Button
          onClick={onClick}
          size="lg"
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
        >
          {text || "Book Your Free Call"} <ExternalLink className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
