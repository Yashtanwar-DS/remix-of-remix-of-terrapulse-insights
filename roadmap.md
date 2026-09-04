# Roadmap

## Done
- [x] Dashboard at `/` — KPI cards, workflow strip, map, priority queue, filters, full event table
- [x] `/map` — full Leaflet map of filtered events
- [x] `/analytics` — recharts breakdowns (class, region, risk, daily trend)
- [x] `/alerts` — medium/high-risk alerts + notification channel status
- [x] `/data-sources` — FIRMS / OSM / satellite / channel status
- [x] AppShell + TerraPulseProvider wired into __root; Toaster mounted; head metadata set

## Open / future
- [ ] Enable Lovable Cloud: persist events + verification status/audit log; add auth
- [ ] Live NASA FIRMS feed (server fn at /api/public/firms + VITE_FIRMS_ENABLED)
- [ ] Event detail page ($id) with classification explanation factors + detection history chart
- [ ] Replace demo FACILITIES with Overpass API query behind existing signature
