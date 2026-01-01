"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import { createEventService, generateSlug, TNewEvent } from "@/services/event";
import { createEventTypeService } from "@/services/event-type";

async function createEventBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  // Check if user is admin
  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Hanya admin yang dapat membuat event");
  }

  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    let eventTypeId = formData.get("eventTypeId") as string | undefined;
    const newEventTypeName = formData.get("newEventTypeName") as
      | string
      | undefined;
    const newEventTypeColor = formData.get("newEventTypeColor") as
      | string
      | undefined;
    const location = formData.get("location") as string;
    const locationMapUrl = formData.get("locationMapUrl") as string | undefined;
    const imageUrl = formData.get("imageUrl") as string;
    const instagramUrl = formData.get("instagramUrl") as string | undefined;
    const eventDateStr = formData.get("eventDate") as string;
    const maxCapacityStr = formData.get("maxCapacity") as string | undefined;
    const registrationStatus = formData.get("registrationStatus") as
      | "OPEN"
      | "CLOSED"
      | undefined;
    const createdBy = formData.get("createdBy") as string | undefined;

    // Validation
    if (!title || title.length > 200) {
      throw new Error("Judul event wajib diisi (max 200 karakter)");
    }
    if (!description) {
      throw new Error("Deskripsi event wajib diisi");
    }
    if (!location || location.length > 300) {
      throw new Error("Lokasi wajib diisi (max 300 karakter)");
    }
    if (!imageUrl) {
      throw new Error("Gambar event wajib diupload");
    }
    if (!eventDateStr) {
      throw new Error("Tanggal event wajib diisi");
    }

    // Create new event type if provided
    if (newEventTypeName && !eventTypeId) {
      const newEventType = await createEventTypeService({
        name: newEventTypeName,
        color: newEventTypeColor,
      });
      eventTypeId = newEventType.id;
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const timestamp = Date.now().toString(36);
    slug = `${slug}-${timestamp}`;

    const maxCapacity = maxCapacityStr ? parseInt(maxCapacityStr) : undefined;

    const eventData: TNewEvent = {
      title,
      slug,
      description,
      eventTypeId: eventTypeId || undefined,
      location,
      locationMapUrl: locationMapUrl || undefined,
      imageUrl,
      instagramUrl: instagramUrl || undefined,
      eventDate: new Date(eventDateStr),
      maxCapacity,
      registrationStatus: registrationStatus || "OPEN",
      createdBy,
    };

    const event = await createEventService(eventData);

    return { success: true, event };
  } catch (error) {
    console.error("ERROR createEventAction:", error);
    throw error;
  }
}

export const createEventAction = createRateLimitedAction(createEventBase, {
  limit: 10,
  window: 60000, // 1 minute
});
