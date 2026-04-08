import { type NextRequest, NextResponse } from "next/server";
import { GoogleOAuth } from "@/lib/auth/google";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
import { generateToken } from "@/lib/auth/jwt";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const expectedRoleCookie = request.cookies.get("login_expected_role")?.value || null;

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${baseUrl}/auth/login?error=oauth_cancelled`
      );
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_error`);
    }

    const googleOAuth = new GoogleOAuth();

    // Exchange code for tokens
    const tokens = await googleOAuth.exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await googleOAuth.getUserInfo(tokens.access_token);
    const emailLower = (googleUser.email || "").toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: emailLower }, { googleId: googleUser.id }],
    });
    if (user && user.role === "admin") {
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
      return NextResponse.redirect(
        `${baseUrl}/auth/login?error=social_admin_forbidden`
      );
    }

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.avatar = googleUser.picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email: emailLower,
        fullName: googleUser.given_name + googleUser.family_name,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        isEmailVerified: googleUser.verified_email,
        role: "user",
        // No password needed for Google OAuth users
      });

      await user.save();
    }

    if (expectedRoleCookie && user.role !== expectedRoleCookie) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=role_mismatch`);
    }

    // Generate JWT token
    const token = generateToken(user);

    const redirectUrl = new URL(`${baseUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);

    const res = NextResponse.redirect(redirectUrl.toString());
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_error`);
  }
}
