import { type NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Clear the JWT cookie by setting it to empty and expired
    const response = NextResponse.json({
      message: "Cookies cleared successfully",
    });

    // Clear cookies with multiple domain and path variations
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // immediately expire the cookie
    };

    // Clear with different domain variations
    response.cookies.set("auth_token", "", cookieOptions);
    response.cookies.set("auth_token", "", { ...cookieOptions, domain: "localhost" });
    response.cookies.set("auth_token", "", { ...cookieOptions, domain: "." });
    response.cookies.set("auth_token", "", { ...cookieOptions, domain: "" });

    return response;
  } catch (error: any) {
    console.error("Clear cookies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
