"use server";

import { auth } from "@/lib/next-auth";
import { deleteJobService } from "@/services/job";

export async function deleteJobAction(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Harap login terlebih dahulu");

  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") throw new Error("Hanya admin yang dapat menghapus lowongan");

  if (!id) throw new Error("Job ID wajib diisi");

  return deleteJobService(id);
}
