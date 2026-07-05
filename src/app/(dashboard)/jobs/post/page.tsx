import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllJobsService } from "@/services/job";
import { JobsManageClient } from "./_components/jobs-manage-client";

export default async function ManageJobsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { jobs, metadata } = await getAllJobsService({ page: 1, limit: 50 });

  const serializedJobs = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return (
    <JobsManageClient initialJobs={serializedJobs} totalJobs={metadata.totalJobs} />
  );
}
