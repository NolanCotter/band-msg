import {
  addMessage,
  broadcastTyping,
  channelExists,
  canAccessChannel,
  getMessagesByChannel,
  trackUser,
  getChannelName,
} from "@/lib/store";
import { sendPushNotifications } from "@/lib/push";
import { requireApprovedUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = requireApprovedUser(request);
  if (user instanceof NextResponse) {
    return user;
  }

  const channelId = request.nextUrl.searchParams.get("channelId");
  if (!channelId) {
    return NextResponse.json(
      { error: "channelId is required" },
      { status: 400 }
    );
  }

  if (!canAccessChannel(channelId, user.username, user.role)) {
    return NextResponse.json({ error: "access denied" }, { status: 403 });
  }

  return NextResponse.json(getMessagesByChannel(channelId));
}

export async function POST(request: NextRequest) {
  try {
    const user = requireApprovedUser(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const channelId = typeof body.channel_id === "string" ? body.channel_id : "";
    const replyToId = typeof body.reply_to_id === "string" ? body.reply_to_id : undefined;

    if (!content || !channelId) {
      return NextResponse.json(
        { error: "content and channel_id are required" },
        { status: 400 }
      );
    }

    if (!channelExists(channelId)) {
      return NextResponse.json(
        { error: "channel not found" },
        { status: 404 }
      );
    }

    if (!canAccessChannel(channelId, user.username, user.role)) {
      return NextResponse.json({ error: "access denied" }, { status: 403 });
    }

    const msg = addMessage(content, channelId, user.username, undefined, replyToId);
    trackUser(user.username);

    // Send push notifications in background (non-blocking)
    const chName = getChannelName(channelId) ?? channelId;
    sendPushNotifications(user.username, chName, content, channelId).catch(() => {});

    return NextResponse.json(msg, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages failed:", error);
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = requireApprovedUser(request);
  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const { channel_id } = body;

  if (!channel_id) {
    return NextResponse.json(
      { error: "channel_id is required" },
      { status: 400 }
    );
  }

  broadcastTyping(channel_id, user.username);
  return NextResponse.json({ ok: true });
}
