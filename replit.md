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
    DashboardView.jsx    - Dashboard with charts and key metrics
    SuggestionsView.jsx  - Daily suggestions (activities, meals, micro-practices)
    MetricsView.jsx      - Detailed metrics across all categories
    UploadView.jsx       - Excel file upload for tracking data
  data/
    defaultSessionData.js - Default biomarker data for sessions 1, 6, 12
    suggestions.js       - 3-day cadence suggestions (activities, meals, groceries)
  utils/
    calculations.js      - Score calculations, progress tracking, Excel parsing
  App.jsx               - Main app component
  main.jsx              - Entry point
  index.css             - Tailwind + custom animations
```

## Configuration
- Vite dev server: 0.0.0.0:5000, all hosts allowed
- Deployment: Static site (dist/ directory)

## Recent Changes
- 2026-02-14: Set up React + Vite project from single Claude artifact JSX file
- 2026-02-14: Broke 944-line monolithic JSX into 12 organized files
