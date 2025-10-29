import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';

const backupService = new BackupService();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const stats = await backupService.getBackupStats();
    
    return jsonResponseNoCache({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting backup stats:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get backup statistics'
      },
      { status: statusCode });
  }
}