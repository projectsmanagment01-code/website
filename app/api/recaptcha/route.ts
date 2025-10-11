import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get public reCAPTCHA settings (site key and enabled status)
export async function GET() {
  try {
    // Get public reCAPTCHA settings from database
    const settings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['recaptcha_enabled', 'recaptcha_site_key']
        }
      }
    });

    // Convert to object format
    const recaptchaSettings = {
      enabled: false,
      siteKey: ''
    };

    settings.forEach(setting => {
      switch (setting.key) {
        case 'recaptcha_enabled':
          recaptchaSettings.enabled = setting.value === 'true';
          break;
        case 'recaptcha_site_key':
          recaptchaSettings.siteKey = setting.value || '';
          break;
      }
    });

    return NextResponse.json(recaptchaSettings);
  } catch (error) {
    console.error("Get public reCAPTCHA settings error:", error);
    return NextResponse.json(
      { enabled: false, siteKey: '' }
    );
  }
}