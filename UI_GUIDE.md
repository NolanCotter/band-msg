# Band Chat - Discord-Style UI Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Band Chat                                │
├──────────────┬──────────────────────────────────┬───────────────┤
│              │                                   │               │
│  CHANNELS    │         MESSAGE AREA              │  MEMBERS      │
│              │                                   │               │
│  # general   │  ┌─────────────────────────────┐ │  Online — 4   │
│  # practice  │  │ #general                     │ │  ● You        │
│  # setlist   │  │ Band chat                    │ │  ● Jules      │
│              │  └─────────────────────────────┘ │  ● Dex        │
│              │                                   │  ● Remy       │
│              │  Welcome to #general              │               │
│              │  Your band's space...             │  Idle — 1     │
│              │                                   │  ◐ Miko       │
│              │  ┌─────────────────────────────┐ │               │
│              │  │ Jules                        │ │  DND — 1      │
│              │  │ yo practice still on?        │ │  ⊖ Zo         │
│              │  │ 🔥 2                         │ │               │
│              │  └─────────────────────────────┘ │  Offline — 1  │
│              │                                   │  ○ Tara       │
│              │  ┌─────────────────────────────┐ │               │
│              │  │ You                          │ │               │
│              │  │ Sounds good!                 │ │               │
│              │  └─────────────────────────────┘ │               │
│              │                                   │               │
│              │  [Message the band...]      [>]  │               │
│              │                                   │               │
│              │  ┌─────────────────────────────┐ │               │
│              │  │ ● You                        │ │               │
│              │  │   admin                      │ │               │
│              │  └─────────────────────────────┘ │               │
└──────────────┴──────────────────────────────────┴───────────────┘
```

## Color Scheme

### Background Colors
- **Primary Background**: `#09090b` (darkest)
- **Secondary Background**: `#111113` (message area)
- **Tertiary Background**: `#0e0e10` (sidebars)

### Accent Colors
- **Primary Accent**: `#fb923c` (orange)
- **Secondary Accent**: `#f59e0b` (amber)
- **Gradient**: `from-orange-400 to-amber-600`

### Text Colors
- **Primary Text**: `white` / `#ffffff`
- **Secondary Text**: `white/80` (80% opacity)
- **Tertiary Text**: `white/40` (40% opacity)
- **Muted Text**: `white/20` (20% opacity)

### Status Colors
- **Online**: `#10b981` (emerald-500)
- **Idle**: `#f59e0b` (amber-500)
- **DND**: `#f43f5e` (rose-500)
- **Offline**: `white/20` (gray)

## Components

### 1. Authentication Screen

```
┌─────────────────────────────────────┐
│                                     │
│           [Music Icon]              │
│                                     │
│         Welcome back                │
│      Sign in to your band chat      │
│                                     │
│  Username: [________________]       │
│  Password: [________________]       │
│                                     │
│         [Sign in Button]            │
│                                     │
│    Need an account? Register        │
│                                     │
└─────────────────────────────────────┘
```

**Features**:
- Gradient music icon (orange to amber)
- Dark card with subtle border
- Toggle between login/register
- Error messages in red
- Loading state

### 2. Channel Sidebar (Left)

```
┌──────────────┐
│ Band Chat    │
├──────────────┤
│ TEXT CHANNELS│
│              │
│ # general    │ ← Active (highlighted)
│ # practice   │
│ # setlist    │
│              │
└──────────────┘
```

**Features**:
- Server name at top
- Channel list with # prefix
- Active channel highlighted
- Hover effects
- Scrollable list

### 3. Message Area (Center)

```
┌─────────────────────────────────┐
│ #general                        │
│ Band chat                       │
├─────────────────────────────────┤
│                                 │
│ Welcome to #general             │
│ Your band's space...            │
│ ─────────────────────────────── │
│                                 │
│ [Avatar] Jules      2:30 PM     │
│          yo practice still on?  │
│          🔥 2  🎸 1             │
│                                 │
│ [Avatar] You        2:31 PM     │
│          Sounds good!           │
│                                 │
│ Jules is typing...              │
│                                 │
├─────────────────────────────────┤
│ [Message the band...]      [>]  │
├─────────────────────────────────┤
│ ● You                           │
│   admin                         │
└─────────────────────────────────┘
```

**Features**:
- Channel header with name and description
- Welcome message
- Message bubbles with avatars
- Reactions below messages
- Typing indicators
- Input box with send button
- User info at bottom

### 4. Message Bubble

```
┌─────────────────────────────────┐
│ [Avatar] Jules      2:30 PM     │
│          yo practice still on?  │
│          🔥 2  🎸 1  [+]        │
└─────────────────────────────────┘
```

