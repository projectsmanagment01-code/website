import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings, saveAdminSettings } from '@/lib/admin-settings';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAdminSettings();
  return NextResponse.json({
    googleTagManagerId: settings.googleTagManagerId || '',
    emailSettings: settings.emailSettings || null,
    headerCode: settings.header.html[0] || '',
    bodyCode: settings.body.html[0] || '',
    footerCode: settings.footer.html[0] || '',
    adsTxt: settings.adsTxt || '',
    robotsTxt: settings.robotsTxt || '',
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { googleTagManagerId, emailSettings, headerCode, bodyCode, footerCode, adsTxt, robotsTxt } = body;

    const currentSettings = await getAdminSettings();
    
    const newSettings = {
      ...currentSettings,
      googleTagManagerId,
      emailSettings,
      header: {
        ...currentSettings.header,
        html: headerCode ? [headerCode] : [],
      },
      body: {
        ...currentSettings.body,
        html: bodyCode ? [bodyCode] : [],
      },
      footer: {
        ...currentSettings.footer,
        html: footerCode ? [footerCode] : [],
      },
      adsTxt,
      robotsTxt,
    };
    
    const success = await saveAdminSettings(newSettings, auth.payload?.email || 'admin');

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
