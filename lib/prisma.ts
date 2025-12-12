// lib/prisma.ts - Enhanced version with proper singleton pattern
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined 
};

// Create a single Prisma instance with connection pooling limits
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

// ALWAYS use singleton - both in dev and prod/build
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the instance globally to prevent multiple connections during build
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Connection test function
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
const cleanup = async () => {
  await prisma.$disconnect();
  console.log("🗄️ Database disconnected");
};

// Handle various shutdown signals
if (typeof process !== 'undefined') {
  process.on("beforeExit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

export default prisma;
