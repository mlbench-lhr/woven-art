import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";
export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { id, oldPassword, newPassword, confirmPassword } = await req.json();

    if (!id || !oldPassword || !newPassword || !confirmPassword)
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );

    if (newPassword !== confirmPassword)
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );

    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return NextResponse.json(
        { message: "Old password incorrect" },
        { status: 400 }
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
