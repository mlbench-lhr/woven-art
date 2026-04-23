import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { StringArt } from "@/lib/mongodb/models/StringArt";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/lib/mongodb/models/User";
import { createMirroredSequence } from "@/lib/stringArtGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Save API received body:", body);

    const { variantId, thumbnail, clientRequestId } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "Missing variant ID" },
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

    // Get storage variants from session storage (client should send this)
    let storageVariant = null;
    console.log("storageVariant from body:", body.storageVariant);
    console.log("sequence from body:", body.sequence);
    console.log("totalLines from body:", body.totalLines);
    
    if (body.storageVariant && body.storageVariant.lines) {
      storageVariant = body.storageVariant;
      console.log("Using storageVariant from body:", storageVariant);
    } else {
      // Fallback: create storage variant on server (less efficient)
      console.log("Using fallback - creating storage variant on server");
      const { createMirroredSequence } = await import("@/lib/stringArtGenerator");
      const sequence = body.sequence;
      const totalLines = body.totalLines;
      
      console.log("Fallback sequence:", sequence);
      console.log("Fallback totalLines:", totalLines);
      
      if (!sequence || !totalLines) {
        console.log("Missing sequence or totalLines in fallback");
        return NextResponse.json(
          { error: "Missing sequence data" },
          { status: 400 }
        );
      }

      const mirroredSequence = createMirroredSequence(sequence, 240);
      storageVariant = {
        sequence: mirroredSequence,
        totalLines,
        totalPins: 240
      };
      console.log("Created storageVariant:", storageVariant);
    }

    // Validate storage variant before saving
    if (!storageVariant || !storageVariant.lines || !storageVariant.sequence) {
      return NextResponse.json(
        { error: "Invalid storage variant data" },
        { status: 400 }
      );
    }

    const stringArt = await StringArt.create({
      userId: user._id.toString(),
      totalPins: storageVariant.totalPins || 240,
      totalLines: storageVariant.lines,
      finalSequence: storageVariant.sequence, // Already mirrored sequence for wall hanging
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
