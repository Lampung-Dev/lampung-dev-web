"use server";

import { auth } from "@/lib/next-auth";
import { deleteJobService } from "@/services/job";
import db from "@/lib/database";
import { jobTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function deleteJobAction(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const role = (session.user as { role?: string })?.role;
  const companyId = (session.user as { companyId?: string })?.companyId;

  if (role !== "ADMIN" && role !== "MITRA") {
    throw new Error("Anda tidak memiliki akses untuk menghapus lowongan");
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
      throw new Error("Anda tidak memiliki akses untuk menghapus lowongan ini");
    }
  }

  return deleteJobService(id);
}
