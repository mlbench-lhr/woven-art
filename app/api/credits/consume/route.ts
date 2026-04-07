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
    const { artId } = body || {};
    if (!artId) return NextResponse.json({ error: "Missing artId" }, { status: 400 });

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const art = await StringArt.findById(artId);
    if (!art || art.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (art.unlocked) {
      return NextResponse.json({ success: true, alreadyUnlocked: true, credits: user.credits ?? 0 });
    }

    const credits = user.credits ?? 0;
    if (credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    user.credits = credits - 1;
    art.unlocked = true;
    await user.save();
    await art.save();

    const existing = await StringArtProgress.findOne({ userId: user._id.toString(), stringArtId: art._id });
    if (!existing) {
      await StringArtProgress.create({
        userId: user._id.toString(),
        stringArtId: art._id,
        currentStep: 1,
        workingState: [],
      });
    }

    return NextResponse.json({ success: true, credits: user.credits });
  } catch (err) {
    console.error("CONSUME CREDIT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
