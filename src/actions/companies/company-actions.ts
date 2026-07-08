"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { updateCompanyProfileService } from "@/services/company";
import { updateApplicationStatusService } from "@/services/job-application";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const companySchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  description: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  mapsUrl: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const updateCompanyProfileAction = async (companyId: string, data: z.infer<typeof companySchema>) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await getUserByEmailService(session.user.email);
    if (!user || (user.role !== "ADMIN" && user.role !== "MITRA")) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify company association if user is MITRA
    if (user.role === "MITRA" && user.companyId !== companyId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = companySchema.parse(data);

    // Generate slug from name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    await updateCompanyProfileService(companyId, {
      name: validated.name,
      slug,
      description: validated.description || null,
      address: validated.address || null,
      website: validated.website || null,
      logoUrl: validated.logoUrl || null,
      mapsUrl: validated.mapsUrl || null,
      latitude: validated.latitude ?? null,
      longitude: validated.longitude ?? null,
    });

    revalidatePath("/dashboard/company-profile");
    return { success: true };
  } catch (error) {
    console.error("ERROR updateCompanyProfileAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui profil." };
  }
};

export const updateApplicationStatusAction = async (applicationId: string, status: string) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await getUserByEmailService(session.user.email);
    if (!user || (user.role !== "ADMIN" && user.role !== "MITRA")) {
      return { success: false, error: "Unauthorized" };
    }

    await updateApplicationStatusService(applicationId, status);
    revalidatePath("/jobs/applications");
    return { success: true };
  } catch (error) {
    console.error("ERROR updateApplicationStatusAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui status." };
  }
};
