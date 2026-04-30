import { type NextRequest, NextResponse } from "next/server";
import { GoogleOAuth } from "@/lib/auth/google";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const redirectBase =
      process.env.NODE_ENV === "production"
        ? process.env.GOOGLE_REDIRECT_URL || request.nextUrl.origin
        : request.nextUrl.origin;
    const googleOAuth = new GoogleOAuth({ redirectBase });
    const authUrl = googleOAuth.getAuthUrl();

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google OAuth initiation error:", error);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    return NextResponse.redirect(
      `${baseUrl}/auth/login?error=oauth_error`
    );
  }
}
