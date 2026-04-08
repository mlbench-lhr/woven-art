type SendInstructionCodeEventParams = {
  email: string;
  code: string;
  credits: number;
  orderId?: string | null;
};

export async function sendInstructionCodeKlaviyoEvent({
  email,
  code,
  credits,
  orderId,
}: SendInstructionCodeEventParams): Promise<void> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing KLAVIYO_PRIVATE_API_KEY");
  }

  const res = await fetch("https://a.klaviyo.com/api/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2025-01-15",
    },
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: "Instruction Code Purchased" } } },
          profile: { data: { type: "profile", attributes: { email } } },
          properties: {
            instruction_code: code,
            credits,
            order_id: orderId ?? undefined,
          },
          time: new Date().toISOString(),
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Klaviyo event failed: HTTP ${res.status} ${text}`);
  }
}

