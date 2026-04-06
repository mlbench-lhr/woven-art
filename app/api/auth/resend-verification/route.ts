import { type NextRequest, NextResponse } from "next/server"
import User from "@/lib/mongodb/models/User"
import { generateOTP, getOTPExpiryTime } from "@/lib/auth/otp"
import { sendVerificationEmail } from "@/lib/email/email-service"
import connectDB from "@/lib/mongodb/connection"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = getOTPExpiryTime()

    // Update user with new OTP
    user.emailVerificationOTP = otp
    user.emailVerificationOTPExpires = expiresAt
    await user.save()

    // Send verification email
    await sendVerificationEmail(email, otp)

    return NextResponse.json({ message: "Verification OTP resent successfully" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
