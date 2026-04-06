import { type NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Clear the JWT cookie by setting it to empty and expired
    const response = NextResponse.json({
      message: "Logout successful",
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // immediately expire the cookie
    });

    return response;
  } catch (error: any) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
