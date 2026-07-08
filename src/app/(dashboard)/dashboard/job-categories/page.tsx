import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllJobCategoriesService } from "@/services/category";
import { JobCategoriesClient } from "./_components/categories-client";

export default async function JobCategoriesAdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await getAllJobCategoriesService();

  return (
    <div className="container mx-auto py-6">
      <JobCategoriesClient initialCategories={categories} />
    </div>
  );
}
