import { NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';

const backupService = new BackupService();

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    console.log('🔗 Accessing backup via shared link');

    // Verify and decode JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(params.token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (jwtError) {
      return jsonResponseNoCache({
          success: false,
          error: 'Invalid or expired backup link'
        },
        { status: 401 });
    }

    const backupId = decoded.backupId;
    console.log('📋 Decoded backup ID from token:', backupId);

    // Verify backup exists
    const backups = await backupService.listBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      return jsonResponseNoCache({
          success: false,
          error: 'Backup not found'
        },
        { status: 404 });
    }

    // Get backup file path
    const backupDir = path.join(process.cwd(), 'uploads', 'backups');
    let backupPath: string;

    if (backup.filename) {
      backupPath = path.join(backupDir, backup.filename);
    } else {
      // Fallback for legacy backups
      const filename = `${backup.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(backup.createdAt).toISOString().replace(/[:.]/g, '-')}.zip`;
      backupPath = path.join(backupDir, filename);
    }

    // Check if file exists
    if (!await fs.pathExists(backupPath)) {
      return jsonResponseNoCache({
          success: false,
          error: 'Backup file not found'
        },
        { status: 404 });
    }

    // Read file and return as download
    const fileBuffer = await fs.readFile(backupPath);
    const stats = await fs.stat(backupPath);

    console.log('✅ Shared backup file accessed:', {
      backupId,
      path: backupPath,
      size: stats.size
    });

    // Generate filename for download
    const downloadFilename = `${backup.name.replace(/[^a-zA-Z0-9]/g, '_')}_shared_${new Date(backup.createdAt).toISOString().slice(0, 10)}.zip`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('❌ Error accessing shared backup:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to access shared backup'
      },
      { status: statusCode });
  }
}