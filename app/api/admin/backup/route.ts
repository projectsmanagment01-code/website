import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';
import { checkAuthOrRespond } from '@/lib/auth-standard';

const backupService = new BackupService();

export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const backups = await backupService.listBackups();
    
    return jsonResponseNoCache({
      success: true,
      data: backups
    });

  } catch (error) {
    console.error('Error listing backups:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list backups'
      },
      { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      includeDatabase = true,
      includeFiles = true,
      includeConfiguration = true,
      type = 'full'
    } = body;

    if (!name || typeof name !== 'string') {
      return jsonResponseNoCache({
          success: false,
          error: 'Backup name is required'
        },
        { status: 400 });
    }

    const job = await backupService.createBackup(name, description, {
      includeDatabase,
      includeFiles,
      includeConfiguration,
      type
    });

    return jsonResponseNoCache({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create backup'
      },
      { status: statusCode });
  }
}