import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
import { verifyToken } from "@/lib/auth/jwt";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let token = null;

    // First check Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // If no Authorization header, check cookies
    if (!token) {
      token = request.cookies.get("auth_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = verifyToken(token);

    // Find user by ID
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data (without password)
    // const userData = {
    //   id: user._id,
    //   email: user.email,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   fullName: user.fullName,
    //   avatar: user.avatar,
    //   isEmailVerified: user.isEmailVerified,
    // }

    return NextResponse.json({ user: user });
  } catch (error: any) {
    console.error("Get user error:", error);

    if (error.message === "Invalid or expired token") {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
