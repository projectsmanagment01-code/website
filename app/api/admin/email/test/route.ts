import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getAdminSettings } from '@/lib/admin-settings';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get current settings to include in debug info (masking passwords)
    const settings = await getAdminSettings();
    const emailSettings = settings.emailSettings;
    
    const debugInfo = {
      provider: emailSettings?.provider,
      host: emailSettings?.host,
      port: emailSettings?.port,
      user: emailSettings?.user,
      hasAppPassword: !!emailSettings?.appPassword,
      hasPass: !!emailSettings?.pass,
      from: emailSettings?.from
    };

    console.log('Testing email with settings:', debugInfo);
    console.log('Attempting to send email...');

    const startTime = Date.now();
    const result = await sendEmail({
      to: email,
      subject: 'Test Email from Recipe CMS',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email from your Recipe CMS.</p>
          <p>If you are reading this, your email configuration is working correctly!</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
    const duration = Date.now() - startTime;
    console.log(`Email send attempt finished in ${duration}ms. Success: ${result.success}`);

    if (!result.success) {
      console.error('Email send failed with error:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        debug: debugInfo,
        duration
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, duration });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
