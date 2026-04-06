import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
import { hashPassword } from "@/lib/auth/password";
import { isOTPExpired } from "@/lib/auth/otp";
import { z } from "zod";
export const runtime = "nodejs";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string()?.length(6, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const user = await User.findOne({
      email: validatedData.email,
      resetPasswordOTP: validatedData.otp,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid OTP or email address" },
        { status: 400 }
      );
    }

    if (
      !user.resetPasswordOTPExpires ||
      isOTPExpired(user.resetPasswordOTPExpires)
    ) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

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
