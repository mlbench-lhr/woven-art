import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";
import { InstructionCode } from "@/lib/mongodb/models/InstructionCode";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);

    const body = await req.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!/^\d{8}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const instructionCode = await InstructionCode.findOne({ code });

    if (!instructionCode) {
      return Response.json({ error: "Invalid Code" }, { status: 404 });
    }

    // 🔴 Core validation
    const dbEmail = instructionCode.email?.toLowerCase();

    if (dbEmail !== user.email) {
      return Response.json(
        { error: "This code does not belong to your account" },
        { status: 403 }
      );
    }

    if (instructionCode.redeemedAt) {
      return Response.json({ error: "Code already used" }, { status: 400 });
    }

    const updatedCode = await InstructionCode.findOneAndUpdate(
      { code, redeemedBy: null },
      { $set: { redeemedBy: user._id.toString(), redeemedAt: new Date() } },
      { new: true }
    );

    if (!updatedCode) {
      const existing = await InstructionCode.findOne({ code }).lean();
      if (!existing) return NextResponse.json({ error: "Code not found" }, { status: 404 });
      return NextResponse.json({ error: "Code already used" }, { status: 400 });
    }

    const creditsToAdd = Number(updatedCode.credits) > 0 ? Number(updatedCode.credits) : 1;
    await User.updateOne({ _id: user._id }, { $inc: { credits: creditsToAdd } });
    const fresh = await User.findById(user._id).lean();

    return NextResponse.json({ success: true, credits: (fresh as any)?.credits ?? 0 });
  } catch (err) {
    console.error("REDEEM CODE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
