// Presentation visual theme presets
// Designed for modern keynote-style presentations — no boxes, dynamic text

export interface PresentationTheme {
  key: string;
  label: string;
  pageBg: string;
  headlineColor: string;
  bodyColor: string;
  // Headline can have a gradient — if set, overrides headlineColor via inline style
  headlineGradient?: string;
  // Ambient glow — radial gradient behind text for depth/atmosphere
  ambientGlow: string;
  // Text shadow for headlines (depth on dark backgrounds)
  headlineShadow: string;
  ctaBg: string;
  ctaText: string;
  overlayBg: string;
  overlayText: string;
  overlaySubtext: string;
  playBtnBg: string;
  playBtnBorder: string;
  playBtnIcon: string;
  navText: string;
  dotActive: string;
  dotInactive: string;
  progressText: string;
  // Mini-preview colors for the editor picker
  previewBg: string;
  previewAccent: string;
  previewText: string;
}

export const PRESENTATION_THEMES: Record<string, PresentationTheme> = {
  dark: {
    key: "dark",
    label: "Dark Stage",
    pageBg: "bg-slate-950",
    headlineColor: "text-white",
    bodyColor: "text-slate-300",
    headlineGradient: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
    ambientGlow: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(100,120,220,0.12) 0%, transparent 70%)",
    headlineShadow: "0 0 80px rgba(120,140,255,0.15), 0 2px 4px rgba(0,0,0,0.3)",
    ctaBg: "bg-emerald-500 hover:bg-emerald-400",
    ctaText: "text-white",
    overlayBg: "bg-slate-950",
    overlayText: "text-white",
    overlaySubtext: "text-slate-500",
    playBtnBg: "bg-white/5",
    playBtnBorder: "border-white/20",
    playBtnIcon: "text-white",
    navText: "text-slate-500 hover:text-white disabled:opacity-30",
    dotActive: "bg-white",
    dotInactive: "bg-slate-700 hover:bg-slate-600",
    progressText: "text-slate-600",
    previewBg: "bg-slate-950",
    previewAccent: "bg-white",
    previewText: "bg-slate-400",
  },
  white: {
    key: "white",
    label: "Clean White",
    pageBg: "bg-white",
    headlineColor: "text-slate-900",
    bodyColor: "text-slate-500",
    ambientGlow: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 70%)",
    headlineShadow: "none",
    ctaBg: "bg-slate-900 hover:bg-slate-800",
    ctaText: "text-white",
    overlayBg: "bg-white",
    overlayText: "text-slate-900",
    overlaySubtext: "text-slate-400",
    playBtnBg: "bg-slate-100",
    playBtnBorder: "border-slate-200",
    playBtnIcon: "text-slate-900",
    navText: "text-slate-300 hover:text-slate-700 disabled:opacity-30",
    dotActive: "bg-slate-900",
    dotInactive: "bg-slate-200 hover:bg-slate-300",
    progressText: "text-slate-300",
    previewBg: "bg-white",
    previewAccent: "bg-slate-900",
    previewText: "bg-slate-300",
  },
  gray: {
    key: "gray",
    label: "Soft Gray",
    pageBg: "bg-stone-100",
    headlineColor: "text-stone-900",
    bodyColor: "text-stone-500",
    ambientGlow: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(120,113,108,0.06) 0%, transparent 70%)",
    headlineShadow: "none",
    ctaBg: "bg-stone-900 hover:bg-stone-800",
    ctaText: "text-white",
    overlayBg: "bg-stone-100",
    overlayText: "text-stone-900",
    overlaySubtext: "text-stone-400",
    playBtnBg: "bg-stone-200",
    playBtnBorder: "border-stone-300",
    playBtnIcon: "text-stone-800",
    navText: "text-stone-400 hover:text-stone-700 disabled:opacity-30",
    dotActive: "bg-stone-800",
    dotInactive: "bg-stone-300 hover:bg-stone-400",
    progressText: "text-stone-400",
    previewBg: "bg-stone-100",
    previewAccent: "bg-stone-800",
    previewText: "bg-stone-300",
  },
  bold: {
    key: "bold",
    label: "Bold Dark",
    pageBg: "bg-black",
    headlineColor: "text-white",
    bodyColor: "text-neutral-400",
    headlineGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ffffff 100%)",
    ambientGlow: "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(245,158,11,0.1) 0%, transparent 70%)",
    headlineShadow: "0 0 60px rgba(245,158,11,0.2), 0 2px 4px rgba(0,0,0,0.5)",
    ctaBg: "bg-amber-500 hover:bg-amber-400",
    ctaText: "text-black font-bold",
    overlayBg: "bg-black",
    overlayText: "text-white",
    overlaySubtext: "text-neutral-600",
    playBtnBg: "bg-amber-500/10",
    playBtnBorder: "border-amber-500/30",
    playBtnIcon: "text-amber-400",
    navText: "text-neutral-600 hover:text-white disabled:opacity-30",
    dotActive: "bg-amber-400",
    dotInactive: "bg-neutral-800 hover:bg-neutral-700",
    progressText: "text-neutral-700",
    previewBg: "bg-black",
    previewAccent: "bg-amber-400",
    previewText: "bg-neutral-500",
  },
};

export function getTheme(name?: string | null): PresentationTheme {
  return PRESENTATION_THEMES[name || "dark"] || PRESENTATION_THEMES.dark;
}

