import "server-only";
import { count, desc, eq, and } from "drizzle-orm";

import db from "@/lib/database";
import { jobTable, TJob, TCompany } from "@/lib/database/schema";

export type TJobWithCompany = TJob & {
  companyRelation?: TCompany | null;
};

export type TNewJob = {
  title: string;
  company: string;
  companyInitial: string;
  location: string;
  category: TJob["category"];
  type: TJob["type"];
  salary: string;
  experience: string;
  education: string;
  skills: string[];
  isPremium: boolean;
  isFeatured: boolean;
  isActive: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  createdBy?: string;
  companyId?: string;
  slug?: string;
};

export type TPaginatedJobs = {
  jobs: TJobWithCompany[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const createJobService = async (data: TNewJob): Promise<TJob> => {
  try {
    const baseSlug = `${data.title}-${data.company}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const rand = Math.random().toString(36).substring(2, 6);
    const slug = data.slug || `${baseSlug}-${rand}`;

    const [job] = await db.insert(jobTable).values({
      title: data.title,
      slug,
      company: data.company,
      companyInitial: data.companyInitial,
      location: data.location,
      category: data.category,
      type: data.type,
      salary: data.salary,
      experience: data.experience,
      education: data.education,
      skills: data.skills,
      isPremium: data.isPremium,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      benefits: data.benefits,
      createdBy: data.createdBy ?? null,
      companyId: data.companyId ?? null,
    }).returning();
    return job;
  } catch (error) {
    console.error("ERROR createJobService:", error);
    throw new Error("Gagal membuat lowongan.");
  }
};

export const getAllJobsService = async ({
  page = 1,
  limit = 20,
  onlyActive = false,
  companyId,
}: {
  page?: number;
  limit?: number;
  onlyActive?: boolean;
  companyId?: string;
} = {}): Promise<TPaginatedJobs> => {
  try {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;

    const conditions = [];
    if (onlyActive) conditions.push(eq(jobTable.isActive, true));
    if (companyId) conditions.push(eq(jobTable.companyId, companyId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalJobs = await db
      .select({ count: count() })
      .from(jobTable)
      .where(where)
      .then((r) => Number(r[0].count));

    const jobs = await db.query.jobTable.findMany({
      where,
      limit: validLimit,
      offset,
      orderBy: [desc(jobTable.createdAt)],
      with: {
        companyRelation: true,
      },
    });

    const totalPages = Math.ceil(totalJobs / validLimit);

    return {
      jobs,
      metadata: {
        currentPage: validPage,
        totalPages,
        totalJobs,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    };
  } catch (error) {
    console.error("ERROR getAllJobsService:", error);
    throw new Error("Gagal mengambil data lowongan.");
  }
};

export const getJobBySlugService = async (slug: string) => {
  try {
    const job = await db.query.jobTable.findFirst({
      where: and(eq(jobTable.slug, slug), eq(jobTable.isActive, true)),
      with: {
        companyRelation: true,
      },
    });
    return job ?? null;
  } catch (error) {
    console.error("ERROR getJobBySlugService:", error);
    throw new Error("Gagal mengambil data lowongan.");
  }
};

export const getJobByIdService = async (id: string): Promise<TJob | null> => {
  try {
    const job = await db.query.jobTable.findFirst({
      where: and(eq(jobTable.id, id), eq(jobTable.isActive, true)),
    });
    return job ?? null;
  } catch (error) {
    console.error("ERROR getJobByIdService:", error);
    throw new Error("Gagal mengambil data lowongan.");
  }
};

export const updateJobService = async (
  id: string,
  data: Partial<TNewJob>
): Promise<TJob> => {
  try {
    const [job] = await db
      .update(jobTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobTable.id, id))
      .returning();
    if (!job) throw new Error("Lowongan tidak ditemukan.");
    return job;
  } catch (error) {
    console.error("ERROR updateJobService:", error);
    throw new Error("Gagal memperbarui lowongan.");
  }
};

export const deleteJobService = async (id: string): Promise<void> => {
  try {
    await db.delete(jobTable).where(eq(jobTable.id, id));
  } catch (error) {
    console.error("ERROR deleteJobService:", error);
    throw new Error("Gagal menghapus lowongan.");
  }
};
