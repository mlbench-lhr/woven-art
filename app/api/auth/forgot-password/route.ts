import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
import { generateOTP, getOTPExpiryTime } from "@/lib/auth/otp";
import { sendPasswordResetEmail } from "@/lib/email/email-service";
import { z } from "zod";
export const runtime = "nodejs";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ error: "User not found" }, { status: 500 });
    }

    const resetOTP = generateOTP();
    const resetOTPExpires = getOTPExpiryTime();

    user.resetPasswordOTP = resetOTP;
    user.resetPasswordOTPExpires = resetOTPExpires;
    await user.save();

    try {
      let emailResponse = await sendPasswordResetEmail(user.email, resetOTP);
      console.log("emailResponse-----", emailResponse);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success to not reveal if email exists
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, we have sent a password reset OTP.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
