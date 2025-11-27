// app/api/health/route.ts - Health check endpoint
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    },
  }

  try {
    // Check database connection with timeout
    const dbCheckPromise = prisma.$queryRaw`SELECT 1`
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database check timeout')), 5000)
    )
    
    await Promise.race([dbCheckPromise, timeoutPromise])
    checks.checks.database = 'connected'
  } catch (error) {
    console.error('Health check database error:', error)
    checks.status = 'unhealthy'
    checks.checks.database = 'disconnected'
    
    return NextResponse.json(checks, { status: 503 })
  }

  return NextResponse.json(checks)
}
