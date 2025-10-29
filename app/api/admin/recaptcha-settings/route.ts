import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get reCAPTCHA settings
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    // Get reCAPTCHA settings from database
    const settings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['recaptcha_enabled', 'recaptcha_site_key', 'recaptcha_secret_key']
        }
      }
    });

    // Convert to object format
    const recaptchaSettings = {
      enabled: false,
      siteKey: '',
      secretKey: ''
    };

    settings.forEach(setting => {
      switch (setting.key) {
        case 'recaptcha_enabled':
          recaptchaSettings.enabled = setting.value === 'true';
          break;
        case 'recaptcha_site_key':
          recaptchaSettings.siteKey = setting.value || '';
          break;
        case 'recaptcha_secret_key':
          recaptchaSettings.secretKey = setting.value || '';
          break;
      }
    });

    return jsonResponseNoCache(recaptchaSettings);
  } catch (error) {
    console.error("Get reCAPTCHA settings error:", error);
    return errorResponseNoCache('Internal server error', 500);
  }
}

// Update reCAPTCHA settings
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const { enabled, siteKey, secretKey } = await request.json();

    const adminEmail = "admin@yourrecipesite.com";

    // Update settings in database
    const settingsToUpdate = [
      {
        key: 'recaptcha_enabled',
        value: enabled ? 'true' : 'false'
      },
      {
        key: 'recaptcha_site_key',
        value: siteKey || ''
      },
      {
        key: 'recaptcha_secret_key',
        value: secretKey || ''
      }
    ];

    // Use upsert to create or update each setting
    for (const setting of settingsToUpdate) {
      await prisma.adminSettings.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          updatedBy: adminEmail,
        },
        create: { 
          key: setting.key,
          value: setting.value,
          updatedBy: adminEmail,
        },
      });
    }

    return jsonResponseNoCache({
      message: "reCAPTCHA settings updated successfully",
      settings: {
        enabled,
        siteKey,
        secretKey
      }
    });
  } catch (error) {
    console.error("Update reCAPTCHA settings error:", error);
    return errorResponseNoCache('Internal server error', 500);
  }
}