import * as brevo from "@getbrevo/brevo";
import { SERVER_CONFIG } from "../config/server.config.js";

// Validate configuration on startup
if (!SERVER_CONFIG.BREVO_API_KEY) {
  console.warn("[Email] BREVO_API_KEY not configured - emails will not be sent");
}

// Initialize Brevo API client
let apiInstance = null;
if (SERVER_CONFIG.BREVO_API_KEY) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, SERVER_CONFIG.BREVO_API_KEY);
}

const FROM = SERVER_CONFIG.EMAIL_FROM;

// ─── Responsive Email Template ───────────────────────────────────────────────
const wrap = (headerBg, headerContent, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>HireLens</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f6f9;">
    <tr>
      <td style="padding:20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background:${headerBg};padding:40px 30px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align:center;">
                    <div style="background:#ffffff;width:56px;height:56px;border-radius:12px;margin:0 auto 16px;display:inline-flex;align-items:center;justify-content:center;">
                      <span style="font-size:28px;">💼</span>
                    </div>
                    ${headerContent}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;font-size:14px;color:#6b7280;font-weight:600;">HireLens</p>
              <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;line-height:1.5;">Streamline your hiring process with confidence</p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} HireLens. All rights reserved.</p>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── 1. Team Invite Email ─────────────────────────────────────────────────────
const buildInviteHtml = ({ email, role, organizationName, inviteUrl, expiresAt }) => {
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
  const expiry = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const roleDescriptions = {
    RECRUITER: "You'll be able to post jobs, manage candidates, assign interviews, and track the entire hiring pipeline.",
    INTERVIEWER: "You'll be able to review candidate profiles, conduct interviews, and submit feedback to help make hiring decisions."
  };

  return wrap(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    `
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">You're Invited!</h1>
    <p style="color:#e0e7ff;margin:8px 0 0;font-size:15px;">Join ${organizationName} on HireLens</p>
    `,
    `
    <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hello! 👋
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      <strong>${organizationName}</strong> has invited you to join their team on <strong>HireLens</strong> as a <span style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:4px 12px;border-radius:16px;font-size:13px;font-weight:600;margin:0 2px;">${roleLabel}</span>.
    </p>
    
    <!-- Role Details Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Role</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${roleDescriptions[role]}</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="text-align:center;">
          <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(102,126,234,0.3);">Accept Invitation →</a>
        </td>
      </tr>
    </table>

    <!-- Alternative Link -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;color:#92400e;font-weight:600;">Can't click the button?</p>
          <p style="margin:0;font-size:13px;color:#78350f;word-break:break-all;line-height:1.5;">${inviteUrl}</p>
        </td>
      </tr>
    </table>

    <!-- Expiry Info -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Invitation Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📧 Sent to: <strong>${email}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">⏰ Expires: <strong>${expiry}</strong></p>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you weren't expecting this invitation, you can safely ignore this email.</p>
        </td>
      </tr>
    </table>
    `
  );
};

// ─── 2. Interview Scheduled Email ─────────────────────────────────────────────
const buildInterviewScheduledHtml = ({ interviewerName, candidateName, jobTitle, scheduledAt, organizationName }) => {
  const dateStr = new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = new Date(scheduledAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
  const dayOfWeek = new Date(scheduledAt).toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = new Date(scheduledAt).getDate();
  const month = new Date(scheduledAt).toLocaleDateString("en-US", { month: "short" });

  return wrap(
    "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    `
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">Interview Scheduled</h1>
    <p style="color:#dbeafe;margin:8px 0 0;font-size:15px;">You have a new interview assignment</p>
    `,
    `
    <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi <strong>${interviewerName}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      You've been assigned to interview a candidate at <strong>${organizationName}</strong>. Please review the details below and prepare accordingly.
    </p>

    <!-- Interview Details Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border-radius:12px;border:2px solid #0ea5e9;overflow:hidden;">
      <tr>
        <td style="padding:24px;">
          <!-- Date Badge -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
            <tr>
              <td style="background:#0ea5e9;color:#ffffff;padding:12px 20px;border-radius:8px;text-align:center;min-width:80px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${month}</div>
                <div style="font-size:28px;font-weight:700;line-height:1;">${dayNum}</div>
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">${dayOfWeek}</div>
              </td>
            </tr>
          </table>

          <!-- Details Table -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">👤 Candidate</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${candidateName}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">💼 Position</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${jobTitle}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">📅 Date</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${dateStr}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">🕐 Time</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${timeStr}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Action Items -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px;font-size:14px;color:#111827;font-weight:600;">📋 Next Steps:</p>
          <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
            <li>Review the candidate's profile and resume on HireLens</li>
            <li>Prepare interview questions based on the job requirements</li>
            <li>Conduct the interview at the scheduled time</li>
            <li>Submit your feedback and recommendation after the interview</li>
          </ul>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td style="text-align:center;">
          <a href="${SERVER_CONFIG.FRONTEND_URL}/interviews" style="display:inline-block;background:linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;box-shadow:0 4px 6px rgba(6,182,212,0.3);">View Candidate Profile →</a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">If you have any questions or need to reschedule, please contact your recruiter.</p>
    `
  );
};

// ─── 3. Candidate Stage Change Email ─────────────────────────────────────────
const STAGE_LABELS = {
  APPLIED:    { label: "Applied",    emoji: "📝", bg: "#f3f4f6", color: "#374151" },
  SCREENING:  { label: "Screening",  emoji: "🔍", bg: "#fef3c7", color: "#92400e" },
  INTERVIEW:  { label: "Interview",  emoji: "💬", bg: "#dbeafe", color: "#1e40af" },
  OFFER:      { label: "Offer",      emoji: "🎁", bg: "#d1fae5", color: "#065f46" },
  HIRED:      { label: "Hired",      emoji: "🎉", bg: "#d1fae5", color: "#065f46" },
  REJECTED:   { label: "Not Selected", emoji: "📋", bg: "#fee2e2", color: "#991b1b" },
};

const buildStageChangeHtml = ({ candidateName, jobTitle, fromStage, toStage, organizationName, note }) => {
  const from = STAGE_LABELS[fromStage] || { label: fromStage, emoji: "📌", bg: "#f3f4f6", color: "#374151" };
  const to   = STAGE_LABELS[toStage]   || { label: toStage,   emoji: "📌", bg: "#f3f4f6", color: "#374151" };
  const isHired    = toStage === "HIRED";
  const isRejected = toStage === "REJECTED";
  const isOffer    = toStage === "OFFER";
  const isInterview = toStage === "INTERVIEW";
  
  const headerBg   = isHired ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : 
                     isRejected ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : 
                     "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";

  const stageMessages = {
    SCREENING: "Our team is reviewing your application. We'll be in touch soon with next steps.",
    INTERVIEW: "Congratulations! We'd like to invite you for an interview. Our team will contact you shortly with scheduling details.",
    OFFER: "Great news! We're preparing an offer for you. Our HR team will reach out with details soon.",
    HIRED: "Welcome to the team! We're thrilled to have you join us. You'll receive onboarding information shortly.",
    REJECTED: "While we've decided to move forward with other candidates, we appreciate your interest and wish you the best in your job search."
  };

  return wrap(
    headerBg,
    `
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">Application Update</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">${organizationName}</p>
    `,
    `
    <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      We have an update regarding your application for <strong>${jobTitle}</strong> at <strong>${organizationName}</strong>.
    </p>

    <!-- Status Change Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:12px;border:2px solid #e5e7eb;overflow:hidden;">
      <tr>
        <td style="padding:28px 24px;text-align:center;">
          <p style="margin:0 0 20px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status Update</p>
          
          <!-- From Stage -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 16px;">
            <tr>
              <td style="background:${from.bg};color:${from.color};padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;">
                ${from.emoji} ${from.label}
              </td>
            </tr>
          </table>

          <!-- Arrow -->
          <div style="margin:0 0 16px;">
            <span style="font-size:24px;color:#9ca3af;">↓</span>
          </div>

          <!-- To Stage -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
            <tr>
              <td style="background:${to.bg};color:${to.color};padding:14px 28px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                ${to.emoji} ${to.label}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Stage-specific Message -->
    ${stageMessages[toStage] ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:${isHired ? '#ecfdf5' : isRejected ? '#fef2f2' : isOffer ? '#f0fdf4' : '#f5f3ff'};border-radius:10px;border-left:4px solid ${isHired ? '#10b981' : isRejected ? '#ef4444' : isOffer ? '#22c55e' : '#8b5cf6'};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-weight:500;">${stageMessages[toStage]}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Note from Team -->
    ${note ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:12px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">💬 Message from the Team</p>
          <p style="margin:0;font-size:14px;color:#78350f;line-height:1.7;">${note}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Job Details -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;">Application Details:</p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">💼 Position: <strong>${jobTitle}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">🏢 Company: <strong>${organizationName}</strong></p>
          <p style="margin:0;font-size:13px;color:#6b7280;">📅 Updated: <strong>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></p>
        </td>
      </tr>
    </table>

    ${isHired ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td style="text-align:center;">
          <p style="margin:0;font-size:32px;">🎊 🎉 🎊</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">
      ${isRejected ? 'We encourage you to apply for other positions that match your skills.' : 'Thank you for your patience throughout this process.'}
    </p>
    `
  );
};

// ─── 4. OTP Verification Email ────────────────────────────────────────────────
const buildOTPHtml = ({ email, otp }) => {
  return wrap(
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    `
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">Verify Your Email</h1>
    <p style="color:#fef3c7;margin:8px 0 0;font-size:15px;">Complete your HireLens registration</p>
    `,
    `
    <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hello! 👋
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Thank you for signing up with <strong>HireLens</strong>. To complete your registration, please verify your email address using the code below.
    </p>

    <!-- OTP Code Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="text-align:center;padding:32px 20px;background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);border-radius:12px;border:2px solid #f59e0b;">
          <p style="margin:0 0 12px;font-size:13px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
          <div style="display:inline-block;background:#ffffff;padding:20px 40px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);margin:0 0 12px;">
            <span style="font-size:36px;font-weight:700;color:#d97706;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</span>
          </div>
          <p style="margin:0;font-size:12px;color:#92400e;">⏰ This code expires in <strong>10 minutes</strong></p>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:#fef2f2;border-radius:10px;border-left:4px solid #ef4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#991b1b;font-weight:600;">🔒 Security Notice</p>
          <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">Never share this code with anyone. HireLens will never ask for your verification code via phone or email.</p>
        </td>
      </tr>
    </table>

    <!-- Details -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Verification Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📧 Email: <strong>${email}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📅 Requested: <strong>${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</strong></p>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </td>
      </tr>
    </table>
    `
  );
};

// ─── Public send functions ────────────────────────────────────────────────────

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async ({ email, otp }) => {
  if (!apiInstance) {
    console.warn("[Email] Brevo not configured - skipping OTP email to", email);
    return { success: false, error: "Brevo not configured" };
  }

  try {
    console.log(`[Email] Sending OTP email to ${email}...`);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = `Your HireLens Verification Code: ${otp}`;
    sendSmtpEmail.htmlContent = buildOTPHtml({ email, otp });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`[Email] OTP sent to ${email} (id: ${data.messageId})`);
    return { success: true, id: data.messageId };
  } catch (err) {
    console.error("[Email] Failed to send OTP email:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send team invitation email
 */
export const sendInviteEmail = async ({ email, role, organizationName, inviteUrl, expiresAt }) => {
  if (!apiInstance) {
    console.warn("[Email] Brevo not configured - skipping invite email to", email);
    return { success: false, error: "Brevo not configured" };
  }

  try {
    console.log(`[Email] Sending invite email to ${email}...`);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = `You're invited to join ${organizationName} on HireLens`;
    sendSmtpEmail.htmlContent = buildInviteHtml({ email, role, organizationName, inviteUrl, expiresAt });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`[Email] Invite sent to ${email} (id: ${data.messageId})`);
    return { success: true, id: data.messageId };
  } catch (err) {
    console.error("[Email] Failed to send invite email:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send interview scheduled email to the interviewer
 */
export const sendInterviewScheduledEmail = async ({ interviewerEmail, interviewerName, candidateName, jobTitle, scheduledAt, organizationName }) => {
  if (!apiInstance) {
    console.warn("[Email] Brevo not configured - skipping interview email to", interviewerEmail);
    return { success: false, error: "Brevo not configured" };
  }

  try {
    console.log(`[Email] Sending interview scheduled email to ${interviewerEmail}...`);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM };
    sendSmtpEmail.to = [{ email: interviewerEmail }];
    sendSmtpEmail.subject = `Interview Scheduled: ${candidateName} for ${jobTitle}`;
    sendSmtpEmail.htmlContent = buildInterviewScheduledHtml({ interviewerName, candidateName, jobTitle, scheduledAt, organizationName });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`[Email] Interview scheduled email sent to ${interviewerEmail} (id: ${data.messageId})`);
    return { success: true, id: data.messageId };
  } catch (err) {
    console.error("[Email] Failed to send interview email:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send candidate stage change email to the candidate
 */
export const sendStageChangeEmail = async ({ candidateEmail, candidateName, jobTitle, fromStage, toStage, organizationName, note }) => {
  // Only email if candidate has an email address
  if (!candidateEmail) return { success: false, error: "No candidate email" };

  if (!apiInstance) {
    console.warn("[Email] Brevo not configured - skipping stage change email to", candidateEmail);
    return { success: false, error: "Brevo not configured" };
  }

  try {
    console.log(`[Email] Sending stage change email to ${candidateEmail}...`);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM };
    sendSmtpEmail.to = [{ email: candidateEmail }];
    sendSmtpEmail.subject = `Application Update: ${jobTitle} at ${organizationName}`;
    sendSmtpEmail.htmlContent = buildStageChangeHtml({ candidateName, jobTitle, fromStage, toStage, organizationName, note });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`[Email] Stage change email sent to ${candidateEmail} (id: ${data.messageId})`);
    return { success: true, id: data.messageId };
  } catch (err) {
    console.error("[Email] Failed to send stage change email:", err.message);
    return { success: false, error: err.message };
  }
};