// ==========================================
// Font customization
// ==========================================

export interface FontSettings {
  font: string;
  headlineSize: string;   // "sm" | "md" | "lg" | "xl"
  bodySize: string;        // "sm" | "md" | "lg" | "xl"
  headlineWeight: number;  // 300-900
  bodyWeight: number;      // 300-700
  headlineColor?: string;  // hex override for headline color (null = use theme default)
  bodyColor?: string;      // hex override for body text color (null = use theme default)
  headlineUppercase?: boolean;
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  font: "Space Grotesk",
  headlineSize: "lg",
  bodySize: "lg",
  headlineWeight: 700,
  bodyWeight: 300,
  headlineColor: undefined,
  bodyColor: undefined,
  headlineUppercase: false,
};

// Headline color presets — theme default + black variations + accents
export const HEADLINE_COLOR_PRESETS = [
  { value: "", label: "Theme", color: "" },  // empty = use theme default
  { value: "#000000", label: "Black", color: "#000000" },
  { value: "#1a1a2e", label: "Ink", color: "#1a1a2e" },
  { value: "#1e293b", label: "Slate", color: "#1e293b" },
  { value: "#292524", label: "Warm", color: "#292524" },
  { value: "#374151", label: "Gray", color: "#374151" },
  { value: "#ffffff", label: "White", color: "#ffffff" },
  { value: "#f59e0b", label: "Amber", color: "#f59e0b" },
  { value: "#10b981", label: "Green", color: "#10b981" },
  { value: "#3b82f6", label: "Blue", color: "#3b82f6" },
  { value: "#ef4444", label: "Red", color: "#ef4444" },
  { value: "#8b5cf6", label: "Purple", color: "#8b5cf6" },
];

// Google Fonts — organized by style category
export const GOOGLE_FONTS = [
  // Modern Sans-Serif
  "Space Grotesk",
  "Inter",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Sora",
  "Montserrat",
  "Raleway",
  "Poppins",
  "Nunito",
  "Rubik",
  "Manrope",
  "Figtree",
  "Albert Sans",
  "Urbanist",
  "Lexend",
  // Bold / Display
  "Oswald",
  "Bebas Neue",
  "Anton",
  "Archivo Black",
  "Teko",
  "Barlow Condensed",
  "Fjalla One",
  "Passion One",
  "Righteous",
  "Black Ops One",
  // Elegant Serif
  "Playfair Display",
  "Lora",
  "Merriweather",
  "Cormorant Garamond",
  "DM Serif Display",
  "Libre Baskerville",
  "Crimson Text",
  "EB Garamond",
  "Bitter",
  "Vollkorn",
  // Script / Handwritten
  "Caveat",
  "Dancing Script",
  "Pacifico",
  "Satisfy",
  "Great Vibes",
  "Lobster",
  // Monospace / Technical
  "JetBrains Mono",
  "Fira Code",
  "IBM Plex Mono",
  "Source Code Pro",
];

// Size presets → CSS clamp values for responsive sizing
export const HEADLINE_SIZES: Record<string, string> = {
  sm: "clamp(1.5rem, 4vw, 2.25rem)",
  md: "clamp(2rem, 5vw, 3rem)",
  lg: "clamp(2.5rem, 6vw, 3.75rem)",
  xl: "clamp(3rem, 7.5vw, 5rem)",
};

// Statement size — used automatically when a slide has headline only (no body)
// Bumps one size up from the user's chosen headline size
export const STATEMENT_SIZES: Record<string, string> = {
  sm: HEADLINE_SIZES.md,
  md: HEADLINE_SIZES.lg,
  lg: HEADLINE_SIZES.xl,
  xl: "clamp(3.5rem, 9vw, 6rem)",
};

// Narrative size — used automatically when a slide has body only (no headline)
// Bumps up from the user's chosen body size for a more impactful read
export const NARRATIVE_SIZES: Record<string, string> = {
  sm: "clamp(1.125rem, 2.5vw, 1.5rem)",
  md: "clamp(1.25rem, 3vw, 1.75rem)",
  lg: "clamp(1.5rem, 3.5vw, 2rem)",
  xl: "clamp(1.75rem, 4vw, 2.5rem)",
};

export const BODY_SIZES: Record<string, string> = {
  sm: "clamp(0.875rem, 1.5vw, 1rem)",
  md: "clamp(1rem, 2vw, 1.25rem)",
  lg: "clamp(1.125rem, 2.5vw, 1.5rem)",
  xl: "clamp(1.25rem, 3vw, 1.875rem)",
};

export const WEIGHT_OPTIONS = [
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 600, label: "Semi" },
  { value: 700, label: "Bold" },
  { value: 900, label: "Black" },
];

export const SIZE_OPTIONS = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
];

// Dynamically load a Google Font into the page
const loadedFonts = new Set<string>();
export function loadGoogleFont(fontName: string) {
  if (loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

// Load all curated fonts at once (for the picker to render each in its own font)
export function loadAllFonts() {
  const families = GOOGLE_FONTS.map(f => `family=${f.replace(/ /g, "+")}:wght@300;400;600;700;900`).join("&");
  const id = "presentation-fonts";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

// Merge saved settings with defaults
export function getFontSettings(saved?: FontSettings | null): FontSettings {
  if (!saved) return DEFAULT_FONT_SETTINGS;
  return { ...DEFAULT_FONT_SETTINGS, ...saved };
}
