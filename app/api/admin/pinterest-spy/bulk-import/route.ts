import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface BulkImportRequest {
  data: string;
  format: 'csv' | 'json';
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const entries = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const entry: any = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const headerLower = header.toLowerCase().trim();
      
      // Map CSV headers to database fields
      if (headerLower === 'spy title' || headerLower === 'title') {
        entry.spyTitle = value;
      } else if (headerLower === 'spy description' || headerLower === 'description') {
        entry.spyDescription = value;
      } else if (headerLower === 'spy image url' || headerLower === 'image url') {
        entry.spyImageUrl = value;
      } else if (headerLower === 'spy article url' || headerLower === 'article url') {
        entry.spyArticleUrl = value;
      } else if (headerLower === 'spy pin image' || headerLower === 'pin image') {
        entry.spyPinImage = value;
      } else if (headerLower === 'annotation') {
        entry.annotation = value;
      }
    });

    // Set defaults for required fields
    entry.spyTitle = entry.spyTitle || 'Untitled';
    entry.spyDescription = entry.spyDescription || '';
    entry.spyImageUrl = entry.spyImageUrl || '';
    entry.spyArticleUrl = entry.spyArticleUrl || '';
    entry.status = 'PENDING';
    entry.isMarkedForGeneration = false;
    entry.isProcessed = false;
    entry.batchId = `bulk_${Date.now()}`;

    entries.push(entry);
  }

  return entries;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const body: BulkImportRequest = await request.json();
    const { data, format } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'No data provided' },
        { status: 400 }
      );
    }

    // Parse data based on format
    let entries: any[] = [];
    
    if (format === 'csv') {
      entries = parseCSV(data);
    } else {
      return NextResponse.json(
        { error: 'Unsupported format', message: 'Only CSV format is supported' },
        { status: 400 }
      );
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid entries', message: 'No valid data rows found in CSV' },
        { status: 400 }
      );
    }

    // Import entries to database
    const created = await prisma.pinterestSpyData.createMany({
      data: entries,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      imported: created.count,
      message: `Successfully imported ${created.count} entries`
    });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { 
        error: 'Import failed', 
        message: error.message || 'An error occurred during import'
      },
      { status: 500 }
    );
  }
}
