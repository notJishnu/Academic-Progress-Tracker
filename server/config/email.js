import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter from env vars.
 * Supports Gmail (with App Password) and any SMTP provider.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Sends a password reset email with a styled HTML template.
 * @param {string} to  - Recipient email
 * @param {string} resetUrl - Full reset link
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
    </head>
    <body style="margin:0;padding:0;background:#f3fbf6;font-family:system-ui,-apple-system,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3fbf6;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #c9ebd6;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:#253D2C;padding:28px 32px;text-align:center;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:#CFFFDC;letter-spacing:-0.5px;">Eduva</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#68BA7F;">Academic Progress Tracker</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#253D2C;">Reset your password</h2>
                  <p style="margin:0 0 24px;font-size:14px;color:#477e57;line-height:1.6;">
                    We received a request to reset your Eduva password. Click the button below to set a new one.
                    This link expires in <strong>1 hour</strong>.
                  </p>
                  <a href="${resetUrl}"
                    style="display:block;width:100%;box-sizing:border-box;text-align:center;background:#2E6F40;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 0;border-radius:12px;">
                    Reset Password
                  </a>
                  <p style="margin:24px 0 0;font-size:12px;color:#68BA7F;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email — your password won't change.<br/><br/>
                    Or paste this URL in your browser:<br/>
                    <span style="color:#2E6F40;word-break:break-all;">${resetUrl}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f3fbf6;padding:16px 32px;text-align:center;border-top:1px solid #c9ebd6;">
                  <p style="margin:0;font-size:11px;color:#68BA7F;">© ${new Date().getFullYear()} Eduva · Academic Progress Tracker</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Eduva" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your Eduva password",
    html,
  });
};
