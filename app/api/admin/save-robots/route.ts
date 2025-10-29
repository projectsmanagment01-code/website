import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import fs from "fs";
import path from "path";
import { checkAuthOrRespond } from "@/lib/auth-standard";

const ROBOTS_FILE_PATH = path.join(process.cwd(), "public", "robots.txt");

export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {

    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return errorResponseNoCache('Content must be a string', 400);
    }

    // Write content to robots.txt file
    fs.writeFileSync(ROBOTS_FILE_PATH, content, "utf8");

    return jsonResponseNoCache({
      success: true,
      message: "Robots.txt saved successfully",
    });
  } catch (error) {
    console.error("Error saving robots.txt:", error);
    return errorResponseNoCache('Failed to save robots.txt', 500);
  }
}
