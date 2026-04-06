import { Resend } from "resend";
const RESEND_API_KEY =
  (process.env.RESEND_API_KEY as string) ||
  "re_UnbMd7D2_NrJ4Kq9gbN3B8U2ceKHpu1HV";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const resend = new Resend(RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  try {
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 20px; display:flex; justify-content:start; gap:10px; align-items:center">
      <img src="https://res.cloudinary.com/dcdynkm5d/image/upload/v1765807035/logo_xlwtpm.png" alt="Woven Art Logo" 
           style="max-width: 120px; margin-bottom: 10px;" />
    </div>
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>You requested a password reset for your account.</p>
    <p>Use the following OTP code to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f8f9fa; border: 2px dashed #b32053; 
                  padding: 20px; border-radius: 10px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; color: #b32053; 
                     letter-spacing: 5px;">${otp}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 14px;">
      This OTP will expire in 10 minutes. If you didn't request this reset, please ignore this email.
    </p>
  </div>
`;

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Password Reset OTP",
      html: htmlContent,
    });

    console.log("Password reset OTP sent to", email, "- data:", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendNewReservationUserEmail = async (to: string, payload: {
  bookingId: string;
  activityTitle: string;
  dateText: string;
  participantsText: string;
  amount: number;
  currency: string;
  link: string;
}) => {
  const subject = `Reservation Created: #${payload.bookingId}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom: 16px;">
      <img src="https://res.cloudinary.com/dcdynkm5d/image/upload/v1765807035/logo_xlwtpm.png" alt="Woven Art Logo" style="max-width: 120px;" />
    </div>
    <h2 style="color:#000; margin:0 0 8px;">Your Reservation is Created</h2>
    <p style="color:#000; margin:0 0 12px;">Thank you for your reservation. Here are your details:</p>
    <div style="background:#f8f9fa; border:1px solid #eee; border-radius:10px; padding:16px; margin-bottom:16px;">
      <p style="margin:6px 0;"><strong>Booking ID:</strong> #${payload.bookingId}</p>
      <p style="margin:6px 0;"><strong>Tour:</strong> ${payload.activityTitle}</p>
      <p style="margin:6px 0;"><strong>Date:</strong> ${payload.dateText}</p>
      <p style="margin:6px 0;"><strong>Participants:</strong> ${payload.participantsText}</p>
      <p style="margin:6px 0;"><strong>Total:</strong> ${payload.currency}${payload.amount}</p>
      <p style="margin:6px 0;"><strong>Status:</strong> Pending</p>
    </div>
    <div style="text-align:center;">
      <a href="${payload.link}" style="display:inline-block; background:#B32053; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px;">View Booking</a>
    </div>
  </div>`;
  let resp = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  console.log("resp-----", resp);
};

export const sendNewReservationVendorEmail = async (to: string, payload: {
  bookingId: string;
  activityTitle: string;
  customerName: string;
  dateText: string;
  participantsText: string;
  amount: number;
  currency: string;
  link: string;
}) => {
  const subject = `New Reservation: #${payload.bookingId}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom: 16px;">
      <img src="https://res.cloudinary.com/dcdynkm5d/image/upload/v1765807035/logo_xlwtpm.png" alt="Woven Art Logo" style="max-width: 120px;" />
    </div>
    <h2 style="color:#000; margin:0 0 8px;">New Reservation Received</h2>
    <p style="color:#000; margin:0 0 12px;">A new reservation has been created. Here are the details:</p>
    <div style="background:#f8f9fa; border:1px solid #eee; border-radius:10px; padding:16px; margin-bottom:16px;">
      <p style="margin:6px 0;"><strong>Booking ID:</strong> #${payload.bookingId}</p>
      <p style="margin:6px 0;"><strong>Tour:</strong> ${payload.activityTitle}</p>
      <p style="margin:6px 0;"><strong>Customer:</strong> ${payload.customerName}</p>
      <p style="margin:6px 0;"><strong>Date:</strong> ${payload.dateText}</p>
      <p style="margin:6px 0;"><strong>Participants:</strong> ${payload.participantsText}</p>
      <p style="margin:6px 0;"><strong>Amount:</strong> ${payload.currency}${payload.amount}</p>
      <p style="margin:6px 0;"><strong>Status:</strong> Pending</p>
    </div>
    <div style="text-align:center;">
      <a href="${payload.link}" style="display:inline-block; background:#B32053; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px;">View Reservations</a>
    </div>
  </div>`;
  let resp =  await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  console.log("resp-----", resp);

};

export const sendVerificationEmail = async (email: string, otp: string) => {
  try {
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 20px; display:flex; justify-content:start; gap:10px; align-items:center">
      <img src="https://res.cloudinary.com/dcdynkm5d/image/upload/v1765807035/logo_xlwtpm.png" alt="Woven Art Logo" 
           style="max-width: 120px; margin-bottom: 10px;" />
    </div>
    <h2 style="color: #333;">Welcome! Please Verify Your Email</h2>
    <p>Thank you for signing up! Please verify your email address using the OTP code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f8f9fa; border: 2px dashed #b32053; 
                  padding: 20px; border-radius: 10px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; color: #b32053; 
                     letter-spacing: 5px;">${otp}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 14px;">
      This OTP will expire in 10 minutes. If you didn't create this account, please ignore this email.
    </p>
  </div>
`;

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify Your Email Address",
      html: htmlContent,
    });
    console.log("Verification OTP sent to", email, "- data:", data);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
