# Remix of Remix of TerraPulse Insights

Build a production-quality, deployable MVP web application called "TerraPulse".

PROJECT:

TerraPulse is an AI-assisted satellite thermal anomaly detection, classification and risk-prioritization platform for SIH Problem Statement SIH26162:

"AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data"

The purpose is NOT to simply detect fires. NASA FIRMS already provides satellite-based active fire / thermal anomaly observations. TerraPulse adds geographic context, temporal persistence analysis and AI-based probable source classification to help distinguish possible industrial fires, gas flares, persistent industrial heat, agricultural burning and wildfires.

IMPORTANT SAFETY / TERMINOLOGY RULE:

Never display "Fire Confirmed".

Never claim that a FIRMS hotspot is definitely a fire.

Always use wording such as:

- "Possible Industrial Fire"

- "Possible Gas Flare"

- "Persistent Thermal Source"

- "Possible Agricultural Burning"

- "Possible Wildfire"

- "Unclassified Thermal Anomaly"

Include confidence scores and clearly label them as model predictions.

==================================================

1. TECH STACK

==================================================

Use:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Leaflet / react-leaflet for interactive maps

- Recharts for analytics

- Supabase/PostgreSQL for persistence where useful

- PostGIS-compatible geographic data structure if supported

- REST-style service layer for external data

- Responsive desktop-first UI

The application must be deployable as a normal web application.

Do NOT add:

- MongoDB

- Node.js backend as a separate requirement

- Flutter

- TensorFlow

- unnecessary cloud infrastructure

- fake enterprise infrastructure

Keep the MVP practical and easy to deploy.

==================================================

2. MAIN PRODUCT STRUCTURE

==================================================

Create the following pages:

1. Dashboard

2. Thermal Events / Live Map

3. Event Details

4. Analytics

5. Alerts

6. Settings / Data Sources

Use a left sidebar navigation on desktop and responsive navigation on mobile.

Application name:

TerraPulse

Tagline:

"Satellite Intelligence for Thermal Risk Detection"

==================================================

3. DASHBOARD

==================================================

Create a professional disaster-management / GIS dashboard.

Top header:

- TerraPulse logo/name

- "Satellite Thermal Intelligence"

- Last data update time

- Refresh button

- Notification icon

- User/profile area

Top KPI cards:

- Active Thermal Anomalies

- Possible Industrial Fires

- Persistent Thermal Sources

- High-Risk Events

Use realistic DEMO values initially.

Example:

Active Thermal Anomalies: 128

Possible Industrial Fires: 14

Persistent Thermal Sources: 27

High-Risk Events: 6

Clearly mark demo/mock values where real external data is not connected.

Below KPI cards:

LEFT / MAIN AREA:

Large interactive Leaflet GIS map.

RIGHT:

"Priority Events" panel showing the highest-risk thermal events.

Each event card should show:

- Event ID

- Probable class

- Confidence

- Risk level

- FRP

- Nearby facility

- Distance

- Persistence

- Verification status

Example:

TP-1042

Possible Industrial Fire

89% confidence

HIGH RISK

FRP: 45 MW

Nearby: Refinery

Distance: 420 m

Persistence: 3 detections / 7 days

Status: Requires Verification

Again, NEVER write "Fire Confirmed".

==================================================

4. GIS / LIVE THERMAL MAP

==================================================

This is the most important feature.

Create a full-screen interactive Leaflet map.

Use OpenStreetMap base tiles.

Display thermal anomaly markers.

Marker appearance should vary according to:

- risk

- probable source class

- verification status

Clicking a marker opens an event popup.

Popup must show:

Event ID

Probable Classification

Confidence

FRP

Brightness Temperature

Detection Time

Latitude

Longitude

Nearby Facility

Distance

Persistence

Risk Score

Verification Status

Example:

TP-1042

Possible Industrial Fire

Confidence: 89%

FRP: 45 MW

Brightness Temperature: 331 K

Detected: 10 Sep 2026, 14:32 UTC

