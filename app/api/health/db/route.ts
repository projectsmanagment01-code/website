// app/api/health/db/route.ts - Detailed database health check
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const start = Date.now()
    
    // Test query to verify database connection
    await prisma.$queryRaw`SELECT 1 as result`
    
    const responseTime = Date.now() - start

    // Try to get database metrics if available
    let metrics = null
    try {
      // Note: $metrics is only available in Prisma 4.5+ with metrics preview feature
      // @ts-ignore - metrics may not be available
      if (prisma.$metrics && typeof prisma.$metrics.json === 'function') {
        // @ts-ignore
        metrics = await prisma.$metrics.json()
      }
    } catch (metricsError) {
      // Metrics not available, which is fine
      console.debug('Metrics not available:', metricsError)
    }

    // Get a simple count to verify table access
    const recipeCount = await prisma.recipe.count()

    return NextResponse.json({
      status: 'connected',
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        responseTimeMs: responseTime,
        recipeCount,
      },
      ...(metrics && { metrics }),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
