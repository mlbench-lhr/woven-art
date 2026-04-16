import { type NextRequest, NextResponse } from "next/server";
import { sendContactEmail, sendContactAutoReply } from "@/lib/email/email-service";
import { z } from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    await sendContactEmail(
      validatedData.name,
      validatedData.email,
      validatedData.message
    );

    // Send auto-reply to user
    await sendContactAutoReply(
      validatedData.name,
      validatedData.email
    );

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Contact form error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
