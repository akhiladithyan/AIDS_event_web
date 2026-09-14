import nodemailer from 'nodemailer';

let transporter = null;

// Initialize transporter if SMTP credentials exist
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Sends participant credentials and event pass receipt email
 */
export async function sendRegistrationEmail({ toEmail, studentName, teamName, eventTitle, userId, password, qrToken, teamId }) {
  if (!toEmail) return false;

  const subject = `🚀 [NEXATHON 2026] Registration Confirmed: ${eventTitle} (${teamId || 'SOLO'})`;
  const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #050806; color: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #39ff88;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #39ff88; margin: 0; font-size: 24px; letter-spacing: 2px;">NEXATHON 2026</h1>
        <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 13px;">OFFICIAL EVENT PASSPORT RECEIPT</p>
      </div>
      
      <div style="background-color: #0b1510; border: 1px solid rgba(57,255,136,0.3); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello ${studentName},</h2>
        <p style="color: #cbd5e0; font-size: 14px; line-height: 1.5;">
          Your registration for <strong>${eventTitle}</strong> has been received! Below are your official access credentials. Please keep them safe for check-in on event day.
        </p>

        <div style="background-color: #050806; border-left: 4px solid #39ff88; padding: 12px; margin: 15px 0; font-family: monospace;">
          <p style="margin: 4px 0; color: #39ff88;"><strong>Team ID:</strong> ${teamId || 'N/A'}</p>
          <p style="margin: 4px 0; color: #ffffff;"><strong>Team Name:</strong> ${teamName || 'Solo'}</p>
          <p style="margin: 4px 0; color: #39ff88;"><strong>Student User ID:</strong> ${userId}</p>
          <p style="margin: 4px 0; color: #ffffff;"><strong>Portal Password:</strong> ${password}</p>
          <p style="margin: 4px 0; color: #a0aec0; word-break: break-all;"><strong>Digital QR Token:</strong> ${qrToken}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${portalUrl}" style="background-color: #39ff88; color: #050806; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block; letter-spacing: 1px;">
          OPEN STUDENT DIGITAL PASS PORTAL &rarr;
        </a>
      </div>

      <p style="color: #718096; font-size: 11px; text-align: center; margin-top: 20px;">
        © 2026 NEXATHON / AIDEX Symposium. For support, contact aidex26.vtmt@gmail.com
      </p>
    </div>
  `;

  try {
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"NEXATHON 2026" <noreply@nexathon2026.org>',
        to: toEmail,
        subject,
        html
      });
      console.log(`📧 Registration email successfully sent to ${toEmail}`);
      return true;
    } else {
      console.log(`📧 [Mock SMTP] Registration email generated for ${toEmail} | User: ${userId} | Pass: ${password}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to send registration email to ${toEmail}:`, error.message);
    return false;
  }
}

export const sendRegistrationSuccessEmail = sendRegistrationEmail;

