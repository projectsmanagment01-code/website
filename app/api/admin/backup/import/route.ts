import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export const maxDuration = 3600; // 60 minutes for very large files (1GB+)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Check if this is a file upload (multipart/form-data) or URL import (application/json)
    if (contentType?.includes('multipart/form-data')) {
      return handleFileUpload(request);
    } else {
      return handleUrlImport(request);
    }
  } catch (error) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process import request' },
      { status: 500 }
    );
  }
}

// Handle file upload
async function handleFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📥 Importing backup from uploaded file:', file.name);

    // Validate file type
    if (!file.name.endsWith('.zip') && !file.name.endsWith('.gz')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only .zip and .gz files are supported.' },
        { status: 400 }
      );
    }

    // Log file size for monitoring (no limit)
    console.log(`📊 Uploading file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Warn for very large files but don't block them
    if (file.size > 500 * 1024 * 1024) { // 500MB
      console.log(`⚠️  Large file detected: ${(file.size / 1024 / 1024).toFixed(2)} MB - This may take a while to process`);
    }

    // Save to main backups directory
    const backupsDir = path.join(process.cwd(), 'backups');
    await fs.ensureDir(backupsDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `uploaded-backup-${timestamp}.zip`;
    const filepath = path.join(backupsDir, filename);

    console.log('💾 Saving uploaded file to:', filepath);

    // Use streaming for memory efficiency with large files
    const fileStream = fs.createWriteStream(filepath);
    const reader = file.stream().getReader();
    
    try {
      let totalSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fileStream.write(value);
        totalSize += value.length;
        
        // Log progress for large files
        if (totalSize % (100 * 1024 * 1024) === 0) { // Every 100MB
          console.log(`📊 Processed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        }
      }
      
    } finally {
      reader.releaseLock();
      fileStream.end();
    }

    console.log('✅ Backup uploaded successfully:', filename);

    return NextResponse.json({
      success: true,
      message: 'Backup uploaded and imported successfully',
      filename: filename,
      size: Math.round(file.size / 1024 / 1024) // Size in MB
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload backup file' },
      { status: 500 }
    );
  }
}

// Handle URL import (existing functionality)
async function handleUrlImport(request: NextRequest) {
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

    // Add timeout and headers for very large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55 * 60 * 1000); // 55 minutes (5 min buffer from maxDuration)

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

    // Check file size before downloading (log only, no limit)
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      const fileSize = parseInt(contentLength);
      console.log(`📊 Download file size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (fileSize > 1000 * 1024 * 1024) { // 1GB
        console.log(`⚠️  Very large file detected: ${(fileSize / 1024 / 1024).toFixed(2)} MB - This will take significant time to process`);
      }
    } else {
      console.log('📊 File size unknown - streaming without size check');
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
        
        // Log progress for very large files (no size limit)
        if (totalSize > 1000 * 1024 * 1024 && totalSize % (100 * 1024 * 1024) === 0) { // Every 100MB after 1GB
          console.log(`📊 Large file progress: ${(totalSize / 1024 / 1024).toFixed(2)} MB downloaded`);
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
