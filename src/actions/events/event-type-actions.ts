"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import {
  createEventTypeService,
  updateEventTypeService,
  deleteEventTypeService,
  TNewEventType,
  TUpdateEventType,
} from "@/services/event-type";

async function createEventTypeBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  // Check if user is admin
  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat membuat tipe event");
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | undefined;
    const color = formData.get("color") as string | undefined;

    if (!name || name.length > 100) {
      throw new Error("Nama tipe event wajib diisi (max 100 karakter)");
    }

    const eventTypeData: TNewEventType = {
      name,
      description: description || undefined,
      color: color || undefined,
    };

    const eventType = await createEventTypeService(eventTypeData);

    return { success: true, eventType };
  } catch (error) {
    console.error("ERROR createEventTypeAction:", error);
    throw error;
  }
}

export const createEventTypeAction = createRateLimitedAction(createEventTypeBase, {
  limit: 10,
  window: 60000,
});

async function updateEventTypeBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat mengupdate tipe event");
  }

  try {
    const eventTypeId = formData.get("eventTypeId") as string;
    const name = formData.get("name") as string | undefined;
    const description = formData.get("description") as string | undefined;
    const color = formData.get("color") as string | undefined;

    if (!eventTypeId) {
      throw new Error("Event Type ID wajib diisi");
    }

    const updateData: TUpdateEventType = {};
    if (name !== undefined) {
      if (name.length > 100) {
        throw new Error("Nama tipe event max 100 karakter");
      }
      updateData.name = name;
    }
    if (description !== undefined) updateData.description = description || undefined;
    if (color !== undefined) updateData.color = color || undefined;

    const eventType = await updateEventTypeService(eventTypeId, updateData);

    return { success: true, eventType };
  } catch (error) {
    console.error("ERROR updateEventTypeAction:", error);
    throw error;
  }
}

export const updateEventTypeAction = createRateLimitedAction(updateEventTypeBase, {
  limit: 10,
  window: 60000,
});

export async function deleteEventTypeAction(eventTypeId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat menghapus tipe event");
  }

  try {
    if (!eventTypeId) {
      throw new Error("Event Type ID wajib diisi");
    }

    await deleteEventTypeService(eventTypeId);

    return { success: true };
  } catch (error) {
    console.error("ERROR deleteEventTypeAction:", error);
    throw error;
  }
}
