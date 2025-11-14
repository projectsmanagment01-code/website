import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Verify admin authentication
    const authError = await verifyAuth();
    if (authError) {
      return authError;
    }

    // Get GTM settings
    let settings = await prisma.gTMSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.gTMSettings.create({
        data: {
          enableGTM: false,
          enableGA4: false,
          consentMode: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching GTM settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await verifyAuth();
    if (authError) {
      return authError;
    }

    const body = await request.json();

    // Validate GTM ID format (GTM-XXXXXXX)
    if (body.gtmId && !/^GTM-[A-Z0-9]{7,}$/.test(body.gtmId)) {
      return NextResponse.json(
        { error: 'Invalid GTM ID format. Expected: GTM-XXXXXXX' },
        { status: 400 }
      );
    }

    // Validate GA4 ID format (G-XXXXXXXXXX)
    if (body.ga4Id && !/^G-[A-Z0-9]{10,}$/.test(body.ga4Id)) {
      return NextResponse.json(
        { error: 'Invalid GA4 Measurement ID format. Expected: G-XXXXXXXXXX' },
        { status: 400 }
      );
    }

    // Get existing settings or create new
    const existingSettings = await prisma.gTMSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let settings;

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.gTMSettings.update({
        where: { id: existingSettings.id },
        data: {
          gtmId: body.gtmId || null,
          ga4Id: body.ga4Id || null,
          enableGTM: body.enableGTM ?? false,
          enableGA4: body.enableGA4 ?? false,
          consentMode: body.consentMode ?? true,
          customHeadCode: body.customHeadCode || null,
          customBodyCode: body.customBodyCode || null,
          customFooterCode: body.customFooterCode || null,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.gTMSettings.create({
        data: {
          gtmId: body.gtmId || null,
          ga4Id: body.ga4Id || null,
          enableGTM: body.enableGTM ?? false,
          enableGA4: body.enableGA4 ?? false,
          consentMode: body.consentMode ?? true,
          customHeadCode: body.customHeadCode || null,
          customBodyCode: body.customBodyCode || null,
          customFooterCode: body.customFooterCode || null,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating GTM settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
