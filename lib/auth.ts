import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export const auth = {
  async getToken(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    return verifyToken(token);
  },
};

export async function verifyAdminToken(request: NextRequest) {
  try {
    // Development bypass for local testing
    if (process.env.NODE_ENV === "development" || process.env.SKIP_AUTH === "true") {
      console.log("🔓 Skipping auth (development mode or SKIP_AUTH=true)");
      return { 
        success: true, 
        payload: { 
          sub: 1, 
          email: "admin@yourrecipesite.com", 
          role: "admin" 
        } 
      };
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return { success: false, error: "No authorization header" };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { success: false, error: "No token provided" };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }

    return { success: true, payload };
  } catch (error) {
    return { success: false, error: "Token verification failed" };
  }
}
