import { NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { BackupService } from '@/lib/backup/backup-service';
import { BackupError } from '@/lib/backup/types';
import jwt from 'jsonwebtoken';

const backupService = new BackupService();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔗 Generating backup link for ID:', params.id);

    // Verify backup exists
    const backups = await backupService.listBackups();
    const backup = backups.find(b => b.id === params.id);
    
    if (!backup) {
      return jsonResponseNoCache({
          success: false,
          error: 'Backup not found'
        },
        { status: 404 });
    }

    // Generate a JWT token for secure access
    const token = jwt.sign(
      { 
        backupId: params.id,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    // Create the shareable link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`;
    const shareableLink = `${baseUrl}/api/admin/backup/share/${token}`;

    console.log('✅ Generated backup link:', shareableLink);

    return jsonResponseNoCache({
      success: true,
      link: shareableLink,
      expiresIn: '24 hours'
    });

  } catch (error) {
    console.error('❌ Error generating backup link:', error);
    
    const statusCode = error instanceof BackupError ? 400 : 500;
    return jsonResponseNoCache({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate backup link'
      },
      { status: statusCode });
  }
}