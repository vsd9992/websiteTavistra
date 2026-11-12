import { NextRequest, NextResponse } from "next/server";
import { revokeSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  await revokeSessionFromRequest(req, response);
  return response;
}

