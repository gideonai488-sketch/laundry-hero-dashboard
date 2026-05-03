# Highest Wash Merchant App

## Overview
A merchant-facing web application for the Highest Wash laundry platform. Allows laundry merchants to accept orders, manage their business, track earnings, communicate with customers, and receive payouts globally.

## Tech Stack
- **Framework**: React 19 + TanStack Start (SSR-capable React framework)
- **Router**: TanStack Router (file-based routing)
- **Build Tool**: Vite 7 with `@lovable.dev/vite-tanstack-config` wrapper
- **Styling**: Tailwind CSS v4 + shadcn/ui component library
- **Backend**: Supabase (auth, database, realtime)
- **State**: TanStack Query
- **Package Manager**: npm (lockfile present; bun also configured)

## Project Structure
```
src/
  routes/          # File-based routes (TanStack Router)
  components/      # Shared UI components (AppHeader, BottomNav, etc.)
  lib/             # Core utilities (auth, supabase client, queries, etc.)
  hooks/           # Custom React hooks
  assets/          # Static images
  styles.css       # Global styles
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

## Backend Requirements
See `BACKEND_TODO.md` for pending Supabase backend changes needed:
- Chat/messages RLS policies
- Dispute table columns
- Order status events table
- Realtime subscriptions
- Edge functions for bid broadcasting and merchant subaccount registration
