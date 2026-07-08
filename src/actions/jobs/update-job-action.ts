"use server";

import { auth } from "@/lib/next-auth";
import { updateJobService, TNewJob } from "@/services/job";
import db from "@/lib/database";
import { jobTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

import { getUserByEmailService } from "@/services/user";

export async function updateJobAction(id: string, data: Partial<TNewJob>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const user = await getUserByEmailService(session.user.email);
  if (!user) throw new Error("Akun Anda tidak ditemukan");

  const role = user.role;
  const companyId = user.companyId;

  if (role !== "ADMIN" && role !== "MITRA") {
    throw new Error("Anda tidak memiliki akses untuk mengubah lowongan");
  }

  if (!id) throw new Error("Job ID wajib diisi");

  if (role === "MITRA") {
    if (!companyId) {
      throw new Error("Akun mitra Anda belum ditautkan ke perusahaan");
    }

    const [currentJob] = await db
      .select({ companyId: jobTable.companyId })
      .from(jobTable)
      .where(eq(jobTable.id, id));

    if (!currentJob) {
      throw new Error("Lowongan tidak ditemukan");
    }

    if (currentJob.companyId !== companyId) {
      throw new Error("Anda tidak memiliki akses untuk mengubah lowongan ini");
    }

    // MITRA cannot reassign companyId of a job
    delete data.companyId;
  }

  return updateJobService(id, data);
}
