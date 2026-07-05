"use server";

import { auth } from "@/lib/next-auth";
import { createJobService, TNewJob } from "@/services/job";

export async function createJobAction(data: TNewJob) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") throw new Error("Hanya admin yang dapat membuat lowongan");

  const userId = (session.user as { id?: string })?.id;

  return createJobService({ ...data, createdBy: userId });
}
