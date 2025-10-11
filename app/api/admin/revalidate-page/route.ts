import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page } = body;

    if (!page) {
      return NextResponse.json({ error: "Page parameter required" }, { status: 400 });
    }

    // Map page names to their public routes
    const pageRoutes: { [key: string]: string } = {
      'privacy': '/privacy',
      'terms': '/terms',
      'about': '/about',
      'contact': '/contact',
      'faq': '/faq',
      'disclaimer': '/disclaimer',
      'cookies': '/cookies'
    };

    const route = pageRoutes[page];
    if (!route) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    // Revalidate the page
    revalidatePath(route);

    return NextResponse.json({ 
      success: true, 
      message: `Page ${page} revalidated successfully`,
      route: route
    });

  } catch (error) {
    console.error("Error revalidating page:", error);
    return NextResponse.json(
      { error: "Failed to revalidate page" },
      { status: 500 }
    );
  }
}