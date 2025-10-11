import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    await fs.ensureDir(backupDir);
    
    // List all files in backup directory
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('.zip'));
    
    const fileStats = [];
    for (const file of backupFiles) {
      try {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        fileStats.push({
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          readable: await fs.access(filePath, fs.constants.R_OK).then(() => true).catch(() => false),
          writable: await fs.access(filePath, fs.constants.W_OK).then(() => true).catch(() => false),
        });
      } catch (error) {
        fileStats.push({
          name: file,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Check database connection
    let databaseStatus: any = 'unknown';
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      const recipeCount = await prisma.recipe.count();
      const authorCount = await prisma.author.count();
      await prisma.$disconnect();
      
      databaseStatus = {
        connected: true,
        recipes: recipeCount,
        authors: authorCount
      };
    } catch (dbError) {
      databaseStatus = {
        connected: false,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      };
    }
    
    // Check uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    let uploadsStatus: any = 'unknown';
    try {
      await fs.ensureDir(uploadsDir);
      const uploadFiles = await fs.readdir(uploadsDir);
      uploadsStatus = {
        exists: true,
        subdirectories: uploadFiles.filter(async (item) => {
          const itemPath = path.join(uploadsDir, item);
          const stat = await fs.stat(itemPath);
          return stat.isDirectory();
        })
      };
    } catch (uploadsError) {
      uploadsStatus = {
        exists: false,
        error: uploadsError instanceof Error ? uploadsError.message : 'Uploads directory error'
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        backupDir,
        totalFiles: backupFiles.length,
        files: fileStats,
        permissions: {
          dirReadable: await fs.access(backupDir, fs.constants.R_OK).then(() => true).catch(() => false),
          dirWritable: await fs.access(backupDir, fs.constants.W_OK).then(() => true).catch(() => false),
        },
        database: databaseStatus,
        uploads: uploadsStatus,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          cwd: process.cwd()
        }
      }
    });

  } catch (error) {
    console.error('Error debugging backup system:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to debug backup system'
      },
      { status: 500 }
    );
  }
}