# Embodied - Longevity Tracker

## Overview
A wellness/longevity tracking app built with React + Vite. Tracks yoga and movement biomarkers across sessions, displays progress charts, provides daily wellness suggestions, and supports Excel data upload.

## Project Architecture
- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS 4 with custom animations
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Upload**: xlsx (SheetJS)

### File Structure
```
src/
  components/
    Header.jsx           - App header with title and icon
    GrowingPlant.jsx     - Animated SVG plant visualization
    LongevityScoreHero.jsx - Hero section with score display
    Navigation.jsx       - Tab navigation (Dashboard, For You, Metrics, Upload)
    DashboardView.jsx    - Dashboard with charts, key metrics, and community match card
    SuggestionsView.jsx  - Daily suggestions (activities, meals, micro-practices)
    MetricsView.jsx      - Detailed metrics across all categories
    UploadView.jsx       - Excel file upload + spreadsheet display
    SpreadsheetView.jsx  - Table rendering of biomarker data matching Excel layout
    CommunityMatchCard.jsx - Match card with trajectory overlay chart
    MessagingPortal.jsx  - Chat interface with system messages and visual trajectory charts
  data/
    sessions.js          - Centralized session config (SESSION_LIST, FIRST/LAST_SESSION)
    defaultSessionData.js - Default biomarker data for 5 checkpoints (cp1-cp5)
    suggestions.js       - 3-day cadence suggestions (activities, meals, groceries)
    communityData.js     - Matched user profile, session data, and system messages
  utils/
    calculations.js      - Score calculations, progress tracking, Excel parsing
    spreadsheetParser.js - Excel parsing & default spreadsheet data builder
  App.jsx               - Main app component
  main.jsx              - Entry point
  index.css             - Tailwind + custom animations
```

## Configuration
- Vite dev server: 0.0.0.0:5000, all hosts allowed
- Deployment: Static site (dist/ directory)

## Design Decisions
- Session structure uses 5 checkpoints (cp1-cp5) with relative date labels: 14d, 12d, 7d, 3d, Today
- All session config centralized in sessions.js — adding/removing sessions only requires updating SESSION_LIST
- All components dynamically iterate SESSION_LIST for session buttons, chart data, spreadsheet columns

## Recent Changes
- 2026-02-14: Refactored from 3 sessions to 5 checkpoint sessions (cp1-cp5) with relative date labels and centralized config
- 2026-02-14: Added community matching feature with CommunityMatchCard (trajectory overlay), MessagingPortal (chat + visual-only charts), and preconfigured class/meal system messages
- 2026-02-14: Fixed spreadsheet formatting: context-aware percent display, correct negative change handling, no trailing spacer rows
- 2026-02-14: Added SpreadsheetView component and spreadsheetParser utility for Excel-faithful data display
- 2026-02-14: Set up React + Vite project from single Claude artifact JSX file
- 2026-02-14: Broke 944-line monolithic JSX into 12 organized files
