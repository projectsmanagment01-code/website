export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('Testing categories API...');
    
    // Test basic import
    const { getCategories } = await import("@/lib/category-service");
    console.log('Import successful');
    
    // Test function call
    const categories = await getCategories();
    console.log('Categories fetched:', categories.length);
    
    // Return simple response
    return NextResponse.json({ 
      success: true, 
      count: categories.length,
      categories: categories.slice(0, 2) // Just first 2 for testing
    });
  } catch (error) {
    console.error("Error in test API:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}