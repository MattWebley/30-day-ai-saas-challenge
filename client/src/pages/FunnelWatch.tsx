import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, Loader2, ExternalLink } from "lucide-react";
import {
  getTheme, type PresentationTheme,
  type FontSettings, getFontSettings, loadGoogleFont,
  HEADLINE_SIZES, BODY_SIZES, STATEMENT_SIZES, NARRATIVE_SIZES,
} from "@/lib/presentationThemes";

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
  theme?: string | null;
  fontSettings?: FontSettings | null;
  timeline: TimelineEntry[];
  visitorId: number | null;
  variationSetId: number | null;
}

// Parse copywriter markup: *underline*, **accent**, ==highlight==
function renderStyledText(text: string, accentColor?: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|==(.+?)==)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    if (match[2]) {
      parts.push(<span key={key++} style={{ color: accentColor || "#f59e0b", fontWeight: 700 }}>{match[2]}</span>);
    } else if (match[3]) {
      parts.push(<span key={key++} style={{ textDecoration: "underline", textDecorationThickness: "3px", textUnderlineOffset: "4px" }}>{match[3]}</span>);
    } else if (match[4]) {
      parts.push(<mark key={key++} style={{ background: "linear-gradient(180deg, transparent 55%, #fde047 55%, #fde047 90%, transparent 90%)", color: "inherit", padding: "0 2px" }}>{match[4]}</mark>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

// Shared slide renderer — adapts layout based on content:
//   Headline only  → "statement" — massive, fills the screen
//   Body only       → "narrative" — larger body, centered storytelling
//   Both            → "standard" — headline + supporting body
function SlideDisplay({ slide, theme, fonts, animKey }: {
  slide: SlideData; theme: PresentationTheme; fonts: FontSettings; animKey: string | number;
}) {
  const hasHeadline = !!slide.headline;
  const hasBody = !!slide.body;
  const isStatement = hasHeadline && !hasBody;
  const isNarrative = !hasHeadline && hasBody;

  const hasCustomColor = !!fonts.headlineColor;
  const headlineStyle: React.CSSProperties = hasCustomColor
    ? { color: fonts.headlineColor }
    : theme.headlineGradient
      ? { backgroundImage: theme.headlineGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
      : {};

  return (
    <div key={animKey} className="w-full max-w-4xl mx-auto px-6 sm:px-12 flex flex-col items-center justify-center text-center relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: theme.ambientGlow }} />

      <div className="relative z-10">
        {slide.imageUrl && (
          <img src={slide.imageUrl} alt="" className="max-w-full max-h-[40vh] object-contain mb-8 rounded-lg animate-slide-fade" />
        )}

        {hasHeadline && (
          <h2
            className={`${hasCustomColor ? "" : theme.headlineColor} leading-[1.1] tracking-tight animate-slide-headline ${isStatement ? "mb-0" : "mb-6"}`}
            style={{
              fontFamily: `'${fonts.font}', sans-serif`,
              fontSize: isStatement
                ? (STATEMENT_SIZES[fonts.headlineSize] || STATEMENT_SIZES.lg)
                : (HEADLINE_SIZES[fonts.headlineSize] || HEADLINE_SIZES.lg),
              fontWeight: fonts.headlineWeight,
              textTransform: fonts.headlineUppercase ? "uppercase" : undefined,
              letterSpacing: fonts.headlineUppercase ? "0.05em" : undefined,
              textShadow: theme.headlineShadow,
              ...headlineStyle,
            }}
          >
            {renderStyledText(slide.headline!, fonts.headlineColor || undefined)}
          </h2>
        )}

        {hasBody && (
          <p
            className={`${fonts.bodyColor ? "" : (isNarrative ? theme.headlineColor : theme.bodyColor)} max-w-2xl mx-auto leading-relaxed animate-slide-body`}
            style={{
              fontFamily: `'${fonts.font}', sans-serif`,
              fontSize: isNarrative
                ? (NARRATIVE_SIZES[fonts.bodySize] || NARRATIVE_SIZES.lg)
                : (BODY_SIZES[fonts.bodySize] || BODY_SIZES.lg),
              fontWeight: isNarrative ? Math.max(fonts.bodyWeight, 400) : fonts.bodyWeight,
              ...(fonts.bodyColor ? { color: fonts.bodyColor } : {}),
              ...(isNarrative ? { animationDelay: "0s" } : {}),
            }}
          >
            {renderStyledText(slide.body!, fonts.headlineColor || undefined)}
          </p>
        )}
      </div>
    </div>
  );
}

// CSS animations — cinematic staggered entrance
const slideAnimation = `
@keyframes slideHeadline {
  from { opacity: 0; transform: translateY(30px) scale(0.97); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes slideBody {
  from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes slideFade {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-headline {
  animation: slideHeadline 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-slide-body {
  opacity: 0;
  animation: slideBody 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
}
.animate-slide-fade {
  animation: slideFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

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
  const trackingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/funnel/c/${params.slug}/watch`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d: WatchData) => {
        setData(d);
        setLoading(false);
        // Load saved Google Font
        const f = getFontSettings(d.fontSettings as FontSettings | null);
        loadGoogleFont(f.font);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [params.slug]);

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

  // Slide sync
  useEffect(() => {
    if (!started || !data) return;
    const audio = audioRef.current;
    if (!audio) return;

    const entry = data.timeline[currentModuleIdx];
    if (!entry) return;

    const updateSlide = () => {
      const timeMs = audio.currentTime * 1000;
      const slides = entry.slides;
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

  // Elapsed time for CTA
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

  // Progress tracking (every 30s)
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

    const entry = data?.timeline[0];
    if (!entry) return;

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

  const handleModuleEnd = () => {
    const nextIdx = currentModuleIdx + 1;
    if (!data || nextIdx >= data.timeline.length) return;

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !data || data.timeline.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Presentation Not Available</h1>
          <p className="text-slate-400">{error || "No content available."}</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(data.theme);
  const fonts = getFontSettings(data.fontSettings as FontSettings | null);
  const currentEntry = data.timeline[currentModuleIdx];
  const isVideo = currentEntry?.variant.mediaType === 'video';

  // Tap-to-start overlay
  if (!started) {
    return (
      <div className={`min-h-screen ${theme.overlayBg} flex items-center justify-center`}>
        <style>{slideAnimation}</style>
        <div className="text-center space-y-8 px-4 animate-slide-up">
          <h1
            className={`text-3xl sm:text-4xl font-bold ${theme.overlayText} tracking-tight`}
            style={{ fontFamily: `'${fonts.font}', sans-serif` }}
          >
            {data.campaign.name}
          </h1>
          <button
            onClick={handleStart}
            className={`w-20 h-20 rounded-full ${theme.playBtnBg} border-2 ${theme.playBtnBorder} flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300`}
          >
            <Play className={`w-10 h-10 ${theme.playBtnIcon} ml-1`} />
          </button>
          <p className={`text-sm ${theme.overlaySubtext}`}>Tap to start</p>
        </div>
      </div>
    );
  }

  // Video mode — Vimeo embed
  if (isVideo && currentEntry?.variant.videoUrl) {
    const vimeoId = currentEntry.variant.videoUrl.replace(/.*\//, '').replace(/\?.*/, '');
    return (
      <div className={`min-h-screen ${theme.pageBg} flex flex-col`}>
        <style>{slideAnimation}</style>
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
        {showCta && <CTABar text={data.campaign.ctaText} onClick={handleCtaClick} theme={theme} fontName={fonts.font} />}
      </div>
    );
  }

  // Audio + Slides mode
  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`}>
      <style>{slideAnimation}</style>
      <audio ref={audioRef} onEnded={handleModuleEnd} preload="auto" />

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center py-12">
        {currentSlide ? (
          <SlideDisplay slide={currentSlide} theme={theme} fonts={fonts} animKey={currentSlide.id} />
        ) : (
          <p className={`text-lg ${theme.progressText}`} style={{ fontFamily: `'${fonts.font}', sans-serif` }}>Playing...</p>
        )}
      </div>

      {/* Progress */}
      <div className="px-4 pb-2">
        <div className="max-w-3xl mx-auto">
          <div className={`flex items-center gap-2 text-xs ${theme.progressText}`}>
            <span>Module {currentModuleIdx + 1} / {data.timeline.length}</span>
            <span>·</span>
            <span>{currentEntry?.module.name}</span>
          </div>
        </div>
      </div>

      {/* CTA Bar */}
      {showCta && <CTABar text={data.campaign.ctaText} onClick={handleCtaClick} theme={theme} fontName={fonts.font} />}
    </div>
  );
}

function CTABar({ text, onClick, theme, fontName }: { text: string | null; onClick: () => void; theme: PresentationTheme; fontName: string }) {
  return (
    <div className="sticky bottom-0 pt-8 pb-6 px-4 animate-slide-up" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.9), transparent)` }}>
      <div className="max-w-md mx-auto">
        <Button
          onClick={onClick}
          size="lg"
          className={`w-full h-14 text-lg font-bold ${theme.ctaBg} ${theme.ctaText} shadow-lg`}
          style={{ fontFamily: `'${fontName}', sans-serif` }}
        >
          {text || "Book Your Free Call"} <ExternalLink className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
