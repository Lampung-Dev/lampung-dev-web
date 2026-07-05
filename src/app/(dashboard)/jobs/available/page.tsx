import { getAllJobsService } from "@/services/job";
import { JobsBrowseClient } from "./_components/jobs-browse-client";

export default async function AvailableJobsPage() {
  const { jobs, metadata } = await getAllJobsService({ onlyActive: true, limit: 50 });

  const serializedJobs = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return <JobsBrowseClient jobs={serializedJobs} totalJobs={metadata.totalJobs} />;
}
