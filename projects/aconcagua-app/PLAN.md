# Aconcagua Training App — Project Plan

**Goal:** Build a health & training dashboard app that pulls Apple Watch data, visualizes it, and guides the user through a structured 6-month preparation program for Mt Aconcagua (Dec 2026), with exercise demos for every movement.

---

## Phase 1: Foundation & Discovery (1-2 sessions)

### 1.1 Tech Stack Decision
| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind + Recharts | SSR for SEO, React for UI, easy charting |
| **Backend/API** | Next.js API routes (Server Actions/Route Handlers) | Single codebase, no separate server to maintain |
| **Database** | PostgreSQL (via Supabase or local Docker) | Structured relational data for workouts, health metrics, user profiles |
| **Auth** | NextAuth.js or Clerk | Simple, secure |
| **Storage** | Cloudflare R2 or Supabase Storage | Exercise demo videos/graphics |
| **Mobile** | PWA (Progressive Web App) | Installable on iPhone home screen, no App Store gatekeeping |

### 1.2 Health Auto Export API Discovery
- Get API credentials from user's Health Auto Export subscription
- Understand available endpoints: heart rate, HRV, sleep, steps, workouts, blood oxygen, elevation gain, VO2 max
- Document data model and sync frequency (real-time? daily batch?)

### 1.3 Aconcagua Training Research
- Build periodized 6-month plan: Base → Build → Peak → Taper
- Key fitness markers for Aconcagua vs Kilimanjaro (higher altitude, longer days, heavier pack)
- Required capabilities beyond Kili fitness

---

## Phase 2: Core Infrastructure (1 session)

### 2.1 Project Scaffold
```
aconcagua-app/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, API clients
│   ├── db/                  # Schema, migrations (Drizzle ORM)
│   └── types/               # TypeScript types
├── public/
│   └── exercises/           # Demo videos & graphics
├── scripts/
│   └── seed-exercises.ts    # Exercise library initializer
├── docker-compose.yml       # Postgres + maybe Redis
└── README.md
```

### 2.2 Database Schema
- `users` — profile, experience level (Kili done), target date
- `health_metrics` — time-series data from Apple Watch (HR, HRV, sleep, steps, workouts)
- `exercises` — library with name, muscle groups, demo video URL, difficulty
- `workout_plans` — structured training blocks with weekly templates
- `scheduled_workouts` — daily assignments tied to calendar
- `workout_logs` — completed sessions, RPE, notes

### 2.3 Development Environment
- Docker Compose for local Postgres
- Environment variable template (.env.example)

---

## Phase 3: Health Data Pipeline (1 session)

### 3.1 API Client
- Build typed client for Health Auto Export API
- Handle auth (API key / OAuth)
- Rate limiting awareness

### 3.2 Data Sync Job
- Manual sync trigger first (user presses "Import")
- Later: cron job or webhook for periodic sync
- Store raw data + computed aggregates (7-day avg HR, trend direction)

### 3.3 Data Normalization
- Convert Apple Health units to display units
- Handle missing data gracefully
- Detect workout types (hiking, strength, cardio)

---

## Phase 4: Dashboard (1 session)

### 4.1 Metrics Overview Cards
- Current 7-day averages: resting HR, HRV, sleep hours, daily steps
- Trend arrows (↑↓→) vs previous week
- Training load / readiness score (custom algorithm)

### 4.2 Charts
- Heart rate trends (resting, walking average, workout average)
- Sleep stages over time
- Weekly activity rings-style visualization
- Elevation gain / hiking distance (key for mountaineering)

### 4.3 Mountaineering-Specific Panels
- Weekly hiking mileage with pack weight progression
- VO2 max tracking (if available from Watch)
- Altitude exposure log (optional manual entry)

---

## Phase 5: Workout Engine (2 sessions)

### 5.1 Exercise Library (40-60 exercises)
Categories:
| Category | Exercises | Media |
|----------|-----------|-------|
| **Leg Strength** | Squats, lunges, step-ups, calf raises, deadlifts | Video + graphic |
| **Core & Stability** | Planks, pallof press, bird dogs, hanging leg raises | Video + graphic |
| **Packing/Hiking** | Loaded step-ups, weighted walks, stair repeats | Video + graphic |
| **Cardio Base** | Zone 2 runs/cycles, incline treadmill, rowing | Video + graphic |
| **Recovery** | Foam rolling, stretching, yoga flows | Video + graphic |
| **Altitude Prep** | Breath holds, hypoxic training (if safe), CO2 tables | Graphic only |

### 5.2 6-Month Mesocycle Builder
```
Month 1-2: BASE (aerobic base, movement patterns, 2x/week strength)
Month 3-4: BUILD (increase load, pack weight, 3x/week strength, long hikes)
Month 5: PEAK (heavy pack training, back-to-back long days, altitude exposure)
Month 6: TAPER (reduce volume 40%, maintain intensity, travel prep)
```

### 5.3 Weekly Template Generator
- Configurable days available (e.g., Mon/Wed/Fri strength, Sat long hike)
- Auto-adjusts based on missed sessions
- Progression rules: +5-10% load weekly, pack weight +2kg every 2 weeks

### 5.4 Workout Detail View
- Exercise list with sets/reps/weight
- Embedded video player (or link to hosted video)
- Rest timer
- Check-off as completed
- Notes field ("knees felt good", "reduce weight next time")

---

## Phase 6: Polish & Deploy (1 session)

### 6.1 Mobile PWA
- `manifest.json` for home screen install
- Service worker for offline exercise library
- Touch-optimized UI

### 6.2 Testing
- Sync a real week's data from user's Health Auto Export
- Validate workout progression math
- Check video loading on mobile

### 6.3 Deployment
- Vercel (frontend + API)
- Supabase or Railway (Postgres)
- Cloudflare R2 (video storage)

### 6.4 Monitoring
- Simple health check endpoint
- Error logging

---

## What I Need From You Right Now

1. **Health Auto Export API access**
   - Do you have the API key/docs already?
   - What data fields does your subscription include?

2. **Training context**
   - How many days/week can you train? (be realistic)
   - What's your current fitness level vs your Kilimanjaro peak?
   - Any injuries or limitations?

3. **Exercise videos**
   - Preference: embedded YouTube links (free, fast) or custom uploads (controlled, branded)?
   - Or: AI-generated demo animations (slick, no copyright issues)?

4. **Hosting**
   - You got a Vercel/Supabase account, or want me to set it up?

---

## Estimated Build Time
- **7-10 sessions** at our current pace
- Could compress to 3-4 focused sessions if we batch phases

---

Ready to start Phase 1 when you are. What's the call? 🦊
