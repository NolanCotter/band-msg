# Band Chat

Band Chat currently runs as a hybrid SvelteKit app.

## Current Architecture

- Active app tree: `src/`
- Duplicate legacy tree: `svelte-src/`
- Main persistence layer for the active app: Neon/Postgres
- Convex: used for some bridged auth and migration-era backend flows
- Pusher: optional or legacy integration, not the default architecture for the active `src` app

The short version is:

- build the app from `src/`
- treat Neon/Postgres as the main backend for the active app surface
- treat Convex as an additional backend, not the whole system
- do not read `svelte-src/` docs as the current source of truth

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set the env vars needed for the features you use:

- `DATABASE_URL`
- `AUTH_COOKIE_SECURE=true` in production
- `CONVEX_URL` and `PUBLIC_CONVEX_URL` if you are using Convex-backed flows
- `AUTH_BRIDGE_SECRET` for the SvelteKit-to-Convex auth bridge
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` if you are using web push

3. Start the app:

```bash
npm run dev
```

## Related Docs

- [CONVEX_MIGRATION.md](./CONVEX_MIGRATION.md)
- [PUSHER_SETUP.md](./PUSHER_SETUP.md)
- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
