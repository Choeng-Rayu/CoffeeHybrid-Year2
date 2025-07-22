import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { emailLogger } from '../middleWare/activityLogger.js';

dotenv.config();

// Create transporter using Gmail with multiple fallback configurations
const createTransporter = async () => {
  const rawPass = process.env.GMAIL_APP_PASSWORD || '';
  const trimmedPass = rawPass.replace(/\s/g, '');
  console.log('🔍 Raw GMAIL_APP_PASSWORD:', rawPass);
  console.log('🔑 Trimmed GMAIL_APP_PASSWORD length:', trimmedPass.length);
  // Create a Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: trimmedPass
    }
  });
  // Verify connection
  await transporter.verify();
  console.log('✅ Gmail transporter verified');
  return transporter;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  // Check if we're explicitly mocking email send (mock only when MOCK_EMAIL=true)
  const mockEmail = process.env.MOCK_EMAIL === 'true';

  if (mockEmail) {
    console.log('🧪 Development mode: Simulating email send...');
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log('📧 Email would be sent to:', email);
    console.log('👤 User:', userName);
    console.log('🔗 Reset URL:', resetUrl);
    console.log('⏰ Token expires in: 60 seconds');
    console.log('✅ Mock email sent successfully!');

    // Log the mock email
    emailLogger.logEmailSent(
      email,
      'Password Reset Request - Coffee Hybrid',
      true,
      'mock-' + Date.now(),
      null
    );

    return {
      success: true,
      messageId: 'mock-' + Date.now(),
      message: 'Password reset email sent successfully. Please check your email.',
      resetUrl: resetUrl // Include for development testing
    };
  }

  try {
    console.log('🚀 Starting email send process...');
    const transporter = await createTransporter();
    
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: 'Coffee Hybrid',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - Coffee Hybrid',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .coffee-icon {
              font-size: 40px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .content p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
              font-size: 16px;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
              color: white;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: all 0.3s ease;
            }
            .reset-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .expiry-notice {
              color: #dc3545;
              font-weight: 600;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="coffee-icon">☕</div>
              <h1>Coffee Hybrid</h1>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${userName || 'Valued Customer'},</p>
              <p>We received a request to reset the password for your Coffee Hybrid account associated with <strong>${email}</strong>.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="${resetUrl}" class="reset-button">Reset My Password</a>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This reset link will expire in <strong>60 seconds</strong> for security reasons.
              </div>
              
              <p class="expiry-notice">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${resetUrl}
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated email from Coffee Hybrid. Please do not reply to this email.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>© 2025 Coffee Hybrid. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);

    // Log successful email send
    emailLogger.logEmailSent(
      email,
      'Password Reset Request - Coffee Hybrid',
      true,
      result.messageId,
      null
    );

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.error('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
      command: error.command
    });

    // Log failed email attempt
    emailLogger.logEmailSent(
      email,
      'Password Reset Request - Coffee Hybrid',
      false,
      null,
      error
    );

    // Provide more specific error messages
    if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to email server. Please check your internet connection and try again.');
    } else if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials.');
    } else {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = await createTransporter();
    console.log('✅ Email configuration is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};
