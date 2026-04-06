import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
import { isOTPExpired } from "@/lib/auth/otp";
import { z } from "zod";
export const runtime = "nodejs";

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string()?.length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    const user = await User.findOne({
      email: validatedData.email,
      emailVerificationOTP: validatedData.otp,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid OTP or email address" },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    if (
      !user.emailVerificationOTPExpires ||
      isOTPExpired(user.emailVerificationOTPExpires)
    ) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);

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
