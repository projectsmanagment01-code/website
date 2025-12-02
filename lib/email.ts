import nodemailer from 'nodemailer';
import { getAdminSettings } from '@/lib/admin-settings';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('[EMAIL] Starting send process...');
  
  // Try to get settings from DB first
  const settings = await getAdminSettings();
  const emailSettings = settings.emailSettings;

  let host, port, user, pass, from;

  // Check if we have valid DB settings
  const hasValidDbSettings = emailSettings && (
    (emailSettings.provider === 'gmail' && emailSettings.email && emailSettings.appPassword) ||
    (emailSettings.provider === 'custom' && emailSettings.host && emailSettings.user && emailSettings.pass)
  );

  console.log('[EMAIL] Using DB settings:', hasValidDbSettings);

  if (hasValidDbSettings) {
    // Use DB settings
    if (emailSettings.provider === 'gmail') {
      host = 'smtp.gmail.com';
      port = 465;
      user = emailSettings.email;
      pass = emailSettings.appPassword;
    } else {
      host = emailSettings.host;
      port = emailSettings.port;
      user = emailSettings.user;
      pass = emailSettings.pass;
    }
    from = emailSettings.from;
  } else {
    // Fallback to env vars
    console.log('[EMAIL] Falling back to environment variables');
    host = process.env.SMTP_HOST;
    port = Number(process.env.SMTP_PORT) || 587;
    user = process.env.SMTP_USER;
    pass = process.env.SMTP_PASS;
    from = process.env.SMTP_FROM;
  }

  console.log('[EMAIL] Config:', { host, port, user: user ? '***' : 'missing', hasPass: !!pass, from });

  if (!host || !user || !pass) {
    console.error('[EMAIL] Missing SMTP configuration!');
    return { 
      success: false, 
      error: 'SMTP settings not configured. Please check your Email Settings in the Integrations page.' 
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // No timeouts - let it take as long as it needs
    connectionTimeout: 0,
    greetingTimeout: 0,
    socketTimeout: 0,
    // Disable debug logging for production
    debug: false,
    logger: false, 
  });

  try {
    console.log('[EMAIL] Attempting to send to:', to);
    console.log('[EMAIL] Subject:', subject);
    
    const info = await transporter.sendMail({
      from: from || `"Recipe CMS" <${user}>`,
      to,
      subject,
      html,
    });

    console.log('[EMAIL] ✓ Message sent successfully! ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ✗ Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email';
    console.error('[EMAIL] Error details:', errorMessage);
    return { 
      success: false, 
      error: errorMessage
    };
  }
}
