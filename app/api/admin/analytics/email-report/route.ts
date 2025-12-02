import { NextRequest, NextResponse } from 'next/server';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for execution (if platform supports it)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    const body = await request.json();
    const { email, analytics } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate HTML Report
    const html = generateEmailTemplate(analytics);

    // Send Email
    const result = await sendEmail({
      to: email,
      subject: `Analytics Report - ${new Date().toLocaleDateString()}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email report' },
      { status: 500 }
    );
  }
}

function generateEmailTemplate(analytics: any) {
  const { overview, topRecipes } = analytics;
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Report</title>
  <style>
    /* Mobile Responsiveness */
    @media screen and (max-width: 600px) {
      .w-full { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; }
      .p-sm { padding: 15px !important; }
      .h-auto { height: auto !important; }
      .metric-spacer { display: none !important; }
      .metric-card { margin-bottom: 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <!-- Main Wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <!-- Content Container (Max 600px) -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" class="w-full" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 20px; font-weight: bold; color: #0f172a;">Recipe<span style="color: #f97316;">CMS</span></span>
                  </td>
                  <td align="right" style="color: #64748b; font-size: 14px; font-weight: 500;">
                    ${date}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding: 30px 40px 10px 40px;" class="p-sm">
              <h1 style="margin: 0 0 10px 0; color: #0f172a; font-size: 24px; font-weight: bold;">Analytics Overview</h1>
              <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.5;">Here is your performance summary. Your platform currently has <strong style="color: #f97316;">${overview.totalViews.toLocaleString()}</strong> total views.</p>
            </td>
          </tr>

          <!-- KEY METRICS GRID -->
          <tr>
            <td style="padding: 20px 40px;" class="p-sm">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Metric Card 1: Views -->
                  <td width="48%" class="stack metric-card" valign="top" style="background-color: #fff7ed; border-radius: 8px; padding: 20px; border: 1px solid #ffedd5;">
                    <div style="color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Views</div>
                    <div style="color: #ea580c; font-size: 28px; font-weight: bold; margin: 5px 0;">${overview.totalViews.toLocaleString()}</div>
                    <div style="color: #c2410c; font-size: 12px;">Lifetime views</div>
                  </td>
                  
                  <!-- Spacer -->
                  <td width="4%" class="stack metric-spacer" style="font-size: 0; line-height: 0;">&nbsp;</td>
                  
                  <!-- Metric Card 2: Subscribers -->
                  <td width="48%" class="stack metric-card" valign="top" style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; border: 1px solid #e0f2fe;">
                    <div style="color: #0369a1; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Subscribers</div>
                    <div style="color: #0284c7; font-size: 28px; font-weight: bold; margin: 5px 0;">${overview.totalSubscribers.toLocaleString()}</div>
                    <div style="color: #075985; font-size: 12px;">Total active subs</div>
                  </td>
                </tr>
                <tr><td height="15" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
                <tr>
                  <!-- Metric Card 3: Recipes -->
                  <td width="48%" class="stack metric-card" valign="top" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; border: 1px solid #dcfce7;">
                    <div style="color: #15803d; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Published</div>
                    <div style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 5px 0;">${overview.publishedRecipes}</div>
                    <div style="color: #14532d; font-size: 12px;">Active recipes</div>
                  </td>
                  
                  <!-- Spacer -->
                  <td width="4%" class="stack metric-spacer" style="font-size: 0; line-height: 0;">&nbsp;</td>
                  
                  <!-- Metric Card 4: Active Users -->
                  <td width="48%" class="stack metric-card" valign="top" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                    <div style="color: #475569; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Active Users</div>
                    <div style="color: #334155; font-size: 28px; font-weight: bold; margin: 5px 0;">${(overview.activeUsers || 0).toLocaleString()}</div>
                    <div style="color: #64748b; font-size: 12px;">Current session</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TOP CONTENT LIST -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;" class="p-sm">
              <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Top Performing Recipes</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                
                ${topRecipes.slice(0, 5).map((recipe: any, index: number) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="30" valign="middle" style="color: #f97316; font-weight: bold; font-size: 16px;">${index + 1}.</td>
                        <td valign="middle">
                          <div style="color: #334155; font-weight: 600; font-size: 15px;">${recipe.title}</div>
                          <div style="color: #94a3b8; font-size: 13px; margin-top: 2px;">${recipe.category}</div>
                        </td>
                        <td align="right" valign="middle" style="color: #64748b; font-weight: 500; white-space: nowrap;">
                          ${recipe.views.toLocaleString()} <span style="font-size: 12px; color: #94a3b8;">views</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}

              </table>
            </td>
          </tr>

          <!-- FOOTER CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;" class="p-sm">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/admin/dashboard" style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">Open Analytics Dashboard</a>
            </td>
          </tr>

        </table>

        <!-- FOOTER -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" class="w-full">
          <tr>
            <td align="center" style="padding: 30px 0; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">This is an automated report from your Recipe CMS.</p>
              <p style="margin: 0;">
                <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
