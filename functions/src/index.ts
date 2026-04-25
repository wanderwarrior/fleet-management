import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const ADMIN_EMAIL = "reenasharma.se@gmail.com";

const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD!;

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
}

// ── Notify admin of new registration ─────────────────────────
export const sendApprovalRequestEmail = functions.https.onCall(async (request) => {
  const { userEmail, userName, uid, token, appUrl } = request.data as {
    userEmail: string;
    userName: string;
    uid: string;
    token: string;
    appUrl: string;
  };

  const acceptUrl = `${appUrl}/approve?uid=${uid}&action=accept&token=${token}`;
  const rejectUrl = `${appUrl}/approve?uid=${uid}&action=reject&token=${token}`;
  const gmailUser = GMAIL_USER;

  await getTransporter().sendMail({
    from: `"Fleet Manager" <${gmailUser}>`,
    to: ADMIN_EMAIL,
    subject: `New Registration Request — ${userName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111827;color:#e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1d4ed8;padding:24px 32px">
          <h1 style="margin:0;font-size:20px;color:#fff">New User Registration</h1>
        </div>
        <div style="padding:32px;line-height:1.6">
          <p style="margin:0 0 8px">A new user has registered on <strong>Fleet Manager</strong> and is awaiting your approval.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#1f2937;border-radius:8px;overflow:hidden">
            <tr><td style="padding:10px 16px;color:#9ca3af;width:40%">Name</td><td style="padding:10px 16px;color:#f3f4f6"><strong>${userName}</strong></td></tr>
            <tr style="background:#111827"><td style="padding:10px 16px;color:#9ca3af">Email</td><td style="padding:10px 16px;color:#f3f4f6">${userEmail}</td></tr>
            <tr><td style="padding:10px 16px;color:#9ca3af">Registered</td><td style="padding:10px 16px;color:#f3f4f6">${new Date().toLocaleString("en-IN")}</td></tr>
          </table>
          <p style="margin:24px 0 8px;color:#9ca3af;font-size:14px">Take action:</p>
          <div>
            <a href="${acceptUrl}" style="display:inline-block;padding:12px 28px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-right:12px">✓ Accept</a>
            <a href="${rejectUrl}" style="display:inline-block;padding:12px 28px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">✗ Reject</a>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#6b7280">Each link works only once. The user will be notified automatically after your action.</p>
        </div>
      </div>
    `,
  });

  return { success: true };
});

// ── Notify user of approve/reject decision ────────────────────
export const sendUserDecisionEmail = functions.https.onCall(async (request) => {
  const { userEmail, userName, status } = request.data as {
    userEmail: string;
    userName: string;
    status: "approved" | "rejected";
  };

  const isApproved = status === "approved";
  const gmailUser = GMAIL_USER;
  const appUrl = "https://fleet-manager-10029.web.app";

  await getTransporter().sendMail({
    from: `"Fleet Manager" <${gmailUser}>`,
    to: userEmail,
    subject: isApproved
      ? "Your Fleet Manager account has been approved"
      : "Your Fleet Manager registration was not approved",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111827;color:#e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:${isApproved ? "#059669" : "#dc2626"};padding:24px 32px">
          <h1 style="margin:0;font-size:20px;color:#fff">${isApproved ? "Account Approved 🎉" : "Registration Not Approved"}</h1>
        </div>
        <div style="padding:32px;line-height:1.6">
          <p>Hi <strong>${userName}</strong>,</p>
          ${isApproved
            ? `<p>Your <strong>Fleet Manager</strong> account has been <span style="color:#34d399;font-weight:600">approved</span>. You can now log in and start using the platform.</p>
               <a href="${appUrl}/login" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Log In Now</a>`
            : `<p>Unfortunately, your <strong>Fleet Manager</strong> account registration has been <span style="color:#f87171;font-weight:600">rejected</span>.</p>
               <p>If you believe this is a mistake, please contact the administrator at <a href="mailto:${ADMIN_EMAIL}" style="color:#60a5fa">${ADMIN_EMAIL}</a>.</p>`
          }
        </div>
        <div style="padding:16px 32px;background:#1f2937;font-size:12px;color:#6b7280">
          Fleet Manager &mdash; automated notification
        </div>
      </div>
    `,
  });

  return { success: true };
});
