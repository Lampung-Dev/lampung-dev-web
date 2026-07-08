"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import {
  createJobCategoryService,
  updateJobCategoryService,
  deleteJobCategoryService,
} from "@/services/category";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya Super Admin yang dapat mengakses fitur ini.");
  }
}

export async function createJobCategoryAction(data: z.infer<typeof categorySchema>) {
  try {
    await checkAdmin();
    const validated = categorySchema.parse(data);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = await createJobCategoryService({
      name: validated.name,
      slug,
    });

    revalidatePath("/dashboard/job-categories");
    revalidatePath("/jobs");
    return { success: true, category, error: undefined };
  } catch (error) {
    console.error("ERROR createJobCategoryAction:", error);
    return { success: false, category: undefined, error: error instanceof Error ? error.message : "Gagal menambahkan kategori." };
  }
}

export async function updateJobCategoryAction(id: string, data: z.infer<typeof categorySchema>) {
  try {
    await checkAdmin();
    const validated = categorySchema.parse(data);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = await updateJobCategoryService(id, {
      name: validated.name,
      slug,
    });

    revalidatePath("/dashboard/job-categories");
    revalidatePath("/jobs");
    return { success: true, category, error: undefined };
  } catch (error) {
    console.error("ERROR updateJobCategoryAction:", error);
    return { success: false, category: undefined, error: error instanceof Error ? error.message : "Gagal memperbarui kategori." };
  }
}

export async function deleteJobCategoryAction(id: string) {
  try {
    await checkAdmin();
    await deleteJobCategoryService(id);
    revalidatePath("/dashboard/job-categories");
    revalidatePath("/jobs");
    return { success: true, error: undefined };
  } catch (error) {
    console.error("ERROR deleteJobCategoryAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus kategori." };
  }
}
