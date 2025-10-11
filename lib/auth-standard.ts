/**
 * Standardized Authentication Helper
 * 
 * Single source of truth for authentication across the application.
 * Provides consistent auth checking and error handling.
 * Supports both JWT (admin dashboard) and API tokens (automation).
 * 
 * @module lib/auth-standard
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { verifyAuth as verifyHybridAuth } from "@/lib/api-auth";

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  payload?: {
    sub: number;
    email: string;
    role: string;
  };
  authType?: 'jwt' | 'api';
}

/**
 * Hybrid authentication result (JWT or API token)
 */
export interface HybridAuthResult {
  success: boolean;
  error?: string;
  authType?: 'jwt' | 'api';
  payload?: any;
}

/**
 * Standard authentication check for admin routes (JWT only)
 * 
 * @param request - NextRequest object
 * @returns AuthResult with success status and payload/error
 * 
 * @example
 * ```typescript
 * const authResult = await requireAuth(request);
 * if (!authResult.success) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * // Continue with authenticated logic
 * ```
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authResult = await verifyAdminToken(request);
    return authResult;
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed"
    };
  }
}

/**
 * Hybrid authentication check (supports both JWT and API tokens)
 * Use this for routes that should work with automation tools
 * 
 * @param request - NextRequest object
 * @returns HybridAuthResult with success status and payload/error
 * 
 * @example
 * ```typescript
 * const authResult = await requireHybridAuth(request);
 * if (!authResult.success) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * // authResult.authType tells you if it's 'jwt' or 'api'
 * ```
 */
export async function requireHybridAuth(request: NextRequest): Promise<HybridAuthResult> {
  try {
    const authResult = await verifyHybridAuth(request);
    
    if (!authResult) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    return {
      success: true,
      authType: authResult.type,
      payload: authResult.payload
    };
  } catch (error) {
    console.error("Hybrid authentication error:", error);
    return {
      success: false,
      error: "Authentication failed"
    };
  }
}

/**
 * Higher-order function wrapper for authenticated route handlers (JWT only)
 * 
 * Automatically handles authentication and returns 401 if unauthorized.
 * Use this for admin-only routes (dashboard, settings, etc.)
 * 
 * @param handler - Route handler function that receives request and auth payload
 * @returns Wrapped handler with automatic auth checking
 * 
 * @example
 * ```typescript
 * export const POST = withAuthHandler(async (request, auth) => {
 *   // auth.payload.email is available here
 *   const data = await request.json();
 *   // ... your logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withAuthHandler(
  handler: (request: NextRequest, auth: AuthResult["payload"]) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { 
          error: authResult.error || "Unauthorized",
          message: "Authentication required. Please log in."
        },
        { status: 401 }
      );
    }
    
    return handler(request, authResult.payload);
  };
}

/**
 * Higher-order function wrapper supporting both JWT and API tokens
 * 
 * Use this for routes that need to work with automation tools (recipe CRUD, etc.)
 * 
 * @param handler - Route handler function that receives request and hybrid auth result
 * @returns Wrapped handler with automatic hybrid auth checking
 * 
 * @example
 * ```typescript
 * export const POST = withHybridAuth(async (request, auth) => {
 *   // auth.authType is 'jwt' or 'api'
 *   // auth.payload contains user/token info
 *   const data = await request.json();
 *   // ... your logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withHybridAuth(
  handler: (request: NextRequest, auth: HybridAuthResult) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await requireHybridAuth(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { 
          error: authResult.error || "Unauthorized",
          message: "Authentication required. Use JWT token or API token."
        },
        { status: 401 }
      );
    }
    
    return handler(request, authResult);
  };
}

/**
 * Manual authentication check with conditional response
 * 
 * Use this when you need custom logic based on auth status,
 * or need to handle auth failures differently.
 * 
 * @param request - NextRequest object
 * @returns Object with authorized flag and either payload or error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authCheck = await checkAuthOrRespond(request);
 *   
 *   if (!authCheck.authorized) {
 *     return authCheck.response; // Returns 401 response
 *   }
 *   
 *   const userEmail = authCheck.payload.email;
 *   // ... your logic
 * }
 * ```
 */
export async function checkAuthOrRespond(
  request: NextRequest
): Promise<
  | { authorized: true; payload: NonNullable<AuthResult["payload"]> }
  | { authorized: false; response: NextResponse }
> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success || !authResult.payload) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: authResult.error || "Unauthorized",
          message: "Authentication required. Please log in."
        },
        { status: 401 }
      )
    };
  }
  
  return {
    authorized: true,
    payload: authResult.payload
  };
}

/**
 * Optional: Check if request has valid auth without returning response
 * Useful for conditional logic where auth is optional
 * 
 * @param request - NextRequest object
 * @returns boolean indicating if request is authenticated
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const isAuthenticated = await isAuthorized(request);
 *   
 *   // Show different data based on auth status
 *   if (isAuthenticated) {
 *     return NextResponse.json({ data: privateData });
 *   }
 *   return NextResponse.json({ data: publicData });
 * }
 * ```
 */
export async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authResult = await requireAuth(request);
  return authResult.success;
}

/**
 * Get authenticated user info from request
 * Returns null if not authenticated
 * 
 * @param request - NextRequest object
 * @returns User payload or null
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await getAuthenticatedUser(request);
 *   
 *   if (!user) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 *   
 *   console.log(`Request from ${user.email}`);
 * }
 * ```
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult["payload"] | null> {
  const authResult = await requireAuth(request);
  return authResult.success ? authResult.payload : null;
}

/**
 * Hybrid authentication check with conditional response
 * 
 * Like checkAuthOrRespond but supports BOTH JWT tokens and API tokens.
 * Use this for routes that need to work with automation tools like n8n.
 * 
 * @param request - NextRequest object
 * @returns Object with authorized flag and either payload or error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authCheck = await checkHybridAuthOrRespond(request);
 *   
 *   if (!authCheck.authorized) {
 *     return authCheck.response; // Returns 401 response
 *   }
 *   
 *   // authCheck.authType tells you if it's 'jwt' or 'api'
 *   // authCheck.payload contains user/token info
 *   // ... your logic
 * }
 * ```
 */
export async function checkHybridAuthOrRespond(
  request: NextRequest
): Promise<
  | { authorized: true; payload: any; authType: 'jwt' | 'api' }
  | { authorized: false; response: NextResponse }
> {
  const authResult = await requireHybridAuth(request);
  
  if (!authResult.success || !authResult.payload) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: authResult.error || "Unauthorized",
          message: "Authentication required. Use JWT token (Bearer) or API token (rtk_)."
        },
        { status: 401 }
      )
    };
  }
  
  return {
    authorized: true,
    payload: authResult.payload,
    authType: authResult.authType || 'jwt'
  };
}

// Export type for use in other files
export type AuthPayload = NonNullable<AuthResult["payload"]>;