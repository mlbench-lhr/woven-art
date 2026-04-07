import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { StringArt } from "@/lib/mongodb/models/StringArt";
import { StringArtProgress } from "@/lib/mongodb/models/StringArtProgress";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const art = await StringArt.findById(id).lean();
    if (!art || art.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prog = await StringArtProgress.findOne({ userId: user._id.toString(), stringArtId: art._id }).lean();
    return NextResponse.json({ item: art, progress: prog ? { currentStep: prog.currentStep } : null });
  } catch (err) {
    console.error("GET ART ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const art = await StringArt.findById(id);
    if (!art || art.userId !== user._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await StringArtProgress.deleteMany({ userId: user._id.toString(), stringArtId: art._id });
    await StringArt.deleteOne({ _id: art._id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ART ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
