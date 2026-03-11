import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "audit@opencreditai.com";

export interface AuditReportData {
  requestId: number;
  fileName: string;
  status: "clean" | "malicious" | "suspicious" | "timeout";
  stats: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
  };
  permalink?: string;
}

function getStatusColor(status: AuditReportData["status"]): string {
  switch (status) {
    case "clean":
      return "#22c55e";
    case "malicious":
      return "#ef4444";
    case "suspicious":
      return "#f59e0b";
    case "timeout":
      return "#6b7280";
    default:
      return "#6b7280";
  }
}

function getStatusText(status: AuditReportData["status"]): string {
  switch (status) {
    case "clean":
      return "Clean - No threats detected";
    case "malicious":
      return "Malicious - Threats detected";
    case "suspicious":
      return "Suspicious - Potential risks found";
    case "timeout":
      return "Timeout - Scan took too long";
    default:
      return "Unknown";
  }
}

export async function sendAuditReport(email: string, report: AuditReportData): Promise<void> {
  if (!resend) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const statusColor = getStatusColor(report.status);
  const statusText = getStatusText(report.status);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OpenCreditAi Audit Report</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 8px; border: 1px solid #333333;">
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; font-family: 'JetBrains Mono', monospace;">
                      OpenCreditAi
                    </h1>
                    <p style="margin: 0; font-size: 14px; color: #f97316; font-family: 'JetBrains Mono', monospace;">
                      AI Economy. Open Credit. Infinite Potential.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                      Audit Report - Request #${report.requestId}
                    </h2>
                    
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #a1a1aa;">
                      File: <strong style="color: #ffffff;">${report.fileName}</strong>
                    </p>
                    
                    <div style="background-color: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 6px; padding: 16px; margin: 24px 0;">
                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${statusColor};">
                        ${statusText}
                      </p>
                    </div>
                    
                    <h3 style="margin: 24px 0 12px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                      Scan Results
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #333333;">
                          <span style="color: #22c55e; font-weight: 600;">Clean</span>
                          <span style="float: right; color: #ffffff;">${report.stats.undetected + report.stats.harmless}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #333333;">
                          <span style="color: #f59e0b; font-weight: 600;">Suspicious</span>
                          <span style="float: right; color: #ffffff;">${report.stats.suspicious}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px;">
                          <span style="color: #ef4444; font-weight: 600;">Malicious</span>
                          <span style="float: right; color: #ffffff;">${report.stats.malicious}</span>
                        </td>
                      </tr>
                    </table>
                    
                    ${report.permalink ? `
                    <p style="margin: 24px 0 0 0; font-size: 14px;">
                      <a href="${report.permalink}" style="color: #f97316; text-decoration: none;">
                        View Full Report on VirusTotal →
                      </a>
                    </p>
                    ` : ""}
                    
                    <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;">
                    
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      This is an automated report from OpenCreditAi Audit Service.
                      <br>
                      For questions, reply to this email.
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

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your OpenCreditAi Audit Report - Request #${report.requestId}`,
    html,
  });
}
