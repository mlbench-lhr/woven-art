import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    await connectDB();
    const reqParams = await params;
    const email = reqParams.email;
    const existingUserByEmail = await User.findOne({
      email: email,
    });
    console.log("existingUserByEmail---", existingUserByEmail);

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { message: "User with this email does not exists" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("error-----", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
