import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import db from "@/lib/database";
import { jobApplicationTable, jobTable, TJobApplication } from "@/lib/database/schema";

export const createApplicationService = async (
  data: Omit<TJobApplication, "id" | "status" | "createdAt">
): Promise<TJobApplication> => {
  try {
    const [app] = await db.insert(jobApplicationTable).values(data).returning();
    return app;
  } catch (error) {
    console.error("ERROR createApplicationService:", error);
    throw new Error("Gagal mengirim lamaran pekerjaan.");
  }
};

export const getApplicationsForAdminService = async () => {
  try {
    const apps = await db.query.jobApplicationTable.findMany({
      orderBy: [desc(jobApplicationTable.createdAt)],
      with: {
        job: {
          with: {
            companyRelation: true,
          },
        },
        user: true,
      },
    });
    return apps;
  } catch (error) {
    console.error("ERROR getApplicationsForAdminService:", error);
    throw new Error("Gagal mengambil data lamaran.");
  }
};

export const getApplicationsForCompanyService = async (companyId: string) => {
  try {
    const jobs = await db.query.jobTable.findMany({
      where: eq(jobTable.companyId, companyId),
      columns: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);
    if (jobIds.length === 0) return [];

    const apps = await db.query.jobApplicationTable.findMany({
      where: inArray(jobApplicationTable.jobId, jobIds),
      orderBy: [desc(jobApplicationTable.createdAt)],
      with: {
        job: true,
        user: true,
      },
    });
    return apps;
  } catch (error) {
    console.error("ERROR getApplicationsForCompanyService:", error);
    throw new Error("Gagal mengambil data pelamar.");
  }
};

export const updateApplicationStatusService = async (
  id: string,
  status: string
): Promise<TJobApplication> => {
  try {
    const [updated] = await db
      .update(jobApplicationTable)
      .set({ status })
      .where(eq(jobApplicationTable.id, id))
      .returning();
    if (!updated) throw new Error("Lamaran tidak ditemukan.");
    return updated;
  } catch (error) {
    console.error("ERROR updateApplicationStatusService:", error);
    throw new Error("Gagal memperbarui status lamaran.");
  }
};

export const getApplicationsByUserIdService = async (userId: string) => {
  try {
    const apps = await db.query.jobApplicationTable.findMany({
      where: eq(jobApplicationTable.userId, userId),
      orderBy: [desc(jobApplicationTable.createdAt)],
      with: {
        job: true,
      },
    });
    return apps;
  } catch (error) {
    console.error("ERROR getApplicationsByUserIdService:", error);
    throw new Error("Gagal mengambil data lamaran.");
  }
};
