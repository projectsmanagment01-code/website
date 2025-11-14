/**
 * API Route: Delete Pipeline Execution Logs
 * 
 * DELETE /api/admin/automation/pipeline/logs/delete
 * 
 * Deletes one or more execution logs by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { logIds } = body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { error: 'logIds array is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting ${logIds.length} execution log(s)...`);

    // Delete the logs
    const result = await prisma.pipelineExecutionLog.deleteMany({
      where: {
        id: {
          in: logIds
        }
      }
    });

    console.log(`✅ Deleted ${result.count} execution log(s)`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} execution log(s)`
    });
  } catch (error) {
    console.error('❌ Error deleting execution logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete execution logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
