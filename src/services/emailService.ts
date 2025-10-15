import Mailjet from 'node-mailjet';

export interface EmailVerificationData {
  email: string;
  fullName: string;
  verificationCode: string;
}

export interface OwnerApplicationStatusEmailData {
  email: string;
  fullName: string;
  propertyName: string;
  status: 'approved' | 'rejected' | string;
}

class EmailService {
  private mailjet: Mailjet;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.MAILJET_API_KEY;
    const secretKey = process.env.MAILJET_SECRET_KEY;
    const fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@hosfind.com';
    const fromName = process.env.MAILJET_FROM_NAME || 'HosFind';

    if (!apiKey || !secretKey) {
      throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY are required');
    }

    this.mailjet = new Mailjet({
      apiKey: apiKey,
      apiSecret: secretKey,
    });

    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      console.log('📧 [EMAIL] Sending verification email to:', data.email);

      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName,
            },
            To: [
              {
                Email: data.email,
                Name: data.fullName,
              },
            ],
            Subject: 'Verify Your MyHostel Account',
            TextPart: this.getVerificationEmailText(data),
            HTMLPart: this.getVerificationEmailTemplate(data),
          },
        ],
      });

      const response = await request;

      console.log('✅ [EMAIL] Verification email sent successfully:', response.body);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send verification email:', error);
      return false;
    }
  }

  async sendOwnerApplicationStatusEmail(data: OwnerApplicationStatusEmailData): Promise<boolean> {
    try {
      const isApproved = String(data.status).toLowerCase() === 'approved';
      const subject = isApproved
        ? 'Swift Stay Partner Application Approved'
        : 'Swift Stay Partner Application Update';
      const html = isApproved
        ? this.getOwnerApplicationApprovedTemplate(data)
        : this.getOwnerApplicationRejectedTemplate(data);

      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: { Email: this.fromEmail, Name: this.fromName },
            To: [{ Email: data.email, Name: data.fullName }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });

      const response = await request;
      console.log('✅ [EMAIL] Owner application status email sent:', response.body);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send owner application status email:', error);
      return false;
    }
  }

  private getOwnerApplicationApprovedTemplate(data: OwnerApplicationStatusEmailData): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111827;"> 
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background: linear-gradient(135deg,#22c55e,#06b6d4); padding: 24px; color: white;">
            <h2 style="margin: 0;">Swift Stay</h2>
          </div>
          <div style="padding: 28px;">
            <p>Hi <strong>${data.fullName}</strong>,</p>
            <p>Great news! Your partner application for <strong>${data.propertyName}</strong> has been <strong>approved</strong>.</p>
            <p>Our team will reach out shortly with next steps to help you list and manage your property on Swift Stay.</p>
            <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">Thank you for partnering with us.</p>
          </div>
        </div>
      </div>
    `;
  }

  private getOwnerApplicationRejectedTemplate(data: OwnerApplicationStatusEmailData): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111827;"> 
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background: linear-gradient(135deg,#ef4444,#f59e0b); padding: 24px; color: white;">
            <h2 style="margin: 0;">Swift Stay</h2>
          </div>
          <div style="padding: 28px;">
            <p>Hi <strong>${data.fullName}</strong>,</p>
            <p>Thank you for your interest in partnering with Swift Stay. After careful review, your application for <strong>${data.propertyName}</strong> was not approved at this time.</p>
            <p>You can reply to this email for feedback or reapply in the future with updated details. We appreciate your time.</p>
            <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">Best regards, The Swift Stay Team</p>
          </div>
        </div>
      </div>
    `;
  }

  private getVerificationEmailTemplate(data: EmailVerificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Swift Stay Account</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: #ffffff;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #e74c3c;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 20px;
            }
            .verification-code {
              background-color: #f8f9fa;
              border: 2px solid #e74c3c;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #e74c3c;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .instructions {
              background-color: #e8f4fd;
              border-left: 4px solid #3498db;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #e74c3c;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
                <div class="header">
                  <div class="logo">Swift Stay</div>
                  <h1 class="title">Verify Your Account</h1>
                </div>

                <p>Hello <strong>${data.fullName}</strong>,</p>

                <p>Welcome to Swift Stay! To complete your account setup, please verify your email address using the verification code below:</p>
            
            <div class="verification-code">
              <div class="code">${data.verificationCode}</div>
            </div>
            
                <div class="instructions">
                  <strong>Instructions:</strong>
                  <ul>
                    <li>Enter this 4-digit code in the Swift Stay app</li>
                    <li>The code will expire in 10 minutes</li>
                    <li>If you didn't create an account, please ignore this email</li>
                  </ul>
                </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Swift Stay Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getVerificationEmailText(data: EmailVerificationData): string {
    return `
      Swift Stay - Verify Your Account

      Hello ${data.fullName},

      Welcome to MyHostel! To complete your account setup, please verify your email address using the verification code below:

      Verification Code: ${data.verificationCode}

      Instructions:
      - Enter this 4-digit code in the MyHostel app
      - The code will expire in 10 minutes
      - If you didn't create an account, please ignore this email

      If you have any questions or need assistance, please don't hesitate to contact our support team.

      Best regards,
      The MyHostel Team

      This is an automated message. Please do not reply to this email.
    `;
  }
}

export default new EmailService();