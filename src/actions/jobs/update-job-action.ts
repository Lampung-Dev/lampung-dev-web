"use server";

import { auth } from "@/lib/next-auth";
import { updateJobService, TNewJob } from "@/services/job";

export async function updateJobAction(id: string, data: Partial<TNewJob>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") throw new Error("Hanya admin yang dapat mengubah lowongan");

  if (!id) throw new Error("Job ID wajib diisi");

  return updateJobService(id, data);
}
