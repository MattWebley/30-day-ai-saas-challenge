import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Rocket,
  Filter,
  Check,
  DollarSign,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Users,
  Star
} from "lucide-react";

interface Day20TheLaunchProps {
  appName: string;
  onComplete: (data: { selectedStrategies: string[]; projectedCustomers: number; projectedRevenue: number }) => void;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  category: "free" | "paid" | "content" | "outreach" | "community";
  effort: 1 | 2 | 3 | 4 | 5; // 1 = easy, 5 = hard
  timeToResults: "quick" | "medium" | "slow";
  cost: "free" | "low" | "medium" | "high";
  impactPotential: "low" | "medium" | "high";
  automationPotential: "manual" | "partial" | "full";
  customersPerMonth: { low: number; mid: number; high: number };
  tips: string;
}

const STRATEGIES: Strategy[] = [
  // === LAUNCH PLATFORMS ===
  {
    id: "product-hunt",
    name: "Product Hunt Launch",
    description: "Launch on Product Hunt for a burst of early adopter traffic",
    category: "free",
    effort: 3,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 5, mid: 20, high: 100 },
    tips: "Prepare 2 weeks in advance. Get hunter, prepare assets, line up supporters."
  },
  {
    id: "betalist",
    name: "BetaList",
    description: "Get featured on BetaList for startup enthusiasts",
    category: "free",
    effort: 1,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 8, high: 25 },
    tips: "Free to submit, paid for faster featuring. Good for collecting emails pre-launch."
  },
  {
    id: "appsumo",
    name: "AppSumo Launch",
    description: "Offer a lifetime deal on AppSumo marketplace",
    category: "free",
    effort: 3,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 50, mid: 200, high: 1000 },
    tips: "High volume, low-margin customers. Great for cash injection & social proof."
  },
  {
    id: "hacker-news",
    name: "Hacker News (Show HN)",
    description: "Launch or Show HN post for tech audience",
    category: "community",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 15, high: 50 },
    tips: "Very technical audience. Best for developer tools."
  },
  {
    id: "indie-hackers",
    name: "Indie Hackers",
    description: "Share your story and product on Indie Hackers",
    category: "community",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 5, high: 15 },
    tips: "Great for connecting with other founders. Modest direct customer acquisition."
  },
  {
    id: "startup-directories",
    name: "Startup Directories",
    description: "List on 50+ startup directories (SaaSHub, AlternativeTo, etc)",
    category: "free",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "partial",
    customersPerMonth: { low: 1, mid: 5, high: 20 },
    tips: "Tedious but free backlinks + small traffic. Do once."
  },

  // === SOCIAL MEDIA CONTENT ===
  {
    id: "build-in-public",
    name: "Build in Public (Twitter/X)",
    description: "Share your journey, wins, and lessons on Twitter",
    category: "content",
    effort: 2,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 10, high: 50 },
    tips: "Consistency > perfection. Share real numbers, real struggles."
  },
  {
    id: "linkedin-content",
    name: "LinkedIn Content",
    description: "Post valuable content for B2B audiences",
    category: "content",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 8, high: 30 },
    tips: "Best for B2B. Personal stories + insights perform well."
  },
  {
    id: "tiktok",
    name: "TikTok Content",
    description: "Short-form video content showing your product",
    category: "content",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "high",
    automationPotential: "partial",
    customersPerMonth: { low: 5, mid: 25, high: 150 },
    tips: "Algorithm rewards consistency. Show the problem & solution in 30 seconds."
  },
  {
    id: "instagram-reels",
    name: "Instagram Reels",
    description: "Short videos on Instagram for visual products",
    category: "content",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 10, high: 40 },
    tips: "Repurpose TikTok content. Good for B2C SaaS."
  },
  {
    id: "twitter-threads",
    name: "Twitter/X Threads",
    description: "Write educational threads that showcase your expertise",
    category: "content",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 8, high: 30 },
    tips: "One great thread can go viral. End with a soft CTA."
  },

  // === VIDEO CONTENT ===
  {
    id: "youtube",
    name: "YouTube Tutorials",
    description: "Create video content showing your product solving problems",
    category: "content",
    effort: 4,
    timeToResults: "slow",
    cost: "low",
    impactPotential: "high",
    automationPotential: "partial",
    customersPerMonth: { low: 3, mid: 15, high: 60 },
    tips: "How-to videos + problem-focused titles. Compound over time."
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    description: "Quick 60-second videos showing product value",
    category: "content",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 10, high: 40 },
    tips: "Repurpose TikTok content. Quick wins, tips, or demos."
  },
  {
    id: "loom-demos",
    name: "Personalized Loom Demos",
    description: "Send personalized video demos to prospects",
    category: "outreach",
    effort: 3,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 8, high: 20 },
    tips: "Higher response rate than cold emails. Show THEIR use case."
  },

  // === WRITTEN CONTENT ===
  {
    id: "seo-content",
    name: "SEO / Blog Content",
    description: "Write articles that rank in Google for your keywords",
    category: "content",
    effort: 4,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "high",
    automationPotential: "partial",
    customersPerMonth: { low: 5, mid: 25, high: 100 },
    tips: "Takes 3-6 months to see results. Focus on long-tail keywords first."
  },
  {
    id: "guest-posting",
    name: "Guest Posting",
    description: "Write articles for other blogs in your niche",
    category: "content",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 8, high: 25 },
    tips: "Aim for blogs your audience actually reads. Include author bio CTA."
  },
  {
    id: "quora-answers",
    name: "Quora Answers",
    description: "Answer questions and subtly mention your product",
    category: "content",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "partial",
    customersPerMonth: { low: 1, mid: 5, high: 15 },
    tips: "Find questions with traffic. Be genuinely helpful, not salesy."
  },
  {
    id: "medium-articles",
    name: "Medium Articles",
    description: "Publish on Medium for built-in audience",
    category: "content",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "partial",
    customersPerMonth: { low: 1, mid: 4, high: 12 },
    tips: "Join relevant publications. Cross-post from your blog."
  },
  {
    id: "substack-newsletter",
    name: "Start a Newsletter",
    description: "Build an email list with valuable content",
    category: "content",
    effort: 3,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "high",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 10, high: 40 },
    tips: "Long-term asset. Owned audience = no algorithm risk."
  },

  // === COMMUNITIES ===
  {
    id: "reddit",
    name: "Reddit Communities",
    description: "Engage in subreddits where your customers hang out",
    category: "community",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 3, mid: 15, high: 40 },
    tips: "Be helpful first, promote second. Redditors hate obvious marketing."
  },
  {
    id: "facebook-groups",
    name: "Facebook Groups",
    description: "Join and contribute to niche Facebook groups",
    category: "community",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 10, high: 30 },
    tips: "Find groups where your customers ask questions. Answer without pitching."
  },
  {
    id: "discord-servers",
    name: "Discord Communities",
    description: "Join and engage in Discord servers in your niche",
    category: "community",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 5, high: 15 },
    tips: "Be a regular contributor first. Relationships > promotions."
  },
  {
    id: "slack-communities",
    name: "Slack Communities",
    description: "Participate in professional Slack communities",
    category: "community",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 4, high: 12 },
    tips: "Great for B2B. Many industry-specific communities."
  },
  {
    id: "niche-forums",
    name: "Niche Forums",
    description: "Participate in industry-specific forums",
    category: "community",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 4, high: 12 },
    tips: "Old-school but still works. Find where YOUR audience hangs out."
  },
  {
    id: "community-building",
    name: "Build Your Own Community",
    description: "Create a Discord/Slack community around your niche",
    category: "community",
    effort: 5,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 3, mid: 15, high: 50 },
    tips: "Long-term play. Community becomes a moat."
  },

  // === DIRECT OUTREACH ===
  {
    id: "cold-email",
    name: "Cold Email Outreach",
    description: "Reach out directly to potential customers via email",
    category: "outreach",
    effort: 3,
    timeToResults: "quick",
    cost: "low",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 2, mid: 10, high: 30 },
    tips: "Personalization is key. 1-3% reply rate is normal. Use tools like Lemlist."
  },
  {
    id: "cold-dm",
    name: "Cold DMs (Twitter/LinkedIn)",
    description: "Direct message potential customers on social platforms",
    category: "outreach",
    effort: 3,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 1, mid: 8, high: 25 },
    tips: "Be genuine, not salesy. Offer value before asking."
  },
  {
    id: "linkedin-outreach",
    name: "LinkedIn Connection Requests",
    description: "Connect with prospects and start conversations",
    category: "outreach",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 8, high: 25 },
    tips: "Don't pitch in the connection request. Build relationship first."
  },
  {
    id: "warm-intros",
    name: "Ask for Warm Intros",
    description: "Get introduced to prospects through mutual connections",
    category: "outreach",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 5, high: 15 },
    tips: "Highest conversion rate. Ask your network who they know."
  },

  // === PARTNERSHIPS & INFLUENCERS ===
  {
    id: "partnerships",
    name: "Strategic Partnerships",
    description: "Partner with complementary tools for cross-promotion",
    category: "free",
    effort: 4,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 5, mid: 20, high: 60 },
    tips: "Takes relationship building. Start with smaller partners."
  },
  {
    id: "podcast-guesting",
    name: "Podcast Guesting",
    description: "Appear on podcasts your audience listens to",
    category: "content",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 8, high: 25 },
    tips: "Pitch 10+ podcasts. Focus on smaller, niche shows."
  },
  {
    id: "micro-influencers",
    name: "Micro-Influencers",
    description: "Pay small creators (1K-50K followers) to promote",
    category: "paid",
    effort: 3,
    timeToResults: "quick",
    cost: "low",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 3, mid: 12, high: 40 },
    tips: "Often better ROI than big influencers. More authentic."
  },
  {
    id: "influencer-marketing",
    name: "Influencer Marketing",
    description: "Pay larger creators to promote your product",
    category: "paid",
    effort: 3,
    timeToResults: "quick",
    cost: "high",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 10, mid: 50, high: 200 },
    tips: "Negotiate performance-based deals if possible."
  },
  {
    id: "youtube-sponsors",
    name: "YouTube Sponsorships",
    description: "Sponsor YouTube videos in your niche",
    category: "paid",
    effort: 2,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 5, mid: 25, high: 100 },
    tips: "Videos keep getting views over time. Evergreen traffic."
  },

  // === REFERRAL & AFFILIATE ===
  {
    id: "referral-program",
    name: "Referral Program",
    description: "Reward customers for bringing in new customers",
    category: "free",
    effort: 3,
    timeToResults: "medium",
    cost: "low",
    impactPotential: "high",
    automationPotential: "full",
    customersPerMonth: { low: 2, mid: 10, high: 40 },
    tips: "Needs existing happy customers. Offer meaningful rewards."
  },
  {
    id: "affiliate",
    name: "Affiliate Program",
    description: "Pay others a commission for each customer they bring",
    category: "paid",
    effort: 3,
    timeToResults: "medium",
    cost: "medium",
    impactPotential: "high",
    automationPotential: "full",
    customersPerMonth: { low: 5, mid: 20, high: 80 },
    tips: "20-30% commission is standard for SaaS. Use tools like Rewardful."
  },
  {
    id: "lifetime-deal-sites",
    name: "Lifetime Deal Sites",
    description: "List on StackSocial, PitchGround, DealMirror",
    category: "free",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 10, mid: 50, high: 200 },
    tips: "Similar to AppSumo but smaller platforms. Good for cash flow."
  },

  // === PAID ADVERTISING ===
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Pay for clicks from people searching for solutions",
    category: "paid",
    effort: 4,
    timeToResults: "quick",
    cost: "high",
    impactPotential: "high",
    automationPotential: "full",
    customersPerMonth: { low: 10, mid: 40, high: 150 },
    tips: "High intent traffic. Start with exact match keywords."
  },
  {
    id: "facebook-ads",
    name: "Facebook/Meta Ads",
    description: "Target specific demographics and interests",
    category: "paid",
    effort: 4,
    timeToResults: "quick",
    cost: "high",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 5, mid: 25, high: 100 },
    tips: "Great for B2C. Requires creative testing."
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "Target by job title, company, industry",
    category: "paid",
    effort: 3,
    timeToResults: "quick",
    cost: "high",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 3, mid: 15, high: 50 },
    tips: "Expensive but very targeted for B2B. Use for high-ticket products."
  },
  {
    id: "twitter-ads",
    name: "Twitter/X Ads",
    description: "Promoted tweets and accounts",
    category: "paid",
    effort: 3,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "low",
    automationPotential: "full",
    customersPerMonth: { low: 2, mid: 10, high: 30 },
    tips: "Cheaper than other platforms. Good for tech/startup audiences."
  },
  {
    id: "reddit-ads",
    name: "Reddit Ads",
    description: "Target specific subreddits with ads",
    category: "paid",
    effort: 2,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 3, mid: 15, high: 50 },
    tips: "Cheap and targeted. Ads need to match the subreddit vibe."
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    description: "Reach younger demographics with video ads",
    category: "paid",
    effort: 3,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 5, mid: 20, high: 80 },
    tips: "Ads should look native. UGC-style performs best."
  },
  {
    id: "newsletter-sponsorship",
    name: "Newsletter Sponsorships",
    description: "Sponsor newsletters your audience reads",
    category: "paid",
    effort: 2,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 3, mid: 12, high: 35 },
    tips: "CPM varies widely. Test small before committing big."
  },
  {
    id: "podcast-ads",
    name: "Podcast Advertising",
    description: "Sponsor podcasts your audience listens to",
    category: "paid",
    effort: 2,
    timeToResults: "quick",
    cost: "medium",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 3, mid: 15, high: 50 },
    tips: "Host-read ads convert best. Track with unique codes."
  },

  // === FREE TOOLS / LEAD MAGNETS ===
  {
    id: "free-tool",
    name: "Free Tool / Calculator",
    description: "Build a free tool that attracts your target audience",
    category: "free",
    effort: 4,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "high",
    automationPotential: "full",
    customersPerMonth: { low: 5, mid: 20, high: 80 },
    tips: "Solves a related problem. Captures emails. Example: free invoice generator."
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet (PDF/Template)",
    description: "Offer a valuable download in exchange for email",
    category: "free",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "full",
    customersPerMonth: { low: 2, mid: 10, high: 30 },
    tips: "Checklist, template, or guide related to your product."
  },
  {
    id: "freemium",
    name: "Freemium Model",
    description: "Offer a free tier to attract users who upgrade",
    category: "free",
    effort: 4,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "high",
    automationPotential: "full",
    customersPerMonth: { low: 5, mid: 25, high: 100 },
    tips: "Free tier should be genuinely useful but limited enough to upgrade."
  },
  {
    id: "open-source",
    name: "Open Source Component",
    description: "Open source part of your product for visibility",
    category: "free",
    effort: 4,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 10, high: 40 },
    tips: "Developers find it, star it, some convert. Long-term play."
  },

  // === REVIEWS & DIRECTORIES ===
  {
    id: "g2-capterra",
    name: "G2 / Capterra Listings",
    description: "Get listed and reviewed on software review sites",
    category: "free",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 10, high: 35 },
    tips: "B2B buyers check these sites. Ask customers for reviews."
  },
  {
    id: "trustpilot",
    name: "Trustpilot Reviews",
    description: "Build social proof with verified reviews",
    category: "free",
    effort: 1,
    timeToResults: "slow",
    cost: "free",
    impactPotential: "low",
    automationPotential: "partial",
    customersPerMonth: { low: 1, mid: 3, high: 10 },
    tips: "Automate review requests after positive interactions."
  },

  // === EVENTS & WEBINARS ===
  {
    id: "webinars",
    name: "Host Webinars",
    description: "Teach something valuable, pitch at the end",
    category: "content",
    effort: 3,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 3, mid: 12, high: 40 },
    tips: "80% education, 20% pitch. Repurpose recording as content."
  },
  {
    id: "live-demos",
    name: "Weekly Live Demos",
    description: "Open demo sessions for prospects",
    category: "content",
    effort: 2,
    timeToResults: "quick",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 8, high: 25 },
    tips: "Low-pressure way for prospects to see the product."
  },
  {
    id: "virtual-summits",
    name: "Speak at Virtual Summits",
    description: "Present at online conferences and summits",
    category: "content",
    effort: 3,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "manual",
    customersPerMonth: { low: 2, mid: 10, high: 30 },
    tips: "Establish authority. Many summits looking for speakers."
  },
  {
    id: "local-meetups",
    name: "Local Meetups & Events",
    description: "Attend or speak at local tech/business meetups",
    category: "community",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "low",
    automationPotential: "manual",
    customersPerMonth: { low: 1, mid: 3, high: 10 },
    tips: "Great for B2B local businesses. Real relationships."
  },

  // === PR & PRESS ===
  {
    id: "press-outreach",
    name: "Press/PR Outreach",
    description: "Pitch journalists and publications for coverage",
    category: "free",
    effort: 4,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "high",
    automationPotential: "manual",
    customersPerMonth: { low: 5, mid: 25, high: 100 },
    tips: "Craft a newsworthy angle. Use HARO for journalist queries."
  },
  {
    id: "haro",
    name: "HARO (Help a Reporter)",
    description: "Respond to journalist queries for free press",
    category: "free",
    effort: 2,
    timeToResults: "medium",
    cost: "free",
    impactPotential: "medium",
    automationPotential: "partial",
    customersPerMonth: { low: 2, mid: 8, high: 30 },
    tips: "Respond quickly with genuine expertise. Most won't get picked."
  },
];

