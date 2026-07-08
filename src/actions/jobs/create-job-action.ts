"use server";

import { auth } from "@/lib/next-auth";
import { createJobService, TNewJob } from "@/services/job";

import { getUserByEmailService } from "@/services/user";

export async function createJobAction(data: TNewJob) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const user = await getUserByEmailService(session.user.email);
  if (!user) throw new Error("Akun Anda tidak ditemukan");

  const role = user.role;
  const companyId = user.companyId;

  if (role !== "ADMIN" && role !== "MITRA") {
    throw new Error("Anda tidak memiliki akses untuk membuat lowongan");
  }

  const userId = user.id;
  const jobPayload = { ...data, createdBy: userId };

  if (role === "MITRA") {
    if (!companyId) {
      throw new Error("Akun mitra Anda belum ditautkan ke perusahaan");
    }
    jobPayload.companyId = companyId;
  }

  return createJobService(jobPayload);
}
