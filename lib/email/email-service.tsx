import nodemailer from "nodemailer";
const fromName = process.env.MAIL_FROM_NAME;
const fromEmail = process.env.SMTP_USER;

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
    from: `"${fromName}" <${fromEmail}>`,
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
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: htmlContent,
  });
};

export const sendInstructionCodeEmail = async (email: string, code: string, credits: number) => {
  const transporter = getTransporter();
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Your Instruction Code</h2>
    <p>Thanks for your purchase. Use the code below to add ${credits} credits to your account.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f8f9fa; border: 2px dashed #C5B4A3;
                  padding: 20px; border-radius: 10px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; color: #C5B4A3;
                     letter-spacing: 5px;">${code}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 14px;">
      Enter this code in the “Instruction Code” popup inside your dashboard.
    </p>
  </div>`;
  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Your Woven Art Instruction Code",
    html: htmlContent,
  });
};

export const sendContactEmail = async (name: string, email: string, message: string) => {
  const transporter = getTransporter();
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #C5B4A3; font-size: 32px; margin: 0; font-weight: 300;">Woven Art</h1>
      <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Turn your memories into art</p>
    </div>
    
    <div style="background-color: #f8f9fa; border: 2px dashed #C5B4A3; 
                padding: 30px; border-radius: 10px; margin: 20px 0;">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">New Contact Form Submission</h2>
      
      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #666; font-size: 14px; font-weight: 600;">FROM:</p>
        <p style="margin: 0; color: #333; font-size: 16px;">${name}</p>
        <p style="margin: 0; color: #C5B4A3; font-size: 14px;">${email}</p>
      </div>
      
      <div>
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">MESSAGE:</p>
        <div style="background-color: white; padding: 15px; border-radius: 8px; 
                    border-left: 4px solid #C5B4A3;">
          <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        This message was sent from the Woven Art contact form
      </p>
      <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
        Reply directly to this email to respond to ${name}
      </p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: "contact@wovenart.store",
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: htmlContent,
  });
};
