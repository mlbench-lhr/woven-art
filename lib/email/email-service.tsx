import nodemailer from "nodemailer";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  const transporter = getTransporter();
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>You requested a password reset for your account.</p>
    <p>Use the following OTP code to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f8f9fa; border: 2px dashed #C5B4A3; 
                  padding: 20px; border-radius: 10px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; color: #C5B4A3; 
                     letter-spacing: 5px;">${otp}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 14px;">
      This OTP will expire in 10 minutes. If you didn't request this reset, please ignore this email.
    </p>
  </div>`;
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Password Reset OTP",
    html: htmlContent,
  });
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  const transporter = getTransporter();
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Welcome! Please Verify Your Email</h2>
    <p>Thank you for signing up! Please verify your email address using the OTP code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f8f9fa; border: 2px dashed #C5B4A3; 
                  padding: 20px; border-radius: 10px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; color: #C5B4A3; 
                     letter-spacing: 5px;">${otp}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 14px;">
      This OTP will expire in 10 minutes. If you didn't create this account, please ignore this email.
    </p>
  </div>`;
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Verify Your Email Address",
    html: htmlContent,
  });
};
