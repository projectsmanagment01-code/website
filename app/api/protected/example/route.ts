import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";

// Example protected API route that accepts both JWT and API tokens
export const GET = withAuth(async (request: NextRequest, auth) => {
  try {
    // This endpoint is now protected by either JWT or API token authentication
    
    // You can check the auth type and respond accordingly
    const authInfo = {
      type: auth.type,
      user: auth.type === 'jwt' ? (auth.payload as any).username : (auth.payload as any).createdBy,
      timestamp: new Date().toISOString()
    };

    // Example: Get some protected data
    const protectedData = {
      message: "This is protected data accessible with API tokens or JWT",
      authInfo,
      data: {
        recipes: [
          { id: 1, title: "Secret Recipe 1", status: "draft" },
          { id: 2, title: "Secret Recipe 2", status: "published" }
        ],
        stats: {
          totalRecipes: 150,
          totalViews: 50000,
          totalAuthors: 5
        }
      }
    };

    return NextResponse.json(protectedData);
  } catch (error) {
    console.error("Error in protected API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Example POST endpoint that requires authentication
export const POST = withAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    
    // Process the request with authentication context
    const result = {
      message: "Data processed successfully",
      processedBy: auth.type === 'jwt' ? (auth.payload as any).username : (auth.payload as any).createdBy,
      authType: auth.type,
      receivedData: body,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
});