import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, Loader2, ExternalLink } from "lucide-react";
import {
  getTheme, type PresentationTheme,
  type FontSettings, getFontSettings, getBodyFont, loadGoogleFont,
  HEADLINE_SIZES, BODY_SIZES, STATEMENT_SIZES, NARRATIVE_SIZES,
} from "@/lib/presentationThemes";

// Check if URL is a Vimeo embed
function isVimeoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("vimeo.com");
}

interface SlideData {
  id: number;
  headline: string | null;
  body: string | null;
  imageUrl: string | null;
  videoUrl?: string | null;
  overlayStyle?: string | null;
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
    watchHeadline: string | null; watchSubheadline: string | null;
    speakerVideoUrl: string | null;
    ctaText: string | null; ctaUrl: string | null; ctaAppearTime: number | null;
  };
  theme?: string | null;
  fontSettings?: FontSettings | null;
  displayMode?: string | null;
  timeline: TimelineEntry[];
  visitorId: number | null;
  variationSetId: number | null;
}

// Parse copywriter markup: *underline*, **accent**, ==highlight==
function renderInlineMarkup(text: string, accentColor?: string) {
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
  return parts.length > 0 ? parts : [text];
}

function renderStyledText(text: string, accentColor?: string) {
  const lines = text.split('\n');
  const allParts: React.ReactNode[] = [];
  let key = 0;
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) allParts.push(<br key={`br-${key++}`} />);
    allParts.push(...renderInlineMarkup(line, accentColor));
  });
  return allParts.length > 0 ? allParts : text;
}

