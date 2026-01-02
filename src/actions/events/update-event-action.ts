"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import { updateEventService, getEventByIdService, TUpdateEvent } from "@/services/event";
import { promoteWaitingListParticipantsService } from "@/services/event-registration";

async function updateEventBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  // Check if user is admin
  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat mengupdate event");
  }

  try {
    const eventId = formData.get("eventId") as string;
    if (!eventId) throw new Error("Event ID wajib diisi");

    const existingEvent = await getEventByIdService(eventId);
    if (!existingEvent) throw new Error("Event tidak ditemukan");
    const title = formData.get("title") as string | undefined;
    const description = formData.get("description") as string | undefined;
    const eventTypeId = formData.get("eventTypeId") as string | undefined;
    const location = formData.get("location") as string | undefined;
    const locationMapUrl = formData.get("locationMapUrl") as string | undefined;
    const imageUrl = formData.get("imageUrl") as string | undefined;
    const instagramUrl = formData.get("instagramUrl") as string | undefined;
    const eventDateStr = formData.get("eventDate") as string | undefined;
    const maxCapacityStr = formData.get("maxCapacity") as string | undefined;
    const registrationStatus = formData.get("registrationStatus") as 'OPEN' | 'CLOSED' | undefined;

    if (!eventId) {
      throw new Error("Event ID wajib diisi");
    }

    // Build update object with only provided values
    const updateData: TUpdateEvent = {};

    if (title !== undefined) {
      if (title.length > 200) {
        throw new Error("Judul event max 200 karakter");
      }
      updateData.title = title;
    }
    if (description !== undefined) updateData.description = description;
    if (eventTypeId !== undefined) updateData.eventTypeId = eventTypeId || undefined;
    if (location !== undefined) {
      if (location.length > 300) {
        throw new Error("Lokasi max 300 karakter");
      }
      updateData.location = location;
    }
    if (locationMapUrl !== undefined) updateData.locationMapUrl = locationMapUrl || undefined;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl || undefined;
    if (eventDateStr !== undefined) updateData.eventDate = new Date(eventDateStr);

    let capacityIncreased = false;
    if (maxCapacityStr !== undefined) {
      const newMaxCapacity = maxCapacityStr ? parseInt(maxCapacityStr) : undefined;
      updateData.maxCapacity = newMaxCapacity;

      if (newMaxCapacity !== undefined && (!existingEvent.maxCapacity || newMaxCapacity > existingEvent.maxCapacity)) {
        capacityIncreased = true;
      }
    }
    if (registrationStatus !== undefined) updateData.registrationStatus = registrationStatus;

    const event = await updateEventService(eventId, updateData);

    // If capacity increased, auto-promote waiting list
    if (capacityIncreased && event.maxCapacity) {
      await promoteWaitingListParticipantsService(eventId, event.maxCapacity);
    }

    return { success: true, event };
  } catch (error) {
    console.error("ERROR updateEventAction:", error);
    throw error;
  }
}

export const updateEventAction = createRateLimitedAction(updateEventBase, {
  limit: 10,
  window: 60000,
});