const COST_LABELS = {
  free: { label: "Free", color: "text-green-600", bg: "bg-green-100" },
  low: { label: "$50-200/mo", color: "text-blue-600", bg: "bg-blue-100" },
  medium: { label: "$200-1000/mo", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "$1000+/mo", color: "text-red-600", bg: "bg-red-100" },
};

const TIME_LABELS = {
  quick: { label: "Days-Weeks", color: "text-green-600" },
  medium: { label: "1-3 Months", color: "text-amber-600" },
  slow: { label: "3-6+ Months", color: "text-red-600" },
};

const IMPACT_LABELS = {
  low: { label: "Low", stars: 1 },
  medium: { label: "Medium", stars: 2 },
  high: { label: "High", stars: 3 },
};

const CATEGORY_LABELS = {
  free: "Free/Organic",
  paid: "Paid Ads",
  content: "Content",
  outreach: "Outreach",
  community: "Community",
};

export function Day20TheLaunch({ appName, onComplete }: Day20TheLaunchProps) {
  const [step, setStep] = useState<"intro" | "strategies" | "projection" | "complete">("intro");
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    cost: "all" as "all" | "free" | "low" | "medium" | "high",
    time: "all" as "all" | "quick" | "medium" | "slow",
    effort: "all" as "all" | "easy" | "hard",
  });
  const [projectionLevel, setProjectionLevel] = useState<"low" | "mid" | "high">("mid");
  const [pricePoint, setPricePoint] = useState(29);

  const filteredStrategies = useMemo(() => {
    return STRATEGIES.filter((s) => {
      if (filters.cost !== "all" && s.cost !== filters.cost) return false;
      if (filters.time !== "all" && s.timeToResults !== filters.time) return false;
      if (filters.effort === "easy" && s.effort > 3) return false;
      if (filters.effort === "hard" && s.effort <= 3) return false;
      return true;
    });
  }, [filters]);

  const toggleStrategy = (id: string) => {
    if (selectedStrategies.includes(id)) {
      setSelectedStrategies(selectedStrategies.filter((s) => s !== id));
    } else if (selectedStrategies.length < 3) {
      setSelectedStrategies([...selectedStrategies, id]);
    }
  };

  const selectedStrategyData = STRATEGIES.filter((s) => selectedStrategies.includes(s.id));

  const projectedCustomers = useMemo(() => {
    return selectedStrategyData.reduce((sum, s) => sum + s.customersPerMonth[projectionLevel], 0);
  }, [selectedStrategyData, projectionLevel]);

  const projectedMonthlyRevenue = projectedCustomers * pricePoint;
  const projectedYearlyRevenue = projectedMonthlyRevenue * 12;

  // Calculate cumulative growth over 12 months (each month adds projected new customers)
  const cumulativeMonths = useMemo(() => {
    const months = [];
    let totalCustomers = 0;
    for (let i = 1; i <= 12; i++) {
      totalCustomers += projectedCustomers;
      months.push({
        month: i,
        customers: totalCustomers,
        mrr: totalCustomers * pricePoint,
      });
    }
    return months;
  }, [projectedCustomers, pricePoint]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Launch Plan</h3>
        <p className="text-slate-600 mt-1">
          {STRATEGIES.length} ways to get customers. You only need 1-3 to work.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-green-100 bg-green-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                The Secret Nobody Tells You
              </h4>
              <p className="text-slate-700 text-lg">
                You don't need to master ALL of these strategies.<br />
                <span className="font-bold text-green-700">You only need 1-2-3 to actually WORK.</span>
              </p>
              <p className="text-slate-600 mt-3">
                Every successful SaaS found their 1-3 channels and doubled down.
                The rest? Just noise.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                {STRATEGIES.length} Ways to Get Customers
              </h4>
              <p className="text-slate-700">
                Free strategies, paid strategies, content, outreach, communities, partnerships...
                <br />
                <span className="font-medium">The trick is finding YOUR winning 1-3.</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What We'll Do</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-slate-700">Browse ALL {STRATEGIES.length} customer acquisition strategies</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-slate-700">Filter by cost, time, and effort to find what fits YOU</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-slate-700"><strong>Pick just 3</strong> to focus on (you only need 1-2 to work!)</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-slate-700">See what's possible if they work</p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("strategies")}
          >
            Explore Strategies <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Strategy Selection */}
      {step === "strategies" && (
        <>
          {/* Filters */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">Filter strategies:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.cost}
                onChange={(e) => setFilters({ ...filters, cost: e.target.value as any })}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">Any Cost</option>
                <option value="free">Free Only</option>
                <option value="low">Low Cost ($50-200)</option>
                <option value="medium">Medium ($200-1000)</option>
                <option value="high">High ($1000+)</option>
              </select>
              <select
                value={filters.time}
                onChange={(e) => setFilters({ ...filters, time: e.target.value as any })}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">Any Timeline</option>
                <option value="quick">Quick (Days-Weeks)</option>
                <option value="medium">Medium (1-3 Months)</option>
                <option value="slow">Slow (3-6+ Months)</option>
              </select>
              <select
                value={filters.effort}
                onChange={(e) => setFilters({ ...filters, effort: e.target.value as any })}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">Any Effort</option>
                <option value="easy">Easier (1-3)</option>
                <option value="hard">Harder (4-5)</option>
              </select>
            </div>
          </Card>

          {/* Selection Status */}
          <Card className={`p-4 border-2 ${selectedStrategies.length >= 1 ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-900">
                  {selectedStrategies.length}/3 strategies selected
                </span>
                {selectedStrategies.length === 0 && (
                  <p className="text-sm text-slate-600">Pick 1-3 strategies to focus on</p>
                )}
                {selectedStrategies.length === 1 && (
                  <p className="text-sm text-green-700 font-medium">1 strategy can be enough to build a business!</p>
                )}
                {selectedStrategies.length === 2 && (
                  <p className="text-sm text-green-700 font-medium">2 strategies = solid foundation for growth</p>
                )}
                {selectedStrategies.length === 3 && (
                  <p className="text-sm text-green-700 font-medium">Perfect! 3 strategies max - stay focused</p>
                )}
              </div>
              {selectedStrategies.length >= 1 && (
                <Button onClick={() => setStep("projection")} className="gap-2">
                  See Projection <TrendingUp className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>

          {/* Reminder */}
          <Card className="p-4 border-2 border-amber-100 bg-amber-50">
            <p className="text-amber-800 text-sm text-center">
              <strong>Remember:</strong> You don't need all {STRATEGIES.length}. Most successful SaaS businesses
              found <span className="font-bold">ONE channel that really worked</span> and went all-in.
            </p>
          </Card>

          {/* Strategy Cards */}
          <div className="space-y-3">
            {filteredStrategies.map((strategy) => {
              const isSelected = selectedStrategies.includes(strategy.id);
              const costInfo = COST_LABELS[strategy.cost];
              const timeInfo = TIME_LABELS[strategy.timeToResults];
              const impactInfo = IMPACT_LABELS[strategy.impactPotential];

              return (
                <Card
                  key={strategy.id}
                  className={`p-4 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? "border-primary bg-primary text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{strategy.name}</h4>
                          <p className="text-sm text-slate-600 mt-0.5">{strategy.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${costInfo.bg} ${costInfo.color} flex-shrink-0`}>
                          {costInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className={timeInfo.color}>{timeInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">Effort: {strategy.effort}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">
                            Impact: {Array(impactInfo.stars).fill("★").join("")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">
                            ~{strategy.customersPerMonth.mid}/mo
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
                          <strong>Tip:</strong> {strategy.tips}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredStrategies.length === 0 && (
            <Card className="p-6 border-2 border-slate-200 bg-slate-50 text-center">
              <p className="text-slate-600">No strategies match your filters. Try adjusting them.</p>
            </Card>
          )}

          {selectedStrategies.length >= 1 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("projection")}
            >
              See My Growth Projection <TrendingUp className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Projection */}
      {step === "projection" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Selected Strategies</h4>
            <div className="space-y-2">
              {selectedStrategyData.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-sm text-slate-600">~{s.customersPerMonth[projectionLevel]} customers/mo</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Adjust Your Projection</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Success Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "mid", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setProjectionLevel(level)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        projectionLevel === level
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-bold text-slate-900 capitalize">{level === "mid" ? "Medium" : level}</p>
                      <p className="text-xs text-slate-500">
                        {level === "low" ? "Conservative" : level === "mid" ? "Realistic" : "Optimistic"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price Point</label>
                <div className="flex gap-2">
                  {[9, 29, 49, 99, 199].map((price) => (
                    <button
                      key={price}
                      onClick={() => setPricePoint(price)}
                      className={`flex-1 p-2 rounded-lg border-2 text-center transition-all ${
                        pricePoint === price
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-bold text-slate-900">${price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="text-center mb-6">
              <p className="text-slate-600 mb-1">Projected New Customers Per Month</p>
              <p className="text-4xl font-extrabold text-slate-900">{projectedCustomers}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg">
                <p className="text-slate-600 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${projectedMonthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-slate-600 text-sm">Yearly Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${projectedYearlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">12-Month Growth Projection</h4>
            <p className="text-sm text-slate-600 mb-4">
              If you add ~{projectedCustomers} new customers each month (and keep most of them):
            </p>

            {/* Simple bar chart */}
            <div className="space-y-2">
              {[1, 3, 6, 12].map((month) => {
                const data = cumulativeMonths[month - 1];
                const maxMrr = cumulativeMonths[11].mrr;
                const width = (data.mrr / maxMrr) * 100;

                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-slate-600">Month {month}</span>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-28 text-sm font-medium text-slate-900 text-right">
                      ${data.mrr.toLocaleString()}/mo
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-slate-600">After 12 months with these strategies:</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {cumulativeMonths[11].customers} customers
              </p>
              <p className="text-xl font-bold text-green-600">
                ${cumulativeMonths[11].mrr.toLocaleString()}/month MRR
              </p>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> These are illustrative projections based on typical results.
              Your actual results will vary based on execution, market, and product-market fit.
              But the math shows what's POSSIBLE.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            Lock In My Strategy <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">Your Growth Plan is Set</h4>
              <p className="text-slate-700">
                {selectedStrategies.length === 1
                  ? "1 focused strategy - many businesses were built on just ONE channel"
                  : selectedStrategies.length === 2
                    ? "2 strategies selected - a strong, focused approach"
                    : "3 strategies selected - maximum recommended for focus"
                }
              </p>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-100 bg-amber-50">
            <p className="text-amber-800 text-center">
              <strong>Your mission:</strong> Go ALL IN on {selectedStrategies.length === 1 ? "this strategy" : "these strategies"}.
              {selectedStrategies.length === 1
                ? " If it works, you've found your channel. If not, try another."
                : " The goal isn't to do all of them perfectly - it's to find the ONE that clicks."
              }
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Focus {selectedStrategies.length === 1 ? "Strategy" : "Strategies"}</h4>
            {selectedStrategyData.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg mb-2 last:mb-0">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-600">{s.tips}</p>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your 12-Month Potential</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-slate-900">{cumulativeMonths[11].customers}</p>
                <p className="text-slate-600">Customers</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">${cumulativeMonths[11].mrr.toLocaleString()}</p>
                <p className="text-slate-600">Monthly Revenue</p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              selectedStrategies,
              projectedCustomers: cumulativeMonths[11].customers,
              projectedRevenue: cumulativeMonths[11].mrr
            })}
          >
            Continue to Day 21 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
