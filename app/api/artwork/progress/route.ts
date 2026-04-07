import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";
import { StringArt } from "@/lib/mongodb/models/StringArt";
import { StringArtProgress } from "@/lib/mongodb/models/StringArtProgress";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    const body = await req.json();
    const { artId, currentStep } = body || {};
    if (!artId || typeof currentStep !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const art = await StringArt.findById(artId);
    if (!art || art.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let prog = await StringArtProgress.findOne({ userId: user._id.toString(), stringArtId: art._id });
    if (!prog) {
      prog = await StringArtProgress.create({
        userId: user._id.toString(),
        stringArtId: art._id,
        currentStep,
        workingState: [],
      });
    } else {
      prog.currentStep = currentStep;
      prog.updatedAt = new Date();
      await prog.save();
    }

    return NextResponse.json({ success: true, currentStep: prog.currentStep });
  } catch (err) {
    console.error("SAVE PROGRESS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