Nearby Facility: Refinery

Distance: 420 m

Persistence: 3 detections / 7 days

Risk Score: 82/100

Status: Requires Verification

Add map controls:

- Zoom

- Locate

- Fullscreen

- Layer control

Map layers:

1. Thermal Anomalies

2. Industrial Facilities

3. Roads

4. Land Cover

5. Administrative Boundaries

Add a legend.

==================================================

5. MAP FILTERS

==================================================

Create a filter panel above or beside the map.

Filters:

Date range

Risk level:

- High

- Medium

- Low

Probable source:

- Possible Industrial Fire

- Possible Gas Flare

- Persistent Thermal Source

- Possible Agricultural Burning

- Possible Wildfire

- Unclassified

Confidence:

- >80%

- 60–80%

- <60%

Persistence:

- Single detection

- Repeated

- Persistent

Facility type:

- Refinery

- Power Plant

- Factory

- Mining

- Other

Verification:

- Requires Verification

- Verified

- Dismissed

Filters must actually update the displayed event list and map markers using the local demo dataset.

==================================================

6. EVENT DETAILS PAGE

==================================================

When a user clicks an event, open a detailed event page.

Sections:

A. Event Summary

Event ID

Classification

Confidence

Risk Score

Current Status

B. Thermal Information

FRP

Brightness Temperature

Satellite / Sensor

Detection time

Latitude

Longitude

C. Context Analysis

Nearby industrial facility

Facility type

Distance from facility

Land-cover type

Nearby road

Nearby settlement

Satellite context placeholder/image area

D. Persistence Analysis

Show historical detections on a timeline.

Example:

Day 1 → detected

Day 3 → detected

Day 5 → detected

"3 detections in last 7 days"

Show a small line chart for thermal intensity over time.

Dynamically calculate a persistence score from demo data.

E. AI Classification

Show probable classes with confidence.

Example:

Possible Industrial Fire — 89%

Possible Gas Flare — 6%

Persistent Industrial Heat — 3%

Other — 2%

Show a horizontal probability visualization.

Below it:

"AI prediction based on thermal intensity, geographic context and temporal recurrence."

F. Explainability

Show the main factors contributing to the prediction:

FRP intensity

Distance to industrial facility

Recurrence

Land-cover context

Satellite context

Do NOT claim these are scientifically calibrated weights. Present them as model evidence/features for the prototype.

G. Verification

Buttons:

"Verify Event"

"Mark as Dismissed"

"Needs Further Review"

When "Verify Event" is clicked:

change status to "Human Verified"

When dismissed:

change status to "Dismissed"

Keep an audit-style timestamp.

==================================================

7. AI / ML PROTOTYPE

==================================================

Implement a frontend/backend-friendly classification service abstraction.

For the MVP, use a deterministic demo classification engine based on event features.

Do NOT pretend that the prototype has been trained on a real labeled dataset.

Create a service such as:

classifyThermalEvent(event)

It should use features such as:

- FRP

- brightness temperature

- distance to industrial facility

- persistence count

- land-cover type

- facility type

- recurrence frequency

Return:

{

  probableClass,

  confidence,

  riskScore,

  explanationFactors

}

Possible classes:

INDUSTRIAL_FIRE

GAS_FLARE

PERSISTENT_INDUSTRIAL_HEAT

AGRICULTURAL_BURNING

WILDFIRE

UNCLASSIFIED

Use realistic deterministic demo logic.

Example:

If event is near refinery + high FRP + repeated detections:

Possible Industrial Fire / high confidence

If event is repeatedly detected near oil/gas infrastructure:

Possible Gas Flare / high persistence

If event is repeatedly detected at nearly the same coordinates:

Persistent Thermal Source

If event is in agricultural land and short-lived:

Possible Agricultural Burning

If event is in forest area and spatially expanding:

Possible Wildfire

Clearly label this as:

"Prototype AI classification"

Do not claim production ML accuracy.

