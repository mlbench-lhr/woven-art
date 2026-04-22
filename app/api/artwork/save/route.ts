import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { StringArt } from "@/lib/mongodb/models/StringArt";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";
import { createMirroredSequence } from "@/lib/stringArtGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { totalLines, sequence, thumbnail, clientRequestId } = body;

    if (!totalLines || !sequence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sequence) || sequence.length !== Number(totalLines) + 1) {
      return NextResponse.json(
        { error: "Invalid sequence length. Regenerate the artwork and try again." },
        { status: 400 }
      );
    }

    // Authenticate from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);

    await connectDB();

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (clientRequestId && typeof clientRequestId === "string") {
      const existing = await StringArt.findOne({ userId: user._id.toString(), clientRequestId }).lean();
      if (existing?._id) {
        return NextResponse.json({ success: true, id: existing._id }, { status: 200 });
      }
    }

    // Create mirrored sequence for wall hanging and save it as finalSequence
    const mirroredSequence = createMirroredSequence(sequence, 240);

    const stringArt = await StringArt.create({
      userId: user._id.toString(),
      totalPins: 240,
      totalLines,
      finalSequence: mirroredSequence, // Save only mirrored sequence for wall hanging
      thumbnail: thumbnail || null,
      clientRequestId: clientRequestId && typeof clientRequestId === "string" ? clientRequestId : null,
    });

    return NextResponse.json({
      success: true,
      id: stringArt._id,
    }, { status: 201 });
  } catch (err) {
    console.error("SAVE STRING ART ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
