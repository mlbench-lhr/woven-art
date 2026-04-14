import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb/connection";
import { InstructionCode } from "@/lib/mongodb/models/InstructionCode";
import { sendInstructionCodeKlaviyoEvent } from "@/lib/klaviyo";
import { sendInstructionCodeEmail } from "@/lib/email/email-service";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function generate8DigitCode(): string {
  const n = crypto.randomInt(0, 100_000_000);
  return n.toString().padStart(8, "0");
}

export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  if (!secret) {
    return NextResponse.json({ error: "Missing SHOPIFY_WEBHOOK_SECRET" }, { status: 500 });
  }

  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  if (!verifyShopifyHmac(rawBody, hmac, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") || "";
  if (topic && topic !== "orders/paid") {
    return NextResponse.json({ ok: true });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = payload?.email || payload?.customer?.email || "";
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
  }

  const orderId = payload?.id ? String(payload.id) : null;
  const lineItems: any[] = Array.isArray(payload?.line_items) ? payload.line_items : [];
  const titleMatch = (process.env.SHOPIFY_CODE_PRODUCT_TITLE_MATCH || "New Codes").toLowerCase();

  const qualifying = lineItems.filter((li) => {
    const title = String(li?.title || "").toLowerCase();
    const sku = String(li?.sku || "").toLowerCase();
    return title.includes(titleMatch) || sku.includes("newcodes") || sku.includes("instruction");
  });

  if (qualifying.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await connectDB();

  const createdCodes: string[] = [];
  for (const li of qualifying) {
    const lineItemId = li?.id ? String(li.id) : crypto.randomUUID();

    const existing = await InstructionCode.findOne({ shopifyOrderId: orderId, shopifyLineItemId: lineItemId }).lean();
    if (existing?.code) {
      createdCodes.push(existing.code);
      continue;
    }

    let doc: any = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generate8DigitCode();
      try {
        doc = await InstructionCode.create({
          code,
          credits: 3,
          email,
          shopifyOrderId: orderId,
          shopifyLineItemId: lineItemId,
          redeemedBy: null,
          redeemedAt: null,
        });
        break;
      } catch (e: any) {
        const isDuplicate =
          e?.code === 11000 &&
          (String(e?.message || "").includes("code_1") ||
            String(e?.message || "").includes("shopifyOrderId_1_shopifyLineItemId_1"));
        if (!isDuplicate) throw e;
      }
    }

    if (doc?.code) {
      createdCodes.push(String(doc.code));
    }
  }

  const uniqueCodes = Array.from(new Set(createdCodes));
  if (uniqueCodes.length > 0) {
    const joined = uniqueCodes.join(", ");
    try {
      await sendInstructionCodeKlaviyoEvent({ email, code: joined, credits: 3, orderId });
    } catch {
      try {
        await sendInstructionCodeEmail(email, joined, 3);
      } catch {}
    }
  }

  return NextResponse.json({ ok: true });
}

