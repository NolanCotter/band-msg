# Optional Pusher Setup

Pusher is not the default architecture for the active `src` app.

This repo still contains Pusher dependencies and older integration notes. Use Pusher only if you are intentionally working on that path. Do not read this file as "the app now uses Pusher" across the board.

## When It Applies

Use this only if you are wiring up or maintaining a Pusher-based realtime feature.

## Env Vars

```bash
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=us2
```

## Vercel

If you are using the Pusher path, add those same variables in Vercel for the environments you need.

## Architecture Reminder

- `src/` is the active app tree
- Neon/Postgres is still the main data layer for the active app
- Convex is also present in the repo
- Pusher is optional, not the whole story
