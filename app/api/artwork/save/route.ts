import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import connectDB from "@/lib/mongodb/connection";
import { StringArt } from "@/lib/mongodb/models/StringArt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { totalLines, sequence, thumbnail } = body;

    if (!totalLines || !sequence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await getCurrentUser();

    console.log(data, error);

    // if (error || !data?.user) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    await connectDB();

    const stringArt = await StringArt.create({
      userId: data.user._id.toString(),
      totalPins: 240,
      totalLines,
      finalSequence: sequence,
      thumbnail: thumbnail || null,
    });

    return NextResponse.json({
      success: true,
      id: stringArt._id,
    });
  } catch (err) {
    console.error("SAVE STRING ART ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}