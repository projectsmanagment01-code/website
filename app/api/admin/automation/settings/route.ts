/**
 * GET /api/admin/automation/settings
 * PUT /api/admin/automation/settings
 * Manage automation settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getAutomationSettings, updateAutomationSettings, testAutomationSettings } from '@/lib/automation-settings';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get settings
    const settings = await getAutomationSettings();

    // If no settings exist, return default values
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          isConfigured: false,
          geminiFlashModel: 'gemini-2.0-flash-exp',
          geminiProModel: 'gemini-1.5-pro',
          enablePinterest: false,
          enableIndexing: false,
          maxRetries: 3,
          retryDelayMs: 5000,
        },
      });
    }

    // Return settings (sensitive fields are already masked in the service)
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Failed to get automation settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get settings' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update settings
    const settings = await updateAutomationSettings(body);

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Failed to update automation settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update settings' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test current settings
    const result = await testAutomationSettings();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
    });
  } catch (error) {
    console.error('Failed to test automation settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test settings' 
      },
      { status: 500 }
    );
  }
}