Create the architecture so the demo classifier can later be replaced by XGBoost or Random Forest without changing the UI.

==================================================

8. PERSISTENCE ANALYSIS

==================================================

This is a major feature.

For every event, compare current observation with historical observations near the same geographic location.

Calculate:

- detection count

- number of active days

- recurrence frequency

- approximate persistence duration

Example:

Current Event:

3 detections

7-day observation window

Persistence: Repeated

For persistent sources show:

"Repeated thermal activity detected at this location."

Do not say that persistence automatically means industrial fire.

==================================================

9. INDUSTRIAL FACILITY MATCHING

==================================================

Create an OSM-style facility matching system.

Use demo facility data initially.

Facility fields:

name

type

latitude

longitude

Types:

- Refinery

- Power Plant

- Factory

- Mining

- Oil & Gas

- Industrial Area

For each thermal event calculate approximate distance to the nearest facility.

Show:

Nearest Facility:

ABC Refinery

Type: Refinery

Distance: 420 m

Create the service abstraction:

findNearestFacility(event)

Structure it so real OpenStreetMap / Overpass API integration can be added later.

==================================================

10. REAL DATA INTEGRATION READY

==================================================

Create a clean data-service layer.

Services:

firmsService

osmService

satelliteService

classificationService

riskService

NASA FIRMS:

Create an optional FIRMS API integration layer.

Use environment variables for API credentials.

NEVER hardcode API keys in frontend code.

If FIRMS credentials are unavailable:

automatically use the local demo dataset.

The app must still work and deploy without external API credentials.

Display data source status:

NASA FIRMS

Connected / Demo Mode

OpenStreetMap

Available

Satellite imagery

Demo / External source

Make the application usable in DEMO MODE immediately after deployment.

==================================================

11. DEMO DATASET

==================================================

Create at least 25 realistic demo thermal events distributed across India.

Include examples around:

Gujarat

Maharashtra

Odisha

Jharkhand

Chhattisgarh

Assam

Punjab

Madhya Pradesh

Do not imply that the demo coordinates represent actual current fires.

Add a small badge:

"DEMO DATA"

Each event should have:

id

latitude

longitude

timestamp

frp

brightnessTemperature

sensor

probableClass

confidence

riskScore

persistenceCount

landCover

facilityType

facilityName

facilityDistance

verificationStatus

Create at least:

- 5 possible industrial fire events

- 5 gas flare events

- 5 persistent thermal source events

- 4 agricultural burning events

- 3 possible wildfire events

- remaining unclassified

==================================================

12. RISK SCORING

==================================================

Create a prototype risk score from 0–100.

Factors can include:

- thermal intensity

- proximity to industrial facility

- persistence

- land-cover context

- classification confidence

Risk levels:

80–100 = HIGH

50–79 = MEDIUM

0–49 = LOW

Display:

Risk Score: 82/100

Risk Level: HIGH

Important:

Risk score is a prototype decision-support score, not a real-world emergency severity measurement.

==================================================

13. ALERTS

==================================================

Create an Alerts page.

Show:

High Risk

Medium Risk

Low Risk

Example:

HIGH RISK

TP-1042

Possible Industrial Fire

89% confidence

Requires Verification

Actions:

View Event

Verify

Dismiss

Add escalation logic:

HIGH:

Immediate attention

MEDIUM:

Review required

LOW:

Monitor

Do not send real SMS/email automatically in the MVP.

Create notification service abstraction so Firebase Cloud Messaging / Email / SMS can be integrated later.

==================================================

14. ANALYTICS PAGE

==================================================

Use Recharts.

Charts:

1. Thermal Events Over Time

2. Events by Probable Source

3. Events by Risk Level

4. Regional Distribution

5. Persistence Distribution

6. Industrial vs Non-Industrial Classification

Add date filters.

Use demo data.

All charts must update based on filters where practical.

==================================================

15. DATA SOURCES PAGE

==================================================

Create a clean page explaining:

NASA FIRMS

