/**
 * Author Images API - List available author images
 * GET /api/admin/author-images - List all author images from uploads/authors
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'authors');
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      // Directory doesn't exist, return empty array
      console.log('⚠️  Authors directory not found:', uploadsDir);
      return NextResponse.json({ images: [] });
    }

    // Read directory
    const files = await fs.readdir(uploadsDir);
    
    // Filter only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // Get file stats for sorting by date
    const imagesWithStats = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          url: `/api/uploads/authors/${file}`, // Fixed: Use /api/uploads to serve via image route
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
    );

    // Sort by modification date (newest first)
    imagesWithStats.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({
      images: imagesWithStats,
      total: imagesWithStats.length
    });

  } catch (error) {
    console.error('❌ Error listing author images:', error);
    return NextResponse.json(
      { error: 'Failed to list author images' },
      { status: 500 }
    );
  }
}
