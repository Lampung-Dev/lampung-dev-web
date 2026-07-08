import { Metadata } from "next";
import { CareerClient } from "./_components/career-client";
import { getAllJobsService } from "@/services/job";
import { getAllJobCategoriesService } from "@/services/category";
import { getRelativeTime } from "@/lib/date";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getApplicationsByUserIdService } from "@/services/job-application";

export const metadata: Metadata = {
  title: "Jobs | Lampung Dev",
  description:
    "Temukan lowongan kerja terbaik di bidang teknologi untuk komunitas Lampung Dev.",
};

export default async function JobsPage() {
  const { jobs } = await getAllJobsService({ onlyActive: true, limit: 100 });
  const categories = await getAllJobCategoriesService();
  const session = await auth();

  let appliedJobIds: string[] = [];
  if (session?.user?.email) {
    const user = await getUserByEmailService(session.user.email);
    if (user) {
      const apps = await getApplicationsByUserIdService(user.id);
      appliedJobIds = apps.map((app) => app.jobId);
    }
  }

  const serializedJobs = jobs.map((job) => ({
    id: job.id as unknown as number, // Cast uuid to number for compatibility with Job interface
    slug: job.slug,
    title: job.title,
    salary: job.salary,
    type: job.type as "Penuh Waktu" | "Paruh Waktu" | "Magang" | "Remote",
    experience: job.experience,
    education: job.education,
    company: job.company,
    companySlug: job.companyRelation?.slug || null,
    companyInitial: job.companyInitial,
    location: job.location,
    category: job.category || "",
    postedAt: getRelativeTime(job.createdAt),
    isPremium: job.isPremium,
    isFeatured: job.isFeatured,
    skills: job.skills,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    idString: job.id, // Keep the original uuid string to match against appliedJobIds
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <CareerClient
      initialJobs={serializedJobs}
      categories={serializedCategories}
      appliedJobIds={appliedJobIds}
    />
  );
}
