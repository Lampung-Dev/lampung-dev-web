"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService, updateUserLocationAndStatusService } from "@/services/user";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const locationSchema = z.object({
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  locationName: z.string().min(1, "Location name is required"),
  employmentStatus: z.string().min(1, "Employment status is required"),
});

export async function updateUserLocationAndStatusAction(data: z.infer<typeof locationSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Harap login terlebih dahulu" };
    }

    const user = await getUserByEmailService(session.user.email);
    if (!user?.id) {
      return { success: false, error: "User tidak ditemukan" };
    }

    const validated = locationSchema.parse(data);

    await updateUserLocationAndStatusService(user.id, {
      latitude: validated.latitude,
      longitude: validated.longitude,
      locationName: validated.locationName,
      employmentStatus: validated.employmentStatus,
    });

    revalidatePath("/users/my-profile");
    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("ERROR updateUserLocationAndStatusAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui data lokasi dan status kerja." };
  }
}
