# Band Chat App - Current Design Specification

## Overview
A Discord-style chat application with a black and white theme, featuring real-time messaging, user management, calendar events, and PWA capabilities.

## Color Scheme
- **Primary Background**: Black (#000000)
- **Secondary Background**: Dark Gray (#1a1a1a, #2a2a2a)
- **Text Primary**: White (#ffffff)
- **Text Secondary**: Light Gray (#a0a0a0, #888888)
- **Borders**: Dark Gray (#333333, #444444)
- **Accent**: White on black, black on white (high contrast)
- **Hover States**: Slightly lighter grays (#2a2a2a → #333333)

## Layout Structure

### Desktop Layout (3-Column)
```
┌─────────────┬──────────────────────┬─────────────┐
│   Channel   │    Message Area      │   Members   │
│   Sidebar   │                      │    List     │
│   (240px)   │      (flex-1)        │   (240px)   │
└─────────────┴──────────────────────┴─────────────┘
```

### Mobile Layout (Single Column + Drawers)
- Main view: Message Area (full width)
- Left drawer: Channel Sidebar (slides from left)
- Right drawer: Members List (slides from right)
- Drawers use `vaul-svelte` with no rounded corners

## Screen Specifications

### 1. Authentication Screen (`AuthScreen.svelte`)

**Layout**: Centered card on full-screen background

**Components**:
- App title: "Band Chat" (large, white text)
- Tab switcher: "Login" / "Register" (underline on active)
- Username input with animated wave effect on focus
- Password input with animated wave effect on focus
- Submit button (white text on black, inverts on hover)
- Google sign-in button (SocialButton component, gray theme)
- Loading spinner when authenticating

**Input Animation**:
- Wave effect on focus: border animates with flowing gradient
- Ring effect: subtle glow around focused input

### 2. Channel Sidebar (`ChannelSidebar.svelte`)

**Header**:
- Height: 60px
- Padding: Safe area inset top + 16px
- Background: Black
- Border: Bottom border (#333)
- Content: "Channels" title (white, bold)

**Channel List**:
- Each channel: Full width button
- Padding: 12px 16px
- Background: Transparent (hover: #2a2a2a, active: #333)
- Text: White (#fff for active, #a0a0a0 for inactive)
- Border radius: 8px
- Hash icon (#) prefix

**Mobile**:
- Drawer slides from left
- No rounded corners on drawer
- Full height with safe area insets

### 3. Message Area (`MessageArea.svelte`)

**Header**:
- Height: 60px
- Padding: Safe area inset top + 16px
- Background: Black
- Border: Bottom border (#333)
- Content:
  - Left: Menu button (mobile only) - hamburger icon
  - Center: Channel name with # prefix
  - Right: Notification bell, Admin button, Calendar button, Members button (mobile)

**Messages Container**:
- Background: #1a1a1a
- Padding: 16px
- Overflow: Auto scroll
- Height: calc(100vh - header - input - safe areas)

**Message Bubble** (`MessageBubble.svelte`):
- Avatar: 40px circle (Avatar component, no status indicator)
- Username: White, bold, 14px
- Timestamp: Gray (#888), 12px, next to username
- Message text: White, 14px, word-wrap
- Spacing: 12px between messages

**Input Area**:
- Height: 80px
- Padding: 16px + safe area inset bottom
- Background: Black
- Border: Top border (#333)
- Input: Custom Input component with focus animation
- Placeholder: "Type a message..."
- Send button: Arrow icon, white

**User Panel** (bottom of message area on desktop):
- Height: 60px
- Padding: 12px 16px + safe area inset bottom
- Background: #0a0a0a
- Border: Top border (#333)
- Content:
  - Avatar: 32px circle (no status)
  - Username: White, 14px
  - Logout button: Small, gray text

### 4. Members List (`UserList.svelte`)

**Header**:
- Height: 60px
- Padding: Safe area inset top + 16px
- Background: Black
- Border: Bottom border (#333)
- Content: "Members" title + count

**Member List**:
- Each member: Full width row
- Padding: 8px 16px
- Background: Transparent (hover: #2a2a2a)
- Avatar: 32px circle (no status indicator)
- Username: White, 14px
- Role badge: Small gray text (if admin)

**Mobile**:
- Drawer slides from right
- No rounded corners
- Full height with safe area insets

### 5. Admin Panel (`AdminPanel.svelte`)

**Layout**: Drawer from bottom (mobile) or modal (desktop)

**Header**:
- Title: "Admin Panel"
- Close button: X icon

**Content**:
- Pending users section
- Each user card:
  - Avatar: 40px circle
  - Username: White, bold
  - Email: Gray, smaller
  - Approve button: Green background
  - Reject button: Red background
- Empty state: "No pending users" (gray text)

### 6. Calendar (`Calendar.svelte`)

**Layout**: Drawer from bottom (mobile) or modal (desktop)

**Header**:
- Title: "Calendar"
- Close button: X icon

**Event Creation Form**:
- Title input: Full width, animated focus
- Date input: Date picker
- Time input: Time picker
- Create button: White on black

**Events List**:
- Each event card:
  - Title: White, bold
  - Date/Time: Gray, smaller
  - Background: #2a2a2a
  - Border radius: 8px
  - Padding: 12px
  - Margin: 8px 0

### 7. Notification Settings (`NotificationSettings.svelte`)

**Layout**: Drawer from bottom

**Header**:
- Title: "Notifications"
- Close button: X icon

**Content**:
- Toggle switch for push notifications
- Status text: "Enabled" / "Disabled" (gray)
- Permission status indicator
- Loading spinner when requesting permission

## Components

### Avatar Component (`Avatar.svelte`)
- Sizes: 32px, 40px, 48px (configurable)
- Border radius: 50% (circle)
- Background: Gradient or solid color
- Text: Initials if no image (white, centered)
- No status indicator (removed hardcoded online status)

### Spinner Component (`Spinner.svelte`)
- Sizes: w-3 (small), w-5 (medium), w-7 (large)
- Animation: 10 rotating bars with staggered delays
- Color: Black (#000)
- Position: Centered in container

### Input Component (`Input.svelte`)
- Border: 1px solid #333
- Background: Transparent
- Text: White
- Padding: 12px 16px
- Border radius: 8px
- Focus animation: Ring effect + wave border animation
- Placeholder: Gray (#888)

### SocialButton Component (`SocialButton.svelte`)
- Theme: Gray
- Border: 1px solid #333
- Background: Transparent (hover: #2a2a2a)
- Icon: Provider logo (Google, Facebook, Apple)
- Text: White
- Padding: 12px 24px
- Border radius: 8px

## Mobile Responsiveness

### Safe Area Insets (iOS)
- Top: `env(safe-area-inset-top)` - Applied to all headers
- Bottom: `env(safe-area-inset-bottom)` - Applied to input areas and user panel
- Prevents Dynamic Island and home indicator overlap

### Drawer Behavior
- Channels: Slide from left, no rounded corners
- Members: Slide from right, no rounded corners
- Admin/Calendar/Notifications: Slide from bottom
- Backdrop: Semi-transparent black overlay
- Close: Swipe down or tap backdrop

### Touch Optimization
- Body: `touch-action: pan-y` for smooth scrolling
- Buttons: Minimum 44px touch target
- No hover states on mobile (tap only)

## Typography
- Font family: System font stack (sans-serif)
- Headings: Bold, 18-24px
- Body: Regular, 14px
- Small text: 12px
- Line height: 1.5

## Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

## Animation Timing
- Transitions: 200ms ease-in-out
- Hover effects: 150ms
- Drawer open/close: 300ms
- Input focus: 200ms

## PWA Features
- Manifest: Black theme color
- Icons: 192px, 512px, maskable
- Offline page: Available
- Service worker: Registered
- Push notifications: Supported
- Install prompt: Available

## Current Issues to Address in Figma
1. Better visual hierarchy in message area
2. More distinctive active/inactive states
3. Improved spacing consistency
4. Better mobile drawer handles/indicators
5. Loading states for all async operations
6. Empty states for all lists
7. Error states and messaging
8. Accessibility improvements (focus indicators, ARIA labels)

## Figma Design Recommendations
When recreating in Figma:
1. Create frames for each screen (375px mobile, 1440px desktop)
2. Use auto-layout for responsive components
3. Create component variants for different states (default, hover, active, disabled)
4. Define color styles for the black/white theme
5. Define text styles for typography system
6. Create spacing tokens (4px, 8px, 12px, 16px, etc.)
7. Add interactive prototypes for drawer animations
8. Include all states: loading, empty, error, success
