import { getAllJobsService } from "@/services/job";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getApplicationsByUserIdService } from "@/services/job-application";
import { JobsBrowseClient } from "./_components/jobs-browse-client";

export default async function AvailableJobsPage() {
  const { jobs, metadata } = await getAllJobsService({ onlyActive: true, limit: 50 });
  const session = await auth();

  let appliedJobIds: string[] = [];
  if (session?.user?.email) {
    const user = await getUserByEmailService(session.user.email);
    if (user) {
      const apps = await getApplicationsByUserIdService(user.id);
      appliedJobIds = apps.map((app) => app.jobId);
    }
  }

  const serializedJobs = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return (
    <JobsBrowseClient
      jobs={serializedJobs}
      totalJobs={metadata.totalJobs}
      appliedJobIds={appliedJobIds}
    />
  );
}
