import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Play, ChevronLeft, ChevronRight, ArrowLeft, Loader2, Palette, Type, Check, Sparkles, Mic, Pencil, Zap,
} from "lucide-react";
import {
  getTheme, PRESENTATION_THEMES, type PresentationTheme,
  type FontSettings, DEFAULT_FONT_SETTINGS, getFontSettings, getBodyFont,
  GOOGLE_FONTS, FONT_PAIRINGS,
  HEADLINE_SIZES, BODY_SIZES, STATEMENT_SIZES, NARRATIVE_SIZES,
  WEIGHT_OPTIONS, SIZE_OPTIONS,
  HEADLINE_COLOR_PRESETS, loadAllFonts, loadGoogleFont,
} from "@/lib/presentationThemes";

// Check if URL is a Vimeo embed
function isVimeoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("vimeo.com");
}

// Convert any Vimeo URL to a proper player embed URL
function toVimeoEmbed(url: string): string {
  // Already an embed URL — leave it alone
  if (url.includes("player.vimeo.com/video/")) return url;
  // Convert vimeo.com/ID or vimeo.com/ID/HASH to embed format
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (match) {
    const id = match[1];
    const hash = match[2];
    return hash
      ? `https://player.vimeo.com/video/${id}?h=${hash}`
      : `https://player.vimeo.com/video/${id}`;
  }
  return url;
}

// Build Vimeo iframe src: converts to embed URL + appends params safely
function vimeoSrc(rawUrl: string, params: string): string {
  const base = toVimeoEmbed(rawUrl);
  return base + (base.includes('?') ? '&' : '?') + params;
}

