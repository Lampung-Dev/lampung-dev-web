import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/database";
import { eq, and } from "drizzle-orm";
import {
  eventTransactionTable,
  eventRegistrationTable,
  userTable,
  eventTable,
} from "@/lib/database/schema";
import { sendEventRegistrationEmail } from "@/services/email";
import { getFee } from "@/lib/get-fee-utils";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const timestamp = request.headers.get("X-Xenith-Timestamp");
  const signature = request.headers.get("X-Xenith-Signature");

  if (!timestamp || !signature) {
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  const method = request.method.toUpperCase();
  const uri = "/api/webhook/payin";

  const payload = `${method}\\n${uri}\\n${rawBody || ""}\\n${timestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const data = body.data;

  const fee = getFee(data.paymentMethod, data.initiatedAmount);

  const referenceCode = data.referenceCode;

  const [transaction] = await db
    .select()
    .from(eventTransactionTable)
    .where(eq(eventTransactionTable.referenceCode, referenceCode))
    .limit(1);

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  await db
    .update(eventTransactionTable)
    .set({
      status: data.status,
      paymentAmount: Number(data.paymentAmount ?? 0),
      feeAmount: fee,
      isProcessed: true,
      paidAt: data.status === "SUCCESS" ? new Date() : null,
      updatedAt: new Date(),
      rawCallback: body,
    })
    .where(eq(eventTransactionTable.referenceCode, referenceCode));

  if (data.status === "SUCCESS") {
    const { userId, eventId } = transaction;

    const existing = await db
      .select()
      .from(eventRegistrationTable)
      .where(
        and(
          eq(eventRegistrationTable.userId, userId),
          eq(eventRegistrationTable.eventId, eventId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      const [registration] = await db
        .insert(eventRegistrationTable)
        .values({
          userId,
          eventId,
          status: "REGISTERED",
          registeredAt: new Date(),
        })
        .returning();

      const [[user], [event]] = await Promise.all([
        db.select().from(userTable).where(eq(userTable.id, userId)).limit(1),
        db.select().from(eventTable).where(eq(eventTable.id, eventId)).limit(1),
      ]);

      sendEventRegistrationEmail(
        { name: user.name, email: user.email },
        {
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventLocation: event.location,
          eventImageUrl: event.imageUrl,
          registrationId: registration.id,
        },
        "REGISTERED",
      ).catch((err) => console.error("[WEBHOOK EMAIL ERROR]", err));
    }
  }

  return NextResponse.json({ ok: true });
}
