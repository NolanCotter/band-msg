import { NextRequest, NextResponse } from "next/server";
import { requireApprovedUser } from "@/lib/auth";
import { canAccessChannel, getApprovedUsers } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = requireApprovedUser(request);
  if (user instanceof NextResponse) return user;

  const channelId = request.nextUrl.searchParams.get("channelId")?.trim() ?? "";

  const users = getApprovedUsers()
    .filter((u) => {
      if (!channelId) return true;
      return canAccessChannel(channelId, u.username, u.role);
    })
    .map((u) => u.username)
    .sort((a, b) => a.localeCompare(b));

  return NextResponse.json(users);
}
