/**
 * Image Upload Diagnostics API
 * Helps troubleshoot image upload/serving issues
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      workingDirectory: process.cwd(),
      paths: {},
      directories: {},
      recentUploads: {},
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        MEDIA_SERVER_URL: process.env.MEDIA_SERVER_URL,
      },
    };

    // Check all possible upload directories
    const pathsToCheck = [
      { name: "root/uploads", path: path.join(process.cwd(), "uploads") },
      { name: "public/uploads", path: path.join(process.cwd(), "public", "uploads") },
      { name: "parent/uploads", path: path.join(process.cwd(), "..", "uploads") },
    ];

    for (const { name, path: dirPath } of pathsToCheck) {
      diagnostics.paths[name] = dirPath;
      diagnostics.directories[name] = {
        exists: existsSync(dirPath),
        accessible: false,
        subdirectories: [],
        fileCount: 0,
      };

      if (existsSync(dirPath)) {
        try {
          await fs.access(dirPath);
          diagnostics.directories[name].accessible = true;

          // List subdirectories
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          diagnostics.directories[name].subdirectories = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name);

          // Count files recursively
          const countFiles = async (dir: string): Promise<number> => {
            let count = 0;
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
              if (item.isDirectory()) {
                count += await countFiles(path.join(dir, item.name));
              } else {
                count++;
              }
            }
            return count;
          };

          diagnostics.directories[name].fileCount = await countFiles(dirPath);

          // Get recent uploads
          if (name === "root/uploads") {
            diagnostics.recentUploads[name] = await getRecentFiles(dirPath, 5);
          }
        } catch (error) {
          diagnostics.directories[name].error = String(error);
        }
      }
    }

    // Check media server availability
    if (process.env.MEDIA_SERVER_URL) {
      try {
        const healthCheck = await fetch(`${process.env.MEDIA_SERVER_URL}/health`);
        diagnostics.mediaServer = {
          url: process.env.MEDIA_SERVER_URL,
          healthy: healthCheck.ok,
          status: healthCheck.status,
        };
      } catch (error) {
        diagnostics.mediaServer = {
          url: process.env.MEDIA_SERVER_URL,
          healthy: false,
          error: String(error),
        };
      }
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostics failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function getRecentFiles(dir: string, limit: number): Promise<any[]> {
  try {
    const files: any[] = [];

    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: path.relative(dir, fullPath),
            size: stats.size,
            created: stats.birthtime.toISOString(),
            modified: stats.mtime.toISOString(),
          });
        }
      }
    }

    await scan(dir);

    return files
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}
