import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { verifyAuth } from "@/lib/api-auth";
import {
  getAdminSettings,
  saveAdminSettings,
  AdminSettingsData,
} from "@/lib/admin-settings";

// GET - Retrieve current settings
export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in GET /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the structure
    const requiredSections = ["header", "body", "footer"];
    for (const section of requiredSections) {
      if (!body[section] || typeof body[section] !== "object") {
        return NextResponse.json(
          { error: `Invalid ${section} section` },
          { status: 400 }
        );
      }

      const requiredFields = ["html", "css", "javascript"];
      for (const field of requiredFields) {
        if (!Array.isArray(body[section][field])) {
          return NextResponse.json(
            { error: `Invalid ${section}.${field} field - must be an array` },
            { status: 400 }
          );
        }

        // Validate each item in the array is a string
        for (const item of body[section][field]) {
          if (typeof item !== "string") {
            return NextResponse.json(
              {
                error: `Invalid item in ${section}.${field} - must be a string`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Validate adsTxt and robotsTxt fields
    const textFields = ["adsTxt", "robotsTxt"];
    for (const field of textFields) {
      if (body[field] !== undefined && typeof body[field] !== "string") {
        return NextResponse.json(
          { error: `Invalid ${field} field - must be a string` },
          { status: 400 }
        );
      }
    }

    // Validate hero field
    if (body.hero && typeof body.hero === "object") {
      if (body.hero.page !== undefined && typeof body.hero.page !== "string") {
        return NextResponse.json(
          { error: "Invalid hero.page field - must be a string" },
          { status: 400 }
        );
      }
      if (
        body.hero.content !== undefined &&
        typeof body.hero.content !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid hero.content field - must be a string" },
          { status: 400 }
        );
      }
    }

    // Validate staticPages field
    if (body.staticPages && typeof body.staticPages === "object") {
      const staticPageFields = [
        "about",
        "contact",
        "privacy",
        "terms",
        "faq",
        "disclaimer",
        "cookies",
      ];
      for (const field of staticPageFields) {
        if (
          body.staticPages[field] !== undefined &&
          typeof body.staticPages[field] !== "string"
        ) {
          return NextResponse.json(
            { error: `Invalid staticPages.${field} field - must be a string` },
            { status: 400 }
          );
        }
      }
    }

    // Read current settings and merge with updates
    const currentSettings = await getAdminSettings();
    const updatedSettings: AdminSettingsData = {
      ...currentSettings,
      ...body,
    };

    // Write updated settings
    const success = await saveAdminSettings(updatedSettings);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      );
    }

    // Revalidate cached admin settings
    revalidateTag("admin-settings");

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Replace entire settings (alternative to POST)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the structure
    const requiredSections = ["header", "body", "footer"];
    for (const section of requiredSections) {
      if (!body[section] || typeof body[section] !== "object") {
        return NextResponse.json(
          { error: `Invalid ${section} section` },
          { status: 400 }
        );
      }

      const requiredFields = ["html", "css", "javascript"];
      for (const field of requiredFields) {
        if (!Array.isArray(body[section][field])) {
          return NextResponse.json(
            { error: `Invalid ${section}.${field} field - must be an array` },
            { status: 400 }
          );
        }

        // Validate each item in the array is a string
        for (const item of body[section][field]) {
          if (typeof item !== "string") {
            return NextResponse.json(
              {
                error: `Invalid item in ${section}.${field} - must be a string`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Write settings (replace entirely)
    const success = await saveAdminSettings(body as AdminSettingsData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      );
    }

    // Revalidate cached admin settings
    revalidateTag("admin-settings");

    return NextResponse.json({
      success: true,
      message: "Settings replaced successfully",
      settings: body,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update settings (for specific fields like aboutPageContent)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get current settings
    const currentSettings = await getAdminSettings();

    // Merge with new data
    const updatedSettings = {
      ...currentSettings,
      ...body,
    };

    // Extract email from auth payload
    const updatedBy = authResult.type === 'jwt' 
      ? (authResult.payload as any).email 
      : (authResult.payload as any).createdBy;

    // Save updated settings
    const success = await saveAdminSettings(updatedSettings as AdminSettingsData, updatedBy);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      );
    }

    // Revalidate cached admin settings
    revalidateTag("admin-settings");

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
