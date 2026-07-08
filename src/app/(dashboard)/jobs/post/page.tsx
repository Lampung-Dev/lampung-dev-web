import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllJobsService } from "@/services/job";
import { getCompanyByIdService } from "@/services/company";
import { getAllJobCategoriesService } from "@/services/category";
import { JobsManageClient } from "./_components/jobs-manage-client";

export default async function ManageJobsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || (user.role !== "ADMIN" && user.role !== "MITRA")) {
    redirect("/dashboard");
  }

  if (user.role === "MITRA" && !user.companyId) {
    redirect("/dashboard");
  }

  let userCompany = null;
  if (user.companyId) {
    const comp = await getCompanyByIdService(user.companyId);
    if (comp) {
      userCompany = {
        id: comp.id,
        name: comp.name,
        initial: comp.name
          ? comp.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 5)
              .toUpperCase()
          : "",
      };
    }
  }

  const queryParams: { page: number; limit: number; companyId?: string } = { page: 1, limit: 50 };
  if (user.role === "MITRA" && user.companyId) {
    queryParams.companyId = user.companyId;
  }

  const { jobs, metadata } = await getAllJobsService(queryParams);
  const categories = await getAllJobCategoriesService();

  const serializedJobs = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <JobsManageClient
      initialJobs={serializedJobs}
      totalJobs={metadata.totalJobs}
      userCompany={userCompany}
      categories={serializedCategories}
    />
  );
}