**Features**:
- Colored avatar (based on username hash)
- Username in color
- Timestamp
- Message content (supports markdown)
- Reactions with counts
- Add reaction button
- Delete button (own messages only)
- Grouped messages (same author within 5 min)

### 5. User List (Right)

```
┌───────────────┐
│ Band Members  │
├───────────────┤
│ ONLINE — 4    │
│               │
│ ● You         │
│   Band Leader │
│               │
│ ● Jules       │
│   Vocals      │
│               │
│ IDLE — 1      │
│               │
│ ◐ Miko        │
│   Drums       │
│               │
│ DND — 1       │
│               │
│ ⊖ Zo          │
│   Keys        │
│               │
│ OFFLINE — 1   │
│               │
│ ○ Tara        │
│   Manager     │
└───────────────┘
```

**Features**:
- Grouped by status
- Status indicator (colored dot)
- Avatar with first letter
- Username and role
- Hover effects
- Scrollable list
- Hidden on mobile

## Interactions

### Hover States
- **Channels**: Background lightens
- **Messages**: Show action buttons (react, delete)
- **Members**: Background lightens
- **Buttons**: Color intensifies

### Click Actions
- **Channel**: Switch to that channel
- **Message**: (Future: open context menu)
- **Reaction**: Toggle your reaction
- **Send Button**: Send message
- **User**: (Future: open profile)

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line (future)
- **Escape**: Close modals (future)

## Responsive Design

### Desktop (>768px)
```
[Channels] [Messages] [Members]
   240px      flex-1      224px
```

### Mobile (<768px)
```
[Messages]
  100%
```
- Channels: Hidden (future: drawer)
- Members: Hidden
- Full-width message area

## Animations

### Transitions
- **Component Mount**: Fade in + slide up (0.25s)
- **Message Appear**: Fade in + slide up (0.25s)
- **Hover**: Color change (0.2s)
- **Click**: Scale down (0.1s)

### Loading States
- **Messages**: Skeleton loader (future)
- **Auth**: Button shows "Loading..."
- **Typing**: Animated dots

## Typography

### Font Family
```css
font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
- **Headers**: 24px (bold)
- **Channel Names**: 15px (semibold)
- **Usernames**: 14px (semibold)
- **Messages**: 14.5px (regular)
- **Timestamps**: 11px (medium)
- **Labels**: 11-12px (uppercase, semibold)

### Font Weights
- **Bold**: 700
- **Semibold**: 600
- **Medium**: 500
- **Regular**: 400

## Spacing

### Padding
- **Container**: 16px (mobile), 20px (desktop)
- **Components**: 12-16px
- **Buttons**: 8-12px
- **Input**: 12-16px

### Gaps
- **Flex Gaps**: 8-12px
- **Message Spacing**: 4px (grouped), 16px (new author)
- **Section Spacing**: 16-24px

## Borders

### Border Radius
- **Cards**: 16-24px
- **Buttons**: 8-12px
- **Avatars**: 50% (circle)
- **Input**: 16px

### Border Colors
- **Default**: `white/4%` (very subtle)
- **Hover**: `white/8%`
- **Focus**: `orange-500/20%`

## Icons

### Icon Library
- Lucide React icons (converted to SVG)
- Size: 16-20px (UI), 24-32px (headers)
- Stroke width: 2px

### Common Icons
- **Music Note**: Server/channel icon
- **Hash**: Channel prefix
- **Users**: Member list toggle
- **Send**: Send message
- **Trash**: Delete message
- **Plus**: Add reaction

## Accessibility

### Focus States
- Visible focus rings (orange)
- Keyboard navigation support
- ARIA labels (future)

### Color Contrast
- Text on dark background: WCAG AA compliant
- Status indicators: Distinct colors

### Screen Readers
- Semantic HTML
- Alt text for images (future)
- ARIA labels (future)

## Best Practices

### Do's ✅
- Use consistent spacing
- Follow color scheme
- Add hover states
- Use smooth transitions
- Group related content
- Show loading states

### Don'ts ❌
- Don't use bright colors
- Don't overcrowd UI
- Don't hide important actions
- Don't use jarring animations
- Don't break responsive layout
- Don't ignore accessibility

## Future Enhancements

1. **Emoji Picker**: Floating picker with search
2. **GIF Picker**: Giphy integration
3. **Context Menus**: Right-click actions
4. **Modals**: Server settings, user profiles
5. **Notifications**: Toast messages
6. **Voice Channels**: WebRTC integration
7. **File Uploads**: Drag and drop
8. **Rich Embeds**: Link previews
9. **Threads**: Message threading
10. **Search**: Global search
