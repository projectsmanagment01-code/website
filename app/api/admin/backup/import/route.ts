import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export const maxDuration = 1800; // 30 minutes for large files
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('📥 Importing backup from URL:', url);

    // Add timeout and headers for large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25 * 60 * 1000); // 25 minutes

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Backup-Import-Service/1.0',
        'Accept': 'application/zip, application/octet-stream, */*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'identity' // Prevent compression
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to download: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    // Check file size before downloading
    const contentLength = response.headers.get('content-length');
    const maxSize = 1000 * 1024 * 1024; // 1GB limit
    
    if (contentLength) {
      const fileSize = parseInt(contentLength);
      console.log(`📊 File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (fileSize > maxSize) {
        return NextResponse.json(
          { success: false, error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)} MB. Max: ${maxSize / 1024 / 1024} MB` },
          { status: 400 }
        );
      }
    }

    // Save to main backups directory
    const backupsDir = path.join(process.cwd(), 'backups');
    await fs.ensureDir(backupsDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `imported-backup-${timestamp}.zip`;
    const filepath = path.join(backupsDir, filename);

    console.log('💾 Streaming large file to:', filepath);

    // Stream download for memory efficiency
    const fileStream = fs.createWriteStream(filepath);
    const reader = response.body?.getReader();

    if (!reader) {
      return NextResponse.json(
        { success: false, error: 'Failed to read file stream' },
        { status: 500 }
      );
    }

    try {
      let totalSize = 0;
      let lastProgressTime = Date.now();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fileStream.write(value);
        totalSize += value.length;
        
        // Progress logging with heartbeat for Cloudflare
        const now = Date.now();
        if (now - lastProgressTime > 30000) { // Every 30 seconds
          console.log(`📊 Downloaded: ${(totalSize / 1024 / 1024).toFixed(2)} MB - Heartbeat`);
          lastProgressTime = now;
        } else if (totalSize % (50 * 1024 * 1024) === 0) { // Every 50MB
          console.log(`📊 Downloaded: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        }
        
        // Safety check during download
        if (totalSize > maxSize) {
          fileStream.close();
          await fs.remove(filepath);
          return NextResponse.json(
            { success: false, error: 'File exceeded size limit during download' },
            { status: 400 }
          );
        }
      }
      
      // File size for response
      const finalSize = totalSize;
      
      console.log('✅ Backup imported successfully:', filename);

      return NextResponse.json({
        success: true,
        message: 'Backup imported successfully',
        filename: filename,
        size: Math.round(finalSize / 1024 / 1024) // Size in MB
      });
      
    } finally {
      reader.releaseLock();
      fileStream.end();
    }

  } catch (error) {
    console.error('❌ Import error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Import timeout - file too large or connection too slow' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to import backup' },
      { status: 500 }
    );
  }
}
