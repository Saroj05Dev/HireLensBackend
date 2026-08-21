import * as brevo from "@getbrevo/brevo";
import { SERVER_CONFIG } from "../config/server.config.js";

// Validate configuration on startup
if (!SERVER_CONFIG.BREVO_API_KEY) {
  console.warn("[Email] BREVO_API_KEY not configured - emails will not be sent");
}

// Initialize Brevo API client
let apiInstance: brevo.TransactionalEmailsApi | null = null;
if (SERVER_CONFIG.BREVO_API_KEY) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, SERVER_CONFIG.BREVO_API_KEY);
}

const FROM = SERVER_CONFIG.EMAIL_FROM;

const wrap = (headerBg: string, headerContent: string, bodyContent: string): string => `
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
                      <span style="font-size:28px;font-weight:bold;color:#0ea5e9;">HL</span>
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

interface InviteEmailParams {
  email: string;
  role: "RECRUITER" | "INTERVIEWER" | string;
  organizationName: string;
  inviteUrl: string;
  expiresAt: Date | string;
}

const buildInviteHtml = ({ email, role, organizationName, inviteUrl, expiresAt }: InviteEmailParams): string => {
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
  const expiry = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleDescriptions: Record<string, string> = {
    RECRUITER: "You'll be able to post jobs, manage candidates, assign interviews, and track the entire hiring pipeline.",
    INTERVIEWER: "You'll be able to review candidate profiles, conduct interviews, and submit feedback to help make hiring decisions.",
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
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Role</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${roleDescriptions[role] || "Welcome to the team."}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="text-align:center;">
          <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(102,126,234,0.3);">Accept Invitation →</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;color:#92400e;font-weight:600;">Can't click the button?</p>
          <p style="margin:0;font-size:13px;color:#78350f;word-break:break-all;line-height:1.5;">${inviteUrl}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Invitation Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Sent to: <strong>${email}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Expires: <strong>${expiry}</strong></p>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you weren't expecting this invitation, you can safely ignore this email.</p>
        </td>
      </tr>
    </table>
    `
  );
};

interface InterviewEmailParams {
  interviewerName: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date | string;
  organizationName: string;
}

