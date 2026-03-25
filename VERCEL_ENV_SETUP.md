# Vercel Environment Setup

Set env vars based on the hybrid architecture that is actually running.

## Core

- `DATABASE_URL`
- `AUTH_COOKIE_SECURE=true`

## Convex-Backed Flows

- `CONVEX_URL`
- `PUBLIC_CONVEX_URL`
- `AUTH_BRIDGE_SECRET`
- `AUTH_PASSWORD_RESET_ENABLED`

## Web Push

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

## Optional Pusher Path

Only add Pusher vars if you are intentionally using that integration:

- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `VITE_PUSHER_KEY`
- `VITE_PUSHER_CLUSTER`

## Reminder

- deploy the `src/` app
- do not treat `svelte-src/` as the active app
