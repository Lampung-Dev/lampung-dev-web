"use server";

import { auth } from "@/lib/next-auth";
import { deleteEventService } from "@/services/event";

export async function deleteEventAction(eventId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  // Check if user is admin
  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat menghapus event");
  }

  try {
    if (!eventId) {
      throw new Error("Event ID wajib diisi");
    }

    await deleteEventService(eventId);

    return { success: true };
  } catch (error) {
    console.error("ERROR deleteEventAction:", error);
    throw error;
  }
}
