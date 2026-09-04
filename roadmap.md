# Roadmap

## Done
- [x] Dashboard at `/` — KPI cards, workflow strip, map, priority queue, filters, full event table
- [x] `/map` — full Leaflet map of filtered events
- [x] `/analytics` — recharts breakdowns (class, region, risk, daily trend)
- [x] `/alerts` — medium/high-risk alerts + notification channel status
- [x] `/data-sources` — FIRMS / OSM / satellite / channel status
- [x] AppShell + TerraPulseProvider wired into __root; Toaster mounted; head metadata set

## SIH presentation readiness
- [x] Demo-mode banner + presentation KPI cards on dashboard
- [x] Rich map popup (class, confidence, FRP, facility, distance, persistence, risk, status) + details link
- [x] Anchor demo event TP-1042 with fixed presentation figures
- [x] `/events/$id` detail page: observation, context, persistence timeline, AI classification, explainability, verification
- [x] Alerts page: View / Verify / Dismiss actions + escalation guidance
- [x] Data sources page: source list + FIRMS context statement

## Open / future
- [ ] Enable Lovable Cloud: persist events + verification status/audit log; add auth
- [ ] Live NASA FIRMS feed (server fn at /api/public/firms + VITE_FIRMS_ENABLED)
- [ ] Replace demo FACILITIES with Overpass API query behind existing signature
