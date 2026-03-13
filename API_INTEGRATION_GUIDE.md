# Band Chat - API Integration Guide

## Overview

Band Chat is a Discord-like chat platform built with SvelteKit. This document provides complete API endpoint documentation, database schema, and authentication details for integration.

---

## Authentication

### Method: Cookie-Based Sessions + Optional Bearer Token

**Session Management:**
- Sessions are stored in HTTP-only cookies named `band_chat_session`
- Session TTL: 24 hours
- CSRF protection enabled for all mutations (POST, PUT, PATCH, DELETE)
- CSRF token stored in `band_chat_csrf` cookie

**Authentication Flow:**

1. **Register** → Get user object
2. **Login** → Get session token + user object (cookie set automatically)
3. **Use session token** in subsequent requests (via cookie or Bearer header)

**Bearer Token Support:**
- Alternative to cookies: `Authorization: Bearer <sessionToken>`
- Useful for mobile apps or API clients
- Session token returned in login response

**CSRF Protection:**
- Required for all API mutations (except `/api/auth/login` and `/api/auth/register`)
- Header: `X-CSRF-Token: <token>`
- Token obtained from `band_chat_csrf` cookie

---

## Base URL

```
https://band-msg.vercel.app/api
```

Or for local development:
```
http://localhost:5173/api
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/auth/register`
Register a new user account.

**Request:**
```json
{
  "username": "string (3-20 chars, lowercase alphanumeric + dash/underscore)",
  "password": "string (12-128 chars, strong password required)"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "username": "string",
  "role": "admin|member",
  "status": "approved|pending"
}
```

**Rate Limit:** 8 attempts per 10 minutes per IP + username

**Notes:**
- First user is automatically promoted to admin
- Subsequent users are pending approval by admin
- Password must be 12+ characters

---

#### POST `/auth/login`
Authenticate user and create session.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "string",
  "role": "admin|member",
  "status": "approved|pending",
  "sessionToken": "string"
}
```

**Rate Limits:**
- 30 attempts per 10 minutes per IP
- 10 attempts per 10 minutes per username

**Notes:**
- Session cookie set automatically
- Returns sessionToken for Bearer auth
- Pending users cannot login unless they're the first admin

---

#### GET `/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <sessionToken>
```
OR uses session cookie automatically

**Response (200):**
```json
{
  "id": "uuid",
  "username": "string",
  "role": "admin|member",
  "status": "approved|pending"
}
```

**Response (401):** Unauthorized

---

#### POST `/auth/logout`
Invalidate current session.

**Response (200):**
```json
{ "ok": true }
```

---

### Channel Endpoints

#### GET `/channels`
List all channels.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string"
  }
]
```

---

#### POST `/channels`
Create a new channel (admin only).

**Request:**
```json
{
  "name": "string (2-32 chars, lowercase alphanumeric + dash)",
  "description": "string (max 300 chars)"
}
```

**Response (201):**
```json
{
  "id": "uuid"
}
```

**Rate Limit:** 5 per hour per admin

---

#### DELETE `/channels`
Delete a channel (admin only).

**Request:**
```json
{
  "channelId": "uuid"
}
```

**Response (200):**
```json
{ "deleted": true }
```

---

### Message Endpoints

