import "server-only";
import { count, desc, eq, and } from "drizzle-orm";

import db from "@/lib/database";
import { jobTable, TJob } from "@/lib/database/schema";

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
  isActive: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  createdBy?: string;
};

export type TPaginatedJobs = {
  jobs: TJob[];
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
    const [job] = await db.insert(jobTable).values({
      title: data.title,
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
      isActive: data.isActive,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      benefits: data.benefits,
      createdBy: data.createdBy ?? null,
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
}: {
  page?: number;
  limit?: number;
  onlyActive?: boolean;
} = {}): Promise<TPaginatedJobs> => {
  try {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;

    const where = onlyActive ? eq(jobTable.isActive, true) : undefined;

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
