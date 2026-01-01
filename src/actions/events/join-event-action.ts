"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import {
  registerToEventService,
  unregisterFromEventService,
  checkUserRegistrationService
} from "@/services/event-registration";
import { getEventByIdService } from "@/services/event";
import { getUserByEmailService } from "@/services/user";
import { sendEventRegistrationEmail } from "@/services/email";

async function joinEventBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu untuk join event");
  }

  try {
    const eventId = formData.get("eventId") as string;
    const action = formData.get("action") as 'join' | 'leave';

    if (!eventId) {
      throw new Error("Event ID wajib diisi");
    }

    // Get user from database
    const user = await getUserByEmailService(session.user.email);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    if (action === 'leave') {
      // Unregister from event
      await unregisterFromEventService(eventId, user.id);
      return { success: true, action: 'left' };
    }

    // Check if already registered
    const existing = await checkUserRegistrationService(eventId, user.id);
    if (existing && existing.status !== 'CANCELLED') {
      throw new Error("Kamu sudah terdaftar di event ini");
    }

    // Get event details for email
    const event = await getEventByIdService(eventId);
    if (!event) {
      throw new Error("Event tidak ditemukan");
    }

    // Register to event
    const result = await registerToEventService({
      eventId,
      userId: user.id,
    });

    // Send confirmation email (async, don't await)
    sendEventRegistrationEmail(
      { name: user.name, email: user.email },
      {
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
        eventImageUrl: event.imageUrl,
        registrationId: result.registration.id,
      },
      result.status
    ).catch(err => console.error('Failed to send email:', err));

    return {
      success: true,
      action: 'joined',
      status: result.status,
      registrationId: result.registration.id,
    };
  } catch (error) {
    console.error("ERROR joinEventAction:", error);
    throw error;
  }
}

export const joinEventAction = createRateLimitedAction(joinEventBase, {
  limit: 5,
  window: 30000, // 30 seconds
});