VIIRS

MODIS

OpenStreetMap

Sentinel-2 / Landsat

Land Cover Data

For each:

- purpose

- role in TerraPulse

- current status

Example:

NASA FIRMS

Role:

Provides near-real-time satellite thermal anomaly observations.

Important note:

"A FIRMS detection represents a thermal anomaly and should not automatically be interpreted as a confirmed fire."

==================================================

16. UI DESIGN

==================================================

Design should look like a professional government / disaster-management GIS platform.

Style:

- clean

- modern

- trustworthy

- technical

- minimal

- dashboard-focused

Primary visual focus:

GIS map

Use:

- rounded cards

- subtle borders

- clear typography

- compact spacing

- professional icons

- responsive layout

Avoid:

- excessive gradients

- gaming style

- neon colors

- unnecessary animations

- fake 3D effects

Use clear status badges.

Suggested colors:

Blue = information

Green = normal

Amber = medium risk

Red = high risk

Gray = unclassified

==================================================

17. RESPONSIVENESS

==================================================

Desktop:

Optimized for 1440px dashboard.

Tablet:

Responsive grid.

Mobile:

Stack KPI cards and panels.

Map remains usable.

Sidebar becomes mobile navigation.

==================================================

18. DEPLOYMENT REQUIREMENTS

==================================================

The project must be deployable.

Create:

- proper package configuration

- environment variable structure

- clean component structure

- no hardcoded secrets

- no broken external dependencies

- no placeholder buttons that do nothing

All important buttons should work.

Examples:

Refresh → refresh demo dataset

View Event → event details

Verify → update status

Dismiss → update status

Filters → filter map and list

Search → search events/facilities

Map marker → event popup

Analytics filters → update charts

If Supabase is not configured, the app must still run in DEMO MODE using local data.

==================================================

19. PROJECT STRUCTURE

==================================================

Organize code cleanly:

src/

  components/

  pages/

  data/

  services/

  types/

  hooks/

  utils/

  layouts/

Create reusable components:

KpiCard

MapView

EventMarker

EventPopup

EventTable

RiskBadge

ConfidenceBadge

FilterPanel

PersistenceChart

ClassificationPanel

FacilityCard

AlertCard

Sidebar

Header

Use TypeScript interfaces/types for all event data.

==================================================

20. IMPORTANT PRODUCT LOGIC

==================================================

The complete TerraPulse workflow shown in the UI should be:

THERMAL HOTSPOT

↓

CONTEXT ANALYSIS

↓

AI CLASSIFICATION

↓

PERSISTENCE ANALYSIS

↓

RISK SCORE

↓

GIS VISUALIZATION

↓

ALERT / HUMAN VERIFICATION

Show this workflow visually on the Dashboard as a small horizontal process indicator.

==================================================

21. DEMO EXPERIENCE

==================================================

The application should be presentation-ready.

When opened, the judge should immediately understand:

1. NASA satellite data provides thermal anomalies.

2. TerraPulse adds geographic and temporal context.

3. AI predicts the probable thermal-source class.

4. Persistence identifies recurring sources.

5. Risk scoring prioritizes important events.

6. GIS displays everything spatially.

7. Human verification provides final confirmation.

Create a "Demo Mode" indicator in the header.

Add a small disclaimer:

"TerraPulse provides AI-assisted classification of satellite thermal anomalies. Results are probabilistic and require human verification for operational decisions."

==================================================

22. FINAL QUALITY REQUIREMENT

==================================================

Before finishing:

- remove console errors

- make all routes work

- ensure map renders correctly

- ensure demo data loads

- ensure filters work

- ensure event details work

- ensure charts render

- ensure verification status changes

- ensure responsive layout

- ensure no broken images

- ensure no API key is exposed

- ensure application can run with demo data without external services

The final result should feel like a real working MVP for a Smart India Hackathon demonstration, not a static UI mockup.

Build the application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef8836ae-cc73-4867-9b15-037cffb5d2bf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
