# Embodied - Longevity Tracker

## Overview
A wellness/longevity tracking app built with React + Vite and Express backend. Tracks yoga and movement biomarkers across sessions, displays progress charts, provides daily wellness suggestions, supports Excel data upload, and features a Community tab for matching with nearby users on similar wellness trajectories.

## Project Architecture
- **Frontend**: React 19 + Vite 7
- **Backend**: Express + TypeScript (tsx)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)
- **Styling**: Tailwind CSS 4 with custom animations
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Upload**: xlsx (SheetJS)

### File Structure
```
server/
  index.ts                - Express server (proxies to Vite in dev, serves dist in prod)
  db.ts                   - Drizzle PostgreSQL connection
  routes/
    community.ts          - Community API (profiles, matching, messaging)
  utils/
    matching.ts           - Trajectory similarity algorithm (cosine similarity)
  replit_integrations/
    auth/                 - Replit Auth OIDC integration (DO NOT MODIFY)

shared/
  schema.ts               - Re-exports all Drizzle models
  models/
    auth.ts               - Users and sessions tables
    community.ts          - Profiles, matches, messages tables

src/
  components/
    Header.jsx            - App header with title and icon
    GrowingPlant.jsx      - Animated SVG plant visualization
    LongevityScoreHero.jsx - Hero section with score display
    Navigation.jsx        - Tab navigation (Dashboard, For You, Metrics, Upload, Community)
    DashboardView.jsx     - Dashboard with charts and key metrics
    SuggestionsView.jsx   - Daily suggestions (activities, meals, micro-practices)
    MetricsView.jsx       - Detailed metrics across all categories
    UploadView.jsx        - Excel file upload + spreadsheet display
    SpreadsheetView.jsx   - Table rendering of biomarker data matching Excel layout
    CommunityView.jsx     - Community feature: login, profile setup, match finding, trajectory charts, messaging
  data/
    defaultSessionData.js - Default biomarker data for sessions 1, 6, 12
    suggestions.js        - 3-day cadence suggestions (activities, meals, groceries)
  utils/
    calculations.js       - Score calculations, progress tracking, Excel parsing
    spreadsheetParser.js  - Excel parsing & default spreadsheet data builder
  App.jsx                 - Main app component
  main.jsx                - Entry point
  index.css               - Tailwind + custom animations
```

## Configuration
- Express server: port 5000 (main entry point)
- Vite dev server: port 5173 (proxied through Express in dev)
- Deployment: Autoscale (build: vite build, run: node --import tsx server/index.ts)
- Database: PostgreSQL via DATABASE_URL
- Auth: Replit Auth via SESSION_SECRET

## Community Feature
- Users sign in via Replit Auth, set up a profile with location
- Matching algorithm finds users within 50km with similar wellness trajectories
- Cosine similarity on session improvement vectors (session12 - session1 deltas)
- Trajectory comparison charts overlay two users' progress
- In-app messaging portal for connecting, setting up lunch dates or exercise sessions

## Recent Changes
- 2026-02-14: Added Community tab with user matching, trajectory comparison charts, and messaging portal
- 2026-02-14: Converted from static frontend to full-stack Express + Vite app
- 2026-02-14: Added Replit Auth and PostgreSQL database with Drizzle ORM
- 2026-02-14: Fixed spreadsheet formatting: context-aware percent display, correct negative change handling, no trailing spacer rows
- 2026-02-14: Added SpreadsheetView component and spreadsheetParser utility for Excel-faithful data display
- 2026-02-14: Set up React + Vite project from single Claude artifact JSX file
- 2026-02-14: Broke 944-line monolithic JSX into 12 organized files
