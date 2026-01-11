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
 */

export const ds = {
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
  // INFO & TIPS
  // ===========================================

  /** Info box - for tips, prompts, explanations (NO colored backgrounds) */
  infoBox: "bg-white border border-slate-200 rounded-lg p-4",

  /** Highlighted info - slightly emphasized but still minimal */
  infoBoxHighlight: "bg-slate-50 border border-slate-200 rounded-lg p-4",

  // ===========================================
  // TEXT STYLES
  // ===========================================

  /** Section title */
  title: "text-slate-900 font-semibold",

  /** Large title */
  titleLg: "text-lg text-slate-900 font-bold",

  /** Extra large title */
  titleXl: "text-xl text-slate-900 font-bold",

  /** Body text */
  text: "text-slate-600",

  /** Small/muted text */
  textMuted: "text-slate-500 text-sm",

  /** Label text */
  label: "text-slate-700 font-medium text-sm",

  // ===========================================
  // FORM ELEMENTS
  // ===========================================

  /** Text input styling is handled by shadcn - just use default Input */

  /** Textarea - use default component */

  // ===========================================
  // BUTTONS
  // ===========================================

  /** Primary button - use default Button component */

  /** Secondary/outline button - use Button variant="outline" */

  // ===========================================
  // LAYOUT
  // ===========================================

  /** Divider line between sections */
  divider: "border-t border-slate-200 my-6",

  /** Step indicator - numbered circle (incomplete) */
  stepCircle: "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold",

  /** Step indicator - completed */
  stepCircleComplete: "w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center",

  // ===========================================
  // FEEDBACK STATES (use sparingly)
  // ===========================================

  /** Success state - only for confirmed completion */
  successText: "text-green-600",

  /** Success container - minimal, only when needed */
  successBox: "bg-white border border-green-300 rounded-lg p-4",

  /** Error text */
  errorText: "text-red-600",

} as const;

/**
 * Helper to combine design system classes with custom classes
 */
export function cx(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
