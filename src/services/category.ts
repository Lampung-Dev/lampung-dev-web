import "server-only";
import { eq, asc } from "drizzle-orm";
import db from "@/lib/database";
import { jobCategoryTable, TJobCategory } from "@/lib/database/schema";

const DEFAULT_CATEGORIES = [
  { name: "Web Development", slug: "web-development" },
  { name: "Mobile Development", slug: "mobile-development" },
  { name: "UI/UX Design", slug: "ui-ux-design" },
  { name: "Data & AI", slug: "data-ai" },
  { name: "DevOps & Cloud", slug: "devops-cloud" },
  { name: "IT Support", slug: "it-support" },
];

export const getAllJobCategoriesService = async (): Promise<TJobCategory[]> => {
  try {
    let categories = await db.query.jobCategoryTable.findMany({
      orderBy: [asc(jobCategoryTable.name)],
    });

    if (categories.length === 0) {
      console.log("No categories found. Auto-seeding default categories...");
      await db.insert(jobCategoryTable).values(DEFAULT_CATEGORIES).onConflictDoNothing();
      categories = await db.query.jobCategoryTable.findMany({
        orderBy: [asc(jobCategoryTable.name)],
      });
    }

    return categories;
  } catch (error) {
    console.error("ERROR getAllJobCategoriesService:", error);
    throw new Error("Gagal mengambil data kategori pekerjaan.");
  }
};

export const createJobCategoryService = async (data: { name: string; slug: string }): Promise<TJobCategory> => {
  try {
    const [inserted] = await db.insert(jobCategoryTable).values(data).returning();
    if (!inserted) throw new Error("Gagal menambahkan kategori.");
    return inserted;
  } catch (error) {
    console.error("ERROR createJobCategoryService:", error);
    throw new Error("Gagal menambahkan kategori pekerjaan.");
  }
};

export const updateJobCategoryService = async (
  id: string,
  data: { name: string; slug: string }
): Promise<TJobCategory> => {
  try {
    const [updated] = await db
      .update(jobCategoryTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobCategoryTable.id, id))
      .returning();
    if (!updated) throw new Error("Kategori tidak ditemukan.");
    return updated;
  } catch (error) {
    console.error("ERROR updateJobCategoryService:", error);
    throw new Error("Gagal memperbarui kategori pekerjaan.");
  }
};

export const deleteJobCategoryService = async (id: string): Promise<void> => {
  try {
    await db.delete(jobCategoryTable).where(eq(jobCategoryTable.id, id));
  } catch (error) {
    console.error("ERROR deleteJobCategoryService:", error);
    throw new Error("Gagal menghapus kategori pekerjaan.");
  }
};
