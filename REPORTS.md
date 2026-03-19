# Bug Reports

> **Generated:** $(date)
> **Source:** Convex Database

---

## Current Issues

### Critical (Breaks Functionality)

| # | Issue | Status | Location |
|---|-------|--------|----------|
| 1 | **Channel switching** | Fixed | ChannelSidebar.svelte, MessageArea.svelte |
| 2 | **Data not loading on first load** | Fixed | convexChannels.ts |
| 3 | **Thread panel on desktop** | Fixed | ThreadPanel.svelte |
| 4 | **Notifications not working** | Needs deploy | notificationStore.ts |

### Medium Priority

| # | Issue | Status | Location |
|---|-------|--------|----------|
| 5 | **@Mentions autocomplete** | Implemented | MessageArea.svelte |
| 6 | **@Mentions highlighting** | Implemented | MessageBubble.svelte |
| 7 | **!Report command** | Implemented | MessageArea.svelte |
| 8 | **Profile drawer** | Implemented | ProfileDrawer.svelte |
| 9 | **Web haptics** | Implemented | haptics.ts |

### Auth Screen Issues

| # | Issue | Status | Location |
|---|-------|--------|----------|
| 10 | **White input boxes** | Fixed | AuthScreen.svelte |
| 11 | **Button styling** | Fixed | AuthScreen.svelte |
| 12 | **Password reset message** | Fixed | ForgotPassword.svelte |

---

## Deployed Features

To enable these features, run:

```bash
npx convex deploy
```

### New Convex Functions (in convex/users.ts)

- `updateProfile` - Update username and bio
- `getUserProfile` - Get user profile
- `createReport` - Create bug report
- `getReports` - Admin: list all reports
- `resolveReport` - Admin: mark report as resolved

### New Schema Fields (in convex/schema.ts)

- `users.bio` - Optional bio string
- `users.location` - Optional location string (removed from UI)
- `reports` table - Store bug reports

---

## Quick Fixes Checklist

Run these commands in order:

```bash
# 1. Deploy Convex backend
npx convex deploy

# 2. Push to GitHub (triggers Vercel deploy)
git push origin main
```

---

## How to Test

1. Open the app after deployment
2. Check channel switching works on desktop
3. Check @mention autocomplete when typing @
4. Check !report command shows ephemeral message
5. Check profile drawer (click avatar icon)
6. Check notifications work

---

## Notes

- TypeScript errors about `api.users` will resolve after `npx convex deploy`
- The build requires CONVEX_URL which is set in Vercel environment
- Web haptics only work on mobile/touch devices
