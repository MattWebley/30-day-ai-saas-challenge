// TypeScript interfaces for the funnel split-test engine

export interface FunnelCampaign {
  id: number;
  name: string;
  slug: string;
  isActive: boolean | null;
  presentationId: number | null;
  watchHeadline: string | null;
  watchSubheadline: string | null;
  speakerVideoUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  ctaAppearTime: number | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  optinPages?: FunnelOptinPage[];
  variationSets?: FunnelVariationSet[];
  presentation?: FunnelPresentation | null;
}

export interface FontSettings {
  font: string;
  bodyFont?: string;
  headlineSize: string;
  bodySize: string;
  headlineWeight: number;
  bodyWeight: number;
  headlineColor?: string;
  bodyColor?: string;
  accentColor?: string;
  headlineUppercase?: boolean;
}

export interface FunnelPresentation {
  id: number;
  name: string;
  description: string | null;
  theme?: string | null;
  fontSettings?: FontSettings | null;
  displayMode?: string | null; // "slides" or "text"
  createdAt: string;
  updatedAt: string;
  modules?: FunnelModule[];
}

export interface FunnelModule {
  id: number;
  presentationId: number;
  name: string;
  sortOrder: number;
  isSwappable: boolean | null;
  createdAt: string;
  variants?: FunnelModuleVariant[];
}

export interface FunnelModuleVariant {
  id: number;
  moduleId: number;
  name: string;
  mediaType: string;
  audioUrl: string | null;
  videoUrl: string | null;
  durationMs: number | null;
  scriptText: string | null;
  createdAt: string;
  slides?: FunnelSlide[];
}

export interface FunnelSlide {
  id: number;
  variantId: number;
  sortOrder: number;
  headline: string | null;
  body: string | null;
  scriptNotes: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  overlayStyle: string | null;
  startTimeMs: number;
  createdAt: string;
}

export interface FunnelOptinPage {
  id: number;
  campaignId: number;
  name: string;
  headline: string;
  subheadline: string | null;
  ctaButtonText: string | null;
  heroImageUrl: string | null;
  createdAt: string;
}

export interface FunnelVariationSet {
  id: number;
  campaignId: number;
  name: string;
  optinPageId: number;
  moduleVariantIds: Record<string, number> | null;
  weight: number | null;
  isActive: boolean | null;
  createdAt: string;
}

export interface FunnelVisitor {
  id: number;
  campaignId: number;
  variationSetId: number;
  visitorToken: string;
  email: string | null;
  firstName: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  createdAt: string;
}

export interface FunnelEvent {
  id: number;
  visitorId: number;
  campaignId: number;
  variationSetId: number;
  eventType: string;
  eventData: Record<string, unknown> | null;
  createdAt: string;
}

export interface FunnelAdSpend {
  id: number;
  campaignId: number;
  date: string;
  amount: number;
  currency: string | null;
  platform: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FunnelAdCopy {
  id: number;
  campaignId: number;
  headline: string;
  primaryText: string;
  persuasionLevel: number | null;
  status: string | null;
  createdAt: string;
}

// Analytics types
export interface FunnelAnalytics {
  campaign: FunnelCampaign;
  totalVisitors: number;
  totalRegistrations: number;
  totalPlayStarts: number;
  totalCtaClicks: number;
  totalCallsBooked: number;
  totalSales: number;
  totalRevenue: number;
  totalAdSpend: number;
  roi: number | null;
  costPerRegistration: number | null;
  costPerSale: number | null;
  variations: VariationAnalytics[];
}

export interface VariationAnalytics {
  variationSet: FunnelVariationSet;
  visitors: number;
  registrations: number;
  playStarts: number;
  ctaClicks: number;
  callsBooked: number;
  sales: number;
  revenue: number;
  registrationRate: number;
  ctaClickRate: number;
  confidence: 'winner' | 'trending' | 'need_data';
  pValue: number | null;
}

export interface DropOffData {
  timeSeconds: number;
  viewerCount: number;
  percentage: number;
}

export interface VisitorJourney {
  id: number;
  email: string | null;
  firstName: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  variationSetId: number;
  variationName: string | null;
  createdAt: string;
  events: {
    eventType: string;
    eventData: Record<string, unknown> | null;
    createdAt: string;
  }[];
}
