"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService, updateUserLocationAndStatusService } from "@/services/user";
import { createApplicationService } from "@/services/job-application";
import * as z from "zod";

const applySchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .min(9, "Nomor telepon minimal 9 digit")
    .max(15, "Nomor telepon terlalu panjang"),
  linkedin: z.string().url("URL LinkedIn tidak valid").optional().or(z.literal("")),
  portfolio: z.string().url("URL Portfolio tidak valid").optional().or(z.literal("")),
  resumeUrl: z.string().url("URL resume tidak valid"),
  expectedSalary: z.string().optional(),
  availability: z.string(),
  coverLetter: z.string().min(50, "Cover letter minimal 50 karakter"),
  employmentStatus: z.string().min(1, "Status pekerjaan wajib diisi"),
  locationName: z.string().min(1, "Lokasi wajib diisi"),
  latitude: z.string().min(1, "Latitude wajib diisi"),
  longitude: z.string().min(1, "Longitude wajib diisi"),
});

export const applyJobAction = async (jobId: string, formData: z.infer<typeof applySchema>) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Anda harus login untuk melamar." };
    }

    const user = await getUserByEmailService(session.user.email);
    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    // Validate data
    const validated = applySchema.parse(formData);

    // Save/update location & status on user profile
    await updateUserLocationAndStatusService(user.id, {
      latitude: validated.latitude,
      longitude: validated.longitude,
      locationName: validated.locationName,
      employmentStatus: validated.employmentStatus,
    });

    await createApplicationService({
      jobId,
      userId: user.id,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      linkedin: validated.linkedin || null,
      portfolio: validated.portfolio || null,
      resumeUrl: validated.resumeUrl,
      expectedSalary: validated.expectedSalary || null,
      availability: validated.availability,
      coverLetter: validated.coverLetter,
      employmentStatus: validated.employmentStatus,
    });

    return { success: true };
  } catch (error) {
    console.error("ERROR applyJobAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengirim lamaran." };
  }
};
