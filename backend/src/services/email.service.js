const nodemailer = require("nodemailer");

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465,
  secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === "true" : true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verify failed:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

/**
 * Generate a random 6-digit OTP
 * @returns {String} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email with OTP
 * @param {String} email - User's email address
 * @param {String} otp - One-time password
 * @param {String} username - User's username
 * @returns {Promise} Email sending result
 */
async function sendVerificationEmail(email, otp, username) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Email Verification - ShopFlow",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">ShopFlow</h1>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Welcome to ShopFlow! To complete your registration, please verify your email address using the OTP below:
          </p>
          
          <div style="background-color: #7c3aed; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="color: white; font-size: 14px; margin: 0; margin-bottom: 10px;">Your Verification Code:</p>
            <p style="color: white; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            This OTP will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">
            Best regards,<br>
            <strong>ShopFlow Team</strong>
          </p>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send password reset email
 * @param {String} email - User's email address
 * @param {String} resetToken - Reset token
 * @param {String} username - User's username
 * @returns {Promise} Email sending result
 */
async function sendPasswordResetEmail(email, resetToken, username) {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset - ShopFlow",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">ShopFlow</h1>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            You requested a password reset. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            This link will expire in <strong>1 hour</strong>. If you didn't request this, please ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">
            Best regards,<br>
            <strong>ShopFlow Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
