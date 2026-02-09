# Memory

## Post-Deploy Cleanup
- [ ] Remove one-time duplicate comments cleanup migration from `server/index.ts` (lines ~144-153) after first deploy
- The old drip email greeting migration was already removed in Session 5

## Session 5 Changes (2026-02-09) — Needs Redeploy
- Facebook Pixel overhaul: ViewContent, InitiateCheckout, CompleteRegistration events added; event_id + content_ids on all Purchase events; server-side CAPI module created
- META_CONVERSIONS_API_TOKEN env var needed to activate server-side tracking (works without it, just skips)
- Sidebar fix: Claude Code Guide + Sales Letter Critique now show when allDaysUnlocked is true
- Duplicate comments: server-side rejection added + one-time cleanup migration
- Critique page: gate now also passes if allDaysUnlocked is true

## Key Architecture Notes
- Dev DB is separate from production DB — can't query prod from dev
- Pixel base code loads from `client/index.html` (fast, pre-React). `FacebookPixel.tsx` is just a utility module for tracking events.
- CAPI uses Stripe session ID as event_id for dedup with client-side pixel
