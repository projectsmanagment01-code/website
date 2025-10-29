import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body = await request.json();
    const { page } = body;

    if (!page) {
      return errorResponseNoCache('Page parameter required', 400);
    }

    // Map page names to their public routes
    const pageRoutes: { [key: string]: string | string[] } = {
      'privacy': '/privacy',
      'terms': '/terms',
      'about': '/about',
      'contact': '/contact',
      'faq': '/faq',
      'disclaimer': '/disclaimer',
      'cookies': '/cookies',
      'home': ['/', '/explore'],
      'recipes': ['/recipes', '/explore', '/search'],
      'categories': ['/categories', '/recipes', '/explore'],
      'authors': ['/authors', '/recipes'],
      'site': ['/', '/explore', '/recipes'],
      'social': ['/'],
      'all': ['/', '/recipes', '/explore', '/categories', '/authors', '/search', '/about', '/contact']
    };

    const routes = pageRoutes[page];
    if (!routes) {
      return errorResponseNoCache('Invalid page', 400);
    }

    // Revalidate the page(s)
    if (Array.isArray(routes)) {
      routes.forEach(route => revalidatePath(route));
    } else {
      revalidatePath(routes);
    }

    return jsonResponseNoCache({ 
      success: true, 
      message: `Page ${page} revalidated successfully`,
      routes: Array.isArray(routes) ? routes : [routes]
    });

  } catch (error) {
    console.error("Error revalidating page:", error);
    return errorResponseNoCache('Failed to revalidate page', 500);
  }
}