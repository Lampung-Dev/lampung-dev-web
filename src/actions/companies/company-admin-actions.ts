"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService, linkUserToCompanyService } from "@/services/user";
import { createCompanyService, deleteCompanyService, updateCompanyProfileService } from "@/services/company";
import db from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { isNull, and, ne } from "drizzle-orm";
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

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya Super Admin yang dapat mengakses fitur ini.");
  }
}

export async function createCompanyAction(data: z.infer<typeof companySchema>) {
  try {
    await checkAdmin();
    const validated = companySchema.parse(data);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const company = await createCompanyService({
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

    revalidatePath("/dashboard/companies");
    return { success: true, company, error: undefined };
  } catch (error) {
    console.error("ERROR createCompanyAction:", error);
    return { success: false, company: undefined, error: error instanceof Error ? error.message : "Gagal menambahkan perusahaan." };
  }
}

export async function updateCompanyAction(id: string, data: z.infer<typeof companySchema>) {
  try {
    await checkAdmin();
    const validated = companySchema.parse(data);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const company = await updateCompanyProfileService(id, {
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

    revalidatePath("/dashboard/companies");
    return { success: true, company, error: undefined };
  } catch (error) {
    console.error("ERROR updateCompanyAction:", error);
    return { success: false, company: undefined, error: error instanceof Error ? error.message : "Gagal memperbarui perusahaan." };
  }
}

export async function deleteCompanyAction(id: string) {
  try {
    await checkAdmin();
    await deleteCompanyService(id);
    revalidatePath("/dashboard/companies");
    return { success: true, error: undefined };
  } catch (error) {
    console.error("ERROR deleteCompanyAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus perusahaan." };
  }
}

export async function linkUserToCompanyAction(userId: string, companyId: string | null) {
  try {
    await checkAdmin();
    await linkUserToCompanyService(userId, companyId);
    revalidatePath("/dashboard/companies");
    return { success: true, error: undefined };
  } catch (error) {
    console.error("ERROR linkUserToCompanyAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menautkan user." };
  }
}

export async function getUnlinkedUsersAction() {
  await checkAdmin();
  try {
    const unlinked = await db.query.userTable.findMany({
      where: and(
        isNull(userTable.companyId),
        ne(userTable.role, "ADMIN")
      ),
      orderBy: [userTable.name],
    });
    return { success: true, users: unlinked };
  } catch (error) {
    console.error("ERROR getUnlinkedUsersAction:", error);
    return { success: false, error: "Gagal mengambil daftar user." };
  }
}
