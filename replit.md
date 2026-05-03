# Highest Wash Merchant App

## Overview
A merchant-facing web application for the Highest Wash laundry platform. Allows laundry merchants to accept orders, manage their business, track earnings, communicate with customers, and receive payouts globally. Packaged for Android and iOS via Capacitor.

## Tech Stack
- **Framework**: React 19 + TanStack Start (SSR-capable React framework)
- **Router**: TanStack Router (file-based routing)
- **Build Tool**: Vite 7 with `@lovable.dev/vite-tanstack-config` wrapper
- **Styling**: Tailwind CSS v4 + shadcn/ui component library
- **Backend**: Supabase (auth, database, realtime)
- **State**: TanStack Query
- **Mobile**: Capacitor (Android + iOS) — appId `com.highestwash.merchants`
- **Package Manager**: npm

## Project Structure
```
src/
  routes/          # File-based routes (TanStack Router)
  components/      # Shared UI components (AppHeader, BottomNav, etc.)
  lib/             # Core utilities (auth, supabase client, queries, locale, etc.)
  hooks/           # Custom React hooks
  assets/          # Static images
  styles.css       # Global styles
scripts/
  generate-index.mjs  # Post-build: creates dist/client/index.html from Vite manifest
android/           # Capacitor Android project
ios/               # Capacitor iOS project
capacitor.config.ts
public/
  icon-source.jpeg # Owl logo source (used for all icon sizes)
```

## Key Routes
- `/` — Landing/marketing page
- `/auth/login` — Merchant login
- `/auth/signup` — Merchant registration
- `/app` — Dashboard (protected)
- `/app/orders` — Order management
- `/app/earnings` — Earnings/wallet
- `/app/messages` — Chat with customers
- `/app/settings` — Business settings
- `/app/onboarding` — Merchant onboarding

## Supabase Configuration
- Project ref: `eqbogpvabcsngspphjte`
- Supabase URL and anon key are hardcoded in `src/lib/supabase.ts`
- Auth storage key: `hw-merchant-auth`

## Development
- Run: `npm run dev` (starts on port 5000, host 0.0.0.0)
- Workflow: "Start application" → `npm run dev` → port 5000 (webview)

## Deployment
- Type: Static site
- Build: `npm run build`
- Public dir: `dist/client`

## Capacitor / Mobile Build
- **App ID**: `com.highestwash.merchants`
- **App Name**: Highest Wash
- **webDir**: `dist/client` (Capacitor reads index.html + assets here)
- **Build for mobile**: `npm run build:cap` — runs `vite build`, generates `dist/client/index.html` via manifest, then `npx cap sync`
- **Open Android Studio**: `npm run cap:android`
- **Open Xcode**: `npm run cap:ios`
- **Sync only**: `npm run cap:sync`

### Icons
- Android: mipmap PNG icons at all densities in `android/app/src/main/res/mipmap-*/`
  - Adaptive icon background: white (`#FFFFFF`) via `android/app/src/main/res/values/colors.xml`
- iOS: all sizes in `ios/App/App/Assets.xcassets/AppIcon.appiconset/` with `Contents.json`

## Push Notifications (Web Push / VAPID — no Firebase needed)

### Architecture
- **Service worker**: `public/sw.js` — handles `push` events and `notificationclick`
- **Push utility**: `src/lib/push.ts` — registers SW, subscribes device, calls edge fn
- **Edge function**: `supabase/functions/send-push/index.ts` — VAPID signing + RFC 8291 encryption
- **DB table**: `push_subscriptions(id, merchant_id, endpoint, keys, user_agent)` — migration in `supabase/migrations/20260503000000_push_subscriptions.sql`

### VAPID Keys (already generated)
| Key | Value |
|---|---|
| Public (VITE_VAPID_PUBLIC_KEY) | `BHnAKnfcFbA1kMvjxAQTSTpYemv11cgNh6HjWWkrlzH8-VU1zbJIwqcUkKdqLu56bUCkmvct6oK45XiWl5ydhUM` |
| Private (raw, 32 bytes base64url) | `gAQWS8TXxK05Q7NNHRPY6usu1YmJ_CCbftTht_w5KPI` |
| Private (PKCS8 full) | `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggAQWS8TXxK05Q7NNHRPY6usu1YmJ_CCbftTht_w5KPKhRANCAAR5wCp33BWwNZDL48QEE0k6WHpr9dXIDYeh41lpK5cx_PlVNc2ySMKnFJCnai7uem1ApJr3LeqCuOV4lpecnYVD` |

The public key is set as `VITE_VAPID_PUBLIC_KEY` env var (done). The edge function reads `VAPID_PRIVATE_KEY` (PKCS8) and `VAPID_PUBLIC_KEY` from Supabase secrets.

### One-time Supabase setup required
1. **Run the migration**: `supabase/migrations/20260503000000_push_subscriptions.sql` in your Supabase SQL editor
2. **Add Supabase secrets** (Dashboard → Edge Functions → Secrets):
   - `VAPID_PUBLIC_KEY` = the public key above
   - `VAPID_PRIVATE_KEY` = the PKCS8 private key above
   - `VAPID_SUBJECT` = `mailto:admin@highestwash.com` (or your email)
3. **Deploy the edge function**: `supabase functions deploy send-push`

### How notifications work
| Situation | Notification |
|---|---|
| App open (foreground) | Sonner toast (already worked) |
| App backgrounded (tab hidden, JS still running) | Native OS notification via Service Worker |
| App closed entirely | True Web Push via `send-push` edge fn (needs server-side trigger) |

### Notification triggers (client-side, backgrounded)
- New incoming order via Supabase Realtime → `notifyLocal("New order incoming! 🧺")`
- Bid accepted via Supabase Realtime → `notifyLocal("🎉 You won the bid!")`

### Server-side trigger (call from other edge functions or DB webhooks)
```
POST /functions/v1/send-push
{ "merchant_id": "<uuid>", "title": "...", "body": "...", "url": "/app/", "tag": "..." }
```

## Backend Requirements
See `BACKEND_TODO.md` for pending Supabase backend changes needed:
- Chat/messages RLS policies
- Dispute table columns
- Order status events table
- Realtime subscriptions
- Edge functions for bid broadcasting and merchant subaccount registration
