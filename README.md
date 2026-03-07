# EMBODIED: Your Longevity Operating System

> **"ONE score. ONE action. ONE partner. Your longevity, simplified."**

**[Live Demo](https://embodied-intelligence.replit.app/)** | **[GitHub Repository](https://github.com/lilySu/embodied)**

---

## 🌟 Overview
Women spend **$200–500/month** on wellness but are drowning in data with zero clarity. **EMBODIED** is a mission-driven "Longevity OS" designed to move women—specifically those navigating pre- and post-menopause—from data overwhelm to vitality-driven action.

We aggregate health data from Oura, Apple Health, lab results, and movement tracking into **ONE Longevity Score (0-100)** based on a tested, real-life framework for holistic wellness.

### The Problem
* **Data Fatigue:** Too many apps, too many metrics, zero direction.
* **Fitness Culture Mismatch:** High-intensity "CrossFit" styles don't serve the 45–55+ demographic.
* **Isolation:** Health journeys are harder to sustain alone.

### The Solution: The "3-Pillar" Model
1.  🎯 **STRAVA (Social Accountability):** Track your Longevity Score and celebrate progress.
2.  🤖 **AI COACHING (Personalized):** Our AI identifies your weakest pillar and gives you exactly **ONE** specific action.
3.  💕 **DATING APPS (Smart Matching):** Accountability partners matched by **commitment level**, not just age or fitness.

---

## ✨ Key Features

### 🪴 Delightful Dashboard
* **Progress over Perfection:** Framed with warmth and encouragement.
* **Visual Growth:** A digital plant blooms on your dashboard as you meet your movement goals.
* **Encouraging Insights:** Clinical data is translated into "warm friend" feedback (e.g., *"Your plank held strong—like a steady oak! 🌳"*).

### 🧬 Longevity Pillars
We focus on sustainable lifestyle markers rather than agility or brute strength:
* **Mobility & Stability:** Focus on hip health and balance.
* **Functional Strength:** Grip strength and core resilience (plank holds).
* **Subjective Wellbeing:** Tracking energy levels and "Body Intelligence."

### 🥗 Holistic Micro-Suggestions
* **Daily Action:** ONE bite-sized habit based on your weakest biomarker.
* **Nourishment:** Targeted suggestions like *Harvest Bowls* or *Purple Potatoes* (rich in anthocyanins for brain health).
* **Community Meetups:** Local, low-impact suggestions like Jazzercise or gentle yoga flows.

---

## 🤖 The AI Engine
* **Score Calculation:** Multi-source analysis weighted by longevity research.
* **Personalized Rx:** Identifies your weakest longevity pillar $\rightarrow$ suggests ONE action $\rightarrow$ adapts as you improve.
* **Matching Algorithm:** Optimizes for completion rates by matching users with similar commitment profiles and progress trajectories.

---

## 🛠 Tech Stack
* **Frontend:** React 19 + Vite 7
* **Styling:** Tailwind CSS 4 (Theme: Soft sages, terracottas, and warm peaches)
* **Charts:** Recharts (Interactive progress and trajectory overlay)
* **Data Processing:** SheetJS (xlsx) for biomarker spreadsheet integration
* **Deployment:** Replit Core
* **Environment:** Node.js 20

---

## 🔗 Oura Integration (Local POC)

This repo now includes a lightweight local backend for Oura OAuth + data sync:

- Backend entry: `server/index.js`
- Frontend card: Dashboard -> **Oura Integration**

### 1. Set env vars (backend shell)

```bash
export OURA_CLIENT_ID=\"your_oura_client_id\"
export OURA_CLIENT_SECRET=\"your_oura_client_secret\"
export FRONTEND_URL=\"http://localhost:5000\"
export OURA_REDIRECT_URI=\"http://localhost:8080/auth/oura/callback\"
```

Optional (defaults to `personal daily`):

```bash
export OURA_SCOPES=\"personal daily\"
```

### 2. Run frontend + backend

```bash
npm run dev:server   # backend on :8080
npm run dev          # frontend on :5000
```

Or in one shell:

```bash
npm run dev:all
```

### 3. Configure frontend API base URL

Set `VITE_API_BASE_URL` if your backend is not `http://localhost:8080`.

```bash
export VITE_API_BASE_URL=\"http://localhost:8080\"
```

### Notes

- Current token storage is in-memory (single-user dev mode).
- Refreshing/restarting backend clears tokens.
- This is a POC; production should persist tokens in a database + encrypted secret store.

### Mock mode (no Oura credentials required)

Use mock data to validate the full frontend flow locally:

```bash
export OURA_MOCK=\"1\"
export FRONTEND_URL=\"http://localhost:5000\"
export VITE_API_BASE_URL=\"http://localhost:8080\"
```

Then run:

```bash
npm run dev:server
npm run dev
```

Open the app, go to Dashboard, click **Connect Oura**. In mock mode, it immediately connects and returns sample readiness/sleep/activity data.

---

## 📈 Traction & Roadmap
* **Validation:** 25 clients ready to pay **$30–50/month**.
* **Ecosystem:** Part of **PROTOKOL**, a wellness company bringing ancient wisdom to modern biomarker science.
* **Vision:** * **Today:** Hackathon MVP. 
    * **Tomorrow:** The go-to guide for menopause. 
    * **Next Year:** The global longevity standard for women.

---

## 👥 Team Embodied
* **Submitter:** Karina Moonsun Kim ([jaskim39@gmail.com](mailto:jaskim39@gmail.com))
* **Lead Developer:** Lily Su ([lilyxsu@gmail.com](mailto:lilyxsu@gmail.com))

---
*Embodied: Your longevity journey, one gentle practice at a time.*
