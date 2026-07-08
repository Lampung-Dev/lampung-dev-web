import "server-only";
import { eq, desc } from "drizzle-orm";
import db from "@/lib/database";
import { companyTable, TCompany } from "@/lib/database/schema";

export const getCompanyByIdService = async (id: string): Promise<TCompany | null> => {
  try {
    const company = await db.query.companyTable.findFirst({
      where: eq(companyTable.id, id),
    });
    return company ?? null;
  } catch (error) {
    console.error("ERROR getCompanyByIdService:", error);
    throw new Error("Gagal mengambil data perusahaan.");
  }
};

export const getCompanyBySlugService = async (slug: string): Promise<TCompany | null> => {
  try {
    const company = await db.query.companyTable.findFirst({
      where: eq(companyTable.slug, slug),
    });
    return company ?? null;
  } catch (error) {
    console.error("ERROR getCompanyBySlugService:", error);
    throw new Error("Gagal mengambil data perusahaan.");
  }
};

export const updateCompanyProfileService = async (
  id: string,
  data: Partial<Omit<TCompany, "id" | "createdAt" | "updatedAt" | "slug">> & { slug?: string }
): Promise<TCompany> => {
  try {
    const [updated] = await db
      .update(companyTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companyTable.id, id))
      .returning();
    if (!updated) throw new Error("Perusahaan tidak ditemukan.");
    return updated;
  } catch (error) {
    console.error("ERROR updateCompanyProfileService:", error);
    throw new Error("Gagal memperbarui profil perusahaan.");
  }
};

export const createCompanyService = async (data: {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) => {
  try {
    const [inserted] = await db.insert(companyTable).values(data).returning();
    return inserted;
  } catch (error) {
    console.error("ERROR createCompanyService:", error);
    throw new Error("Gagal membuat data perusahaan.");
  }
};

export const deleteCompanyService = async (id: string) => {
  try {
    await db.delete(companyTable).where(eq(companyTable.id, id));
  } catch (error) {
    console.error("ERROR deleteCompanyService:", error);
    throw new Error("Gagal menghapus data perusahaan.");
  }
};

export const getAllCompaniesService = async () => {
  try {
    return await db.query.companyTable.findMany({
      orderBy: [desc(companyTable.createdAt)],
      with: {
        users: true,
      },
    });
  } catch (error) {
    console.error("ERROR getAllCompaniesService:", error);
    throw new Error("Gagal mengambil daftar perusahaan.");
  }
};
