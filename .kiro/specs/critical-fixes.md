# Critical Bug Fixes

## Status: In Progress

## Issues to Fix

### 1. ✅ Reaction Picker - Single Click (DONE)
- **Issue**: Reaction picker requires long press
- **Expected**: Single tap should show reaction picker
- **Solution**: Modified handleTouchEnd to show picker on single tap
- **Files**: MessageBubble.svelte

### 2. ✅ Thread Reply - Long Press (DONE)
- **Issue**: Thread reply is a button
- **Expected**: Long press on message should open thread
- **Solution**: Modified handleTouchStart to open thread on 500ms long press
- **Files**: MessageBubble.svelte

### 3. ⏳ Channel Creation - Admin Requirement (IN PROGRESS)
- **Issue**: Still getting "Admin access required" even for admins
- **Root Cause**: createChannel in db.ts was using requireAdmin
- **Solution**: Changed to getUserBySession, added console.log
- **Files**: svelte-src/lib/server/db.ts
- **Next**: Test and verify console logs show proper user info

### 4. ⏳ Calendar Event Deletion Error
- **Issue**: Error when trying to delete calendar events
- **Files to Check**: Calendar.svelte, convex/events.ts
- **Next**: Find and fix the deletion mutation

### 5. ⏳ Messages Not Showing on First Login
- **Issue**: Messages don't load when user first logs in
- **Possible Causes**:
  - Session token not set before loading messages
  - Channel not selected
  - Convex subscription not initialized
- **Files to Check**: +page.svelte, convexMessages.ts
- **Next**: Add console.log to track message loading flow

### 6. ⏳ Forgot Password Functionality
- **Issue**: No forgot password option
- **Solution**: Add password reset flow
- **Files to Create/Modify**:
  - AuthScreen.svelte (add forgot password link)
  - New ForgotPassword.svelte component
  - API endpoint for password reset
  - Email sending functionality
- **Next**: Design password reset flow

### 7. ⏳ Google Sign-In Broken
- **Issue**: Google OAuth not working
- **Files to Check**:
  - svelte-src/routes/api/auth/google/+server.ts
  - svelte-src/routes/api/auth/google/callback/+server.ts
  - Environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- **Next**: Check OAuth configuration and callback URL

### 8. ⏳ Notifications Not Working
- **Issue**: Push notifications not functioning
- **Possible Causes**:
  - VAPID keys not configured
  - Service worker not registered
  - Permission not granted
  - Firebase configuration issue
- **Files to Check**:
  - NotificationSettings.svelte
  - public/firebase-messaging-sw.js
  - Environment variables
- **Next**: Check VAPID keys and Firebase setup

## Priority Order
1. Channel Creation (blocking core functionality)
2. Messages Not Showing (blocking core functionality)
3. Calendar Event Deletion (user reported)
4. Google Sign-In (authentication issue)
5. Notifications (feature not working)
6. Forgot Password (missing feature)

## Testing Checklist
- [ ] Channel creation works for all authenticated users
- [ ] Console logs show proper user authentication
- [ ] Messages load on first login
- [ ] Calendar events can be deleted
- [ ] Google sign-in completes successfully
- [ ] Notifications can be enabled and received
- [ ] Forgot password flow works end-to-end
- [ ] Reaction picker shows on single tap
- [ ] Thread opens on long press