function renderSizedBody(text: string, fonts: FontSettings, theme: PresentationTheme, accentColor?: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  const hasSizePrefixes = lines.some(l => /^###\s|^##\s|^>\s/.test(l));
  if (!hasSizePrefixes) return null;

  const headlineFont = fonts.font;
  const bodyFont = getBodyFont(fonts);

  for (const line of lines) {
    if (line.trim() === '') { elements.push(<div key={key++} className="h-4 sm:h-6" />); continue; }
    let content: string;
    let style: React.CSSProperties;
    let className: string;

    if (line.startsWith('### ')) {
      content = line.slice(4);
      style = { fontFamily: `'${headlineFont}', sans-serif`, fontSize: STATEMENT_SIZES[fonts.headlineSize] || STATEMENT_SIZES.lg, fontWeight: 800, lineHeight: 1.1, letterSpacing: "0.02em" };
      className = `${theme.headlineColor} tracking-tight mb-2`;
    } else if (line.startsWith('## ')) {
      content = line.slice(3);
      style = { fontFamily: `'${headlineFont}', sans-serif`, fontSize: HEADLINE_SIZES[fonts.headlineSize] || HEADLINE_SIZES.lg, fontWeight: 700, lineHeight: 1.15 };
      className = `${theme.headlineColor} mb-2`;
    } else if (line.startsWith('> ')) {
      content = line.slice(2);
      style = { fontFamily: `'${bodyFont}', sans-serif`, fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)", fontWeight: 400, lineHeight: 1.5 };
      className = `${theme.bodyColor} opacity-70 mb-1`;
    } else {
      content = line;
      style = { fontFamily: `'${bodyFont}', sans-serif`, fontSize: BODY_SIZES[fonts.bodySize] || BODY_SIZES.lg, fontWeight: fonts.bodyWeight || 400, lineHeight: 1.5 };
      className = `${theme.bodyColor} mb-1`;
    }
    elements.push(<div key={key++} className={`text-center ${className}`} style={style}>{renderInlineMarkup(content, accentColor)}</div>);
  }
  return elements;
}

// Slide renderer inside the "video player" - adapted for contained layout
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

  const hasMedia = !!(slide.imageUrl || slide.videoUrl);
  const overlay = slide.overlayStyle || "none";
  const useOverlay = hasMedia && overlay !== "none";

  const headlineEl = hasHeadline && (
    <h2
      className={`${hasCustomColor ? "" : theme.headlineColor} leading-[1.1] tracking-tight animate-slide-headline ${isStatement ? "mb-0" : "mb-4"}`}
      style={{
        fontFamily: `'${fonts.font}', sans-serif`,
        fontSize: isStatement
          ? (STATEMENT_SIZES[fonts.headlineSize] || STATEMENT_SIZES.lg)
          : (HEADLINE_SIZES[fonts.headlineSize] || HEADLINE_SIZES.lg),
        fontWeight: fonts.headlineWeight,
        textTransform: fonts.headlineUppercase ? "uppercase" : undefined,
        letterSpacing: fonts.headlineUppercase ? "0.05em" : undefined,
        textShadow: useOverlay ? "0 2px 8px rgba(0,0,0,0.5)" : theme.headlineShadow,
        ...headlineStyle,
      }}
    >
      {renderStyledText(slide.headline!, fonts.accentColor)}
    </h2>
  );

  const bodyEl = hasBody && (() => {
    const sizedContent = renderSizedBody(slide.body!, fonts, theme, fonts.accentColor);
    if (sizedContent) {
      return <div className="max-w-3xl mx-auto animate-slide-body">{sizedContent}</div>;
    }
    return (
      <p
        className={`${fonts.bodyColor ? "" : (isNarrative ? theme.headlineColor : theme.bodyColor)} max-w-2xl mx-auto leading-relaxed animate-slide-body`}
        style={{
          fontFamily: `'${getBodyFont(fonts)}', sans-serif`,
          fontSize: isNarrative
            ? (NARRATIVE_SIZES[fonts.bodySize] || NARRATIVE_SIZES.lg)
            : (BODY_SIZES[fonts.bodySize] || BODY_SIZES.lg),
          fontWeight: isNarrative ? Math.max(fonts.bodyWeight, 400) : fonts.bodyWeight,
          ...(fonts.bodyColor ? { color: fonts.bodyColor } : {}),
          ...(isNarrative ? { animationDelay: "0s" } : {}),
        }}
      >
        {renderStyledText(slide.body!, fonts.accentColor)}
      </p>
    );
  })();

  const isVimeo = isVimeoUrl(slide.videoUrl);
  const mediaBg = hasMedia && (
    <>
      {slide.videoUrl ? (
        isVimeo ? (
          <iframe
            src={`${slide.videoUrl}?background=1&autoplay=1&loop=1&muted=1`}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allow="autoplay; fullscreen"
          />
        ) : (
          <video src={slide.videoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
        )
      ) : (
        <img src={slide.imageUrl!} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
    </>
  );

  // OVERLAY MODE — media fills background, text floats on top
  if (useOverlay) {
    const overlayClasses: Record<string, string> = {
      banner: "absolute inset-x-0 bottom-0 pt-24 pb-8 px-8 text-left",
      center: "absolute inset-0 flex items-center justify-center p-6",
      "lower-third": "absolute inset-x-0 bottom-0 pb-0",
      full: "absolute inset-0 flex items-center justify-center p-6",
    };

    const overlayBgStyles: Record<string, React.CSSProperties> = {
      banner: { background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" },
      center: {},
      "lower-third": {},
      full: { background: "rgba(0,0,0,0.5)" },
    };

    return (
      <div key={animKey} className="w-full h-full relative overflow-hidden">
        {mediaBg}
        <div className={overlayClasses[overlay] || overlayClasses.full} style={overlayBgStyles[overlay] || {}}>
          {overlay === "center" ? (
            <div className="bg-black/60 rounded-2xl px-8 py-6 max-w-2xl text-center backdrop-blur-sm">
              {headlineEl}
              {bodyEl}
            </div>
          ) : overlay === "lower-third" ? (
            <div className="bg-black/75 px-8 py-4 text-left">
              {headlineEl}
              {bodyEl}
            </div>
          ) : (
            <div className="max-w-3xl">
              {headlineEl}
              {bodyEl}
            </div>
          )}
        </div>
      </div>
    );
  }

  // STACKED MODE (default) — media above text, no overlay
  return (
    <div key={animKey} className="w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: theme.ambientGlow }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {slide.imageUrl && !slide.videoUrl && (
          <img src={slide.imageUrl} alt="" className="max-w-full max-h-[35vh] object-contain mb-6 rounded-lg mx-auto animate-slide-fade" />
        )}
        {slide.videoUrl && (
          isVimeo ? (
            <div className="w-full max-h-[35vh] aspect-video mb-6 rounded-lg mx-auto animate-slide-fade overflow-hidden">
              <iframe src={`${slide.videoUrl}?title=0&byline=0&portrait=0`} className="w-full h-full" style={{ border: 0 }} allow="autoplay; fullscreen" allowFullScreen />
            </div>
          ) : (
            <video src={slide.videoUrl} className="max-w-full max-h-[35vh] object-contain mb-6 rounded-lg mx-auto animate-slide-fade" autoPlay muted loop playsInline />
          )
        )}
        {headlineEl}
        {bodyEl}
      </div>
    </div>
  );
}

// CSS animations
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
@keyframes ctaPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
@keyframes ctaSlideIn {
  from { opacity: 0; transform: translateY(30px); }
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
.animate-cta-in {
  animation: ctaSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, ctaPulse 3s ease-in-out 1s infinite;
}
`;

// Text Sync display — one sentence, large black text on white background
const TEXT_SYNC_SIZES: Record<string, string> = {
  sm: "clamp(1.25rem, 3vw, 2rem)",
  md: "clamp(1.5rem, 3.5vw, 2.4rem)",
  lg: "clamp(1.5rem, 4vw, 2.8rem)",
  xl: "clamp(2rem, 5vw, 3.5rem)",
};

function TextSegmentDisplay({ slide, animKey, fonts }: { slide: SlideData; animKey: string | number; fonts?: FontSettings }) {
  const text = slide.body || slide.headline || "";
  const fontFamily = fonts?.font ? `'${fonts.font}', sans-serif` : "'Inter', sans-serif";
  const fontWeight = fonts?.bodyWeight ?? 600;
  const fontSize = fonts?.bodySize ? (TEXT_SYNC_SIZES[fonts.bodySize] || TEXT_SYNC_SIZES.lg) : TEXT_SYNC_SIZES.lg;
  const color = fonts?.bodyColor || undefined;

  return (
    <div key={animKey} className="w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-10">
      <p
        className={`leading-[1.3] animate-slide-headline max-w-3xl ${color ? "" : "text-slate-900"}`}
        style={{ fontFamily, fontSize, fontWeight, color }}
      >
        {text}
      </p>
    </div>
  );
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
  const [progressPercent, setProgressPercent] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speakerVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/funnel/c/${params.slug}/watch`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d: WatchData) => {
        setData(d);
        setLoading(false);
        const f = getFontSettings(d.fontSettings as FontSettings | null);
        loadGoogleFont(f.font);
        if (f.bodyFont) loadGoogleFont(f.bodyFont);
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

  // Track page_view when watch page loads
  const pageViewTracked = useRef(false);
  useEffect(() => {
    if (data && !pageViewTracked.current) {
      pageViewTracked.current = true;
      trackEvent('page_view', { page: 'watch' });
    }
  }, [data, trackEvent]);

  // Track page_leave when user leaves or hides the tab
  useEffect(() => {
    if (!data) return;
    const handleLeave = () => {
      trackEvent('page_leave', {
        watchTimeMs: totalElapsedMs,
        progressPercent: Math.round(progressPercent),
      });
    };
    window.addEventListener('beforeunload', handleLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleLeave();
    });
    return () => {
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [data, totalElapsedMs, progressPercent, trackEvent]);

  // Track play milestones (25%, 50%, 75%, 100%)
  const milestonesTracked = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!started || progressPercent === 0) return;
    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (progressPercent >= m && !milestonesTracked.current.has(m)) {
        milestonesTracked.current.add(m);
        trackEvent(`play_${m}`, { progressPercent: m, watchTimeMs: totalElapsedMs });
      }
    }
  }, [started, progressPercent, totalElapsedMs, trackEvent]);

  // Slide sync + progress
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

      // Update progress bar
      if (audio.duration > 0) {
        setProgressPercent((audio.currentTime / audio.duration) * 100);
      }

      // Keep speaker video in sync with audio (correct drift > 0.3s)
      const sv = speakerVideoRef.current;
      if (sv && sv.src) {
        const drift = Math.abs(sv.currentTime - audio.currentTime);
        if (drift > 0.3) {
          sv.currentTime = audio.currentTime;
        }
      }
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

    // Start speaker video in sync (muted — audio comes from main track)
    if (speakerVideoRef.current) {
      speakerVideoRef.current.currentTime = 0;
      speakerVideoRef.current.play().catch(() => {});
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !data || data.timeline.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Available</h1>
          <p className="text-slate-500">{error || "This content is not available."}</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(data.theme);
  const fonts = getFontSettings(data.fontSettings as FontSettings | null);
  const currentEntry = data.timeline[currentModuleIdx];
  const isVideo = currentEntry?.variant.mediaType === 'video';
  const isTextMode = data.displayMode === "text";
  const headline = data.campaign.watchHeadline || data.campaign.name;
  const subheadline = data.campaign.watchSubheadline;

  // Landing page layout
  return (
    <div className="min-h-screen bg-white">
      <style>{slideAnimation}</style>
      <audio ref={audioRef} onEnded={handleModuleEnd} preload="auto" />

      {/* Page content - centered */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">

        {/* Headline section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
            {headline}
          </h1>
          {subheadline && (
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}
        </div>

        {/* Video player container */}
        <div className={`relative rounded-xl overflow-hidden shadow-2xl border ${isTextMode ? "border-slate-300 bg-white" : "border-slate-200 bg-black"}`}>
          {/* 16:9 aspect ratio wrapper */}
          <div className="relative" style={{ paddingTop: "56.25%" }}>
            <div className={`absolute inset-0 ${isTextMode ? "bg-white" : theme.pageBg}`}>
              {!started ? (
                /* Pre-play overlay */
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer group" onClick={handleStart}>
                  {/* Overlay */}
                  <div className={`absolute inset-0 ${isTextMode ? "bg-slate-100/80" : "bg-black/40"}`} />

                  {/* Play button */}
                  <div className="relative z-10 text-center">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${isTextMode ? "bg-slate-200 border-slate-300" : "bg-white/20 backdrop-blur-sm border-white/40"} border-2 flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300`}>
                      <Play className={`w-10 h-10 sm:w-12 sm:h-12 ${isTextMode ? "text-slate-700" : "text-white"} ml-1`} />
                    </div>
                    <p className={`text-sm mt-4 ${isTextMode ? "text-slate-400" : "text-white/70"}`}>Click to play</p>
                  </div>
                </div>
              ) : isVideo && currentEntry?.variant.videoUrl ? (
                /* Vimeo embed */
                <iframe
                  src={`https://player.vimeo.com/video/${currentEntry.variant.videoUrl.replace(/.*\//, '').replace(/\?.*/, '')}?autoplay=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                /* Audio + Slides/Text player */
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentSlide ? (
                    isTextMode
                      ? <TextSegmentDisplay slide={currentSlide} animKey={currentSlide.id} fonts={fonts} />
                      : <SlideDisplay slide={currentSlide} theme={theme} fonts={fonts} animKey={currentSlide.id} />
                  ) : (
                    <p className={`text-lg ${isTextMode ? "text-slate-400" : theme.progressText}`} style={{ fontFamily: "'Inter', sans-serif" }}>Playing...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Speaker face bubble — video of presenter, plays muted in sync with audio */}
          {!isVideo && data.campaign.speakerVideoUrl && (
            <div className={`absolute bottom-4 right-4 z-20 transition-opacity duration-500 ${started ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <video
                ref={speakerVideoRef}
                src={data.campaign.speakerVideoUrl}
                muted
                playsInline
                preload="auto"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white/30 shadow-lg"
              />
            </div>
          )}

          {/* Progress bar - sits at bottom of player */}
          {started && !isVideo && (
            <div className={`h-1 ${isTextMode ? "bg-slate-200" : "bg-slate-800"}`}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* CTA button - appears below the player */}
        {showCta && data.campaign.ctaText && (
          <div className="mt-8 text-center animate-cta-in">
            <Button
              onClick={handleCtaClick}
              size="lg"
              className="h-14 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 rounded-xl"
              style={{ fontFamily: `'${fonts.font}', sans-serif` }}
            >
              {data.campaign.ctaText} <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
            {data.campaign.ctaUrl && (
              <p className="text-xs text-slate-400 mt-3">Opens in a new tab</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
