import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { StringArt } from "@/lib/mongodb/models/StringArt";
import { StringArtProgress } from "@/lib/mongodb/models/StringArtProgress";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const uidStr = user._id.toString();
    const itemsStr = await StringArt.find({ userId: uidStr }).sort({ createdAt: -1 }).lean();

    // Fallback: if older records used ObjectId in userId, fetch via native driver
    let itemsObj: any[] = [];
    try {
      itemsObj = await StringArt.collection
        .find({ userId: new mongoose.Types.ObjectId(user._id) })
        .sort({ createdAt: -1 })
        .toArray();
    } catch {}

    const items = [...itemsStr, ...itemsObj];
    const ids = items.map((it: any) => it._id);
    const progress = await StringArtProgress.find({ userId: user._id.toString(), stringArtId: { $in: ids } }).lean();
    const pMap = new Map(progress.map((p: any) => [String(p.stringArtId), p]));

    const result = items.map((it: any) => {
      const p = pMap.get(String(it._id));
      return { ...it, progressStep: p?.currentStep || 0 };
    });

    return NextResponse.json({ items: result });
  } catch (err) {
    console.error("FETCH MINE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
