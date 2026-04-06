import { NextResponse } from "next/server";
import { GoogleOAuth } from "@/lib/auth/google";
export const runtime = "nodejs";

export async function GET() {
  try {
    const googleOAuth = new GoogleOAuth();
    const authUrl = googleOAuth.getAuthUrl();

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.redirect(
      `${"http://localhost:3000"}/auth/login?error=oauth_error`
    );
  }
}
