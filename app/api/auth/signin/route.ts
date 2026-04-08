import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User, { IUser } from "@/lib/mongodb/models/User";
import { comparePassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
export const runtime = "nodejs";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  expectedRole: z.enum(["admin", "vendor", "user"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/auth/signin called");
    await connectDB();

    const body = await request.json();
    const validatedData = signinSchema.parse(body);

    // Find user by email
    const user: IUser | null = await User.findOne({
      email: validatedData.email,
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // if (user?.role === "vendor" && !user.isRoleVerified) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Your vendor account is not is not verified yet, please try again later.",
    //     },
    //     { status: 401 }
    //   );
    // }

    if (!user.googleId && !user.isEmailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before signing in. Check your inbox for the verification link.",
        },
        { status: 401 }
      );
    }

    if (!user.googleId) {
      const isPasswordValid = await comparePassword(
        validatedData.password,
        user.password
      );
      console.log("isPasswordValid-------", isPasswordValid);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    if (validatedData.expectedRole && user.role !== validatedData.expectedRole) {
      const msg =
        validatedData.expectedRole === "vendor"
          ? "Please sign in with a vendor account on this page"
          : validatedData.expectedRole === "admin"
          ? "Please sign in with an admin account on this page"
          : "Please sign in with a user account on this page";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    const token = generateToken(user);

    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: userData,
      token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Signin error:", error);

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
