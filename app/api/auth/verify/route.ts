import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = await auth.getToken(request);

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      user: token,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
