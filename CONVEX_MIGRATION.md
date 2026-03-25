# Convex Migration Status

Convex is in use, but the app is not fully migrated to it.

## Current Status

- Active app tree: `src/`
- Main backend for the active app surface: Neon/Postgres
- Convex: additional backend used for some auth and migration-related flows
- `svelte-src/`: leftover duplicate code, not the current app source of truth

## Practical Reading

Do not describe the current app as:

- fully migrated to Convex
- mainly a Convex app with a little legacy SQL
- rooted in `svelte-src/`