const buildInterviewScheduledHtml = ({
  interviewerName,
  candidateName,
  jobTitle,
  scheduledAt,
  organizationName,
}: InterviewEmailParams): string => {
  const scheduledDate = new Date(scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const dayOfWeek = scheduledDate.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = scheduledDate.getDate();
  const month = scheduledDate.toLocaleDateString("en-US", { month: "short" });

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

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border-radius:12px;border:2px solid #0ea5e9;overflow:hidden;">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
            <tr>
              <td style="background:#0ea5e9;color:#ffffff;padding:12px 20px;border-radius:8px;text-align:center;min-width:80px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${month}</div>
                <div style="font-size:28px;font-weight:700;line-height:1;">${dayNum}</div>
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">${dayOfWeek}</div>
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">Candidate:</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${candidateName}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">Position:</td>
                    <td style="color:#0c4a6e;font-size:15px;font-weight:700;">${jobTitle}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #bae6fd;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color:#0c4a6e;font-size:13px;font-weight:600;width:100px;">Date:</td>
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

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px;font-size:14px;color:#111827;font-weight:600;">Next Steps:</p>
          <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
            <li>Review the candidate's profile and resume on HireLens</li>
            <li>Prepare interview questions based on the job requirements</li>
            <li>Conduct the interview at the scheduled time</li>
            <li>Submit your feedback and recommendation after the interview</li>
          </ul>
        </td>
      </tr>
    </table>

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

const STAGE_LABELS: Record<string, { label: string; bg: string; color: string; emoji?: string }> = {
  APPLIED: { label: "Applied", bg: "#f3f4f6", color: "#374151", emoji: "📌" },
  SCREENING: { label: "Screening", bg: "#fef3c7", color: "#92400e", emoji: "🔍" },
  INTERVIEW: { label: "Interview", bg: "#dbeafe", color: "#1e40af", emoji: "👥" },
  OFFER: { label: "Offer", bg: "#d1fae5", color: "#065f46", emoji: "🎉" },
  HIRED: { label: "Hired", bg: "#d1fae5", color: "#065f46", emoji: "🚀" },
  REJECTED: { label: "Not Selected", bg: "#fee2e2", color: "#991b1b", emoji: "✉️" },
};

interface StageChangeEmailParams {
  candidateName: string;
  jobTitle: string;
  fromStage: string;
  toStage: string;
  organizationName: string;
  note?: string;
}

const buildStageChangeHtml = ({
  candidateName,
  jobTitle,
  fromStage,
  toStage,
  organizationName,
  note,
}: StageChangeEmailParams): string => {
  const from = STAGE_LABELS[fromStage] || { label: fromStage, emoji: "📌", bg: "#f3f4f6", color: "#374151" };
  const to = STAGE_LABELS[toStage] || { label: toStage, emoji: "📌", bg: "#f3f4f6", color: "#374151" };
  const isHired = toStage === "HIRED";
  const isRejected = toStage === "REJECTED";
  const isOffer = toStage === "OFFER";

  const headerBg = isHired
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : isRejected
    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";

  const stageMessages: Record<string, string> = {
    SCREENING: "Our team is reviewing your application. We'll be in touch soon with next steps.",
    INTERVIEW: "Congratulations! We'd like to invite you for an interview. Our team will contact you shortly with scheduling details.",
    OFFER: "Great news! We're preparing an offer for you. Our HR team will reach out with details soon.",
    HIRED: "Welcome to the team! We're thrilled to have you join us. You'll receive onboarding information shortly.",
    REJECTED: "While we've decided to move forward with other candidates, we appreciate your interest and wish you the best in your job search.",
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

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;background:#f9fafb;border-radius:12px;border:2px solid #e5e7eb;overflow:hidden;">
      <tr>
        <td style="padding:28px 24px;text-align:center;">
          <p style="margin:0 0 20px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status Update</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 16px;">
            <tr>
              <td style="background:${from.bg};color:${from.color};padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;">
                ${from.emoji || "📌"} ${from.label}
              </td>
            </tr>
          </table>

          <div style="margin:0 0 16px;">
            <span style="font-size:24px;color:#9ca3af;">↓</span>
          </div>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
            <tr>
              <td style="background:${to.bg};color:${to.color};padding:14px 28px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                ${to.emoji || "📌"} ${to.label}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      stageMessages[toStage]
        ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:${isHired ? "#ecfdf5" : isRejected ? "#fef2f2" : isOffer ? "#f0fdf4" : "#f5f3ff"};border-radius:10px;border-left:4px solid ${isHired ? "#10b981" : isRejected ? "#ef4444" : isOffer ? "#22c55e" : "#8b5cf6"};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-weight:500;">${stageMessages[toStage]}</p>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    ${
      note
        ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:12px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">💬 Message from the Team</p>
          <p style="margin:0;font-size:14px;color:#78350f;line-height:1.7;">${note}</p>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Application Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Position: <strong>${jobTitle}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Company: <strong>${organizationName}</strong></p>
          <p style="margin:0;font-size:13px;color:#6b7280;">Updated: <strong>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">
      ${isRejected ? "We encourage you to apply for other positions that match your skills." : "Thank you for your patience throughout this process."}
    </p>
    `
  );
};

interface OTPEmailParams {
  email: string;
  otp: string;
  purpose?: "SIGNUP" | "PASSWORD_RESET" | string;
}

const buildOTPHtml = ({ email, otp, purpose = "SIGNUP" }: OTPEmailParams): string => {
  const isPasswordReset = purpose === "PASSWORD_RESET";

  return wrap(
    isPasswordReset
      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    `
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">${isPasswordReset ? "Reset Your Password" : "Verify Your Email"}</h1>
    <p style="color:${isPasswordReset ? "#fecaca" : "#fef3c7"};margin:8px 0 0;font-size:15px;">${isPasswordReset ? "Secure your HireLens account" : "Complete your HireLens registration"}</p>
    `,
    `
    <p style="color:#111827;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hello! 👋
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      ${
        isPasswordReset
          ? "We received a request to reset your password for your <strong>HireLens</strong> account. Use the code below to reset your password."
          : "Thank you for signing up with <strong>HireLens</strong>. To complete your registration, please verify your email address using the code below."
      }
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="text-align:center;padding:32px 20px;background:linear-gradient(135deg, ${isPasswordReset ? "#fef2f2" : "#fffbeb"} 0%, ${isPasswordReset ? "#fecaca" : "#fef3c7"} 100%);border-radius:12px;border:2px solid ${isPasswordReset ? "#ef4444" : "#f59e0b"};">
          <p style="margin:0 0 12px;font-size:13px;color:${isPasswordReset ? "#991b1b" : "#92400e"};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your ${isPasswordReset ? "Reset" : "Verification"} Code</p>
          <div style="display:inline-block;background:#ffffff;padding:20px 40px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);margin:0 0 12px;">
            <span style="font-size:36px;font-weight:700;color:${isPasswordReset ? "#dc2626" : "#d97706"};letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</span>
          </div>
          <p style="margin:0;font-size:12px;color:${isPasswordReset ? "#991b1b" : "#92400e"};">⏰ This code expires in <strong>10 minutes</strong></p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;background:#fef2f2;border-radius:10px;border-left:4px solid #ef4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#991b1b;font-weight:600;">🔒 Security Notice</p>
          <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">${
            isPasswordReset
              ? "If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security."
              : "Never share this code with anyone. HireLens will never ask for your verification code via phone or email."
          }</p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid #e5e7eb;padding-top:20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>${isPasswordReset ? "Reset" : "Verification"} Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: <strong>${email}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Requested: <strong>${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</strong></p>
          ${
            isPasswordReset
              ? '<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you didn\'t request this code, your account is still secure. You can safely ignore this email.</p>'
              : '<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you didn\'t request this code, please ignore this email or contact support if you have concerns.</p>'
          }
        </td>
      </tr>
    </table>
    `
  );
};

export const sendOTPEmail = async ({ email, otp, purpose = "SIGNUP" }: OTPEmailParams) => {
  if (!apiInstance) {
    console.warn("[Email] Brevo not configured - skipping OTP email to", email);
    return { success: false, error: "Brevo not configured" };
  }

  try {
    console.log(`[Email] Sending ${purpose} OTP email to ${email}...`);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject =
      purpose === "PASSWORD_RESET"
        ? `Your HireLens Password Reset Code: ${otp}`
        : `Your HireLens Verification Code: ${otp}`;
    sendSmtpEmail.htmlContent = buildOTPHtml({ email, otp, purpose });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = (data.body as { messageId?: string })?.messageId || "unknown";

    console.log(`[Email] ${purpose} OTP sent to ${email} (id: ${messageId})`);
    return { success: true, id: messageId };
  } catch (err: any) {
    console.error("[Email] Failed to send OTP email:", err.message);
    return { success: false, error: err.message };
  }
};

export const sendInviteEmail = async ({
  email,
  role,
  organizationName,
  inviteUrl,
  expiresAt,
}: InviteEmailParams) => {
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
    const messageId = (data.body as { messageId?: string })?.messageId || "unknown";

    console.log(`[Email] Invite sent to ${email} (id: ${messageId})`);
    return { success: true, id: messageId };
  } catch (err: any) {
    console.error("[Email] Failed to send invite email:", err.message);
    return { success: false, error: err.message };
  }
};

interface InterviewScheduleParams {
  interviewerEmail: string;
  interviewerName: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date | string;
  organizationName: string;
}

export const sendInterviewScheduledEmail = async ({
  interviewerEmail,
  interviewerName,
  candidateName,
  jobTitle,
  scheduledAt,
  organizationName,
}: InterviewScheduleParams) => {
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
    sendSmtpEmail.htmlContent = buildInterviewScheduledHtml({
      interviewerName,
      candidateName,
      jobTitle,
      scheduledAt,
      organizationName,
    });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = (data.body as { messageId?: string })?.messageId || "unknown";

    console.log(`[Email] Interview scheduled email sent to ${interviewerEmail} (id: ${messageId})`);
    return { success: true, id: messageId };
  } catch (err: any) {
    console.error("[Email] Failed to send interview email:", err.message);
    return { success: false, error: err.message };
  }
};

interface SendStageChangeEmailParams {
  candidateEmail?: string;
  candidateName: string;
  jobTitle: string;
  fromStage: string;
  toStage: string;
  organizationName: string;
  note?: string;
}

export const sendStageChangeEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  fromStage,
  toStage,
  organizationName,
  note,
}: SendStageChangeEmailParams) => {
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
    sendSmtpEmail.htmlContent = buildStageChangeHtml({
      candidateName,
      jobTitle,
      fromStage,
      toStage,
      organizationName,
      note,
    });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = (data.body as { messageId?: string })?.messageId || "unknown";

    console.log(`[Email] Stage change email sent to ${candidateEmail} (id: ${messageId})`);
    return { success: true, id: messageId };
  } catch (err: any) {
    console.error("[Email] Failed to send stage change email:", err.message);
    return { success: false, error: err.message };
  }
};