#### GET `/messages?channelId=<uuid>`
List messages in a channel (max 200 most recent).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "content": "string",
    "channelId": "uuid",
    "createdAt": 1234567890,
    "author": "username"
  }
]
```

---

#### POST `/messages`
Send a message to a channel.

**Request:**
```json
{
  "channelId": "uuid",
  "content": "string (1-4000 chars)"
}
```

**Response (201):**
```json
{
  "id": "uuid"
}
```

---

#### DELETE `/messages`
Delete a message (own messages or admin).

**Request:**
```json
{
  "messageId": "uuid"
}
```

**Response (200):**
```json
{ "deleted": true }
```

---

### Reaction Endpoints

#### GET `/reactions?messageId=<uuid>`
Get reactions on a message.

**Query Params:**
- `messageId` - Single message ID
- `messageIds` - Comma-separated list for batch loading

**Response (200):**
```json
[
  {
    "id": "uuid",
    "messageId": "uuid",
    "userId": "uuid",
    "emoji": "👍",
    "createdAt": 1234567890
  }
]
```

---

#### POST `/reactions`
Add or remove a reaction.

**Request:**
```json
{
  "messageId": "uuid",
  "emoji": "👍",
  "action": "add|remove"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "messageId": "uuid",
  "emoji": "👍"
}
```

---

### Typing Indicator Endpoints

#### GET `/typing?channelId=<uuid>`
Get users currently typing in a channel.

**Response (200):**
```json
[
  {
    "userId": "uuid",
    "username": "string",
    "startedAt": 1234567890
  }
]
```

---

#### POST `/typing`
Start or stop typing indicator.

**Request:**
```json
{
  "channelId": "uuid",
  "action": "start|stop"
}
```

**Response (200):**
```json
{ "ok": true }
```

---

### Presence Endpoints

#### POST `/presence`
Update user presence status.

**Request:**
```json
{
  "status": "online|idle|dnd|offline",
  "customStatus": "string (optional)"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "string",
  "presenceStatus": "online|idle|dnd|offline",
  "customStatus": "string"
}
```

---

### Server Endpoints

#### GET `/servers`
List all servers the user is a member of.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "ownerId": "uuid",
    "createdAt": 1234567890
  }
]
```

---

### Server Members Endpoints

#### GET `/members?serverId=<uuid>`
List members of a server.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "string",
    "serverId": "uuid",
    "roleId": "uuid|null",
    "nickname": "string|null",
    "joinedAt": 1234567890
  }
]
```

---

### Invite Endpoints

#### POST `/invites`
Create or use an invite code.

**Request (Create):**
```json
{
  "serverId": "uuid",
  "maxUses": 0,
  "expiresInMs": 604800000
}
```

**Request (Use):**
```json
{
  "action": "use",
  "code": "string"
}
```

**Response (200):**
```json
{
  "code": "string",
  "serverId": "uuid",
  "createdBy": "uuid",
  "maxUses": 0,
  "currentUses": 0,
  "expiresAt": 1234567890
}
```

---

### Event Endpoints

#### GET `/events?serverId=<uuid>`
List calendar events.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "serverId": "uuid",
    "title": "string",
    "description": "string",
    "location": "string",
    "startsAt": 1234567890,
    "endsAt": 1234567890,
    "createdBy": "uuid",
    "createdAt": 1234567890
  }
]
```

---

#### POST `/events`
Create event or respond to event.

**Request (Create):**
```json
{
  "serverId": "uuid",
  "channelId": "uuid (optional)",
  "title": "string",
  "description": "string (optional)",
  "location": "string (optional)",
  "startsAt": 1234567890,
  "endsAt": 1234567890
}
```

**Request (Respond):**
```json
{
  "action": "respond",
  "eventId": "uuid",
  "status": "attending|maybe|declined|pending"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "status": "attending|maybe|declined|pending"
}
```

---

### Admin Endpoints

