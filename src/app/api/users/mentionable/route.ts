import { NextRequest, NextResponse } from "next/server";
import { requireApprovedUser } from "@/lib/auth";
import { getApprovedUsers } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = requireApprovedUser(request);
  if (user instanceof NextResponse) return user;

  const users = getApprovedUsers().map((u) => u.username).sort((a, b) => a.localeCompare(b));
  return NextResponse.json(users);
}
