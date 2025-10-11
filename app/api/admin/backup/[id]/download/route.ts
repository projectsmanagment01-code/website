import { NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';
import fs from 'fs-extra';
import path from 'path';

const backupService = new BackupService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    console.log('⬇️ Downloading backup ID:', id);

    // Use the backup service to find the backup file path
    const backupPath = await backupService.findBackupFilePath(id);
    
    if (!backupPath) {
      return NextResponse.json(
        {
          success: false,
          error: 'Backup not found'
        },
        { status: 404 }
      );
    }

    // Check if file exists
    if (!await fs.pathExists(backupPath)) {
      console.error('❌ Backup file not found at:', backupPath);
      return NextResponse.json(
        {
          success: false,
          error: 'Backup file not found'
        },
        { status: 404 }
      );
    }

    // Read file and return as download
    const fileBuffer = await fs.readFile(backupPath);
    const stats = await fs.stat(backupPath);

    console.log('✅ Backup file found, sending download:', {
      path: backupPath,
      size: stats.size
    });

    // Generate filename for download
    const backupMetadata = await backupService.getBackupMetadata(backupPath);
    const downloadFilename = backupMetadata 
      ? `${backupMetadata.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(backupMetadata.createdAt).toISOString().slice(0, 10)}.zip`
      : path.basename(backupPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error downloading backup:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download backup'
      },
      { status: statusCode }
    );
  }
}