# GUESS THE 11 — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

This document provides complete instructions for deploying the **GUESS THE 11** gaming platform across Web, Backend, Database, Android, and iOS.

---

## 🏗️ Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Supabase PostgreSQL    │
                          │   (Auth, Profiles, RLS)   │
                          └─────────────▲─────────────┘
                                        │
           Database Sync / Audits       │ Service Role Key
                                        │
┌───────────────────────────┐     ┌─────┴─────────────────────┐
│  Vercel Frontend (Web)    │     │  Render Backend Service   │
│  React 18 + Canvas        │◄───►│  Node.js + Socket.IO      │
│  Capacitor Native (App)   │     │  Server-Authoritative     │
└───────────────────────────┘     └───────────────────────────┘
```

---

## 1. 🗄️ Supabase PostgreSQL Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/20261123_init_schema.sql`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/supabase/migrations/20261123_init_schema.sql).
4. Paste the entire SQL script and click **Run**.
   - Creates tables: `profiles`, `rooms`, `room_players`, `games`, `game_rounds`, `game_scores`, `game_events`, `game_chat`.
   - Configures foreign keys, unique slot indexes (1-11), and Row Level Security (RLS) policies.
   - Sets up the `on_auth_user_created` trigger for automated gamer profile creation.
5. In **Project Settings** > **API**:
   - Copy `Project URL` (e.g. `https://xyz.supabase.co`)
   - Copy `anon` public key (for Frontend)
   - Copy `service_role` secret key (for Backend ONLY — never disclose to frontend!)

---

## 2. 🚀 Backend Deployment (Render)

### Option A: Render Blueprint (Easiest)

1. Push your repository to GitHub.
2. Sign in to [render.com](https://render.com).
3. Click **New +** > **Blueprint**.
4. Connect your `Guess the 11` repository. Render detects [`server/render.yaml`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/server/render.yaml).
5. Add your environment variables:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key
   - `ADMIN_SECRET`: Choose a secure secret key for the admin dashboard
6. Click **Apply**.
7. Once deployed, verify the health check endpoint:
   ```
   GET https://your-backend.onrender.com/health
   ```
   Response:
   ```json
   {
     "status": "ok",
     "service": "Guess The 11 Backend",
     "version": "1.0.0"
   }
   ```

### Option B: Docker Container

Build and deploy via Docker using [`server/Dockerfile`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/server/Dockerfile):
```bash
docker build -f server/Dockerfile -t guess-the-11-server .
docker run -p 4000:4000 --env-file server/.env guess-the-11-server
```

---

## 3. 🌐 Frontend Web Deployment (Vercel)

1. Sign in to [vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `client`.
5. Framework Preset: **Vite**.
6. In **Environment Variables**, add:
   - `VITE_BACKEND_URL`: Your live Render backend URL (e.g. `https://your-backend.onrender.com`)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key
7. Click **Deploy**.
8. Vercel automatically deploys with HTTPS and SPA deep-link routing configured via [`client/vercel.json`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/client/vercel.json).

### URLs:
- **Public Website URL**: `https://<your-project>.vercel.app`
- **Public Room Join URL**: `https://<your-project>.vercel.app/join?room=<CODE>`

---

## 4. 📱 Android APK & AAB Packaging

1. Install Java JDK 17+ and Android SDK.
2. Build and sync client:
   ```bash
   npm run build:client
   cd client
   npx cap sync android
   ```
3. Run Gradle release commands:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   .\gradlew.bat bundleRelease
   ```
4. Sign the APK with `apksigner` and distribute via `release/android/GuessThe11.apk`.
5. Upload `release/android/GuessThe11.aab` to Google Play Console.
*(Detailed instructions available in [`release/android/README.md`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/release/android/README.md)).*

---

## 5. 🍏 iOS TestFlight & App Store Release

1. On macOS with Xcode:
   ```bash
   cd client
   npx cap sync ios
   npx cap open ios
   ```
2. Select target **App** > **Signing & Capabilities** > Select Apple Developer Team.
3. Select **Product** > **Archive** > **Distribute App** > **TestFlight & App Store**.
*(Detailed submission metadata and export options available in [`release/ios/README.md`](file:///c:/Users/thara/OneDrive/Desktop/Guess%20the%2011/release/ios/README.md)).*
