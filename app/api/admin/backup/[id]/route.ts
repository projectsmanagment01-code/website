import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';
import { checkAuthOrRespond } from '@/lib/auth-standard';

const backupService = new BackupService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    console.log('🔄 Starting restore process for backup ID:', params.id);
    
    const body = await request.json();
    const {
      includeDatabase = true,
      includeFiles = true,
      includeConfiguration = true,
      cleanExisting = false,
      skipConflicts = true
    } = body;

    console.log('📋 Restore options:', {
      includeDatabase,
      includeFiles,
      includeConfiguration,
      cleanExisting,
      skipConflicts
    });

    const restoreOptions = {
      includeDatabase,
      includeFiles,
      includeConfiguration,
      cleanExisting,
      skipConflicts
    };

    const job = await backupService.restoreBackup(params.id, restoreOptions);

    console.log('✅ Restore job completed:', {
      status: job.status,
      progress: job.progress,
      message: job.message
    });

    return jsonResponseNoCache({
      success: true,
      data: job
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Restore process failed:', {
      error: errorMessage,
      code: error instanceof BackupError ? error.code : 'UNKNOWN',
      originalError: error instanceof BackupError ? error.originalError : null,
      stack: errorStack
    });
    
    const statusCode = error instanceof BackupError ? 
      (error.code === 'BACKUP_NOT_FOUND' ? 404 : 400) : 500;
    
    return jsonResponseNoCache({
        success: false,
        error: errorMessage,
        code: error instanceof BackupError ? error.code : 'RESTORE_FAILED',
        details: error instanceof BackupError && error.originalError ? 
          error.originalError.message : undefined
      },
      statusCode);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    console.log('🗑️ DELETE backup request for ID:', params.id);
    
    await backupService.deleteBackup(params.id);
    
    console.log('✅ Backup deleted successfully:', params.id);

    return jsonResponseNoCache({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting backup:', error);
    
    const statusCode = error instanceof BackupError ? 
      (error.code === 'BACKUP_NOT_FOUND' ? 404 : 
       error.code === 'FILE_NOT_FOUND' ? 404 : 400) : 500;
    
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete backup',
        code: error instanceof BackupError ? error.code : 'UNKNOWN_ERROR'
      },
      { status: statusCode });
  }
}