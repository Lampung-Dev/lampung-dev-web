"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import {
  updateRegistrationStatusService,
  toggleAttendanceService,
  getRegistrationByIdService,
} from "@/services/event-registration";
import { getEventByIdService } from "@/services/event";
import { sendWaitingListPromotionEmail } from "@/services/email";
import { revalidatePath } from "next/cache";

async function updateRegistrationStatusBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const registrationId = formData.get("registrationId") as string;
  const status = formData.get("status") as
    | "REGISTERED"
    | "WAITING_LIST"
    | "CANCELLED";
  const eventId = formData.get("eventId") as string;

  if (!registrationId || !status) {
    throw new Error("Missing required fields");
  }

  // Check if we are promoting from WAITING_LIST to REGISTERED
  const currentReg = await getRegistrationByIdService(registrationId);
  const isPromotion =
    currentReg?.status === "WAITING_LIST" && status === "REGISTERED";

  await updateRegistrationStatusService(registrationId, status);

  // Send email if promoted
  if (isPromotion && currentReg) {
    const event = await getEventByIdService(currentReg.eventId);
    if (event) {
      sendWaitingListPromotionEmail(
        { name: currentReg.user.name, email: currentReg.user.email },
        {
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventLocation: event.location,
          eventImageUrl: event.imageUrl,
          registrationId: currentReg.id,
        }
      ).catch((err) => console.error("Failed to send promotion email:", err));
    }
  }

  if (eventId) {
    revalidatePath(`/events/manage/${eventId}/participants`);
  }

  return { success: true };
}

async function toggleAttendanceBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const registrationId = formData.get("registrationId") as string;
  const eventId = formData.get("eventId") as string;

  if (!registrationId) {
    throw new Error("Missing registration ID");
  }

  const updated = await toggleAttendanceService(registrationId);

  if (eventId) {
    revalidatePath(`/events/manage/${eventId}/participants`);
  }

  return { success: true, attended: updated.attended };
}

export const updateRegistrationStatusAction = createRateLimitedAction(
  updateRegistrationStatusBase,
  {
    limit: 20,
    window: 60000,
  }
);

export const toggleAttendanceAction = createRateLimitedAction(
  toggleAttendanceBase,
  {
    limit: 20,
    window: 60000,
  }
);
