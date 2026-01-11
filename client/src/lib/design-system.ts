/**
 * DESIGN SYSTEM - Minimal Clean
 *
 * This is the single source of truth for all UI styling in the app.
 * DO NOT deviate from these styles without explicit permission.
 *
 * Core principles:
 * - White backgrounds everywhere
 * - Thin slate-200 borders
 * - No colored background boxes (no amber, green, indigo backgrounds)
 * - Primary color only for interactive/selected states
 * - Clean, minimal, professional
 *
 * TYPOGRAPHY (only 4 text styles):
 * - heading: Card/section headers (text-lg font-bold text-slate-900)
 * - body: Main content (text-sm text-slate-600)
 * - label: Form labels (text-sm font-medium text-slate-700)
 * - muted: Helper text (text-sm text-slate-500)
 *
 * SPACING:
 * - Card padding: p-5
 * - Between sections: space-y-4
 * - After headings: mb-3
 * - After labels: mb-2
 */

export const ds = {
  // ===========================================
  // TYPOGRAPHY (simplified - only 4 styles)
  // ===========================================

  /** Card/section heading - use for all card titles */
  heading: "text-lg font-bold text-slate-900",

  /** Body text - main content */
  body: "text-sm text-slate-600",

  /** Label - form labels and small headers */
  label: "text-sm font-medium text-slate-700",

  /** Muted - helper text, hints, secondary info */
  muted: "text-sm text-slate-500",

  /** Small caps label - for data display labels */
  capsLabel: "text-xs font-semibold text-slate-500 uppercase tracking-wide",

  // ===========================================
  // CARDS & CONTAINERS
  // ===========================================

  /** Standard card - use for all content containers */
  card: "bg-white border border-slate-200 rounded-lg",

  /** Card with padding - most common usage */
  cardWithPadding: "bg-white border border-slate-200 rounded-lg p-5",

  /** Section container - groups related content */
  section: "space-y-4",

  // ===========================================
  // INTERACTIVE ELEMENTS
  // ===========================================

  /** Clickable option - default state */
  optionDefault: "bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-300 transition-colors",

  /** Clickable option - selected state */
  optionSelected: "bg-white border-2 border-primary rounded-lg p-4 cursor-pointer",

  /** Check circle - default state */
  checkDefault: "w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center",

  /** Check circle - selected state */
  checkSelected: "w-5 h-5 rounded-full bg-primary flex items-center justify-center",

  // ===========================================
  // INFO BOXES
  // ===========================================

  /** Info box - for tips, prompts, explanations */
  infoBox: "bg-white border border-slate-200 rounded-lg p-4",

  /** Highlighted info - slightly emphasized */
  infoBoxHighlight: "bg-slate-50 border border-slate-200 rounded-lg p-4",

  // ===========================================
  // BUTTONS (use with Button component)
  // ===========================================

  /** Primary action button classes */
  btnPrimary: "w-full h-12 text-base font-semibold",

  // ===========================================
  // LAYOUT
  // ===========================================

  /** Divider line between sections */
  divider: "border-t border-slate-200 my-6",

  /** Step indicator - numbered circle */
  stepCircle: "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold",

  /** Step indicator - completed */
  stepCircleComplete: "w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center",

  // ===========================================
  // FEEDBACK STATES
  // ===========================================

  /** Success text */
  successText: "text-green-600",

  /** Success container */
  successBox: "bg-white border border-green-300 rounded-lg p-4",

  /** Error text */
  errorText: "text-red-600",

  // ===========================================
  // LEGACY (deprecated - use new typography instead)
  // ===========================================

  /** @deprecated Use ds.heading instead */
  title: "text-sm font-semibold text-slate-900",

  /** @deprecated Use ds.heading instead */
  titleLg: "text-lg font-bold text-slate-900",

  /** @deprecated Use ds.heading instead */
  titleXl: "text-lg font-bold text-slate-900",

  /** @deprecated Use ds.body instead */
  text: "text-sm text-slate-600",

  /** @deprecated Use ds.muted instead */
  textMuted: "text-sm text-slate-500",

} as const;

/**
 * Helper to combine design system classes with custom classes
 */
export function cx(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