#### GET `/admin/users`
List pending user approvals (admin only).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "username": "string",
    "role": "admin|member",
    "status": "pending",
    "createdAt": 1234567890
  }
]
```

---

#### POST `/admin/users/approve`
Approve a pending user (admin only).

**Request:**
```json
{
  "username": "string"
}
```

**Response (200):**
```json
{ "ok": true }
```

---

#### POST `/admin/users/promote`
Promote user to admin (admin only).

**Request:**
```json
{
  "username": "string"
}
```

**Response (200):**
```json
{ "ok": true }
```

---

#### POST `/admin/users/demote`
Demote admin to member (admin only).

**Request:**
```json
{
  "username": "string"
}
```

**Response (200):**
```json
{ "ok": true }
```

---

#### POST `/admin/users/reject`
Reject a pending user (admin only).

**Request:**
```json
{
  "username": "string"
}
```

**Response (200):**
```json
{ "ok": true }
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending')),
  avatar_url TEXT,
  presence_status TEXT DEFAULT 'offline' CHECK (presence_status IN ('online', 'idle', 'dnd', 'offline')),
  custom_status TEXT,
  last_seen_at BIGINT,
  created_at BIGINT NOT NULL
)
```

### Sessions Table
```sql
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
)
```

### Servers Table
```sql
CREATE TABLE servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at BIGINT NOT NULL
)
```

### Server Members Table
```sql
CREATE TABLE server_members (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT,
  nickname TEXT,
  joined_at BIGINT NOT NULL,
  UNIQUE(server_id, user_id)
)
```

### Channels Table
```sql
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  channel_type TEXT DEFAULT 'text' CHECK (channel_type IN ('text', 'voice', 'private', 'announcement')),
  category TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at BIGINT NOT NULL
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at BIGINT,
  reply_to_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL
)
```

### Message Reactions Table
```sql
CREATE TABLE message_reactions (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  UNIQUE(message_id, user_id, emoji)
)
```

### Typing Indicators Table
```sql
CREATE TABLE typing_indicators (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at BIGINT NOT NULL,
  UNIQUE(channel_id, user_id)
)
```

### Invites Table
```sql
CREATE TABLE invites (
  code TEXT PRIMARY KEY,
  server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  max_uses INTEGER DEFAULT 0,
  current_uses INTEGER DEFAULT 0,
  expires_at BIGINT,
  created_at BIGINT NOT NULL
)
```

### Calendar Events Table
```sql
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at BIGINT NOT NULL,
  ends_at BIGINT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at BIGINT NOT NULL
)
```

### Event Attendees Table
```sql
CREATE TABLE event_attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('attending', 'maybe', 'declined', 'pending')),
  created_at BIGINT NOT NULL,
  UNIQUE(event_id, user_id)
)
```

### Rate Limits Table
```sql
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at BIGINT NOT NULL
)
```

---

## Security Features

- **CSRF Protection:** All mutations require X-CSRF-Token header
- **Rate Limiting:** Login (30/IP, 10/user per 10min), Register (8/IP+user per 10min)
- **Password Hashing:** PBKDF2 with 210,000 iterations
- **Session Expiration:** 24 hours
- **SQL Injection Prevention:** Parameterized queries
- **XSS Prevention:** HTML escaping
- **Content Security Policy:** Strict headers

---

## Error Responses

All errors follow this format:

```json
{
  "error": "string description"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid session)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate username, etc.)
- `429` - Too Many Requests (rate limited)
- `500` - Server Error

---

## Example Integration Flow

### 1. Register
```bash
curl -X POST https://band-msg.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePassword123"}'
```

### 2. Login
```bash
curl -X POST https://band-msg.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePassword123"}'
```

### 3. Get Current User
```bash
curl -X GET https://band-msg.vercel.app/api/auth/me \
  -H "Authorization: Bearer <sessionToken>"
```

### 4. List Channels
```bash
curl -X GET https://band-msg.vercel.app/api/channels \
  -H "Authorization: Bearer <sessionToken>"
```

### 5. Send Message
```bash
curl -X POST https://band-msg.vercel.app/api/messages \
  -H "Authorization: Bearer <sessionToken>" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrfToken>" \
  -d '{"channelId":"<uuid>","content":"Hello world"}'
```

---

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
AUTH_COOKIE_SECURE=auto  # Set to 'true' in production
AUTH_COOKIE_SAME_SITE=lax
NODE_ENV=production
```

---

## Deployment

**Recommended:** Vercel (already configured)

**Other Platforms:** Node.js 18+ with PostgreSQL 14+

---

## Support

For issues or questions, refer to:
- `README.md` - Project overview
- `FEATURES.md` - Feature documentation
- `SECURITY_ENHANCEMENTS.md` - Security details
