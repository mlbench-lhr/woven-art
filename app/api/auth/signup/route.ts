import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User, { IUser } from "@/lib/mongodb/models/User";
import { hashPassword } from "@/lib/auth/password";
import { generateOTP, getOTPExpiryTime } from "@/lib/auth/otp";
import { sendVerificationEmail } from "@/lib/email/email-service";
import { z } from "zod";
export const runtime = "nodejs";

// Minimal user-only signup schema

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({
      email: validatedData.email,
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    const emailVerificationOTP = generateOTP();
    const emailVerificationOTPExpires = getOTPExpiryTime();

    // Create user
    const user: IUser = new User({
      email: validatedData.email,
      password: hashedPassword,
      fullName: validatedData.fullName,
      isEmailVerified: false,
      emailVerificationOTP: emailVerificationOTP,
      emailVerificationOTPExpires: emailVerificationOTPExpires,
    });
    await user.save();

    try {
      await sendVerificationEmail(user.email, emailVerificationOTP);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with signup process even if email fails
    }

    // Return success message without token
    return NextResponse.json({
      message:
        "Account created successfully! Please check your email for the verification OTP code.",
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

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