interface SlideData {
  id: number;
  headline: string | null;
  body: string | null;
  scriptNotes: string | null;
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

interface PreviewData {
  presentation: { id: number; name: string; theme?: string | null; fontSettings?: FontSettings | null; displayMode?: string | null };
  timeline: TimelineEntry[];
}

// Parse copywriter markup: *underline*, **accent**, ==highlight==
// Render inline markup: **accent**, *underline*, ==highlight==
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

// Simple text renderer — handles \n line breaks + inline markup (no size prefixes)
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

// Multi-size body renderer — each line can have a size prefix:
//   ### line = HUGE (statement size, bold)
//   ## line  = LARGE (headline size, bold)
//   > line   = SMALL (context size)
//   line     = MEDIUM (default body size)
// Empty lines create extra spacing between blocks.
function renderSizedBody(text: string, fonts: FontSettings, theme: PresentationTheme, accentColor?: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Check if any lines use size prefixes — if not, fall back to simple rendering
  const hasSizePrefixes = lines.some(l => /^###\s|^##\s|^>\s/.test(l));
  if (!hasSizePrefixes) return null; // signal to use default rendering

  const headlineFont = fonts.font;
  const bodyFont = getBodyFont(fonts);

  for (const line of lines) {
    // Empty line = spacer
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-4 sm:h-6" />);
      continue;
    }

    let content: string;
    let style: React.CSSProperties;
    let className: string;

    if (line.startsWith('### ')) {
      // HUGE — statement/impact size
      content = line.slice(4);
      style = {
        fontFamily: `'${headlineFont}', sans-serif`,
        fontSize: STATEMENT_SIZES[fonts.headlineSize] || STATEMENT_SIZES.lg,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "0.02em",
      };
      className = `${theme.headlineColor} tracking-tight mb-2`;
    } else if (line.startsWith('## ')) {
      // LARGE — headline size
      content = line.slice(3);
      style = {
        fontFamily: `'${headlineFont}', sans-serif`,
        fontSize: HEADLINE_SIZES[fonts.headlineSize] || HEADLINE_SIZES.lg,
        fontWeight: 700,
        lineHeight: 1.15,
      };
      className = `${theme.headlineColor} mb-2`;
    } else if (line.startsWith('> ')) {
      // SMALL — context size
      content = line.slice(2);
      style = {
        fontFamily: `'${bodyFont}', sans-serif`,
        fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
        fontWeight: 400,
        lineHeight: 1.5,
      };
      className = `${theme.bodyColor} opacity-70 mb-1`;
    } else {
      // MEDIUM — regular body size
      content = line;
      style = {
        fontFamily: `'${bodyFont}', sans-serif`,
        fontSize: BODY_SIZES[fonts.bodySize] || BODY_SIZES.lg,
        fontWeight: fonts.bodyWeight || 400,
        lineHeight: 1.5,
      };
      className = `${theme.bodyColor} mb-1`;
    }

    elements.push(
      <div key={key++} className={`text-center ${className}`} style={style}>
        {renderInlineMarkup(content, accentColor)}
      </div>
    );
  }

  return elements;
}

// Shared slide renderer - adapts layout based on content:
//   Headline only  → "statement" - massive, fills the screen
//   Body only       → "narrative" - larger body, centered storytelling
//   Both            → "standard" - headline + supporting body
function SlideDisplay({ slide, theme, fonts, animKey, editable, onSave }: {
  slide: SlideData; theme: PresentationTheme; fonts: FontSettings; animKey: string | number;
  editable?: boolean;
  onSave?: (slideId: number, field: 'headline' | 'body', value: string) => void;
}) {
  const [editingField, setEditingField] = useState<'headline' | 'body' | null>(null);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset editing when slide changes
  useEffect(() => { setEditingField(null); }, [slide.id]);

  // Auto-focus and auto-resize textarea on edit start
  useEffect(() => {
    if (editingField && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingField]);

  const startEditing = (field: 'headline' | 'body') => {
    if (!editable) return;
    setEditingField(field);
    setEditValue(field === 'headline' ? (slide.headline || '') : (slide.body || ''));
  };

  const cancelEditing = () => { setEditingField(null); setEditValue(''); };

  const saveEditing = () => {
    if (!editingField || !onSave) { setEditingField(null); return; }
    const original = editingField === 'headline' ? (slide.headline || '') : (slide.body || '');
    const trimmed = editValue.trim();
    if (trimmed !== original) {
      onSave(slide.id, editingField, trimmed);
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); cancelEditing(); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); saveEditing(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

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

  const editableHoverClass = editable ? 'cursor-pointer rounded-lg px-3 -mx-3 hover:bg-white/[0.07] transition-colors' : '';

  const headlineFontStyle: React.CSSProperties = {
    fontFamily: `'${fonts.font}', sans-serif`,
    fontSize: isStatement
      ? (STATEMENT_SIZES[fonts.headlineSize] || STATEMENT_SIZES.lg)
      : (HEADLINE_SIZES[fonts.headlineSize] || HEADLINE_SIZES.lg),
    fontWeight: fonts.headlineWeight,
    textTransform: fonts.headlineUppercase ? "uppercase" : undefined,
    letterSpacing: fonts.headlineUppercase ? "0.05em" : undefined,
  };

  const bodyFontStyle: React.CSSProperties = {
    fontFamily: `'${getBodyFont(fonts)}', sans-serif`,
    fontSize: isNarrative
      ? (NARRATIVE_SIZES[fonts.bodySize] || NARRATIVE_SIZES.lg)
      : (BODY_SIZES[fonts.bodySize] || BODY_SIZES.lg),
    fontWeight: isNarrative ? Math.max(fonts.bodyWeight, 400) : fonts.bodyWeight,
  };

  const hasMedia = !!(slide.imageUrl || slide.videoUrl);
  const overlay = slide.overlayStyle || "none";
  // Videos always fill the background (overlay mode) — even if no overlay style is set, default to "full"
  const useOverlay = hasMedia && (overlay !== "none" || !!slide.videoUrl);
  const effectiveOverlay = overlay !== "none" ? overlay : "full";

  // Text content block (reused in both stacked and overlay modes)
  const headlineEl = hasHeadline && (
    editingField === 'headline' ? (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={handleTextareaChange}
        onBlur={saveEditing}
        onKeyDown={handleKeyDown}
        className={`w-full bg-transparent border-2 border-dashed border-white/30 rounded-lg text-center resize-none outline-none leading-[1.1] tracking-tight p-2 ${isStatement ? 'mb-0' : 'mb-6'}`}
        style={{ ...headlineFontStyle, color: fonts.headlineColor || '#ffffff' }}
        rows={1}
      />
    ) : (
      <h2
        className={`${hasCustomColor ? "" : theme.headlineColor} leading-[1.1] tracking-tight animate-slide-headline ${isStatement ? "mb-0" : "mb-6"} ${editableHoverClass}`}
        style={{ ...headlineFontStyle, textShadow: useOverlay ? "0 2px 8px rgba(0,0,0,0.5)" : theme.headlineShadow, ...headlineStyle }}
        onClick={() => startEditing('headline')}
      >
        {renderStyledText(slide.headline!, fonts.accentColor)}
        {editable && <Pencil className="w-4 h-4 inline-block ml-3 opacity-0 group-hover:opacity-30 transition-opacity align-middle" />}
      </h2>
    )
  );

  const bodyEl = hasBody && (
    editingField === 'body' ? (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={handleTextareaChange}
        onBlur={saveEditing}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-2 border-dashed border-white/30 rounded-lg text-center resize-none outline-none leading-relaxed p-2 max-w-2xl mx-auto"
        style={{ ...bodyFontStyle, color: fonts.bodyColor || 'rgba(255,255,255,0.7)' }}
        rows={2}
      />
    ) : (() => {
      const sizedContent = renderSizedBody(slide.body!, fonts, theme, fonts.accentColor);
      if (sizedContent) {
        return (
          <div className={`max-w-3xl mx-auto animate-slide-body ${editableHoverClass}`} onClick={() => startEditing('body')}>
            {sizedContent}
            {editable && <Pencil className="w-3.5 h-3.5 inline-block ml-2 opacity-0 group-hover:opacity-30 transition-opacity align-middle" />}
          </div>
        );
      }
      return (
        <p
          className={`${fonts.bodyColor ? "" : (isNarrative ? theme.headlineColor : theme.bodyColor)} max-w-2xl mx-auto leading-relaxed animate-slide-body ${editableHoverClass}`}
          style={{ ...bodyFontStyle, ...(fonts.bodyColor ? { color: fonts.bodyColor } : {}), ...(isNarrative ? { animationDelay: "0s" } : {}) }}
          onClick={() => startEditing('body')}
        >
          {renderStyledText(slide.body!, fonts.accentColor)}
          {editable && <Pencil className="w-3.5 h-3.5 inline-block ml-2 opacity-0 group-hover:opacity-30 transition-opacity align-middle" />}
        </p>
      );
    })()
  );

  // Media background element (used in overlay mode)
  const isVimeo = isVimeoUrl(slide.videoUrl);
  const mediaBg = hasMedia && (
    <>
      {slide.videoUrl ? (
        isVimeo ? (
          <iframe
            src={vimeoSrc(slide.videoUrl!, "autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0")}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0, transform: "scale(1.2)", transformOrigin: "center center" }}
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
      center: "absolute inset-0 flex items-center justify-center p-8",
      "lower-third": "absolute inset-x-0 bottom-0 pb-0",
      full: "absolute inset-0 flex items-center justify-center p-8",
    };

    const overlayBgStyles: Record<string, React.CSSProperties> = {
      banner: { background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" },
      center: {},
      "lower-third": {},
      full: {},
    };

    return (
      <div key={animKey} className="w-full h-full relative overflow-hidden">
        {mediaBg}
        {/* Overlay layer */}
        <div className={overlayClasses[effectiveOverlay] || overlayClasses.full} style={overlayBgStyles[effectiveOverlay] || {}}>
          {effectiveOverlay === "center" ? (
            <div className="bg-black/60 rounded-2xl px-10 py-8 max-w-2xl text-center backdrop-blur-sm">
              {headlineEl}
              {bodyEl}
            </div>
          ) : effectiveOverlay === "lower-third" ? (
            <div className="bg-black/75 px-8 py-5 text-left">
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
    <div key={animKey} className="w-full max-w-4xl mx-auto px-6 sm:px-12 flex flex-col items-center justify-center text-center relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: theme.ambientGlow }} />

      <div className="relative z-10">
        {slide.imageUrl && !slide.videoUrl && (
          <img src={slide.imageUrl} alt="" className="max-w-full max-h-[40vh] object-contain mb-8 rounded-lg animate-slide-fade" />
        )}
        {slide.videoUrl && (
          isVimeo ? (
            <div className="w-full max-h-[40vh] aspect-video mb-8 rounded-lg animate-slide-fade overflow-hidden">
              <iframe src={vimeoSrc(slide.videoUrl!, "title=0&byline=0&portrait=0")} className="w-full h-full" style={{ border: 0 }} allow="autoplay; fullscreen" allowFullScreen />
            </div>
          ) : (
            <video src={slide.videoUrl} className="max-w-full max-h-[40vh] object-contain mb-8 rounded-lg animate-slide-fade" autoPlay muted loop playsInline />
          )
        )}
        {headlineEl}
        {bodyEl}
      </div>
    </div>
  );
}

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
    <div key={animKey} className="w-full max-w-4xl mx-auto px-6 sm:px-12 flex flex-col items-center justify-center text-center relative">
      <p
        className={`leading-[1.3] animate-slide-headline ${color ? "" : "text-slate-900"}`}
        style={{ fontFamily, fontSize, fontWeight, color }}
      >
        {text}
      </p>
    </div>
  );
}

// Theme switcher dropdown
function ThemeSwitcher({ currentKey, onSwitch }: { currentKey: string; onSwitch: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg p-2 flex gap-1.5 shadow-xl z-50">
          {Object.values(PRESENTATION_THEMES).map((t) => (
            <button
              key={t.key}
              onClick={() => { onSwitch(t.key); setOpen(false); }}
              className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                currentKey === t.key ? "bg-slate-600" : "hover:bg-slate-700"
              }`}
            >
              <div className={`w-8 h-5 rounded ${t.previewBg} flex items-center justify-center border border-slate-500`}>
                <div className={`w-4 h-1 rounded-full ${t.previewAccent}`} />
              </div>
              <span className="text-[10px] text-slate-300 whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Font picker grid - reusable for headline and body
function FontPickerGrid({ selected, onSelect, label }: { selected: string; onSelect: (f: string) => void; label: string }) {
  const categories = [
    { label: "Modern Sans", start: 0, end: 16 },
    { label: "Bold / Display", start: 16, end: 26 },
    { label: "Elegant Serif", start: 26, end: 36 },
    { label: "Script", start: 36, end: 42 },
    { label: "Monospace", start: 42, end: 46 },
  ];
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
      >
        <span>{label}: <span className="normal-case text-slate-200" style={{ fontFamily: `'${selected}', sans-serif` }}>{selected}</span></span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="mt-2 max-h-[180px] overflow-y-auto pr-1 space-y-2">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mb-1 px-1">{cat.label}</div>
              <div className="grid grid-cols-2 gap-1">
                {GOOGLE_FONTS.slice(cat.start, cat.end).map((f) => (
                  <button
                    key={f}
                    onClick={() => { loadGoogleFont(f); onSelect(f); }}
                    className={`px-3 py-1.5 rounded-lg text-left text-sm truncate transition-colors ${
                      selected === f ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                    style={{ fontFamily: `'${f}', sans-serif` }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Typography panel - pairings, font pickers, size, weight, colors
function TypographyPanel({ fonts, onChange, onSave, hasChanges }: {
  fonts: FontSettings;
  onChange: (update: Partial<FontSettings>) => void;
  onSave: () => void;
  hasChanges: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) loadAllFonts();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Fonts</span>
        {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 w-[340px] max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Font pairings */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Font Pairings</label>
              <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {FONT_PAIRINGS.map((p) => {
                  const isActive = fonts.font === p.headline && getBodyFont(fonts) === p.body;
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        loadGoogleFont(p.headline);
                        loadGoogleFont(p.body);
                        onChange({ font: p.headline, bodyFont: p.body });
                      }}
                      className={`p-2 rounded-lg text-left transition-colors ${
                        isActive ? "bg-white/15 ring-1 ring-white/30" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="text-sm text-white truncate" style={{ fontFamily: `'${p.headline}', sans-serif`, fontWeight: 700 }}>
                        {p.headline}
                      </div>
                      <div className="text-xs text-slate-400 truncate" style={{ fontFamily: `'${p.body}', sans-serif` }}>
                        {p.body}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{p.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual font pickers */}
            <FontPickerGrid selected={fonts.font} onSelect={(f) => onChange({ font: f })} label="Headline Font" />
            <FontPickerGrid selected={getBodyFont(fonts)} onSelect={(f) => onChange({ bodyFont: f })} label="Body Font" />

            {/* Headline color */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Headline Color</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HEADLINE_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onChange({ headlineColor: c.value || undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      (fonts.headlineColor || "") === c.value
                        ? "border-white scale-110"
                        : "border-slate-600 hover:border-slate-400"
                    }`}
                    style={c.color ? { backgroundColor: c.color } : undefined}
                    title={c.label}
                  >
                    {!c.color && (
                      <span className="text-[8px] text-slate-400 font-bold">A</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color - for **word** markup */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Accent Color <span className="normal-case text-slate-500">(**word**)</span></label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { value: "#f59e0b", label: "Amber", color: "#f59e0b" },
                  { value: "#ef4444", label: "Red", color: "#ef4444" },
                  { value: "#10b981", label: "Green", color: "#10b981" },
                  { value: "#3b82f6", label: "Blue", color: "#3b82f6" },
                  { value: "#8b5cf6", label: "Purple", color: "#8b5cf6" },
                  { value: "#ec4899", label: "Pink", color: "#ec4899" },
                  { value: "#f97316", label: "Orange", color: "#f97316" },
                  { value: "#06b6d4", label: "Cyan", color: "#06b6d4" },
                  { value: "#ffffff", label: "White", color: "#ffffff" },
                  { value: "#000000", label: "Black", color: "#000000" },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onChange({ accentColor: c.value })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      (fonts.accentColor || "#f59e0b") === c.value
                        ? "border-white scale-110"
                        : "border-slate-600 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Headline controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Headline</label>
                <button
                  onClick={() => onChange({ headlineUppercase: !fonts.headlineUppercase })}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-colors ${
                    fonts.headlineUppercase
                      ? "bg-white/15 text-white"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  }`}
                >
                  ABC
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 mb-1 block">Size</span>
                  <div className="flex gap-1">
                    {SIZE_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => onChange({ headlineSize: s.value })}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                          fonts.headlineSize === s.value
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 mb-1 block">Weight</span>
                  <div className="flex gap-1">
                    {WEIGHT_OPTIONS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => onChange({ headlineWeight: w.value })}
                        className={`flex-1 py-1.5 rounded text-[10px] transition-colors ${
                          fonts.headlineWeight === w.value
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                        style={{ fontWeight: w.value }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Body color */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Body Color</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HEADLINE_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onChange({ bodyColor: c.value || undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      (fonts.bodyColor || "") === c.value
                        ? "border-white scale-110"
                        : "border-slate-600 hover:border-slate-400"
                    }`}
                    style={c.color ? { backgroundColor: c.color } : undefined}
                    title={c.label}
                  >
                    {!c.color && (
                      <span className="text-[8px] text-slate-400 font-bold">A</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Body controls */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Body Text</label>
              <div className="mt-2 flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 mb-1 block">Size</span>
                  <div className="flex gap-1">
                    {SIZE_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => onChange({ bodySize: s.value })}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                          fonts.bodySize === s.value
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 mb-1 block">Weight</span>
                  <div className="flex gap-1">
                    {WEIGHT_OPTIONS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => onChange({ bodyWeight: w.value })}
                        className={`flex-1 py-1.5 rounded text-[10px] transition-colors ${
                          fonts.bodyWeight === w.value
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                        style={{ fontWeight: w.value }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={() => { onSave(); setOpen(false); }}
              disabled={!hasChanges}
              className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                hasChanges
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" /> {hasChanges ? "Save Font Settings" : "Saved"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FunnelPreview() {
  const params = useParams<{ presentationId: string }>();
  const presentationId = params.presentationId;
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeKey, setThemeKey] = useState<string>("dark");
  const [fonts, setFonts] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [savedFonts, setSavedFonts] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [formatting, setFormatting] = useState(false);
  const [masterLayout, setMasterLayout] = useState(false);
  const [mattsStyle, setMattsStyle] = useState(false);
  const aiRunning = formatting || masterLayout || mattsStyle;

  useEffect(() => {
    fetch(`/api/admin/funnels/presentations/${presentationId}/preview`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load preview");
        }
        return res.json();
      })
      .then((d) => {
        setData(d);
        setThemeKey(d.presentation.theme || "dark");
        const fs = getFontSettings(d.presentation.fontSettings);
        setFonts(fs);
        setSavedFonts(fs);
        loadGoogleFont(fs.font);
        if (fs.bodyFont) loadGoogleFont(fs.bodyFont);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [presentationId]);

  const switchTheme = useCallback((key: string) => {
    setThemeKey(key);
    fetch(`/api/admin/funnels/presentations/${presentationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ theme: key }),
    }).catch(() => {});
  }, [presentationId]);

  const updateFonts = useCallback((update: Partial<FontSettings>) => {
    setFonts(prev => ({ ...prev, ...update }));
    if (update.font) loadGoogleFont(update.font);
    if (update.bodyFont) loadGoogleFont(update.bodyFont);
  }, []);

  const saveFonts = useCallback(() => {
    setSavedFonts(fonts);
    fetch(`/api/admin/funnels/presentations/${presentationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fontSettings: fonts }),
    }).catch(() => {});
  }, [fonts, presentationId]);

  const [presenterMode, setPresenterMode] = useState(false);
  const [impactLimit, setImpactLimit] = useState(10);

  const fontsDirty = JSON.stringify(fonts) !== JSON.stringify(savedFonts);

  const formatForImpact = useCallback(async () => {
    const label = impactLimit === 0 ? "ALL slides" : `the first ${impactLimit} slides`;
    if (!confirm(`This will rewrite ${label} using AI for maximum impact. Your current text will be replaced. Continue?`)) return;
    setFormatting(true);
    try {
      const res = await fetch(`/api/admin/funnels/presentations/${presentationId}/format-for-impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ limit: impactLimit || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || "Formatting failed");
        return;
      }
      // Reload the preview to show updated slides
      const previewRes = await fetch(`/api/admin/funnels/presentations/${presentationId}/preview`, { credentials: "include" });
      if (previewRes.ok) {
        const d = await previewRes.json();
        setData(d);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setFormatting(false);
    }
  }, [presentationId, impactLimit]);

  const masterLayoutEnergy = useCallback(async () => {
    const label = impactLimit === 0 ? "ALL slides" : `the first ${impactLimit} slides`;
    if (!confirm(`This will reformat ${label} with dramatic cinematic energy (ALL CAPS statements, conversational drops, pattern interrupts). Your current text will be replaced. Continue?`)) return;
    setMasterLayout(true);
    try {
      const res = await fetch(`/api/admin/funnels/presentations/${presentationId}/master-layout-energy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ limit: impactLimit || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || "Master layout formatting failed");
        return;
      }
      const previewRes = await fetch(`/api/admin/funnels/presentations/${presentationId}/preview`, { credentials: "include" });
      if (previewRes.ok) {
        const d = await previewRes.json();
        setData(d);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setMasterLayout(false);
    }
  }, [presentationId, impactLimit]);

  const mattsStyleFormat = useCallback(async () => {
    const label = impactLimit === 0 ? "ALL slides" : `the first ${impactLimit} slides`;
    if (!confirm(`This will reformat ${label} in Matt's signature webinar style — dramatic whitespace, emphasis stacking, theatrical pacing. Your current text will be replaced. Continue?`)) return;
    setMattsStyle(true);
    try {
      const res = await fetch(`/api/admin/funnels/presentations/${presentationId}/matts-style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ limit: impactLimit || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || "Matt's Style formatting failed");
        return;
      }
      const previewRes = await fetch(`/api/admin/funnels/presentations/${presentationId}/preview`, { credentials: "include" });
      if (previewRes.ok) {
        const d = await previewRes.json();
        setData(d);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setMattsStyle(false);
    }
  }, [presentationId, impactLimit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Preview Unavailable</h1>
          <p className="text-slate-400 mb-4">{error || "No content available."}</p>
          <a href="/admin" className="text-sm text-slate-500 hover:text-white">Back to Admin</a>
        </div>
      </div>
    );
  }

  const allSlides = data.timeline.flatMap(entry => entry.slides);
  const hasScriptNotes = allSlides.some(s => !!s.scriptNotes);

  if (allSlides.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">No Slides</h1>
          <p className="text-slate-400 mb-4">This presentation has no slides yet.</p>
          <a href="/admin" className="text-sm text-slate-500 hover:text-white">Back to Admin</a>
        </div>
      </div>
    );
  }

  const firstVariant = data.timeline[0]?.variant;
  const hasAudio = firstVariant?.mediaType === "audio_slides" && !!firstVariant.audioUrl;
  const hasSyncedTimestamps = allSlides.some(s => s.startTimeMs > 0);
  const theme = getTheme(themeKey);
  const isTextMode = data.presentation.displayMode === "text";

  // Admin bar - shared across all modes
  const adminBar = (rightExtra?: React.ReactNode) => (
    <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </a>
        <span className="px-2 py-0.5 text-xs bg-amber-600 text-white rounded font-medium">Preview</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={formatForImpact}
            disabled={aiRunning}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm transition-colors disabled:opacity-50"
          >
            {formatting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{formatting ? "Formatting..." : "Impact"}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={masterLayoutEnergy}
            disabled={aiRunning}
            className="flex items-center gap-1.5 text-fuchsia-400 hover:text-fuchsia-300 text-sm transition-colors disabled:opacity-50"
          >
            {masterLayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Type className="w-3.5 h-3.5" />}
            {masterLayout ? "Formatting..." : "Master"}
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={mattsStyleFormat}
            disabled={aiRunning}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors disabled:opacity-50"
          >
            {mattsStyle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {mattsStyle ? "Formatting..." : "Matt's"}
          </button>
          <select
            value={impactLimit}
            onChange={(e) => setImpactLimit(parseInt(e.target.value))}
            className="bg-slate-700 text-slate-300 text-xs rounded px-1.5 py-1 border border-slate-600 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={0}>All</option>
          </select>
        </div>
        {hasScriptNotes && (
          <button
            onClick={() => setPresenterMode(!presenterMode)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              presenterMode ? "text-emerald-400 hover:text-emerald-300" : "text-slate-400 hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Present</span>
          </button>
        )}
        {!isTextMode && (
          <ThemeSwitcher currentKey={themeKey} onSwitch={switchTheme} />
        )}
        <TypographyPanel fonts={fonts} onChange={updateFonts} onSave={saveFonts} hasChanges={fontsDirty} />
        {rightExtra}
      </div>
    </div>
  );

  if (presenterMode && hasScriptNotes) {
    return <TeleprompterMode data={data} allSlides={allSlides} theme={theme} themeKey={themeKey} fonts={fonts} adminBar={adminBar} isTextMode={isTextMode} />;
  }

  if (hasAudio && hasSyncedTimestamps) {
    return <AudioPreview data={data} allSlides={allSlides} theme={theme} themeKey={themeKey} fonts={fonts} adminBar={adminBar} isTextMode={isTextMode} />;
  }

  return <ClickThroughPreview data={data} setData={setData} allSlides={allSlides} theme={theme} themeKey={themeKey} fonts={fonts} adminBar={adminBar} isTextMode={isTextMode} />;
}

// Teleprompter / Presenter mode
// Left: scrollable script. Right: slide preview that auto-syncs to scroll position.
function TeleprompterMode({ data, allSlides, theme, themeKey, fonts, adminBar, isTextMode }: {
  data: PreviewData;
  allSlides: SlideData[];
  theme: PresentationTheme;
  themeKey: string;
  fonts: FontSettings;
  adminBar: (rightExtra?: React.ReactNode) => React.ReactNode;
  isTextMode: boolean;
}) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const scriptRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Keyboard nav: up/down arrows to move slides
  const goNext = useCallback(() => {
    setActiveSlideIdx(prev => Math.min(prev + 1, allSlides.length - 1));
  }, [allSlides.length]);

  const goPrev = useCallback(() => {
    setActiveSlideIdx(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Auto-scroll the script panel to keep active section visible
  useEffect(() => {
    const el = scriptRefs.current.get(activeSlideIdx);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSlideIdx]);

  const activeSlide = allSlides[activeSlideIdx] || allSlides[0];

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <style>{slideAnimation}</style>
      <style>{`
        .teleprompter-scroll::-webkit-scrollbar { width: 4px; }
        .teleprompter-scroll::-webkit-scrollbar-track { background: transparent; }
        .teleprompter-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>
      {adminBar(
        <span className="text-sm text-emerald-400 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5" /> Presenter Mode - {activeSlideIdx + 1}/{allSlides.length}
        </span>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Left: Teleprompter script */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Use arrow keys or click to navigate</span>
          </div>
          <div className="flex-1 overflow-y-auto teleprompter-scroll min-h-0">
            {allSlides.map((slide, idx) => {
              const hasNotes = !!slide.scriptNotes;
              const isActive = idx === activeSlideIdx;

              return (
                <div
                  key={slide.id}
                  ref={(el) => {
                    if (el) scriptRefs.current.set(idx, el);
                    else scriptRefs.current.delete(idx);
                  }}
                  className={`px-8 py-6 transition-all duration-300 cursor-pointer border-l-4 ${
                    isActive
                      ? "bg-slate-800/50 border-l-emerald-500"
                      : "border-l-transparent hover:bg-slate-900/50"
                  }`}
                  onClick={() => setActiveSlideIdx(idx)}
                >
                  {/* Slide number + headline indicator */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500"
                    }`}>
                      {idx + 1}
                    </span>
                    {slide.headline && (
                      <span className={`text-sm font-medium ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                        {slide.headline}
                      </span>
                    )}
                  </div>

                  {/* Script notes - the main reading content */}
                  {hasNotes ? (
                    <p className={`text-2xl leading-[1.8] transition-colors duration-300 ${
                      isActive ? "text-white" : "text-slate-600"
                    }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                      {slide.scriptNotes}
                    </p>
                  ) : (
                    <p className={`text-lg italic transition-colors duration-300 ${
                      isActive ? "text-slate-500" : "text-slate-700"
                    }`}>
                      (no script notes for this slide)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Slide/text preview - locked in place */}
        <div className={`w-1/2 ${isTextMode ? "bg-white" : theme.pageBg} flex items-center justify-center transition-colors duration-300 overflow-hidden`}>
          {activeSlide && (
            isTextMode && !activeSlide.videoUrl && !activeSlide.imageUrl
              ? <TextSegmentDisplay slide={activeSlide} animKey={`present-text-${activeSlide.id}`} fonts={fonts} />
              : <SlideDisplay slide={activeSlide} theme={theme} fonts={fonts} animKey={`present-${themeKey}-${activeSlide.id}`} />
          )}
        </div>
      </div>
    </div>
  );
}

// Click-through slideshow
function ClickThroughPreview({ data, allSlides, theme, themeKey, fonts, adminBar, setData, isTextMode }: {
  data: PreviewData;
  allSlides: SlideData[];
  theme: PresentationTheme;
  themeKey: string;
  fonts: FontSettings;
  adminBar: (rightExtra?: React.ReactNode) => React.ReactNode;
  setData: React.Dispatch<React.SetStateAction<PreviewData | null>>;
  isTextMode: boolean;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIdx(prev => Math.min(prev + 1, allSlides.length - 1));
  }, [allSlides.length]);

  const goPrev = useCallback(() => {
    setCurrentIdx(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const slide = allSlides[currentIdx];

  const handleSlideTextSave = useCallback((slideId: number, field: 'headline' | 'body', value: string) => {
    // Optimistic update
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        timeline: prev.timeline.map(entry => ({
          ...entry,
          slides: entry.slides.map(s =>
            s.id === slideId ? { ...s, [field]: value || null } : s
          ),
        })),
      };
    });
    // Persist to API
    fetch(`/api/admin/funnels/slides/${slideId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ [field]: value || null }),
    }).catch(() => console.error('Failed to save slide text'));
  }, [setData]);

  return (
    <div className={`h-screen ${isTextMode ? "bg-white" : theme.pageBg} flex flex-col overflow-hidden transition-colors duration-300`}>
      <style>{slideAnimation}</style>
      {adminBar(<span className="text-sm text-slate-400">{currentIdx + 1} / {allSlides.length}</span>)}

      <div className="flex-1 min-h-0 overflow-hidden py-4 group">
        <div className="h-full flex items-center justify-center">
          <div className="h-full w-full overflow-hidden">
            {slide && (
              isTextMode && !slide.videoUrl && !slide.imageUrl
                ? <TextSegmentDisplay slide={slide} animKey={`text-${slide.id}`} fonts={fonts} />
                : <SlideDisplay slide={slide} theme={theme} fonts={fonts} animKey={`${themeKey}-${fonts.font}-${slide.id}`} editable onSave={handleSlideTextSave} />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-6">
          <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIdx === 0} className={theme.navText}>
            <ChevronLeft className="w-5 h-5 mr-1" /> Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={goNext} disabled={currentIdx === allSlides.length - 1} className={theme.navText}>
            Next <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Audio-synced preview
function AudioPreview({ data, allSlides, theme, themeKey, fonts, adminBar, isTextMode }: {
  data: PreviewData;
  allSlides: SlideData[];
  theme: PresentationTheme;
  themeKey: string;
  fonts: FontSettings;
  adminBar: (rightExtra?: React.ReactNode) => React.ReactNode;
  isTextMode: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<SlideData | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!started) return;
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

  const handleStart = () => {
    setStarted(true);
    const entry = data.timeline[0];
    if (!entry) return;
    if (entry.variant.mediaType === "audio_slides" && entry.variant.audioUrl) {
      const audio = audioRef.current;
      if (audio) { audio.src = entry.variant.audioUrl; audio.play().catch(() => {}); }
    }
    if (entry.slides.length > 0) setCurrentSlide(entry.slides[0]);
  };

  const handleModuleEnd = () => {
    const nextIdx = currentModuleIdx + 1;
    if (nextIdx >= data.timeline.length) return;
    setCurrentModuleIdx(nextIdx);
    const entry = data.timeline[nextIdx];
    if (entry.variant.mediaType === "audio_slides" && entry.variant.audioUrl) {
      const audio = audioRef.current;
      if (audio) { audio.src = entry.variant.audioUrl; audio.play().catch(() => {}); }
    }
    if (entry.slides.length > 0) setCurrentSlide(entry.slides[0]);
  };

  if (!started) {
    return (
      <div className={`h-screen ${isTextMode ? "bg-white" : theme.overlayBg} flex flex-col overflow-hidden transition-colors duration-300`}>
        <style>{slideAnimation}</style>
        {adminBar(<span className="text-sm text-slate-400">{allSlides.length} {isTextMode ? "segments" : "slides"}</span>)}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-8 px-4 animate-slide-up">
            <h1
              className={`text-3xl sm:text-4xl font-bold ${isTextMode ? "text-slate-900" : theme.overlayText} tracking-tight`}
              style={{ fontFamily: isTextMode ? "'Inter', sans-serif" : `'${fonts.font}', sans-serif` }}
            >
              {data.presentation.name}
            </h1>
            <button
              onClick={handleStart}
              className={`w-20 h-20 rounded-full ${isTextMode ? "bg-slate-100 border-slate-300" : `${theme.playBtnBg} ${theme.playBtnBorder}`} border-2 flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300`}
            >
              <Play className={`w-10 h-10 ${isTextMode ? "text-slate-700" : theme.playBtnIcon} ml-1`} />
            </button>
            <p className={`text-sm ${isTextMode ? "text-slate-400" : theme.overlaySubtext}`}>Tap to start</p>
          </div>
        </div>
      </div>
    );
  }

  const currentEntry = data.timeline[currentModuleIdx];

  return (
    <div className={`h-screen ${isTextMode ? "bg-white" : theme.pageBg} flex flex-col overflow-hidden transition-colors duration-300`}>
      <style>{slideAnimation}</style>
      <audio ref={audioRef} onEnded={handleModuleEnd} preload="auto" />
      {adminBar(
        <span className="text-sm text-slate-400">
          {currentSlide ? `${allSlides.findIndex(s => s.id === currentSlide.id) + 1} / ${allSlides.length}` : "..."}
        </span>
      )}

      <div className="flex-1 min-h-0 overflow-hidden py-4">
        <div className="h-full flex items-center justify-center">
          <div className="h-full w-full overflow-hidden">
            {currentSlide ? (
              isTextMode && !currentSlide.videoUrl && !currentSlide.imageUrl
                ? <TextSegmentDisplay slide={currentSlide} animKey={`text-${currentSlide.id}`} fonts={fonts} />
                : <SlideDisplay slide={currentSlide} theme={theme} fonts={fonts} animKey={`${themeKey}-${fonts.font}-${currentSlide.id}`} />
            ) : (
              <p className={`text-lg ${isTextMode ? "text-slate-400" : theme.progressText}`} style={{ fontFamily: "'Inter', sans-serif" }}>Playing...</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className={`flex items-center gap-2 text-xs ${theme.progressText}`}>
            <span>Module {currentModuleIdx + 1} / {data.timeline.length}</span>
            <span>·</span>
            <span>{currentEntry?.module.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
