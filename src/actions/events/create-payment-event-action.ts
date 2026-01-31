"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import { checkUserRegistrationService } from "@/services/event-registration";
import { getEventByIdService } from "@/services/event";
import { getUserByEmailService } from "@/services/user";
import { createPaymentService } from "@/services/payment";
import {
  createTransactionService,
  updateTransactionStatusService,
} from "@/services/transaction";
import { getFee } from "@/lib/get-fee-utils";

async function createPaymentEventBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu untuk join event");
  }

  const user = await getUserByEmailService(session.user.email);
  
  const customerName = session?.user?.name || "Valued Customer";

  try {
    const eventId = formData.get("eventId") as string;
    const amount = formData.get("amount") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const paymentChannel = formData.get("paymentChannel") as string;

    if (!eventId) {
      throw new Error("Event ID wajib diisi");
    }

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Get event details for email
    const event = await getEventByIdService(eventId);
    if (!event) {
      throw new Error("Event tidak ditemukan");
    }

    // Check if already registered
    const existing = await checkUserRegistrationService(eventId, user.id);
    if (existing && existing.status !== "CANCELLED") {
      throw new Error("Kamu sudah terdaftar di event ini");
    }

    const adminFee = getFee(paymentMethod, event.entryFee);
    const totalAmount = event.entryFee + adminFee;
    const referenceCode = crypto.randomUUID();

    // Here you would integrate with your payment gateway
    // For demonstration, we'll just return a mock payment event
    await createTransactionService({
      referenceCode,
      userId: user.id,
      eventId,
      amount: Number(amount),
      paymentMethod,
      paymentChannel,
    });

    const payin = await createPaymentService({
      amount: totalAmount,
      name: customerName,
      paymentMethod: paymentMethod,
      paymentChannel: paymentChannel || "QRIS",
      referenceCode: referenceCode,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL?.trim()}/api/webhook/payin`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL?.trim()}/payment-success/${referenceCode}`,
    });

    await updateTransactionStatusService(referenceCode, {
      payinId: payin.id,
      paymentMethod: payin.paymentMethod,
      paymentChannel: payin.paymentChannel,
      paymentCode: payin.paymentCode,
    });

    return {
      success: true,
      paymentUrl: payin.paymentCode
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Payment gateway tidak dapat diakses",
    };
  }
}

export const createPaymentEventAction = createRateLimitedAction(
  createPaymentEventBase,
  {
    limit: 3,
    window: 60000,
  },
);
