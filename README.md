# CreatorFlow AI — YouTube Creator Automation SaaS

> A modern, production-oriented YouTube Creator Workspace and Automation SaaS designed for YouTubers, faceless channel operators, and digital marketing agencies.

---

## 1. Architectural Highlights

- **Framework**: Next.js 14 App Router, TypeScript, React 18
- **Design System**: Deep navy theme (`#070A12`), purple/blue neon accents (`#8B5CF6`, `#3B82F6`), Tailwind CSS, Lucide icons, responsive sidebar drawer navigation
- **Authentication**: Supabase Auth (Email/Password, Sessions, Profile Management) + Interactive Demo Sandbox Fallback
- **Database**: Supabase PostgreSQL with strict Row Level Security (RLS) policies and automated triggers
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`) with resilient heuristic generative engine fallback
- **YouTube Integration**: Official YouTube Data API v3 & YouTube Analytics API via secure server-side Google OAuth 2.0 (Resumable upload pipeline & token management)
- **Deployment**: Vercel & Supabase

---

## 2. Core Modules & Features

### 🚀 Overview Dashboard (`/dashboard`)
- Multi-channel summary KPIs: Active Channel, Total Videos, Scheduled Queue, Channel Views
- Quick Actions Hub (AI Studio, Upload Video, Content Calendar, Ideation)
- Live Video Publishing Workflow table with status tags, privacy badges, and direct YouTube links
- Channel health snapshot with OAuth token state monitoring

### 🧠 AI Metadata Studio (`/dashboard/metadata`)
- Parameter inputs: Video topic, transcript/outline, niche, audience, primary keyword, secondary keywords, tone, language
- Generates 5 viral title hooks with curiosity gaps
- SEO-friendly description with structured chapter timestamps and disclaimers
- 15-20 searchable YouTube tags and hashtag pills
- Pinned community comment suggestion
- Thumbnail text ideas (short, punchy hooks)
- **Explainable Metadata Quality Score (0-100)**: Transparent grading on Clarity, Relevance, Readability, and Keyword Coverage with auditing critique points
- Single-click copying and association with video projects

### 🖼️ Thumbnail Studio (`/dashboard/thumbnails`)
- Thumbnail concept generator with proven high-retention formulas (Split Screen Contrast, Urgency Badges, Extreme Curiosity)
- 16:9 Live YouTube recommendation feed simulator (tests thumbnail text and title visual hierarchy in context)
- Dynamic text overlay editor with color swatches
- Downloadable assets and video binding

### ☁️ Video Upload Manager (`/dashboard/uploads`)
- Chunked resumable video file ingestion pipeline
- Metadata binding: Title, description, tags, and thumbnail preview
- Privacy status selection (`public`, `unlisted`, `private`)
- Official YouTube scheduled release support (sets private with automated future release date)
- Real-time progress bar with transferred bytes tracker and state machine (`draft` -> `ready` -> `uploading` -> `processing` -> `scheduled`/`published`)
- Daily API quota safety auditing and upload job audit logs

### 📅 Content Calendar (`/dashboard/calendar`)
- Monthly & weekly calendar visualization
- Clear visual distinction between **Confirmed Scheduled on YouTube** vs **Local Planned Schedule** vs **Published Drops**
- Filters by connected channel and publishing status
- Modal drawer to inspect release parameters or schedule new video drops

### 📺 Channel Manager (`/dashboard/channels`)
- Multi-channel YouTube account linking via Google OAuth 2.0
- Channel switching: Instant workspace toggle between connected channels
- Live statistics: Subscribers, total views, published video count, and token status
- Server-side token encryption and user isolation via PostgreSQL RLS

### 📊 Analytics Dashboard (`/dashboard/analytics`)
- Authorized channel metrics: Total Views, Watch Time (hours), Average View Duration, Impressions, Impression CTR (%), and Subscribers Gained
- Filterable date ranges: Last 7 Days, Last 28 Days, Last 90 Days, Last 365 Days
- Daily Viewership Velocity bar visualization
- 7-Point Audience Retention Curve analyzer
- Top-Performing Videos ranked table with CTR, average duration, and age

### 💡 AI Content Assistant (`/dashboard/assistant`)
- Long-form concepts generator with structured script outlines
- 0-3 second viral hook generator with retention ratings
- Short-form video frameworks for YouTube Shorts & Reels
- Curated Saved Ideas Repository with status tracking

### 💳 Subscriptions & Usage Limits (`/dashboard/subscription`)
- 3 transparent plans: **Free Starter**, **Creator Pro**, **Agency Studio**
- Real-time monthly usage gauges: AI Metadata Generations, Connected Channels, and Upload Jobs
- Safe plan switcher for testing scale limits

---

## 3. Database Schema Blueprint

Located at `supabase/migrations/20261120000000_init_schema.sql`.

Key Tables:
- `profiles`: User accounts linked with `auth.users(id)`
- `connected_channels`: Channels linked through OAuth
- `videos`: Master video repository
- `video_metadata`: AI-generated metadata, scores, and chapters
- `upload_jobs`: Resumable upload audit log
- `thumbnail_assets`: Generated & uploaded image assets
- `content_ideas`: Saved creator topics and script outlines
- `analytics_snapshots`: Cached YouTube performance data
- `subscriptions` & `usage_records`: Plan tiers & monthly consumption meters

All tables enforce **Row Level Security (RLS)** ensuring users only access their own records.

---

## 4. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
# Next.js Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API
GEMINI_API_KEY=AIzaSy...

# Google Cloud OAuth (YouTube Data & Analytics API)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback

# Demo Sandbox Mode
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=true
```

---

## 5. Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build Production Bundle
```bash
npm run build
npm start
```

---

## 6. Security Guarantees

- **No Secret Leakage**: OAuth refresh tokens and API service keys are isolated to server-side Next.js route handlers.
- **Input Sanitization**: All incoming payloads are validated using strict Zod schemas.
- **Transparent AI Disclaimer**: AI Metadata Studio never guarantees algorithmic rankings or audience distribution.
