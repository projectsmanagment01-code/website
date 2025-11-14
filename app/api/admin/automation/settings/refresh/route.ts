import { NextRequest, NextResponse } from 'next/server';
import { clearSettingsCache } from '@/automation/config/env';

export async function POST(request: NextRequest) {
  try {
    // Clear the settings cache
    clearSettingsCache();

    return NextResponse.json({ 
      success: true,
      message: 'Settings cache cleared successfully. Latest settings will be loaded on next request.'
    });
  } catch (error) {
    console.error('Failed to clear settings cache:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear settings cache' 
      },
      { status: 500 }
    );
  }
}
